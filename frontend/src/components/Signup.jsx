import React from 'react'
import PasswordField from './reusables/PasswordField';

const Signup = () => {
  return (
    <div className='flex justify-center min-h-screen items-center'>
      <div 
        className='text-center border rounded-lg space-y-2 w-96'
      >
        <div className='mt-2 p-2 space-y-2'>
          <div className='flex flex-col'>
            <label className='mr-auto'>Email</label>
            <input 
              type='email'
              className='border rounded-lg px-2 py-2'
            />
          </div>

          <div className='flex flex-col'>
            <label className='mr-auto'>Password</label>
            <PasswordField />
          </div>

          <div className='flex flex-col'>
            <label className='mr-auto'>Re-enter Password</label>
            <PasswordField />
          </div>

        </div>

        <button
          className='mb-2 cursor-pointer p-2 bg-blue-600 text-white rounded-lg'
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

export default Signup