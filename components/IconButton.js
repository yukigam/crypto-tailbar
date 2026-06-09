'use client';
import React from 'react';

const IconButton = ({ children, onClick, style, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`modern-button ${className || ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #0a7c4e 0%, #12a868 100%)',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        outline: 'none',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
