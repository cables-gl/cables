const
    exe=op.inTrigger("exe"),
    outNumPads=op.outValue("Num Gamepads"),
    pad0=op.outObject("Pad 0"),
    pad1=op.outObject("Pad 1"),
    pad2=op.outObject("Pad 2"),
    pad3=op.outObject("Pad 3");


exe.onTriggered=function()
{
    var gamePads=navigator.getGamepads();
    var count=0;

    for(var gp=0;gp< gamePads.length;gp++)
    {
        if(gamePads[gp])
        {
            count++;

            if(gp==0)
            {
                pad0.set(null);
                pad0.set(gamePads[gp]);
            }
            if(gp==1)
            {
                pad1.set(null);
                pad1.set(gamePads[gp]);
            }
            if(gp==2)
            {
                pad2.set(null);
                pad2.set(gamePads[gp]);
            }
            if(gp==3)
            {
                pad3.set(null);
                pad3.set(gamePads[gp]);
            }

        }
    }

    outNumPads.set(count);
};

exe.onTriggered();
