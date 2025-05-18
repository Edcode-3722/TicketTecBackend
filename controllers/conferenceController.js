const Conference = require('../models/Conference');
const Room = require('../models/Room');
const DeletedConference = require('../models/DeletedConference');
const { v4: uuidv4 } = require('uuid');

const createConference = async (req, res) => {
  const {
    title,
    speaker,
    date,
    time,
    topic,
    roomId,
    posterImage,
    synopsis,
    duration
  } = req.body;

  const createdBy = req.user.id;

  try {
    // Buscar la sala
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    // Calcular fecha de inicio y fin ajustada a la zona local
    const startDateTimeLocal = new Date(`${date}T${time}`);
    const timezoneOffset = startDateTimeLocal.getTimezoneOffset() * 60000;
    const startDateTime = new Date(startDateTimeLocal.getTime() - timezoneOffset);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // Validar solapamiento
    const overlapping = await Conference.findOne({
      room: roomId,
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gt: startDateTime }
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Ya hay otra conferencia en ese horario y sala' });
    }

    // Convertir layout según su tipo
    const rawLayout = room.layout instanceof Map
      ? Object.fromEntries(room.layout)
      : typeof room.layout.toObject === 'function'
        ? room.layout.toObject()
        : room.layout;

    const seatMap = [];
    for (const [rowLetter, colCount] of Object.entries(rawLayout)) {
      for (let i = 1; i <= colCount; i++) {
        seatMap.push({ code: `${rowLetter}${i}` });
      }
    }

    const capacity = seatMap.length;

    // Crear la conferencia
    const conference = await Conference.create({
      title,
      speaker,
      date,
      time,
      topic,
      room: room._id,
      posterImage,
      synopsis,
      duration,
      startDateTime,
      endDateTime,
      capacity,
      seatMap,
      createdBy
    });

    // Retornar con el nombre de la sala
    const populated = await Conference.findById(conference._id).populate('room', 'name');

    res.status(201).json({
      message: 'Conferencia creada',
      conference: populated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al crear conferencia',
      error: error.message
    });
  }
};






// Registro a conferencia
const registerToConference = async (req, res) => {
  const userId = req.user.id;
  const { conferenceId } = req.params;
  const { seatCode } = req.body; // ✅ ahora recibimos el asiento específico

  try {
    const conference = await Conference.findById(conferenceId);
    if (!conference) return res.status(404).json({ message: 'Conferencia no encontrada' });

    const alreadyRegistered = conference.seatMap.find(
      seat => seat.reserved && seat.reservedBy?.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Ya estás registrado a esta conferencia' });
    }

    const seat = conference.seatMap.find(s => s.code === seatCode);

    if (!seat) {
      return res.status(400).json({ message: `El asiento ${seatCode} no existe.` });
    }

    if (seat.reserved) {
      return res.status(409).json({ message: `El asiento ${seatCode} ya está ocupado.` });
    }

    seat.reserved = true;
    seat.reservedBy = userId;
    seat.qrCode = uuidv4();

    await conference.save();

    res.status(200).json({
      message: `Registro exitoso en el asiento ${seatCode}`,
      seat: {
        code: seat.code,
        qrCode: seat.qrCode
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrarte a la conferencia' });
  }
};


// Cancelar registro
const unregisterFromConference = async (req, res) => {
  const userId = req.user.id;
  const { conferenceId } = req.params;

  try {
    const conference = await Conference.findById(conferenceId);
    if (!conference) return res.status(404).json({ message: 'Conferencia no encontrada' });

    const seat = conference.seatMap.find(
      s => s.reserved && s.reservedBy?.toString() === userId
    );
    if (!seat) {
      return res.status(400).json({ message: 'No estás registrado en esta conferencia' });
    }

    seat.reserved = false;
    seat.reservedBy = null;
    seat.qrCode = null;

    await conference.save();

    res.json({ message: 'Tu registro ha sido cancelado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al cancelar el registro' });
  }
};

// Obtener mis conferencias
const getMyConferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const conferences = await Conference.find({
      'seatMap.reservedBy': userId
    }).populate('room', 'name').lean();

    const userConfs = conferences.map(conf => {
      const seat = conf.seatMap.find(s => s.reservedBy?.toString() === userId);
      return {
        id: conf._id,
        title: conf.title,
        speaker: conf.speaker,
        date: conf.date,
        time: conf.time,
        topic: conf.topic,
        synopsis: conf.synopsis,
        posterImage: conf.posterImage,
        room: conf.room?.name || null,
        seat: seat?.code || null,
        qrCode: seat?.qrCode || null
      };
    });

    res.json({ message: 'Conferencias registradas', conferences: userConfs });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tus conferencias' });
  }
};

// Todas las conferencias (admin/manager)
const getAllConferences = async (req, res) => {
  try {
    const conferences = await Conference.find().populate('room', 'name').lean();

    const formatted = conferences.map(conf => ({
      ...conf,
      availableSeats: conf.seatMap.filter(seat => !seat.reserved).length
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener conferencias' });
  }
};

// Próximas conferencias (student)
const getUpcomingConferences = async (req, res) => {
  try {
    const now = new Date();

    const conferences = await Conference.find({
      startDateTime: { $gte: now }
    }).sort({ startDateTime: 1 }).populate('room', 'name').lean();

    const formatted = conferences.map(conf => ({
      ...conf,
      availableSeats: conf.seatMap.filter(seat => !seat.reserved).length
    }));

    res.json({ message: 'Conferencias próximas', conferences: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener conferencias futuras' });
  }
};

// Editar conferencia
const updateConference = async (req, res) => {
  const { conferenceId } = req.params;
  const { title, speaker, date, time, duration, topic, posterImage, synopsis } = req.body;

  try {
    const startDateTimeLocal = new Date(`${date}T${time}`);
    const timezoneOffset = startDateTimeLocal.getTimezoneOffset() * 60000;
    const startDateTime = new Date(startDateTimeLocal.getTime() - timezoneOffset);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const conference = await Conference.findById(conferenceId);
    if (!conference) return res.status(404).json({ message: 'Conferencia no encontrada' });

    const overlapping = await Conference.findOne({
      _id: { $ne: conferenceId },
      room: conference.room,
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gt: startDateTime }
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Ya hay otra conferencia en ese horario y sala' });
    }

    Object.assign(conference, {
      title,
      speaker,
      date,
      time,
      duration,
      topic,
      posterImage,
      synopsis,
      startDateTime,
      endDateTime
    });

    await conference.save();
    res.json({ message: 'Conferencia actualizada', conference });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar conferencia' });
  }
};


// Eliminar conferencia
const deleteConference = async (req, res) => {
  const { conferenceId } = req.params;
  const deletedBy = req.user.id;

  try {
    const conference = await Conference.findById(conferenceId);
    if (!conference) return res.status(404).json({ message: 'Conferencia no encontrada' });

    await DeletedConference.create({
      originalId: conference._id,
      ...conference.toObject(),
      deletedBy
    });

    await Conference.findByIdAndDelete(conferenceId);

    res.json({ message: 'Conferencia eliminada y archivada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar conferencia' });
  }
};

// Obtener conferencias eliminadas
const getDeletedConferences = async (req, res) => {
  try {
    const deleted = await DeletedConference.find()
      .populate('room', 'name')
      .populate('deletedBy', 'controlNumber role')
      .sort({ deletedAt: -1 })
      .lean();

    res.json({ message: 'Historial de conferencias eliminadas', deleted });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
};



const getAttendanceList = async (req, res) => {
  try {
    const { conferenceId } = req.params;

    const conference = await Conference.findById(conferenceId)
      .populate('seatMap.reservedBy', 'firstName lastName controlNumber');

    if (!conference) {
      return res.status(404).json({ message: 'Conferencia no encontrada' });
    }

    const registeredSeats = conference.seatMap.filter(seat => seat.reserved);

    const attendanceList = registeredSeats.map(seat => ({
      seatCode: seat.code,
      attended: seat.attended || false,
      user: seat.reservedBy
    }));

    res.json(attendanceList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pase de lista', error });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const { seatCode, attended } = req.body;

    const conference = await Conference.findById(conferenceId);
    if (!conference) return res.status(404).json({ message: 'Conferencia no encontrada' });

    const seat = conference.seatMap.find(s => s.code === seatCode);
    if (!seat || !seat.reserved) {
      return res.status(400).json({ message: 'Asiento no reservado o inválido' });
    }

    seat.attended = attended;
    await conference.save();

    res.json({ message: 'Asistencia actualizada', seatCode, attended });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar asistencia', error });
  }
};

const validateQrForConference = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const { qrCode } = req.body;

    const conference = await Conference.findById(conferenceId)
      .populate('seatMap.reservedBy', 'firstName lastName controlNumber');

    if (!conference) {
      return res.status(404).json({ message: 'Conferencia no encontrada' });
    }

    const seat = conference.seatMap.find(s => s.qrCode === qrCode);

    if (!seat) {
      return res.status(400).json({ message: 'QR inválido o no pertenece a esta conferencia' });
    }

    if (!seat.reserved) {
      return res.status(400).json({ message: 'Este asiento no está reservado' });
    }

    if (seat.attended) {
      return res.status(409).json({
        message: '⛔ Este código ya fue escaneado. El usuario ya tiene asistencia registrada.',
        user: seat.reservedBy,
        seatCode: seat.code
      });
    }

    seat.attended = true;
    await conference.save();

    res.json({
      message: '✅ Asistencia registrada correctamente.',
      user: seat.reservedBy,
      seatCode: seat.code
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al validar QR', error });
  }
};





module.exports = {
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
};
