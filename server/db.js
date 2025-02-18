const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/WEB'); 
    console.log('🟢 Conectado a MongoDB');
  } catch (err) {
    console.error('🔴 Error al conectar MongoDB:', err);
    process.exit(1);
  }
};

module.exports = conectarDB;
