

const createRoom = async (req, res) => {
  const { name, layout } = req.body;
  const createdBy = req.user.id;

  try {
    const room = await Room.create({ name, layout, createdBy });
    res.status(201).json({ message: 'Sala creada', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear sala', error: error.message });
  }
};



const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener salas', error: error.message });
  }
};

//Eliminar sala

const Room = require('../models/Room');

const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica si hay conferencias asociadas a esta sala
    const inUse = await Conference.findOne({ room: id });

    if (inUse) {
      return res.status(400).json({
        message: 'No se puede eliminar la sala porque está asignada a una o más conferencias.'
      });
    }

    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    res.json({ message: 'Sala eliminada correctamente', room: deletedRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al intentar eliminar la sala' });
  }
};

// Modificar sala+


const Conference = require('../models/Conference');

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, layout } = req.body;

  try {
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    // Validar si hay conferencias asociadas a esta sala
    const hasConferences = await Conference.findOne({ room: id });
    if (hasConferences && JSON.stringify(room.layout) !== JSON.stringify(layout)) {
      return res.status(400).json({
        message: 'No se puede modificar el layout: la sala ya está en uso por conferencias'
      });
    }

    room.name = name ?? room.name;
    room.layout = layout ?? room.layout;

    await room.save();

    res.json({ message: 'Sala actualizada correctamente', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la sala' });
  }
};

//Obtener salas con conferencias (Cuantas)

const getRoomsWithConferenceCount = async (req, res) => {
  try {
    const rooms = await Room.find().lean();

    const roomsWithCount = await Promise.all(
      rooms.map(async (room) => {
        const count = await Conference.countDocuments({ room: room._id });
        return {
          ...room,
          conferenceCount: count
        };
      })
    );

    res.json({
      message: 'Salas con número de conferencias asociadas',
      rooms: roomsWithCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las salas' });
  }
};


module.exports = { createRoom, getRooms, deleteRoom, updateRoom, getRoomsWithConferenceCount  };
