import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  screenshot: { type: String, required: true },    // Base64 string of the image
  contentType: { type: String, required: true },   // Example: "image/png"
  timestamp: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false } ,     // To track approval status
  attended: { type: Boolean, default: false }

});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
