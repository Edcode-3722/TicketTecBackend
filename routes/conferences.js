const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');

const {
  createConference,
  registerToConference,
  unregisterFromConference,
  getMyConferences,
  getAllConferences,
  getUpcomingConferences,
  updateConference,
  deleteConference,
  getDeletedConferences
} = require('../controllers/conferenceController');

// Obtener conferencias registradas por el estudiante
router.get('/my-registrations', verifyToken(['student']), getMyConferences);

// Registro a conferencia (solo student)
router.post('/:conferenceId/register', verifyToken(['student']), registerToConference);

// Cancelar registro del estudiante
router.delete('/:conferenceId/unregister', verifyToken(['student']), unregisterFromConference);

// Crear nueva conferencia (solo manager o admin)
router.post('/', verifyToken(['admin', 'manager']), createConference);

// Obtener conferencias futuras (cualquier usuario autenticado)
router.get('/upcoming', verifyToken(), getUpcomingConferences);

// Obtener todas las conferencias (cualquier autenticado)
router.get('/', verifyToken(), getAllConferences);

router.put('/:conferenceId', verifyToken(['admin', 'manager']), updateConference);

//Eliminar conferencia
router.delete('/:conferenceId', verifyToken(['admin', 'manager']), deleteConference);

// Ver historial de conferencias eliminadas (admin solo)
router.get('/deleted', verifyToken(['admin']), getDeletedConferences);




module.exports = router;
