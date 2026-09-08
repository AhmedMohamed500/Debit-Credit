import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe,expect,it } from "vitest";
const protectedFiles:Record<string,string>={"components/academy/account-guide.tsx":"93b8409ee28b30670804bbd0c7f71fabb82d1603227600d3ca06670a17decce3","data/account-learning-guide.ts":"1ffa95a27665fc3970f03ef881db282f0cdfe994efee691d51e81876e4cc9187","app/[locale]/account-guide/page.tsx":"dc7cb4b69d78554a1f9fe28507d40de8f0281b157568c42809fee9531135ded5","app/accounting-manual.css":"dc9493558391c0bbf221f4d6d7ba27048d422d79a09981df5d73286200fbfcee"};
describe("protected Nature of Accounts classic module",()=>{it("keeps its route, data and internal UI byte-for-byte unchanged",()=>{for(const[file,expected]of Object.entries(protectedFiles)){const source=readFileSync(resolve(process.cwd(),file),"utf8").replace(/\r\n/g,"\n"),hash=createHash("sha256").update(source).digest("hex");expect(hash,`${file} is protected`).toBe(expected)}})});
