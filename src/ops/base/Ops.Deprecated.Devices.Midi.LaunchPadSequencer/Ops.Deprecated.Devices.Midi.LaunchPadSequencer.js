var eventIn=op.addInPort(new CABLES.Port(op,"Event Input",CABLES.OP_PORT_TYPE_OBJECT));

var exec=this.addInPort(new CABLES.Port(this,"exec",CABLES.OP_PORT_TYPE_FUNCTION));

var beatPos=op.inValueInt("Beat Position");
var seqArr=op.inArray("Seq");

var seqOut=op.outArray("Seq Out");

// var width=img.length/8;
var outArr=[];
seqOut.set(outArr);
function setPixel(x,y,val)
{
    if(val==1)val=120;
    else if(val==2)val=127;
    else if(val==4)val=20;
    if(eventIn.get() && eventIn.get().output)
        eventIn.get().output.send( [0x90, x+y*16, val] );
}

var lastBeat=0;

exec.onTriggered=function()
{
    if(!eventIn.get())return;
    // var start=Math.round(Math.min(width-8,offsetX.get()));
    // var end=Math.round(Math.min(width,offsetX.get()+8));

    var arr=seqArr.get();
    var buttons=8;

    for(var x=0;x<4;x++)
    {
        for(var y=0;y<4;y++)
        {
            var index=x+(y*4);
            if(index==lastBeat && lastBeat!=beatPos.get())
            {
                setPixel(x,y,0);
            }
            if(arr) if(!arr[x+y*16]) 
            {
                setPixel(x,y,0);
                outArr[x+y*4]=0;
            }
    
            if(arr) if(arr[x+y*16])
            {
                setPixel(x,y,1);
                outArr[x+y*4]=arr[x+y*16];
            }

            if(index==beatPos.get())
            {
                setPixel(x,y,3);
            }
    
        }
    }
    
    
    if(arr) 
    {
        for(var col=0;col<4;col++)
        {
            if(arr[col+4*16])
            {
                var count=0;
                for(var i=0;i<4;i++) if(outArr[col+i*4])count++;
                
                if(count==0)
                {
                    for(var i=0;i<4;i++)
                    {
                        arr[col+i*16]=outArr[col+i*4]=arr[col+4*16];
                        setPixel(col,i,1);
                    }
                }
                else
                {
                    for(var i=0;i<4;i++)
                    {
                        arr[col+i*16]=outArr[col+i*4]=0;
                        setPixel(col,i,0);
                    }
                }
                arr[col+4*16]=0;
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

    
    lastBeat=beatPos.get();



    // for(var x=start;x<end;x++)
    //     for(var y=0;y<8;y++)
    //         setPixel(x-start,y,img[ x+y*width ]);

};



