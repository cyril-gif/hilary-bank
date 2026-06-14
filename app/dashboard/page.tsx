'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {NotificationBell} from '@/components/ui/NotificationBell';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  QrCode, 
  Plus, 
  Eye, 
  EyeOff,
  CreditCard,
  Wallet,
  Bell,
  Menu,
  Home,
  TrendingUp,
  TrendingDown,
  User,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Get user data from localStorage (from registration)
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      
      // For demo, set a starting balance
      // In production, this would come from your API
      const savedBalance = localStorage.getItem('userBalance');
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      } else {
        // New users start with 0, but show demo balance for testing
        setBalance(24850);
      }
    }
    
    // Get transactions from localStorage
    const savedTransactions = localStorage.getItem('userTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Demo transactions for new users
      const demoTransactions = [
        {
          id: 1,
          type: 'received',
          amount: 1500.00,
          recipient: 'Salary Deposit',
          date: new Date(),
          status: 'completed',
        },
        {
          id: 2,
          type: 'sent',
          amount: 250.00,
          recipient: 'John Mensah',
          date: new Date(Date.now() - 86400000),
          status: 'completed',
        },
        {
          id: 3,
          type: 'sent',
          amount: 75.00,
          recipient: 'ECG Bill Payment',
          date: new Date(Date.now() - 172800000),
          status: 'completed',
        },
      ];
      setTransactions(demoTransactions);
      localStorage.setItem('userTransactions', JSON.stringify(demoTransactions));
    }
    
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  const quickActions = [
    { icon: Send, label: 'Transfer', color: 'primary', href: '/transfers', bg: 'bg-primary-100', text: 'text-primary-600' },
    { icon: QrCode, label: 'Scan & Pay', color: 'secondary', href: '/payments/qr', bg: 'bg-green-100', text: 'text-green-600' },
    { icon: Plus, label: 'Add Money', color: 'accent', href: '/deposit', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { icon: CreditCard, label: 'Cards', color: 'info', href: '/cards', bg: 'bg-purple-100', text: 'text-purple-600' },
  ];

  const navItems = [
    { icon: Home, label: 'Home', active: true, path: '/dashboard' },
    { icon: Send, label: 'Transfer', active: false, path: '/transfers' },
    { icon: CreditCard, label: 'Cards', active: false, path: '/cards' },
    { icon: User, label: 'Profile', active: false, path: '/profile' },
  ];

  // Calculate monthly stats
  const monthlyIncome = transactions
    .filter(t => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlySpending = transactions
    .filter(t => t.type === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Hilary's Bank
            </h1>
          </div>
          <div className="flex items-center gap-2">
              <NotificationBell />
            <button 
              onClick={handleLogout}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl space-y-6 p-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">Welcome back,</p>
              <h2 className="text-2xl font-bold">{userData?.name || 'Customer'}</h2>
              <p className="text-xs opacity-75 mt-1">{userData?.email || ''}</p>
              <div className="mt-4">
                <p className="text-xs opacity-75">Total Balance</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                    {showBalance ? `₵${balance.toLocaleString()}` : '••••••'}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="rounded-full p-1 hover:bg-white/20"
                  >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="rounded-full bg-white/10 p-3"
            >
              <Wallet className="h-8 w-8" />
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link href={action.href} key={index}>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 w-full"
              >
                <div className={`rounded-lg ${action.bg} p-2 dark:bg-opacity-20`}>
                  <action.icon className={`h-5 w-5 ${action.text}`} />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</span>
            </div>
            <p className="mt-2 text-xl font-bold text-green-600">₵{monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Spending</span>
            </div>
            <p className="mt-2 text-xl font-bold text-red-600">₵{monthlySpending.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      transaction.type === 'sent' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/20'
                    }`}>
                      {transaction.type === 'sent' ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <ArrowDownLeft size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.recipient}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'sent' ? '-' : '+'} ₵{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs capitalize text-gray-500">{transaction.status}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-around py-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors ${
                  item.active
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <item.icon size={24} />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
