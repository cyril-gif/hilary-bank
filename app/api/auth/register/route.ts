import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, Account } from '@/lib/db/models';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, phone, password, firstName, lastName, dateOfBirth } = await req.json();

    // Validate required fields
    if (!email || !phone || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or phone number' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique account number
    const generateAccountNumber = () => {
      return '30' + Math.floor(100000000 + Math.random() * 900000000).toString();
    };

    let accountNumber = generateAccountNumber();
    let accountExists = await Account.findOne({ accountNumber });
    while (accountExists) {
      accountNumber = generateAccountNumber();
      accountExists = await Account.findOne({ accountNumber });
    }

    // Create user
    const user = await User.create({
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      isVerified: false,
      isActive: true,
    });

    // Create account
    const account = await Account.create({
      userId: user._id,
      accountNumber,
      accountName: `${firstName} ${lastName}`,
      accountType: 'CHECKING',
      currency: 'GHS',
      balance: 0,
      ledgerBalance: 0,
      availableBalance: 0,
      status: 'ACTIVE',
    });

    // Create notification preferences
    const NotificationPrefs = mongoose.models.NotificationPrefs;
    if (NotificationPrefs) {
      await NotificationPrefs.create({
        userId: user._id,
      });
    }

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      accounts: [{
        id: account._id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance,
      }],
    };

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
