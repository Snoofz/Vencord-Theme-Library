const fs = require("fs");

class CSSTool {
    constructor(file) {
        this.file = file;
    }

    async replaceBackgroundImage(newImageUrl) {
        var cssString = fs.readFileSync(this.file, "utf-8");
        const pattern = /background-image:\s*url\((['"]?)(.*?)\1\);/g; // There might be an easier way, but its whatever! It works.
        const replacedCss = cssString.replace(pattern, `background-image: url('${newImageUrl}');`);
        fs.writeFileSync(this.file, replacedCss);
    }
}

module.exports = CSSTool;