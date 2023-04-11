const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const requestify = require("requestify");
const session = require("express-session");
const port = 5000;

const app = express();
app.use(
  session({
    secret: "1234567890QWERT",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// MONGOOSE
mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb+srv://Rishab829:Kanchan%401@expresstry.wqhmyb0.mongodb.net/hack2?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("We are connected bro");
});

//Schema
var donateSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  drugName: String,
  exp: String,
  qtySelected: String,
  qty: String,
  snippet: String,
  highlight: String,
});

var userAddress = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  drugName: String,
  qty: String,
});

var requestMedicine = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  reqMed: String,
});

//Model
var Medicine = mongoose.model("Medicine", donateSchema);
var Useraddress = mongoose.model("Useraddress", userAddress);
var Reqmedicine = mongoose.model("Reqmedicine", requestMedicine);

let snippet = "";
let highlight = "";

app.get("/images", (req, res) => {
  // medName = req.query.query.replace(/ /g, "+");
  // let url = `https://serpapi.com/search.json?q=${medName}+details+1mg&location=Maharashtra,+India&hl=hi&gl=in&google_domain=google.co.in&key=5d1b79b4ee809fa8365d09f2d36a866dda3b7e1e2f93ad1c59726eff1454f4f2`;
  let url = `https://serpapi.com/search.json?q=apple+details+1mg&location=Maharashtra,+India&hl=hi&gl=in&google_domain=google.co.in&key=5d1b79b4ee809fa8365d09f2d36a866dda3b7e1e2f93ad1c59726eff1454f4f2`;
  requestify.get(url).then(function (response) {
    // snippet = response.getBody().organic_results[0].snippet;
    // highlight =
    //   response.getBody().organic_results[0].snippet_highlighted_words[0];
    snippet = response.getBody();
    highlight = response.getBody();
  });
});

app.post("/donate", (req, res) => {
  req.body.snippet = snippet;
  req.body.highlight = highlight;
  let date = req.body.exp;
  date = date.replace(/-/g, "/");
  date = date.split("/").reverse().join("/");
  req.body.exp = date;
  console.log("yoop");
  var myData = new Medicine(req.body);
  console.log(myData);
  myData
    .save()
    .then(() => {
      console.log("done");
      res.send("This data has been saved to the database");
    })
    .catch(() => {
      console.log("not done");
      res.status(400).send("Item was not saved to the database");
    });
});

app.get("/getmedicine", (req, res) => {
  let view;
  async function viewMedicines() {
    view = await db.collection("medicines").find().toArray();
    res.json(view);
  }
  viewMedicines();
});

app.get("/medicinerequests", (req, res) => {
  let view;
  async function viewMedicines() {
    view = await db.collection("reqmedicines").find().toArray();
    res.json(view);
  }
  viewMedicines();
});

app.get("/donated", (req, res) => {
  let view;
  async function getDonated() {
    view = await db
      .collection("medicines")
      .find({ name: `${req.query.name}` })
      .toArray();
    // view = await db.collection('medicines').find(`{name: ${req.query.name}}`).toArray();
    res.json(view);
  }
  getDonated();
});

app.get("/delivery", (req, res) => {
  let view;
  async function getDelivery() {
    view = await db.collection("useraddresses").find().toArray();
    res.json(view);
  }
  getDelivery();
});

app.post("/userinfo", (req, res) => {
  var myData = new Useraddress(req.body);
  console.log(myData);
  myData
    .save()
    .then(() => {
      console.log("done");
      res.send("This data has been saved to the database");
    })
    .catch(() => {
      console.log("not done");
      res.status(400).send("Item was not saved to the database");
    });
});

app.post("/reqmed", (req, res) => {
  var myData = new Reqmedicine(req.body);
  myData
    .save()
    .then(() => {
      console.log("done");
      res.send("This data has been saved to the database");
    })
    .catch(() => {
      console.log("not done");
      res.status(400).send("Item was not saved to the database");
    });
});

app.listen(port, () => console.log("Connected to port " + port));
