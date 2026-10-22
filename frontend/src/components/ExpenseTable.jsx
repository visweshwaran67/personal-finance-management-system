import React from 'react';
import { Pencil, Trash2, Calendar, FileText, Smartphone, Banknote, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/date';
import { formatPaymentMethod } from '../utils/paymentMethod';

export const ExpenseTable = ({
  expenses = [],
  onEdit,
  onDelete,
  emptyMessage = 'No expenses found matching the criteria.',
}) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <FileText size={26} />
        </div>
        <h4 className="empty-state-title">No Expenses Recorded</h4>
        <p className="empty-state-text">{emptyMessage}</p>
      </div>
    );
  }

  const renderPaymentMethodBadge = (paymentMethod) => {
    if (paymentMethod === 'GPAY_UPI') {
      return (
        <span className="badge badge-gpay" title="Paid via GPay / UPI">
          <Smartphone size={12} />
          <span>GPay / UPI</span>
        </span>
      );
    }
    if (paymentMethod === 'CASH') {
      return (
        <span className="badge badge-cash" title="Paid via Cash">
          <Banknote size={12} />
          <span>Cash</span>
        </span>
      );
    }
    return (
      <span
        className="badge badge-muted"
        title="Payment method not specified (historical record)"
        style={{ fontStyle: 'italic', fontWeight: 500 }}
      >
        <HelpCircle size={12} />
        <span>{formatPaymentMethod(paymentMethod)}</span>
      </span>
    );
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="table-container expense-table-desktop">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Date</th>
              <th>Description</th>
              <th style={{ width: '150px' }}>Payment Method</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Amount</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {formatDisplayDate(expense.date)}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {expense.description}
                  </span>
                </td>
                <td>
                  {renderPaymentMethodBadge(expense.paymentMethod)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="amount-cell">
                    {formatINR(expense.amount)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => onEdit(expense)}
                      className="btn-icon"
                      title="Edit Expense"
                      aria-label={`Edit ${expense.description}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="btn-icon danger"
                      title="Delete Expense"
                      aria-label={`Delete ${expense.description}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown below 640px) */}
      <div className="expense-cards-mobile" role="list" aria-label="Expenses list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-mobile-card" role="listitem">
            <div className="expense-mobile-header">
              <span className="expense-mobile-desc">{expense.description}</span>
              <span className="expense-mobile-amount">{formatINR(expense.amount)}</span>
            </div>

            <div className="expense-mobile-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>{formatDisplayDate(expense.date)}</span>
              </div>
              <div>{renderPaymentMethodBadge(expense.paymentMethod)}</div>
            </div>

            <div className="expense-mobile-actions">
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                onClick={() => onEdit(expense)}
                aria-label={`Edit ${expense.description}`}
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  gap: '0.35rem',
                  color: 'var(--danger)',
                  borderColor: 'var(--danger-border)',
                }}
                onClick={() => onDelete(expense)}
                aria-label={`Delete ${expense.description}`}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ExpenseTable;
