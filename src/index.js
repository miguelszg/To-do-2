  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import './index.css';
  import { BrowserRouter, Route } from "react-router-dom";
  import RoutesComponent from './router';

  ReactDOM.createRoot(document.getElementById('root')).render(
      <BrowserRouter>
        <RoutesComponent />
      </BrowserRouter>
  );


