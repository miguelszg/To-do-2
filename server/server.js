require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const conectarDB = require('./db');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb'); 

const app = express();
app.use(express.json());
app.use(cors());

conectarDB();

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, default: '2' },
  password: { type: String, required: true },
  last_login: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema, 'USERS');

app.post('/register', async (req, res) => {
  const { username,email, password , role} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashea la contraseña
    const newUser = new User({ 
      username,
      email, 
      password: hashedPassword,
      role,
    });
    await newUser.save(); // Guarda el usuario en la base de datos
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
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
      { userId: user._id, email: user.email, role: user.role }, // Incluye el role en el token
      'password1212',
      { expiresIn: '10m' }
    );

    await User.updateOne({ _id: user._id }, { last_login: new Date() });

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      username: user.username,
      userId: user._id ? user._id.toString() : null,
      role: user.role, // Devuelve el role del usuario
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
  const { name, description, time, status, category, userId, groupId, assignedParticipants } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Falta el userId' });
  }

  try {
    const taskCollection = mongoose.connection.collection('TASK');

    // Obtener el username del creador de la tarea
    const creator = await User.findOne({ _id: userId });
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const newTask = {
      userId,
      name_task: name,
      description,
      dead_line: time,
      status: status === 'In Progress' ? '1' : status === 'Done' ? '2' : status === 'Paused' ? '3' : '4',
      category,
      groupId: groupId || null, // ID del grupo (opcional)
      createdBy: creator.username, // Username del creador
      assignedTo: assignedParticipants || [], // Usernames de los integrantes asignados
    };

    await taskCollection.insertOne(newTask);

    // Obtener todas las tareas del usuario
    const tasks = await taskCollection.find({ userId }).toArray();

    res.json({ success: true, message: 'Tarea añadida correctamente', tasks });
  } catch (error) {
    console.error('Error al añadir tarea:', error);
    res.status(500).json({ success: false, message: 'Error al añadir la tarea', error });
  }
});

//Obtener grupos
app.get('/groups', async (req, res) => {
  try {
    const groupCollection = mongoose.connection.collection('GROUPS');
    const groups = await groupCollection.find().toArray();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener grupos' });
  }
});


//Obtener los grupos depeniedno del usuario

app.get('/groups-by-user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const groupCollection = mongoose.connection.collection('GROUPS');
    const groups = await groupCollection.find({ personas: username }).toArray();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error al obtener grupos por usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener grupos' });
  }
});

app.get('/tasks-by-group/:groupId/:username', async (req, res) => {
  const { groupId, username } = req.params;

  try {
    const taskCollection = mongoose.connection.collection('TASK');

    // Filtrar tareas por groupId y verificar si el usuario está asignado a la tarea
    const tasks = await taskCollection.find({ 
      groupId, 
      assignedTo: username // Filtra solo las tareas asignadas a este usuario
    }).toArray();

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error al obtener tareas por grupo y usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tareas' });
  }
});




app.post('/update-task/:taskId/:status', async (req, res) => {
  const { taskId, status } = req.params;

  if (!taskId || !status) {
    return res.status(400).json({ success: false, message: 'Falta el ID de la tarea o el nuevo estado' });
  }

  try {
    const taskCollection = mongoose.connection.collection('TASK');
    const result = await taskCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(taskId) },
      { $set: { status: status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o no se realizó ningún cambio' });
    }

    // Obtener la tarea actualizada
    const updatedTask = await taskCollection.findOne({ _id: new mongoose.Types.ObjectId(taskId) });

    res.json({ success: true, message: 'Estado de tarea actualizado correctamente', task: updatedTask });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar tarea' });
  }
});

app.delete('/delete-task/:taskId', async (req, res) => { // Elimina authenticateToken
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


//Select users
app.get('/users', async (req, res) => {
  try {
    const userCollection = mongoose.connection.collection('USERS'); 
    const users = await userCollection.find(
      { role: "2" }, // Filtro para usuarios con role 2
      { projection: { username: 1, _id: 0 } } // Proyección: solo el campo username
    ).toArray(); 

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});


//ADD GROUP
app.post('/add-group', authenticateToken, async (req, res) => {
  const { name, participants } = req.body; 
  const userId = req.user.userId; 

  if (!userId) {
    return res.status(400).json({ success: false, message: 'ID de usuario no proporcionado' });
  }

  try {
    const creator = await User.findOne({ _id: userId });
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    
    const participantUsers = await User.find({ username: { $in: participants } });
    const participantUsernames = participantUsers.map(user => user.username);

 
    const newGroup = {
      name: name, 
      by: creator.username, 
      personas: participantUsernames, 
    };

 
    const groupCollection = mongoose.connection.collection('GROUPS');
    await groupCollection.insertOne(newGroup);

    res.json({ success: true, message: 'Grupo creado exitosamente', group: newGroup });
  } catch (error) {
    console.error('Error al crear el grupo:', error);
    res.status(500).json({ success: false, message: 'Error al crear el grupo' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🟢 Servidor corriendo');
});