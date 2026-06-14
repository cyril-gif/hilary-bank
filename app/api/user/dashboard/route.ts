import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Account, Transaction } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user accounts
    const accounts = await Account.find({ userId: auth.userId });
    
    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const availableBalance = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
    const ledgerBalance = accounts.reduce((sum, acc) => sum + acc.ledgerBalance, 0);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [
        { fromAccountId: { $in: accounts.map(a => a._id) } },
        { toAccountId: { $in: accounts.map(a => a._id) } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('fromAccountId toAccountId');

    // Calculate monthly spending and income
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await Transaction.find({
      $or: [
        { fromAccountId: { $in: accounts.map(a => a._id) } },
        { toAccountId: { $in: accounts.map(a => a._id) } }
      ],
      createdAt: { $gte: startOfMonth },
      status: 'COMPLETED'
    });

    const monthlySpending = monthlyTransactions
      .filter(t => t.fromAccountId && accounts.some(a => a._id.equals(t.fromAccountId)))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = monthlyTransactions
      .filter(t => t.toAccountId && accounts.some(a => a._id.equals(t.toAccountId)))
      .reduce((sum, t) => sum + t.amount, 0);

    // Format recent transactions
    const formattedTransactions = recentTransactions.map(t => ({
      id: t._id,
      type: accounts.some(a => a._id.equals(t.fromAccountId)) ? 'sent' : 'received',
      amount: t.amount,
      recipient: t.narration || (t.toAccountId as any)?.accountName,
      date: t.createdAt,
      status: t.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        availableBalance,
        ledgerBalance,
        monthlySpending,
        monthlyIncome,
        recentTransactions: formattedTransactions,
        accounts: accounts.map(acc => ({
          id: acc._id,
          accountNumber: acc.accountNumber,
          accountName: acc.accountName,
          accountType: acc.accountType,
          balance: acc.balance,
          availableBalance: acc.availableBalance,
        })),
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
