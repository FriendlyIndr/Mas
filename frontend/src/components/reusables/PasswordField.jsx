import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const PasswordField = ({ passwordValue, onChange }) => {
  // State variable for password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className='flex items-center relative'>
        <input 
            id='password'
            type={passwordVisible ? 'text' : 'password'}
            className='border rounded-lg px-2 py-2 pr-9 w-full'
            value={passwordValue}
            onChange={onChange}
        />
        <span className='absolute right-1 select-none' onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible 
            ? <EyeOff className='w-6 h-6 text-gray-500 cursor-pointer'/>
            : <Eye className='w-6 h-6 text-gray-500 cursor-pointer'/>
            }
        </span>
    </div>
  )
}

export default PasswordField