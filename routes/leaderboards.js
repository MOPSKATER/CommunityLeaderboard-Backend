var express = require('express');
var dbHandler = require('../databasehandler');
var router = express.Router();
const { validate, ValidationError, Joi } = require('express-validation')

const VSetScore = {
    body: Joi.object({
        apikey: Joi.string()
            .alphanum()
            .length(32)
            .lowercase() // FIXME: not forcing to lowercase
            .required(),
        level: Joi.string()
            .valid(... dbHandler.levels)
            .required(),
        time: Joi.number()
            .min(0)
            .max(2_147_483_647) // Max Int
            .required()
    })
}

router.get("/login", async (req, res, next) => {

});

router.post("/submit", validate(VSetScore), async (req, res, next) => {
    dbHandler.getUser(req.body.apikey, (succeed, result) => {
        if (!succeed){
            next("API key does not exist");
            return;
        }
        res.sendStatus(200);        
    });
});

module.exports = router;
