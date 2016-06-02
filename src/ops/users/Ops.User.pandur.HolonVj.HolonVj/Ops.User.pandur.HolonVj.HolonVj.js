op.name="HolonVj";

var eventIn=op.addInPort(new Port(op,"Event Input",OP_PORT_TYPE_OBJECT));

var beatArray=op.addInPort(new Port(op,"Beat Array",OP_PORT_TYPE_ARRAY));

var sceneIndex=op.addInPort(new Port(op,"Scene Note"));
var effectNote=op.addInPort(new Port(op,"Effect Note"));


var noteBeat1=op.addInPort(new Port(op,"Note Beat 1"));
var learnBeat1=op.addInPort(new Port(op,"Learn Beat 1",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat2=op.addInPort(new Port(op,"Note Beat 2"));
var learnBeat2=op.addInPort(new Port(op,"Learn Beat 2",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat3=op.addInPort(new Port(op,"Note Beat 3"));
var learnBeat3=op.addInPort(new Port(op,"Learn Beat 3",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat4=op.addInPort(new Port(op,"Note Beat 4"));
var learnBeat4=op.addInPort(new Port(op,"Learn Beat 4",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var eventOut=op.addOutPort(new Port(op,"Event Output",OP_PORT_TYPE_OBJECT));
var outScene=op.addOutPort(new Port(op,"Current Scene"));

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));


noteBeat1.set(1);
var learningBeat1=false;
var learningBeat2=false;
var learningBeat3=false;
var learningBeat4=false;
// var lastValue=-1;
learnBeat1.onTriggered=function(){learningBeat1=true;};
learnBeat2.onTriggered=function(){learningBeat2=true;};
learnBeat3.onTriggered=function(){learningBeat3=true;};
learnBeat4.onTriggered=function(){learningBeat4=true;};

var beatScenes=[0,0,0,0];

var useBeat1=false;
var useBeat2=false;
var useBeat3=false;
var useBeat4=false;
var out=null;



sceneIndex.onValueChanged=function()
{
    if(useBeat1) beatScenes[0]=sceneIndex.get();
    else if(useBeat2) beatScenes[1]=sceneIndex.get();
    else if(useBeat3) beatScenes[2]=sceneIndex.get();
    else if(useBeat4) beatScenes[3]=sceneIndex.get();
    else
    {
        beatScenes[0]=sceneIndex.get();
        beatScenes[1]=sceneIndex.get();
        beatScenes[2]=sceneIndex.get();
        beatScenes[3]=sceneIndex.get();
        console.log('set all to ',sceneIndex.get());
        
    }
};


function setPixel(x,y,val)
{
    if(x<0 || y<0)return;
    if(val==1)val=120;
    else if(val==2)val=127;
    else if(val==4)val=20;
    if(out) out.send( [0x90, x+y*16, val] );
}


var lastPixelX=-1;
var lastPixelY=-1;
beatArray.onValueChanged=function()
{
    var beats=beatArray.get();
    
    setPixel(lastPixelX,lastPixelY,0);
    
    if(beats)
    {
        for(var i=0;i<4;i++)
        {
            
            if(beats[i]==1)
            {
                setPixel(beatScenes[i],0,1);
                lastPixelX=beatScenes[i];
                lastPixelY=0;
                outScene.set(beatScenes[i]);
            }
        }
        
    }
};


eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    out=event.output;

    if(learningBeat1)
    {
        noteBeat1.set(event.note);
        learningBeat1=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat2)
    {
        noteBeat2.set(event.note);
        learningBeat2=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat3)
    {
        noteBeat3.set(event.note);
        learningBeat3=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat4)
    {
        noteBeat4.set(event.note);
        learningBeat4=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(noteBeat1.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat1=true;
        else useBeat1=false;
    }

    if(noteBeat2.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat2=true;
        else useBeat2=false;
    }

    if(noteBeat3.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat3=true;
        else useBeat3=false;
    }

    if(noteBeat4.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat4=true;
        else useBeat4=false;
    }




    eventOut.set(event);
};

