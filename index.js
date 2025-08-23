const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//pUu3xf0NAn0W3mAT jahedulislamdev

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.em1xxyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // core collections
        const database = client.db("core");
        const userCollection = database.collection("users");
        const projectCollection = database.collection("foods");
        const transactionsCollection = database.collection("transactions");
        const reviewCollection = database.collection("reviews");
        // ui collections
        const ui = client.db("ui");
        const bannerCollection = ui.collection("banners");
        const footerCollection = ui.collection("footers");
        // jwt authentication
        app.post("/jwt", async (req, res) => {});

        // --------------------------- All post api for individual collections---------------------------//
        // create new user
        app.post("/users", async (req, res) => {
            const userData = req.body;
            userData.createdAt = new Date();
            userData.updatedAt = new Date();
            const result = await userCollection.insertOne(userData);
            res.send(result);
        });
        // create new food data
        app.post("/projects", async (req, res) => {
            const foodData = req.body;
            foodData.createdAt = new Date();
            foodData.updatedAt = new Date();
            console.log(foodData);
            const result = await foodCollection.insertOne(foodData);
            console.log(result);
            res.send(result);
        });
        // create new transaction
        app.post("/transactions", async (req, res) => {
            const transactionData = req.body;
            transactionData.createdAt = new Date();
            transactionData.updatedAt = new Date();
            console.log(transactionData);
            const result = await transactionsCollection.insertOne(
                transactionData,
            );
            console.log(result);
            res.send(result);
        });
        // create new review
        app.post("/reviews", async (req, res) => {
            const reviewData = req.body;
            reviewData.createdAt = new Date();
            reviewData.updatedAt = new Date();
            console.log(reviewData);
            const result = await reviewCollection.insertOne(reviewData);
            console.log(result);
            res.send(result);
        });
        // create banner data
        app.post("/banners", async (req, res) => {
            const bannerData = req.body;
            bannerData.createdAt = new Date();
            bannerData.updatedAt = new Date();
            console.log(bannerData);
            const result = await bannerCollection.insertOne(bannerData);
            console.log(result);
            res.send(result);
        });
        // create footer data
        app.post("/footers", async (req, res) => {
            const footerData = req.body;
            footerData.createdAt = new Date();
            footerData.updatedAt = new Date();
            console.log(footerData);
            const result = await footerCollection.insertOne(footerData);
            console.log(result);
            res.send(result);
        });

        // --------------------------- All get api for individual collections---------------------------//
        // get all users
        app.get("/users", async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });
        // get individual user
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });
        app.get("/foods", async (req, res) => {
            const foods = await foodCollection.find().toArray();
            res.send(foods);
        });
        // get individual food
        app.get("/foods/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollection.findOne(query);
            res.send(result);
        });
        app.get("/transactions", async (req, res) => {
            const transactions = await transactionsCollection.find().toArray();
            res.send(transactions);
        });
        app.get("/reviews", async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews);
        });
        app.get("/banners", async (req, res) => {
            const banners = await bannerCollection.find().toArray();
            res.send(banners);
        });
        app.get("/footers", async (req, res) => {
            const footers = await footerCollection.find().toArray();
            res.send(footers);
        });
        // --------------------------- edit and update api---------------------------//
        // update user information
        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedUser = {
                $set: {
                    profile: updateInfo.profile,
                    updatedAt: new Date(),
                },
            };
            const result = await userCollection.updateOne(query, updatedUser);
            res.send(result);
        });
        // edit and update individual food
        app.put("/foods/:id", async (req, res) => {
            const foodId = req.params.id;
            const updateInfo = req.body;
            const query = { _id: new ObjectId(foodId) };
            const updatedFood = {
                $set: {
                    foodName: updateInfo.foodName,
                    foodImage: updateInfo.foodImage,
                    foodQuantity: updateInfo.foodQuantity,
                    pickupLocation: updateInfo.pickupLocation,
                    expiredDateOrTime: updateInfo.expiredDateOrTime,
                    additionalNote: updateInfo.additionalNote,
                    foodStatus: updateInfo.foodStatus,
                    updatedAt: new Date(),
                },
            };
            const result = await foodCollection.updateOne(query, updatedFood);
            res.send(result);
        });
        // edit and update banner or slider
        app.put("/banners/:id", async (req, res) => {
            const bannerId = req.params.id;
            const query = { _id: new ObjectId(bannerId) };
            const updatedBannerInfo = req.body;
            const updatedBanner = {
                $set: {
                    bannerImg: updatedBannerInfo.bannerImg,
                    status: updatedBannerInfo.status,
                    title: updatedBannerInfo.title,
                    subtitle: updatedBannerInfo.subtitle,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            };
            const result = await bannerCollection.updateOne(
                query,
                updatedBanner,
                { upsert: true },
            );
            res.send(result);
        });
        // edit and update footers
        app.put("/footers/:id", async (req, res) => {
            const footerId = req.params.id;
            const query = { _id: new ObjectId(footerId) };
            const updatedFooterInfo = req.body;
            const updatedFooter = {
                $set: {
                    brandImage: updatedFooterInfo.brandImage,
                    footerText: updatedFooterInfo.footerText,
                    quickLinks: updatedFooterInfo.quickLinks,
                    socialLinks: updatedFooterInfo.socialLinks,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            };
            const result = await footerCollection.updateOne(
                query,
                updatedFooter,
            );
            res.send(result);
        });
        // --------------------------- All delete api for individual collections---------------------------//
        // delete user api
        app.delete("/users/:email", async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });
        // delete food api
        app.delete("/foods/:id", async (req, res) => {
            const foodId = req.params.id;
            const query = { _id: new ObjectId(foodId) };
            const result = await foodCollection.deleteOne(query);
            res.send(result);
        });
        // delete transaction api
        app.delete("/transactions/:id", async (req, res) => {
            const transactionId = req.params.id;
            const query = { _id: new ObjectId(transactionId) };
            const result = await transactionsCollection.deleteOne(query);
            res.send(result);
        });
        // delete review api
        app.delete("/reviews/:id", async (req, res) => {
            const reviewId = req.params.id;
            const query = { _id: new ObjectId(reviewId) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });
        // delete banner api
        app.delete("/banners/:id", async (req, res) => {
            const bannerId = req.params.id;
            const query = { _id: new ObjectId(bannerId) };
            const result = await bannerCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
    res.send("shareVites server is Running.");
});

app.listen(port, () => {
    console.log(`server is running on the port ${port}`);
});
