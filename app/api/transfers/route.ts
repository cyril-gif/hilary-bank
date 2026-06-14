import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Account, Transaction, TransferRecipient, AuditLog } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/middleware';

// Define safety limits for live mode
const SAFETY_LIMITS = {
  MAX_TRANSFER_AMOUNT: 1000,      // Max ₵1000 per transfer initially
  MIN_TRANSFER_AMOUNT: 1,         // Min ₵1
  DAILY_LIMIT: 5000,              // Max ₵5000 per day per user
};

// Fee calculation helper
function calculateFee(amount: number, transferType: string): number {
  if (transferType === 'INTERBANK') return 25;
  if (transferType === 'MOBILE_MONEY') {
    const percentage = parseFloat(process.env.MOMO_TRANSFER_FEE_PERCENTAGE || '1.5');
    const flatFee = parseFloat(process.env.MOMO_TRANSFER_FEE_FLAT || '0.50');
    return (amount * percentage / 100) + flatFee;
  }
  return 0; // Internal transfers are free
}

// Helper to call Paystack transfer API
async function initiatePaystackTransfer(amount: number, recipientCode: string, narration: string, reference: string) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    throw new Error('Paystack secret key not configured');
  }

  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(amount * 100), // Convert to pesewas
      recipient: recipientCode,
      reason: narration || 'Wallet transfer',
      reference,
      currency: 'GHS',
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Paystack transfer initiation failed');
  }
  return data;
}

// POST: Create a new transfer
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Authenticate user
    const auth = await verifyAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const {
      fromAccountId,
      toAccountNumber,
      amount,
      narration,
      transferType,       // "INTERNAL", "INTERBANK", "MOBILE_MONEY"
      mobileNumber,
      mobileProvider,
      saveBeneficiary,
      confirmed,          // For large amount confirmation
    } = body;

    // 3. Basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!fromAccountId) {
      return NextResponse.json({ error: 'Source account required' }, { status: 400 });
    }
    if (transferType === 'MOBILE_MONEY' && (!mobileNumber || !mobileProvider)) {
      return NextResponse.json({ error: 'Mobile number and provider required' }, { status: 400 });
    }
    if ((transferType === 'INTERNAL' || transferType === 'INTERBANK') && !toAccountNumber) {
      return NextResponse.json({ error: 'Destination account number required' }, { status: 400 });
    }

    // 4. Safety limits
    if (amount > SAFETY_LIMITS.MAX_TRANSFER_AMOUNT) {
      return NextResponse.json({
        error: `Amount exceeds maximum of ₵${SAFETY_LIMITS.MAX_TRANSFER_AMOUNT} per transfer`,
      }, { status: 400 });
    }
    if (amount < SAFETY_LIMITS.MIN_TRANSFER_AMOUNT) {
      return NextResponse.json({
        error: `Minimum transfer amount is ₵${SAFETY_LIMITS.MIN_TRANSFER_AMOUNT}`,
      }, { status: 400 });
    }

    // 5. For large amounts, require explicit confirmation
    const isLiveMode = process.env.PAYSTACK_LIVE_MODE === 'true';
    if (isLiveMode && amount > 500 && !confirmed) {
      return NextResponse.json({
        warning: `⚠️ You are about to send ₵${amount} in LIVE MODE. This is real money.`,
        requiresConfirmation: true,
      }, { status: 422 });
    }

    // 6. Get sender's account and verify balance
    const fromAccount = await Account.findOne({ _id: fromAccountId, userId: auth.userId });
    if (!fromAccount) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 404 });
    }

    const fee = calculateFee(amount, transferType);
    const totalAmount = amount + fee;

    if (fromAccount.availableBalance < totalAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 7. Handle different transfer types
    let recipientCode: string | null = null;
    let externalReference: string | null = null;
    let toAccountId = null;
    let recipientDetails: any = null;

    // Generate unique transaction reference
    const transactionRef = `HIL${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Case: Internal transfer (same Hilary's Bank)
    if (transferType === 'INTERNAL') {
      const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
      if (!toAccount) {
        return NextResponse.json({ error: 'Recipient account not found' }, { status: 404 });
      }
      toAccountId = toAccount._id;
      recipientDetails = { accountNumber: toAccount.accountNumber, accountName: toAccount.accountName };

      // Deduct from sender
      fromAccount.availableBalance -= totalAmount;
      fromAccount.balance -= totalAmount;
      await fromAccount.save();

      // Add to recipient
      toAccount.availableBalance += amount;
      toAccount.balance += amount;
      await toAccount.save();
    }

    // Case: Mobile money transfer (via Paystack)
    else if (transferType === 'MOBILE_MONEY') {
      // Find or create transfer recipient in our DB
      let recipient = await TransferRecipient.findOne({
        userId: auth.userId,
        type: 'mobile_money',
        accountNumber: mobileNumber,
        provider: mobileProvider,
      });

      if (!recipient) {
        // Create recipient with Paystack
        const paystackRecipient = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'mobile_money',
            name: `${fromAccount.accountName} - Mobile Money`,
            account_number: mobileNumber,
            bank_code: mobileProvider, // e.g., "MTN", "VOD", "ATL"
            currency: 'GHS',
          }),
        });
        const recipientData = await paystackRecipient.json();

        if (!recipientData.status) {
          return NextResponse.json({
            error: `Failed to create mobile money recipient: ${recipientData.message}`,
          }, { status: 400 });
        }

        recipientCode = recipientData.data.recipient_code;

        // Save in DB for future
        recipient = await TransferRecipient.create({
          userId: auth.userId,
          recipientCode,
          type: 'mobile_money',
          provider: mobileProvider,
          accountNumber: mobileNumber,
          accountName: fromAccount.accountName,
        });
      } else {
        recipientCode = recipient.recipientCode;
      }

      // Initiate transfer via Paystack API
      const paystackTransfer = await initiatePaystackTransfer(
        amount,
        recipientCode,
        narration || `Transfer to ${mobileNumber}`,
        transactionRef
      );

      externalReference = paystackTransfer.data.reference;
      recipientDetails = { mobileNumber, provider: mobileProvider };

      // Deduct from sender (we deduct now, but finalize on webhook confirmation)
      fromAccount.availableBalance -= totalAmount;
      fromAccount.balance -= totalAmount;
      await fromAccount.save();
    }

    // Case: Interbank transfer (simplified - would need bank resolution)
    else if (transferType === 'INTERBANK') {
      // For interbank, you would normally resolve bank code and account name
      // Here we just simulate a deduction; actual interbank requires additional APIs
      const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
      if (!toAccount) {
        // For demo, treat as external
        recipientDetails = { accountNumber: toAccountNumber, bankName: 'External Bank' };
      } else {
        toAccountId = toAccount._id;
        recipientDetails = { accountNumber: toAccount.accountNumber, accountName: toAccount.accountName };
      }

      fromAccount.availableBalance -= totalAmount;
      fromAccount.balance -= totalAmount;
      await fromAccount.save();
    }

    // 8. Create transaction record
    const transaction = await Transaction.create({
      transactionRef,
      fromAccountId: fromAccount._id,
      toAccountId,
      amount,
      fee,
      totalAmount,
      narration,
      transactionType: transferType,
      status: 'COMPLETED', // For internal it's completed; for mobile money, we could set PENDING
      completedAt: new Date(),
      externalReference,
      recipientDetails,
    });

    // 9. Audit log
    await AuditLog.create({
      userId: auth.userId,
      action: 'TRANSFER',
      details: {
        transactionRef,
        amount,
        fee,
        totalAmount,
        transferType,
        externalReference,
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // 10. If saving beneficiary
    if (saveBeneficiary && transferType !== 'MOBILE_MONEY') {
      // Create beneficiary record (you need Beneficiary model)
      // This is optional; I'll assume you have a Beneficiary model
      // await Beneficiary.create({ ... });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer processed successfully',
      data: {
        transactionRef,
        amount,
        fee,
        totalAmount,
        newBalance: fromAccount.availableBalance,
        externalReference,
      },
    });
  } catch (error: any) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Retrieve transfer history for authenticated user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's accounts
    const accounts = await Account.find({ userId: auth.userId });
    const accountIds = accounts.map(acc => acc._id);

    // Fetch transactions involving these accounts
    const transactions = await Transaction.find({
      $or: [
        { fromAccountId: { $in: accountIds } },
        { toAccountId: { $in: accountIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('fromAccountId toAccountId');

    // Format response
    const formatted = transactions.map(t => ({
      id: t._id,
      reference: t.transactionRef,
      amount: t.amount,
      fee: t.fee,
      total: t.totalAmount,
      type: accountIds.some(id => id.equals(t.fromAccountId)) ? 'sent' : 'received',
      counterparty: t.transactionType === 'MOBILE_MONEY'
        ? t.recipientDetails?.mobileNumber
        : t.toAccountId?.accountNumber || t.recipientDetails?.accountNumber,
      narration: t.narration,
      status: t.status,
      date: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Fetch transfers error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
