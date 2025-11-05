import React from 'react'

const Signup = () => {
  return (
    <div>
      <div className='flex justify-center min-h-screen items-center'>
        <div 
          className='text-center border rounded-lg space-y-2 w-96'
        >
          <div className='mt-2 grid grid-cols-2 gap-2'>
            <label className='mr-2'>Email</label>

            <label className='mr-2'>Password</label>
            
            <input 
              type='email'
              className='border'
            />

            <input 
              type='password'
              className='border'
            />
          </div>

          <button
            className='mb-2 cursor-pointer p-2 bg-blue-600 text-white rounded-lg'
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup