var express = require('express');
var dbHandler = require('../databasehandler');
var router = express.Router();
const { validate, ValidationError, Joi } = require('express-validation')

const VSetScore = {
    body: Joi.object({
        apikey: Joi.string()
            .alphanum()
            .length(64)
            .options({convert: false})
            .required(),
        level: Joi.string()
            .valid(... dbHandler.levels)
            .required(),
        score: Joi.number()
            .integer()
            .options({convert: true})
            .min(0)
            .max(2_147_483_647) // Max Int
            .required()
    })
}

router.get("/login", async (req, res, next) => {
    res.sendStatus(200);
});

router.post("/submit", validate(VSetScore), async (req, res, next) => {
    dbHandler.getUser(req.body.apikey, (succeed, result) => {
        if (!succeed){
            res.status(404).send("Apikey not found")
            return;
        }
        dbHandler.setScore(result.steamid, req.body.level, parseInt(req.body.score), (succeed, result) => {
            if (!succeed){
                next(result);
                return;
            }
            res.sendStatus(200);   
        })     
    });
});

module.exports = router;
