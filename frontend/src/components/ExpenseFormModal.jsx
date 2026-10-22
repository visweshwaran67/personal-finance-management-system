import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { getTodayString } from '../utils/date';
import { PAYMENT_METHODS, isValidPaymentMethod } from '../utils/paymentMethod';

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  serverError = null,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: getTodayString(),
    paymentMethod: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        date: initialData.date || getTodayString(),
        paymentMethod: initialData.paymentMethod || '',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        date: getTodayString(),
        paymentMethod: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.amount === '' || formData.amount === null || formData.amount === undefined) {
      newErrors.amount = 'Amount is required';
    } else {
      const num = Number(formData.amount);
      if (isNaN(num) || num <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    } else if (!isValidPaymentMethod(formData.paymentMethod)) {
      newErrors.paymentMethod = 'Please choose a valid payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      description: formData.description.trim(),
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
    });
  };

  const isEditing = Boolean(initialData && initialData.id);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="expense-desc">
                Description <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="expense-desc"
                  type="text"
                  className={`form-control ${errors.description ? 'error' : ''}`}
                  placeholder="e.g. Groceries, Electricity bill, Lunch"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: null });
                  }}
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">
                Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  ₹
                </span>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  style={{ paddingLeft: '2.2rem' }}
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: null });
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                className={`form-control ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) setErrors({ ...errors, date: null });
                }}
                disabled={isSubmitting}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="expense-payment-method">
                Payment Method <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="expense-payment-method"
                className={`form-control ${errors.paymentMethod ? 'error' : ''}`}
                value={formData.paymentMethod}
                onChange={(e) => {
                  setFormData({ ...formData, paymentMethod: e.target.value });
                  if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: null });
                }}
                disabled={isSubmitting}
              >
                <option value="">-- Select Payment Method --</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && <span className="form-error">{errors.paymentMethod}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
