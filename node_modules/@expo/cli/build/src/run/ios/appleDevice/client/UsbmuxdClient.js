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
Object.defineProperty(exports, "UsbmuxdClient", {
    enumerable: true,
    get: function() {
        return UsbmuxdClient;
    }
});
function _plist() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/plist"));
    _plist = function() {
        return data;
    };
    return data;
}
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
        return data;
    };
    return data;
}
function _net() {
    const data = require("net");
    _net = function() {
        return data;
    };
    return data;
}
const _ServiceClient = require("./ServiceClient");
const _errors = require("../../../../utils/errors");
const _plist1 = require("../../../../utils/plist");
const _UsbmuxProtocol = require("../protocol/UsbmuxProtocol");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = (0, _debug().default)('expo:apple-device:client:usbmuxd');
function isUsbmuxdConnectResponse(resp) {
    return resp.MessageType === 'Result' && resp.Number !== undefined;
}
function isUsbmuxdDeviceResponse(resp) {
    return resp.DeviceList !== undefined;
}
function isUsbmuxdPairRecordResponse(resp) {
    return resp.PairRecordData !== undefined;
}
class UsbmuxdClient extends _ServiceClient.ServiceClient {
    constructor(socket){
        super(socket, new _UsbmuxProtocol.UsbmuxProtocolClient(socket)), this.socket = socket;
    }
    static connectUsbmuxdSocket() {
        debug('connectUsbmuxdSocket');
        if (process.platform === 'win32') {
            return (0, _net().connect)({
                port: 27015,
                host: 'localhost'
            });
        } else {
            return (0, _net().connect)({
                path: '/var/run/usbmuxd'
            });
        }
    }
    async connect(device, port) {
        debug(`connect: ${device.DeviceID} on port ${port}`);
        debug(`connect:device: %O`, device);
        const response = await this.protocolClient.sendMessage({
            messageType: 'Connect',
            extraFields: {
                DeviceID: device.DeviceID,
                PortNumber: htons(port)
            }
        });
        debug(`connect:device:response: %O`, response);
        if (isUsbmuxdConnectResponse(response) && response.Number === 0) {
            return this.protocolClient.socket;
        } else {
            throw new _ServiceClient.ResponseError(`There was an error connecting to the USB connected device (id: ${device.DeviceID}, port: ${port})`, response);
        }
    }
    async getDevices() {
        debug('getDevices');
        const resp = await this.protocolClient.sendMessage({
            messageType: 'ListDevices'
        });
        if (isUsbmuxdDeviceResponse(resp)) {
            return resp.DeviceList;
        } else {
            throw new _ServiceClient.ResponseError('Invalid response from getDevices', resp);
        }
    }
    async getDevice(udid) {
        debug(`getDevice ${udid ? 'udid: ' + udid : ''}`);
        const devices = await this.getDevices();
        if (!devices.length) {
            throw new _errors.CommandError('APPLE_DEVICE_USBMUXD', 'No devices found');
        }
        if (!udid) {
            return devices[0];
        }
        for (const device of devices){
            if (device.Properties && device.Properties.SerialNumber === udid) {
                return device;
            }
        }
        throw new _errors.CommandError('APPLE_DEVICE_USBMUXD', `No device found (udid: ${udid})`);
    }
    async readPairRecord(udid) {
        debug(`readPairRecord: ${udid}`);
        const resp = await this.protocolClient.sendMessage({
            messageType: 'ReadPairRecord',
            extraFields: {
                PairRecordID: udid
            }
        });
        if (isUsbmuxdPairRecordResponse(resp)) {
            // the pair record can be created as a binary plist
            const BPLIST_MAGIC = Buffer.from('bplist00');
            if (BPLIST_MAGIC.compare(resp.PairRecordData, 0, 8) === 0) {
                debug('Binary plist pair record detected.');
                const pairRecords = (0, _plist1.parsePlistBuffer)(resp.PairRecordData);
                return Array.isArray(pairRecords) ? pairRecords[0] : pairRecords;
            } else {
                // TODO: use parsePlistBuffer
                return _plist().default.parse(resp.PairRecordData.toString()); // TODO: type guard
            }
        } else {
            throw new _ServiceClient.ResponseError(`There was an error reading pair record for device (udid: ${udid})`, resp);
        }
    }
}
function htons(n) {
    return (n & 0xff) << 8 | n >> 8 & 0xff;
}

//# sourceMappingURL=UsbmuxdClient.js.map