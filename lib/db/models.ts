import mongoose from 'mongoose';

// ==================== USER MODEL ====================
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: String,
  dateOfBirth: Date,
  nationalId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPPORT'], default: 'USER' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ==================== ACCOUNT MODEL ====================
const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'FIXED_DEPOSIT'], 
    default: 'CHECKING' 
  },
  currency: { type: String, default: 'GHS' },
  balance: { type: Number, default: 0 },
  ledgerBalance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  interestRate: Number,
  status: { 
    type: String, 
    enum: ['ACTIVE', 'FROZEN', 'CLOSED', 'DORMANT'], 
    default: 'ACTIVE' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== TRANSACTION MODEL ====================
const TransactionSchema = new mongoose.Schema({
  transactionRef: { type: String, required: true, unique: true },
  fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  narration: String,
  transactionType: { 
    type: String, 
    enum: [
      'TRANSFER', 'INTERBANK', 'MOBILE_MONEY', 'BILL_PAYMENT', 
      'AIRTIME', 'DATA_BUNDLE', 'QR_PAYMENT', 'MERCHANT_PAYMENT',
      'DEPOSIT', 'WITHDRAWAL'
    ],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED'],
    default: 'PENDING' 
  },
  scheduledDate: Date,
  completedAt: Date,
  expiresAt: Date,
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
TransactionSchema.index({ fromAccountId: 1, createdAt: -1 });
TransactionSchema.index({ transactionRef: 1 });

// ==================== CARD MODEL ====================
const CardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  cardNumber: { type: String, required: true, unique: true },
  cardHolderName: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  cvv: { type: String, required: true },
  cardType: { type: String, enum: ['DEBIT', 'CREDIT', 'PREPAID'], default: 'DEBIT' },
  cardScheme: { type: String, enum: ['VISA', 'MASTERCARD', 'VERVE'], default: 'VISA' },
  isVirtual: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFrozen: { type: Boolean, default: false },
  dailyLimit: { type: Number, default: 5000 },
  monthlyLimit: { type: Number, default: 50000 },
  usedDailyLimit: { type: Number, default: 0 },
  usedMonthlyLimit: { type: Number, default: 0 },
  lastUsed: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== BENEFICIARY MODEL ====================
const BeneficiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  bankName: String,
  bankCode: String,
  nickname: String,
  isFavorite: { type: Boolean, default: false },
  transactionType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==================== SAVINGS GOAL MODEL ====================
const SavingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== FIXED DEPOSIT MODEL ====================
const FixedDepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenureDays: { type: Number, required: true },
  maturityDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'MATURED', 'WITHDRAWN'], 
    default: 'ACTIVE' 
  },
  createdAt: { type: Date, default: Date.now }
});

// ==================== LOAN APPLICATION MODEL ====================
const LoanApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanType: { 
    type: String, 
    enum: ['PERSONAL', 'BUSINESS', 'EDUCATION', 'MORTGAGE'], 
    required: true 
  },
  amount: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  interestRate: Number,
  monthlyPayment: Number,
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED'],
    default: 'PENDING' 
  },
  approvedAmount: Number,
  approvalDate: Date,
  disbursementDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== LOAN REPAYMENT MODEL ====================
const LoanRepaymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: Date,
  status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'OVERDUE'], 
    default: 'PENDING' 
  },
  transactionRef: String
});

// ==================== SUPPORT TICKET MODEL ====================
const SupportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: String,
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  assignedTo: String,
  resolvedAt: Date,
  messages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    attachments: [String],
    isStaff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== SESSION MODEL ====================
const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==================== DEVICE MODEL ====================
const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true, unique: true },
  deviceName: String,
  deviceType: String,
  isVerified: { type: Boolean, default: false },
  lastUsed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// ==================== AUDIT LOG MODEL ====================
const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

// ==================== KYC DOCUMENT MODEL ====================
const KYCDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { 
    type: String, 
    enum: ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS', 'UTILITY_BILL'],
    required: true 
  },
  documentUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'], 
    default: 'PENDING' 
  },
  verifiedBy: String,
  verifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// ==================== NOTIFICATION PREFS MODEL ====================
const NotificationPrefsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  transactionAlerts: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: false },
  securityAlerts: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== CARD TRANSACTION MODEL ====================
const CardTransactionSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  amount: { type: Number, required: true },
  merchant: String,
  location: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const TransferRecipientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientCode: { type: String, required: true, unique: true }, // Paystack's recipient_code
  type: { type: String, enum: ['mobile_money', 'bank_account'], required: true },
  provider: String,      // MTN, VOD, ATL for mobile money
  accountNumber: String, // Phone number for mobile money
  accountName: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});


// ==================== EXPORT MODELS ====================
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
export const Beneficiary = mongoose.models.Beneficiary || mongoose.model('Beneficiary', BeneficiarySchema);
export const SavingsGoal = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', SavingsGoalSchema);
export const FixedDeposit = mongoose.models.FixedDeposit || mongoose.model('FixedDeposit', FixedDepositSchema);
export const LoanApplication = mongoose.models.LoanApplication || mongoose.model('LoanApplication', LoanApplicationSchema);
export const LoanRepayment = mongoose.models.LoanRepayment || mongoose.model('LoanRepayment', LoanRepaymentSchema);
export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const KYCDocument = mongoose.models.KYCDocument || mongoose.model('KYCDocument', KYCDocumentSchema);
export const NotificationPrefs = mongoose.models.NotificationPrefs || mongoose.model('NotificationPrefs', NotificationPrefsSchema);
export const CardTransaction = mongoose.models.CardTransaction || mongoose.model('CardTransaction', CardTransactionSchema);
export const TransferRecipient = mongoose.models.TransferRecipient || 
  mongoose.model('TransferRecipient', TransferRecipientSchema);