// downloadCollection.js
import { MongoClient } from 'mongodb';
import fs from 'fs';

// Replace with your actual connection string and details
const uri = 'mongodb+srv://dasisaisrivathsav20042:Lw0f91PfrXfMtLCy@cluster0.ctbhh4w.mongodb.net/majorproject?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'majorproject';
const collectionName = 'users';

async function downloadCollection() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection.find({}).toArray();
    fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${collectionName}.json`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

downloadCollection();
