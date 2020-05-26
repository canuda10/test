import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { MpdClient } from './mpdClient';

const client = new MpdClient();
// client.on('connect', data => console.info(`Client connected: "${data}"`));
// client.on('data', data => console.info(`Data received: "${data}"`));
// client.on('volume', () => console.info(`Volume change to ${client.volume}.`));


const PORT = 3000;

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  client.on('volume', () => ws.send({ volume: client.volume }));

  ws.on('message', message => {
    console.log(`ws received: "${message}".`);
  });

  ws.send(`Hi there, I'm a WebSocket server.`);
});

app.get('/', (req, res) => res.send(`Hello World!\n`));

app.get('/volume', (req, res) => res.send(`${client.volume}\n`));
app.put('/volume/:volume', (req, res) => {
  let val = Math.abs(+req.params.volume);
  let msg = '';
    if (isNaN(val))
        return res.send(`Put volume "${req.params.volume}" is invalid.\n`);

    if (req.params.volume.includes('+')) {
        msg += `Increasing volume by ${val}.\n`;
        val = client.volume + val;
    } else if (req.params.volume.includes('-')) {
        msg += `Decreasing volume by ${val}.\n`;
        val = client.volume - val;
    }
    msg += `Setting volume to ${val}.\n`;
    client.volume = val;
  res.send(msg);
});

// app.listen(PORT, () => console.log(`app is listening`));
server.listen(PORT, () => console.log(`server is listening.`));
