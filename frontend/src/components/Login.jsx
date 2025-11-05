import React from 'react'

const Login = () => {
  return (
    <div>
      <div className='flex justify-center min-h-screen items-center'>
        <div 
          className='text-center border rounded-lg space-y-2 w-96'
        >
          <div className='mt-2 p-2 space-y-2'>
            <div className='flex justify-between'>
              <label className='mr-2'>Email</label>
              <input 
                type='email'
                className='border rounded-lg px-2 py-1'
              />
            </div>

            <div className='flex justify-between'>
              <label className='mr-2'>Password</label>
              <input 
                type='password'
                className='border rounded-lg px-2 py-1'
              />
            </div>

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

export default Login