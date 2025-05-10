const User = require('../models/User');

// Registrar alumno (público)
const register = async (req, res) => {
  const { controlNumber, password, name, surname, email } = req.body;

  try {
    const existing = await User.findOne({ controlNumber });
    if (existing) {
      return res.status(400).json({ message: 'Control number already registered' });
    }

    const newUser = new User({
      controlNumber,
      password,
      name,
      surname,
      email,
      role: 'student'
    });

    await newUser.save();

    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        id: newUser._id,
        controlNumber: newUser.controlNumber,
        name: newUser.name,
        surname: newUser.surname,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering student' });
  }
};

// Crear usuario desde admin
const adminRegister = async (req, res) => {
  const { controlNumber, password, name, surname, email, role } = req.body;

  try {
    const existing = await User.findOne({ controlNumber });
    if (existing) return res.status(400).json({ message: 'Control number already in use' });

    const newUser = new User({ controlNumber, password, name, surname, email, role });

    await newUser.save();

    res.status(201).json({
      message: 'User created by admin',
      user: {
        id: newUser._id,
        controlNumber: newUser.controlNumber,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Eliminar usuario (evita autodelete de admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(403).json({ message: 'You cannot delete yourself' });
  }

  try {
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Editar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating user' });
  }
};

module.exports = {
  register,
  adminRegister,
  getAllUsers,
  deleteUser,
  updateUser
};
