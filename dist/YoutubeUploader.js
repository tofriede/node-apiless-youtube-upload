"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promptLoginAndGetCookies_1 = __importDefault(require("./methods/promptLoginAndGetCookies"));
const checkCookiesValidity_1 = __importDefault(require("./methods/checkCookiesValidity"));
const uploadVideo_1 = __importDefault(require("./methods/uploadVideo"));
const helpers_1 = require("./helpers");
class YoutubeUploader {
    cookies;
    async promptLoginAndGetCookies() {
        this.cookies = await (0, promptLoginAndGetCookies_1.default)();
        return this.cookies;
    }
    async checkCookiesValidity() {
        return (0, checkCookiesValidity_1.default)(this.cookies);
    }
    async loadCookiesFromDisk(path) {
        this.cookies = helpers_1.Cookies.fromJSONFileSync(path);
    }
    async saveCookiesToDisk(path) {
        return this.cookies.saveToFileSync(path);
    }
    async uploadVideo(videoObj, headlessMode, onProgress) {
        return (0, uploadVideo_1.default)(videoObj, this.cookies, headlessMode, onProgress);
    }
}
exports.default = YoutubeUploader;
