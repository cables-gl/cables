let inFrame = op.inInt("Frame");

inFrame.onChange = function ()
{
    op.patch.timer.setTime(inFrame.get() / 30.0);

    // if(CABLES.UI) gui.timeLine().updateTime();
};
