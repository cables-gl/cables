
var play=op.inBool("Play",false);


play.onChange=function()
{
    if(play.get()) op.patch.timer.play();
    else op.patch.timer.pause();
}
