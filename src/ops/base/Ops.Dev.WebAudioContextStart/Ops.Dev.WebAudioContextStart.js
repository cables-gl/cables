const
    exec = op.inTriggerButton("Start"),
    outState = op.outString("Audiocontext State");

let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
updateState();

exec.onTriggered = () =>
{
    if (audioCtx && audioCtx.state == "suspended")audioCtx.resume();
    updateState();
    setTimeout(updateState, 100);
};

function updateState()
{
    outState.set(audioCtx.state);
}
