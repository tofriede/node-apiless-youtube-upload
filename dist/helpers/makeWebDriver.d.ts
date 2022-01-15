import { WebDriver } from 'selenium-webdriver';
declare type DriverArgs = {
    automation?: boolean;
    userDataDir?: string;
    headless?: boolean;
    fullsize?: boolean;
};
export declare const makeWebDriver: (args?: DriverArgs) => Promise<WebDriver>;
export {};
