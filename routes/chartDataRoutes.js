const express = require('express');
const router = express.Router();
const chartData = require('./../utility/chartDataUtility');

router.use(express.json());

// used in the report selection page to get the barchart data
// router.post('/v1/barchart/data/read', (req,res) => {
//     console.log('barchart data read api hit');
//     // get the body, else return the error that no body is provided
//     if (!!Object.keys(req.body.request).length) {
//         chartData.readBarchartData(req)
//             .then(response => {
//                 res.send(response);
//             })
//             .catch(err => {
//                 console.log('Error occured while reading data for barchart. ', err);
//                 res.status(400).send(err);
//             });
//     } else {
//         // empty object is not allowed
//         console.log('Empty body recieved in the request');
//         res.status(400).send({ 'error': 'Request Body is required to access the API.' });
//     }
// });

// used in the report selection page to get the data for multiline and stackedchart
router.post('/v1/chart/data/read', (req,res) => {
    console.log('chart data read api hit');
    // get the body, else return the error that no body is provided
    if (!!Object.keys(req.body.request).length) {
        chartData.readChartData(req)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
                console.log('Error occured while reading data for multiline and stackedchart. ', err);
                res.status(400).send(err);
            });
    } else {
        // empty object is not allowed
        console.log('Empty body recieved in the request');
        res.status(400).send({ 'error': 'Request Body is required to access the API.' });
    }
});


module.exports = router;