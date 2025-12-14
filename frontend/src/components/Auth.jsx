import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Login from './Login';
import Signup from './Signup';

const Auth = () => {
    const [showLoginForm, setShowLoginForm] = useState(true);

  return (
    <div className='flex justify-center min-h-screen items-center bg-linear-60 from-cyan-800 to-teal-500'>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div layout transition={{ layout: { duration: 0.25, ease: 'easeOut' } }} className='overflow-hidden'>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auth;