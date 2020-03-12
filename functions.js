const API_KEY=process.env['API_KEY']
const apiUrl = "https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?apiKey="+API_KEY+"&mode=retrieveLocation&prox="
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const superagent = require("superagent")


function addLocationData(data) {
    var promisedarray = data.map(async function (element) {

        //for adding data and month

        var d = new Date(element['created_at'])
        var month;
        var day;
        var date = JSON.stringify(d)

        // if (date == "null") {
        //     element['date'] = "18/01/2020"
        //     element['timestamp'] = "2019-10-07 12:21:53.229"
        // } else {

        //     if (d.getMonth() + 1 < 10) {
        //         month = "0" + (d.getMonth() + 1)
        //     }
        //     else {
        //         month = d.getMonth() + 1
        //     }
        //     if (d.getDate() < 10) {
        //         day = "0" + d.getDate()
        //     }
        //     else {
        //         day = d.getDate()
        //     }
        //     x = day + "/" + month + "/" + d.getFullYear()
        //     element['date'] = x;
        //     element['month'] = months[month - 1];
        // }


        //for adding location data

        if (element['session_lat'] && element['session_lon']) {

            url = apiUrl + element['session_lat'] + "," + element['session_lon'];
            data = await superagent.get(url)

            responseData = JSON.parse(data.text)['Response']['View'][0]['Result'][0]['Location']['Address'];

            var Country = responseData['Country'];
            var State = responseData['State'];
            var District = responseData['District'];
            var City = responseData['City'];

            element['Country'] = Country || "Unknown";
            element['State'] = State || "Unknown";
            element['District'] = District || "Unknown";
            element['City'] = City || "Unknown"
            element['Location'] = District || "Unknown";

            return Promise.resolve(element)
        }

        else {
            element['Country'] = "Unknown";
            element['State'] = "Unknown";
            element['District'] = "Unknown";
            element['Location'] = "Unknown";
            element['City'] = "Unknown"
            return Promise.resolve(element)
        }
    });
    
    return Promise.all(promisedarray);
}


module.exports = { addLocationData }