import mongoose from 'mongoose';
import Event from './models/events.js'; // adjust path as needed

const MONGO_URI = "mongodb://localhost:27017/majorproject"; // Update your DB name

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const events = await Event.find({});

    for (const event of events) {
      if (typeof event.registeredUserIds === "string") {
        const idArray = event.registeredUserIds
          .split("|")
          .filter(id => id.length === 24)
          .map(id => new mongoose.Types.ObjectId(id));

        event.registeredUserIds = idArray;
        await event.save();
        
      }
    }

    console.log("Migration completed.");
    mongoose.disconnect();
  })
  .catch(err => console.error("DB connection error:", err));
