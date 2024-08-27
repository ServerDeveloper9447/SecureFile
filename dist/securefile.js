"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SecureFile_instances, _SecureFile_key, _SecureFile_algorithm, _SecureFile_encryptString, _SecureFile_decryptString;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFile = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ciphers = node_crypto_1.default.getCiphers();
const hashes = node_crypto_1.default.getHashes();
class SecureFile {
    constructor(key, algorithm = 'aes-256-cbc', keyHash = 'sha256') {
        _SecureFile_instances.add(this);
        _SecureFile_key.set(this, void 0);
        _SecureFile_algorithm.set(this, void 0);
        __classPrivateFieldSet(this, _SecureFile_key, node_crypto_1.default.createHash(keyHash).update(key).digest(), "f");
        __classPrivateFieldSet(this, _SecureFile_algorithm, algorithm, "f");
    }
    encrypt(filePath, options = { rename: true, overwrite: true }) {
        let key = __classPrivateFieldGet(this, _SecureFile_key, "f");
        const iv = node_crypto_1.default.randomBytes(16);
        const fileData = fs_1.default.readFileSync(filePath);
        const cipher = node_crypto_1.default.createCipheriv(__classPrivateFieldGet(this, _SecureFile_algorithm, "f"), key, iv);
        let encryptedData = cipher.update(fileData);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        const originalFileName = path_1.default.basename(filePath);
        const encryptedFileName = __classPrivateFieldGet(this, _SecureFile_instances, "m", _SecureFile_encryptString).call(this, originalFileName, key, iv);
        const encryptedFilePath = path_1.default.join(path_1.default.dirname(filePath), encryptedFileName);
        if (!(options === null || options === void 0 ? void 0 : options.overwrite)) {
            fs_1.default.writeFileSync(encryptedFilePath, Buffer.concat([iv, encryptedData]));
            let rd = { fileName: encryptedFileName, filePath: encryptedFilePath };
            return rd;
        }
        if (!(options === null || options === void 0 ? void 0 : options.rename)) {
            fs_1.default.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
            let rd = { fileName: originalFileName, filePath: filePath };
            return rd;
        }
        fs_1.default.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
        fs_1.default.renameSync(filePath, encryptedFilePath);
        let rd = { fileName: encryptedFileName, filePath: encryptedFilePath };
        return rd;
    }
    decrypt(filePath, overwrite = true) {
        let key = __classPrivateFieldGet(this, _SecureFile_key, "f");
        const encryptedData = fs_1.default.readFileSync(filePath);
        if (encryptedData.length < 17) {
            throw new Error('The encrypted file is too short or corrupted.');
        }
        const iv = encryptedData.subarray(0, 16);
        const encryptedContent = encryptedData.subarray(16);
        const decipher = node_crypto_1.default.createDecipheriv(__classPrivateFieldGet(this, _SecureFile_algorithm, "f"), key, iv);
        let decryptedData = Buffer.concat([
            decipher.update(encryptedContent),
            decipher.final(),
        ]);
        const encryptedFileName = path_1.default.basename(filePath);
        const originalFileName = __classPrivateFieldGet(this, _SecureFile_instances, "m", _SecureFile_decryptString).call(this, encryptedFileName, key, iv);
        const originalFilePath = path_1.default.join(path_1.default.dirname(filePath), originalFileName);
        if (!overwrite) {
            fs_1.default.writeFileSync(originalFilePath, decryptedData);
            let rd = { fileName: originalFileName, filePath: originalFilePath };
            return rd;
        }
        fs_1.default.writeFileSync(filePath, decryptedData);
        fs_1.default.renameSync(filePath, originalFilePath);
        let rd = { fileName: originalFileName, filePath: originalFilePath };
        return rd;
    }
    encryptMany(fileData) {
        return fileData.map(file => this.encrypt(file.filePath, { overwrite: file === null || file === void 0 ? void 0 : file.overwrite, rename: file === null || file === void 0 ? void 0 : file.rename }));
    }
    decryptMany(fileData) {
        return fileData.map(file => this.decrypt(file.filePath, file === null || file === void 0 ? void 0 : file.overwrite));
    }
    encryptFolder(folderPath) {
        const files = fs_1.default.readdirSync(folderPath, { withFileTypes: true });
        const paths = files.map(file => path_1.default.join(folderPath, file.name));
        for (const filePath of paths) {
            const stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                this.encryptFolder(filePath);
            }
            else {
                this.encrypt(filePath);
            }
        }
    }
    decryptFolder(folderPath) {
        const files = fs_1.default.readdirSync(folderPath, { withFileTypes: true });
        const paths = files.map(file => path_1.default.join(folderPath, file.name));
        for (const filePath of paths) {
            const stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                this.decryptFolder(filePath);
            }
            else {
                this.decrypt(filePath);
            }
        }
    }
}
exports.SecureFile = SecureFile;
_SecureFile_key = new WeakMap(), _SecureFile_algorithm = new WeakMap(), _SecureFile_instances = new WeakSet(), _SecureFile_encryptString = function _SecureFile_encryptString(text, key, iv) {
    const cipher = node_crypto_1.default.createCipheriv(__classPrivateFieldGet(this, _SecureFile_algorithm, "f"), key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}, _SecureFile_decryptString = function _SecureFile_decryptString(encryptedText, key, iv) {
    const decipher = node_crypto_1.default.createDecipheriv(__classPrivateFieldGet(this, _SecureFile_algorithm, "f"), key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
