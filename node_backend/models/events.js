import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  venue: { type: String },
  club: {
    type: String,
    enum: ['IEEE', 'GDSC', 'NSS', 'CSI', 'ISTE', 'IIC', 'ROTARACT', 'YRC', 'OTHER'],
    default: 'OTHER'
  },
  department: {
    type: String,
    enum: ['AIML', 'CSE', 'MECH', 'EEE', 'ECE', 'MIN', 'BME', 'ALL'],
    default: 'ALL'
  },
  status: {
    type: String,
    enum: ['NOT YET STARTED', 'ONGOING', 'COMPLETED'],
    default: 'NOT YET STARTED'
  },
  poster: { 
    type: String, // Store the Base64 encoded image as a string
    required: false
  },
  posterContentType: { 
    type: String, // Store the content type (e.g., image/jpeg)
    required: false
  },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registeredUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema, 'events');
export default Event;
