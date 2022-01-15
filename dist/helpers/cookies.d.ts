import { IWebDriverCookie } from 'selenium-webdriver';
export declare class Cookies {
    private readonly items;
    constructor(cookies?: IWebDriverCookie[]);
    toString(): string;
    saveToFileSync(path: string): void;
    static fromJSONString(jsonString: string): Cookies;
    static fromJSONFileSync(jsonFilePath: string): Cookies;
    [Symbol.iterator](): Generator<IWebDriverCookie, void, unknown>;
    get length(): number;
}
