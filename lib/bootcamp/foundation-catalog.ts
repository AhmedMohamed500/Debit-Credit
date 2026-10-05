import type {
  BootcampMission,
  FoundationChoice,
  FoundationEntry,
  FoundationTask,
} from "./model";
export const t = (en: string, ar: string) => ({ en, ar });
export const foundationAccounts = [
  {
    id: "cash",
    code: "1100",
    label: t("Cash", "النقدية"),
    type: "assets",
    icon: "cash",
  },
  {
    id: "bank",
    code: "1110",
    label: t("Bank", "البنك"),
    type: "assets",
    icon: "bank",
  },
  {
    id: "inventory",
    code: "1200",
    label: t("Inventory", "المخزون"),
    type: "assets",
    icon: "box",
  },
  {
    id: "equipment",
    code: "1300",
    label: t("Equipment", "المعدات"),
    type: "assets",
    icon: "equipment",
  },
  {
    id: "receivable",
    code: "1120",
    label: t("Customer receivable", "العملاء"),
    type: "assets",
    icon: "customer",
  },
  {
    id: "payable",
    code: "2100",
    label: t("Supplier payable", "الموردون"),
    type: "liabilities",
    icon: "supplier",
  },
  {
    id: "capital",
    code: "3100",
    label: t("Capital", "رأس المال"),
    type: "equity",
    icon: "capital",
  },
  {
    id: "revenue",
    code: "4100",
    label: t("Sales revenue", "إيراد المبيعات"),
    type: "revenue",
    icon: "revenue",
  },
  {
    id: "rent",
    code: "5100",
    label: t("Rent expense", "مصروف الإيجار"),
    type: "expenses",
    icon: "rent",
  },
  {
    id: "cost",
    code: "5010",
    label: t("Cost of goods sold", "تكلفة البضاعة المباعة"),
    type: "expenses",
    icon: "box",
  },
  {
    id: "depreciation",
    code: "1390",
    label: t("Accumulated depreciation", "مجمع الإهلاك"),
    type: "contra",
    icon: "equipment",
  },
] as const;
export const accountLabel = (id: string) =>
  foundationAccounts.find((a) => a.id === id)?.label ?? t(id, id);
const choice = (
  id: string,
  en: string,
  ar: string,
  icon?: string,
): FoundationChoice => ({ id, label: t(en, ar), icon });
export const documents = [
  choice("invoice", "Invoice", "فاتورة", "invoice"),
  choice("receipt", "Receipt", "إيصال قبض", "receipt"),
  choice("voucher", "Payment voucher", "سند صرف", "voucher"),
  choice("bank", "Bank advice / statement", "إشعار / كشف بنك", "bank"),
  choice("po", "Purchase order", "أمر شراء", "po"),
];
const directions = [
  choice("up", "↑ Increase", "↑ زيادة"),
  choice("down", "↓ Decrease", "↓ نقص"),
];
const sides = [
  choice("debit", "Debit (Dr)", "مدين (Dr)"),
  choice("credit", "Credit (Cr)", "دائن (Cr)"),
];
const task = (
  id: string,
  kind: FoundationTask["kind"],
  en: string,
  ar: string,
  answer: string[],
  exEn: string,
  exAr: string,
  choices?: FoundationChoice[],
): FoundationTask => ({
  id,
  kind,
  prompt: t(en, ar),
  answer,
  explanation: t(exEn, exAr),
  choices,
});
const movement = (
  id: string,
  en: string,
  ar: string,
  rows: [string, string][],
): FoundationTask => ({
  ...task(
    id,
    "movement",
    en,
    ar,
    rows.map((r) => r[1]),
    "Track the resource or claim that actually changes.",
    "تتبع المورد أو الحق الذي تغيّر فعلًا.",
  ),
  rows: rows.map(([account]) => ({
    id: account,
    label: accountLabel(account),
    options: directions,
  })),
});
export const foundationEntries: FoundationEntry[] = [
  {
    id: "owner-cash",
    story: t(
      "Ahmed invests EGP 100,000 cash in Mizan Trading.",
      "أحمد يستثمر 100,000 جنيه نقدًا في Mizan Trading.",
    ),
    document: t("Owner contribution receipt", "إيصال استثمار المالك"),
    reference: "CAP-001",
    amount: 100000,
    lines: [
      { account: "cash", debit: 100000, credit: 0 },
      { account: "capital", debit: 0, credit: 100000 },
    ],
  },
  {
    id: "equipment-cash",
    story: t(
      "Buy equipment for EGP 20,000 cash.",
      "شراء معدات بمبلغ 20,000 جنيه نقدًا.",
    ),
    document: t("Equipment invoice + paid voucher", "فاتورة معدات + سند صرف"),
    reference: "EQ-002",
    amount: 20000,
    lines: [
      { account: "equipment", debit: 20000, credit: 0 },
      { account: "cash", debit: 0, credit: 20000 },
    ],
  },
  {
    id: "inventory-credit",
    story: t(
      "Receive inventory costing EGP 30,000 on credit.",
      "استلام مخزون بتكلفة 30,000 جنيه على الحساب.",
    ),
    document: t("Supplier invoice + goods receipt", "فاتورة مورد + إذن استلام"),
    reference: "INV-003",
    amount: 30000,
    lines: [
      { account: "inventory", debit: 30000, credit: 0 },
      { account: "payable", debit: 0, credit: 30000 },
    ],
  },
  {
    id: "credit-sale",
    story: t(
      "Sell goods for EGP 15,000 on credit. Their cost is EGP 10,000. Record BOTH the sale and the cost.",
      "بيع بضاعة بـ15,000 جنيه آجلًا، تكلفتها 10,000 جنيه. سجّل البيع وخروج المخزون معًا.",
    ),
    document: t(
      "Sales invoice + delivery note (cost EGP 10,000)",
      "فاتورة بيع + إذن تسليم (تكلفة 10,000 جنيه)",
    ),
    reference: "SALE-004",
    amount: 15000,
    lines: [
      { account: "receivable", debit: 15000, credit: 0 },
      { account: "revenue", debit: 0, credit: 15000 },
      { account: "cost", debit: 10000, credit: 0 },
      { account: "inventory", debit: 0, credit: 10000 },
    ],
  },
  {
    id: "rent-payment",
    story: t("Pay rent of EGP 5,000 cash.", "دفع إيجار 5,000 جنيه نقدًا."),
    document: t("Approved rent payment voucher", "سند صرف إيجار معتمد"),
    reference: "PAY-005",
    amount: 5000,
    lines: [
      { account: "rent", debit: 5000, credit: 0 },
      { account: "cash", debit: 0, credit: 5000 },
    ],
  },
  {
    id: "customer-collection",
    story: t(
      "Collect the full EGP 15,000 customer balance in cash.",
      "تحصيل كامل رصيد العميل 15,000 جنيه نقدًا.",
    ),
    document: t("Customer cash receipt", "إيصال قبض العميل"),
    reference: "RCPT-006",
    amount: 15000,
    lines: [
      { account: "cash", debit: 15000, credit: 0 },
      { account: "receivable", debit: 0, credit: 15000 },
    ],
  },
  {
    id: "supplier-payment",
    story: t(
      "Pay EGP 10,000 of the supplier balance in cash.",
      "سداد 10,000 جنيه من رصيد المورد نقدًا.",
    ),
    document: t("Supplier payment voucher", "سند صرف للمورد"),
    reference: "PAY-007",
    amount: 10000,
    lines: [
      { account: "payable", debit: 10000, credit: 0 },
      { account: "cash", debit: 0, credit: 10000 },
    ],
  },
];
const mission = (
  id: BootcampMission["id"],
  order: number,
  en: string,
  ar: string,
  briefEn: string,
  briefAr: string,
  mechanic: BootcampMission["mechanic"],
  tasks: FoundationTask[],
  xp = 120,
): BootcampMission => ({
  id,
  order,
  title: t(en, ar),
  brief: t(briefEn, briefAr),
  mechanic,
  tasks,
  xp,
  evidenceRule: "practice-only",
});
const classified = (
  rows: string[][],
  choices: FoundationChoice[],
  exEn: string,
  exAr: string,
) =>
  rows.map(([id, en, ar, a]) =>
    task(id, "choice", en, ar, [a], exEn, exAr, choices),
  );
export const bootcampMissions: BootcampMission[] = [
  mission(
    "business-world",
    1,
    "Open your first company",
    "افتح شركتك الأولى",
    "Move EGP 100,000 from Ahmed’s personal money into his company.",
    "انقل 100,000 جنيه من أموال أحمد الخاصة إلى شركته.",
    "investment",
    [
      task(
        "transfer",
        "transfer",
        "Move Ahmed’s investment into Mizan Trading.",
        "انقل استثمار أحمد إلى Mizan Trading.",
        ["move"],
        "The business now owns the money, separately from Ahmed.",
        "الشركة أصبحت تملك المال؛ أموال الشركة منفصلة عن أموال أحمد.",
      ),
      task(
        "affected",
        "multiple",
        "Place the TWO affected accounts in the company.",
        "ضع الحسابين اللذين تغيّرا في الشركة.",
        ["cash", "capital"],
        "Cash +100,000; owner’s equity +100,000. Accounting remembers both sides.",
        "النقدية +100,000 وحقوق المالك +100,000. المحاسبة تتذكر الطرفين.",
        foundationAccounts
          .filter((a) =>
            ["cash", "equipment", "inventory", "capital"].includes(a.id),
          )
          .map((a) => choice(a.id, a.label.en, a.label.ar, a.icon)),
      ),
    ],
  ),
  mission(
    "transaction-radar",
    2,
    "Is this a transaction?",
    "هل دي عملية مالية؟",
    "Sort financial changes away from conversations and plans.",
    "فرّق بين التغير المالي الفعلي والكلام والخطط.",
    "classify",
    classified(
      [
        ["call", "Manager calls a supplier.", "المدير يتصل بمورد.", "no"],
        [
          "equipment",
          "Buy equipment for EGP 30,000.",
          "شراء معدات بـ30,000 جنيه.",
          "record",
        ],
        [
          "interview",
          "Candidate attends an interview.",
          "مرشح يحضر مقابلة.",
          "no",
        ],
        ["rent", "Company pays rent.", "الشركة تدفع الإيجار.", "record"],
        ["price", "Customer asks for a price.", "عميل يسأل عن السعر.", "no"],
        ["sale", "Sell and deliver goods.", "بيع وتسليم بضاعة.", "record"],
      ],
      [
        choice("record", "Record it", "يسجل محاسبيًا"),
        choice("no", "No entry now", "لا يوجد قيد الآن"),
      ],
      "Record measurable changes, not a discussion, interview or price enquiry.",
      "سجّل التغير المالي القابل للقياس، وليس مكالمة أو مقابلة أو سؤال سعر.",
    ),
  ),
  mission(
    "document-dock",
    3,
    "The document is the evidence",
    "المستند هو الدليل",
    "Match each event to its evidence.",
    "اربط كل حدث بدليله. المحاسب لا يسجل من الكلام.",
    "documents",
    classified(
      [
        [
          "purchase",
          "Receive goods and the supplier’s bill.",
          "استلام بضاعة ومطالبة المورد.",
          "invoice",
        ],
        ["collect", "Collect customer cash.", "تحصيل نقدي من عميل.", "receipt"],
        [
          "expense",
          "Pay an approved cash expense.",
          "دفع مصروف نقدًا بعد اعتماده.",
          "voucher",
        ],
        ["bank", "Bank confirms a transfer.", "البنك يؤكد تحويلًا.", "bank"],
        [
          "order",
          "Approve a purchase BEFORE goods arrive.",
          "اعتماد طلب شراء قبل وصول البضاعة.",
          "po",
        ],
      ],
      documents,
      "Keep the source evidence. A purchase order authorizes purchase, but alone proves neither receipt nor a posted liability.",
      "احفظ دليل العملية. أمر الشراء يصرّح بالشراء لكنه وحده لا يثبت الاستلام أو التزامًا مسجلًا.",
    ),
  ),
  mission(
    "equation-builder",
    4,
    "Balance the company",
    "وازن الشركة",
    "Put values on the scale. Watch what a loan changes.",
    "ضع القيم على الميزان، ثم شاهد تأثير القرض.",
    "equation",
    [
      task(
        "investment-equation",
        "equation",
        "Balance the EGP 100,000 investment.",
        "وازن استثمار المالك 100,000 جنيه.",
        ["100000", "0", "100000"],
        "Assets 100,000 = liabilities 0 + equity 100,000.",
        "الأصول 100,000 = الالتزامات 0 + حقوق الملكية 100,000.",
      ),
      task(
        "loan-equation",
        "equation",
        "Receive a EGP 20,000 bank loan. Update the balance.",
        "استلام قرض بنكي 20,000 جنيه. حدّث الميزان.",
        ["120000", "20000", "100000"],
        "Cash and the loan rise together; a loan is not revenue or capital.",
        "النقدية والقرض يزيدان معًا؛ القرض ليس إيرادًا أو رأس مال.",
      ),
    ],
  ),
  mission(
    "account-city",
    5,
    "Account City",
    "مدينة الحسابات",
    "Sort seven accounts into the three beginner districts.",
    "وزّع سبعة حسابات على الأحياء الثلاثة للمبتدئين.",
    "districts",
    foundationAccounts
      .slice(0, 7)
      .map((a) =>
        task(
          a.id,
          "choice",
          a.label.en,
          a.label.ar,
          [a.type],
          "Assets are resources, liabilities are amounts owed, equity is the owner’s remaining claim.",
          "الأصول موارد، والالتزامات مبالغ مستحقة، وحقوق الملكية حق المالك المتبقي.",
          [
            choice("assets", "Assets", "الأصول"),
            choice("liabilities", "Liabilities", "الالتزامات"),
            choice("equity", "Equity", "حقوق الملكية"),
          ],
        ),
      ),
  ),
  mission(
    "income-expenses",
    6,
    "The company earns and spends",
    "الشركة بتكسب وتصرف",
    "Follow what earnings and consumption change.",
    "تتبع تأثير الكسب والاستهلاك.",
    "income",
    classified(
      [
        ["sale", "Deliver a sale.", "تنفيذ بيع بضاعة.", "revenue"],
        [
          "rent",
          "Use this month’s rented office.",
          "استخدام المكتب المؤجر هذا الشهر.",
          "expense",
        ],
        ["utilities", "Use electricity.", "استهلاك الكهرباء.", "expense"],
        [
          "service",
          "Complete a paid service.",
          "تنفيذ خدمة بمقابل.",
          "revenue",
        ],
      ],
      [
        choice("revenue", "Revenue ↑ · Equity ↑", "الإيراد ↑ · حقوق الملكية ↑"),
        choice("expense", "Expense ↑ · Equity ↓", "المصروف ↑ · حقوق الملكية ↓"),
      ],
      "Revenue raises and expenses reduce the period’s result; both affect equity indirectly.",
      "الإيراد يزيد والمصروف يقلل نتيجة الفترة؛ كلاهما يؤثر على حقوق الملكية بصورة غير مباشرة.",
    ),
  ),
  mission(
    "contra-account",
    7,
    "The offsetting account",
    "الحساب العكسي",
    "Equipment still exists. Show its used-up value separately.",
    "المعدات ما زالت موجودة. أظهر الجزء المستهلك بصورة مستقلة.",
    "contra",
    [
      task(
        "pair",
        "choice",
        "Equipment costs 20,000. Which account offsets wear of 2,000?",
        "معدات تكلفتها 20,000. أي حساب يقابل استهلاكًا بقيمة 2,000؟",
        ["depreciation"],
        "Accumulated depreciation offsets equipment; equipment has not disappeared.",
        "مجمع الإهلاك يقابل المعدات؛ المعدات لم تختفِ.",
        [
          choice("capital", "Capital", "رأس المال"),
          choice("depreciation", "Accumulated depreciation", "مجمع الإهلاك"),
          choice("payable", "Supplier payable", "الموردون"),
        ],
      ),
      task(
        "carrying",
        "equation",
        "20,000 equipment − 2,000 accumulated depreciation = carrying amount?",
        "20,000 معدات − 2,000 مجمع إهلاك = القيمة الدفترية؟",
        ["18000"],
        "Net carrying amount: EGP 18,000.",
        "صافي القيمة الدفترية: 18,000 جنيه.",
      ),
    ],
  ),
  mission(
    "movement-lab",
    8,
    "Did the account rise or fall?",
    "الحساب زاد ولا نقص؟",
    "Choose movement BEFORE debit or credit.",
    "اختَر الحركة قبل المدين والدائن.",
    "movement",
    [
      movement("rent", "Pay rent.", "دفع الإيجار.", [
        ["cash", "down"],
        ["rent", "up"],
      ]),
      movement("owner", "Owner invests cash.", "المالك يستثمر نقدية.", [
        ["cash", "up"],
        ["capital", "up"],
      ]),
      movement(
        "sale",
        "Complete a cash service sale.",
        "تنفيذ خدمة مقابل نقدية.",
        [
          ["cash", "up"],
          ["revenue", "up"],
        ],
      ),
      movement("inventory", "Buy inventory on credit.", "شراء مخزون آجلًا.", [
        ["inventory", "up"],
        ["payable", "up"],
      ]),
    ],
  ),
  mission(
    "debit-credit",
    9,
    "Discover debit and credit",
    "سر المدين والدائن",
    "Place familiar account movements into their recording lanes.",
    "ضع حركات الحسابات المألوفة في اتجاهات تسجيلها.",
    "lanes",
    classified(
      [
        ["asset-up", "Cash increases.", "النقدية تزيد.", "debit"],
        ["asset-down", "Cash decreases.", "النقدية تنقص.", "credit"],
        [
          "liability-up",
          "Supplier payable increases.",
          "الموردون تزيد.",
          "credit",
        ],
        ["equity-up", "Owner capital increases.", "رأس المال يزيد.", "credit"],
        ["revenue-up", "Revenue increases.", "الإيراد يزيد.", "credit"],
        ["expense-up", "Expense increases.", "المصروف يزيد.", "debit"],
      ],
      sides,
      "Debit and credit are recording sides, not good/bad or always money in/out.",
      "مدين ودائن جهتا تسجيل؛ ليسا جيدًا وسيئًا أو قبضًا وصرفًا دائمًا.",
    ),
  ),
  mission(
    "double-entry",
    10,
    "Every transaction has two sides",
    "عملية لها وجهان",
    "Follow EGP 20,000 from cash into equipment.",
    "تتبع 20,000 جنيه من النقدية إلى المعدات.",
    "flow",
    [
      task(
        "follow",
        "transfer",
        "Move cash into equipment.",
        "حرّك النقدية إلى المعدات.",
        ["move"],
        "Cash becomes equipment; total assets stay unchanged.",
        "تحولت النقدية إلى معدات؛ إجمالي الأصول لم يتغير.",
      ),
      movement(
        "effects",
        "What rose and what fell?",
        "ما الذي زاد وما الذي نقص؟",
        [
          ["equipment", "up"],
          ["cash", "down"],
        ],
      ),
      {
        ...task(
          "sides",
          "movement",
          "Translate both movements.",
          "ترجم الحركتين.",
          ["debit", "credit"],
          "Equipment debit 20,000; cash credit 20,000.",
          "المعدات مدينة 20,000؛ النقدية دائنة 20,000.",
        ),
        rows: [
          { id: "equipment", label: accountLabel("equipment"), options: sides },
          { id: "cash", label: accountLabel("cash"), options: sides },
        ],
      },
    ],
  ),
  mission(
    "first-journal",
    11,
    "Build your first entry",
    "اكتب أول قيد",
    "Build a real balanced entry for the cash equipment purchase.",
    "ابنِ قيدًا حقيقيًا متوازنًا لشراء المعدات نقدًا.",
    "journal",
    [
      {
        ...task(
          "journal",
          "journal",
          foundationEntries[1].story.en,
          foundationEntries[1].story.ar,
          [],
          "Equipment +20,000; cash −20,000; total assets unchanged.",
          "معدات +20,000؛ نقدية −20,000؛ إجمالي الأصول لم يتغير.",
        ),
        entryId: "equipment-cash",
      },
    ],
    250,
  ),
  mission(
    "accounting-cycle",
    12,
    "The entry’s journey",
    "رحلة القيد",
    "Travel with the same purchase from invoice to statements.",
    "سافر مع نفس عملية الشراء من الفاتورة إلى القوائم.",
    "cycle",
    ["source", "journal", "ledger", "trial", "statements"].map((id, i) =>
      task(
        id,
        "station",
        [
          "Inspect invoice EQ-002",
          "Visit the journal",
          "Visit the ledger",
          "Visit the trial balance",
          "Visit the statements",
        ][i],
        [
          "افحص فاتورة EQ-002",
          "زر اليومية",
          "زر الأستاذ",
          "زر ميزان المراجعة",
          "زر القوائم",
        ][i],
        ["visit"],
        "One supported transaction, different views. Never counted twice.",
        "عملية واحدة مؤيدة وعروض مختلفة؛ لا تُحسب مرتين.",
      ),
    ),
  ),
  mission(
    "mizan-boss",
    13,
    "Start Mizan Trading",
    "ابدأ تشغيل Mizan Trading",
    "Run seven connected transactions: evidence → accounts → movements → journal.",
    "شغّل سبع عمليات مترابطة: دليل ← حسابات ← حركات ← قيد.",
    "boss",
    foundationEntries.flatMap((entry) => [
      {
        ...task(
          `${entry.id}:document`,
          "station",
          entry.document.en,
          entry.document.ar,
          ["visit"],
          "Evidence inspected. Identify the affected accounts.",
          "تم فحص الدليل. حدد الحسابات المتأثرة.",
        ),
        entryId: entry.id,
      },
      {
        ...task(
          `${entry.id}:accounts`,
          "multiple",
          "Identify ALL affected accounts.",
          "حدد كل الحسابات المتأثرة.",
          entry.lines.map((l) => l.account),
          "Now follow each account’s movement.",
          "تتبع الآن حركة كل حساب.",
          foundationAccounts
            .slice(0, 10)
            .map((a) => choice(a.id, a.label.en, a.label.ar, a.icon)),
        ),
        entryId: entry.id,
      },
      {
        ...movement(
          `${entry.id}:movement`,
          "Track the economic changes.",
          "تتبع التغيرات الاقتصادية.",
          entry.lines.map((l) => [
            l.account,
            (
              ["assets", "expenses"].includes(
                foundationAccounts.find((a) => a.id === l.account)!.type,
              )
                ? l.debit > 0
                : l.credit > 0
            )
              ? "up"
              : "down",
          ]),
        ),
        entryId: entry.id,
      },
      {
        ...task(
          `${entry.id}:journal`,
          "journal",
          entry.story.en,
          entry.story.ar,
          [],
          "Supported, balanced and economically correct.",
          "قيد مؤيد ومتوازن وصحيح اقتصاديًا.",
        ),
        entryId: entry.id,
      },
    ]),
    500,
  ),
];
export const bootcampMissionIds = bootcampMissions.map((m) => m.id);
export const getBootcampMission = (id: string) =>
  bootcampMissions.find((m) => m.id === id) ?? null;
