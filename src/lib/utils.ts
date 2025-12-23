import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a date value safely - handles ISO strings, Date objects, and Unix timestamps
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  // If already a Date object
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }

  // If it's a numeric string (Unix timestamp in milliseconds)
  if (/^\d+$/.test(date)) {
    const timestamp = parseInt(date, 10);
    const parsed = new Date(timestamp);
    return isValid(parsed) ? parsed : null;
  }

  // Try parsing as ISO string
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : null;
}

export function formatDate(date: string | Date | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return "N/A";

  return format(parsed, "MMM d, yyyy");
}

export function formatDateTime(date: string | Date | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return "N/A";

  return format(parsed, "MMM d, yyyy h:mm a");
}

export function formatCurrency(amount: number, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
