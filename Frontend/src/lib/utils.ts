import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'react-toastify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const displayError = (message: string) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
  });
};

export const extractErrorMessage = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pre = doc.querySelector('pre');
  return pre ? pre.textContent || 'An unknown error occurred' : 'An unknown error occurred';
};
