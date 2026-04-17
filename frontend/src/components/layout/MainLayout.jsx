import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10">
      <Navbar />
      <main className="pb-12">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
