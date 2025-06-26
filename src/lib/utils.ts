import { format, formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatFileDate = (timestamp:string) => {
  const date = new Date(timestamp);
  return {
    full: format(date, 'PPpp'), // Jul 1, 2024 at 5:31 PM
    short: format(date, 'MMM dd, yyyy'), // Jul 01, 2024
    relative: formatDistanceToNow(date, { addSuffix: true }) // "5 months ago"
  };
};