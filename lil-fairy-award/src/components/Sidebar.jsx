import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/classes', label: 'Classes' },
    { path: '/award', label: 'Award System' },
    { path: '/games', label: 'Game Center' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="user-avatar" style={{ fontSize: '2rem' }}>
          {user.avatar}
        </div>
        <div className="user-info">
          <h3>{user.displayName}</h3>
          <p>{user.email}</p>
        </div>
      </div>
      
      <nav className="nav-menu">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;