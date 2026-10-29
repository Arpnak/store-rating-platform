import apiClient from "./client";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getMe: () => apiClient.get("/auth/me"),
  changePassword: (data) => apiClient.patch("/auth/change-password", data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  listUsers: (filters = {}) => apiClient.get("/admin/users", { params: filters }),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (userData) => apiClient.post("/admin/users", userData),
  createStore: (storeData) => apiClient.post("/admin/stores", storeData),
};

// ─── Stores ───────────────────────────────────────────────────────────────────
export const storeApi = {
  listStores: (filters = {}) => apiClient.get("/stores", { params: filters }),
  getMyStore: () => apiClient.get("/stores/my-store"),
};

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const ratingApi = {
  submitRating: (data) => apiClient.post("/ratings", data),
  updateRating: (storeId, data) => apiClient.patch(`/ratings/${storeId}`, data),
};
