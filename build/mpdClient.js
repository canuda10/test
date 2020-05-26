"use strict";
// porting https://github.com/andrewrk/mpd.js/blob/master/index.js
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpdClient = void 0;
var events_1 = require("events");
var net = __importStar(require("net"));
var defaultOptions = {
    port: 6600,
};
var MPD_SENTINEL = /^(OK|ACK|list_OK)(.*)$/m;
var OK_MPD = /^OK MPD /;
var MpdClient = /** @class */ (function (_super) {
    __extends(MpdClient, _super);
    function MpdClient(options) {
        if (options === void 0) { options = defaultOptions; }
        var _this = _super.call(this) || this;
        _this.buffer = '';
        _this._volume = 0;
        _this.socket = net.connect(options, function () { return _this.emit('connect'); });
        _this.socket.setEncoding("utf8");
        _this.socket.on("data", function (data) { return _this.onData(data); });
        _this.socket.on("close", function (hadError) { return _this.onClose(hadError); });
        _this.socket.on("error", function (error) { return _this.onError(error); });
        return _this;
    }
    Object.defineProperty(MpdClient.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (value) {
            this.send('noidle');
            this.send('setvol', value);
            this.send('setvol', value);
            this.send('idle');
        },
        enumerable: false,
        configurable: true
    });
    MpdClient.prototype.onData = function (data) {
        this.emit('data', data);
        // console.log(`received: "${data}"\n`);
        var m;
        this.buffer += data;
        while (m = this.buffer.match(MPD_SENTINEL)) {
            // Data returned before an OK response.
            var msg = this.buffer.substring(0, m.index);
            // Response end line, code and data.
            var line = m[0], code = m[1], str = m[2];
            if (OK_MPD.test(line)) {
                // connection successful.
                // console.log(`connection successful.\n`);
                this.send('status');
                this.send('idle');
            }
            else if (code == 'ACK') {
                // command failure received.
                // console.log(`ack:\n ${str}`);
                this.send('idle');
            }
            else {
                // Whatever
                this.processMsg(msg);
                if (msg.indexOf('changed:') == 0) {
                    this.send('status');
                    this.send('idle');
                }
            }
            this.buffer = this.buffer.substring(msg.length + line.length + 1);
        }
    };
    MpdClient.prototype.onClose = function (hadError) {
        this.emit('close', hadError);
    };
    MpdClient.prototype.onError = function (error) {
        this.emit('error', error);
    };
    MpdClient.prototype.processMsg = function (msg) {
        var _this = this;
        var things = msg.split('\n');
        things.forEach(function (thing) {
            var parts = thing.split(':');
            var key = parts[0];
            // const idx = thing.indexOf(':');
            // const key = thing.substring(0, idx);
            switch (key) {
                case 'volume':
                    var vol = +parts[1];
                    if (isNaN(vol)) {
                        console.error("invalid volume received: \"" + thing + "\".");
                        break;
                    }
                    if (vol != _this._volume) {
                        _this._volume = vol;
                        _this.emit('volume');
                    }
                    break;
            }
        });
    };
    MpdClient.prototype.send = function (cmd, params) {
        // console.log(`sending "${cmd}"`);
        var cmdParams = params == undefined ? '' : " " + params;
        this.socket.write("" + cmd + cmdParams + "\n");
    };
    return MpdClient;
}(events_1.EventEmitter));
exports.MpdClient = MpdClient;
