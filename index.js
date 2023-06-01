const express = require("express");
const { Octokit } = require("@octokit/core");
const { query } = require("express");
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
router.post("/", async (req, res) => {
  //Chceck for username and forked queries
  let username
  if (typeof req.query.username === "string") {
    username = req.query.name;
  } else {
    res.status(400);
    res.send("No name provided, or name was invalid");
    return
  }
  let forked = true
  if (req.query.forked) {
    forked = req.query.forked === "true"
  }

  //send github search api call
  const response = await octokit.request('GET /search/repositories', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
    q: 'user:Moltak1'
  })

  //parse github search api response
  function parseRepo(repo) {
    console.log(forked)
    console.log(repo)
  }
  response.data.items.forEach(parseRepo)

  //output json
  res.send("Webhook 1 successfully received.");
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port);