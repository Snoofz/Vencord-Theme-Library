const CustomLogger = require("./Utility/Console");
const EasyJson = require("./Utility/EasyJson");
const CSSTool = require("./Utility/CSSTool");
const ImagePreviewer = require("./Utility/ImagePreviewer");

const readline = require("readline");

const logger = new CustomLogger('Themecord', 'magenta');
const imagePreviewer = new ImagePreviewer("tempGifData.gif");
const easyJson = new EasyJson("/home/user/Documents/ThemeChanger/Config.json");
let path = easyJson.get("VencordThemePath");
let themes = require("./Wallpaper Scraper/ScrapedImages.json");
let hasPath = !!path;
let slideShow = false;
let choosableThemes;
let isSearching = false;

let rl = readline.createInterface({
    output: process.stdout,
    input: process.stdin
});

var selectedTheme;
console.clear();
var previewState = false;

const itemsPerPage = 9;
let currentPage = 1;
let totalPages = Math.ceil(Object.keys(themes).length / itemsPerPage);

function displayThemesForPage(page, searchResults = null) {
    logger.success(`Slideshow state -> ${slideShow ? "Active" : "Inactive"}`);
    const startIndex = (page - 1) * itemsPerPage;
    let themesToDisplay = searchResults ? searchResults : Object.keys(themes);
    const totalThemes = searchResults ? searchResults.length : Object.keys(themes).length;
    const endIndex = Math.min(startIndex + itemsPerPage, totalThemes);
    logger.info(`Page ${page}/${totalPages}:`);
    console.log("");
    logger.log('Choose a theme ↓ ');
    for (let i = startIndex; i < endIndex; i++) {
        logger.option(`[${(i % itemsPerPage) + 1}] ${themesToDisplay[i]}`);
    }
    console.log("");
    logger.option(`[r] Choose For Me`);
    logger.option(`[p] Preview Wallpaper (ASCII)`);
    logger.option(`[s] Search for Wallpapers`);
    console.log("");
    logger.info("Press 'right' arrow key to go to the next page, 'left' arrow key to go to the previous page, or 'ESC' to exit.");
}

function handleUserInput(key) {
    if (isSearching) return;
    if (key === "right" && currentPage < totalPages) {
        currentPage++;
        console.clear();
        displayThemesForPage(currentPage, choosableThemes);
    } else if (key === "left" && currentPage > 1) {
        currentPage--;
        console.clear();
        displayThemesForPage(currentPage, choosableThemes);
    }
}

function setupKeyboardInput() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on("keypress", (_, key) => {
        if (isSearching) return;
        if (key.name === "right" || key.name === "left") {
            handleUserInput(key.name);
        } else if (key.name === "escape") {
            process.exit();
        }
    });
}

if (hasPath) {
    logger.success(`Slideshow state -> ${slideShow ? "Active" : "Inactive"}`);
    var index = 0;
    let name;            
    console.log("");

    setInterval(() => {
        if (!slideShow) return; 
        if (index == Object.keys(themes).length - 1) index = 0;
        name = Object.keys(themes)[index];
        new CSSTool(path).replaceBackgroundImage(themes[name]);
        index++;
    }, 10000);

    chooseTheme();

    setupKeyboardInput();
} else {
    logger.log('Vencord Theme Path ↓ ');
}

imagePreviewer.on('previewStopped', () => {
    console.clear();
    displayThemesForPage(currentPage, choosableThemes);
    logger.info('Preview ended!');
});

function searchTheme() {
    console.clear();
    logger.success(`Slideshow state -> ${slideShow ? "Active" : "Inactive"}`);
    console.log("");
    logger.info("Search Wallpaper by name -> ");
    
    // Clear the input buffer
    rl.clearLine(process.stdout, 0);

    rl.once("line", (searchTerm) => {
        logger.debug(`Searching Wallpapers using search term -> ${searchTerm}`);
        const foundThemes = Object.keys(themes).filter(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()));
        if (foundThemes.length === 0) {
            currentPage = 1;
            console.clear();
            logger.error("No themes found matching your search term.");
            isSearching = false;
            const foundThemes = Object.keys(themes).filter(theme => theme.toLowerCase().includes(""));
            choosableThemes = foundThemes;
            totalPages = Math.ceil(choosableThemes.length / itemsPerPage);
            displayThemesForPage(currentPage, choosableThemes);
            setupKeyboardInput();
            return;
        }
        choosableThemes = foundThemes;
        totalPages = Math.ceil(choosableThemes.length / itemsPerPage);
        currentPage = 1;
        console.clear();
        displayThemesForPage(currentPage, choosableThemes);
        setupKeyboardInput();
        isSearching = false;
    });
    rl.prompt();
}

process.stdin.on('data', async (input) => {
    if (isSearching) return;
    if (hasPath) {
        if (input == "s") {
            console.clear();
            isSearching = true;
            searchTheme();
        } else if (input == "p") {
            console.clear();
            displayThemesForPage(currentPage, choosableThemes);
            previewState = !previewState;

            if (previewState) {
                logger.warning("Image may take a second to load!");
                let c = await imagePreviewer.startPreview(selectedTheme, 75);
                if (c.success) return;
                if (c.error) {
                    await imagePreviewer.stopPreview();
                    displayThemesForPage(currentPage, choosableThemes);
                    logger.warning(c.error);
                }
            } else {
                await imagePreviewer.stopPreview();
                displayThemesForPage(currentPage, choosableThemes);
            }
        } else if (input == "r") {
            const index = Math.floor(Math.random() * 7);
            const name = Object.keys(themes)[index];
            new CSSTool(path).replaceBackgroundImage(themes[name]);
            selectedTheme = themes[name];searchTheme
            console.clear();
            logger.success(`Updated theme to -> ${Object.keys(themes)[index]}`);
            displayThemesForPage(currentPage, choosableThemes);
        }
        input = parseInt(input.toString()); 
        if (input > 0 && input <= itemsPerPage) {
            const themeIndex = (currentPage - 1) * itemsPerPage + input - 1;
            if (themeIndex >= choosableThemes.length) return;
        
            console.clear();            
        
            let chosenTheme = choosableThemes[themeIndex];
            new CSSTool(path).replaceBackgroundImage(themes[chosenTheme]);
            selectedTheme = themes[chosenTheme];
            logger.success(`Updated theme to -> ${chosenTheme}`);
            displayThemesForPage(currentPage, choosableThemes);
        } else if (input > Object.keys(themes).length) {
            return;
        } else if (isNaN(input)) {
            return;
        } else {
            console.clear();
            let chosenTheme = choosableThemes[input - 1];
            logger.logOptions(Object.keys(themes), chosenTheme.theme);
            console.log("");
            if (input == "s") {
                console.clear();
                isSearching = true;
                searchTheme();
            } else
            if (input == "p") {
                console.clear();
                displayThemesForPage(currentPage, choosableThemes);
                previewState = !previewState;

                if (previewState) {
                    logger.warning("Image may take a second to load!");
                    let c = await imagePreviewer.startPreview(selectedTheme, 75);
                    if (c.success) return;
                    if (c.error) {
                        await imagePreviewer.stopPreview();
                        displayThemesForPage(currentPage, choosableThemes);
                        logger.warning(c.error);
                    }
                } else {
                    await imagePreviewer.stopPreview();
                    displayThemesForPage(currentPage, choosableThemes);
                }
            } else if (input == "r") {
                const index = Math.floor(Math.random() * 7);
                const name = Object.keys(themes)[index];
                new CSSTool(path).replaceBackgroundImage(themes[name]);
                selectedTheme = themes[name];
                logger.success(`Updated theme to -> ${Object.keys(themes)[index]}`);
            } else if (choosableThemes && input > 0 && input <= itemsPerPage) {
                const themeIndex = (currentPage - 1) * itemsPerPage + input - 1;
                if (themeIndex >= choosableThemes.length) return;
    
                console.clear();            
    
                let chosenTheme = choosableThemes[themeIndex];
                new CSSTool(path).replaceBackgroundImage(themes[chosenTheme]);
                selectedTheme = themes[chosenTheme];
                logger.success(`Updated theme to -> ${chosenTheme}`);
                displayThemesForPage(currentPage, choosableThemes);
            }
            displayThemesForPage(currentPage, choosableThemes);
        }
    }
});


rl.setPrompt("");
rl.on("line", (input) => {
    if (!hasPath) {
        input = input.toString().trim();
        if (!input) {
            logger.fatal(`Please provide a valid path to your main Vencord theme.css!`);
            process.exit();
        }
        easyJson.set("VencordThemePath", input.toString());
        path = easyJson.get("VencordThemePath");
        logger.success(`Vencord theme path was set to -> ${path}!`);
        chooseTheme();
        rl.close();
    }
});

function chooseTheme() {
    var themes = require("./Wallpaper Scraper/ScrapedImages.json");
    logger.info(`Page 1/${totalPages}:`);
    console.log("");
    logger.log('Choose a theme ↓ ');
    for (let i = 0; i < Object.keys(themes).length; i++) {
        if (i >= 9) continue;
        logger.option(`[${i + 1}] ${Object.keys(themes)[i]}`);
    }
    console.log("");
    logger.option(`[r] Choose For Me`);
    logger.option(`[p] Preview Wallpaper (ASCII)`);
    logger.option(`[s] Search for Wallpapers`);
    console.log("");
    logger.info("Press 'right' arrow key to go to the next page, 'left' arrow key to go to the previous page, or 'ESC' to exit.");
}

async function threadLoop() { setInterval(() => {}); };

threadLoop();