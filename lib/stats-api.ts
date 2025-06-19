import { API_ENDPOINTS } from "./api-config";

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
  const response = await fetch(API_ENDPOINTS.stats.dashboard);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  const data = await response.json();
  console.log("[fetchDashboardStats] response:", data);
  // Si la respuesta tiene la propiedad dashboard, úsala, si no, usa el objeto completo
  if (data && data.dashboard) return data.dashboard;
  if (data && typeof data.totalProducts === "number") return data;
  throw new Error("Estructura inesperada en dashboard stats");
}

export async function fetchSalesByMonth(): Promise<SalesByMonth[]> {
  const response = await fetch(API_ENDPOINTS.stats.salesByMonth);
  if (!response.ok) {
    throw new Error("Failed to fetch sales by month");
  }
  const data = await response.json();
  console.log("[fetchSalesByMonth] response:", data);
  if (data && data.salesByMonth) return data.salesByMonth;
  if (Array.isArray(data)) return data;
  throw new Error("Estructura inesperada en sales by month");
}

export async function fetchRecentSales(): Promise<RecentSale[]> {
  const response = await fetch(API_ENDPOINTS.stats.recentSales);
  if (!response.ok) {
    throw new Error("Failed to fetch recent sales");
  }
  const data = await response.json();
  console.log("[fetchRecentSales] response:", data);
  if (data && data.recentSales) return data.recentSales;
  if (Array.isArray(data)) return data;
  throw new Error("Estructura inesperada en recent sales");
}
