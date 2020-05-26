// import { MpdClient } from "../src/mpdClient";


// const client = new MpdClient();
// console.log(`constructed`);

// setTimeout(() => {
//   client.send('noidle');
//   client.send('stop');
//   client.send('idle');
// }, 3000);



// // import events = require('events');
// // const eventEmitter = events.EventEmitter;

// // import { EventEmitter } from 'events';

// // import express = require('express');

// import express from 'express';

// // var mpd = require('mpd');
// // var cmd = mpd.cmd;

// // var client = mpd.connect({
// //     port: 6600,
// //     host: 'localhost',
// // });
// // client.on('ready', () => console.log('ready.'));
// // client.on('system', (name: any) => console.log(`update: ${name}.`));
// // client.on('system-player', () => {
// //     client.sendCommand(cmd('status', []), (err: any, msg: any) => {
// //         if (err) throw err;
// //         console.log(msg);
// //     })
// // })

// // Create a new express app instance
// const app = express();// express();
// const PORT = 3000;

// let volume = 30;

// app.get('/', (req, res) => res.send(`Hello World!\n`));

// app.get('/volume', (req, res) => res.send(`${volume}\n`));

// app.put('/volume/:volume', (req, res) => {
//     let val = Math.abs(+req.params.volume);
//     let msg = '';
//     if (isNaN(val))
//         return res.send(`Put volume "${req.params.volume}" is invalid.\n`);

//     if (req.params.volume.includes('+')) {
//         msg += `Increasing volume by ${val}.\n`;
//         val = volume + val;
//     } else if (req.params.volume.includes('-')) {
//         msg += `Decreasing volume by ${val}.\n`;
//         val = volume - val;
//     }
//     msg += `Setting volume to ${val}.\n`;
//     volume = val;
//     res.send(msg);
// });

// app.post('/reboot', (req, res) => res.send(`System reboot.`));

// app.post('/shutdown', (req, res) => res.send(`System shutdown.\n`));

// app.listen(PORT, () => console.log(`App is listening on port ${PORT}.`));
