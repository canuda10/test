// porting https://github.com/andrewrk/mpd.js/blob/master/index.js

import { EventEmitter } from 'events';
import * as net from 'net';

type cmd_t = 'clearerror'
  | 'currentsong'
  | 'idle'
  | 'noidle'
  | 'status'
  | 'stats'
  | 'setvol'
  | 'next'
  | 'pause'
  | 'playid'
  | 'previous'
  | 'seekcur'
  | 'stop'
  ;

const defaultOptions: net.NetConnectOpts = {
  port: 6600,
}

const MPD_SENTINEL = /^(OK|ACK|list_OK)(.*)$/m;
const OK_MPD = /^OK MPD /;

export class MpdClient extends EventEmitter {
  private buffer = '';
  private socket: net.Socket ;// net.Socket;

  private _volume = 0;

  get volume(): number {
    return this._volume;
  }
  set volume(value: number) {
    this.send('noidle');
    this.send('setvol', value);
    this.send('setvol', value);
    this.send('idle');
  }

  constructor(options: net.NetConnectOpts = defaultOptions) {
    super();
    this.socket = net.connect(options, () => this.emit('connect'));
    this.socket.setEncoding(`utf8`);
    this.socket.on(`data`, data => this.onData(data));
    this.socket.on(`close`, hadError => this.onClose(hadError));
    this.socket.on(`error`, error => this.onError(error));
  }

  private onData(data: Buffer): void {
    this.emit('data', data);
    // console.log(`received: "${data}"\n`);
    let m;

    this.buffer += data;
    while (m = this.buffer.match(MPD_SENTINEL)) {
      // Data returned before an OK response.
      const msg = this.buffer.substring(0, m.index);
      // Response end line, code and data.
      const [line, code, str] = m;

      if (OK_MPD.test(line)) {
        // connection successful.
        // console.log(`connection successful.\n`);
        this.send('status');
        this.send('idle');
      } else if (code == 'ACK') {
        // command failure received.
        // console.log(`ack:\n ${str}`);
        this.send('idle');
      } else {
        // Whatever
        this.processMsg(msg);
        if (msg.indexOf('changed:') == 0) {
          this.send('status');
          this.send('idle');
        }
      }

      this.buffer = this.buffer.substring(msg.length + line.length + 1);
    }
  }

  private onClose(hadError: boolean): void {
    this.emit('close', hadError);
  }

  private onError(error: Error): void {
    this.emit('error', error);
  }

  private processMsg(msg: string): void {
    const things = msg.split('\n');
    things.forEach(thing => {
      const parts = thing.split(':');
      const key = parts[0];
      // const idx = thing.indexOf(':');
      // const key = thing.substring(0, idx);

      switch (key) {
        case 'volume':
          let vol = +parts[1];
          if (isNaN(vol)) {
            console.error(`invalid volume received: "${thing}".`);
            break;
          }

          if (vol != this._volume) {
            this._volume = vol;
            this.emit('volume');
          }
          break;
      }
    });
  }

  send(cmd: 'clearerror'): void;
  send(cmd: 'currentsong'): void;
  send(cmd: 'idle', params?: unknown): void;
  send(cmd: 'noidle'): void;
  send(cmd: 'status'): void;
  send(cmd: 'stats'): void;

  send(cmd: 'setvol', params: number): void;
  send(cmd: 'next'): void;
  send(cmd: 'pause', params: number): void;
  send(cmd: 'playid', params: number): void;
  send(cmd: 'previous'): void;
  send(cmd: 'seekcur', params: number): void;
  send(cmd: 'stop'): void;

  send(cmd: cmd_t, params?: unknown): void {
    // console.log(`sending "${cmd}"`);
    const cmdParams = params == undefined ? '' : ` ${params}`;
    this.socket.write(`${cmd}${cmdParams}\n`);
  }
}
