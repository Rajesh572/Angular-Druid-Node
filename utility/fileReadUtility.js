var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../', 'data.json');

var readKeyFromFile = (key) => {
    try {
        let fileDataEncoded = fs.readFileSync(filePath, {encoding: 'utf-8'});
        if (fileDataEncoded) {
            const paresedData = JSON.parse(fileDataEncoded);
            if (key) {
                return paresedData[key];
            }
            else {
                return paresedData;
            }
        }
        } catch (e) {
            return null; 
        }
}

var updateProcessVars = (keys) => {
    if(keys) {
        Object.keys(keys).forEach(key => {
            process.env[key] = keys[key];
        });
    }
}

module.exports = {
    readKeyFromFile,
    updateProcessVars
}