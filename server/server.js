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

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso no autorizado' });
  }

  jwt.verify(token, 'password1212', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token expirado o inválido' });
    }
    req.user = user;
    next();
  });
};

app.use('/add-task', authenticateToken);


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

   
    await User.updateOne({ _id: user._id }, { last_login: new Date() });

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      userId: user._id ? user._id.toString() : null 
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const taskCollection = mongoose.connection.collection('TASK');
    const tasks = await taskCollection.find({ userId }).toArray();

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tareas' });
  }
});



//Añadir tarea
app.post('/add-task', async (req, res) => {
  const { name, description, time, status, category, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Falta el userId' });
  }

  try {
    const taskCollection = mongoose.connection.collection('TASK');

    const newTask = {
      userId, 
      name_task: name,
      description,
      dead_line: time,
      status: status === 'In Progress' ? '1' : status === 'Done' ? '2' : status === 'Paused' ? '3' : '4',
      category,
    };

    await taskCollection.insertOne(newTask);

    // Realiza un select para obtener todas las tareas después de insertar
    const tasks = await taskCollection.find({ userId }).toArray();

    console.log('Tareas obtenidas:', tasks); // Agrega este log

    res.json({ success: true, message: 'Tarea añadida correctamente', tasks });
  } catch (error) {
    console.error('Error al añadir tarea:', error);
    res.status(500).json({ success: false, message: 'Error al añadir la tarea', error });
  }
});




app.patch('/update-task/:taskId', authenticateToken, async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Falta el nuevo estado' });
  }

  // Mapeo de estados
  const statusMap = {
    'In Progress': '1',
    'Done': '2',
    'Paused': '3',
    'Revision': '4',
  };

  const mappedStatus = statusMap[status] || '1'; // Default 'In Progress'

  try {
    const taskCollection = mongoose.connection.collection('TASK');
    const result = await taskCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(taskId) },
      { $set: { status: mappedStatus } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o no se realizó ningún cambio' });
    }

    res.json({ success: true, message: 'Estado de tarea actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar tarea' });
  }
});

app.delete('/delete-task/:taskId', authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  try {
    const taskCollection = mongoose.connection.collection('TASK');
    const result = await taskCollection.deleteOne({ _id: new mongoose.Types.ObjectId(taskId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    res.json({ success: true, message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar tarea' });
  }
});


app.get('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const taskCollection = mongoose.connection.collection('TASK');
    const tasks = await taskCollection.find({ userId }).toArray();

    const groupedTasks = {
      inProgress: tasks.filter(task => task.status === '1'),
      done: tasks.filter(task => task.status === '2'),
      paused: tasks.filter(task => task.status === '3'),
      revision: tasks.filter(task => task.status === '4')
    };

    res.json({ success: true, tasks: groupedTasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tareas' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🟢 Servidor corriendo en http://localhost:${PORT}');
});