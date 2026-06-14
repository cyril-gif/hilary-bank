import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const storedOtp = otpStore.get(email);
    
    if (!storedOtp || storedOtp.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    if (storedOtp.expiresAt < Date.now()) {
      otpStore.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify user
    await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    otpStore.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully',
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send OTP (implement with email/SMS service)
export async function sendOTP(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStore.set(email, { otp, expiresAt });
  
  // TODO: Implement email sending
  console.log(`OTP for ${email}: ${otp}`);
  
  return otp;
}

