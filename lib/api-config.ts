export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  customers: `${API_BASE_URL}/customers`,
  users: `${API_BASE_URL}/users`,
  sales: `${API_BASE_URL}/sales`,
  invoices: `${API_BASE_URL}/invoices`,
  companies: `${API_BASE_URL}/companies`,
  taxes: `${API_BASE_URL}/taxes`,
  currencies: `${API_BASE_URL}/currencies`,
};
