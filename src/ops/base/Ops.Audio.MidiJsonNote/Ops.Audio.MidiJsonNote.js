const inData=op.inObject("Data");
const inNote=op.inValueString("Note");
const inChannel=op.inValueString("Channel",-1);
const inStartBeat=op.inValueInt("Beat Start",0);
const inEndBeat=op.inValueInt("Beat End",0);

const outCount=op.outValue("Count");
const outProgress=op.outValue("Progress");
const outTimeSince=op.outValue("Time since last");
const outTrigger=op.outTrigger("Trigger");
const outReset=op.outTrigger("Reseted");

var lastBeat=0;
var counter=0;
var oldNames=null;
var oldProgress=null;
var lastHit=0;

var notfound=true;

inData.onChange=function()
{
    var data=inData.get();
    if(!data)return;    
    var beat=data.beat;

    if(inStartBeat.get()!=inEndBeat.get())
    {
        if( beat<inStartBeat.get())return;
        if( beat>inEndBeat.get())return;
    }

    var names=data.names;
    var progress=data.progress;
    if(!names)return;
    if(!progress)return;

    if(beat<lastBeat)
    {
        counter=0;
        lastHit=0;
        notfound=true;
        outTimeSince.set(0);
        outReset.trigger();
    }
    lastBeat=beat;
    
    var note=inNote.get();
    
    if(!oldNames)
    {
        oldNames=[];
        oldProgress=[];
        oldNames.length=names.length;
        oldProgress.length=names.length;
    }
    
    var startChn=0;
    var endChn=names.length;
    
    if(inChannel.get()>=0)
    {
        startChn=inChannel.get();
        endChn=startChn+1;
    }
    
    var prog=0;
    var progCount=0;
    
 

    for(var i=startChn;i<endChn;i++)
    {
        if(names[i]==note)
        {
            
            // if(startChn==8)
            // {
            //     if(( oldNames[i]==note && progress[i]<oldProgress[i]) )
            //     {
            //         console.log("progressbuyg?")
            //     }
            // }
            
            if( ( oldNames[i]!=note ) || notfound ) //( oldNames[i]==note && progress[i]<oldProgress[i])
            {
                counter++;
                lastHit=CABLES.now();
                outTrigger.trigger();
            }
            
            progCount++;
            prog+=progress[i];
            notfound=false;
        }

        oldNames[i]=names[i];
        oldProgress[i]=progress[i];
    }
    
    if(progCount==0)notfound=true;
        else outProgress.set((prog/progCount)||0);
    
    // if(startChn==8)console.log(prog);

    if(lastHit!==0) outTimeSince.set( (CABLES.now()-lastHit)/1000 );

    outCount.set(counter);
    
};