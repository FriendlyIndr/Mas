import PasswordField from './reusables/PasswordField';

const Login = ({ setShowLoginForm }) => {

  return (
    <div 
      className='auth-container'
    >
      <h1 className='text-xl my-4'>Welcome back!</h1>

      <div className='auth-form-inputs'>
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

      </div>

      <div className='p-2'>
        <button
          className='mb-2 cursor-pointer p-2 w-full bg-cyan-600 text-white rounded-lg'
        >
          Sign in
        </button>
      </div>

      <p className='mb-4'>
        Don't have an account yet? 
        <span 
          onClick={() => setShowLoginForm(false)}
          className='ml-2 text-blue-500 cursor-pointer'>
            Let's make an account!</span>
      </p>
    </div>
  );
}

export default Login