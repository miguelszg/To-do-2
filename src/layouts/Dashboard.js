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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [group, setGroup] = useState({
    name: '',
    participants: [],
  });

  const [groups, setGroups] = useState([]); 
const [selectedGroup, setSelectedGroup] = useState(null); 
const [assignedParticipants, setAssignedParticipants] = useState([]); 

const [userGroups, setUserGroups] = useState([]); 
const [selectedGroupId, setSelectedGroupId] = useState(null); 
const [username, setUsername] = useState(null);
const [groupTasks, setGroupTasks] = useState([]); 

  const userRole = localStorage.getItem('role');

  
  const [selectedParticipants, setSelectedParticipants] = useState([]);

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

  useEffect(() => {
    const fetchUserGroups = async () => {
      const username = localStorage.getItem('username');
      if (!username) return;
  
      try {
        const response = await axios.get(`http://localhost:5000/groups-by-user/${username}`);
        if (response.data.success) {
          setUserGroups(response.data.groups);
        }
      } catch (error) {
        console.error('Error al obtener grupos del usuario:', error);
      }
    };
  
    fetchUserGroups();
  }, []);
  const fetchGroupTasks = async (groupId) => {
    const username = localStorage.getItem('username');
    if (!groupId || !username) return;
  
    try {
      const response = await axios.get(`http://localhost:5000/tasks-by-group/${groupId}/${username}`);
      if (response.data.success) {
        setGroupTasks(response.data.tasks.map(task => ({
          ...task,
          name_task: task.name_task,
          dead_line: task.dead_line,
          status: task.status,
        })));
        console.log("Tareas del grupo:", response.data.tasks);
      }
    } catch (error) {
      console.error('Error al obtener tareas del grupo:', error);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/groups');
        if (response.data.success) {
          setGroups(response.data.groups);
        }
      } catch (error) {
        console.error('Error al obtener grupos:', error);
      }
    };
  
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        if (response.data.success) {
          setUsers(response.data.users); 
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };
  
    fetchUsers();
  }, []);

  const openGroupModal = () => setIsGroupModalOpen(true);
  const closeGroupModal = () => setIsGroupModalOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroup({ ...group, [name]: value });
  };

  const handleParticipantChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setGroup({ ...group, participants: selectedOptions });
  };

  

  const toggleParticipant = (username) => {
    if (selectedParticipants.includes(username)) {
      // Si ya está seleccionado, lo eliminamos
      setSelectedParticipants(selectedParticipants.filter((user) => user !== username));
    } else {
      // Si no está seleccionado, lo agregamos
      setSelectedParticipants([...selectedParticipants, username]);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (group.name.trim() && selectedParticipants.length > 0) {
      try {
        const token = localStorage.getItem('token');
        
  
        const response = await axios.post(
          'http://localhost:5000/add-group',
          {
            name: group.name,
            participants: selectedParticipants,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data.success) {
          console.log('Grupo creado exitosamente:', response.data.group);
          closeGroupModal();
          setGroup({ name: '', participants: [] }); 
        } else {
          console.error('Error al crear el grupo:', response.data.message);
        }
      } catch (error) {
        console.error('Error al crear el grupo:', error);
      }
    } else {
      console.error('Error: Nombre del grupo y participantes son requeridos');
    }
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
          {
            ...task,
            userId,
            groupId: selectedGroup ? selectedGroup._id : null, // ID del grupo
            assignedParticipants, // Usernames de los integrantes asignados
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data.success) {
          setTasks(response.data.tasks);
          setTask({
            name: '',
            description: '',
            time: '',
            status: 'In Progress',
            category: '',
          });
          setSelectedGroup(null);
          setAssignedParticipants([]);
          closeModal();
        } else {
          console.error('Error al agregar tarea:', response.data.message);
        }
      } catch (error) {
        console.error('Error al agregar tarea:', error);
      }
    }
  };


  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/delete-task/${taskId}` // Elimina los encabezados de autorización
      );
  
      if (response.data.success) {
        // Actualiza las tareas eliminando la tarea con el taskId
        setTasks((prevTasks) => prevTasks.filter(task => task._id !== taskId));
        setGroupTasks((prevGroupTasks) => prevGroupTasks.filter(task => task._id !== taskId));
      } else {
        console.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  

  const handleStatusChange = async (taskId, newStatus) => {
    const statusMap = {
      'In Progress': '1',
      'Done': '2',
      'Paused': '3',
      'Revision': '4',
    };
  
    const mappedStatus = statusMap[newStatus] || '1';
  
    try {
      // Actualiza el estado de la tarea en el backend
      const response = await axios.post(
        `http://localhost:5000/update-task/${taskId}/${mappedStatus}`
      );
  
      if (response.data.success) {
        console.log('Tarea actualizada exitosamente:', response.data.task);
  
        // Vuelve a cargar las tareas desde el backend
        if (selectedGroupId) {
          // Si hay un grupo seleccionado, recarga las tareas del grupo
          await fetchGroupTasks(selectedGroupId);
        } else {
          // Si no hay un grupo seleccionado, recarga las tareas generales
          const userId = localStorage.getItem('userId');
          const tasksResponse = await axios.get(`http://localhost:5000/tasks/${userId}`);
          if (tasksResponse.data.success) {
            setTasks(tasksResponse.data.tasks.map(task => ({
              ...task,
              name: task.name_task,
              time: task.dead_line,
              status: statusMap[task.status] || 'Unknown',
            })));
          }
        }
      } else {
        console.error('Error al actualizar la tarea');
      }
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

  const categorizedGroupTasks = {
    'In Progress': groupTasks.filter(task => task.status === '1'), // Compara con '1'
    'Done': groupTasks.filter(task => task.status === '2'),       // Compara con '2'
    'Paused': groupTasks.filter(task => task.status === '3'),     // Compara con '3'
    'Revision': groupTasks.filter(task => task.status === '4'),   // Compara con '4'
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <div className="group-buttons">
  {userGroups.map((group) => (
    <button
      key={group._id}
      className={`group-button ${selectedGroupId === group._id ? 'active' : ''}`}
      onClick={() => {
        setSelectedGroupId(group._id); // Actualiza el grupo seleccionado
        fetchGroupTasks(group._id); // Obtiene las tareas del grupo
      }}
    >
      {group.name}
    </button>
  ))}
</div>

    
      {userRole === '1' && (
        <button className='add-group-btn' onClick={openGroupModal}>+ Add Group</button>
      )}
      {userRole === '1' && (
        <button className="btn add-task-btn" onClick={openModal}>+ Add Task</button>
      )}
      

      {isGroupModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Group</h2>
            <form onSubmit={handleAddGroup}>
              <div className="field">
                <label htmlFor="groupName">Group Name</label>
                <input
                  className="input-field"
                  type="text"
                  id="groupName"
                  placeholder="Enter group name"
                  name="name"
                  value={group.name}
                  onChange={handleGroupChange}
                  required
                />
              </div>
              <div className="user-list">
        <h3>Selecciona participantes:</h3>
        {users.map((user) => (
          <div
            key={user.username}
            className={`user-item ${selectedParticipants.includes(user.username) ? 'selected' : ''}`}
            onClick={() => toggleParticipant(user.username)}
          >
            {user.username}
          </div>
        ))}
      </div>

      <div className="selected-participants">
        <h3>Participantes seleccionados:</h3>
        {selectedParticipants.map((username) => (
          <div
            key={username}
            className="selected-item"
            onClick={() => toggleParticipant(username)} 
          >
            {username} <span className="remove-icon">×</span>
          </div>
        ))}
      </div>

      <button
        className="btn save-group-btn"
        onClick={() => {
          console.log('Participantes seleccionados:', selectedParticipants);
        
        }}
      >
        Guardar Grupo
      </button>
              <button className="delete-button1" type="button" onClick={closeGroupModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
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

        {/* Combo para seleccionar grupo */}
        {userRole === '1' && (
          <>
            <div className="field">
              <label htmlFor="group">Group</label>
              <select
                className="input-field"
                id="group"
                name="group"
                value={selectedGroup ? selectedGroup._id : ''}
                onChange={(e) => {
                  const groupId = e.target.value;
                  const group = groups.find(g => g._id === groupId);
                  setSelectedGroup(group);
                }}
                required
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de integrantes del grupo seleccionado */}
            {selectedGroup && (
              <div className="field">
                <label htmlFor="assignedParticipants">Assign to</label>
                <div className="user-list">
                  {selectedGroup.personas.map((username) => (
                    <div
                      key={username}
                      className={`user-item ${assignedParticipants.includes(username) ? 'selected' : ''}`}
                      onClick={() => {
                        if (assignedParticipants.includes(username)) {
                          setAssignedParticipants(assignedParticipants.filter(u => u !== username));
                        } else {
                          setAssignedParticipants([...assignedParticipants, username]);
                        }
                      }}
                    >
                      {username}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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
        {selectedGroupId ? (
          // Mostrar tareas del grupo seleccionado
          categorizedGroupTasks[status].map((task, index) => (
            <div key={index} className="task-card" style={{ borderColor: status === 'In Progress' ? '#2563eb' : status === 'Done' ? '#16a34a' : status === 'Paused' ? '#f59e0b' : '#eab308' }}>
              <h3>{task.name_task}</h3>
              <div className="task-info">
                <span>{task.description}</span>
                <span>{task.category}</span>
                <span>{task.dead_line}</span>
              </div>
              <div className={`status ${status.toLowerCase().replace(' ', '-')}`}>
                {status}
              </div>
              <select
                className="status-select"
                value={status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
              >
                <option value="In Progress">En Progreso</option>
                <option value="Done">Completado</option>
                <option value="Paused">Pausa</option>
                <option value="Revision">Revisión</option>
              </select>
              <button className="delete-button" onClick={() => handleDeleteTask(task._id)}>
                <FaTrashAlt />
              </button>
            </div>
          ))
        ) : (
          categorizedTasks[status].map((task, index) => (
            <div key={index} className="task-card" style={{ borderColor: task.status === 'In Progress' ? '#2563eb' : task.status === 'Done' ? '#16a34a' : task.status === 'Paused' ? '#f59e0b' : '#eab308' }}>
            </div>
          ))
        )}
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default Dashboard;