export interface OCRResult {
  amount: number;
  type: "EXPENSE" | "INCOME";
  description: string;
  categoryId: string;
  date: Date;
}

const MOCK_RECEIPTS: Omit<OCRResult, "date">[] = [
  { amount: 45000, type: "EXPENSE", description: "Starbucks Caramel Macchiato", categoryId: "ce1" }, // Makan & Minum
  { amount: 25000, type: "EXPENSE", description: "Grab Car to Office", categoryId: "ce2" },          // Transportasi
  { amount: 150000, type: "EXPENSE", description: "Superindo Grocery", categoryId: "ce3" },           // Belanja
  { amount: 35000, type: "EXPENSE", description: "Netflix Subscription", categoryId: "ce5" },         // Hiburan
  { amount: 500000, type: "INCOME", description: "Freelance Payment", categoryId: "ci2" },            // Freelance
];

export function scanReceipt(): Promise<OCRResult> {
  return new Promise((resolve) => {
    const receipt = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
    setTimeout(() => {
      resolve({ ...receipt, date: new Date() });
    }, 1500);
  });
}
