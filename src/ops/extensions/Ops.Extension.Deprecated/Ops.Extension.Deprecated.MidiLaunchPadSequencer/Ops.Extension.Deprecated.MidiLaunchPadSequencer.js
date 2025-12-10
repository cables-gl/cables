let eventIn = op.addInPort(new CABLES.Port(op, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));

let exec = this.addInPort(new CABLES.Port(this, "exec", CABLES.OP_PORT_TYPE_FUNCTION));

let beatPos = op.inValueInt("Beat Position");
let seqArr = op.inArray("Seq");

let seqOut = op.outArray("Seq Out");

// var width=img.length/8;
let outArr = [];
seqOut.set(outArr);
function setPixel(x, y, val)
{
    if (val == 1)val = 120;
    else if (val == 2)val = 127;
    else if (val == 4)val = 20;
    if (eventIn.get() && eventIn.get().output)
        eventIn.get().output.send([0x90, x + y * 16, val]);
}

let lastBeat = 0;

exec.onTriggered = function ()
{
    if (!eventIn.get()) return;
    // var start=Math.round(Math.min(width-8,offsetX.get()));
    // var end=Math.round(Math.min(width,offsetX.get()+8));

    let arr = seqArr.get();
    let buttons = 8;

    for (let x = 0; x < 4; x++)
    {
        for (let y = 0; y < 4; y++)
        {
            let index = x + (y * 4);
            if (index == lastBeat && lastBeat != beatPos.get())
            {
                setPixel(x, y, 0);
            }
            if (arr) if (!arr[x + y * 16])
            {
                setPixel(x, y, 0);
                outArr[x + y * 4] = 0;
            }

            if (arr) if (arr[x + y * 16])
            {
                setPixel(x, y, 1);
                outArr[x + y * 4] = arr[x + y * 16];
            }

            if (index == beatPos.get())
            {
                setPixel(x, y, 3);
            }
        }
    }

    if (arr)
    {
        for (let col = 0; col < 4; col++)
        {
            if (arr[col + 4 * 16])
            {
                let count = 0;
                for (var i = 0; i < 4; i++) if (outArr[col + i * 4])count++;

                if (count == 0)
                {
                    for (var i = 0; i < 4; i++)
                    {
                        arr[col + i * 16] = outArr[col + i * 4] = arr[col + 4 * 16];
                        setPixel(col, i, 1);
                    }
                }
                else
                {
                    for (var i = 0; i < 4; i++)
                    {
                        arr[col + i * 16] = outArr[col + i * 4] = 0;
                        setPixel(col, i, 0);
                    }
                }
                arr[col + 4 * 16] = 0;
            }
        }
    }
    // else
    // {
    //     for(var i=0;i<4;i++)
    //     {
    //         outArr[0+i*4]=arr[0+4*16];
    //         setPixel(0,i,0);
    //     }
    // }

    lastBeat = beatPos.get();

    // for(var x=start;x<end;x++)
    //     for(var y=0;y<8;y++)
    //         setPixel(x-start,y,img[ x+y*width ]);
};
