
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PermitOwnersDashboard from './owners/PermitOwnersDashboard';
import MailOwnersDashboard from './mailowners/MailOwnerDashboard';
import './permits.css';
import MailProvidersDashboard from './providers/ProvidersDash';
import ProductsDashboard from './Products/ProductsDashboard';
import DNMListDashboard from './DNMList/DNMListDashboard';
import SeedListDashboard from './Seeds/SeedsListDashboard';

const ComingSoon = ({ title, description }) => (
  <section className="card">
    <div className="card-header">
      <h2>{title}</h2>
    </div>

    <div className="text-center py-16 text-slate-500">
      <p className="font-medium">{description}</p>
      <p className="text-sm mt-1">This section is coming soon.</p>
    </div>
  </section>
);

const TABS = [
  {
    key: 'permit-owner',
    label: 'Permit Owner',
    render: () => <PermitOwnersDashboard />,
  },
  {
    key: 'mail-owners',
    label: 'Mail Owners',
    render: () => (
      <MailOwnersDashboard
        title="Mail Owners"
        description="Manage the mail owners tied to your CRIDs."
      />
    ),
  },
  {
    key: 'mail-providers',
    label: 'Mail Providers',
    render: () => (
      <MailProvidersDashboard
        title="Mail Providersd"
        description="Manage the mail providers."
      />
    ),
  },
  {
    key: 'products',
    label: 'Products',
    render: () => (
      <ProductsDashboard
        title="Products"
        description="Manage the mail products you offer."
      />
    ),
  },
  {
    key: 'suppress',
    label: 'Do Not Mail (Suppression) Lists',
    render: () => (
      <DNMListDashboard
        title="Do Not Mail (Suppression) Lists"
        description="Upload and manage suppression lists."
      />
    ),
  },
  {
    key: 'seeds',
    label: 'Seed Lists',
    render: () => (
      <SeedListDashboard
        title="Seed Lists"
        description="Manage seed lists for mail tracking."
      />
    ),
  },
];

const PermitDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const found = TABS.findIndex(
    (tab) => tab.key === searchParams.get('tab')
  );

  const selectedIndex = found === -1 ? 0 : found;

  const handleSelect = (index) => {
    const selectedTab = TABS[index];

    navigate(
      {
        pathname: '/permits',
        search: index === 0 ? '' : `?tab=${selectedTab.key}`,
      },
      { replace: true }
    );
  };

  return (
    <main className="dashboard mailing-dashboard-page">
      <header className="dashboard-header mailing-dashboard-header">
        <div>
          <span className="mailing-dashboard-eyebrow">
           PRESORT CONFIGURATION
          </span>
        </div>
      </header>

      <Tabs
        className="mailing-tabs"
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        forceRenderTabPanel={false}
      >
        <div className="mailing-tab-scroll">
          <TabList aria-label="Mailing setup sections">
            {TABS.map((tab) => (
              <Tab key={tab.key}>{tab.label}</Tab>
            ))}
          </TabList>
        </div>

        {TABS.map((tab) => (
          <TabPanel key={tab.key}>
            {tab.render()}
          </TabPanel>
        ))}
      </Tabs>
    </main>
  );
};

export default PermitDashboard;


// import React from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
// import PermitOwnersDashboard from './owners/PermitOwnersDashboard';
// import './permits.css';
// import { useAuth } from '../../../context/AuthContext';
// import MailOwnersDashboard from './mailowners/MailOwnerDashboard';

// // Swap each placeholder for its real component as you build them.
// const ComingSoon = ({ title, description }) => (
//   <section className="card">
//     <div className="card-header">
//       <h2>{title}</h2>
//     </div>
//     <div className="text-center py-16 text-slate-500">
//       <p className="font-medium">{description}</p>
//       <p className="text-sm mt-1">This section is coming soon.</p>
//     </div>
//   </section>
// );

// const TABS = [
//   { key: 'permit-owner', label: 'Permit Owner', render: () => <PermitOwnersDashboard /> },
//   {
//     key: 'mail-owners',
//     label: 'Mail Owners',
//     render: () => (
//       <MailOwnersDashboard title="Mail Owners" description="Manage the mail owners tied to your CRIDs." />
//     ),
//   },
//   {
//     key: 'mail-providers',
//     label: 'Mail Providers',
//     render: () => (
//       <ComingSoon title="Mail Providers" description="Manage mail service providers (MSPs)." />
//     ),
//   },
//   {
//     key: 'products',
//     label: 'Products',
//     render: () => (
//       <ComingSoon title="Products" description="Manage the mail products you offer." />
//     ),
//   },
//   {
//     key: 'do-not-mail',
//     label: 'Do Not Mail (Suppression) Lists',
//     render: () => (
//       <ComingSoon
//         title="Do Not Mail (Suppression) Lists"
//         description="Upload and manage suppression lists."
//       />
//     ),
//   },
//   {
//     key: 'seed-lists',
//     label: 'Seed Lists',
//     render: () => (
//       <ComingSoon title="Seed Lists" description="Manage seed lists for mail tracking." />
//     ),
//   },
// ];

// const PermitDashboard = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   // Keep the active tab in the URL so refresh / back button preserves it.
//   // Tabs stay visible on child routes (e.g. /permits/permit); the Permit Owner
//   // tab renders the child route itself via <Outlet /> / useOutlet().
//   const found = TABS.findIndex((t) => t.key === searchParams.get('tab'));
//   const selectedIndex = found === -1 ? 0 : found;

//   // Switching tabs always goes back to /permits, which also closes any open form
//   const handleSelect = (index) => {
//     navigate(
//       {
//         pathname: '/permits',
//         search: index === 0 ? '' : `?tab=${TABS[index].key}`,
//       },
//       { replace: true }
//     );
//   };

//   const {user} = useAuth()

//   console.log(user)
//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <div>
//           <h1>Mailing Setup</h1>
//           <p>Manage your USPS registrations, partners, products, and lists.</p>
//         </div>
//       </div>

//       <Tabs
//         className="mailing-tabs"
//         selectedIndex={selectedIndex}
//         onSelect={handleSelect}
//       >
//         <TabList>
//           {TABS.map((t) => (
//             <Tab key={t.key}>{t.label}</Tab>
//           ))}
//         </TabList>

//         {TABS.map((t) => (
//           <TabPanel key={t.key}>{t.render()}</TabPanel>
//         ))}
//       </Tabs>
//     </div>
//   );
// };

// export default PermitDashboard;