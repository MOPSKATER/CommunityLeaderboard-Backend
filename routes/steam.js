var express = require('express');
var router = express.Router();
const dbHandler = require('../databasehandler')
const SteamAuth = require("node-steam-openid");

const steam = new SteamAuth({
    realm: "http://localhost:3000", // Site name displayed to users on logon
    returnUrl: "http://localhost:3000/steam/authenticate", // Your return route
    apiKey: process.argv[2] // Steam API key
});

router.get("/login", async (req, res, next) => {
    const redirectUrl = await steam.getRedirectUrl();
    return res.redirect(redirectUrl);
});
  
router.get("/authenticate", async (req, res, next) => {
    const user = await steam.authenticate(req);
    dbHandler.getAPIKey(user.steamid, (succeed, result) => {
        if (succeed)
            res.send(result);
        else
            next("Duplication error: " + user.steamid);
    })
});

module.exports = router;