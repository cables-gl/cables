var data=op.inObject("GamePad Data");
var outID=op.outValue("ID");
var digitalAnalog=op.inValueBool("Analog to Digital",true);
var outAxes=op.outArray("Axes");

var pressedLeft=op.outValueBool("Pad Left");
var pressedRight=op.outValueBool("Pad Right");
var pressedUp=op.outValueBool("Pad Up");
var pressedDown=op.outValueBool("Pad Down");

var pressedButton1=op.outValueBool("Button 1");
var pressedButton2=op.outValueBool("Button 2");
var pressedButton3=op.outValueBool("Button 3");
var pressedButton4=op.outValueBool("Button 4");

var outLeftShoulder=op.outValue("Left Shoulder");
var outLeftShoulderBottom=op.outValue("Left Shoulder Bottom");

var outRightShoulder=op.outValue("Right Shoulder");
var outRightShoulderBottom=op.outValue("Right Shoulder Bottom");

data.onChange=function()
{
    if(data.get())
    {
        outID.set(data.get().id);
        if(data.get().axes)outAxes.set(data.get().axes);

        var buttons=data.get().buttons;
        if(buttons)
        {
            pressedButton1.set(buttons[0].pressed);
            pressedButton2.set(buttons[1].pressed);
            pressedButton3.set(buttons[2].pressed);
            pressedButton4.set(buttons[3].pressed);
        }

        if(digitalAnalog.get())
        {
            var axes=data.get().axes;
            if(axes)
            {
                if(axes[0]<-0.5)pressedLeft.set(true);
                    else pressedLeft.set(false||buttons[14].pressed);
                if(axes[0]>0.5)pressedRight.set(true);
                    else pressedRight.set(false||buttons[15].pressed);

                if(axes[1]<-0.5)pressedUp.set(true);
                    else pressedUp.set(false||buttons[12].pressed);
                if(axes[1]>0.5)pressedDown.set(true);
                    else pressedDown.set(false||buttons[13].pressed);
            }
        }
        else
        {
            pressedLeft.set(buttons[14].pressed);
            pressedRight.set(buttons[15].pressed);
            pressedDown.set(buttons[13].pressed);
            pressedUp.set(buttons[12].pressed);
        }

        outLeftShoulder.set(buttons[4].value);
        outLeftShoulderBottom.set(buttons[6].value);

        outRightShoulder.set(buttons[5].value);
        outRightShoulderBottom.set(buttons[7].value);
    }

};

// gamepad.BUTTONS = {
//   FACE_1: 0, // Face (main) buttons
//   FACE_2: 1,
//   FACE_3: 2,
//   FACE_4: 3,
//   LEFT_SHOULDER: 4, // Top shoulder buttons
//   RIGHT_SHOULDER: 5,
//   LEFT_SHOULDER_BOTTOM: 6, // Bottom shoulder buttons
//   RIGHT_SHOULDER_BOTTOM: 7,
//   SELECT: 8,
//   START: 9,
//   LEFT_ANALOGUE_STICK: 10, // Analogue sticks (if depressible)
//   RIGHT_ANALOGUE_STICK: 11,
//   PAD_TOP: 12, // Directional (discrete) pad
//   PAD_BOTTOM: 13,
//   PAD_LEFT: 14,
//   PAD_RIGHT: 15
// };

// gamepad.AXES = {
//   LEFT_ANALOGUE_HOR: 0,
//   LEFT_ANALOGUE_VERT: 1,
//   RIGHT_ANALOGUE_HOR: 2,
//   RIGHT_ANALOGUE_VERT: 3
// };
