'use client';

import { useState } from 'react';
import { ArrowLeft, CreditCard, Eye, EyeOff, Plus, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CardsPage() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const cards = [
    {
      id: 1,
      type: 'Debit Card',
      scheme: 'Visa',
      number: '4532 **** **** 1234',
      expiry: '12/28',
      holder: 'Kwame Asare',
      isVirtual: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">My Cards</h1>
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Plus size={16} />
            Request Card
          </button>
        </div>

        {/* Cards List */}
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className={`bg-gradient-to-r ${isFrozen ? 'from-gray-600 to-gray-800' : 'from-primary-600 to-primary-800'} rounded-2xl p-6 text-white shadow-xl`}>
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="h-8 w-8 opacity-80" />
                <button
                  onClick={() => setIsFrozen(!isFrozen)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isFrozen ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                >
                  {isFrozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-lg tracking-wider">
                    {showCardNumber ? card.number : '**** **** **** 1234'}
                  </p>
                  <button onClick={() => setShowCardNumber(!showCardNumber)}>
                    {showCardNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valid Thru: {card.expiry}</span>
                  <span className="uppercase">{card.scheme}</span>
                </div>
              </div>
              
              <div className="text-sm opacity-80">{card.holder}</div>
            </div>

            {/* Card Actions */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm hover:shadow-md transition">
                <Lock className="h-5 w-5 mx-auto mb-1 text-primary-600" />
                <p className="text-xs">Change PIN</p>
              </button>
              <button className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm hover:shadow-md transition">
                <CreditCard className="h-5 w-5 mx-auto mb-1 text-primary-600" />
                <p className="text-xs">Set Limits</p>
              </button>
              <button className="bg-white dark:bg-gray-800 p-3 rounded-xl text-center shadow-sm hover:shadow-md transition">
                <Lock className="h-5 w-5 mx-auto mb-1 text-primary-600" />
                <p className="text-xs">Report Lost</p>
              </button>
            </div>
          </motion.div>
        ))}

        {/* Virtual Cards Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Virtual Cards</h2>
          <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-primary-500 transition">
            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Create a virtual card for online payments</p>
          </button>
        </div>
      </div>
    </div>
  );
}
