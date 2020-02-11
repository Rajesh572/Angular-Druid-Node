function generateReqforBar(program_name, dimension, event_type, topics) {

    granualirity = dimension === 'month' ? 'Month' : 'All'

    var Req = {
        queryType: "groupBy",
        dataSource: "socionDataWithLocation",
        granularity: granualirity,
        dimensions: [
            dimension
        ],
        filter:
        {
            type: "and",
            fields: [
                { type: "selector", dimension: "program_name", value: program_name },
                { type: "selector", dimension: "event_type", value: event_type }
            ]
        },
        aggregations: [
            {
                type: "count",
                name: "count",
                fieldName: "count"
            }
        ],
        intervals: [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics != undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req
}

function generateReqforStacked(program_name, dimension, event_type, topics) {

    granualirity = dimension === 'month' ? 'Month' : 'All'

    var Req = {
        queryType: "groupBy",
        dataSource: "socionDataWithLocation",
        granularity: granualirity,
        dimensions: [
            dimension, "topic_name"
        ],
        filter:
        {
            type: "and",
            fields: [
                { type: "selector", dimension: "program_name", value: program_name },
                { type: "selector", dimension: "event_type", value: event_type }
            ]
        },
        aggregations: [
            {
                type: "count",
                name: "count",
                fieldName: "count"
            }
        ],
        intervals: [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics != undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req
}

function generateReqForMultiLine(program_name, dimension, event_type, topics) {
    var Req = {
        queryType: "groupBy",
        dataSource: "socionDataWithLocation",
        granularity: "Day",
        dimensions: [
            "topic_name"
        ],
        aggregations: [
            {
                "type": "count",
                "name": "count",
                "fieldName": "count"
            }
        ],
        filter: {
            type: "and",
            fields: [
                { "type": "selector", "dimension": "program_name", "value": program_name },
                { "type": "selector", "dimension": "event_type", "value": event_type },
            ]
        },
        "intervals": [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics != undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req;

}


function generateReqForTopic(program_name, event_type) {
    var Req = {
        "queryType": "groupBy",
        "dataSource": "socionDataWithLocation",
        "granularity": "Month",
        "dimensions": [
            "topic_name"
        ],
        "aggregations": [
            {
                "type": "count",
                "name": "count",
                "fieldName": "count"
            }
        ],
        "filter": {
            "type": "and",
            "fields": [
                { "type": "selector", "dimension": "program_name", "value": program_name },
                { "type": "selector", "dimension": "event_type", "value": event_type }

            ]
        },
        "intervals": [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }
    return Req;

}


module.exports = { generateReqforBar, generateReqforStacked, generateReqForMultiLine, generateReqForTopic }