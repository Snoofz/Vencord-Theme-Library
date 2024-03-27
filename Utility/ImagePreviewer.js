const GIFDecoder = require('gif-frames');
const asciify = require('asciify-image');
const CustomLogger = require('./Console');
const axios = require('axios');
const fs = require('fs');
const EventEmitter = require('events');
const https = require("https");

class ImagePreviewer extends EventEmitter {
    constructor(gifFilename = 'temp.gif') {
        super();
        this.fps = 25;
        this.width = 100;
        this.gifFilename = gifFilename;
        this.playback = false;
        this.logger = new CustomLogger('Image Previewer', 'red');
        this.frames = null;
    }

    async convertToAscii(imagePath, width) {
        return new Promise((resolve, reject) => {
            asciify(imagePath, { fit: 'box', width: width }, (err, asciified) => {
                if (err) reject(err);
                resolve(asciified);
            });
        });
    }

    // Threaded asyncronus function
    // async printAsciiFrames(frames, width) {
    //     const terminalWidth = process.stdout.columns || 80;
    //     const padding = Math.floor((terminalWidth - width) / 2);
    //     let previousLinesCount = 0;
    
    //     console.clear();
    
    //     for (const frame of frames) {
    //         if (!this.playback) return;
    
    //         const asciiFrame = await this.convertToAscii(frame.getImage(), width);
    
    //         process.stdout.write('\x1B[' + previousLinesCount + 'A');
    
    //         for (let i = 0; i < previousLinesCount; i++) {
    //             process.stdout.clearLine();
    //             process.stdout.moveCursor(0, -1);
    //         }
    
    //         process.stdout.cursorTo(0);
    
    //         console.log(asciiFrame.padStart(padding + width));
    
    //         process.stdout.cursorTo(0);
    //         console.log('');
    //         this.logger.info('[p] To toggle preview!');
    //         this.logger.info(`[FPS] -> ${this.fps}`);
    
    //         const delay = frame.frameInfo.delay;
    //         await new Promise(resolve => setTimeout(resolve, delay));
    
    //         const linesCount = asciiFrame.split('\n').length + 2;
    //         previousLinesCount = linesCount;
    //     }
    
    //     if (this.playback) {
    //         await this.printAsciiFrames(frames, width);
    //     }
    // }

    async repeatCycle() {
        const interval = 1000 / this.fps;
        const terminalWidth = process.stdout.columns || 80;
        const padding = Math.floor((terminalWidth - this.width) / 2);
        for (const frame of this.frames) {
            if (!this.playback) return;
            const asciiFrame = await this.convertToAscii(frame.getImage(), this.width);
            console.clear();

            process.stdout.write('\x1B[1A');
            process.stdout.cursorTo(0);
            console.log(asciiFrame.padStart(padding + this.width));
            console.log(``);
            this.logger.info(`[p] To toggle preview!`);
            this.logger.info(`[FPS] -> ${this.fps}`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        this.repeatCycle();
    }

    async printAsciiFrames(frames, width, fps) {
        this.frames = frames;
        const interval = 1000 / fps;
        const terminalWidth = process.stdout.columns || 80;
        const padding = Math.floor((terminalWidth - width) / 2);

        for (const frame of frames) {
            if (!this.playback) return;
            const asciiFrame = await this.convertToAscii(frame.getImage(), width);
            console.clear();

            process.stdout.write('\x1B[1A');
            process.stdout.cursorTo(0);
            console.log(asciiFrame.padStart(padding + width));
            console.log(``);
            this.logger.info(`[p] To toggle preview!`);
            this.logger.info(`[FPS] -> ${this.fps}`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        this.repeatCycle();
    }

    async downloadGif(url, filename) {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(filename);
    
            const request = https.get(url, response => {
                if (response.statusCode !== 200) {
                    reject(`Failed to download GIF. Status Code: ${response.statusCode}`);
                    return;
                }
    
                response.pipe(fileStream);
    
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
    
                fileStream.on('error', err => {
                    fs.unlink(filename, () => reject(err));
                });
            });
    
            request.on('error', err => {
                fs.unlink(filename, () => reject(err));
            });
        });
    }    

    async startPreview(url, maxWidth = 100) {
        if (!url || url == undefined) return { "error": "Please choose a theme to preview!" };
        this.playback = true;
        this.url = url;
        this.width = maxWidth;
    
        const response = await axios.head(url);
        const contentType = response.headers['content-type'];
        const extension = contentType.split('/')[1];
        this.gifFilename = contentType === 'image/gif' ? 'tmp.gif' : `tmp.${extension}`;
    
        await this.downloadGif(this.url, this.gifFilename);
    
        const isGif = this.gifFilename.endsWith('.gif');
    
        if (isGif) {
            const frames = await GIFDecoder({ url: this.gifFilename, frames: 'all', outputType: 'png', cumulative: true });
            
            const terminalWidth = process.stdout.columns || 80;
            const maxGifWidth = frames.reduce((max, frame) => Math.max(max, frame.getImage().width), 0);
            let width = Math.min(terminalWidth, maxGifWidth);
            
            width = Math.min(width, maxWidth);
            const delays = frames.map(frame => frame.frameInfo.delay);
            const minDelay = Math.min(...delays);
            const fps = minDelay > 0 ? Math.round(100 / minDelay) : 0;
            
            const isSquare = frames.every(frame => frame.getImage().width === frame.getImage().height);
            
            if (isSquare) {
                this.width = 60;
            } else {
                this.width = 110;
            }
            
            this.fps = fps;
            
            await this.printAsciiFrames(frames, this.width, this.fps);
        } else {
            const frameData = await asciify(this.gifFilename, { fit: 'box', width: maxWidth });
            console.clear();
            console.log(frameData);
            console.log(``);
            this.logger.info(`[p] To toggle preview!`);
            this.logger.info(`[FPS] -> ${this.fps}`);
        }
    
        fs.unlinkSync(this.gifFilename);
        return { "success": `Playing preview with -> ${url}` };
    }
    
    async stopPreview() {
        console.clear();
        this.playback = false;
    }
}

module.exports = ImagePreviewer;
