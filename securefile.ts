import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export default class SecureFile {
    #key: string;
    /**
     * 
     * @param {String} key Key to encrypt
     */
    constructor(key:string) {
        this.#key = key
    }

    #encryptString(text: string, key: Buffer, iv: Buffer) {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * 
     * @param {String} filePath 
     * @param {String|undefined} encryptKey 
     * @returns 
     */
    encrypt(filePath: string, encryptKey: string | undefined) {
        let k = encryptKey || this.#key
        let key = crypto.createHash('sha256').update(k).digest()
        const iv = crypto.randomBytes(16);
    const fileData = fs.readFileSync(filePath);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(fileData);
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);
    fs.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
    const originalFileName = path.basename(filePath);
    const encryptedFileName = this.#encryptString(originalFileName, key, iv);
    const encryptedFilePath = path.join(path.dirname(filePath), encryptedFileName);
    fs.renameSync(filePath, encryptedFilePath);
    let rd: {fileName: string, filePath: string} = {fileName: encryptedFileName, filePath: encryptedFilePath}

    return rd;
    }

    #decryptString(encryptedText: string, key: Buffer, iv: Buffer) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * 
     * @param {String} filePath 
     * @param {String|undefined} decryptKey 
     * @returns 
     */
    decrypt(filePath: string, decryptKey: string | undefined) {
        let k = decryptKey || this.#key
        let key = crypto.createHash('sha256').update(k).digest()
        const encryptedData = fs.readFileSync(filePath);
        if (encryptedData.length < 17) {
            throw new Error('The encrypted file is too short or corrupted.');
        }
        const iv = encryptedData.subarray(0, 16);
        const encryptedContent = encryptedData.subarray(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decryptedData = Buffer.concat([
            decipher.update(encryptedContent),
            decipher.final(),
        ]);
        fs.writeFileSync(filePath, decryptedData);
        const encryptedFileName = path.basename(filePath);
        const originalFileName = this.#decryptString(encryptedFileName, key, iv);
        const originalFilePath = path.join(path.dirname(filePath), originalFileName);
        fs.renameSync(filePath, originalFilePath);
        let rd: {fileName: string, filePath: string} = {fileName: originalFileName, filePath: originalFilePath}

        return rd;
    }
}