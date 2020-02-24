function generateReqForRoleBar(program_name, dimension, role,topics) {
    granualirity = dimension === 'month' ? 'Month' : 'All';

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
                { type: "selector", dimension: "role", value: role }
            ]
        },
        aggregations: [
            {
                type: "cardinality",
                name: "count",
                fieldNames: [
                    "user_id"
                ]
            }
        ],
        intervals: [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics!= undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req
}



function generateReqforRoleStacked(program_name, dimension, role,topics) {

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
                { type: "selector", dimension: "role", value: role }
            ]
        }, aggregations: [
            {
                type: "cardinality",
                name: "count",
                fieldNames: [
                    "user_id"
                ]
            }
        ],
        intervals: [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics!= undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req
}

function generateReqForRoleMultiLine(program_name, dimension, role,topics) {
    granualirity = dimension === "month" ? "Month" : "All";
    dimension = dimension === "month" ? ["topic_name"] : ["topic_name", "Location"];
    var Req = {
        queryType: "groupBy",
        dataSource: "socionDataWithLocation",
        granularity: granualirity,
        dimensions: dimension,
        aggregations: [
            {
                type: "cardinality",
                name: "count",
                fieldNames: [
                    "user_id"
                ]
            }
        ],
        filter: {
            type: "and",
            fields: [
                { "type": "selector", "dimension": "program_name", "value": program_name },
                { "type": "selector", "dimension": "role", "value": role },
            ]
        },
        "intervals": [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }

    if (topics!= undefined && topics.length > 0) {
        obj = {
            "type": "in",
            "dimension": "topic_name",
            "values": topics
        }

        Req.filter.fields.push(obj)
    }
    return Req;

}


function generateReqForRoleTopic(program_name, role) {
    var Req = {
        "queryType": "groupBy",
        "dataSource": "socionDataWithLocation",
        "granularity": "Month",
        "dimensions": [
            "topic_name"
        ],

        aggregations: [
            {
                type: "cardinality",
                name: "count",
                fieldNames: [
                    "user_id"
                ]
            }
        ],
        "filter": {
            "type": "and",
            "fields": [
                { "type": "selector", "dimension": "program_name", "value": program_name },
                { "type": "selector", "dimension": "role", "value": role }

            ]
        },
        "intervals": [
            "2018-10-07T00:00:00.000Z/2020-10-30T00:00:00.000Z"
        ]
    }
    return Req;

}

module.exports = { generateReqForRoleBar, generateReqForRoleMultiLine, generateReqforRoleStacked, generateReqForRoleTopic }