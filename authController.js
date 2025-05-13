const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
const login = async (req, res) => {
  const { controlNumber, password } = req.body;

  try {
    const user = await User.findOne({ controlNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        controlNumber: user.controlNumber,
        firstName: user.name,
        lastName: user.surname,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Register
const register = async (req, res) => {
  const { controlNumber, password, name, surname, email, role } = req.body;

  try {
    const existingUser = await User.findOne({ controlNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Control number already registered' });
    }

    // ❌ No permitir crear managers o admins desde aquí
    if (role === 'admin' || role === 'manager') {
      return res.status(403).json({ message: 'Unauthorized to assign this role' });
    }

    const newUser = new User({
      controlNumber,
      password, // bcrypt is applied automatically via pre('save')
      name,
      surname,
      email,
      role: role || 'student'
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        controlNumber: newUser.controlNumber,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering user' });
  }
};

module.exports = { login, register };
