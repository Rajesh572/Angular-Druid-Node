const common = require('./commonUtility');
const database = require('./databaseUtility');

var readBarchartData = (req) => {
    try {
        let request = req.body.request;
        let checkUnique = request.unique;
        let reqFilters = request.filter;
        let granularity = request.granularity;
        let dimension = request.dimension;

        // let reqParams = request.params;

        // let reqParamsKeys = Object.keys(reqParams);
        let requestdataSource = request.dataSource;

        // reqParamsKeys.forEach((paramKey) => {
        //     reqFilters[paramKey] = reqParams[paramKey];
        // });
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

        console.log(request);

        let requestBody = {};

        requestBody = common.addDataSource(requestBody, requestdataSource);

        requestBody = common.addQueryType(requestBody, 'groupBy');

        requestBody = common.addGranularity(requestBody, granularity);

        if (dimension) {
            requestBody = common.addDimensionObject(requestBody, dimension);
        }

        requestBody = common.addAggregationObject(requestBody, checkUnique, request.unique_param);

        requestBody = common.addTimeObject(requestBody, request.startTime, request.endTime);

        requestBody = common.addFilterObject(requestBody, reqFilterKeys, reqFilters);

        console.log('Request Body :  ');
        console.log(JSON.stringify(requestBody));

        return database.sendRequestToDruid(requestBody)
            .then((response) => {
                let dataArr = common.prepareResponseObject(response);
                // console.log(response.data);

                // dataArr = addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

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

var readChartData = (req) => {
    try {
        let request = req.body.request;
        let checkUnique = request.unique;
        let reqFilters = request.filter;
        let granularity = request.granularity;
        let dimension = request.dimension;

        // let reqParams = request.params;

        // let reqParamsKeys = Object.keys(reqParams);
        let requestdataSource = request.dataSource;

        // reqParamsKeys.forEach((paramKey) => {
        //     reqFilters[paramKey] = reqParams[paramKey];
        // });
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

        console.log(request);

        let requestBody = {};

        requestBody = common.addDataSource(requestBody, requestdataSource);

        requestBody = common.addQueryType(requestBody, 'groupBy');

        requestBody = common.addGranularity(requestBody, granularity);

        if (dimension) {
            requestBody = common.addDimensionObject(requestBody, dimension);
        }
        requestBody = common.addAggregationObject(requestBody, checkUnique, request.unique_param);

        requestBody = common.addTimeObject(requestBody, request.startTime, request.endTime);

        requestBody = common.addFilterObject(requestBody, reqFilterKeys, reqFilters);

        console.log('Request Body :  ');
        console.log(JSON.stringify(requestBody));

        return database.sendRequestToDruid(requestBody)
            .then((response) => {
                let dataArr = common.prepareResponseObject(response);
                // console.log(response.data);

                // dataArr = addCountForAllEvents(dataArr, reqParamsKeys, reqParams);

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

module.exports = {
    readBarchartData,
    readChartData
}