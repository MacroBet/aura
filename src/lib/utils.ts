import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate time remaining in ms
export function getTimeRemaining(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

// Format time remaining
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Calculate aura for an action
export function calculateAura(basePoints: number, confirmationCount: number): number {
  return basePoints * confirmationCount;
}

// Check if action is expired
export function isActionExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime();
}

// Generate referral code
export function generateReferralCode(userId: string): string {
  return userId.substring(0, 8).toUpperCase();
}

// Format number with k suffix
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Get week start date
export function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.setDate(diff));
}

// Emoji avatars pool
export const emojiAvatars = [
  '😎', '🔥', '⚡', '✨', '💫', '🌟', '💎', '👑', '🎯', '🚀',
  '🎨', '🎭', '🎪', '🎮', '🎲', '🎯', '🏆', '🥇', '🌈', '🦄',
  '🐉', '🦁', '🐯', '🦅', '🦉', '🐺', '🦊', '🐼', '🐨', '🦋',
];

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
