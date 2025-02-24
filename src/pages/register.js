import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    
    if (name === 'email') {
      setErrors({ ...errors, email: validateEmail(value) ? '' : 'Correo inválido' });
    }
    if (name === 'password') {
      setErrors({
        ...errors,
        password: validatePassword(value)
          ? ''
          : 'Debe tener al menos 8 caracteres, una mayúscula y un número'
      });
    }
    if (name === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: value === formData.password ? '' : 'Las contraseñas no coinciden'
      });
    }
  };

  const handleRegister = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: 'Correo inválido' });
      return;
    }
    if (!validatePassword(formData.password)) {
      setErrors({ ...errors, password: 'Debe tener al menos 8 caracteres, una mayúscula y un número' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, username: formData.username }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Registro exitoso');
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error en el servidor');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="card">
      <h4 className="title">REGISTRARSE</h4>
      <form>
      <label className="field" htmlFor="username">
          <span className="input-icon">👤</span>
          <input
            autoComplete="off"
            id="username"
            placeholder="Username"
            className={`input-field ${errors.username ? 'input-error' : ''}`}
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label className="field" htmlFor="email">
          <span className="input-icon">@</span>
          <input
            autoComplete="off"
            id="email"
            placeholder="Email"
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        {errors.email && <p className="error-message">{errors.email}</p>}

        <label className="field" htmlFor="password">
          <span className="input-icon">🔒</span>
          <input
            id="password"
            placeholder="Contraseña"
            className={`input-field ${errors.password ? 'input-error' : ''}`}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        {errors.password && <p className="error-message">{errors.password}</p>}

        <label className="field" htmlFor="confirmPassword">
          <span className="input-icon">🔒</span>
          <input
            id="confirmPassword"
            placeholder="Confirmar contraseña"
            className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </label>
        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}

        <button onClick={handleRegister} className="btn" type="button">Registrarse</button>
        <a onClick={handleBack} className="btn-link">Volver</a>
      </form>
    </div>
  );
};

export default Registro;
