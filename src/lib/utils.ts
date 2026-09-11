import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, transactionType: string) {
  const formatted = new Intl.NumberFormat("en-US").format(price);
  return transactionType === "rent" ? `${formatted} MMK / month` : `${formatted} MMK`;
}

export function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
