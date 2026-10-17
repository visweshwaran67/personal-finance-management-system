import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  Calculator,
  Clock,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import SummaryCard from '../components/SummaryCard';
import SpendingChart from '../components/SpendingChart';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { formatINR } from '../utils/currency';
import { formatDisplayDate, compareExpensesByDateDesc } from '../utils/date';

export const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

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
        averageExpense: '₹0.00',
        mostRecentText: 'None recorded',
        mostRecentSub: 'No recent expenses',
      };
    }

    const count = expenses.length;
    const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const average = count > 0 ? total / count : 0;

    // Find most recent expense by date
    const sorted = [...expenses].sort(compareExpensesByDateDesc);
    const latest = sorted[0];

    return {
      totalExpenses: formatINR(total),
      count,
      averageExpense: formatINR(average),
      mostRecentText: latest ? formatINR(latest.amount) : 'None',
      mostRecentSub: latest ? `${latest.description} (${formatDisplayDate(latest.date)})` : 'No recent expenses',
    };
  }, [expenses]);

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

      {/* Top Action Bar */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Financial Summary</h2>
          <p className="section-subtitle">Real-time breakdown of your expenditures</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchExpenses}
            className="btn btn-secondary"
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} />
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
          title="Number of Transactions"
          value={summaryMetrics.count}
          subtext="Recorded expense items"
          icon={Receipt}
          color="blue"
        />

        <SummaryCard
          title="Average Expense"
          value={summaryMetrics.averageExpense}
          subtext="Per-transaction average"
          icon={Calculator}
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

      {/* Spending Over Time Visualization */}
      <SpendingChart expenses={expenses} />

      {/* Recent Transactions Section */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Recent Transactions</h3>
            <p className="section-subtitle">Your latest 5 expense activities</p>
          </div>
          {expenses.length > 5 && (
            <Link
              to="/expenses"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
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
