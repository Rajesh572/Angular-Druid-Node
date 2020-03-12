var addDataSource = (requestBody, requestdataSource) => {
    let dataSource = requestdataSource ? requestdataSource : process.env.dn_datasource;
    requestBody['dataSource'] = dataSource;
    return requestBody;
}

var addQueryType = (requestBody, queryType) => {
    requestBody['queryType'] = queryType;
    return requestBody;
}

var addFilterObject = (requestBody, reqFilterKeys, reqFilters) => {
    let filterObject = {};
    if (reqFilterKeys.length > 1) {
        filterObject['type'] = 'and';
        filterObject['fields'] = [];
        reqFilterKeys.forEach((item) => {
            let filterObjectEach = {};
            if (Array.isArray(reqFilters[item])) {
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

var addTimeObject = (requestBody, startTime, endTime) => {
    // add interval logic here 
    if (startTime && endTime) {
        timeInterval = startTime + '/' + endTime;
    } else if (startTime) {
        timeInterval = startTime;
        timeInterval += '/';
        timeInterval += new Date().toISOString();
    } else {
        timeInterval = process.env.dn_initial_time_interval;
        timeInterval += new Date().toISOString();
    }
    requestBody['intervals'] = [timeInterval];
    return requestBody;
}

var addAggregationObject = (requestBody, checkUnique, unique_param) => {

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

var addDimensionObject = (requestBody, reqParamsKeys) => {

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

var addGranularity = (requestBody, granularity) => {

    requestBody['granularity'] = granularity;
    return requestBody;
}

var prepareResponseObject = (response) => {
    let dataArr = [];
    response.data.forEach(element => {
        element['event']['date'] = element['timestamp'];
        element['event']['count'] = parseInt(element['event']['count']);
        dataArr.push(element['event']);
    });
    return dataArr;
}

var addCountForAllEvents = (dataArr, reqParamsKeys, reqParams) => {

    reqParamsKeys.forEach((paramKey) => {
        if (Array.isArray(reqParams[paramKey])) {
            reqParams[paramKey].forEach((paramValueEach) => {
                let check = false;
                dataArr.forEach((dataEach) => {
                    if (!!dataEach[paramKey] && dataEach[paramKey] === paramValueEach) {
                        check = true;
                    }
                });
                if (!check) {
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
                if (!check) {
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

var prepareSuccessResponse = (dataArr) => {
    let successResponse = {};
    successResponse['responseCode'] = 'OK';
    successResponse['result'] = dataArr;
    return successResponse;
}

var prepareFailureResponse = (err) => {
    let failureResponse = {};
    failureResponse['responseCode'] = 'FAIL';
    failureResponse['error'] = err;
    console.log(err);
    return failureResponse;
}


module.exports = {
    addDataSource,
    addQueryType,
    addFilterObject,
    addTimeObject,
    addAggregationObject,
    addDimensionObject,
    addGranularity,
    prepareResponseObject,
    addCountForAllEvents,
    prepareSuccessResponse,
    prepareFailureResponse
}