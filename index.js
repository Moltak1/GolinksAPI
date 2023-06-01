const express = require("express");
const { Octokit } = require("@octokit/core");
// Create an Express app and listen for incoming requests on railway port
const app = express();
const router = express.Router();
const port = process.env.PORT;

app.use(express.urlencoded({extended: true}));
// Handle GET requests to the root URL
router.get("/", (req, res) => {
  res.send("This is a post api");
});

//Octokit for github api
const octokit = new Octokit({
  auth: process.env.api_key
})

// Handle POST requests to api url
router.post("/", (req, res) => {
  console.log(req.query);
  res.send("Webhook 1 successfully received.");
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port);