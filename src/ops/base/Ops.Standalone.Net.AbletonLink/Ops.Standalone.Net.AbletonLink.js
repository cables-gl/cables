const abletonlink = op.require('abletonlink');
const link = new abletonlink();

const
    outBpm=op.outNumber("BPM"),
    outPhase=op.outNumber("Phase"),
    outBeat=op.outNumber("Beat"),
    outPlaystate=op.outBoolNum("Play state"),
    outPeers=op.outNumber("Peers");

link.isPlayStateSync=true;
link.startUpdate(25, (beat, phase, bpm, playState) => {
    outBpm.set(bpm);
    outPhase.set(phase);
    outBeat.set(beat);
    console.log(playState,link)
    outPlaystate.set(playState);
    outPeers.set(link.numPeers);
});


op.onDelete=()=>
{
    link.stop();
}