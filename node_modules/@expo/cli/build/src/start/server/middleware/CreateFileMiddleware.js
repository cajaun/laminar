/**
 * Copyright © 2022 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateFileMiddleware", {
    enumerable: true,
    get: function() {
        return CreateFileMiddleware;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _ExpoMiddleware = require("./ExpoMiddleware");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:middleware:createFile');
const ROUTER_INDEX_CONTENTS = `import { StyleSheet, Text, View } from "react-native";

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
`;
class CreateFileMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(options){
        super(options.projectRoot, [
            '/_expo/touch'
        ]), this.options = options;
    }
    resolveExtension(basePath, relativePath) {
        let resolvedPath = relativePath;
        const extension = _path().default.extname(relativePath);
        if (extension === '.js') {
            // Automatically convert JS files to TS files when added to a project
            // with TypeScript.
            const tsconfigPath = _path().default.join(this.projectRoot, 'tsconfig.json');
            if (_fs().default.existsSync(tsconfigPath)) {
                resolvedPath = resolvedPath.replace(/\.js$/, '.tsx');
            }
        }
        return _path().default.join(basePath, resolvedPath);
    }
    async parseRawBody(req) {
        const rawBody = await new Promise((resolve, reject)=>{
            let body = '';
            req.on('data', (chunk)=>{
                body += chunk.toString();
            });
            req.on('end', ()=>{
                resolve(body);
            });
            req.on('error', (err)=>{
                reject(err);
            });
        });
        const body = JSON.parse(rawBody);
        if (typeof body !== 'object' || body == null) {
            throw new Error('Expected object');
        } else if (typeof body.type !== 'string') {
            throw new Error('Expected "type" in body to be string');
        }
        switch(body.type){
            case 'router_index':
                return body;
            default:
                throw new Error('Unknown "type" passed in body');
        }
    }
    makeOutputForInput(input) {
        switch(input.type){
            case 'router_index':
                return {
                    absolutePath: this.resolveExtension(this.options.appDir, 'index.js'),
                    contents: ROUTER_INDEX_CONTENTS
                };
        }
    }
    async handleRequestAsync(req, res) {
        if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
        }
        let properties;
        try {
            properties = await this.parseRawBody(req);
        } catch (e) {
            debug('Error parsing request body', e);
            res.statusCode = 400;
            res.end('Bad Request');
            return;
        }
        debug(`Requested: %O`, properties);
        const file = this.makeOutputForInput(properties);
        if (_fs().default.existsSync(file.absolutePath)) {
            res.statusCode = 409;
            res.end('File already exists.');
            return;
        }
        debug(`Resolved path:`, file.absolutePath);
        try {
            await _fs().default.promises.mkdir(_path().default.dirname(file.absolutePath), {
                recursive: true
            });
            await _fs().default.promises.writeFile(file.absolutePath, file.contents, 'utf8');
        } catch (e) {
            debug('Error writing file', e);
            res.statusCode = 500;
            res.end('Error writing file.');
            return;
        }
        debug(`File created`);
        res.statusCode = 200;
        res.end('OK');
    }
}

//# sourceMappingURL=CreateFileMiddleware.js.map