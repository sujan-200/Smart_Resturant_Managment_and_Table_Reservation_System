const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Notification = require('../models/Notification');

async function getReservations(req, res) {
  try {
    const reservations = await Reservation.find().populate('customer', 'name email role').populate('table').sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load reservations.', error: error.message });
  }
}

async function createReservation(req, res) {
  try {
    const { customerName, contactNumber, date, time, numberOfGuests, specialRequests, customerId } = req.body;

    if (!customerName || !contactNumber || !date || !time || !numberOfGuests) {
      return res.status(400).json({ message: 'Please fill all required reservation fields.' });
    }

    const customer = customerId || req.user?.id;
    if (!customer) {
      return res.status(400).json({ message: 'Customer information is required.' });
    }

    const matchingTable = await Table.findOne({
      capacity: { $gte: Number(numberOfGuests) },
      status: 'available',
    }).sort({ capacity: 1, tableNumber: 1 });

    if (!matchingTable) {
      return res.status(400).json({ message: 'No suitable table is available for the selected time.' });
    }

    const reservation = await Reservation.create({
      customer,
      customerName,
      contactNumber,
      date,
      time,
      numberOfGuests,
      specialRequests: specialRequests || '',
      table: matchingTable._id,
      status: 'pending',
    });

    matchingTable.status = 'reserved';
    matchingTable.currentReservation = reservation._id;
    await matchingTable.save();

    await Notification.create({
      recipient: customer,
      title: 'Reservation request received',
      message: `Your reservation for ${numberOfGuests} guests on ${date} at ${time} has been received.`,
      type: 'reservation',
      metadata: { reservationId: reservation._id },
    });

    req.io.emit('reservation:created', { reservation });
    res.status(201).json({ reservation, recommendedTable: matchingTable });
  } catch (error) {
    res.status(500).json({ message: 'Reservation could not be created.', error: error.message });
  }
}

async function updateReservation(req, res) {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customer', 'name email')
      .populate('table');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    req.io.emit('reservation:updated', { reservation });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update reservation.', error: error.message });
  }
}

module.exports = { getReservations, createReservation, updateReservation };
