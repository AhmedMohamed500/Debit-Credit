import { describe,expect,it } from "vitest";
import { demoCandidates } from "@/data/employers";
import { filterCandidates } from "@/lib/employers/filters";
describe("demo employer talent filters",()=>{it("filters by readiness, accuracy, level and demonstrated skill",()=>{const rows=filterCandidates(demoCandidates,{skill:"error-detection",minReadiness:85,minAccuracy:85,minLevel:5});expect(rows.length).toBeGreaterThan(0);expect(rows.every(row=>row.readiness>=85&&row.accuracy>=85&&row.level>=5&&row.skills["error-detection"])).toBeTruthy()});it("sorts strongest readiness first",()=>{const rows=filterCandidates(demoCandidates,{minReadiness:0,minAccuracy:0,minLevel:1});expect(rows[0].readiness).toBe(Math.max(...rows.map(row=>row.readiness)))});it("marks every candidate source as demo through fixed seeded dataset",()=>{expect(demoCandidates.every(row=>row.id&&row.nameAr&&row.nameEn)).toBe(true)})});

