"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookies = void 0;
const fs_1 = __importDefault(require("fs"));
class Cookies {
    items;
    constructor(cookies = []) {
        this.items = cookies;
    }
    toString() {
        return JSON.stringify(this.items);
    }
    saveToFileSync(path) {
        return fs_1.default.writeFileSync(path, JSON.stringify(this.items));
    }
    static fromJSONString(jsonString) {
        return new Cookies(JSON.parse(jsonString));
    }
    static fromJSONFileSync(jsonFilePath) {
        const jsonBuf = fs_1.default.readFileSync(jsonFilePath);
        return Cookies.fromJSONString(jsonBuf.toString('utf-8'));
    }
    *[Symbol.iterator]() {
        for (const item of this.items)
            yield item;
    }
    get length() {
        return this.items.length;
    }
}
exports.Cookies = Cookies;
