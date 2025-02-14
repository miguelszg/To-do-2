import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Ladingpage from "./ladingpage";
import Login from "./pages/login";
import Register from "./pages/register";
import MainLayout from "./layouts/MainLayout";


const RoutesComponent = () => {
  return (
      <Routes>
        <Route path="/" element={<Ladingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainLayout />} />
      </Routes>
  );
};

export default RoutesComponent;
