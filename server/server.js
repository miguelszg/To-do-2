require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const conectarDB = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

conectarDB();

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  last_login: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema, 'USERS');

// Ruta para registrar usuario con encriptación de contraseña
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

//Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'password1212', 
      { expiresIn: '10m' } 
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

//Añadir tarea
app.post('/add-task', async (req, res) => {
  const { name, description, time, status, category } = req.body;

  try {
    
    const taskCollection = mongoose.connection.collection('TASK');

    
    const newTask = {
      name_task: name,
      description: description,
      dead_line: time,
      status: status === 'In Progress' ? '1' : status === 'Done' ? '2' : status === 'Paused' ? '3' : '4', // Mapeo de status
      category: category,
    };

    
    await taskCollection.insertOne(newTask);

    
    res.json({ success: true, message: 'Tarea añadida correctamente' });
  } catch (error) {
    console.error('Error al añadir tarea:', error);
    res.status(500).json({ success: false, message: 'Error al añadir la tarea', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
