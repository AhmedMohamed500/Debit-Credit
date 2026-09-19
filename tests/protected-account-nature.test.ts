import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

// Intentional replacement: approved accounting data remains unchanged; the active protected UI is Account City.
const protectedFiles:Record<string,string>={
 'data/account-learning-guide.ts':'1ffa95a27665fc3970f03ef881db282f0cdfe994efee691d51e81876e4cc9187',
 'components/academy/account-city.tsx':'2faafe1a10474338f8779691e785b5ceb04c8499f7993a1cd027a1313e1cbd6f',
 'app/account-city.css':'c2d17cb3acc095558bdcf4e714c0a9d6c6d8eb3a95dfce9afeff479981c32a35',
 'lib/account-city.ts':'f4ccc5f939a6ad064a0eb6d8a7288cfef7e8bfe205458c0214eca24de51a0684',
 'app/[locale]/account-guide/page.tsx':'73773caa0e5e77622193be3a4eebff46ca089c496a361530050309b3321e8e0c',
};
describe('protected Account City and authoritative accounting source',()=>{it('keeps the approved account data and active city implementation fingerprint',()=>{for(const[file,expected]of Object.entries(protectedFiles)){const source=readFileSync(resolve(process.cwd(),file),'utf8').replace(/\r\n/g,'\n'),hash=createHash('sha256').update(source).digest('hex');expect(hash,`${file} is protected`).toBe(expected)}})});
