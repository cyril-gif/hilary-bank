'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Shield, Bell, Lock, ChevronRight, Copy, Check, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Get account number
    let accNumber = localStorage.getItem('accountNumber');
    if (!accNumber) {
      // Generate account number if not exists
      accNumber = '30' + Math.floor(100000000 + Math.random() * 900000000).toString();
      localStorage.setItem('accountNumber', accNumber);
    }
    setAccountNumber(accNumber);
  }, []);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', href: '/profile/info' },
    { icon: Shield, label: 'Security Settings', href: '/profile/security' },
    { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
    { icon: Lock, label: 'Privacy & Data', href: '/profile/privacy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
            <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>
          
          {/* Account Number Card */}
          <div className="mt-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-600" />
                <span className="text-xs text-primary-600 font-semibold">ACCOUNT NUMBER</span>
              </div>
              <button
                onClick={copyAccountNumber}
                className="p-1 rounded hover:bg-primary-200 dark:hover:bg-primary-800"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-2xl font-mono font-bold tracking-wider">{accountNumber}</p>
            <p className="text-xs text-gray-500 mt-2">Share this number to receive money</p>
          </div>
          
          <button className="mt-4 w-full bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
            Edit Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <item.icon className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* KYC Status */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800 dark:text-yellow-400">Verify Your Identity</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">Complete KYC to increase your transaction limits</p>
            </div>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">Verify Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
