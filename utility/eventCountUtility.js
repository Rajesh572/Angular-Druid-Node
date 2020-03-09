const common = require('./commonUtility');
const database = require('./databaseUtility');


var readEventCount = (req) => {
    try {
        let request = req.body.request;
        let checkUnique = request.unique;
        let reqFilters = request.filter;
        let reqParams = request.params;
        if (!!reqFilters.time) {
            delete reqFilters.time;
        }
        if (!!reqFilters.start_time) {
            request.startTime = reqFilters.start_time;
            delete reqFilters.start_time;
        }
        if (!!reqFilters.end_time) {
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

        requestBody = common.addDataSource(requestBody, requestdataSource);

        requestBody = common.addQueryType(requestBody, 'groupBy');

        requestBody = common.addGranularity(requestBody, 'All');

        requestBody = common.addDimensionObject(requestBody, reqParamsKeys);

        requestBody = common.addAggregationObject(requestBody, checkUnique, request.unique_param);

        requestBody = common.addTimeObject(requestBody, request.startTime, request.endTime);

        requestBody = common.addFilterObject(requestBody, reqFilterKeys, reqFilters);

        console.log('Request Body :  ');
        console.log(JSON.stringify(requestBody));

        return database.sendRequestToDruid(requestBody)
            .then((response) => {
                let dataArr = common.prepareResponseObject(response);
                // console.log(response.data);

                dataArr = common.addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

                let successResponse = common.prepareSuccessResponse(dataArr);
                console.log(successResponse);
                return Promise.resolve(successResponse);
            }).
        catch((err) => {
            let failureResponse = common.prepareFailureResponse(err);
            return Promise.reject(failureResponse);
        });
    } catch (err) {
        let failureResponse = common.prepareFailureResponse(err);
        return Promise.reject(failureResponse);
    }
}

var readUniqueEventCount = (req) => {
    try {
        let request = req.body.request;
        let reqFilters = request.filter;

        if (!!reqFilters.time) {
            delete reqFilters.time;
        }
        if (!!reqFilters.start_time) {
            request.startTime = reqFilters.start_time;
            delete reqFilters.start_time;
        }
        if (!!reqFilters.end_time) {
            request.endTime = reqFilters.end_time;
            delete reqFilters.end_time;
        }

        let reqFilterKeys = Object.keys(reqFilters);
        let reqParams = request.params;
        // dataSource = req.body.dataSource;

        let requestdataSource = request.dataSource;

        let requestBody = {};

        requestBody = common.addDataSource(requestBody, requestdataSource);

        requestBody = common.addQueryType(requestBody, 'groupBy');

        requestBody = common.addGranularity(requestBody, 'All');

        // requestBody = common.addAggregationObject(requestBody, checkUnique, request.unique_param);

        requestBody = common.addTimeObject(requestBody, request.startTime, request.endTime);

        requestBody = common.addFilterObject(requestBody, reqFilterKeys, reqFilters);



        let allRequests = [];
        reqParams.forEach((item) => {
            requestBodyNew = {
                ...requestBody
            };
            requestBodyNew = common.addDimensionObject(requestBodyNew, item);

            console.log('Request Body :  ');
            console.log(JSON.stringify(requestBodyNew));
            let sendRequest = database.sendRequestToDruid(requestBodyNew);
            allRequests.push(sendRequest);
        });

        console.log("AllRequests : ", allRequests);

        return Promise.all(allRequests).then((responses) => {
            let resultArr = {};
            responses.forEach((response, i) => {
                let dataArr = [];
                dataKey = reqParams[i];
                response.data.forEach((element) => {
                    if (!!element['event'][dataKey]) {
                        dataArr.push(element['event'][dataKey]);
                    } else {
                        dataArr = null;
                    }
                });
                resultArr[dataKey] = dataArr;
            });

            let successResponse = common.prepareSuccessResponse(resultArr);
            console.log(successResponse);
            return Promise.resolve(successResponse);
        }).
        catch((err) => {
            let failureResponse = common.prepareFailureResponse(err);
            console.log(err);
            return Promise.reject(failureResponse);
        });
    } catch (err) {
        let failureResponse = common.prepareFailureResponse(err);
        return Promise.reject(failureResponse);
    }
}

module.exports = {
    readEventCount,
    readUniqueEventCount
}