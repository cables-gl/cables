const abletonlink = require('../index.js');

// const link = new abletonlink(bpm = 120.0, quantum = 4.0, enable = true);
const link = new abletonlink(160.0, 3.0, false);

link.on('tempo', (tempo) => console.log("tempo", tempo));
link.on('numPeers', (numPeers) => console.log("numPeers", numPeers));
link.startUpdate(16, (beat, phase, bpm, playstate, numPeers) => console.log("updated", beat, phase, bpm, playstate, numPeers));
// or link.startUpdate(60);

link.enable();
link.play();
setInterval(() => {
    link.bpm = link.bpm + 1;
}, 3000);