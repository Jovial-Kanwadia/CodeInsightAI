import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/main.css'
import { ThemeProvider } from "@/components/theme/theme-provider"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/Layout'
import { SignIn } from '@/pages/auth/signin-page'
import { SignUp } from '@/pages/auth/signup-page'
import MainLayout from '@/pages/MainLayout'
import { store, persistor } from '@/app/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter([
  // Protected Routes are Layout and its childrens
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "",
        element: <MainLayout/>,
        children: [
          
        ]
      },
    ]
  },
  //Public Routes
  {
    path: "/sign-in",
    element: <SignIn/>
  },
  {
    path: "/sign-up",
    element: <SignUp/>
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router}/>
          <ToastContainer newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
