import promptLoginAndGetCookies from './methods/promptLoginAndGetCookies'
import checkCookiesValidity from './methods/checkCookiesValidity'
import uploadVideo, {VideoObj} from './methods/uploadVideo'
import YoutubeUploader from './YoutubeUploader'

export default YoutubeUploader
export {
    promptLoginAndGetCookies,
    checkCookiesValidity,
    uploadVideo,
    VideoObj
}
