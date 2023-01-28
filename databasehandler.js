const pgp = require("pg-promise")();
const { text } = require("express");
const { PreparedStatement: PS } = require("pg-promise");
const cn = require("./config");
const db = pgp(cn);

async function init() {
  await db
    .none(
      "CREATE TABLE IF NOT EXISTS users (\
        steamid varchar(17) NOT NULL,\
        apikey varchar(64) NOT NULL,\
        banned boolean NOT NULL DEFAULT false,\
        PRIMARY KEY (steamid)\
        )"
    )
    .catch((err) => {
      console.log("ERROR: " + err);
    });

  await (async function () {
    levels.forEach((level) => {
      var query =
        "CREATE TABLE IF NOT EXISTS " +
        level.replaceAll(" ", "_") +
        " (\
                  steamid varchar(17) NOT NULL REFERENCES users(steamid) ON DELETE CASCADE,\
                  score int NOT NULL,\
                  PRIMARY KEY (steamid)\
                  )";
      db.none(query).catch((err) => {
        console.log("ERROR: " + level.replace(" ", "_") + "\n" + err);
      });
      //   db.none("DROP TABLE " + level.replaceAll(" ", "_")).catch((err) => {
      //     console.log(err);
      //   });
    });
  })();

  // Create test data
  //   for (let i = 0; i < 100; i++) {
  //     var id = makeid(17);
  //     var key = makeid(64);
  //     var query =
  //       "INSERT INTO users (steamid, apikey) VALUES ('" +
  //       id +
  //       "', '" +
  //       key +
  //       "')";
  //     await db.none(query);
  //     var query =
  //       "INSERT INTO TUT_MOVEMENT (steamid, score) VALUES ('" +
  //       id +
  //       "', '" +
  //       Math.floor(Math.random() * 1000000000) +
  //       "')";
  //     db.none(query).catch((err) => {
  //       console.log("ERROR: " + err);
  //     });
  //   }
}

init();

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function getAPIKey(steamID, callback) {
  db.oneOrNone(
    new PS({
      name: "get_apikey",
      text: "SELECT apikey FROM users WHERE steamid = $1",
      values: [steamID],
    })
  )
    .then((res) => {
      callback(true, res);
    })
    .catch((err) => {
      callback(false, err);
    });
}

function getUser(apikey, callback) {
  db.one(
    new PS({
      name: "get_user",
      text: "SELECT * FROM users WHERE apikey = $1",
      values: [apikey],
    })
  )
    .then((res) => {
      callback(true, res);
    })
    .catch((err) => {
      callback(false, err);
    });
}

function createUser(steamID, callback) {
  var apikey = makeid(64);
  db.query(
    new PS({
      name: "create_user",
      text: "INSERT INTO users (steamid, apikey) VALUES ($1, $2)",
      values: [steamID, apikey],
    })
  )
    .then((res) => {
      callback(true, apikey);
    })
    .catch((err) => {
      callback(false, err);
    });
}

function getScore(steamID, level, callback) {
  db.oneOrNone(
    new PS({
      name: "get_score",
      text: "SELECT score FROM " + level + " WHERE steamid = $1",
      values: [steamID],
    })
  )
    .then((res) => {
      callback(true, res);
    })
    .catch((err) => {
      callback(false, err);
    });
}

function setScore(steamID, level, score, callback) {
  getScore(steamID, level, (succeed, res) => {
    if (!succeed) {
      callback(succeed, res);
      return;
    }

    if (res) {
      if (score < res.score)
        db.query(
          new PS({
            name: "update_score",
            text: "UPDATE " + level + " SET score = $2 WHERE steamid = $1",
            values: [steamID, score],
          })
        );
    } else
      db.query(
        new PS({
          name: "insert_score",
          text: "INSERT INTO " + level + " (steamid, score) VALUES($1, $2)",
          values: [steamID, score],
        })
      );
    callback(true, null);
  });
}

var levels = [
  "TUT_MOVEMENT",
  "TUT_SHOOTINGRANGE",
  "SLUGGER",
  "TUT_FROG",
  "TUT_JUMP",
  "GRID_TUT_BALLOON",
  "TUT_BOMB2",
  "TUT_BOMBJUMP",
  "TUT_FASTTRACK",
  "GRID_PORT",
  "GRID_PAGODA",
  "TUT_RIFLE",
  "TUT_RIFLEJOCK",
  "TUT_DASHENEMY",
  "GRID_JUMPDASH",
  "GRID_SMACKDOWN",
  "GRID_MEATY_BALLOONS",
  "GRID_FAST_BALLOON",
  "GRID_DRAGON2",
  "GRID_DASHDANCE",
  "TUT_GUARDIAN",
  "TUT_UZI",
  "TUT_JUMPER",
  "TUT_BOMB",
  "GRID_DESCEND",
  "GRID_STAMPEROUT",
  "GRID_CRUISE",
  "GRID_SPRINT",
  "GRID_MOUNTAIN",
  "GRID_SUPERKINETIC",
  "GRID_ARRIVAL",
  "FLOATING",
  "GRID_BOSS_YELLOW",
  "GRID_HOPHOP",
  "GRID_RINGER_TUTORIAL",
  "GRID_RINGER_EXPLORATION",
  "GRID_HOPSCOTCH",
  "GRID_BOOM",
  "GRID_SNAKE_IN_MY_BOOT",
  "GRID_FLOCK",
  "GRID_BOMBS_AHOY",
  "GRID_ARCS",
  "GRID_APARTMENT",
  "TUT_TRIPWIRE",
  "GRID_TANGLED",
  "GRID_HUNT",
  "GRID_CANNONS",
  "GRID_FALLING",
  "TUT_SHOCKER2",
  "TUT_SHOCKER",
  "GRID_PREPARE",
  "GRID_TRIPMAZE",
  "GRID_RACE",
  "TUT_FORCEFIELD2",
  "GRID_SHIELD",
  "SA L VAGE2",
  "GRID_VERTICAL",
  "GRID_MINEFIELD",
  "TUT_MIMIC",
  "GRID_MIMICPOP",
  "GRID_SWARM",
  "GRID_SWITCH",
  "GRID_TRAPS2",
  "TUT_ROCKETJUMP",
  "TUT_ZIPLINE",
  "GRID_CLIMBANG",
  "GRID_ROCKETUZI",
  "GRID_CRASHLAND",
  "GRID_ESCALATE",
  "GRID_SPIDERCLAUS",
  "GRID_FIRECRACKER_2",
  "GRID_SPIDERMAN",
  "GRID_DESTRUCTION",
  "GRID_HEAT",
  "GRID_BOLT",
  "GRID_PON",
  "GRID_CHARGE",
  "GRID_MIMICFINALE",
  "GRID_BARRAGE",
  "GRID_1GUN",
  "GRID_HECK",
  "GRID_ANTFARM",
  "GRID_FORTRESS",
  "GRID_GODTEMPLE_ENTRY",
  "GRID_BOSS_GODSDEATHTEMPLE",
  "GRID_EXTERMINATOR",
  "GRID_FEVER",
  "GRID_SKIPSLIDE",
  "GRID_CLOSER",
  "GRID_HIKE",
  "GRID_SKIP",
  "GRID_CEILING",
  "GRID_BOOP",
  "GRID_TRIPRAP",
  "GRID_ZIPRAP",
  "TUT_ORIGIN",
  "GRID_BOSS_RAPTURE",
  "SIDEQUEST_OBSTACLE_PISTOL",
  "SIDEQUEST_OBSTACLE_PISTOL_SHOOT",
  "SIDEQUEST_OBSTACLE_MACHINEGUN",
  "SIDEQUEST_OBSTACLE_RIFLE_2",
  "SIDEQUEST_OBSTACLE_UZI2",
  "SIDEQUEST_OBSTACLE_SHOTGUN",
  "SIDEQUEST_OBSTACLE_ROCKETLAUNCHER",
  "SIDEQUEST_RAPTURE_QUEST",
  "SIDEQUEST_SUNSET_FLIP_POWERBOMB",
  "GRID_BALLOONLAIR",
  "SIDEQUEST_BARREL_CLIMB",
  "SIDEQUEST_FISHERMAN_SUPLEX",
  "SIDEQUEST_STF",
  "SIDEQUEST_ARENASIXNINE",
  "SIDEQUEST_ATTITUDE_ADJUSTMENT",
  "SIDEQUEST_ROCKETGODZ",
  "SIDEQUEST_DODGER",
  "GRID_GLASSPATH",
  "GRID_GLASSPATH2",
  "GRID_HELLVATOR",
  "GRID_GLASSPATH3",
  "SIDEQUEST_ALL_SEEING_EYE",
  "SIDEQUEST_RESIDENTSAWB",
  "SIDEQUEST_RESIDENTSAW",
];

module.exports = {
  getAPIKey,
  getUser,
  createUser,
  getScore,
  setScore,
  levels,
};
