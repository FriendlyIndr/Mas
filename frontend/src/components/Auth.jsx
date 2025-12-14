import React, { useState } from 'react'
import Login from './Login';
import Signup from './Signup';

const Auth = () => {
    const [showLoginForm, setShowLoginForm] = useState(true);

  return (
    <div>
        {showLoginForm ?
         <Login 
          setShowLoginForm={setShowLoginForm}
         /> : 
         <Signup 
          setShowLoginForm={setShowLoginForm}
         />}
    </div>
  );
};

export default Auth;