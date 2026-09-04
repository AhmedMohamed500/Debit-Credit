import type { ChartAccount } from "@/types";
export const getPostingAccounts = (accounts:ChartAccount[]) => accounts.filter(account => account.active && account.allowPosting !== false && !accounts.some(candidate => candidate.parentId === account.id)).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
