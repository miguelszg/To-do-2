import React from "react";
import Sidebar from "./sidebar";
import Dashboard from "./Dashboard";

const MainLayout = () => {
    return (
        <div className="dashboard">
          <Sidebar />
          <Dashboard />
        </div>
      );
};

export default MainLayout;