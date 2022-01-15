"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chrome_location_1 = __importDefault(require("chrome-location"));
const Path = __importStar(require("path"));
const fs_1 = require("fs");
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const helpers_1 = require("../helpers");
const selenium_webdriver_1 = require("selenium-webdriver");
const delayAsync = (ms) => new Promise((res) => setTimeout(res, ms));
const isRunning = (pid) => {
    try {
        // @see https://nodejs.org/api/process.html#process_process_kill_pid_signal
        return process.kill(pid, 0);
    }
    catch (error) {
        return error.code === 'EPERM';
    }
};
const createTmpDir = async (prefix) => {
    const path = await fs_1.promises.mkdtemp(Path.join(os.tmpdir(), prefix));
    const remove = () => fs_1.promises.rm(path, { recursive: true, force: true, maxRetries: 3 });
    return { path, remove };
};
// "Chrome didn't shut down correctly" dialog is caused by their
// crash handler detecting the process was killed. This might be confusing
// to the end user, so we remove it by editing profile preferences
const chromePreventCrashDialog = async (profilePath) => {
    const preferencesPath = Path.join(profilePath, 'Default', 'Preferences');
    const jsonBuf = await fs_1.promises.readFile(preferencesPath);
    const json = JSON.parse(jsonBuf.toString('utf-8'));
    json.profile.exit_type = 'Normal';
    await fs_1.promises.writeFile(preferencesPath, JSON.stringify(json));
};
const hasNotLoggedIn = async (pid) => {
    // The final destination title after a successful login
    // includes '- YouTube Studio' regardless of language
    return (0, helpers_1.pid2title)(pid)
        .then((title) => !title.includes('- YouTube Studio'))
        .catch((e) => {
        console.error(e);
        return true;
    });
};
const runUncontrolledChrome = async (userDataDir) => {
    // Spawn a chrome WITHOUT automation features like --remote-debugging-port or --enable automation because they disable google login in most cases
    // This uncontrolled chrome instance saves cookies to the tempDir. Login status is tracked on windows by process title.
    const chromeProcess = (0, child_process_1.spawn)(chrome_location_1.default, [
        'https://studio.youtube.com',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-translate',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-zero-browsers-open-for-tests',
        `--user-data-dir=${userDataDir}`,
        // possibly confusing "save password" prompt is not possible to
        // hide because it's only possible by "--enable-automation"
    ]);
    const pid = chromeProcess.pid;
    do {
        await delayAsync(1000);
    } while (isRunning(pid) && (await hasNotLoggedIn(pid)));
    chromeProcess.kill();
    await delayAsync(1000);
    await chromePreventCrashDialog(userDataDir);
};
const makeLoggedInChromeProfile = async () => {
    const modulePrefix = 'node-apiless-youtube-upload-';
    const tempDir = await createTmpDir(modulePrefix);
    // Adding a removal exit hook for tempDir is a bad idea, because it cant be
    // done synchronously for EBUSY reasons (and no async hooks I tried did not
    // work). Therefore we do a cleanup of previous runs rather than trying to
    // clean up the current one on exit
    const { base: tmpBase, dir } = Path.parse(tempDir.path);
    for (const file of await fs_1.promises.readdir(dir)) {
        if (file === tmpBase || !file.startsWith(modulePrefix))
            continue;
        const prevProfilePath = Path.join(dir, file);
        console.log('Removing temp profile from previous run', prevProfilePath);
        await fs_1.promises.rm(prevProfilePath, { recursive: true, force: true, maxRetries: 3 });
    }
    return runUncontrolledChrome(tempDir.path)
        .then(() => tempDir)
        .catch((err) => tempDir.remove().then(() => Promise.reject(err)));
};
const fetchCookies = async (driver) => {
    // go to google.com to trigger the saved profile to load faster
    await driver.sleep(4000);
    await driver.get(helpers_1.URL.GOOGLE);
    // Open youtube studio to test if the login is valid
    await driver.get(helpers_1.URL.YOUTUBE_STUDIO);
    // If cookies are valid, user is now either in Youtube Studio at studio.youtube.com,
    // or User select page at youtube.com
    const currentUrl = await driver.getCurrentUrl();
    const isLoggedIn = [helpers_1.URL.YOUTUBE, helpers_1.URL.YOUTUBE_STUDIO].some((link) => currentUrl.startsWith(link));
    if (!isLoggedIn) {
        throw new Error('The login session could not be loaded (either user never logged in, ' +
            "random lag or google account doesn't have a youtube attached)");
    }
    // Select youtube account (one google account might have many brand accounts)
    await driver.get(helpers_1.URL.SELECT_ACCOUNT_YOUTUBE);
    // Wait until url matches exactly URL.YOUTUBE. Note that account selection url includes URL.YOUTUBE, which we don't want to match.
    await driver.wait(selenium_webdriver_1.until.urlIs(helpers_1.URL.YOUTUBE), 60 * 1000);
    const webDriverCookies = await driver.manage().getCookies();
    return new helpers_1.Cookies(webDriverCookies);
};
exports.default = async () => {
    let profilePath;
    let webDriver;
    try {
        profilePath = await makeLoggedInChromeProfile();
        webDriver = await (0, helpers_1.makeWebDriver)({ automation: true, userDataDir: profilePath.path });
        return await fetchCookies(webDriver);
    }
    finally {
        if (webDriver)
            await webDriver.quit();
        if (profilePath)
            await profilePath.remove();
    }
};
