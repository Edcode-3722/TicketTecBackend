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
  getDeletedConferences,
  getAttendanceList,
  markAttendance,
  validateQrForConference
} = require('../controllers/conferenceController');

// 📌 Crear nueva conferencia (manager o admin)
router.post('/', verifyToken(['admin', 'manager']), createConference);

// 📌 Obtener conferencias futuras (cualquier autenticado)
router.get('/upcoming', verifyToken(), getUpcomingConferences);

// 📌 Obtener todas las conferencias
router.get('/', verifyToken(), getAllConferences);

// 📌 Obtener conferencias registradas por el estudiante
router.get('/my-registrations', verifyToken(['student']), getMyConferences);

// 📌 Ver historial de conferencias eliminadas (admin)
router.get('/deleted', verifyToken(['admin']), getDeletedConferences);

// 📌 Registro a conferencia (solo student)
router.post('/:conferenceId/register', verifyToken(['student']), registerToConference);

// 📌 Cancelar registro del estudiante
router.delete('/:conferenceId/unregister', verifyToken(['student']), unregisterFromConference);

// 📌 Actualizar conferencia
router.put('/:conferenceId', verifyToken(['admin', 'manager']), updateConference);

// 📌 Eliminar conferencia
router.delete('/:conferenceId', verifyToken(['admin', 'manager']), deleteConference);

// 📌 Obtener pase de lista
router.get('/:conferenceId/attendance', verifyToken(['manager', 'admin']), getAttendanceList);

// 📌 Marcar asistencia manualmente
router.put('/:conferenceId/attendance', verifyToken(['manager', 'admin']), markAttendance);

// 📌 Validar QR
router.post('/:conferenceId/validate-qr', verifyToken(['manager', 'admin']), validateQrForConference);

module.exports = router;
