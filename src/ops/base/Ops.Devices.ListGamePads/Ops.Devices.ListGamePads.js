op.name='GamePads';
var exe=op.inFunction("exe");
var outNumPads=op.outValue("Num Gamepads");
// var outPads=op.outArray("Pads");

var pad0=op.outObject("Pad 0");
var pad1=op.outObject("Pad 1");
var pad2=op.outObject("Pad 2");


// outPads.set([]);

exe.onTriggered=function()
{
    var gamePads=navigator.getGamepads();
    var count=0;

    for(var gp=0;gp< gamePads.length;gp++)
    {
        if(gamePads[gp])
        {
            count++;
            // outPads.set(gamePads);
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
            // if(gamePads[gp].axes)
            // {
            //     self.axis1.val=gamePads[gp].axes[0];
            //     self.axis2.val=gamePads[gp].axes[1];
            //     self.axis3.val=gamePads[gp].axes[2];
            //     self.axis4.val=gamePads[gp].axes[3];

            //     self.button0.val=gamePads[gp].buttons[0].pressed;
            //     self.button0.val=gamePads[gp].buttons[1].pressed;
            //     self.button2.val=gamePads[gp].buttons[2].pressed;
            //     if(gamePads[gp].buttons[3]) self.button3.val=gamePads[gp].buttons[3].pressed;
            //     if(gamePads[gp].buttons[4]) self.button4.val=gamePads[gp].buttons[4].pressed;

            // }
            // count++;
            
        }
    }

    outNumPads.set(count);
};

exe.onTriggered();
