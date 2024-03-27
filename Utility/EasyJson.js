const fs = require("fs");

class EasyJson {
    constructor(file) 
    {
        this.file = file;
    };

    async set(key, value) {
        var tmpJSON = require(`${this.file}`);
        tmpJSON[key] = value;
        fs.writeFileSync(`${this.file}`, JSON.stringify(tmpJSON));
    }

    get(key) {
        var tmpJSON = require(`${this.file}`);
        return tmpJSON[key];
    }

    // push(key, value) {
    //     var tmpJSON = require(`../${this.file}`);
    //     tmpJSON.push({key: value});
    // }
}
  

module.exports = EasyJson;

// const logger = new CustomLogger('[MyPrefix]');
