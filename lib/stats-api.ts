// Types for the stats API responses
export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  monthlySales: number;
  monthlyRevenue: number;
}

export interface SalesByMonth {
  month: string;
  sales: number;
  revenue: number;
}

export interface RecentSale {
  id: number;
  total: number;
  customerName: string | null;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

// API functions for stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('http://localhost:8000/api/v1/stats/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

export async function fetchSalesByMonth(): Promise<SalesByMonth[]> {
  const response = await fetch('http://localhost:8000/api/v1/stats/sales-by-month');
  if (!response.ok) {
    throw new Error('Failed to fetch sales by month');
  }
  return response.json();
}

export async function fetchRecentSales(): Promise<RecentSale[]> {
  const response = await fetch('http://localhost:8000/api/v1/stats/recent-sales');
  if (!response.ok) {
    throw new Error('Failed to fetch recent sales');
  }
  return response.json();
}
