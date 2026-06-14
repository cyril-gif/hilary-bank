import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function generateTransactionRef(): string {
  return `HIL${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  return `****${accountNumber.slice(-4)}`;
}

export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';
  return `**** **** **** ${cardNumber.slice(-4)}`;
}
