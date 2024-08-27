type EventTypes = 'tempo' | 'numPeers' | 'playState';
type updateCallback = (beat: number, phase: number, bpm: number, playState: boolean, numPeers: number) => any;

declare class AbletonLinkBase {
  getLinkEnable(): boolean;
  setLinkEnable(enable: boolean): void;
  linkEnable: boolean;
  enable(): void;
  disable(): void;

  getIsPlayStateSync(): boolean;
  setIsPlayStateSync(playstateSync: boolean): void;
  isPlayStateSync: boolean;
  enablePlayStateSync(): void;
  disablePlayStateSync(): void;

  getBeat(): number;
  setBeat(beat: number): void;
  beat: number;
  setBeatForce(beat: number): void;

  getPhase(): number;
  readonly phase: number;

  getBpm(): number;
  setBpm(bpm: number): void;
  bpm: number;

  getIsPlaying(): boolean;
  setIsPlaying(playing: boolean): void;
  isPlaying: boolean;
  readonly isPlayingOnUpdate: boolean;
  play(): void
  stop(): void

  getNumPeers(): number
  readonly numPeers: number;

  setQuantum(quantum: number): void;
  getQuantum(): number;
  quantum: number;

  onTempoChanged(cb: Function): void
  onNumPeersChanged(cb: Function): void
  onPlayStateChanged(cb: Function): void

  on(key: 'tempo', cb: (tempo: number) => any): void
  on(key: 'numPeers', cb: (num_peers: number) => any): void
  on(key: 'playState', cb: (play_state: boolean) => any): void
  off(key: EventTypes): void
  
  update(): void

  // JavaScript
  startUpdate(interval_ms: number, cb?: updateCallback): void
  stopUpdate(): void
}

declare class AbletonLink extends AbletonLinkBase {
  constructor(bpm?: number, quantum?: number, enable?: boolean);
}

declare class AbletonLinkAudio extends AbletonLinkBase {
  constructor(bpm?: number, quantum?: number, enable?: boolean);
}

declare namespace AbletonLink {
    export const Audio: typeof AbletonLinkAudio;
}

export default AbletonLink;
