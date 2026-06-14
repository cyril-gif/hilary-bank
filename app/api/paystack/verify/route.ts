import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { reference, amount } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: 'Verification failed', details: data.message },
        { status: 400 }
      );
    }

    const transaction = data.data;

    // Verify amount matches (prevent tampering)
    const expectedAmount = amount * 100; // Convert to pesewas
    if (transaction.amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Check if transaction was successful
    if (transaction.status !== 'success') {
      return NextResponse.json(
        { error: `Transaction status: ${transaction.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        customer: transaction.customer,
      },
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}