import { PaystackClient } from 'paystack-sdk-node';

const paystack = new PaystackClient({
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
});

interface MobileMoneyRecipient {
  phoneNumber: string;      // e.g., "024XXXXXXX"
  provider: string;          // "MTN", "VOD", "ATL" (AirtelTigo)
  name: string;              // Customer's full name
}

/**
 * Create a mobile money transfer recipient
 * This is a one-time setup per customer. Save the recipient_code for future transfers
 */
export async function createMobileMoneyRecipient(data: MobileMoneyRecipient) {
  // First, resolve the mobile number to verify it's valid
  const resolveResponse = await paystack.transferRecipient.resolveAccountNumber({
    type: 'mobile_money',
    account_number: data.phoneNumber,
    bank_code: data.provider, // MTN, VOD, or ATL
    currency: 'GHS',
  });

  if (!resolveResponse.status) {
    throw new Error(`Mobile number verification failed: ${resolveResponse.message}`);
  }

  // Create the transfer recipient
  const recipient = await paystack.transferRecipient.create({
    type: 'mobile_money',
    name: data.name,
    account_number: data.phoneNumber,
    bank_code: data.provider,
    currency: 'GHS',
  });

  if (!recipient.status) {
    throw new Error(`Failed to create recipient: ${recipient.message}`);
  }

  // Return the recipient_code - save this in your database!
  return {
    success: true,
    recipientCode: recipient.data.recipient_code,
    recipientId: recipient.data.id,
    details: recipient.data.details,
  };
}

/**
 * Fetch list of supported mobile money providers in Ghana
 */
export async function getMobileMoneyProviders() {
  const response = await paystack.bank.list({
    currency: 'GHS',
    type: 'mobile_money',
  });

  if (!response.status) {
    throw new Error(`Failed to fetch providers: ${response.message}`);
  }

  return response.data.map((bank: any) => ({
    code: bank.code,      // MTN, VOD, ATL
    name: bank.name,      // MTN, Vodafone, AirtelTigo
    slug: bank.slug,
  }));
}
