import React from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="sidebar">
      <ul className="menu">
        <li className="menu-item">
          <a href="#">Tareas</a>
        </li>
        <li className="menu-item">
          <a href="#">Calendario</a>
        </li>
        <li className="menu-item">
          <a href="#">Clases</a>
        </li>
      </ul>
      <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Sidebar;
