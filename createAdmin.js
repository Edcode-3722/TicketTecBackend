// createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  try {
    await connectDB();

    //Crea el primer usuario admin
    const existingUser = await User.findOne({ controlNumber: '20021220' });
    if (existingUser) {
      console.log('⚠️ Ya existe un usuario con ese número de control');
      return process.exit(0);
    }

    const admin = new User({
      controlNumber: '20021220',
      password: 'contra12345678', // bcrypt se encarga de encriptar
      name: 'Jose Eduardo',
      surname: 'Garcia Garcia',
      email: 'jeduardogarcia.dev@gmail.com',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Usuario admin creado con éxito');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
    process.exit(1);
  }
};

run();
