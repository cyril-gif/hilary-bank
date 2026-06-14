'use client';

import { useState } from 'react';
import { usePaystack } from '@makozi/paystack-react-pay';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  onSuccess: (reference: string, amount: number) => void;
  onClose?: () => void;
  buttonText?: string;
}

export const PaystackPayment = ({ 
  email, 
  amount, 
  onSuccess, 
  onClose, 
  buttonText = "Pay with Paystack" 
}: PaystackPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Amount in kobo/GHS pesewas (multiply by 100)
  const amountInPesewas = Math.round(amount * 100);

  const config = {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: email,
    amount: amountInPesewas,
    currency: 'GHS',
    reference: `HIL_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : 'Customer'
        },
        {
          display_name: "Transaction Type",
          variable_name: "transaction_type",
          value: "wallet_deposit"
        }
      ]
    },
    onSuccess: (response: any) => {
      console.log('Payment successful:', response);
      setIsProcessing(false);
      onSuccess(response.reference, amount);
    },
    onClose: () => {
      console.log('Payment modal closed');
      setIsProcessing(false);
      if (onClose) onClose();
    }
  };

  const { initializePayment } = usePaystack(config);

  const handlePayment = () => {
    setIsProcessing(true);
    initializePayment();
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
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedChannel === channel.id
                ? 'bg-primary-50 dark:bg-primary-950/20 border-2 border-primary-500'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <channel.icon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
            <p className="font-semibold text-sm">{channel.name}</p>
            <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
          </button>
        ))}
      </div>

      {/* Paystack Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isProcessing}
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
