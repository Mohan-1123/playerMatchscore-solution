const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const intiDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is starting at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
  }
};

intiDbAndServer();

app.get("/players/", async (request, response) => {
  const query = `
    SELECT 
     * 
    FROM 
     player_details;`;
  const resultArray = await db.all(query);
  response.send(resultArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const query = `
    SELECT 
     * 
    FROM 
     player_details
    WHERE 
      player_id=${playerId};`;
  const result = await db.get(query);
  response.send(result);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const query = `
     UPDATE player_details
     SET 
       player_name='${playerName}
    WHERE 
      player_id=${playerId};`;

  const result = await db.run(query);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT 
     * 
    FROM 
      match_details
    WHERE 
      match_id=${matchId};`;

  const result = await db.get(query);
  response.send(result);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const query = `
     SELECT 
       match_details.match_id,
       match_details.match,
       match_details.year
    FROM 
      match_details NATURAL JOIN player_match_score
    WHERE 
       player_match_score.player_id=${playerId};`;

  const result = await db.get(query);
  response.send(result);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const query = `
      SELECT 
        player_details.player_id,
        player_details.player_name
      FROM 
        player_details NATURAL JOIN player_match_score 
      WHERE 
       player_match_score.match_id=${matchId};`;

  const result = await db.all(query);
  response.send(result);
});

const detailsObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    totalScore: dbObJ.SUM(score),
    totalFours: dbObJ.SUM(fours),
    totalSixes: dbObj.SUM(sixes),
  };
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const query = `
       SELECT 
         player_id,
         player_details.player_name,
         SUM(score),
         SUM(fours),
         sum(sixes)
       FROM 
         player_match_score NATURAL JOIN player_details
       WHERE 
         player_details.player_id=${playerId};`;

  const result = await db.get(query);
  response.send(detailsObj(result));
});

module.exports = app;
