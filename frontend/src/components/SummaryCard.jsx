import React from 'react';

export const SummaryCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'emerald',
}) => {
  return (
    <div className="summary-card">
      <div className="summary-card-info">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-value">{value}</span>
        {subtext && <span className="summary-card-subtext">{subtext}</span>}
      </div>

      {Icon && (
        <div className={`summary-card-icon ${color}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
