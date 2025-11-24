import React from 'react';

export default function Button({ variant = 'primary', className = '', children, ...props }){
  const variants = {
    primary: 'bg-primary text-white hover:brightness-90',
    secondary: 'bg-secondary text-white hover:brightness-90',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    neutral: 'bg-gray-100 text-gray-800'
  };

  const cls = `px-4 py-2 rounded-md font-medium inline-flex items-center justify-center ${variants[variant] || variants.primary} ${className}`;

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
