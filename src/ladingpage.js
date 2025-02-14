import React from 'react';
import './ladingpage.css';
import { Navigate, useNavigate } from 'react-router-dom';


const LandingPage = () => {
  const navigate = useNavigate();

const handleLogin = () => {
  navigate('/login');
};

const handleRegister = () => {
  navigate('/register');
};

  return (
    <div className="landing-page">
      
      <div className="card">
        <h1 className="title">
          Task Manager
        </h1>
        <p className="subtitle">
          Organiza tus tareas de manera eficiente.
        </p>

        <div className="mt-10">
          <button onClick={handleLogin} className="button">
            Inicia Sesión
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="register">
            ¿No tienes una cuenta?
            <a onClick={handleRegister} className="link">
              Regístrate Ahora
            </a>
          </p>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; Miguel Ángel Sánchez García Task Manager. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
