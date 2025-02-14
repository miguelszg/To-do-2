import React from 'react';
import './sidebar.css';

const Sidebar = () => {
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
    </div>
  );
};

export default Sidebar;
