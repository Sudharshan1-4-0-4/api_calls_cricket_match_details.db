const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initialiseDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at 3000!!!");
    });
  } catch (e) {
    console.log(`Server error ${e.message}`);
    process.exit(1);
  }
};

initialiseDbandServer();

//get method
const convertcase = (dbobj) => {
  return {
    playerId: dbobj.player_id,
    playerName: dbobj.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const listofplayersquery = `SELECT * FROM player_details;`;
  const res1 = await db.all(listofplayersquery);
  response.send(res1.map((eachplayer) => convertcase(eachplayer)));
});

//get method1
const convertcase1 = (dbobj1) => {
  let r = {
    playerId: dbobj1.player_id,
    playerName: dbobj1.player_name,
  };
  return r;
};

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersquery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const res2 = await db.all(playersquery);
  response.send(...res2.map((eachplayer1) => convertcase1(eachplayer1)));
});

//update method
app.put("/players/:playerId/", async (request, response) => {
  const playerdetails1 = request.body;
  const { playerId } = request.params;
  const { playerName } = playerdetails1;

  const updatequery = `UPDATE player_details SET 
  player_name = '${playerName}'
  
  WHERE player_id = ${playerId};`;
  const res6 = await db.run(updatequery);
  response.send("Player Details Updated");
});

//get method in match table
const convertcase2 = (dbobj2) => {
  let r1 = {
    matchId: dbobj2.match_id,
    match: dbobj2.match,
    year: dbobj2.year,
  };
  return r1;
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchesquery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const res4 = await db.all(matchesquery);
  response.send(...res4.map((eachmatch1) => convertcase2(eachmatch1)));
});

//get method in match table
const convertcase3 = (dbobj3) => {
  return {
    matchId: dbobj3.match_id,
    match: dbobj3.match,
    year: dbobj3.year,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const matchesquery1 = `SELECT * FROM player_match_score NATURAL JOIN
  match_details WHERE player_id = ${playerId};`;
  const res4 = await db.all(matchesquery1);
  response.send(res4.map((eachmatch2) => convertcase3(eachmatch2)));
});

//get method in player table
const convertcase4 = (dbobj4) => {
  return {
    playerId: dbobj4.player_id,
    playerName: dbobj4.player_name,
  };
};

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playersquery1 = `SELECT * FROM player_match_score NATURAL JOIN player_details
        WHERE match_id = ${matchId};`;
  const res5 = await db.all(playersquery1);
  response.send(res5.map((eachplayer2) => convertcase4(eachplayer2)));
});

//get another method

const convertcase5 = (dbobj5) => {
  let r = {
    playerId: dbobj5.playerId,
    playerName: dbobj5.playerName,
    totalScore: dbobj5.totalScore,
    totalFours: dbobj5.totalFours,
    totalSixes: dbobj5.totalSixes,
  };
  return r;
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const res6 = await db.all(getPlayerScored);
  response.send(...res6.map((eachplayer3) => convertcase5(eachplayer3)));
});

module.exports = app;
