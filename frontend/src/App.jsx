import { useState } from 'react'
import Calendar from './components/Calendar';
import Login from './components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
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
