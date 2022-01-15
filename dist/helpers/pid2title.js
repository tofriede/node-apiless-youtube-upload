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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pid2title = void 0;
const child_process_1 = require("child_process");
const util = __importStar(require("util"));
const execAsync = util.promisify(child_process_1.exec);
const pid2title_linux = async (PID) => {
    // grab all window ids
    const { stdout: stdout1 } = await execAsync('xprop -root _NET_CLIENT_LIST | cut -d "#" -f 2');
    const WIDs = stdout1.split(',').map((s) => s.trim());
    // fetch info about each window
    const findWidCommand = `ids="${WIDs.join(' ')}"\n` +
        'for wid in ${ids}; do\n' +
        "xprop -id ${wid} _NET_WM_PID _NET_WM_NAME | awk -F ' = ' '{print $2}'" +
        ';done';
    const { stdout: stdout2 } = await execAsync(findWidCommand);
    const blocks = stdout2.split('\n');
    while (blocks.length) {
        const [pid, name] = blocks.splice(0, 2);
        // if pid of the window equals PID return the title.
        // `name` variable contains string with quotes, there is why slice needed
        if (Number(pid) === PID)
            return name.trim().slice(1, -1);
    }
    // otherwise throw an error
    throw new Error(`Can not detect a window of process: ${PID}`);
};
const pid2title_win = async (PID) => {
    const cmd = `powershell.exe (Get-Process -id ${PID} -ErrorAction SilentlyContinue).MainWindowTitle`;
    const { stdout } = await execAsync(cmd);
    return stdout;
};
const pid2title = async (PID) => {
    if (process.platform === 'win32')
        return pid2title_win(PID);
    if (process.platform === 'linux')
        return pid2title_linux(PID);
    return '';
};
exports.pid2title = pid2title;
