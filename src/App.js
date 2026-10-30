import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Icon, { ICONS } from './components/Icon';
import './App.css';
import { useAuth } from './context/AuthContext';
import Logo from './Assets/image1_5a7hECYB (1).jpg';
import ForgotPassword from './pages/Forgot';
// Pages
import ClientOverview from './pages/client/Overview';
import ClientTrack from './pages/client/Track';
import ClientPickups from './pages/client/Pickups';
import ClientAddresses from './pages/client/Addresses';
import ClientBilling from './pages/client/Billing';
import ClientSupport from './pages/client/Support';
import ClientInformed from './pages/informed/InformedDash';
import NewCampaignForm from './pages/informed/InformedDataForm';
import Login from './pages/Login';
import { CampaignsProvider } from './context/CampaignContext';
import SetupBanner from './Helpers/SetupBanner';
import CompanySettings from './pages/client/company/CompanySettings';
import CreateClientAccount from './pages/CreatAccount';
import VerifyEmail from './pages/VerifyEmail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PermitOwner from './pages/client/Permits/owners/PermitOwner';
import PermitDashboard from './pages/client/Permits/PermitDashboard'
import NewMailOwner from './pages/client/Permits/mailowners/NewMailOwner'
import NewProvider from './pages/client/Permits/providers/NewProvider';
import ProductsDashboard from './pages/client/Permits/Products/ProductsDashboard';
import Product from './pages/client/Permits/Products/Product';


// Navigation config
const NAV = {
  client: [
    {
      path: '/',
      label: 'Dashboard',
      icon: ICONS.home,
      C: ClientOverview,
    },
    {
      path: '/permits',
      label: 'List Processing',
      icon: ICONS.files,
      children: [
        {
          path: '/permits/submit-job',
          label: 'Submit New Job',
        },
        {
          path: '/permits/completed-jobs',
          label: 'Completed Jobs',
        },
        {
          path: '/permits',
          label: 'Mail Setting',
        },
      ],
    },
    {
      path: '/informed',
      label: 'Informed Delivery',
      icon: ICONS.life,
      C: ClientInformed,
    },
  ],
};

function AppLayout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
const [listProcessingOpen, setListProcessingOpen] = useState(
  location.pathname.startsWith('/permits')
);
  const items = NAV.client;
  const currentPath = location.pathname;

  function toggleNav() {
    setNavOpen((open) => !open);
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
<>
    <div className="app">
      
      {/* HEADER */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="menu-btn" onClick={toggleNav} aria-label="Toggle navigation">
            <Icon d={ICONS.menu} />
          </button>

        <div className="brand" style={{overflow:'hidden',zIndex:-'1020'}}>

<img
  src={Logo}
  alt="Lightning Presort"
 style={{ height: 100, width: 'auto', display: 'block' }}
/>
</div>
        </div>

        <div className="header-right">
          <div className="user-chip">
            <div className="avatar">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </div>
            <span>{user?.name || user?.email || 'User'}</span>
          </div>

          <button onClick={handleLogout} style={{ marginLeft: 12 }}>
            Logout
          </button>
        </div>
      </header>

      <div className="body">
        {/* SIDEBAR */}
      <nav className={`sidebar${navOpen ? ' open' : ''}`}>
  <div className="nav-label">My account</div>

  {items.map((it) => {
    const hasChildren = Boolean(it.children?.length);

    const isActive = hasChildren
      ? currentPath.startsWith(it.path)
      : it.path === '/'
        ? currentPath === '/'
        : currentPath.startsWith(it.path);

    const [unused] = [];

    return (
      <div className="nav-group" key={it.path}>
        <button
          className={`nav-item${isActive ? ' active' : ''}`}
          onClick={() => {
            if (hasChildren) {
              setListProcessingOpen((open) => !open);
            } else {
              navigate(it.path);
              setNavOpen(false);
            }
          }}
        >
          <Icon d={it.icon} />
          <span>{it.label}</span>

          {hasChildren && (
            <Icon
              d={listProcessingOpen ? ICONS.chevronDown : ICONS.chevronRight}
            />
          )}
        </button>

        {hasChildren && listProcessingOpen && (
          <div className="nav-submenu">
            {it.children.map((child) => (
              <button
                key={child.path}
                className={`nav-item nav-subitem${
                  currentPath === child.path ? ' active' : ''
                }`}
                onClick={() => {
                  navigate(child.path);
                  setNavOpen(false);
                }}
              >
                <span>{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  })}
</nav>
       






  
    
   

        {/* PAGE CONTENT */}
        <main className="outlet">
      
          <div className="outlet-inner">
              <SetupBanner />          {/* ← add this line */}
            <Routes>
              {/* Public-ish / default */}
              <Route path="/" element={<ClientOverview />} />
              <Route path="/track" element={<ClientTrack />} />
              <Route path="/pickups" element={<ClientPickups />} />
              <Route path="/addresses" element={<ClientAddresses />} />
              <Route path="/billing" element={<ClientBilling />} />
              <Route path="/support" element={<ClientSupport />} />
              <Route path="/company/settings" element={<CompanySettings />} />
            

              {/* Nested Informed routes */}
              <Route
                path="/informed"
                element={
                  <CampaignsProvider>
                    <ClientInformed />
                  </CampaignsProvider>
                }
              >
                <Route path="new" element={<NewCampaignForm />} />
                <Route path=":id/edit" element={<NewCampaignForm />} />
              </Route>

   <Route path="/permits" element={<PermitDashboard />}>
    <Route path="owner" element={<NewMailOwner />}/>
      <Route path="owner/:id" element={<NewMailOwner />}/>

        <Route path="permit/:id" element={<PermitOwner />}/>
     <Route path="permit" element={<PermitOwner />} />

  <Route path="provider/:id" element={<NewProvider />}/>
     <Route path="provider" element={<NewProvider />} />

 <Route path="product" element={<Product />}/>
<Route path="product/:id" element={<Product />}/>
   </Route>
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
         
        </main>
      </div>
    </div>

      </>

  );
}
// -------------------------
// Main App
// -------------------------
export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading…</div>;
  }

  return (

    <BrowserRouter>
<ToastContainer 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="colored"
      />
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
          <Route
          path="/create-account"
          element={isAuthenticated ? <Navigate to="/create-account" replace /> : <CreateClientAccount />}
        />
       <Route path="/verify" element={<VerifyEmail />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Everything else is protected */}
        <Route
          path="/*"
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
   
    </BrowserRouter>
  
  );
}




