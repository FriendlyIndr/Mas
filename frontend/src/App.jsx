import { useState } from 'react'
import Calendar from './components/Calendar';
import Login from './components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './components/Signup';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </>
  );
}

export default App
