import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { formatINR } from '../utils/currency';

export const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete State
  const [deleteExpenseItem, setDeleteExpenseItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
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
      setFetchError(err.normalizedMessage || 'Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Filtered & Sorted list
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search by description
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((item) =>
        (item.description || '').toLowerCase().includes(term)
      );
    }

    // Filter by start date
    if (startDate) {
      result = result.filter((item) => item.date && item.date >= startDate);
    }

    // Filter by end date
    if (endDate) {
      result = result.filter((item) => item.date && item.date <= endDate);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const diff = new Date(b.date || 0) - new Date(a.date || 0);
        return diff !== 0 ? diff : (b.id || 0) - (a.id || 0);
      }
      if (sortBy === 'date-asc') {
        const diff = new Date(a.date || 0) - new Date(b.date || 0);
        return diff !== 0 ? diff : (a.id || 0) - (b.id || 0);
      }
      if (sortBy === 'amount-desc') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      if (sortBy === 'amount-asc') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return 0;
    });

    return result;
  }, [expenses, searchTerm, startDate, endDate, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  // Filtered sum calculation
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpenses]);

  // Handle Add / Edit Submission
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

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const hasActiveFilters = Boolean(searchTerm || startDate || endDate || sortBy !== 'date-desc');

  if (loading) {
    return <LoadingSpinner message="Loading expense management..." />;
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

      {/* Header and Add Action */}
      <div className="section-header">
        <div>
          <h2 className="section-title">All Expenses</h2>
          <p className="section-subtitle">
            Showing {filteredExpenses.length} of {expenses.length} total recorded items
            {hasActiveFilters && ` • Filtered Total: ${formatINR(filteredTotal)}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchExpenses} className="btn btn-secondary" title="Refresh data">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setSelectedExpense(null);
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
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

      {/* Filter and Search Controls Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Search by Description */}
          <div style={{ position: 'relative' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Start Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '40px' }}>
              From:
            </span>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Filter from start date"
            />
          </div>

          {/* End Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '25px' }}>
              To:
            </span>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Filter up to end date"
            />
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '35px' }}>
              Sort:
            </span>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
            <button
              onClick={clearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                color: 'var(--danger)',
                fontWeight: 600,
              }}
            >
              <X size={14} />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Expense Table */}
      <ExpenseTable
        expenses={paginatedExpenses}
        onEdit={(item) => {
          setSelectedExpense(item);
          setModalError(null);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setDeleteExpenseItem(item)}
        emptyMessage={
          hasActiveFilters
            ? 'No expenses matched your filter criteria. Try resetting filters.'
            : 'No expenses have been recorded yet. Click "Add Expense" to get started!'
        }
      />

      {/* Pagination Controls */}
      {filteredExpenses.length > itemsPerPage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            padding: '0.5rem 0',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages} ({filteredExpenses.length} total)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
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
        message="Are you sure you want to delete this expense record? This action will permanently remove it from your account."
        itemDescription={deleteExpenseItem ? `${deleteExpenseItem.description} (${formatINR(deleteExpenseItem.amount)})` : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteExpenseItem(null)}
        isConfirming={isDeleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default Expenses;
