import type { JournalEntryLine } from "@/types";
import { roundCurrency } from "./calculations";
export const journalTotals = (lines:JournalEntryLine[]) => ({ debit:roundCurrency(lines.reduce((sum,line)=>sum+line.debit,0)), credit:roundCurrency(lines.reduce((sum,line)=>sum+line.credit,0)) });
export const isBalanced = (lines:JournalEntryLine[]) => { const totals=journalTotals(lines); return totals.debit>0 && Math.abs(totals.debit-totals.credit)<.005; };
