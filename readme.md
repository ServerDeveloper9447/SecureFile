# SecureFile
A minimalist file encryptor and decryptor.

## Getting Started
```js
// require the package
const { SecureFile } = require('securefile')
// or import it
import { SecureFile } from 'securefile'

// initialize
const secure = new SecureFile('<your secret key here>')

secure.encrypt('<filePath>', encryptionOptions) // returns {fileName: string, filePath: string}

secure.decrypt('<filePath>', overwrite?: boolean) // returns {fileName: string, filePath: string}
```

### Encryption Options
| Options | Type | Default Value | Description |
|---------|------|---------------|-------------|
| `overwrite?` | `boolean` | `true` | Instead of creating a separate file, it overwrites the existing file. |
| `rename?` | `boolean` | `true` | Renames the original file to a cryptic name. Ignored when `overwrite` is set to `false` |

### Bulk Encryption and Decryption
```js
secure.encryptMany([{filePath: string, overwrite?: boolean, rename?: boolean},...])
// or
secure.encryptFolder('<folder_path'>) // encrypts each file inside a folder

secure.decryptMany([{filePath: string, overwrite: boolean}],...)
// or
secure.decryptFolder('<folder_path>') // decrypts each file inside a folder
```