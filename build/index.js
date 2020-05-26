"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var ws_1 = __importDefault(require("ws"));
var mpdClient_1 = require("./mpdClient");
var client = new mpdClient_1.MpdClient();
// client.on('connect', data => console.info(`Client connected: "${data}"`));
// client.on('data', data => console.info(`Data received: "${data}"`));
client.on('volume', function () { return console.info("Volume change to " + client.volume + "."); });
var PORT = 3000;
var app = express_1.default();
var server = http_1.default.createServer(express_1.default);
var wss = new ws_1.default.Server({ server: server });
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log("ws received: \"" + message + "\".");
    });
    ws.send("Hi there, I'm a WebSocket server.");
});
app.get('/', function (req, res) { return res.send("Hello World!\n"); });
app.get('/volume', function (req, res) { return res.send(client.volume + "\n"); });
app.put('/volume/:volume', function (req, res) {
    var val = Math.abs(+req.params.volume);
    var msg = '';
    if (isNaN(val))
        return res.send("Put volume \"" + req.params.volume + "\" is invalid.\n");
    if (req.params.volume.includes('+')) {
        msg += "Increasing volume by " + val + ".\n";
        val = client.volume + val;
    }
    else if (req.params.volume.includes('-')) {
        msg += "Decreasing volume by " + val + ".\n";
        val = client.volume - val;
    }
    msg += "Setting volume to " + val + ".\n";
    client.volume = val;
    res.send(msg);
});
// app.listen(PORT, () => console.log(`app is listening`));
server.listen(PORT, function () { return console.log("server is listening."); });
