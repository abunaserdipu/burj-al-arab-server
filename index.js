const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8tihy.mongodb.net/Simple-Project?retryWrites=true&w=majority`;

const port = 7000;

app.get("/", (req, res) => {
  res.send("hello from db it's working");
});

const app = express();
app.use(cors());
app.use(express.json());

var serviceAccount = require("./configs/burj-al-arabwithreact-firebase-adminsdk-okqgx-6a8508a062.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookingsCollection = client.db("burj-al-arab").collection("bookings");
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookingsCollection.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookingsCollection
              .find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              });
          } else {
            res.status(401).send("Unauthorized access!");
          }
        })
        .catch((error) => {
          // Handle error
        });
    } else {
      res.status(401).send("Unauthorized access!");
    }
  });
});

app.listen(process.env.PORT || port);
