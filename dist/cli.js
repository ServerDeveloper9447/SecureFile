"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const securefile_1 = require("./securefile");
const minimist_1 = __importDefault(require("minimist"));
const args = (0, minimist_1.default)(process.argv.slice(2));
const key = args.key, file = args._[0], method = args.method;
const secure = new securefile_1.SecureFile(key);
if (method == 'encrypt') {
    const d = secure.encrypt(file);
    console.log(`File encrypted and saved as ${d.fileName} to ${d.filePath}`);
}
else if (method == 'decrypt') {
    const d = secure.decrypt(file);
    console.log(`File decrypted and saved as ${d.fileName} to ${d.filePath}`);
}
else {
    console.log("Invalid method. Use 'encrypt' or 'decrypt'");
}
