import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [mensajeServidor, setMensajeServidor] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      setErrors({ ...errors, email: validateEmail(value) ? '' : 'Correo inválido' });
    }
    if (name === 'password') {
      setErrors({ ...errors, password: value ? '' : 'La contraseña no puede estar vacía' });
    }
  };

  const handleLogin = async () => {
    setMensajeServidor('');

    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: 'Correo inválido' });
      return;
    }
    if (!formData.password) {
      setErrors({ ...errors, password: 'La contraseña no puede estar vacía' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setMensajeServidor(data.message);
        return;
      }

      navigate('/main');
    } catch (error) {
      setMensajeServidor('Error de conexión con el servidor');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="card">
      <h4 className="title">INICIAR SESIÓN</h4>
      <form>
        <label className={`field ${errors.email ? 'field-error' : ''}`} htmlFor="logemail">
          <span className="input-icon">@</span>
          <input
            autoComplete="off"
            id="logemail"
            placeholder="Email"
            className="input-field"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </label>

        <label className={`field ${errors.password ? 'field-error' : ''}`} htmlFor="logpass">
          <span className="input-icon">🔒</span>
          <input
            id="logpass"
            placeholder="Contraseña"
            className="input-field"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </label>

        {mensajeServidor && <div className="server-message">{mensajeServidor}</div>}

        <button
          onClick={handleLogin}
          className="btn"
          type="button"
          disabled={!validateEmail(formData.email) || !formData.password}
        >
          Login
        </button>

        <a onClick={handleBack} className="btn-link">Volver</a>
      </form>
    </div>
  );
};

export default Login;
