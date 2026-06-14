'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, AlertCircle, Banknote, QrCode, Wallet } from 'lucide-react';
import Link from 'next/link';
import { PaystackPayment } from '@/components/Paystack/PaystackPayment';

export default function DepositPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserEmail(user.email || 'customer@example.com');
      setUserName(user.name || 'Customer');
    }
  }, []);

  const getAccountNumber = () => {
    let accountNumber = localStorage.getItem('accountNumber');
    if (!accountNumber) {
      accountNumber = '30' + Math.floor(100000000 + Math.random() * 900000000).toString();
      localStorage.setItem('accountNumber', accountNumber);
    }
    return accountNumber;
  };

  const accountNumber = getAccountNumber();
  const bankName = "Hilary's Bank";
  const bankCode = "HLB001";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  const getDepositAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handlePaymentSuccess = async (reference: string, amount: number) => {
    setIsVerifying(true);
    
    try {
      // Verify payment with your backend
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amount }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local balance
        const currentBalance = localStorage.getItem('userBalance');
        const newBalance = (parseFloat(currentBalance || '0') + amount).toString();
        localStorage.setItem('userBalance', newBalance);
        
        // Add transaction record
        const newTransaction = {
          id: Date.now(),
          type: 'received',
          amount: amount,
          recipient: 'Wallet Deposit via Paystack',
          date: new Date(),
          status: 'completed',
          reference: reference,
        };
        
        const existingTransactions = localStorage.getItem('userTransactions');
        const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
        transactions.unshift(newTransaction);
        localStorage.setItem('userTransactions', JSON.stringify(transactions));
        
        alert(`Successfully deposited ₵${amount.toFixed(2)}!`);
        router.push('/dashboard');
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('An error occurred while verifying your payment.');
    } finally {
      setIsVerifying(false);
      setShowPaystack(false);
    }
  };

  const handleProceedToPayment = () => {
    const amount = getDepositAmount();
    if (amount > 0) {
      setShowPaystack(true);
    } else {
      alert('Please select or enter an amount');
    }
  };

  if (showPaystack) {
    const amount = getDepositAmount();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-4xl p-4">
          <button
            onClick={() => setShowPaystack(false)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="text-center mb-6">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-primary-600" />
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-gray-500 mt-2">Amount: ₵{amount.toFixed(2)}</p>
            </div>
            
            {isVerifying ? (
              <div className="text-center py-8">
                <div className="loader mx-auto"></div>
                <p className="mt-4 text-gray-600">Verifying your payment...</p>
              </div>
            ) : (
              <PaystackPayment
                email={userEmail}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPaystack(false)}
                buttonText={`Pay ₵${amount.toFixed(2)}`}
              />
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add Money</h1>
        </div>

        {/* Account Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Your Account Details</h2>
          <p className="text-sm text-gray-500 mb-2">Share these details to receive money via bank transfer</p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <label className="text-xs text-gray-500 uppercase">Account Number</label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-2xl font-mono font-bold">{accountNumber}</p>
                <button
                  onClick={() => copyToClipboard(accountNumber)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <label className="text-xs text-gray-500 uppercase">Bank Name</label>
              <p className="text-lg font-semibold mt-1">{bankName}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <label className="text-xs text-gray-500 uppercase">Account Name</label>
              <p className="text-lg font-semibold mt-1">{userName}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Use these details to transfer money from other banks to your Hilary's Bank account.
                Funds will be available within 5-10 minutes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Deposit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Deposit via Card / Mobile Money</h2>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-lg font-semibold transition ${
                  selectedAmount === amount
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                ₵{amount}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Or enter custom amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₵</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceedToPayment}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Banknote className="h-5 w-5" />
            Continue to Payment
          </motion.button>
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center"
        >
          <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold mb-2">Scan to Pay</h3>
          <p className="text-sm text-gray-500 mb-4">Coming soon - Pay with QR code</p>
        </motion.div>

        {/* Paystack Info */}
        <div className="mt-6 text-center">
          <img 
            src="https://paystack.com/assets/img/paystack-logo.svg" 
            alt="Paystack" 
            className="h-6 mx-auto opacity-50"
          />
          <p className="text-xs text-gray-400 mt-2">
            Secure payments powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );
}
