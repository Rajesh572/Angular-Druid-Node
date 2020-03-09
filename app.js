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
    console.log("Server listening on 3000");
})


app.post('/v1/api/event/count/read', (req, res) => {

    try {
    let request = req.body.request;
    let checkUnique = request.unique;
    let reqFilters = request.filter;
    let reqParams = request.params;
    if(!!reqFilters.time) {
        delete reqFilters.time;
    }
    if(!!reqFilters.start_time) {
        request.startTime = reqFilters.start_time;
        delete reqFilters.start_time;
    }
    if(!!reqFilters.end_time) {
        request.endTime = reqFilters.end_time;
        delete reqFilters.end_time;
    }

    let reqParamsKeys = Object.keys(reqParams);
    let requestdataSource = request.dataSource;
    
    reqParamsKeys.forEach((paramKey) => {
        reqFilters[paramKey] = reqParams[paramKey];
    });
    let reqFilterKeys = Object.keys(reqFilters);

    console.log(request);

    let requestBody = {};

    requestBody = addDataSource(requestBody, requestdataSource);

    requestBody = addQueryType(requestBody, 'groupBy');
    
    requestBody = addGranularity(requestBody, 'All');

    requestBody = addDimensionObject(requestBody, reqParamsKeys);

    requestBody = addAggregationObject(requestBody, checkUnique, request.unique_param);

    requestBody = addTimeObject(requestBody, request.startTime, request.endTime);

    requestBody = addFilterObject(requestBody, reqFilterKeys, reqFilters);

    console.log('Request Body :  ');
    console.log(JSON.stringify(requestBody));

    sendRequestToDruid(requestBody)
    .then((response) => {
        let dataArr = prepareResponseObject(response);
        // console.log(response.data);

        dataArr = addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

        let successResponse = prepareSuccessResponse(dataArr);
        console.log(successResponse);
        res.send(successResponse);
    }).
    catch((err) => {
        let failureResponse = prepareFailureResponse(err);
        res.send(failureResponse);
    });
} catch(err) {
    let failureResponse = prepareFailureResponse(err);
    res.send(failureResponse);
    }
})


app.post('/v1/api/event/unique/read', (req, res) => {

    try {
    let request = req.body.request;
    let reqFilters = request.filter;

    if(!!reqFilters.time) {
        delete reqFilters.time;
    }
    if(!!reqFilters.start_time) {
        request.startTime = reqFilters.start_time;
        delete reqFilters.start_time;
    }
    if(!!reqFilters.end_time) {
        request.endTime = reqFilters.end_time;
        delete reqFilters.end_time;
    }

    let reqFilterKeys = Object.keys(reqFilters);
    let reqParams = request.params;
    // dataSource = req.body.dataSource;

    let requestdataSource = request.dataSource;

    let requestBody = {};

    requestBody = addDataSource(requestBody, requestdataSource);

    requestBody = addQueryType(requestBody, 'groupBy');
    
    requestBody = addGranularity(requestBody, 'All');

    // requestBody = addAggregationObject(requestBody, checkUnique, request.unique_param);

    requestBody = addTimeObject(requestBody, request.startTime, request.endTime);

    requestBody = addFilterObject(requestBody, reqFilterKeys, reqFilters);



    let allRequests = [];
    reqParams.forEach((item) => {
        requestBodyNew = {...requestBody};
        requestBodyNew = addDimensionObject(requestBodyNew, item);

        console.log('Request Body :  ');
        console.log(JSON.stringify(requestBodyNew));
        let sendRequest = sendRequestToDruid(requestBodyNew);
        allRequests.push(sendRequest);
    });

    console.log("AllRequests : ",allRequests);

    Promise.all(allRequests).then((responses) => {
        let resultArr = {};
        responses.forEach((response,i) => {
            let dataArr = [];
            dataKey = reqParams[i];
            response.data.forEach((element) => {
                if(!!element['event'][dataKey]) {
                    dataArr.push(element['event'][dataKey]);
                } else {
                    dataArr = null;
                }
            });
            resultArr[dataKey] = dataArr;
        });

        let successResponse = prepareSuccessResponse(resultArr);
        console.log(successResponse);
        res.send(successResponse);
    }).
    catch((err) => {
        let failureResponse = prepareFailureResponse(err);
        console.log(err);
        res.send(failureResponse);
    });
} catch(err) {
    let failureResponse = prepareFailureResponse(err);
    res.send(failureResponse);
    }
})

app.post('/v1/api/barchart/data/read', (req, res) => {

    try {
    let request = req.body.request;
    // let checkUnique = request.unique;
    let reqFilters = request.filter;
    let granularity = request.granularity;
    let dimension = request.dimension;
    
    // let reqParams = request.params;

    // let reqParamsKeys = Object.keys(reqParams);
    let requestdataSource = request.dataSource;
    
    // reqParamsKeys.forEach((paramKey) => {
    //     reqFilters[paramKey] = reqParams[paramKey];
    // });
    if(!!reqFilters.time) {
        delete reqFilters.time;
    }
    if(!!reqFilters.start_time) {
        request.startTime = reqFilters.start_time;
        delete reqFilters.start_time;
    }
    if(!!reqFilters.end_time) {
        request.endTime = reqFilters.end_time;
        delete reqFilters.end_time;
    }

    let reqFilterKeys = Object.keys(reqFilters);

    console.log(request);

    let requestBody = {};

    requestBody = addDataSource(requestBody, requestdataSource);

    requestBody = addQueryType(requestBody, 'groupBy');
    
    requestBody = addGranularity(requestBody, granularity);

    if(dimension) {
        requestBody = addDimensionObject(requestBody, dimension);
    }

    requestBody = addAggregationObject(requestBody, false, request.unique_param);

    requestBody = addTimeObject(requestBody, request.startTime, request.endTime);

    requestBody = addFilterObject(requestBody, reqFilterKeys, reqFilters);

    console.log('Request Body :  ');
    console.log(JSON.stringify(requestBody));

    sendRequestToDruid(requestBody)
    .then((response) => {
        let dataArr = prepareResponseObject(response);
        // console.log(response.data);

        // dataArr = addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

        let successResponse = prepareSuccessResponse(dataArr);
        console.log(successResponse);
        res.send(successResponse);
    }).
    catch((err) => {
        let failureResponse = prepareFailureResponse(err);
        res.send(failureResponse);
    });
} catch(err) {
    let failureResponse = prepareFailureResponse(err);
    res.send(failureResponse);
    }
})

app.post('/v1/api/chart/data/read', (req, res) => {

    try {
    let request = req.body.request;
    // let checkUnique = request.unique;
    let reqFilters = request.filter;
    let granularity = request.granularity;
    let dimension = request.dimension;
    
    // let reqParams = request.params;

    // let reqParamsKeys = Object.keys(reqParams);
    let requestdataSource = request.dataSource;
    
    // reqParamsKeys.forEach((paramKey) => {
    //     reqFilters[paramKey] = reqParams[paramKey];
    // });
    if(!!reqFilters.time) {
        delete reqFilters.time;
    }
    if(!!reqFilters.start_time) {
        request.startTime = reqFilters.start_time;
        delete reqFilters.start_time;
    }
    if(!!reqFilters.end_time) {
        request.endTime = reqFilters.end_time;
        delete reqFilters.end_time;
    }
    
    let reqFilterKeys = Object.keys(reqFilters);

    console.log(request);

    let requestBody = {};

    requestBody = addDataSource(requestBody, requestdataSource);

    requestBody = addQueryType(requestBody, 'groupBy');
    
    requestBody = addGranularity(requestBody, granularity);

    if(dimension) {
        requestBody = addDimensionObject(requestBody, dimension);
    }
    requestBody = addAggregationObject(requestBody, false, request.unique_param);

    requestBody = addTimeObject(requestBody, request.startTime, request.endTime);

    requestBody = addFilterObject(requestBody, reqFilterKeys, reqFilters);

    console.log('Request Body :  ');
    console.log(JSON.stringify(requestBody));

    sendRequestToDruid(requestBody)
    .then((response) => {
        let dataArr = prepareResponseObject(response);
        // console.log(response.data);

        // dataArr = addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

        let successResponse = prepareSuccessResponse(dataArr);
        console.log(successResponse);
        res.send(successResponse);
    }).
    catch((err) => {
        let failureResponse = prepareFailureResponse(err);
        res.send(failureResponse);
    });
} catch(err) {
    let failureResponse = prepareFailureResponse(err);
    res.send(failureResponse);
    }
})

function addDataSource(requestBody, requestdataSource) {
    let dataSource = requestdataSource ? requestdataSource : 'socionDataWithLocation';
    requestBody['dataSource'] = dataSource;
    return requestBody;
}

function addQueryType(requestBody, queryType) {
    requestBody['queryType'] = queryType;
    return requestBody;
}

function addFilterObject(requestBody, reqFilterKeys, reqFilters) {
    let filterObject = {};
    if (reqFilterKeys.length > 1) {
        filterObject['type'] = 'and';
        filterObject['fields'] = [];
        reqFilterKeys.forEach((item) => {
            let filterObjectEach = {};
            if(Array.isArray(reqFilters[item])) {
                filterObjectEach['type'] = 'or';
                filterObjectEach['fields'] = [];
                let filterValues = reqFilters[item];
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
    return requestBody;
}

function addTimeObject(requestBody, startTime, endTime) {
    // add interval logic here 
    if (startTime && endTime) {
        timeInterval = startTime + '/' + endTime;
    } else if (startTime) {
        timeInterval = startTime;
        timeInterval += '/';
        timeInterval += new Date().toISOString();
    } else {
        timeInterval = '2018-10-07T00:00:00.000Z/';
        timeInterval += new Date().toISOString();
    }
    requestBody['intervals'] = [timeInterval];
    return requestBody;
}

function addAggregationObject(requestBody, checkUnique, unique_param) {

    let aggregationObjects = [];
    let aggregationObjectEach = {};
    if (checkUnique) {
        aggregationObjectEach['type'] = 'thetaSketch';
        aggregationObjectEach['name'] = 'count';
        aggregationObjectEach['fieldName'] = unique_param;
    } else {
        aggregationObjectEach['type'] = 'count';
        aggregationObjectEach['name'] = 'count';
    }
    aggregationObjects.push(aggregationObjectEach);
    requestBody['aggregations'] = aggregationObjects;
    return requestBody;
}

function addDimensionObject(requestBody, reqParamsKeys) {

    let dimensionObjects = [];
    if (Array.isArray(reqParamsKeys)) {
        reqParamsKeys.forEach((item) => {
            let dimensionObjectEach = {};
            dimensionObjectEach['type'] = 'selector';
            dimensionObjectEach['dimension'] = item;
            dimensionObjectEach['outputName'] = item;
            dimensionObjects.push(dimensionObjectEach);
        });
    } else {
        let dimensionObjectEach = {};
        dimensionObjectEach['type'] = 'selector';
        dimensionObjectEach['dimension'] = reqParamsKeys;
        dimensionObjectEach['outputName'] = reqParamsKeys;
        dimensionObjects.push(dimensionObjectEach);
    }

    requestBody['dimensions'] = dimensionObjects;
    return requestBody;
}

function addGranularity(requestBody, granularity) {

    requestBody['granularity'] = granularity;
    return requestBody;
}

function sendRequestToDruid(requestBody) {

    return new Promise((resolve, reject) => {
        axios.post(HOST + ":8082/druid/v2", requestBody)
            .then((response) => {
                resolve(response);
            }).
        catch((err) => {
            reject(err);
        });
    });
}


function prepareResponseObject(response) {
    let dataArr = [];
    response.data.forEach(element => {
        element['event']['date'] = element['timestamp'];
        element['event']['count'] = parseInt(element['event']['count']);
        dataArr.push(element['event']);
    });
    return dataArr;
}

function addCountForAllEvents(dataArr, reqParamsKeys, reqParams) {

    reqParamsKeys.forEach((paramKey) => {
        if(Array.isArray(reqParams[paramKey])) {
            reqParams[paramKey].forEach((paramValueEach) => {
                let check = false;
                dataArr.forEach((dataEach) => {
                    if (!!dataEach[paramKey] && dataEach[paramKey] === paramValueEach) {
                        check = true;
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

    return dataArr;
}

function prepareSuccessResponse(dataArr) {
    let successResponse = {};
    successResponse['responseCode'] = 'OK';
    successResponse['result'] = dataArr;
    return successResponse;
}

function prepareFailureResponse(err) {
    let failureResponse = {};
    failureResponse['responseCode'] = 'FAIL';
    failureResponse['error'] = err;
    console.log(err);
    return failureResponse;
}