// models/appointmentModel.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isTimeSlotAvailable: { type: Boolean, required: true, default: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
