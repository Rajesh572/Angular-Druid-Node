const express = require('express');
const router = express.Router();
const eventCount = require('./../utility/eventCountUtility');

router.use(express.json());

// used in the dashboard page to show count of the different events
router.post('/v1/event/count/read', (req,res) => {
    console.log('event count read api hit');
    // get the body, else return the error that no body is provided
    if (!!Object.keys(req.body.request).length) {
        eventCount.readEventCount(req)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
                console.log('Error occured while reading event count read. ', err);
                res.status(400).send(err);
            });
    } else {
        // empty object is not allowed
        console.log('Empty body recieved in the request');
        res.status(400).send({ 'error': 'Request Body is required to access the API.' });
    }
});

// used for the filters to populate the filter options according to the event
router.post('/v1/event/unique/read', (req,res) => {
    console.log('event unique read api hit');
    // get the body, else return the error that no body is provided
    if (!!Object.keys(req.body.request).length) {
        eventCount.readUniqueEventCount(req)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
                console.log('Error occured while reading unique event count read. ', err);
                res.status(400).send(err);
            });
    } else {
        // empty object is not allowed
        console.log('Empty body recieved in the request');
        res.status(400).send({ 'error': 'Request Body is required to access the API.' });
    }
});

module.exports = router;