let trigger = op.inTrigger("trigger");

let inBpm = op.inValue("BPM", 120);
let inOffset = op.inValue("Offset", 0);

let next = op.outTrigger("trigger");
let outBeat = op.outValue("beat num");
let outPerc = op.outValue("percent");

let beatDuration = 0;

inBpm.onChange = updateBpm;
updateBpm();

function updateBpm()
{
    beatDuration = 60 / inBpm.get();
}

trigger.onTriggered = function ()
{
    let time = op.patch.timer.getTime() + inOffset.get();
    let beat = Math.round(time / beatDuration);

    outPerc.set(-1 * (time - ((beat + 1) * beatDuration)) / beatDuration);

    outBeat.set(beat);
};
