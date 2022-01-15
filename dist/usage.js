"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const YoutubeUploader_1 = __importDefault(require("./YoutubeUploader"));
const main = async () => {
    const youtubeUploader = new YoutubeUploader_1.default();
    // Open a login window for Google account. Cookies will be stored in the youtubeUploader instance
    await youtubeUploader.promptLoginAndGetCookies();
    // Check if cookies are valid
    if (await youtubeUploader.checkCookiesValidity()) {
        // Upload a video to youtube
        await youtubeUploader.uploadVideo({
            videoPath: 'C:/Users/gladiatortoise/Desktop/testVideo.mp4',
            title: '📡 Automatically Uploaded Video 📡',
            description: 'This is a placeholder description.',
            thumbnailPath: 'C:/Users/gladiatortoise/Desktop/TestThumbnail.jpg',
            visibility: 'unlisted',
            monetization: false,
        });
    }
    // save cookies for later usage
    await youtubeUploader.saveCookiesToDisk(process.cwd() + '/cookies_saved.json');
    // later, cookies can be loaded like this so there's no need to repeatedly call promptLogin
    await youtubeUploader.loadCookiesFromDisk(process.cwd() + '/cookies_saved.json');
};
main().catch(console.error);
