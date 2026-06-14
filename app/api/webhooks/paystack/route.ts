import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Transaction, Account } from '@/lib/db/models';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const event = body.event;
    const transferData = body.data;

    // Handle transfer success events
    if (event === 'transfer.success') {
      const transaction = await Transaction.findOne({
        externalReference: transferData.reference,
      });

      if (transaction && transferData.status === 'success') {
        transaction.status = 'COMPLETED';
        transaction.completedAt = new Date();
        await transaction.save();

        // Optional: log or send SMS
        if (transaction.recipientDetails?.mobileNumber) {
          console.log(`SMS to ${transaction.recipientDetails.mobileNumber}: ₵${transaction.amount} received. Ref: ${transaction.transactionRef}`);
        }
      }
    }

    // Handle transfer failures
    if (event === 'transfer.failed') {
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
