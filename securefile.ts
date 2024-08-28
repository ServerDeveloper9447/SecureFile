import crypto from 'node:crypto'
import fs from 'fs'
import path from 'path'

const ciphers = crypto.getCiphers();
const hashes = crypto.getHashes();
export class SecureFile {
    #key: Buffer;
    #algorithm: (typeof ciphers)[number];
    
    constructor(key:string, algorithm: (typeof ciphers)[number] = 'aes-256-cbc', keyHash: (typeof hashes)[number] = 'sha256') {
        this.#key = crypto.createHash(keyHash).update(key).digest()
        this.#algorithm = algorithm
    }

    #encryptString(text: string, key: Buffer, iv: Buffer) {
        const cipher = crypto.createCipheriv(this.#algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    encrypt(filePath: string, options: {
        rename?: boolean,
        overwrite?: boolean
    } = {rename: true, overwrite: true}) {
        let key = this.#key
        const iv = crypto.randomBytes(16);
        const fileData = fs.readFileSync(filePath);
        const cipher = crypto.createCipheriv(this.#algorithm, key, iv);
        let encryptedData = cipher.update(fileData);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        const originalFileName = path.basename(filePath);
        const encryptedFileName = this.#encryptString(originalFileName, key, iv);
        const encryptedFilePath = path.join(path.dirname(filePath), encryptedFileName);
        if (!options?.overwrite) {
            fs.writeFileSync(encryptedFilePath, Buffer.concat([iv, encryptedData]));
            let rd: {fileName: string, filePath: string} = {fileName: encryptedFileName, filePath: encryptedFilePath}

            return rd;
        }
        if (!options?.rename) {
            fs.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
            let rd: {fileName: string, filePath: string} = {fileName: originalFileName, filePath: filePath}

            return rd;
        }
        fs.writeFileSync(filePath, Buffer.concat([iv, encryptedData]));
        fs.renameSync(filePath, encryptedFilePath);
        let rd: {fileName: string, filePath: string} = {fileName: encryptedFileName, filePath: encryptedFilePath}
        return rd;
    }

    #decryptString(encryptedText: string, key: Buffer, iv: Buffer) {
        const decipher = crypto.createDecipheriv(this.#algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    decrypt(filePath: string, overwrite: boolean = true) {
        let key = this.#key
        const encryptedData = fs.readFileSync(filePath);
        if (encryptedData.length < 17) {
            throw new Error('The encrypted file is too short or corrupted.');
        }
        const iv = encryptedData.subarray(0, 16);
        const encryptedContent = encryptedData.subarray(16);
        const decipher = crypto.createDecipheriv(this.#algorithm, key, iv);
        let decryptedData = Buffer.concat([
            decipher.update(encryptedContent),
            decipher.final(),
        ]);
        const encryptedFileName = path.basename(filePath);
        const originalFileName = this.#decryptString(encryptedFileName, key, iv);
        const originalFilePath = path.join(path.dirname(filePath), originalFileName);
        if(!overwrite) {
            fs.writeFileSync(originalFilePath, decryptedData)
            let rd: {fileName: string, filePath: string} = {fileName: originalFileName, filePath: originalFilePath}

            return rd;
        }
        fs.writeFileSync(filePath, decryptedData);
        fs.renameSync(filePath, originalFilePath);
        let rd: {fileName: string, filePath: string} = {fileName: originalFileName, filePath: originalFilePath}

        return rd;
    }

    encryptMany(fileData: {filePath: string, overwrite?: boolean, rename?: boolean}[]) {
        return fileData.map(file => this.encrypt(file.filePath, {overwrite: file?.overwrite === true, rename: file?.rename === true}))
    }

    decryptMany(fileData: {filePath: string, overwrite?: boolean}[]) {
        return fileData.map(file => this.decrypt(file.filePath, file?.overwrite === true))
    }

    encryptFolder(folderPath: string) {
        const files = fs.readdirSync(folderPath, { withFileTypes: true });
        const paths = files.map(file => path.join(folderPath, file.name));

        for (const filePath of paths) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                this.encryptFolder(filePath);
            } else {
                this.encrypt(filePath);
            }
        }
    }

    decryptFolder(folderPath: string) {
        const files = fs.readdirSync(folderPath, { withFileTypes: true });
        const paths = files.map(file => path.join(folderPath, file.name));

        for (const filePath of paths) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                this.decryptFolder(filePath);
            } else {
                this.decrypt(filePath);
            }  
        }
    }
}