const Table = require('../models/Table');

async function getTables(req, res) {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load tables.', error: error.message });
  }
}

async function createTable(req, res) {
  try {
    const { tableNumber, capacity, location, status } = req.body;

    const table = await Table.create({
      tableNumber,
      capacity,
      location,
      status: status || 'available',
      qrCode: `table-${tableNumber}`,
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create table.', error: error.message });
  }
}

async function updateTableStatus(req, res) {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!table) {
      return res.status(404).json({ message: 'Table not found.' });
    }

    req.io.emit('table:updated', { table });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update table status.', error: error.message });
  }
}

module.exports = { getTables, createTable, updateTableStatus };
