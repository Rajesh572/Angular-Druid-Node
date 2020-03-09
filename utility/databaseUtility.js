const axios = require("axios");
const config = require("./../config");
const HOST = config.HOST;


var sendRequestToDruid = (requestBody) => {

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

module.exports = {
    sendRequestToDruid
}