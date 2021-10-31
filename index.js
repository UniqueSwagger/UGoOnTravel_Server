const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("Running UGoOnTravel Server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spl8q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("travelDb");
    const packageCollection = database.collection("packages");
    const bookingCollection = database.collection("bookings");

    //get all packages
    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find({}).toArray();
      res.send(result);
    });

    //post package
    app.post("/newPackage", async (req, res) => {
      const result = await packageCollection.insertOne(req.body);
      res.send(result);
    });

    //get any particular package filtered by id

    app.get("/packages/:packageId", async (req, res) => {
      const packageId = req.params.packageId;
      const result = await packageCollection.findOne({
        _id: ObjectId(packageId),
      });
      res.send(result);
    });

    //post booking info

    app.post("/booking/", async (req, res) => {
      const bookingInfo = req.body;
      const result = await bookingCollection.insertOne(bookingInfo);
      res.send(result);
    });

    //get registeredBooking info filtered by email ID
    app.get("/bookingInfo/:id", async (req, res) => {
      const emailId = req.params.id;
      const result = await bookingCollection.find({ email: emailId }).toArray();
      res.send(result);
    });

    //get all booking info
    app.get("/bookingInfo", async (req, res) => {
      const result = await bookingCollection.find({}).toArray();
      res.send(result);
    });

    //delete any particular booking
    app.delete("/registeredBooking/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookingCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //update status
    app.put("/registeredBooking/:id", async (req, res) => {
      const newStatus = req.body.status;
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: newStatus,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening to the port ", port);
});
