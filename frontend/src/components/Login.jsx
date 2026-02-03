import { useState } from 'react';
import PasswordField from './reusables/PasswordField';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginSchema } from '../../../shared/schemas/login.schema';
import FormField from './reusables/FormField';
import { tr } from 'zod/v4/locales';
import { useAuth } from '../auth/AuthContext';

const Login = ({ setShowLoginForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

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

  async function handleLogin (e) {
    setErrors({});

    try {
      e.preventDefault();

      // Validate before sending request
      const validationResult = loginSchema.safeParse({
        email,
        password,
      });

      if (!validationResult.success) {
        const treeifiedErrors = z.treeifyError(validationResult.error);

        setErrors(mapZodErrors(treeifiedErrors));
        return;
      }

      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
        })
      });

      const responseData = await response.json();

      if (response.status === 400) {
        const mappedErrors = mapZodErrors(responseData.errors);
        setErrors(mappedErrors);
        return;
      }

      if (response.status !== 200) {
        const message = responseData.message;
        setError(message);
      }

      if (response.status === 200) {
        const message = responseData.message;
        setMessage(message);
        login();
        navigate('/home');
      }
    } catch (error) {
      console.error('Error while logging in:', error);
    }
  }

  return (
    <form 
      className='auth-container'
      onSubmit={(e) => handleLogin(e)}
    >
      <h1 className='text-xl my-4'>Welcome back!</h1>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p className='text-red-500 text-sm mt-1 mr-auto'>{error}</p>
      )}

      <div className='auth-form-inputs'>
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
      </div>

      <div className='p-2'>
        <input 
          className='mb-2 cursor-pointer p-2 w-full bg-cyan-600 text-white rounded-lg'
          type='submit'
          value={'Sign in'}
        />
      </div>

      <p className='mb-4'>
        Don't have an account yet? 
        <span 
          onClick={() => setShowLoginForm(false)}
          className='ml-2 text-blue-500 cursor-pointer'>
            Let's make an account!</span>
      </p>
    </form>
  );
}

export default Login