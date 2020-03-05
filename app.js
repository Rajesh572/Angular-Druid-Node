const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const index = require("./index");
const index2 = require("./index2");
const bodyparser = require("body-parser");
const config = require("./config");
const fs = require('fs')
const IncomingForm = require('formidable').IncomingForm
const csvJSON = require("csvjson-csv2json")
const jsonCSV = require("csvjson-json2csv")
const locationFn = require("./functions").addLocationData
const HOST = config.HOST;

app.use(cors());
app.use(bodyparser.json());

//api for getting bar data acc to event type
app.post('/v1/api/getBarData', (req, res) => {
    event_type = req.body.event_type;
    dimension = req.body.dimension;
    program_name = req.body.program_name;
    topics = req.body.topics;
    role = req.body.role;
    if (dimension != undefined && program_name != undefined && (role != undefined || event_type != undefined)) {
        request = event_type === undefined ?
            index2.generateReqForRoleBar(program_name, dimension, role, topics)
            : index.generateReqforBar(program_name, dimension, event_type, topics)

            console.log('Barchart Request : ', JSON.stringify(request));
        axios.post(HOST + ":8082/druid/v2", request)
            .then((response) => {
                var dataArr = []
                response.data.forEach(element => {
                    element['event']['timestamp'] = element['timestamp'];
                    element['event']['count'] = parseInt(element['event']['count'])
                    element['event']['year'] = new Date(element['timestamp']).getFullYear()
                    dataArr.push(element['event'])
                });
                res.send({ "data": dataArr })
            }).
            catch((err) => {
                console.log(err)
                res.send("error")
            })
    }
    else {
        res.send("eror")
    }
})

//api for getting stacked data
app.post('/v1/api/getStackedData', (req, res) => {
    event_type = req.body.event_type;
    dimension = req.body.dimension;
    program_name = req.body.program_name;
    topics = req.body.topics;
    role = req.body.role;
    if (dimension != undefined && program_name != undefined && (role != undefined || event_type != undefined)) {

        request = event_type === undefined ?
            index2.generateReqforRoleStacked(program_name, dimension, role, topics)
            : index.generateReqforStacked(program_name, dimension, event_type, topics)
            console.log('Stacked Chart Request : ', JSON.stringify(request));
        
            axios.post(HOST + ":8082/druid/v2", request)
            .then((response) => {
                var dataArr = []
                response.data.forEach(element => {
                    element['event']['timestamp'] = element['timestamp']
                    element['event']['count'] = parseInt(element['event']['count'])
                    element['event']['year'] = new Date(element['timestamp']).getFullYear()
                    dataArr.push(element['event'])
                });
                res.send({ "data": dataArr })
            }).
            catch((err) => {
                console.log(err)
                res.send("error")
            })
    }
    else {
        res.send("error");
    }
})

//api for multiline
app.post('/v1/api/getMultiLineData', (req, res) => {
    event_type = req.body.event_type;
    dimension = req.body.dimension;
    program_name = req.body.program_name;
    role = req.body.role;
    topics = req.body.topics;
    if (dimension != undefined && program_name != undefined && (role != undefined || event_type != undefined)) {
        request = event_type === undefined ?
            index2.generateReqForRoleMultiLine(program_name, dimension, role, topics) :
            index.generateReqForMultiLine(program_name, dimension, event_type, topics)
            console.log('Multi line Request : ', JSON.stringify(request));

            axios.post(HOST + ":8082/druid/v2", request)
            .then((response) => {
                var dataArr = []
                response.data.forEach(element => {
                    element['event']['date'] = element['timestamp']
                    element['event']['count'] = parseInt(element['event']['count'])
                    dataArr.push(element['event'])
                });
                res.send({ "data": dataArr })
            }).
            catch((err) => {
                console.log(err)
                res.send("error")
            })
    }
    else {
        res.send("error")
    }
})

//for getting topics list
app.post('/v1/api/getAlltopics', (req, res) => {
    event_type = req.body.event_type;
    program_name = req.body.program_name;
    role = req.body.role;
    if (program_name != undefined && (role != undefined || event_type != undefined)) {
        request = role != undefined ?
            index2.generateReqForRoleTopic(program_name, role)
            : index.generateReqForTopic(program_name, event_type)
        axios.post(HOST + ":8082/druid/v2", request)
            .then((response) => {
                var dataArr = []
                response.data.forEach(element => {
                    element['event']['date'] = element['timestamp']
                    dataArr.push(element['event'])
                });
                res.send({ "data": dataArr })
            }).
            catch((err) => {
                console.log(err)
                res.send("error")
            })
    }
    else {
        res.send("error");
    }
})

app.get('/v1/api/getCountForAttestation', (req, res) => {
    axios.post(HOST + ":8082/druid/v2",
        {
            "queryType": "groupBy",
            "dataSource": "socionDataWithLocation",
            "granularity": "All",
            "dimensions": [],
            "aggregations": [
                {
                    "type": "count",
                    "name": "value",
                    "fieldName": "count"
                }
            ],
            "filter": {
                "type": "and",
                "fields": [
                    {
                        "type": "selector",
                        "dimension": "program_name",
                        "value": "Hepatitis - c Awareness"
                    },
                    {
                        "type": "selector",
                        "dimension": "event_type",
                        "value": "Generate Attestation"
                    }
                ]
            },
            "intervals": [
                "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
            ]
        }).then((response) => {
            res.send([response.data[0]['event']])
        })
})


app.get('/v1/api/getCountForSessionCompleted', (req, res) => {
    axios.post(HOST + ":8082/druid/v2",
        {
            "queryType": "groupBy",
            "dataSource": "socionDataWithLocation",
            "granularity": "All",
            "dimensions": [],
            "aggregations": [
                {
                    "type": "count",
                    "name": "value",
                    "fieldName": "count"
                }
            ],
            "filter": {
                "type": "and",
                "fields": [
                    {
                        "type": "selector",
                        "dimension": "program_name",
                        "value": "Hepatitis - c Awareness"
                    },
                    {
                        "type": "selector",
                        "dimension": "event_type",
                        "value": "Session Completed"
                    }
                ]
            },
            "intervals": [
                "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
            ]
        }).then((response) => {
            res.send([response.data[0]['event']])
        })
})

app.get('/v1/api/getCountForDownload', (req, res) => {
    axios.post(HOST + ":8082/druid/v2",
        {
            "queryType": "groupBy",
            "dataSource": "socionDataWithLocation",
            "granularity": "All",
            "dimensions": [],
            "aggregations": [
                {
                    "type": "count",
                    "name": "value",
                    "fieldName": "count"
                }
            ],
            "filter": {
                "type": "and",
                "fields": [
                    {
                        "type": "selector",
                        "dimension": "program_name",
                        "value": "Hepatitis - c Awareness"
                    },
                    {
                        "type": "selector",
                        "dimension": "event_type",
                        "value": "Download Content"
                    }
                ]
            },
            "intervals": [
                "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
            ]
        }).then((response) => {
            res.send([response.data[0]['event']])
        })
})


app.get('/v1/api/getCountForUniqueTrainee', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/",
        {

            "queryType": "groupBy",
            "dataSource": "socionDataWithLocation",
            "granularity": "All",
            "aggregations": [
                {
                    "type": "cardinality",
                    "name": "value",
                    "fieldNames": [
                        "user_id"
                    ]
                }
            ],
            "filter": {
                "type": "and",
                "fields": [
                    {
                        "type": "selector",
                        "dimension": "role",
                        "value": "TRAINEE"
                    },
                    {
                        "type": "selector",
                        "dimension": "program_name",
                        "value": "Hepatitis - c Awareness"
                    }
                ]
            },
            "intervals": [
                "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
            ]

        }).then((response) => {
            res.send([{ value: Math.round(response.data[0]['event']['value']) }])
        })
})

app.get('/v1/api/getCountForUniqueTrainer', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/",
        {
            "queryType": "groupBy",
            "dataSource": "socionDataWithLocation",
            "granularity": "All",
            "aggregations": [
                {
                    "type": "cardinality",
                    "name": "value",
                    "fieldNames": [
                        "user_id"
                    ]
                }
            ],
            "filter": {
                "type": "and",
                "fields": [
                    {
                        "type": "selector",
                        "dimension": "role",
                        "value": "TRAINER"
                    },
                    {
                        "type": "selector",
                        "dimension": "program_name",
                        "value": "Hepatitis - c Awareness"
                    }
                ]
            },
            "intervals": [
                "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
            ]

        }).then((response) => {
            res.send([{ value: Math.round(response.data[0]['event']['value']) }])
        })
})

app.get('/v1/api/getAlltopics', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql", {
        query: `SELECT topic_name from socionDataWithLocation where program_name='Lorem Ipsum Fixed'`
    }).then((response) => {
        res.send(response.data)
    })
})

app.post('/v1/api/upload', (req, res) => {
    var form = new IncomingForm();
    var path = "/home/admin-pc/"
    form.on('file', (field, file) => {
        console.log(file.name)
        const fileData = fs.readFileSync(file.path, 'utf-8')
        const jsonData = csvJSON.csv2json(fileData, { parseNumbers: true })
        locationFn(jsonData).then(function (data) {
            console.log("returned at", new Date())
            const csvData = jsonCSV.json2csv(data);
            fs.writeFileSync("new" + file.name, csvData);
        })
    })
    form.on('end', () => {
        res.json("OK")
    })
    form.parse(req)
})

app.listen(3000, () => {
    console.log("Server listening on 3000")
})


app.post('/v1/api/event/count/read', (req, res) => {

    let request = req.body.request;
    let checkUnique = request.unique;
    let reqFilters = request.filter;
    let reqParams = request.params;
    console.log('12345678 : ', reqParams);

    let reqParamsKeys = Object.keys(reqParams);
    let requestdataSource = request.dataSource;
    
    reqParamsKeys.forEach((paramKey) => {
        reqFilters[paramKey] = reqParams[paramKey];
    });
    let reqFilterKeys = Object.keys(reqFilters);

    console.log(request);

    let dataSource = requestdataSource ? requestdataSource : 'socionDataWithLocation';

    let requestBody = {};
    requestBody['queryType'] = 'groupBy';
    requestBody['dataSource'] = dataSource;
    requestBody['granularity'] = 'All';

    let dimensionObjects = [];
    reqParamsKeys.forEach((item) => {
        dimensionObjectEach = {};
        dimensionObjectEach['type'] = 'selector';
        dimensionObjectEach['dimension'] = item;
        dimensionObjectEach['outputName'] = item;
        dimensionObjects.push(dimensionObjectEach);
    });

    requestBody['dimensions'] = dimensionObjects;

    let aggregationObjects = [];
    let aggregationObjectEach = {};
    if(checkUnique) {
        aggregationObjectEach['type'] = 'thetaSketch';
        aggregationObjectEach['name'] = 'count';
        aggregationObjectEach['fieldName'] = request.unique_param;
    } else {
        aggregationObjectEach['type'] = 'count';
        aggregationObjectEach['name'] = 'count';
    }
    aggregationObjects.push(aggregationObjectEach);
    requestBody['aggregations'] = aggregationObjects;


    // add interval logic here 
    if(request.startTime && request.endTime) {
        timeInterval = request.startTime + '/' + request.endTime;
    } else if (request.startTime) {
        timeInterval = request.startTime;
        timeInterval += '/';
        timeInterval += new Date().toISOString();
    } else {
        timeInterval = '2018-10-07T00:00:00.000Z/';
        timeInterval += new Date().toISOString();
    }
    requestBody['intervals'] = [timeInterval];

    let filterObject = {};
    if (reqFilterKeys.length > 1) {
        filterObject['type'] = 'and';
        filterObject['fields'] = [];
        reqFilterKeys.forEach((item) => {
            filterObjectEach = {};
            if(Array.isArray(reqFilters[item])) {
                filterObjectEach['type'] = 'or';
                filterObjectEach['fields'] = [];
                filterValues = reqFilters[item];
                filterValues.forEach((filterEach) => {
                    selectorObject = {};
                    selectorObject['type'] = 'selector';
                    selectorObject['dimension'] = item;
                    selectorObject['value'] = filterEach;
                    filterObjectEach.fields.push(selectorObject);
                });
            } else {
                filterObjectEach['type'] = 'selector';
                filterObjectEach['dimension'] = item;
                filterObjectEach['value'] = reqFilters[item];
            }
            filterObject.fields.push(filterObjectEach);
        });
    } else {
        filterObject['type'] = 'selector';
        filterObject['dimension'] = reqFilterKeys[0];
        filterObject['value'] = reqFilters[reqFilterKeys[0]]; 
    }
    requestBody['filter'] = filterObject;

    console.log('Request Body :  ');
    console.log(JSON.stringify(requestBody));

        axios.post(HOST + ":8082/druid/v2", requestBody)
            .then((response) => {
                var dataArr = [];
                // console.log(response.data);
                response.data.forEach(element => {
                    element['event']['date'] = element['timestamp'];
                    element['event']['count'] = parseInt(element['event']['count']);
                    dataArr.push(element['event']);
                });

                reqParamsKeys.forEach((paramKey) => {
                    console.log('req Params : ', reqParams);
                    console.log('Key : ', paramKey);
                    console.log('Param Key : ', reqParams[paramKey]);
                    console.log(Array.isArray(reqParams.paramKey));
                    if(Array.isArray(reqParams[paramKey])) {
                        console.log('1');
                        reqParams[paramKey].forEach((paramValueEach) => {
                            let check = false;
                            // console.log('1234:', dataArr);
                            dataArr.forEach((dataEach) => {
                                if (!!dataEach[paramKey] && dataEach[paramKey] === paramValueEach) {
                                    check = true;
                                    // console.log('Check : ', check);
                                }
                            });
                            if(!check) {
                                let newElement = {};
                                newElement['date'] = new Date().toISOString();
                                newElement['count'] = 0;
                                newElement[paramKey] = paramValueEach;
                                dataArr.push(newElement);
                            }
                        });
                    } else {
                        console.log('2');
                        let check = false;
                        dataArr.forEach((dataEach) => {
                            if (!!dataEach[paramKey] && dataEach[paramKey] === reqParams.paramKey) {
                                check = true;
                            }
                            if(!check) {
                                newElement = {};
                                newElement['date'] = new Date().toISOString();
                                newElement['count'] = 0;
                                newElement[paramKey] = reqParams[paramKey];
                                dataArr.push(newElement);
                            }
                        });
                    }
                });

                let successResponse = {};
                successResponse['responseCode'] = 'OK';
                successResponse['result'] = dataArr;
                // console.log(successResponse);
                res.send(successResponse);
                // res.send({ "data": dataArr });
            }).
            catch((err) => {
                let failureResponse = {};
                failureResponse['responseCode'] = 'FAIL';
                failureResponse['error'] = err;
                console.log(err);
                res.send(failureResponse);
            });
})


app.post('/v1/api/event/unique/read', (req, res) => {


    let reqFilters = req.body.filter;
    let reqFilterKeys = Object.keys(req.body.filter);
    let reqParams = req.body.params;
    // dataSource = req.body.dataSource;
    let dataSource = 'socionDataWithLocation';

    let requestBody = {};
    requestBody['queryType'] = 'groupBy';
    requestBody['dataSource'] = dataSource;
    requestBody['granularity'] = 'All';


    // add interval logic here 
    let timeInterval;
    if(req.body.startTime && req.body.endTime) {
        timeInterval = req.body.startTime + '/' + req.body.endTime;
    } else if (req.body.startTime) {
        timeInterval = 'req.body.startTime';
        timeInterval += '/';
        timeInterval += new Date().toISOString();
    } else {
        timeInterval = '2018-10-07T00:00:00.000Z/';
        timeInterval += new Date().toISOString();
    }
    requestBody['intervals'] = [timeInterval];
 
    let filterObject = {};
    if (reqFilterKeys.length > 1) {
        filterObject['type'] = 'and';
        filterObject['fields'] = [];
        reqFilterKeys.forEach((item) => {
            filterObjectEach = {};
            if(Array.isArray(reqFilters[item])) {
                filterObjectEach['type'] = 'or';
                filterObjectEach['fields'] = [];
                filterValues = reqFilters[item];
                filterValues.forEach((filterEach) => {
                    let selectorObject = {};
                    selectorObject['type'] = 'selector';
                    selectorObject['dimension'] = item;
                    selectorObject['value'] = filterEach;
                    filterObjectEach.fields.push(selectorObject);
                });
            } else {
                filterObjectEach['type'] = 'selector';
                filterObjectEach['dimension'] = item;
                filterObjectEach['value'] = reqFilters[item];
            }
            filterObject.fields.push(filterObjectEach);
        });
    } else {
        filterObject['type'] = 'selector';
        filterObject['dimension'] = reqFilterKeys[0];
        filterObject['value'] = reqFilters[reqFilterKeys[0]]; 
    }
    requestBody['filter'] = filterObject;


    let allRequests = [];
    reqParams.forEach((item) => {
        requestBodyNew = {...requestBody};
        let dimensionObjects = [];
        let dimensionObjectEach = {};
        dimensionObjectEach['type'] = 'selector';
        dimensionObjectEach['dimension'] = item;
        dimensionObjectEach['outputName'] = item;
        dimensionObjects.push(dimensionObjectEach);
        requestBodyNew['dimensions'] = dimensionObjects;

        console.log('Request Body :  ');
        console.log(JSON.stringify(requestBodyNew));
        allRequests.push(axios.post(HOST + ":8082/druid/v2", requestBodyNew));
    });

    console.log("AllRequests : ",allRequests);

    Promise.all(allRequests).then((responses) => {
        let resultArr = {};
        // console.log("Responses", responses);
        responses.forEach((response,i) => {
            let dataArr = [];
            dataKey = reqParams[i];
            // console.log('Key : ', dataKey);
            // dataArrEach = {};
            // console.log('Response : ', response.data);
            response.data.forEach((element) => {
                dataArr.push(element['event'][dataKey]);
            });
            // dataArrEach[dataKey] = dataArr;
            // console.log(JSON.stringify(dataArrEach));
            resultArr[dataKey] = dataArr;
        });
        let successResponse = {};
        successResponse['responseCode'] = 'OK';
        successResponse['result'] = resultArr;
        console.log(successResponse);
        res.send(successResponse);
    }).
    catch((err) => {
        let failureResponse = {};
        successResponse['responseCode'] = 'FAIL';
        successResponse['error'] = err;
        console.log(err);
        res.send(failureResponse);
    });

})

