import React from 'react';
import { Pencil, Trash2, Calendar, FileText } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/date';

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
          <FileText size={28} />
        </div>
        <h4 className="empty-state-title">No Expenses Recorded</h4>
        <p className="empty-state-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '160px' }}>Date</th>
            <th>Description</th>
            <th style={{ textAlign: 'right', width: '160px' }}>Amount</th>
            <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
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
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                  {expense.description}
                </span>
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
  );
};

export default ExpenseTable;
