import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/* 
 * Architectural Decision: Utility Function
 * - Combines clsx for conditional class names
 * - Merges Tailwind classes intelligently
 * - Prevents class conflicts and improves performance
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
