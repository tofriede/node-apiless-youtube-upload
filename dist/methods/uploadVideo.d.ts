import { Cookies } from '../helpers';
export interface VideoObj {
    videoPath: string;
    title: string;
    thumbnailPath?: string;
    description?: string;
    monetization: boolean;
    visibility?: 'private' | 'unlisted' | 'public';
}
declare const _default: (videoObj: VideoObj, cookies: Cookies, headlessMode?: boolean, onProgress?: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}) => Promise<string>;
export default _default;
