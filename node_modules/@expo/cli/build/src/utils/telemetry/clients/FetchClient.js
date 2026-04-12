"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchClient", {
    enumerable: true,
    get: function() {
        return FetchClient;
    }
});
function _nodebuffer() {
    const data = require("node:buffer");
    _nodebuffer = function() {
        return data;
    };
    return data;
}
function _undici() {
    const data = require("undici");
    _undici = function() {
        return data;
    };
    return data;
}
const _fetch = require("../../fetch");
const _constants = require("../utils/constants");
class FetchClient {
    constructor({ fetch = createTelemetryFetch(), url = _constants.TELEMETRY_ENDPOINT, target = _constants.TELEMETRY_TARGET } = {}){
        /** This client should be used for long-running commands */ this.strategy = 'instant';
        /** All records that are queued and being sent */ this.entries = new Set();
        this.fetch = fetch;
        this.url = url;
        this.headers = {
            accept: 'application/json',
            'content-type': 'application/json',
            'user-agent': `expo-cli/${"54.0.23"}`,
            authorization: 'Basic ' + _nodebuffer().Buffer.from(`${target}:`).toString('base64')
        };
    }
    queue(records, controller, request) {
        const entry = mutePromise(request);
        entry.finally(()=>this.entries.delete(entry));
        entry.controller = controller;
        entry.records = records;
        this.entries.add(entry);
        return entry;
    }
    record(record) {
        const records = Array.isArray(record) ? record : [
            record
        ];
        if (!records.length) return;
        const controller = new AbortController();
        const body = JSON.stringify({
            sentAt: new Date(),
            batch: records
        });
        return this.queue(records, controller, this.fetch(this.url, {
            body,
            method: 'POST',
            signal: controller.signal,
            headers: this.headers
        }));
    }
    flush() {
        return mutePromise(Promise.all(this.entries));
    }
    abort() {
        const records = [];
        this.entries.forEach((entry)=>{
            try {
                entry.controller.abort();
                records.push(...entry.records);
            } catch  {
            // Ignore abort errors
            }
        });
        return records;
    }
}
function createTelemetryFetch() {
    const agent = new (_undici()).RetryAgent(new (_undici()).Agent(), {
        maxRetries: 3,
        retryAfter: true,
        minTimeout: 500,
        maxTimeout: 2000,
        timeoutFactor: 2
    });
    return (info, init = {})=>(0, _fetch.fetch)(extractUrl(info), {
            ...init,
            dispatcher: agent
        });
}
/** Extract the URL string from either `RequestInfo` or `URL` */ function extractUrl(info) {
    if (typeof info === 'string') return info;
    if ('url' in info) return info.url;
    return info.toString();
}
/** Mute a promise by removing the original return type and hide errors */ function mutePromise(promise) {
    return promise.then(()=>{}, ()=>{});
}

//# sourceMappingURL=FetchClient.js.map