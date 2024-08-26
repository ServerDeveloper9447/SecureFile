# SecureFile
A minimalist file encryptor and decryptor.

## Getting Started
```js
// require the package
const { SecureFile } = require('securefile')
// or import it
import { SecureFile } from 'securefile'

// initialize
const secure = new SecureFile('<your key here>')

secure.encrypt('<filePath>') // returns {fileName: string, filePath: string}

secure.decrypt('<filePath>') // returns {fileName: string, filePath: string}
```