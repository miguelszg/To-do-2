import React, { useState } from 'react';
import axios from 'axios'; 
import './Dashboard.css';
import { FaTrashAlt } from 'react-icons/fa';  

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
        
        const response = await axios.post('http://localhost:5000/add-task', task);
        
        if (response.data.success) {
       
          setTasks([...tasks, task]);
          setTask({
            name: '',
            description: '',
            time: '',
            status: 'In Progress',
            category: '',
          });
          closeModal();
        }
      } catch (error) {
        console.error('Error al agregar tarea:', error);
      }
    }
  };

  const handleDeleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = newStatus;
    setTasks(updatedTasks);
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>

      
      <button className="btn add-task-btn" onClick={openModal}>
        + Add Task
      </button>

      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="field">
                <label htmlFor="name">Task Name</label>
                <input
                  className="input-field"
                  type="text"
                  id="name"
                  placeholder="Enter task name"
                  name="name"
                  value={task.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="description">Task Description</label>
                <textarea
                  className="input-field"
                  id="description"
                  placeholder="Enter task description"
                  name="description"
                  value={task.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="time">Deadline</label>
                <input
                  className="input-field"
                  type="datetime-local"
                  id="time"
                  name="time"
                  value={task.time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  className="input-field"
                  name="status"
                  id="status"
                  value={task.status}
                  onChange={handleChange}
                  required
                >
                  <option value="In Progress">En Progreso</option>
                  <option value="Done">Completado</option>
                  <option value="Paused">Pausa</option>
                  <option value="Revision">Revision</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <input
                  className="input-field"
                  type="text"
                  id="category"
                  placeholder="Enter category"
                  name="category"
                  value={task.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn" type="submit">Save Task</button>
              <button className="delete-button" type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="task-list">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="task-card"
            style={{
              borderColor:
                task.status === 'In Progress'
                  ? '#2563eb'
                  : task.status === 'Done'
                  ? '#16a34a'
                  : task.status === 'Paused'
                  ? '#f59e0b'
                  : '#eab308',
            }}
          >
            <h3>{task.name}</h3>
            <div className="task-info">
              <span>{task.description}</span>
              <span>{task.category}</span>
              <span>{task.time}</span>
            </div>
            <div className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </div>

          
            <select
              className="status-select"
              value={task.status}
              onChange={(e) => handleStatusChange(index, e.target.value)}
            >
              <option value="In Progress">En Progreso</option>
              <option value="Done">Completado</option>
              <option value="Paused">Pausa</option>
              <option value="Revision">Revision</option>
            </select>

            <button
              className="delete-button"
              onClick={() => handleDeleteTask(index)}
            >
              <FaTrashAlt />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
