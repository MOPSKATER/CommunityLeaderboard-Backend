var express = require("express");
var router = express.Router();
const dbHandler = require("../databasehandler");
const SteamAuth = require("node-steam-openid");

const steam = new SteamAuth({
  realm: "http://localhost:3000", // Site name displayed to users on logon
  returnUrl: "http://localhost:3000/api/steam/authenticate", // Your return route
  apiKey: process.argv[2], // Steam API key
});

router.get("/login", async (req, res, next) => {
  const redirectUrl = await steam.getRedirectUrl();
  return res.redirect(redirectUrl);
});

router.get("/authenticate", async (req, res, next) => {
  const user = await steam.authenticate(req);
  dbHandler.getAPIKey(user.steamid, (succeed, result) => {
    if (!succeed) {
      next("Duplication error: " + user.steamid);
      return;
    }

    if (result) {
      res.send(result);
      return;
    }

    dbHandler.createUser(user.steamid, (succeed, result) => {
      if (!succeed) {
        next(result);
        return;
      }

      res.send(result);
    });
  });
});

module.exports = router;
