"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "encodeMultipartMixed", {
    enumerable: true,
    get: function() {
        return encodeMultipartMixed;
    }
});
function _nodecrypto() {
    const data = require("node:crypto");
    _nodecrypto = function() {
        return data;
    };
    return data;
}
const CRLF = '\r\n';
const BOUNDARY_HYPHEN_CHARACTERS = '-'.repeat(2);
const getFormHeader = (boundary, field)=>{
    let header = `${BOUNDARY_HYPHEN_CHARACTERS}${boundary}${CRLF}`;
    header += `Content-Disposition: form-data; name="${field.name}"`;
    if (typeof field.value !== 'string') {
        header += `; filename="${field.value.name ?? 'blob'}"${CRLF}`;
        header += `Content-Type: ${field.value.type || 'application/octet-stream'}`;
    } else if (field.contentType) {
        header += `${CRLF}Content-Type: ${field.contentType}`;
    }
    if (field.partHeaders) {
        for(const headerName in field.partHeaders){
            header += `${CRLF}${headerName}: ${field.partHeaders[headerName]}`;
        }
    }
    return `${header}${CRLF}${CRLF}`;
};
const getFormFooter = (boundary)=>`${BOUNDARY_HYPHEN_CHARACTERS}${boundary}${BOUNDARY_HYPHEN_CHARACTERS}${CRLF}${CRLF}`;
async function encodeMultipartMixed(fields) {
    const boundary = `formdata-${(0, _nodecrypto().randomBytes)(8).toString('hex')}`;
    let body = '';
    for (const field of fields){
        if (typeof field.value !== 'string') {
            body += getFormHeader(boundary, field);
            body += await field.value.text();
            body += CRLF;
        } else {
            body += getFormHeader(boundary, field) + field.value + CRLF;
        }
    }
    body += getFormFooter(boundary);
    return {
        boundary,
        body
    };
}

//# sourceMappingURL=multipartMixed.js.map