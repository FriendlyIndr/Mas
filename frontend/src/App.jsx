import { useState } from 'react'
import Calendar from './components/Calendar';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Auth from './components/Auth';

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
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
