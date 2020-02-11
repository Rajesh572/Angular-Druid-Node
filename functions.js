const apiUrl = "https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?apiKey=4a6oTZrT3yS2UaAzB9fio64ta1O2hasU2tkJl_iUr-s&mode=retrieveLocation&prox="
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const superagent = require("superagent")

function addLocationData(data) {
    var promisedarray = data.map(async function (element) {
        var d = new Date(element['created_at'])
        var month;
        var day;
        var date = JSON.stringify(d)

        if (date == "null") {
            element['date'] = "18/01/2020"
            element['timestamp'] = "2019-10-07 12:21:53.229"
            //newData.push(element)
        } else {

            if (d.getMonth() + 1 < 10) {
                month = "0" + (d.getMonth() + 1)
            }
            else {
                month = d.getMonth() + 1
            }
            if (d.getDate() < 10) {
                day = "0" + d.getDate()
            }
            else {
                day = d.getDate()
            }
            x = day + "/" + month + "/" + d.getFullYear()
            element['date'] = x;
            element['month'] = months[month - 1];
        }






        if (element['session_lat'] && element['session_lon']) {

            url = apiUrl + element['session_lat'] + "," + element['session_lon'];
            /* axios.get(url)
                .then(function (response) {
             */
            data = await superagent.get(url)

            responseData = JSON.parse(data.text)['Response']['View'][0]['Result'][0]['Location']['Address'];

            var Country = responseData['Country'];
            var State = responseData['State'];
            var District = responseData['District'];
            element['Country'] = Country || "Unknown";
            element['State'] = State || "Unknown";
            element['District'] = District || "Unknown";
            element['Location'] = District || "Unknown";


            return Promise.resolve(element)
            // res = JSON.parse(promise.text)
            // //console.log(res['Response']['View'][0]['Result'][0]['Location']['Address'])
            // var coordinatedData = res['Response']['View'][0]['Result'][0]['Location']['Address'];
            // var Country = coordinatedData['Country'];
            // var State = coordinatedData['State'];
            // var District = coordinatedData['District'];
            // console.log(Country,State,District)
            // element['Country'] = Country || "Unknown";
            // element['State'] = State || "Unknown";
            // element['District'] = District || "Unknown";
            // element['Location'] = District || "Unknown";
            // newData.push(element);
            /* }).catch((err) => { console.log(err) }); */
        }

        else {

            element['Country'] = "Unknown";
            element['State'] = "Unknown";
            element['District'] = "Unknown";
            element['Location'] = "Unknown";
            return Promise.resolve(element)
        }
    });
    return Promise.all(promisedarray);
    /* Promise.all(promisedarray).then(({ ...data }) => {
        //console.log("data", data);
        
    }) */

}


module.exports = { addLocationData }