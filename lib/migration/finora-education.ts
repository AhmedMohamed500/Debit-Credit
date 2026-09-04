export const MIGRATION_FLAG = "debit-credit-storage-migration-v1";
export const EDUCATIONAL_STORAGE_MIGRATIONS = [
  { to:"debit-credit-arena-v1", from:["finora-training-arena-v2"] },
  { to:"debit-credit-missions-v1", from:["finora-training-missions-v1"] },
  { to:"debit-credit-detective-v1", from:["finora-training-detective-v1"] },
  { to:"debit-credit-money-flow-v1", from:["finora-training-money-flow-v1"] },
  { to:"debit-credit-progress-v1", from:["finora-academy-progress"] },
] as const;
export function migrateFinoraEducationStorage(storage:Pick<Storage,"getItem"|"setItem">=localStorage) { if(storage.getItem(MIGRATION_FLAG))return {migrated:false,copied:[] as string[]}; const copied:string[]=[]; for(const item of EDUCATIONAL_STORAGE_MIGRATIONS){ if(storage.getItem(item.to))continue; const source=item.from.find(key=>storage.getItem(key)!==null); if(source){storage.setItem(item.to,storage.getItem(source)!);copied.push(item.to);} } storage.setItem(MIGRATION_FLAG,JSON.stringify({completedAt:new Date().toISOString(),copied})); return {migrated:copied.length>0,copied}; }
