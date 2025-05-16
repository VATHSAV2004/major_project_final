import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'manager', 'volunteer', 'user'],
    required: true
  },
  occupation: {
    type: String,
    enum: ['student', 'faculty'],
    required: true
  },
  department: { type: String, required: true },
  studentDetails: {
    rollNo: { type: String },
    course: { type: String },
    year: { type: Number, min: 1, max: 4 }
  },
  eventsManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  eventsVolunteered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
