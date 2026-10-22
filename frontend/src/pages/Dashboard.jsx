import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  Clock,
  CalendarDays,
  CalendarCheck,
  Calendar,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import { useAuth } from '../context/AuthContext';
import SummaryCard from '../components/SummaryCard';
import SpendingChart from '../components/SpendingChart';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { formatINR } from '../utils/currency';
import {
  formatDisplayDate,
  compareExpensesByDateDesc,
  getTodayString,
  isToday,
  getCurrentMonthName,
  getCurrentYearMonth,
} from '../utils/date';

export const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Selected date for date-wise tracking (defaults to today's local date)
  const [selectedDate, setSelectedDate] = useState(() => getTodayString());

  // Modal and action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete dialog state
  const [deleteExpenseItem, setDeleteExpenseItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await expenseApi.getAllExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.normalizedMessage || 'Failed to load expense records. Please try again.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Compute Summary Card Metrics based strictly on actual backend data
  const summaryMetrics = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        totalExpenses: '₹0.00',
        count: 0,
        thisMonthSpending: '₹0.00',
        thisMonthSub: `${getCurrentMonthName()} • 0 transactions`,
        mostRecentText: 'None recorded',
        mostRecentSub: 'No recent expenses',
      };
    }

    const count = expenses.length;
    const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Calculate This Month's Spending (current local calendar month and year)
    const currentYearMonth = getCurrentYearMonth();
    const thisMonthExpenses = expenses.filter(
      (item) => item.date && item.date.startsWith(currentYearMonth)
    );
    const thisMonthTotal = thisMonthExpenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const monthName = getCurrentMonthName();
    const thisMonthCount = thisMonthExpenses.length;
    const thisMonthSub = `${monthName} • ${thisMonthCount} ${thisMonthCount === 1 ? 'transaction' : 'transactions'}`;

    // Find most recent expense by date
    const sorted = [...expenses].sort(compareExpensesByDateDesc);
    const latest = sorted[0];

    return {
      totalExpenses: formatINR(total),
      count,
      thisMonthSpending: formatINR(thisMonthTotal),
      thisMonthSub,
      mostRecentText: latest ? formatINR(latest.amount) : 'None',
      mostRecentSub: latest ? `${latest.description} (${formatDisplayDate(latest.date)})` : 'No recent expenses',
    };
  }, [expenses]);

  // Derived Date-Wise Calculations
  const isSelectedDateToday = isToday(selectedDate);
  const selectedDateFormatted = formatDisplayDate(selectedDate);
  const selectedDateHeaderDisplay = isSelectedDateToday
    ? `Today, ${selectedDateFormatted}`
    : selectedDateFormatted;

  // Filter expenses strictly for the selected date, sorted newest first
  const selectedDateExpenses = useMemo(() => {
    return expenses
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [expenses, selectedDate]);

  // Sum of expenses for the selected date
  const selectedDateTotal = useMemo(() => {
    return selectedDateExpenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }, [selectedDateExpenses]);

  // Recent 5 expenses sorted by date descending
  const recentExpenses = useMemo(() => {
    return [...expenses].sort(compareExpensesByDateDesc).slice(0, 5);
  }, [expenses]);

  // Handle Add/Edit Form submission
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (selectedExpense && selectedExpense.id) {
        await expenseApi.updateExpense(selectedExpense.id, formData);
        showToast('Expense updated successfully!');
      } else {
        await expenseApi.createExpense(formData);
        showToast('Expense created successfully!');
      }
      setIsModalOpen(false);
      setSelectedExpense(null);
      await fetchExpenses();
    } catch (err) {
      setModalError(err.normalizedMessage || 'Failed to save expense. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteExpenseItem) return;
    setIsDeleting(true);
    try {
      await expenseApi.deleteExpense(deleteExpenseItem.id);
      showToast('Expense deleted successfully!');
      setDeleteExpenseItem(null);
      await fetchExpenses();
    } catch (err) {
      showToast(err.normalizedMessage || 'Failed to delete expense.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setSelectedExpense(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openAddModalForDate = (date) => {
    setSelectedExpense({ date });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setModalError(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading financial dashboard..." />;
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Top Welcome & Action Bar */}
      <div className="dashboard-welcome">
        <div>
          <h2 className="welcome-title">Welcome back, {user?.username || 'User'} 👋</h2>
          <p className="welcome-subtitle">Here is your financial snapshot and recent expenditures.</p>
        </div>
        <div className="dashboard-actions">
          <button
            onClick={fetchExpenses}
            className="btn btn-secondary"
            title="Refresh dashboard data"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={18} />
          <span>{fetchError}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Expenses"
          value={summaryMetrics.totalExpenses}
          subtext="Cumulative expenditure"
          icon={Wallet}
          color="emerald"
        />

        <SummaryCard
          title="This Month's Spending"
          value={summaryMetrics.thisMonthSpending}
          subtext={summaryMetrics.thisMonthSub}
          icon={CalendarDays}
          color="blue"
        />

        <SummaryCard
          title="Number of Transactions"
          value={summaryMetrics.count}
          subtext="Recorded expense items"
          icon={Receipt}
          color="amber"
        />

        <SummaryCard
          title="Most Recent Expense"
          value={summaryMetrics.mostRecentText}
          subtext={summaryMetrics.mostRecentSub}
          icon={Clock}
          color="navy"
        />
      </div>

      {/* Date-Wise Expense Tracking Section */}
      <div className="date-wise-wrapper">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              {isSelectedDateToday ? "Today's Expenses" : `Expenses for ${selectedDateFormatted}`}
            </h3>
            <p className="section-subtitle">
              {isSelectedDateToday
                ? `Today, ${selectedDateFormatted}`
                : `Showing expenses recorded on ${selectedDateFormatted}`}
            </p>
          </div>

          <div className="date-wise-controls">
            <div className="date-wise-input-group" title="Choose a date to track expenses">
              <Calendar size={15} color="var(--text-muted)" />
              <input
                type="date"
                className="date-wise-date-input"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                aria-label="Filter expenses by date"
              />
            </div>

            <button
              type="button"
              className={`btn ${isSelectedDateToday ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
              onClick={() => setSelectedDate(getTodayString())}
              title="Return to today's date"
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
              onClick={() => openAddModalForDate(selectedDate)}
              title={`Add new expense for ${selectedDateFormatted}`}
            >
              <PlusCircle size={14} />
              <span>Add for Date</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Expense List & Total for Selected Day */}
        <div className="date-wise-container">
          {/* Left Column: Date-Specific Expense Table or Empty State */}
          <div className="date-wise-list">
            {selectedDateExpenses.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                }}
              >
                <div className="empty-state-icon">
                  <Calendar size={26} />
                </div>
                <h4 className="empty-state-title">No expenses recorded for this date</h4>
                <p className="empty-state-text">
                  No transactions were logged for <strong>{selectedDateHeaderDisplay}</strong>. You can record a new transaction or view today's expenses.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => openAddModalForDate(selectedDate)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Add Expense for {selectedDateFormatted}</span>
                  </button>
                  {!isSelectedDateToday && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(getTodayString())}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Return to Today's Expenses
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ExpenseTable
                expenses={selectedDateExpenses}
                onEdit={openEditModal}
                onDelete={(item) => setDeleteExpenseItem(item)}
              />
            )}
          </div>

          {/* Right Column: Total for Selected Day Summary Card */}
          <div className="date-wise-summary">
            <div className="date-wise-summary-card">
              <div className="date-wise-summary-top">
                <div>
                  <span className="summary-card-title">Total for Selected Day</span>
                  <div className="date-wise-amount">{formatINR(selectedDateTotal)}</div>
                </div>
                <div className="summary-card-icon emerald">
                  <CalendarCheck size={20} />
                </div>
              </div>

              <div className="date-wise-meta">
                <div className="date-wise-meta-row">
                  <span className="date-wise-meta-label">
                    <Calendar size={14} />
                    <span>Selected Date</span>
                  </span>
                  <span className="date-wise-meta-value">{selectedDateHeaderDisplay}</span>
                </div>

                <div className="date-wise-meta-row">
                  <span className="date-wise-meta-label">
                    <Receipt size={14} />
                    <span>Transactions</span>
                  </span>
                  <span className="date-wise-meta-value">
                    {selectedDateExpenses.length} {selectedDateExpenses.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem', marginTop: '0.25rem' }}
                onClick={() => openAddModalForDate(selectedDate)}
              >
                <PlusCircle size={14} />
                <span>Add Expense for Date</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Over Time Visualization */}
      <SpendingChart expenses={expenses} />

      {/* Recent Transactions Section */}
      <div style={{ marginTop: '2.25rem' }}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Recent Transactions</h3>
            <p className="section-subtitle">Your latest 5 expense activities</p>
          </div>
          {expenses.length > 5 && (
            <Link
              to="/expenses"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem', gap: '0.4rem' }}
            >
              <span>View All Expenses</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <ExpenseTable
          expenses={recentExpenses}
          onEdit={openEditModal}
          onDelete={(item) => setDeleteExpenseItem(item)}
          emptyMessage="No recent transactions to display. Click 'Add Expense' above to log your first transaction."
        />
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedExpense}
        isSubmitting={isSubmitting}
        serverError={modalError}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteExpenseItem)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This will permanently remove it from your account and update your dashboard totals."
        itemDescription={deleteExpenseItem ? `${deleteExpenseItem.description} (${formatINR(deleteExpenseItem.amount)})` : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteExpenseItem(null)}
        isConfirming={isDeleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default Dashboard;
