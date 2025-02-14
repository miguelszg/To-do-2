import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (task.trim()) {
      setTasks([...tasks, task]);
      setTask('');
    }
  };

  const handleDeleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Ingresa una tarea..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="task-button">Agregar Tarea</button>
      </form>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p>Ups no hay tareas aún. Agrega algunas!</p>
        ) : (
          tasks.map((task, index) => (
            <div key={index} className="task-item">
              <span>{task}</span>
              <button onClick={() => handleDeleteTask(index)} className="delete-button">
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
