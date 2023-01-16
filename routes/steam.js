var express = require('express');
var db = require('../databasehandler');
var router = express.Router();

const SteamAuth = require("node-steam-openid");

const steam = new SteamAuth({
    realm: "http://localhost:3000", // Site name displayed to users on logon
    returnUrl: "http://localhost:3000/steam/authenticate", // Your return route
    apiKey: process.argv[2] // Steam API key
});

router.get("/login", async (req, res) => {
    const redirectUrl = await steam.getRedirectUrl();
    return res.redirect(redirectUrl);
});
  
router.get("/authenticate", async (req, res) => {
    try {
        const user = await steam.authenticate(req);
        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;