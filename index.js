const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// pawMartUser;
// aXGxzkOuwxetTAZL;
const uri =
  'mongodb+srv://pawMartUser:aXGxzkOuwxetTAZL@cluster0.4k43auc.mongodb.net/?appName=Cluster0';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Bismillah');
});

async function run() {
  try {
    await client.connect();
    const pawMartDB = client.db('pawMartDB');

    //   ---Listings---
    const listingCollection = pawMartDB.collection('petListings');

    app.get('/latest_listings', async (req, res) => {
      const projectFields = {
        name: 1,
        price: 1,
        category: 1,
        image: 1,
        location: 1,
      };
      const cursor = listingCollection
        .find({})
        .sort({ price: 1 })
        .skip(5)
        .limit(6)
        .project(projectFields);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get('/listings', async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = listingCollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get('/listings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listingCollection.findOne(query);
      res.send(result);
    });

    app.post('/listings', async (req, res) => {
      const newListings = req.body;
      const result = await listingCollection.insertOne(newListings);
      res.send(result);
    });

    app.delete('/listings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listingCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/listings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateListing = req.body;
      const update = { $set: { ...updateListing } };
      const result = await listingCollection.updateOne(query, update);
      res.send(result);
    });

    //   ---Orders---
    const orderCollection = pawMartDB.collection('orders');

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
