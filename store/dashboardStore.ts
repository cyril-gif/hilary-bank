import { create } from 'zustand';

interface DashboardStats {
  totalBalance: number;
  availableBalance: number;
  ledgerBalance: number;
  monthlySpending: number;
  monthlyIncome: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient: string;
  date: Date;
  status: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
      
      set({ stats: data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
