import React from 'react';

function Card({ children, className = '', header, footer, padding = true }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
