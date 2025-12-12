import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
  // State variable for password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div>
      <div className='flex justify-center min-h-screen items-center'>
        <div 
          className='text-center border rounded-lg space-y-2 w-96'
        >
          <h1 className='text-xl my-4'>Welcome back!</h1>

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
              <div className='flex items-center relative'>
                <input 
                  id='password'
                  type={passwordVisible ? 'text' : 'password'}
                  className='border rounded-lg px-2 py-2 pr-9 w-full'
                />
                <span className='absolute right-1 select-none' onClick={() => setPasswordVisible(!passwordVisible)}>
                  {passwordVisible 
                    ? <EyeOff className='w-6 h-6 text-gray-500 cursor-pointer'/>
                    : <Eye className='w-6 h-6 text-gray-500 cursor-pointer'/>
                  }
                </span>
              </div>
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