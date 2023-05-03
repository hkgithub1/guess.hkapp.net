import React, { useState } from "react";
import {
  Grid,
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from "@mui/material";
import MD5 from "crypto-js/md5";
import background from "../images/background.jpg";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

export default function HomePage() {
  //Variables and tags.
  const [userId, setUserId] = useState("");
  const [tries, setTries] = useState(3);
  const [difficultyLevel, setDifficultyLevel] = useState(10);
  const [loading, setLoading] = useState(false);
  const [correct, setCorrect] = useState();
  const [revealAnswer, setRevealAnswer] = useState(false);

  //Marvel API variables and handlers.
  const [results, setResults] = useState([]);
  const getMarvelData = () => {
    setLoading(true);
    const min = Math.ceil(2);
    const max = Math.floor(100143);
    const comicId = Math.floor(Math.random() * (max - min) + min);
    const timeStamp = Date.now().toString();
    const hash = MD5(
      timeStamp +
        process.env.REACT_APP_MARVEL_API_PRIVATE_KEY +
        process.env.REACT_APP_MARVEL_API_PUBLIC_KEY
    ).toString();

    const url = `https://gateway.marvel.com/v1/public/comics/${comicId}?ts=${timeStamp}&apikey=${process.env.REACT_APP_MARVEL_API_PUBLIC_KEY}&hash=${hash}&format=comic`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.code == 404) {
          console.log("not found");
          getMarvelData();
        } else if (data.data.results?.[0]?.images?.[0]?.path) {
          setResults(data.data.results);
        } else {
          console.log("no image");
          getMarvelData();
        }
      });

    setLoading(false);
    setAnswer("");
    setCorrect("");
    setRevealAnswer(false);
  };

  //Answer variables and handlers.
  const [answer, setAnswer] = useState();
  const answerButtonPressed = () => {
    const solution = new Date(results?.[0]?.dates?.[0]?.date).getFullYear();
    if (
      answer >= solution - difficultyLevel &&
      answer <= +solution + +difficultyLevel
    ) {
      setCorrect(true);
      setCurrentScore(currentScore + 1);
    } else {
      setTries(tries - 1);
      setRevealAnswer(true);
      setAnswer("");
    }
  };

  //High score variables and handlers.
  const [data, setData] = useState();
  const [currentScore, setCurrentScore] = useState(0);
  const getScore = () => {
    const url = `${process.env.REACT_APP_BACKEND_API_URL}/score/${userId}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        console.log(data);
      });
  };
  const postScore = () => {
    const date = new Date();
    const timeStamp = date.toLocaleString();
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      url: `${process.env.REACT_APP_BACKEND_API_URL}/score`,
      body: JSON.stringify({
        UserId: userId,
        SessionId: timeStamp,
        Score: currentScore,
      }),
    };
    fetch(`${process.env.REACT_APP_BACKEND_API_URL}/score`, options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));

    alert("Score Posted Successfully");
  };

  //Rendering functions for ImageArea, Settings, PlayArea. and ScoreTable.
  const renderImageArea = () => {
    if (results != 0 && loading == false) {
      return (
        <img
          src={`${results?.[0]?.images?.[0]?.path}/portrait_uncanny.jpg`}
          alt={results?.[0]?.title}
          height={620}
        />
      );
    } else if (loading == true) {
      return <CircularProgress color="secondary" />;
    }
  };

  const renderSettings = () => {
    return (
      <>
        <FormControl>
          <FormLabel color="primary">Choose Difficulty Level</FormLabel>
          <RadioGroup
            row
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
          >
            <FormControlLabel
              value={10}
              control={<Radio color="primary" />}
              label="within 10"
            />
            <FormControlLabel
              value={5}
              control={<Radio color="primary" />}
              label="within 5"
            />
            <FormControlLabel
              value={3}
              control={<Radio color="primary" />}
              label="within 3"
            />
            <FormControlLabel
              value={0}
              control={<Radio color="primary" />}
              label="exact"
            />
          </RadioGroup>
        </FormControl>
        <Stack direction="row" spacing={4}>
          <Typography fontSize={16}>Current User: {userId}</Typography>
          <Typography fontSize={16}>Current Score: {currentScore}</Typography>
          <Typography fontSize={16}>{tries} Tries Remaining</Typography>
        </Stack>
      </>
    );
  };

  const renderPlayArea = () => {
    if (correct == "" && revealAnswer == false) {
      return (
        <>
          <Stack spacing={2} display="flex" alignItems="center">
            <Typography variant="h4">Guess the Year</Typography>
            <Stack direction="row" spacing={4}>
              <TextField
                color="secondary"
                variant="outlined"
                value={answer}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") answerButtonPressed();
                }}
                inputProps={{
                  style: {
                    fontSize: 20,
                    textAlign: "center",
                  },
                }}
              />
              <Button
                size="medium"
                variant="contained"
                color="secondary"
                onClick={answerButtonPressed}
              >
                Check
              </Button>
            </Stack>
          </Stack>
        </>
      );
    } else if (correct == true || revealAnswer == true) {
      return (
        <Stack spacing={2} display="flex" alignItems="center">
          {correct == true ? (
            <Typography variant="h5">Correct!</Typography>
          ) : (
            <Typography variant="h5">Incorrect!</Typography>
          )}
          <Typography variant="h5" sx={{ wordWrap: "break-word" }}>
            {results?.[0]?.title.replace(/\([^()]*\)/g, "")}
          </Typography>
          <Typography variant="h6"> was released in</Typography>
          <Typography variant="h5">
            {new Date(results?.[0]?.dates?.[0]?.date).getFullYear()}
          </Typography>
          {tries != 0 ? (
            <Button
              size="medium"
              variant="contained"
              color="secondary"
              onClick={getMarvelData}
            >
              Try Again
            </Button>
          ) : (
            <Stack direction="row" spacing={4}>
              <Button
                size="medium"
                variant="contained"
                color="secondary"
                onClick={postScore}
              >
                Post Score
              </Button>
              <Button
                size="medium"
                variant="contained"
                color="secondary"
                onClick={() => {
                  setTries(3);
                  setCurrentScore(0);
                  getMarvelData();
                }}
              >
                Restart
              </Button>
            </Stack>
          )}
        </Stack>
      );
    }
  };

  const renderScoreTable = (input) => {
    return (
      <TableContainer>
        <Table sx={{ minWidth: 550 }} aria-label="Scores">
          <TableHead sx={{ bgcolor: "background.transparent" }}>
            <TableRow>
              <TableCell>
                <IconButton onClick={getScore}>
                  <RestartAltOutlinedIcon
                    fontSize="small"
                    sx={{ color: "background.white" }}
                  />
                </IconButton>
                Session Id
              </TableCell>
              <TableCell>Score</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {input?.Items?.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  bgcolor: "background.transparent",
                }}
              >
                <TableCell>{row.SessionId}</TableCell>
                <TableCell>{row.Score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Grid
        container
        height="100vh"
        sx={{ backgroundImage: `url(${background})`, backgroundSize: "auto" }}
      >
        {results != 0 ? (
          <>
            <Grid item xs={6}>
              <Box height={65} sx={{ p: 1 }}>
                {renderSettings()}
              </Box>

              <Box
                height={480}
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ pt: 8 }}
              >
                {renderPlayArea()}
                {renderScoreTable(data)}
              </Box>
            </Grid>
            <Grid
              item
              xs={6}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {renderImageArea()}
            </Grid>
          </>
        ) : (
          <Grid
            item
            xs={12}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack spacing={4}>
              <Typography variant="h4" align="center">
                Guess the Year
              </Typography>
              <TextField
                color="secondary"
                variant="outlined"
                helperText="Please enter user ID"
                value={userId}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") setUserId(e.target.value);
                }}
                inputProps={{
                  style: {
                    fontSize: 24,
                    textAlign: "center",
                  },
                }}
              />
              <Button
                size="medium"
                variant="contained"
                color="secondary"
                onClick={getMarvelData}
                sx={{
                  px: 1,
                  fontSize: 24,
                  fontWeight: "bold",
                  borderRadius: 3,
                }}
              >
                Play
              </Button>
            </Stack>
          </Grid>
        )}
      </Grid>
    </>
  );
}
