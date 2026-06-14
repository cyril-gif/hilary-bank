'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Wallet, Zap, Lock, ArrowRight, TrendingUp, Users, Globe } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 p-5 shadow-xl"
          >
            <Shield className="h-full w-full text-white" />
          </motion.div>
          
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent md:text-6xl">
            Hilary's Bank
          </h1>
          <p className="mb-6 text-xl text-gray-600 dark:text-gray-300">
            Modern Digital Banking for Ghana
          </p>
          <p className="mb-8 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Secure, fast, and innovative banking experience. Send money, pay bills, 
            and manage your finances all in one place.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="inline-block rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="inline-block rounded-xl border-2 border-primary-600 px-8 py-4 font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all"
              >
                Open Account
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { 
              icon: Wallet, 
              title: "Smart Banking", 
              desc: "Intelligent insights and automated savings to grow your wealth",
              color: "primary"
            },
            { 
              icon: Zap, 
              title: "Instant Transfers", 
              desc: "Send money in seconds to any bank or mobile money in Ghana",
              color: "yellow"
            },
            { 
              icon: Lock, 
              title: "Bank-Grade Security", 
              desc: "Your money is protected with AES-256 encryption",
              color: "green"
            },
            { 
              icon: TrendingUp, 
              title: "Smart Investments", 
              desc: "Grow your wealth with our investment options",
              color: "purple"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl bg-white/80 p-6 text-center backdrop-blur-sm shadow-lg dark:bg-gray-800/80 hover:shadow-xl transition-all"
            >
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}>
                <feature.icon className={`h-7 w-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white"
        >
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-sm opacity-90">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Globe className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">₵100M+</div>
              <div className="text-sm opacity-90">Transactions Processed</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Shield className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Customer Support</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to start banking?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of Ghanaians who trust Hilary's Bank for their financial needs
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 font-semibold text-white hover:bg-primary-700 transition-all"
          >
            Open an Account Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
