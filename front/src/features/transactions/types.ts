export type Transaction = {
  id: string;
  date: string;
  category: string;
  amount: string;
  emoji: string;
  color: string;
  regular: boolean;
  period: string;
};
export type TransactionsResponse = {
  data: Transaction[];
  meta: { page: number; limit: number; total: number };
  groupTotals: Record<string, string>;
};
