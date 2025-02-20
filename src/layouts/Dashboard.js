import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import './Dashboard.css';
import { FaTrashAlt } from 'react-icons/fa';  

const statusMap = {
  '1': 'In Progress',
  '2': 'Done',
  '3': 'Paused',
  '4': 'Revision',
};

const Dashboard = () => {
  const [task, setTask] = useState({
    name: '',
    description: '',
    time: '',
    status: 'In Progress',
    category: '',
  });
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const userId = localStorage.getItem('userId'); 
      if (!userId) {
        console.error('Error: No se encontró userId');
        return;
      }
  
      try {
        const response = await axios.get(`http://localhost:5000/tasks/${userId}`);
        if (response.data.success) {
          setTasks(response.data.tasks.map(task => ({
            ...task,
            name: task.name_task, 
            time: task.dead_line, 
            status: statusMap[task.status] || 'Unknown',
          })));
        }
      } catch (error) {
        console.error('Error al obtener tareas:', error);
      }
    };
  
    fetchTasks();
  }, []);
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (task.name.trim()) {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          console.error('Error: No se encontró userId en localStorage');
          return;
        }
  
        const response = await axios.post(
          'http://localhost:5000/add-task',
          { ...task, userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log(response.data);
  
        if (response.data.success) {
          if (response.data.tasks) {
            setTasks(response.data.tasks.map(task => ({
              ...task,
              name: task.name_task,
              time: task.dead_line,
              status: statusMap[task.status] || 'Unknown',
            })));
          } else {
            console.error('Error: La propiedad "tasks" no está en la respuesta');
          }
  
          setTask({
            name: '',
            description: '',
            time: '',
            status: 'In Progress',
            category: '',
          });
          closeModal();
        } else {
          console.error('Error al agregar tarea:', response.data.message);
        }
      } catch (error) {
        console.error('Error al agregar tarea:', error);
      }
    }
  };

  const handleDeleteTask = async (index) => {
    const taskId = tasks[index]._id; 
    const token = localStorage.getItem('token');
    
    if (!taskId || !token) {
      console.error('Error: Faltan datos necesarios');
      return;
    }
  
    try {
      const response = await axios.delete(
        `http://localhost:5000/delete-task/${taskId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.success) {
        const updatedTasks = tasks.filter((_, i) => i !== index); 
        setTasks(updatedTasks);
      } else {
        console.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Crear una copia de las tareas para evitar la modificación directa del estado
    const updatedTasks = tasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!taskId || !userId || !token) {
      console.error('Error: Faltan datos necesarios');
      return;
    }
  
    try {
      // Actualiza el estado en el servidor con el id de la tarea
      await axios.patch(
        `http://localhost:5000/update-task/${taskId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };
  

  const categorizedTasks = {
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    'Done': tasks.filter(task => task.status === 'Done'),
    'Paused': tasks.filter(task => task.status === 'Paused'),
    'Revision': tasks.filter(task => task.status === 'Revision'),
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <button className="btn add-task-btn" onClick={openModal}>+ Add Task</button>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="field">
                <label htmlFor="name">Task Name</label>
                <input className="input-field" type="text" id="name" placeholder="Enter task name" name="name" value={task.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="description">Task Description</label>
                <textarea className="input-field" id="description" placeholder="Enter task description" name="description" value={task.description} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="time">Deadline</label>
                <input className="input-field" type="datetime-local" id="time" name="time" value={task.time} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <input className="input-field" type="text" id="category" placeholder="Enter category" name="category" value={task.category} onChange={handleChange} required />
              </div>
              <button className="btn" type="submit">Save Task</button>
              <button className="delete-button1" type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="task-columns">
        {['In Progress', 'Done', 'Paused', 'Revision'].map(status => (
          <div className="task-column" key={status}>
            <h2>{status}</h2>
            <div className="task-list">
              {categorizedTasks[status].map((task, index) => (
                <div key={index} className="task-card" style={{ borderColor: task.status === 'In Progress' ? '#2563eb' : task.status === 'Done' ? '#16a34a' : task.status === 'Paused' ? '#f59e0b' : '#eab308' }}>
                  <h3>{task.name}</h3>
                  <div className="task-info">
                    <span>{task.description}</span>
                    <span>{task.category}</span>
                    <span>{task.time}</span>
                  </div>
                  <div className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</div>
                  <select className="status-select" value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
  <option value="In Progress">En Progreso</option>
  <option value="Done">Completado</option>
  <option value="Paused">Pausa</option>
  <option value="Revision">Revisión</option>
</select>

                  <button className="delete-button" onClick={() => handleDeleteTask(index)}><FaTrashAlt /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
