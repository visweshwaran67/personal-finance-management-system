import axiosInstance from './axiosInstance';

/**
 * Expense Management API Service
 */
export const expenseApi = {
  /**
   * Fetch all expenses for the authenticated user.
   * Calls GET /api/expenses
   *
   * @returns {Promise<Array<{ id: number, amount: number, date: string, description: string }>>}
   */
  async getAllExpenses() {
    const response = await axiosInstance.get('/api/expenses');
    return response.data;
  },

  /**
   * Fetch an individual expense by ID.
   * Calls GET /api/expenses/{id}
   *
   * @param {number|string} id
   * @returns {Promise<{ id: number, amount: number, date: string, description: string }>}
   */
  async getExpenseById(id) {
    const response = await axiosInstance.get(`/api/expenses/${id}`);
    return response.data;
  },

  /**
   * Create a new expense.
   * Calls POST /api/expenses
   *
   * @param {{ amount: number|string, date: string, description: string }} expenseData
   * @returns {Promise<{ id: number, amount: number, date: string, description: string }>}
   */
  async createExpense(expenseData) {
    const response = await axiosInstance.post('/api/expenses', expenseData);
    return response.data;
  },

  /**
   * Update an existing expense.
   * Calls PUT /api/expenses/{id}
   *
   * @param {number|string} id
   * @param {{ amount: number|string, date: string, description: string }} expenseData
   * @returns {Promise<{ id: number, amount: number, date: string, description: string }>}
   */
  async updateExpense(id, expenseData) {
    const response = await axiosInstance.put(`/api/expenses/${id}`, expenseData);
    return response.data;
  },

  /**
   * Delete an expense by ID.
   * Calls DELETE /api/expenses/{id}
   *
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteExpense(id) {
    const response = await axiosInstance.delete(`/api/expenses/${id}`);
    return response.data;
  },
};
