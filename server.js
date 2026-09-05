const express = require('express');
const app = express();
const path = require('path');
mongoClient = require('mongodb').MongoClient;

const PORT = 3030;
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const  MONGO_URL = 'mongodb://delta_admin:delta_password@localhost:27017';
const client = new mongoClient(MONGO_URL);

//Get all the user
app.get("/getUsers", async (req, res)=> {
    await client.connect(URL);
    console.log("Connected to server");

    const db = client.db("my-sample-db");
    const data = await db.collection("users").find().toArray();

    client.close();
    res.send(data);
});

//post new user
app.post("/addUser", async (req, res) => {
    const userObj = req.body;
    console.log(req.body);
    await client.connect(URL);
    console.log("Connected to server");

    const db = client.db("my-sample-db");
    const data = await db.collection("users").insertOne(userObj);
    console.log(data);
    console.log("data inserted successfully");
    client.close();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});