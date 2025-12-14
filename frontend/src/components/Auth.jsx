import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Login from './Login';
import Signup from './Signup';

const Auth = () => {
    const [showLoginForm, setShowLoginForm] = useState(true);

  return (
    <div className='flex justify-center min-h-screen items-center'>
      <AnimatePresence mode='wait'>
          {showLoginForm ? (
            <motion.div
              key='login'
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              transition={{ duration: 0.25 }}
            >
              <Login 
                setShowLoginForm={setShowLoginForm}
              />
            </motion.div>
          ) : (
            <motion.div
              key='signup'
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              transition={{ duration: 0.25 }}
            >
              <Signup 
                setShowLoginForm={setShowLoginForm}
              />
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;