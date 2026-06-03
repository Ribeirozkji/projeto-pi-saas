import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <Navbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
