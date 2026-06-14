// Safety limits for live mode
export const SAFETY_LIMITS = {
  MAX_TRANSFER_AMOUNT: 1000, // Max ₵1000 per transfer initially
  MIN_TRANSFER_AMOUNT: 1,    // Min ₵1
  DAILY_LIMIT: 5000,         // Max ₵5000 per day per user
};

export function validateTransferSafety(amount: number, transferType: string): { valid: boolean; error?: string } {
  // Prevent transfers over limit
  if (amount > SAFETY_LIMITS.MAX_TRANSFER_AMOUNT) {
    return { 
      valid: false, 
      error: `Amount exceeds maximum of ₵${SAFETY_LIMITS.MAX_TRANSFER_AMOUNT} per transfer` 
    };
  }

  // Prevent very small transfers (fees make them pointless)
  if (amount < SAFETY_LIMITS.MIN_TRANSFER_AMOUNT) {
    return { 
      valid: false, 
      error: `Minimum transfer amount is ₵${SAFETY_LIMITS.MIN_TRANSFER_AMOUNT}` 
    };
  }

  // Warn for large transfers
  if (amount > 500 && process.env.PAYSTACK_LIVE_MODE === 'true') {
    return { 
      valid: true, 
      error: `⚠️ WARNING: You are about to send ₵${amount} in LIVE MODE. This is real money.` 
    };
  }

  return { valid: true };
}
