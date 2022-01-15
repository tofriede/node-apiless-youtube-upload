"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
exports.default = async (cookies) => {
    if (!cookies || !cookies.length)
        return false;
    const driver = await (0, helpers_1.makeWebDriver)({ headless: true });
    return checker(driver, cookies)
        .catch(() => false)
        .finally(() => driver.quit());
};
const checker = async (driver, cookies) => {
    await driver.get(helpers_1.URL.YOUTUBE);
    for (const cookie of cookies)
        await driver.manage().addCookie(cookie);
    await driver.get(helpers_1.URL.YOUTUBE_STUDIO);
    await driver.sleep(1000);
    // Check if url is still studio.youtube.com and not accounts.google.com
    // (which is the case if cookies are not valid / are expired)
    const url = await driver.getCurrentUrl();
    return url.includes(helpers_1.URL.YOUTUBE_STUDIO);
};
