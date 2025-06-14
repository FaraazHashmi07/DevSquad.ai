import React from 'react';

/**
 * Reusable Button component with different variants
 * @param {string} label - Button text
 * @param {function} onClick - Click handler
 * @param {string} variant - Button style (primary, secondary, danger)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {string} className - Additional CSS classes
 */
const Button = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  fullWidth = false,
  className = '' 
}) => {
  // Define variant styles
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };
  
  // Combine styles
  const buttonStyles = `
    px-4 py-2 rounded-md font-medium transition-colors
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${fullWidth ? 'w-full' : ''}
    ${variantStyles[variant] || variantStyles.primary}
    ${className}
  `;
  
  return (
    <button
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;