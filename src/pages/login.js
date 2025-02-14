import React from "react";
import { Navigate, useNavigate } from 'react-router-dom';


const Login = () => {
      const navigate = useNavigate();
    
    const handleLogin = () => {
      navigate('/main');
    };

    

    return <button onClick={handleLogin} className="button">
    Iniciar Sesión
  </button>;
};

export default Login;