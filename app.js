const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();
connectDB();

// Middlewares
app.use(cors({ origin: '*' })); // Cambia por dominio real en producción
app.use(express.json()); // Para leer JSON

// Rutas
app.use('/api/auth', require('./routes/auth'));

app.use('/api/rooms', require('./routes/rooms'));

app.use('/api/conferences', require('./routes/conferences'));

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

app.use('/api/rooms', require('./routes/rooms'));






module.exports = app;
