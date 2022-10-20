const plauPause = op.outBoolNum("Play/Stop");
const time = op.outNumber("time");

op.patch.timer.onPlayPause(seek);
op.patch.timer.onTimeChange(seek);

function seek()
{
    plauPause.set(false);

    setTimeout(function ()
    {
        time.set(op.patch.timer.getTime());
        plauPause.set(op.patch.timer.isPlaying());
    }, 10);
}
