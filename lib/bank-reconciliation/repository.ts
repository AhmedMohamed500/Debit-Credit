"use client";
import {
  newBankWorkpaper,
  restoreBankWorkpaper,
  type BankWorkpaper,
} from "./engine";
import { queueCloudBackup } from "@/lib/cloud/runtime";
export const BANK_WORKPAPER_KEY = "debit-credit-bank-reconciliation-v1";
export class BrowserBankWorkpaperRepository {
  get() {
    if (typeof window === "undefined") return newBankWorkpaper();
    try {
      return restoreBankWorkpaper(localStorage.getItem(BANK_WORKPAPER_KEY));
    } catch {
      return newBankWorkpaper();
    }
  }
  save(work: BankWorkpaper) {
    if (typeof window !== "undefined") {
      localStorage.setItem(BANK_WORKPAPER_KEY, JSON.stringify(work));
      queueCloudBackup(BANK_WORKPAPER_KEY, work);
    }
    return work;
  }
}
