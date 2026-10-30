import { useNavigate } from 'react-router-dom';
import Icon, { ICONS } from './Icon.js';

export default function Header({ mode, onMenuClick }) {
  const navigate = useNavigate();
  const user = mode === 'admin' 
    ? { initials: 'JA', name: 'J. Alvarez' } 
    : { initials: 'AR', name: 'Alex Rivera' };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle navigation">
          <Icon d={ICONS.menu} />
        </button>
        <div className="brand">
          <div className="brand-mark">
            <Icon d={ICONS.package} size={15} />
          </div>
          MailFlow         {/* ← change to whatever you actually want */}
        </div>
      </div>

      <div className="header-right">
        <div className="mode-switch">
          <button 
            className={mode === 'client' ? 'active' : ''} 
            onClick={() => navigate('/client/overview')}
          >
            Client
          </button>
          <button 
            className={mode === 'admin' ? 'active' : ''} 
            onClick={() => navigate('/admin/overview')}
          >
            Admin
          </button>
        </div>
        <div className="user-chip">
          <div className="avatar">{user.initials}</div>
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
}