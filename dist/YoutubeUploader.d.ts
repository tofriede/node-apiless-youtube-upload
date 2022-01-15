import { VideoObj } from './methods/uploadVideo';
import { Cookies } from './helpers';
export default class YoutubeUploader {
    private cookies;
    promptLoginAndGetCookies(): Promise<Cookies>;
    checkCookiesValidity(): Promise<boolean>;
    loadCookiesFromDisk(path: string): Promise<void>;
    saveCookiesToDisk(path: string): Promise<void>;
    uploadVideo(videoObj: VideoObj, headlessMode?: boolean, onProgress?: (a: string) => any): Promise<string>;
}
