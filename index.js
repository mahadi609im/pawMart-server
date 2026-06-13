const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (আপনার .env ফাইলে DB_USER এবং DB_PASS সেট থাকতে হবে)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4k43auc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ডাটাবেস কানেকশন হ্যান্ডলার (সার্ভারলেস ফাংশনের জন্য)
let dbConnection = null;

async function getDB() {
  if (dbConnection) return dbConnection;
  try {
    await client.connect();
    dbConnection = client.db('pawMartDB');
    console.log("Connected to MongoDB!");
    return dbConnection;
  } catch (err) {
    console.error("Connection failed", err);
    throw err;
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Bismillah, Server is running successfully!');
});

// Latest Listings
app.get('/latest_listings', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('petListings');
    const projectFields = { name: 1, price: 1, category: 1, image: 1, location: 1 };
    
    const result = await collection.find({}).sort({ price: 1 }).skip(5).limit(6).project(projectFields).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch listings' });
  }
});

// Blogs
app.get('/blogs', async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection('blogs').find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch blogs' });
  }
});

// Listings
app.get('/listings', async (req, res) => {
  try {
    const db = await getDB();
    const email = req.query.email;
    const query = email ? { email } : {};
    const result = await db.collection('petListings').find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch listings' });
  }
});

// Single Listing
app.get('/listings/:id', async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.id;
    const result = await db.collection('petListings').findOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch listing' });
  }
});

// Create Listing
app.post('/listings', async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection('petListings').insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to create listing' });
  }
});

// Delete Listing
app.delete('/listings/:id', async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection('petListings').deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete listing' });
  }
});

// Update Listing
app.patch('/listings/:id', async (req, res) => {
  try {
    const db = await getDB();
    const update = { $set: { ...req.body } };
    const result = await db.collection('petListings').updateOne({ _id: new ObjectId(req.params.id) }, update);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to update listing' });
  }
});

// Orders
app.get('/myOrders', async (req, res) => {
  try {
    const db = await getDB();
    const email = req.query.email;
    const query = email ? { email } : {};
    const result = await db.collection('orders').find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch orders' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const db = await getDB();
    const newOrder = req.body;
    if (newOrder.category === 'Pets') newOrder.quantity = 1;
    const result = await db.collection('orders').insertOne(newOrder);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to place order' });
  }
});

// Vercel এর জন্য এক্সপোর্ট
module.exports = app;
