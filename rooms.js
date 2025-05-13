const express = require('express');
const router = express.Router();
const { createRoom, getRooms, deleteRoom, updateRoom, getRoomsWithConferenceCount  } = require('../controllers/roomController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken(['admin', 'manager']), createRoom); 
// GET disponible para cualquier rol autenticado
router.get('/', verifyToken(), getRooms);

router.delete('/:id', verifyToken(['admin']), deleteRoom);

//Modificar sala
router.put('/:id', verifyToken(['admin']), updateRoom);

router.get('/with-conference-count', verifyToken(['admin']), getRoomsWithConferenceCount);





module.exports = router;
