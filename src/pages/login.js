import React, { useState, useEffect } from 'react';
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
  
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role); 
      localStorage.setItem('username', data.username);
      console.log("username: ", data.username);
  
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

const Main = () => {
  const navigate = useNavigate();

  // Función para verificar si el token ha expirado
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificar el token
      const currentTime = Date.now() / 1000; // Obtener el tiempo actual en segundos

      if (decodedToken.exp < currentTime) {
        // Si el token ha expirado, elimínalo y redirige al login
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  // Verificar el token cada vez que se carga el componente
  useEffect(() => {
    checkTokenExpiration();
  }, []);

  const handleAddTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Task 1', description: 'Description', time: '2023-10-01', status: 'In Progress', category: 'Work' }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.message === 'Token expirado o inválido') {
          localStorage.removeItem('token');
          navigate('/login');
        }
        return;
      }

      console.log('Tarea añadida:', data);
    } catch (error) {
      console.error('Error al añadir tarea:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Main Page</h1>
      <button onClick={handleAddTask}>Añadir Tarea</button>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default Login ;