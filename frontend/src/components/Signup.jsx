import React from 'react'
import PasswordField from './reusables/PasswordField';
import { useState } from 'react';

const Signup = ({ setShowLoginForm }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Common onChange for input fields
  function inputChange (setField, e) {
    setField(e.target.value);
  }

  async function handleSignup () {
    try {
      // Confirm password verification
      if (password !== confirmPassword) {
        setMessage('Re-entered password must be correct.');
        return;
      }

      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName,
          email: email,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      const message = await response.json();

      if (response.status !== 200) {
        console.log('Error while signing up:', message);
      }
    } catch (error) {
      console.error('Error while signing up:', error);
    }
  }
  
  return (
    <div 
      className='auth-container'
    >
      <h1 className='text-xl my-4'>Let's make an account</h1>

      <div className='auth-form-inputs'>
        <div className='flex flex-col'>
          <label className='mr-auto'>Username</label>
          <input 
            type='string'
            className='border rounded-lg px-2 py-2'
            value={userName}
            onChange={(e) => inputChange(setUserName, e)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='mr-auto'>Email</label>
          <input 
            type='email'
            className='border rounded-lg px-2 py-2'
            value={email}
            onChange={(e) => inputChange(setEmail, e)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='mr-auto'>Password</label>
          <PasswordField 
            value={password}
            onChange={(e) => inputChange(setPassword, e)}
          />
        </div>

        <div className='flex flex-col'>
          <label className='mr-auto'>Re-enter Password</label>
          <PasswordField 
            value={confirmPassword}
            onChange={(e) => inputChange(setConfirmPassword, e)}
          />
        </div>

      </div>

      <div className='p-2'>
        <button
          className='mb-2 cursor-pointer p-2 w-full bg-cyan-600 text-white rounded-lg'
          onClick={handleSignup}
        >
          Sign up
        </button>
      </div>

      <p className='mb-4'>
        Already have an account? 
        <span 
          onClick={() => setShowLoginForm(true)}
          className='ml-2 text-blue-500 cursor-pointer'>
            Log back in!</span>
      </p>
    </div>
  );
}

export default Signup;