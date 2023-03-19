const express = require("express");
const cors = require("cors");
const app = express();
const { addScore, getScore } = require("./api-endpoints.js");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/score/:userid", async (req, res) => {
  const userId = req.params.userid;
  try {
    const querySet = await getScore(userId);
    res.json(querySet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

app.post("/score", async (req, res) => {
  const entry = req.body;
  console.log(entry);
  try {
    const newEntry = await addScore(entry);
    res.json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

const port = process.env.EXPRESS_PORT;
app.listen(port, () => {
  console.log(`listening on port port`);
});
