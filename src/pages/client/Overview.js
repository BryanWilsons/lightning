import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { clientTracking } from '../../data/Mock.js';
import './Overview.css';


export default function ClientOverview() {
 const { user } = useAuth();

  // Placeholder data – replace with real API data later
  const stats = [
     { label: 'Postage Savings', value: '48,290', change: '+12.4%', positive: true },
    { label: 'Active Presorts', value: '3', change: '+2 this week', positive: true },
   
    { label: 'Active Campaigns', value: '1', change: '', positive: true },
    { label: 'Active Promtions', value: '2', change: '', positive: false },
  ];

  const recentCampaigns = [
    { id: 1, name: 'Spring Promo – Informed Delivery', status: 'Active', pieces: '12,400', date: 'Oct 2, 2026' },
    { id: 2, name: 'Q3 Retention Series', status: 'Completed', pieces: '8,920', date: 'Sep 18, 2026' },
    { id: 3, name: 'New Mover Welcome Kit', status: 'Scheduled', pieces: '5,100', date: 'Oct 15, 2026' },
    { id: 4, name: 'Holiday Early Bird', status: 'Draft', pieces: '—', date: '—' },
  ];

  const quickActions = [
    { label: 'Presort Mail List', path: '/', primary: true },
    { label: 'New Informed Delivery Campaigns', path: '/informed/new' },
    { label: 'New USPS Promotion', path: '/' },
   
  ];

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p>Here’s what’s happening with your mail & Informed Delivery campaigns today.</p>
        </div>
        {/* <Link to="/informed/new" className="btn-primary">
          + New Campaign
        </Link> */}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Campaigns */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Campaigns</h2>
            <Link to="/informed" className="card-link">View all</Link>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Pieces</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="campaign-name">{c.name}</td>
                    <td>
                      <span className={`status-badge status-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.pieces}</td>
                    <td className="date">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + Tips */}
        <div className="side-column">
          <div className="card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className={`action-btn ${action.primary ? 'primary' : ''}`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card tip-card">
            <div className="tip-icon">💡</div>
            <h3>Pro Tip</h3>
            <p>
              Campaigns that include Informed Delivery ride-alongs typically see 
              <strong> 20–35% higher engagement</strong> than standard direct mail alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}