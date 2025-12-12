import PasswordField from './reusables/PasswordField';

const Login = () => {

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
    </div>
  );
}

export default Login