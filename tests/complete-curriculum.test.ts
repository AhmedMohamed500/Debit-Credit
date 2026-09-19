import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const curriculum = fs.readFileSync(
  path.join(process.cwd(), "docs", "COMPLETE-ACCOUNTING-CAREER-CURRICULUM.md"),
  "utf8",
);

const requiredFields = [
  "Module ID",
  "Career Level",
  "Persona",
  "Company Tier",
  "Prerequisites",
  "Accounting Objective",
  "Game Mechanic",
  "Mission",
  "Case Type",
  "Boss",
  "Skills",
  "Evidence Rule",
  "Professional Role Relevance",
  "CV Behavior",
  "Competition Eligibility",
  "Content Status",
  "Review Requirements",
];

const requiredTopics = [
  "Business Basics", "Accounting Basics", "Accounting Equation", "Account City",
  "Nature of Accounts", "Debit and Credit", "Accounting Documents", "Journal Entries",
  "Ledger", "Trial Balance", "Accounting Cycle", "Financial Statements", "Purchasing",
  "Sales", "Accounts Payable", "Accounts Receivable", "Cash", "Bank", "Expenses",
  "Fixed Assets", "Inventory", "Payroll Basics", "Tax Workflow Basics",
  "Supplier Reconciliation", "Customer Reconciliation", "Bank Reconciliation",
  "Accruals", "Prepayments", "Depreciation", "Cut-Off", "Month-End", "General Ledger",
  "Financial Reporting", "Controls", "Audit Support", "Cost Accounting",
  "Management Accounting", "Budgeting", "Forecasting", "Working Capital",
  "Financial Analysis", "FP&A", "Data Analytics", "Power BI", "ERP Workflow",
  "Automation", "AI in Finance", "Business Partnering", "Strategy", "Leadership",
  "Accounting Standards", "IFRS", "Certification Preparation",
];

describe("complete accounting career curriculum", () => {
  it("declares every required module metadata field", () => {
    for (const field of requiredFields) expect(curriculum).toContain(field);
  });

  it("covers the complete requested accounting and finance journey", () => {
    for (const topic of requiredTopics) expect(curriculum).toContain(topic);
  });

  it("keeps verified evidence outside normal local gameplay", () => {
    expect(curriculum).toContain("Verified is reserved");
    expect(curriculum.toLowerCase()).toContain(
      "local/offline results remain editable and unverified",
    );
  });
});
