const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

app.get("/", (req, res) => {
  res.send("hello world");
});

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("hireloop_db");
    const jobCollection = db.collection("Jobs");
    const companyCollection = db.collection("companies");
    const userCollection = db.collection("user");
    const applicationsCollection = db.collection("applications");
    const plansCollection = db.collection("plans");
    const subscriptionCollection = db.collection("subscriptions")

    app.get("/api/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/jobs", async (req, res) => {
      const query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date(),
      };
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    app.get("/api/applications", async (req, res) => {
      const query = {};
      if (req.query.applicationId) {
        query.applicationId = req.query.applicationId;
      }
      if ((req, query.jobId)) {
        query.jobId = req.query.jobId;
      }
      const result = await applicationsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/api/applications", async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date(),
      };
      const result = await applicationsCollection.insertOne(newApplication);
      res.send(result);
    });

    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.get("/api/companies", async (req, res) => {
      const result = await companyCollection.find().skip(1).toArray();
      res.send(result);
    });

    app.get("/api/my/companies", async (req, res) => {
      if (!req.query.recruiterId) {
        return res.send({});
      }
      const result = await companyCollection.findOne({
        recruiterId: req.query.recruiterId,
      });
      res.send(result || {});
    });

    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date(),
      };
      const result = await companyCollection.insertOne(newCompany);
      res.send(result);
    });

    app.patch("/api/companies/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      delete updatedData._id; // _id update kora jay na

      const result = await companyCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.send(result);
    });

    //plans
    app.get("/api/plans", async (req, res) => {
      const query = {};
      if(req.query.plan_id){
        query.id = req.query.plan_id
      }
      const plan = await plansCollection.findOne(query);
      res.send(plan);
    });

    //subscription
    app.post("/api/subscriptions", async(req,res)=>{
      const data = req.body;
      const subsInfo = {
        ...data,
        createdAt: new Date()
      }
      const result = await subscriptionCollection.insertOne(subsInfo);
      res.send(result)

      //update user info
      const filter = {email: data.email};
      const updateDocument = {
        $set: {
          plan: data.planId
        }
      }
      const updateResult = await userCollection.updateOne(filter,updateDocument)
      res.send(updateResult)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
