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
var _SecureFile_instances, _SecureFile_key, _SecureFile_encryptString, _SecureFile_decryptString;
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SecureFile {
    /**
     *
     * @param {String} key Key to encrypt
     */
    constructor(key) {
        _SecureFile_instances.add(this);
        _SecureFile_key.set(this, void 0);
        __classPrivateFieldSet(this, _SecureFile_key, key, "f");
    }
    /**
     *
     * @param {String} filePath
     * @param {String|undefined} encryptKey
     * @returns
     */
    encrypt(filePath, encryptKey) {
        let k = encryptKey || __classPrivateFieldGet(this, _SecureFile_key, "f");
        let key = crypto_1.default.createHash('sha256').update(k).digest();
        const iv = crypto_1.default.randomBytes(16);
        const fileData = fs_1.default.readFileSync(filePath);
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
        let encryptedData = cipher.update(fileData);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        fs_1.default.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
        const originalFileName = path_1.default.basename(filePath);
        const encryptedFileName = __classPrivateFieldGet(this, _SecureFile_instances, "m", _SecureFile_encryptString).call(this, originalFileName, key, iv);
        const encryptedFilePath = path_1.default.join(path_1.default.dirname(filePath), encryptedFileName);
        fs_1.default.renameSync(filePath, encryptedFilePath);
        let rd = { fileName: encryptedFileName, filePath: encryptedFilePath };
        return rd;
    }
    /**
     *
     * @param {String} filePath
     * @param {String|undefined} decryptKey
     * @returns
     */
    decrypt(filePath, decryptKey) {
        let k = decryptKey || __classPrivateFieldGet(this, _SecureFile_key, "f");
        let key = crypto_1.default.createHash('sha256').update(k).digest();
        const encryptedData = fs_1.default.readFileSync(filePath);
        if (encryptedData.length < 17) {
            throw new Error('The encrypted file is too short or corrupted.');
        }
        const iv = encryptedData.subarray(0, 16);
        const encryptedContent = encryptedData.subarray(16);
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
        let decryptedData = Buffer.concat([
            decipher.update(encryptedContent),
            decipher.final(),
        ]);
        fs_1.default.writeFileSync(filePath, decryptedData);
        const encryptedFileName = path_1.default.basename(filePath);
        const originalFileName = __classPrivateFieldGet(this, _SecureFile_instances, "m", _SecureFile_decryptString).call(this, encryptedFileName, key, iv);
        const originalFilePath = path_1.default.join(path_1.default.dirname(filePath), originalFileName);
        fs_1.default.renameSync(filePath, originalFilePath);
        let rd = { fileName: originalFileName, filePath: originalFilePath };
        return rd;
    }
}
_SecureFile_key = new WeakMap(), _SecureFile_instances = new WeakSet(), _SecureFile_encryptString = function _SecureFile_encryptString(text, key, iv) {
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}, _SecureFile_decryptString = function _SecureFile_decryptString(encryptedText, key, iv) {
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.default = SecureFile;
