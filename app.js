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
    request = event_type === undefined ?
        index2.generateReqForRoleBar(program_name, dimension, role, topics)
        : index.generateReqforBar(program_name, dimension, event_type, topics)
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
})

//api for getting stacked data
app.post('/v1/api/getStackedData', (req, res) => {
    event_type = req.body.event_type;
    dimension = req.body.dimension;
    program_name = req.body.program_name;
    topics = req.body.topics;
    role = req.body.role;
    request = event_type === undefined ?
        index2.generateReqforRoleStacked(program_name, dimension, role, topics)
        : index.generateReqforStacked(program_name, dimension, event_type, topics)
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
})

//api for multiline
app.post('/v1/api/getMultiLineData', (req, res) => {
    event_type = req.body.event_type;
    dimension = req.body.dimension;
    program_name = req.body.program_name;
    role = req.body.role;
    topics = req.body.topics;
    request = event_type === undefined ?
        index2.generateReqForRoleMultiLine(program_name, dimension, role, topics) :
        index.generateReqForMultiLine(program_name, dimension, event_type, topics)
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
})

//for getting topics list
app.post('/v1/api/getAlltopics', (req, res) => {
    event_type = req.body.event_type;
    program_name = req.body.program_name;
    role = req.body.role;
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
})

app.get('/v1/api/getCountForAttestation', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql",
        {
            query: `SELECT count(*) as "value" from socionDataWithLocation where "event_type"='Generate Attestation'`
        }).then((response) => {
            res.send(response.data)
        })
})


app.get('/v1/api/getCountForSessionCompleted', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql",
        {
            query: `SELECT count(*) as "value" from socionDataWithLocation where "event_type"='Session Completed'`
        }).then((response) => {
            res.send(response.data)
        })
})

app.get('/v1/api/getCountForDownload', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql",
        {
            query: `SELECT count(*) as "value" from socionDataWithLocation where "event_type"='Download Content'`
        }).then((response) => {
            res.send(response.data)
        })
})


app.get('/v1/api/getCountForUniqueTrainee', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql",
        {
            query: `SELECT count(DISTINCT(user_id)) as "value" from socionDataWithLocation where "role"='TRAINEE'`
        }).then((response) => {
            res.send(response.data)
        })
})

app.get('/v1/api/getCountForUniqueTrainer', (req, res) => {
    axios.post(HOST + ":8082/druid/v2/sql",
        {
            query: `SELECT count(DISTINCT(user_id)) as "value" from socionDataWithLocation where "role"='TRAINER'`
        }).then((response) => {
            res.send(response.data)
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