import React from 'react';

const FormField = ({ label, error, children }) => {
  return (
    <div className='flex flex-col'>
        <label className='mr-auto'>{label}</label>

        {React.cloneElement(children, {
            className: `
                ${children.props.className || ''}
                border rounded-lg px-2 py-2
                ${error ? 'border-red-500' : 'border-gray-300'}
            `
        })}

        {error && (
            <p className='text-red-500 text-sm mt-1 mr-auto'>{error}</p>
        )}
    </div>
  );
};

export default FormField;