import { NavLink } from 'react-router-dom';
import Icon from './Icon.js';
import { NAV } from '../nav.js';

export default function Sidebar({ mode, open,items }) {


  return (
    <nav className={'sidebar' + (open ? ' open' : '')}>
      <div className="nav-label">{mode === 'admin' ? 'Operations' : 'My account'}</div>
      {items?.map((item) => (
        <NavLink
          key={item.path}
          to={`/${mode}/${item.path}`}
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <Icon d={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}