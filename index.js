const express = require("express")
const cors = require("cors")
const app = express()
const port = 5000
require('dotenv').config()

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');

app.get('/', (req,res)=>{
    res.send('hello world')
})




const uri = process.env.MONGODB_URI


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("hireloop_db")
    const jobCollection = db.collection("Jobs")

    app.post('/api/jobs', async(req,res)=>{
        const job = req.body;
        const result = await jobCollection.insertOne(job);
        res.send(result)
    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`app listening on port ${port}`);
})