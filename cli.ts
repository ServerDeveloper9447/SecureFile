import { SecureFile } from "./securefile";
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));
const key = args.key,
file = args._[0],
method = args.method
const secure = new SecureFile(key)
if(method == 'encrypt') {
    const d = secure.encrypt(file)
    console.log(`File encrypted and saved as ${d.fileName} to ${d.filePath}`)
} else if(method == 'decrypt') {
    const d = secure.decrypt(file)
    console.log(`File decrypted and saved as ${d.fileName} to ${d.filePath}`)
} else {
    console.log("Invalid method. Use 'encrypt' or 'decrypt'")
}
