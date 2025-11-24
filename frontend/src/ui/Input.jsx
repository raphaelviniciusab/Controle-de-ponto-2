import React from 'react';

export default function Input({ label, ...props }){
  return (
    <div>
      {label && <label className="block text-sm text-gray-700 mb-1">{label}</label>}
      <input className="mt-1 p-2 border rounded w-full" {...props} />
    </div>
  );
}
