const express = require("express");
const { Octokit } = require("@octokit/core");
const { query, response } = require("express");


// Create an Express app and listen for incoming requests on railway port
const app = express();
const router = express.Router();
const port = process.env.PORT;

app.use(express.urlencoded({extended: true}));


//Simple frontend
router.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

//Octokit for github api
const octokit = new Octokit({
  auth: process.env.api_key
});

// Handle POST requests to api url
router.get("/api", async (req, res) => {
  //Chceck for username and forked queries
  let username
  if (typeof req.query.username === "string") {
    username = req.query.username;
  } else {
    res.status(400);
    res.send("No name provided, or name was invalid");
    return
  }
  let forked = true
  if (req.query.forked) {
    forked = req.query.forked === "true"
  }
  console.log(forked)

  let repocount = 0
  let stargazers = 0
  let forks = 0
  let sizes = 0
  let languages = {}

  //parse github search api response
  function parseRepo(repo) {
    if (forked === false && repo.fork === true) {
      console.log("skipped")
      console.log(repo)
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
        addLanguage(language)
      }
    }
    else {
      addLanguage(repo.language)
    }
  }

  //send github search api call
  let page = 1
  do {
  const response = await octokit.request('GET /users/{username}/repos', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    },
    username: username,
    per_page: 100,
    page: page
  })
  page++
  response.forEach(parseRepo)
  }
  while (response.incomplete_results == true)

  //sort languages
  const languages_sorted = []
  for (let language in languages) {
    languages_sorted.push([language, languages[language]]);
  }

  languages_sorted.sort((a,b) => b[1] - a[1]);

  //Calculate unites for average size
  let units = ["KB", "MB", "GB"]
  let size_unit = 0
  let reduced_size = sizes / repocount
  while (reduced_size >= 1000) {
    size_unit++
    reduced_size = reduced_size / 1000
  }


  //output json
  const output = {
    "Repo Count" : repocount,
    "Stargazer Count" : stargazers,
    "Forks Count" : forks,
    "Average Size": reduced_size.toFixed(2) + units[size_unit],
    "Languages": languages_sorted,
  };
  res.send(JSON.stringify(output));
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port);