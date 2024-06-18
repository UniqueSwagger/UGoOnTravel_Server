const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;
//middleware
app.use(cors({
  origin:[
    "http://localhost:3000/",
    "https://ugoontravel-43d92.web.app/"
  ]
}));
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
    const usersCollection = database.collection("users");
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
    //post users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //get users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });

    //externally made for google or github sign in
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //role play updating for admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //getting admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening to the port ", port);
});
