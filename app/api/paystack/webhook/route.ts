import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get the signature from headers
    const signature = req.headers.get('x-paystack-signature');
    
    // Get the raw request body
    const rawBody = await req.text();
    
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex');
    
    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const event = JSON.parse(rawBody);
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        const transaction = event.data;
        console.log('Payment successful:', transaction.reference);
        
        // Update user's balance in your database
        // This is where you would credit the user's account
        
        break;
        
      case 'transfer.success':
        console.log('Transfer successful:', event.data.reference);
        break;
        
      case 'transfer.failed':
        console.log('Transfer failed:', event.data.reference);
        break;
        
      default:
        console.log('Unhandled event type:', event.event);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
