export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  categoryId?: string;
}
