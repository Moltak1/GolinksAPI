const express = require("express");
const { Octokit } = require("@octokit/core");
const { query } = require("express");
// Create an Express app and listen for incoming requests on railway port
const app = express();
const router = express.Router();
const port = process.env.PORT;

app.use(express.urlencoded({extended: true}));

//Octokit for github api
const octokit = new Octokit({
  auth: process.env.api_key
})

// Handle POST requests to api url
router.get("/", async (req, res) => {
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
    q: 'user:' + username
  })

  let repocount = 0
  let stargazers = 0
  let forks = 0
  let sizes = 0
  let languages = {}

  //parse github search api response
  function parseRepo(repo) {
    if (forked === false && repo.fork === true) {
      return
    };
    repocount++;
    stargazers += repo.stargazers_count;
    forks += repo.forks_count;
    sizes += repo.size
    
    function addLanguage(language) {
      if (language in languages) {
          languages[language] = languages[language] + 1
        }
        else {
          languages[language] = 1
        }
    }
    console.log(repo.language)
    if (typeof repo.language === "object") {
      for (let language in repo.language) {
        console.log(language)
        addLanguage(language)
      }
    }
    else {
      addLanguage(repo.language)
    }
  }
  response.data.items.forEach(parseRepo)


  //output json
  const output = {
    "Repo Count" : repocount,
    "Stargazer Count" : stargazers,
    "Forks Count" : forks,
    "Average Size": sizes / repocount,
    "Languages": languages,
  };
  res.send(JSON.stringify(output));
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port);