import { useState } from 'react'
import Calendar from './components/Calendar';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Auth from './components/Auth';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/home",
        element: (
          <RequireAuth>
            <Calendar />
          </RequireAuth>
        ),
      },
    ],
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
