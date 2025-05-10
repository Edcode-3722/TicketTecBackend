const express = require('express');
const { body } = require('express-validator'); // ✅ primero importas esto
const router = express.Router(); // ✅ define router antes de usarlo

const { login, register } = require('../controllers/authController');

router.post('/login', [
  body('controlNumber').notEmpty().withMessage('El número de control es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
], login);

router.post('/register', [
  body('controlNumber').notEmpty(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], register);

module.exports = router;
