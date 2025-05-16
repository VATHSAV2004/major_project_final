import cors from 'cors';
import express from "express";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GridFSBucket } from 'mongodb';
import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';


import User from "./models/users.js";
import Event from "./models/events.js";
import Registration from './models/registrations.js';

import multer from 'multer';
import fs from 'fs';
const storage = multer.memoryStorage();  // Store file in memory as buffer
const upload = multer({ storage }).single('poster'); // 'poster' is the field name in your form



const app = express();
app.use(cors({
    origin: ['http://localhost:3000','https://eveosmania.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
app.use(express.json());

const mongoose_url = "mongodb://localhost:27017/majorproject";

const JWT_SECRET = "your_jwt_secret"; // Keep it secure

// Initialize GridFS bucket
let gfsBucket;

const initializeDb = async () => {
  try {
    await mongoose.connect(mongoose_url);
    console.log("MongoDB connected");
    
    // Initialize GridFS bucket after connection
    const conn = mongoose.connection;
    gfsBucket = new GridFSBucket(conn.db, {
      bucketName: 'posters'
    });
  } catch (e) {
    console.log(e);
  }
};

initializeDb();






app.get('/api/poster/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }
    
    const fileId = new ObjectId(req.params.id);
    const files = await mongoose.connection.db.collection('posters.files').find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    
    const readStream = gfsBucket.openDownloadStream(fileId);
    res.set('Content-Type', files[0].contentType);
    readStream.pipe(res);
    
    readStream.on('error', (err) => {
      res.status(500).json({ message: "Error streaming file" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve poster" });
  }
});
// -------------------- Middleware to Authenticate User Role --------------------
const authenticateRole = (allowedRoles) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// -------------------- Login Route --------------------
// -------------------- Login Route --------------------
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  console.log("Request Body:", req.body);

  try {
    const user = await User.findOne({ email });
    console.log("Found User:", user);

    if (!user) {
      console.log("No user found with this email");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password mismatch");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      console.log(`Role mismatch: Expected ${role}, Found ${user.role}`);
      return res.status(401).json({ message: 'Role mismatch' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send the token, role, and userId in the response
    res.status(200).json({ token, role: user.role, userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});




// -------------------- Protected Routes --------------------
app.get('/admin-data', authenticateRole(['admin']), async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});



app.get('/api/events/grouped', async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $group: {
          _id: '$department',
          events: { $push: '$$ROOT' }
        }
      }
    ]);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});
//home page apis
//home page api for clubs based view

app.get('/events-by-club', async (req, res) => {
  try {
    const eventsByClub = await Event.aggregate([
      {
        $group: {
          _id: '$club',             // Grouping by club instead of department
          events: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { _id: 1 }           // Optional: sorts clubs alphabetically
      }
    ]);
    
    res.status(200).json(eventsByClub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//likes api
app.post('/events/:id/like', async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event.likes.includes(userId)) {
      event.likes.push(userId);
      await event.save();
      res.status(200).json({ message: "Liked!" });
    } else {
      res.status(400).json({ message: "Already liked." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/events/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const events = await Event.find({ department: categoryId });
    
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No events found for this category' });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({ message: 'Failed to fetch events by category' });
  }
});


app.get('/manager-data', authenticateRole(['manager']), async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.get('/volunteer-data', authenticateRole(['volunteer']), async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// -------------------- Signup Route --------------------
app.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password, phone, role, occupation, department, studentDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      role,
      occupation,
      department,
      studentDetails: occupation === 'student' ? studentDetails : undefined
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});



// -------------------- Create Event --------------------
app.post('/events', authenticateRole(['admin']), async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// -------------------- Update Event --------------------
app.put('/events/:id', authenticateRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// -------------------- Delete Event --------------------
app.delete('/events/:id', authenticateRole(['admin']), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// -------------------- Assign Manager Role --------------------
app.post('/users/:id/assign-role', authenticateRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { role: 'manager' }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign role' });
  }
});

// -------------------- Remove Manager Role --------------------
app.post('/users/:id/remove-role', authenticateRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { role: 'user' }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove role' });
  }
});

// -------------------- Get Manager Requests --------------------
app.get('/manager-requests', authenticateRole(['admin']), async (req, res) => {
  try {
    const requests = await User.find({ roleRequest: 'manager' });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// -------------------- Approve Manager Request --------------------
app.post('/manager-requests/:id/approve', authenticateRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'manager', roleRequest: null });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request' });
  }
});

// -------------------- Reject Manager Request --------------------
app.post('/manager-requests/:id/reject', authenticateRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { roleRequest: null });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

// -------------------- Get All Users --------------------
app.get('/users', authenticateRole(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// -------------------- Delete User --------------------
app.delete('/users/:id', authenticateRole(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});





app.put('/users/:id/updateRole', authenticateRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // New role to be assigned

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});


app.get('/volunteers', authenticateRole(['admin']), async (req, res) => {
  try {
      const volunteers = await User.find({ role: 'volunteer' }).select('-password');
      res.status(200).json(volunteers);
  } catch (error) {
      console.error('Error fetching volunteers:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});
//--------events fetched used in eventdetails and event edit
// Delete event by ID
app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event" });
  }
});

app.put('/api/events/:id', upload, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      date,
      startTime,
      endTime,
      venue,
      club,
      department,
      status
    } = req.body;

    const updatedFields = {
      name,
      description,
      date,
      startTime,
      endTime,
      venue,
      club,
      department,
      status,
    };

    // Convert managers and volunteers to arrays if not already
    let managers = req.body.managers || [];
    let volunteers = req.body.volunteers || [];

    // If they're strings, convert to array
    if (typeof managers === 'string') managers = [managers];
    if (typeof volunteers === 'string') volunteers = [volunteers];

    // Convert to ObjectIds
    updatedFields.managers = managers
      .filter((m) => mongoose.Types.ObjectId.isValid(m))
      .map((m) => new mongoose.Types.ObjectId(m));

    updatedFields.volunteers = volunteers
      .filter((v) => mongoose.Types.ObjectId.isValid(v))
      .map((v) => new mongoose.Types.ObjectId(v));

    if (req.file) {
      const base64Poster = req.file.buffer.toString('base64');
      updatedFields.poster = base64Poster;
      updatedFields.posterContentType = req.file.mimetype;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('managers', 'name')
      .populate('volunteers', 'name')
      .populate('registeredUserIds', 'name');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

//----------------------

app.get('/api/users/managers', async (req, res) => {
  try {
      const { search } = req.query;
      const managers = await User.find({
          role: 'manager',
          $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
          ]
      });
      res.json(managers);
  } catch (err) {
      res.status(500).json({ error: 'Failed to search managers' });
  }
});
app.get('/api/users/volunteers', async (req, res) => {
  try {
      const { search } = req.query;
      const volunteers = await User.find({
          role: 'volunteer',
          $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
          ]
      });
      res.json(volunteers);
  } catch (err) {
      res.status(500).json({ error: 'Failed to search volunteers' });
  }
});


// Verify Token Route
app.get("/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.json({ role: decoded.role });
  });
});



// -------------------- Registration Routes --------------------

// Check registration status
app.get("/api/registration/status/:eventId/:userId", async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    const reg = await Registration.findOne({ eventId, userId });

    if (!reg) return res.json({ status: "not-registered" });
    if (reg.approved) return res.json({ status: "approved" });

    return res.json({ status: "registered" });
  } catch (err) {
    console.error("Error checking registration status", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Register with screenshot (base64)
app.post("/api/registration/register", async (req, res) => {
  try {
    const { eventId, userId, screenshot, contentType } = req.body;

    if (!screenshot || !contentType) {
      return res.status(400).json({ msg: "Screenshot and contentType are required" });
    }

    const already = await Registration.findOne({ eventId, userId });
    if (already) return res.status(400).json({ msg: "Already registered" });

    const registration = new Registration({
      eventId,
      userId,
      screenshot,       // storing base64 image directly
      contentType,      // storing content type (like image/png)
      approved: false
    });

    await registration.save();

    res.json({ msg: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// (Optional) Approve a registration
app.put("/api/registration/approve/:id", authenticateRole(['admin', 'manager']), async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ msg: "Registration not found" });
    }

    res.json({ msg: "Registration approved", registration });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

//-----------------------editevent apis

//------------------------registration approval apis

// Fetch all registrations for a specific event
app.get('/api/registrations/:eventId', async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('userId', 'name email')  // Populate user info like name and email
      .exec();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'dasisaisrivathsav20042@gmail.com',
        pass: 'pwhf eelb zwve bbxv',
    },
});

// ✅ Verify transporter (debug)
// Enhanced transporter verification with more detailed logging
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Transporter verification failed:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response
    });
  } else {
    console.log('✅ Mail server connection verified:', {
      host: transporter.options.host,
      port: transporter.options.port,
      secure: transporter.options.secure
    });
  }
});

// ✅ Approve registration and send email
app.put('/api/registration/approve/:registrationId', async (req, res) => {
  console.log('🔵 Approval request received:', {
    registrationId: req.params.registrationId,
    time: new Date().toISOString()
  });

  try {
    const updated = await Registration.findByIdAndUpdate(
      req.params.registrationId,
      { approved: true },
      { new: true }
    ).populate('userId');

    if (!updated) {
      console.log('🟡 Registration not found:', req.params.registrationId);
      return res.status(404).json({ message: 'Registration not found' });
    }

    console.log('🟢 Registration approved for:', updated.userId.email);

    const mailOptions = {
      from: 'dasisaisrivathsav20042@gmail.com',
      to: updated.userId.email,
      subject: 'Event Registration Approved',
      text: `Hi ${updated.userId.name},\n\nYour registration for the event has been approved.\n\nThank you!`,
    };

    let emailSent = false;
    try {
      const info = await transporter.sendMail(mailOptions);

      console.log('📧 sendMail result:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });

      if (info.accepted && info.accepted.length > 0) {
        emailSent = true;
        console.log('✅ Approval email sent');
      } else {
        console.warn('⚠️ Email was not accepted:', info);
      }
    } catch (emailError) {
      console.error('❌ Error sending approval email:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        full: emailError
      });
    }

    return res.json({
      message: 'Registration approved successfully',
      emailSent: emailSent,
      debug: {
        attempted: true,
        recipient: updated.userId.email
      }
    });

  } catch (err) {
    console.error('❌ Approval process failed:', {
      error: err.message,
      stack: err.stack,
      registrationId: req.params.registrationId
    });

    return res.status(500).json({
      message: 'Failed to approve registration',
      debug: { error: err.message }
    });
  }
});

// ✅ Reject registration and send email
app.delete('/api/registration/:registrationId', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(
      req.params.registrationId
    ).populate('userId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const mailOptions = {
      from: 'dasisaisrivathsav20042@gmail.com',
      to: registration.userId.email,
      subject: 'Event Registration Rejected',
      text: `Hi ${registration.userId.name},\n\nWe regret to inform you that your registration for the event has been rejected.\n\nRegards.`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Rejection email sent:', info.response);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.json({ message: 'Registration removed and user notified successfully' });
  } catch (err) {
    console.error('Rejection Error:', err);
    res.status(500).json({ message: 'Failed to remove registration' });
  }
});

//-----------user dashboard apis



app.get('/api/registered-events/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch first 5 registrations for the user
    const registrations = await Registration.find({ userId })
      .populate('eventId', 'name status')  // Populate event details (name, status)
      .limit(5);

    const events = registrations.map(reg => ({
      name: reg.eventId.name,
      status: reg.approved ? 'Approved' : 'Not Approved',
      eventId: reg.eventId._id
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ error: 'Failed to fetch registered events' });
  }
});

// GET endpoint to fetch all registered events for a user
app.get('/api/all-registered-events/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all registrations for the user
    const registrations = await Registration.find({ userId })
      .populate('eventId', 'name status')  // Populate event details (name, status)
      .exec();

    const events = registrations.map(reg => ({
      name: reg.eventId.name,
      status: reg.approved ? 'Approved' : 'Not Approved',
      eventId: reg.eventId._id
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching all registered events:', error);
    res.status(500).json({ error: 'Failed to fetch all registered events' });
  }
});

//--------------create event

app.post('/api/events', upload, async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      venue,
      club,
      department,
      status,
    } = req.body;

    let managers = req.body.managers || [];
    let volunteers = req.body.volunteers || [];

    if (typeof managers === 'string') managers = [managers];
    if (typeof volunteers === 'string') volunteers = [volunteers];

    const newEvent = new Event({
      name,
      description,
      date,
      startTime,
      endTime,
      venue,
      club,
      department,
      status,
      managers: managers.filter(m => mongoose.Types.ObjectId.isValid(m)).map(m => new mongoose.Types.ObjectId(m)),
      volunteers: volunteers.filter(v => mongoose.Types.ObjectId.isValid(v)).map(v => new mongoose.Types.ObjectId(v))
    });

    if (req.file) {
      newEvent.poster = req.file.buffer.toString('base64');
      newEvent.posterContentType = req.file.mimetype;
    }

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//--------email send approval
app.post('/api/registration/send-email/:registrationId', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('userId')
      .populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registrationId = registration._id.toString();
    const event = registration.eventId;
    const user = registration.userId;

    // ✅ Generate QR code (based on registration ID)
    const qrDataUrl = await QRCode.toDataURL(registrationId);  // returns base64 PNG

    // ✅ Email content
    const htmlBody = `
      <p>Hi ${user.name},</p>
      <p>Thank you for registering for the event: <strong>${event.name}</strong>.</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString("en-GB")}<br/>
         <strong>Time:</strong> ${event.startTime} - ${event.endTime}<br/>
         <strong>Venue:</strong> ${event.venue}</p>
      <p><strong>Your Registration ID:</strong> ${registrationId}</p>
      ${event.poster ? `<p><strong>Event Poster:</strong><br/>
         <img src="cid:eventPoster" style="max-width: 400px;" /></p>` : ''}
      <p><strong>Your QR Code:</strong><br/>
         <img src="cid:qrCode" style="max-width: 200px;" /></p>
      <p>Show this QR at the event to mark your attendance.</p>
      <p>Best regards,<br/>Event Team</p>
    `;

    // ✅ Build attachments array
    const attachments = [];

    if (event.poster) {
      attachments.push({
        filename: 'event-poster.jpg',
        content: Buffer.from(event.poster, 'base64'),
        contentType: event.posterContentType,
        cid: 'eventPoster'
      });
    }

    attachments.push({
      filename: 'registration-qr.png',
      content: qrDataUrl.split("base64,")[1], // Extract only the base64 part
      encoding: 'base64',
      contentType: 'image/png',
      cid: 'qrCode'
    });

    const mailOptions = {
      from: 'dasisaisrivathsav20042@gmail.com',
      to: user.email,
      subject: 'Your Event Registration with QR Code',
      html: htmlBody,
      attachments: attachments
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email with QR code sent:', info.response);
      res.json({ message: 'Email sent successfully with QR code and poster', emailSent: true });
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
      res.status(500).json({ message: 'Failed to send email', emailSent: false });
    }

  } catch (err) {
    console.error('Error in sending registration email:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//qr code verify

app.get('/api/registration/verify/:registrationId', async (req, res) => {
  try {
    const registrationId = req.params.registrationId;

    // Find registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update attended status
    if (!registration.attended) {
      registration.attended = true;
      await registration.save();
    }

    res.status(200).json({ message: 'QR code verified. Attendance marked.', attended: true });
  } catch (error) {
    console.error('Error verifying QR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//attendance track

app.get('/api/events/:eventId/attendees', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Optional: Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find all registrations for the event where attended === true
  const registrations = await Registration.find({
  eventId,
  approved: true,     // ✅ Add this
  attended: true
}).populate('userId', 'name email');

    // Format response
    const attendees = registrations.map((reg) => ({
      name: reg.userId.name,
      email: reg.userId.email,
      timestamp: reg.timestamp,
    }));

    res.json({
      eventName: event.name,
      attendees,
    });
  } catch (err) {
    console.error("Error fetching attendees:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/events/:eventId/analytics', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Find all attendees
    const registrations = await Registration.find({ eventId, attended: true }).populate('userId');

    const totalAttendees = registrations.length;

    // Aggregate data
    const occupationCounts = {};
    const departmentCounts = {};
    const yearCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (let reg of registrations) {
      const user = reg.userId;

      // Occupation
      occupationCounts[user.occupation] = (occupationCounts[user.occupation] || 0) + 1;

      // Department
      departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;

      // Year (only for students)
      if (user.occupation === 'student' && user.studentDetails?.year) {
        yearCounts[user.studentDetails.year]++;
      }
    }

    res.json({
      totalAttendees,
      occupationCounts,
      departmentCounts,
      yearCounts,
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Running at 3001");
});
