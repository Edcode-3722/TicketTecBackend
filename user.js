const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware'); // ✅ FALTABA ESTA LÍNEA

const {
  adminRegister,
  register,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');

router.post('/admin-register', verifyToken(['admin']), adminRegister);
router.post('/register', register); // público

router.get('/', verifyToken(['admin']), getAllUsers);
router.delete('/:id', verifyToken(['admin']), deleteUser);

module.exports = router;
