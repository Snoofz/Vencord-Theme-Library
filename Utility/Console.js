class CustomLogger {
    constructor(prefix, prefixColor) {
        this.prefix = prefix;
        this.prefixColor = prefixColor;
        this.colors = {
            reset: "\x1b[0m",
            bright: "\x1b[1m",
            dim: "\x1b[2m",
            underscore: "\x1b[4m",
            blink: "\x1b[5m",
            reverse: "\x1b[7m",
            hidden: "\x1b[8m",
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            bgBlack: "\x1b[40m",
            bgRed: "\x1b[41m",
            bgGreen: "\x1b[42m",
            bgYellow: "\x1b[43m",
            bgBlue: "\x1b[44m",
            bgMagenta: "\x1b[45m",
            bgCyan: "\x1b[46m",
            bgWhite: "\x1b[47m",
        };
    }
  
    coloredLog(message, color = 'white') {
      const colorCode = this.colors[color] || this.colors.white;
      const resetCode = this.colors.reset;
  
      console.log(`${colorCode}${message}${resetCode}`);
    }

    log(message, levelColor = 'white', level = 'INFO') {
      const levelCode = this.colors[levelColor] || this.colors.white;
      const resetCode = this.colors.reset;
      const prefixColor = this.colors[this.prefixColor] || this.colors.white;

      console.log(`[${prefixColor}${this.prefix}${resetCode}] [${levelCode}${level}${resetCode}] ${message}`);
    }

    option(message) {
      this.log(message, 'blue', 'OPT');
    }

    error(message) {
      this.log(message, 'red', 'ERROR');
    }

    warning(message) {
      this.log(message, 'yellow', 'WARNING');
    }

    fatal(message) {
      this.log(message, 'bgRed', 'FATAL');
    }

    success(message) {
      this.log(message, 'green', 'SUCCESS');
    }

    info(message) {
      this.log(message, 'cyan', 'INFO');
    }

    debug(message) {
      this.log(message, 'magenta', 'DEBUG');
    }

    logOptions(optionArray, selectedItem) {
      if (!Array.isArray(optionArray)) return this.fatal("An error occurred while processing options: Array expected."); 
    
      let tmpJSON = [];
      for (let i = 0; i < optionArray.length; i++) {
        const theme = optionArray[i] === selectedItem ? `${this.colors.magenta}${optionArray[i]}${this.colors.reset}` : optionArray[i];
        this.option(`[${i + 1}] -> ${theme}`);
        tmpJSON.push({ "index": i + 1, "theme": `${optionArray[i]}` });
      }

      return tmpJSON;
    }
}

module.exports = CustomLogger;

// const logger = new CustomLogger('[MyPrefix]');
