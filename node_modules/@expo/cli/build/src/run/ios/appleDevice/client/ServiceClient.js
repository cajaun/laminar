/**
 * Copyright (c) 2021 Expo, Inc.
 * Copyright (c) 2018 Drifty Co.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ResponseError: function() {
        return ResponseError;
    },
    ServiceClient: function() {
        return ServiceClient;
    }
});
const _errors = require("../../../../utils/errors");
class ServiceClient {
    constructor(socket, protocolClient){
        this.socket = socket;
        this.protocolClient = protocolClient;
    }
}
class ResponseError extends _errors.CommandError {
    constructor(msg, response){
        super(msg), this.response = response;
    }
}

//# sourceMappingURL=ServiceClient.js.map