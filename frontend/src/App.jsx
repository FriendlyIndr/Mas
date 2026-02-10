import { useState } from 'react'
import Calendar from './components/Calendar';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Auth from './components/Auth';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={"/home"} />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/home",
    element: <Calendar />,
  },
]);

function App() {

  return (
    <RouterProvider router={router}/>
  );
}

export default App
