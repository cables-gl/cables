const
    exec=op.inTrigger("Render"),
    next=op.outTrigger("Next"),
    inType=op.inDropDown("File Type",['PNG','JPG','WebP','WebM'],'PNG'),
    inFilePrefix=op.inString("Filename","cables"),
    inQuality=op.inFloatSlider("Quality",0.8),
    inDurType=op.inSwitch("Duration Type",['Seconds','Frames'],"Seconds"),
    inDuration=op.inInt("Duration",1),
    inFps=op.inInt("FPS",30),
    inTransparency=op.inValueBool("Transparency",false),
    useCanvasSize=op.inValueBool("Use Canvas Size",true),
    inWidth=op.inValueInt("texture width",512),
    inHeight=op.inValueInt("texture height",512),
    inStart=op.inTriggerButton("Start"),
    outProgress=op.outNumber("Progress",0),
    outStatus=op.outString("Status","Waiting"),
    outStarted=op.outBool("Started");

op.setPortGroup("File",[inType,inFilePrefix,inQuality]);
op.setPortGroup("Size",[useCanvasSize,inWidth,inHeight]);
op.setPortGroup("Timing",[inFps,inDurType,inDuration]);


exec.onTriggered=render;

var started=false;
var countFrames=0;
var finished=true;
var fps=30;
var numFrames=31;

var cycle=false;
var shortId=CABLES.shortId();
var frameStarted=false;
var frames=[];
var lastFrame=-1;
var time=0;

var oldSizeW=op.patch.cgl.canvasWidth;
var oldSizeH=op.patch.cgl.canvasHeight;

inType.onChange=updateQuality;
useCanvasSize.onChange=updateSize;

updateQuality();
updateSize();

function updateQuality()
{
    inQuality.setUiAttribs({'greyout':inType.get()=="PNG"});
}

function updateSize()
{
    inWidth.setUiAttribs({'greyout':useCanvasSize.get()});
    inHeight.setUiAttribs({'greyout':useCanvasSize.get()});
}

inStart.onTriggered=function()
{
    frames.length=0;
    outStatus.set("Starting");
    fps=inFps.get();
    numFrames=inDuration.get()*fps;
    if(inDurType.get()=="Frames")numFrames=inDuration.get();
    shortId=CABLES.shortId();
    updateTime();

    if(!useCanvasSize.get())
    {
        oldSizeW=CABLES.patch.cgl.canvasWidth;
        oldSizeH=CABLES.patch.cgl.canvasHeight;
        op.patch.cgl.setSize(inWidth.get(),inHeight.get());
        op.patch.cgl.updateSize();
    }




    if(numFrames==1)
    {
        countFrames=0;
        started=true;
    }
    else
    {
        countFrames=-20;
        started=true;
        lastFrame=-9999;
    }
};


function updateTime()
{
    if(numFrames>1)
    {
        time=countFrames*1.0/fps;
        op.patch.timer.setTime(time);
        CABLES.overwriteTime=time-1/fps;
    }
}

function stopRendering()
{
    started=false;
    CABLES.overwriteTime=undefined;
}

function render()
{
    outStarted.set(started);

    if(!started)
    {
        next.trigger();
        return;
    }

    const oldInternalNow=CABLES.internalNow;

    if(numFrames>1)
    {
        CABLES.internalNow=function()
        {
            // console.log("YO");
            return time*1000;
        };

        CABLES.overwriteTime=time;
        op.patch.timer.setTime(time);
        op.patch.freeTimer.setTime(time);
    }

    if(lastFrame==countFrames)
    {
        next.trigger();
        return;
    }

    lastFrame=countFrames;
    next.trigger();

    CABLES.internalNow=oldInternalNow;

    var prog=countFrames/numFrames;
    if(prog<0.0)prog=0.0;
    outProgress.set(prog);

    frameStarted=false;
    if(countFrames>numFrames)
    {
        console.log("FINISHED>,...");
        console.log('ffmpeg -y -framerate 30 -f image2 -i '+inFilePrefix.get()+'_'+shortId+'_%d.png  -b 9999k -vcodec mpeg4 '+shortId+'.mp4');

        stopRendering();

        if(inType.get()=='WebM')
        {
            outStatus.set("Creating Video File from frames");
            console.log("webm frames",frames.length);

            const video = Whammy.fromImageArray( frames, fps );
            const url = window.URL.createObjectURL(video);
            const anchor = document.createElement('a');

            anchor.setAttribute('download', inFilePrefix.get()+'.webm');
            anchor.setAttribute('href', url);
            document.body.appendChild(anchor);
            anchor.click();
            frames.length=0;
        }

        outStatus.set("Finished");

        if(!useCanvasSize.get())
        {
            op.patch.cgl.setSize(oldSizeW,oldSizeH);
            op.patch.cgl.updateSize();
        }


        return;
    }

    var mimetype='image/png';
    var suffix="png";

    if(inType.get()=="JPG")
    {
        mimetype='image/jpeg';
        suffix="jpg";
    }
    else if(inType.get()=="WebP")
    {
        mimetype='image/webp';
        suffix="webp";
    }

    if(countFrames>0)
    {
        outStatus.set("Rendering Frame "+countFrames+" of "+numFrames);
        if(inType.get()=="WebM")
        {

            frames.push( op.patch.cgl.canvas.toDataURL('image/webp', inQuality.get()));
            countFrames++;
            updateTime();
        }
        else
        op.patch.cgl.screenShot((blob)=>
        {
            if (blob)
            {
                var anchor = document.createElement("a");
                anchor.download = inFilePrefix.get()+"_"+shortId+"_"+countFrames+"."+suffix;
                anchor.href = URL.createObjectURL(blob);

                setTimeout( () =>
                {
                    anchor.click();
                    countFrames++;
                    updateTime();
                },200);
            }
            else
            {
                Log.log("screenshot: no blob");
            }
        },inTransparency.get(),mimetype,inQuality.get());
    }
    else
    {
        outStatus.set("Prerendering...");
        console.log("pre ",countFrames,time);
        countFrames++;
        updateTime();
    }
}





