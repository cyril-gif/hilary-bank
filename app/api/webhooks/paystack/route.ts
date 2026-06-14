import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackNextjsRequest } from 'paystack-sdk-node/nextjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Transaction, User } from '@/lib/db/models';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature for security
    const { valid, event } = await verifyPaystackNextjsRequest(req, {
      secretKey: process.env.PAYSTACK_SECRET_KEY!,
    });

    if (!valid) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    await connectToDatabase();

    // Handle transfer success events
    if (event === 'transfer.success') {
      const body = await req.json();
      const transferData = body.data;

      // Find the transaction in your database
      const transaction = await Transaction.findOne({
        externalReference: transferData.reference,
      });

      if (transaction && transferData.status === 'success') {
        // Update transaction status
        transaction.status = 'COMPLETED';
        transaction.completedAt = new Date();
        await transaction.save();

        // Send SMS notification to recipient
        if (transaction.recipientDetails?.mobileNumber) {
          await sendSMSNotification(
            transaction.recipientDetails.mobileNumber,
            transaction.amount,
            transaction.transactionRef
          );
        }
      }
    }

    // Handle transfer failures
    if (event === 'transfer.failed') {
      const body = await req.json();
      const transferData = body.data;

      const transaction = await Transaction.findOne({
        externalReference: transferData.reference,
      });

      if (transaction) {
        transaction.status = 'FAILED';
        await transaction.save();

        // Reverse the funds
        const fromAccount = await Account.findById(transaction.fromAccountId);
        if (fromAccount) {
          fromAccount.availableBalance += transaction.totalAmount;
          fromAccount.balance += transaction.totalAmount;
          await fromAccount.save();
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Function to send SMS (implement with your SMS provider)
async function sendSMSNotification(phoneNumber: string, amount: number, reference: string) {
  // Use Africa's Talking, Twilio, or any SMS provider
  console.log(`SMS to ${phoneNumber}: ₵${amount} received. Ref: ${reference}`);
}
