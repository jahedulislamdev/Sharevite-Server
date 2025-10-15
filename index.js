require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

// middlewares
app.use(
    cors({
        origin: ["http://localhost:5173", "https://sharevite-2ccb7.web.app"],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

// database uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.em1xxyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// custom middlewares
const verifyJwt = (req, res, next) => {
    // token checking..
    const token = req.cookies?.access_token;
    if (!token) {
        return res.status(401).send({ message: "Unauthorized user" }); // ta ta, goodbye, bye bye
    }
    if (!process.env.JWT_PRIVATE_KEY) {
        throw new Error("JWT_PRIVATE_KEY is not defined!");
    }
    // token verify
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Access Forbidden" });
        } else {
            // Attach the decoded user to the request object
            req.user = decoded;
            next();
        }
    });
};

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // core collections
        const database = client.db("core");
        const userCollection = database.collection("users");
        const campaignCollection = database.collection("campaigns");
        const transactionsCollection = database.collection("transactions");
        const reviewCollection = database.collection("reviews");
        // ui collections
        const ui = client.db("ui");
        const bannerCollection = ui.collection("banners");
        const footerCollection = ui.collection("footers");

        // admin verify
        const verifyAdmin = async (req, res, next) => {
            try {
                const userEmail = req.user.email;
                const query = { email: userEmail };
                const result = await userCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ message: "user not found!" });
                }
                if (result?.role !== "admin") {
                    return res
                        .status(403)
                        .send({ message: "Forbidden Access" });
                }
                next();
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
        };

        // jwt authentication
        app.post("/jwt", async (req, res) => {
            // get userCredential (payload)
            const user = req.body;
            // console.log(user);
            // create a token
            const token = jwt.sign(user, process.env.JWT_PRIVATE_KEY, {
                expiresIn: "1h",
            });
            // console.log(token);
            // send the token to client browser cookie
            res.cookie("access_token", token, {
                // we need to declare some important methods for security purpose
                httpOnly: true,
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production" ? true : false,
            });
            res.send({ success: true });
        });

        // clear jwt when user logout
        app.post("/logout", async (req, res) => {
            // get user credentioal
            const credential = req.body;
            // res.clearcookie
            res.clearCookie("access_token", { maxAge: 0 }).send({
                message: "User Successfully logout!",
            });
        });

        // --------------------------- All post api for individual collections ---------------------------//
        // create new user
        app.post("/users", async (req, res) => {
            const userData = req.body;
            const defaultData = {
                createdAt: new Date(),
                role: "user",
                donationHistory: [],
                volunteerHistory: [],
                preferences: { newsletter: false, emailNotification: false },
                isActive: true,
                userData: new Date(),
            };
            const allData = { ...userData, ...defaultData };
            const result = await userCollection.insertOne(allData);
            res.send(result);
        });
        // create new campaign data
        app.post("/campaigns", async (req, res) => {
            const campaignsData = req.body;
            campaignsData.createdAt = new Date();
            campaignsData.updatedAt = new Date();
            // console.log(campaignsData);
            const result = await campaignCollection.insertOne(campaignsData);
            // console.log(result);
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
        // get admin status
        app.get("/users/admin/:email", verifyJwt, async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            admin = user?.role === "admin";
            res.send({ admin });
        });
        // get all users
        app.get("/users", verifyJwt, verifyAdmin, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });
        // get individual user
        app.get("/users/:email", verifyJwt, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });
        app.get("/campaigns", async (req, res) => {
            const foods = await campaignCollection.find().toArray();
            res.send(foods);
        });
        // get individual project
        app.get("/campaign/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.findOne(query);
            res.send(result);
        });
        app.get("/transactions", verifyJwt, async (req, res) => {
            const transactions = await transactionsCollection.find().toArray();
            res.send(transactions);
        });
        app.get("/reviews", verifyJwt, async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews);
        });
        app.get("/banners", verifyJwt, async (req, res) => {
            const banners = await bannerCollection.find().toArray();
            res.send(banners);
        });
        app.get("/footers", verifyJwt, async (req, res) => {
            const footers = await footerCollection.find().toArray();
            res.send(footers);
        });

        // --------------------------- edit and update api---------------------------//
        // update user login information (google auth) and login
        app.patch("/users/:email", async (req, res) => {
            const email = req.params.email;
            let { photoUrl, provider, ...otherData } = req.body;
            if (photoUrl) {
                photoUrl = photoUrl.replace(/s96-c/, "s200-c");
            }
            const defaultData = {
                createdAt: new Date(),
                role: "user",
                donationHistory: [],
                volunteerHistory: [],
                preferences: { newsletter: false, emailNotification: false },
                isActive: true,
            };
            const existingUser = await userCollection.findOne({ email });

            let updatedPayload = { ...otherData, lastLogin: new Date() };
            if (photoUrl) updatedPayload.photoUrl = photoUrl;
            if (provider) updatedPayload.provider = provider;

            // only set defaults if user does not exist
            if (!existingUser) {
                updatedPayload = { ...updatedPayload, ...defaultData };
            }
            const result = await userCollection.updateOne(
                { email },
                { $set: updatedPayload },
                { upsert: true },
            );
            res.send(result);
        });

        // edit and update campaign
        app.patch(
            "/campaigns/:id",
            verifyJwt,
            verifyAdmin,
            async (req, res) => {
                const campaignId = req.params.id;
                const updateInfo = req.body;
                console.log(updateInfo, campaignId);
                const query = { _id: new ObjectId(campaignId) };
                const updatedCampaign = {
                    $set: {
                        title: updateInfo.title,
                        category: updateInfo.category,
                        shortDescription: updateInfo.shortDescription,
                        location: updateInfo.location || [],
                        goal: updateInfo.goal,
                        lastDate: updateInfo.lastDate,
                        organizer: updateInfo.organizer,
                        status: updateInfo.status,
                        images: updateInfo.images || [],
                        collected: updateInfo.collected,
                        description: updateInfo.description,
                        updatedAt: new Date(),
                    },
                };
                const result = await campaignCollection.updateOne(
                    query,
                    updatedCampaign,
                );
                res.send(result);
            },
        );
        // edit and update banner or slider
        app.patch("/banners/:id", verifyJwt, async (req, res) => {
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
        app.patch("/footers/:id", verifyJwt, async (req, res) => {
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
        app.delete("/users/:email", verifyJwt, async (req, res) => {
            const userEmail = req.params.email;
            console.log(userEmail);
            const query = { email: userEmail };
            const result = await userCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        // delete campaign api
        app.delete("/campaigns/:id", verifyJwt, async (req, res) => {
            const campaignId = req.params.id;
            // console.log(campaignId);
            const query = { _id: new ObjectId(campaignId) };
            const result = await campaignCollection.deleteOne(query);
            // console.log(result);
            res.send(result);
        });

        // delete transaction api
        app.delete("/transactions/:id", verifyJwt, async (req, res) => {
            const transactionId = req.params.id;
            const query = { _id: new ObjectId(transactionId) };
            const result = await transactionsCollection.deleteOne(query);
            res.send(result);
        });

        // delete review api
        app.delete("/reviews/:id", verifyJwt, async (req, res) => {
            const reviewId = req.params.id;
            const query = { _id: new ObjectId(reviewId) };
            const result = await reviewCollection.deleteOne(query);
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
app.listen(port, console.log(`server running on port ${port}`));
