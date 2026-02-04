import React from 'react'
import FormField from './reusables/FormField';
import PasswordField from './reusables/PasswordField';
import { useState } from 'react';
import { signupSchema } from '../../../shared/schemas/signup.schema';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setShowLoginForm }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // Common onChange for input fields
  function inputChange (setField, e) {
    setField(e.target.value);
  }

  // Flatten zod errors to match frontend errors structure
  function mapZodErrors(treeifiedErrors) {
    const flatErrors = {};

    if (treeifiedErrors?.properties) {
      for (const [field, fieldError] of Object.entries(treeifiedErrors.properties)) {
        if (fieldError?.errors?.length) {
          flatErrors[field] = fieldError.errors[0]; // take first message
        }
      }
    }

    return flatErrors;
  }

  async function handleSignup (e) {
    try {
      e.preventDefault();

      // Validate before sending request
      const validationResult = signupSchema.safeParse({
        userName,
        email,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const treeifiedErrors = z.treeifyError(validationResult.error);

        setErrors(mapZodErrors(treeifiedErrors));
        return;
      }

      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName,
          email: email,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      const responseData = await response.json();

      if (response.status === 400) {
        const mappedErrors = mapZodErrors(responseData.errors);
        setErrors(mappedErrors);
        return;
      }

      if (response.status !== 201) {
        setErrors({
          email: responseData.message,
        });
        return;
      }

      if (response.status === 201) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error while signing up:', error);
    }
  }
  
  return (
    <form 
      className='auth-container'
      onSubmit={(e) => handleSignup(e)}
    >
      <h1 className='text-xl my-4'>Let's make an account</h1>

      <div className='auth-form-inputs'>
        <FormField
          label={"Username"}
          error={errors.userName}
        >
          <input 
            type='text'
            value={userName}
            onChange={(e) => inputChange(setUserName, e)}
          />
        </FormField>

        <FormField
          label={"Email"}
          error={errors.email}
        >
          <input 
            type='email'
            inputMode='email'
            name='email'
            value={email}
            onChange={(e) => inputChange(setEmail, e)}
          />
        </FormField>

        <FormField
          label={"Password"}
          error={errors.password}
        >
          <PasswordField 
            value={password}
            onChange={(e) => inputChange(setPassword, e)}
          />
        </FormField>

        <FormField
          label={"Re-enter Password"}
          error={errors.confirmPassword}
        >
          <PasswordField 
            value={confirmPassword}
            onChange={(e) => inputChange(setConfirmPassword, e)}
          />
        </FormField>

      </div>

      <div className='p-2'>
        <input
          className='mb-2 cursor-pointer p-2 w-full bg-cyan-600 text-white rounded-lg'
          type='submit'
          value={'Create Account'}
        />
      </div>

      <p className='mb-4'>
        Already have an account? 
        <span 
          onClick={() => setShowLoginForm(true)}
          className='ml-2 text-blue-500 cursor-pointer'>
            Log back in!</span>
      </p>
    </form>
  );
}

export default Signup;