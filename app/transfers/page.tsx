'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Building2, Smartphone, Search, Star, Shield, Bell, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TransfersPage() {
  const router = useRouter();
  const [transferType, setTransferType] = useState('internal');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [narration, setNarration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState('');

  // Get user's phone number from registration
  const getUserPhone = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.phone || '024XXXXXXX';
    }
    return '024XXXXXXX';
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      setError('Please enter a valid amount');
      setIsProcessing(false);
      return;
    }

    // Validate mobile number for mobile money transfers
    if (transferType === 'mobile') {
      if (!mobileNumber || mobileNumber.length < 10) {
        setError('Please enter a valid mobile money number');
        setIsProcessing(false);
        return;
      }
    }

    // Get current balance
    const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
    if (transferAmount > currentBalance) {
      setError('Insufficient funds');
      setIsProcessing(false);
      return;
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate fee
    const fee = transferType === 'interbank' ? 25 : transferType === 'mobile' ? 5 : 0;
    const totalAmount = transferAmount + fee;

    // Update balance
    const newBalance = currentBalance - totalAmount;
    localStorage.setItem('userBalance', newBalance.toString());

    // Generate transaction reference
    const ref = `HIL${Date.now()}${Math.floor(Math.random() * 10000)}`;
    setTransactionRef(ref);

    // Add transaction record
    let recipientName = '';
    if (transferType === 'mobile') {
      recipientName = `Mobile Money - ${mobileNumber}`;
    } else if (transferType === 'internal') {
      recipientName = `Internal Transfer to ${accountNumber}`;
    } else {
      recipientName = `Interbank Transfer to ${accountNumber}`;
    }

    const newTransaction = {
      id: Date.now(),
      type: 'sent',
      amount: transferAmount,
      fee: fee,
      total: totalAmount,
      recipient: recipientName,
      date: new Date(),
      status: 'completed',
      reference: ref,
      transferType: transferType,
    };
    
    const existingTransactions = localStorage.getItem('userTransactions');
    const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
    transactions.unshift(newTransaction);
    localStorage.setItem('userTransactions', JSON.stringify(transactions));

    // Show success message
    setShowSuccess(true);

    // Store that an alert was sent
    const alertMessage = {
      id: Date.now(),
      title: 'Transfer Successful',
      message: `₵${transferAmount.toFixed(2)} sent to ${transferType === 'mobile' ? mobileNumber : accountNumber}`,
      reference: ref,
      date: new Date(),
      read: false,
    };
    
    const existingAlerts = localStorage.getItem('userAlerts');
    const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];
    alerts.unshift(alertMessage);
    localStorage.setItem('userAlerts', JSON.stringify(alerts));

    // Simulate SMS/Notification (in real app, this would be an API call)
    simulateMobileAlert(transferAmount, mobileNumber, ref);

    // Reset form after 3 seconds and redirect
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/dashboard');
    }, 3000);
  };

  // Simulate mobile money alert (in production, this would be actual API integration)
  const simulateMobileAlert = (amount: number, phone: string, reference: string) => {
    console.log(`========================================`);
    console.log(`📱 MOBILE MONEY ALERT SIMULATION`);
    console.log(`========================================`);
    console.log(`To: ${phone}`);
    console.log(`From: Hilary's Bank`);
    console.log(`Amount: ₵${amount.toFixed(2)}`);
    console.log(`Reference: ${reference}`);
    console.log(`Message: Your transfer of ₵${amount.toFixed(2)} has been completed successfully.`);
    console.log(`New balance: ₵${localStorage.getItem('userBalance')}`);
    console.log(`========================================`);
    
    // In a real app, you would call an API like:
    // await fetch('/api/momo/send', { method: 'POST', body: JSON.stringify({ phone, amount, reference }) })
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md w-full shadow-xl"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {transferType === 'mobile' 
              ? `₵${parseFloat(amount).toFixed(2)} sent to ${mobileNumber}`
              : `₵${parseFloat(amount).toFixed(2)} sent successfully`}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500">Transaction Reference</p>
            <p className="font-mono text-sm">{transactionRef}</p>
          </div>
          <p className="text-sm text-gray-500">
            A confirmation alert has been sent to your registered phone number.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
            <Bell className="h-4 w-4" />
            <span>Alert sent to {getUserPhone()}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Send Money</h1>
        </div>

        {/* Transfer Type Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { id: 'internal', label: 'Internal Transfer', icon: Users, description: 'Hilary\'s Bank accounts' },
            { id: 'interbank', label: 'Other Banks', icon: Building2, description: 'GCB, Stanbic, etc.' },
            { id: 'mobile', label: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTransferType(type.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                transferType === type.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md'
              }`}
            >
              <type.icon className="h-6 w-6 mb-2" />
              <p className="font-semibold text-sm">{type.label}</p>
              <p className="text-xs opacity-80">{type.description}</p>
            </button>
          ))}
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleTransfer} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          {transferType === 'mobile' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Mobile Money Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">+233</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                  placeholder="24XXXXXXX"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the mobile money number (e.g., 24XXXXXXX)</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                placeholder="Enter account number"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Amount (GHS)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
              required
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4"
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Transfer Amount</span>
                <span>₵{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Fee</span>
                <span>₵{transferType === 'interbank' ? '25.00' : transferType === 'mobile' ? '5.00' : '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₵{(parseFloat(amount) + (transferType === 'interbank' ? 25 : transferType === 'mobile' ? 5 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Narration (Optional)</label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
              placeholder="Add a reference"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              'Send Money'
            )}
          </motion.button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold">Secure Transfer</p>
              <p>Your transaction is protected by bank-grade encryption.</p>
              {transferType === 'mobile' && (
                <p className="text-xs mt-2">✓ Instant delivery to mobile money wallet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
