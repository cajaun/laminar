"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithBaseUrl", {
    enumerable: true,
    get: function() {
        return wrapFetchWithBaseUrl;
    }
});
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
function wrapFetchWithBaseUrl(fetch, baseUrl) {
    // NOTE(EvanBacon): DO NOT RETURN AN ASYNC WRAPPER. THIS BREAKS LOADING INDICATORS.
    return (url, init)=>{
        if (typeof url !== 'string') {
            throw new TypeError('Custom fetch function only accepts a string URL as the first parameter');
        }
        const parsed = new (_url()).URL(url, baseUrl);
        if (init == null ? void 0 : init.searchParams) {
            parsed.search = init.searchParams.toString();
        }
        return fetch(parsed.toString(), init);
    };
}

//# sourceMappingURL=wrapFetchWithBaseUrl.js.map