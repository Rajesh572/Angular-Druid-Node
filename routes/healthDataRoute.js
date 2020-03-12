const express = require('express');
const router = express.Router();
const database = require('./../utility/databaseUtility');

router.use(express.json());

// used to check druid health
router.get('/v1/health/status', (req,res) => {
    console.log('Health status api hit');
    database.checkHealth()
            .then(response => {
                // console.log(response);
                console.log(response.data);
                if(response.data === 'true' || response.data === true) {
                    var newResponse = {druidHealth: true};
                    res.send(newResponse);
                } else {
                    var error = 'Unable to verify the Health.';
                    res.status(400).send(error);
                }
            })
            .catch(err => {
                console.log('Unable to verify Health of Druid. ', err);
                res.status(400).send(err);
            });

});


module.exports = router;