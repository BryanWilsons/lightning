import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';

export default function Layout() {
  const { mode } = useParams();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="app">
      <Header mode={mode} onMenuClick={() => setNavOpen((o) => !o)} />
      <div className="body">
        <Sidebar mode={mode} open={navOpen} />
        <main className="outlet" onClick={() => navOpen && setNavOpen(false)}>
          <div className="outlet-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}