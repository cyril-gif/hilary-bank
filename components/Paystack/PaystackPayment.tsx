'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  onSuccess: (reference: string, amount: number) => void;
  onClose?: () => void;
  buttonText?: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const PaystackPayment = ({
  email,
  amount,
  onSuccess,
  onClose,
  buttonText = "Pay with Paystack"
}: PaystackPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack script dynamically
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePayment = () => {
    if (!scriptLoaded) {
      alert('Payment system loading. Please try again.');
      return;
    }

    setIsProcessing(true);
    
    const amountInPesewas = Math.round(amount * 100);
    const reference = `HIL_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountInPesewas,
      currency: 'GHS',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : 'Customer'
          }
        ]
      },
      callback: (response: any) => {
        setIsProcessing(false);
        onSuccess(response.reference, amount);
      },
      onClose: () => {
        setIsProcessing(false);
        if (onClose) onClose();
      }
    });

    handler.openIframe();
  };

  const paymentChannels = [
    { id: 'card', name: 'Card Payment', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'mobile_money', name: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, description: 'Transfer from any bank' },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Channels Info */}
      <div className="grid grid-cols-3 gap-3">
        {paymentChannels.map((channel) => (
          <div
            key={channel.id}
            className="p-4 rounded-xl text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <channel.icon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
            <p className="font-semibold text-sm">{channel.name}</p>
            <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
          </div>
        ))}
      </div>

      {/* Paystack Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isProcessing || !scriptLoaded}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            {buttonText} (₵{amount.toFixed(2)})
          </>
        )}
      </motion.button>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500">
        <p>Secure payment powered by Paystack</p>
        <p className="mt-1">Your card details are encrypted and secure</p>
      </div>
    </div>
  );
};
