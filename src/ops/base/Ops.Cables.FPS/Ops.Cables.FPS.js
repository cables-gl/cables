const
    inDuration=op.inFloat("Duration",3),
    active=op.inBool("Active",true),
    outFPS=op.outValue("FPS"),
    outFPSAvg=op.outValue("Average FPS");

var startTime=Date.now();
var countFpsNums=0;
var countFps=0;

op.onDelete=function()
{
    op.patch.removeEventListener("performance",update);
};


function update(p)
{
    if(active.get())
    {
        outFPS.set(p.fps);
        countFps+=p.fps;
        countFpsNums++;

        if((Date.now()-startTime)/1000 > inDuration.get())
        {
            outFPSAvg.set(countFps/countFpsNums);
            countFps=0;
            countFpsNums=0;
            startTime=Date.now();
        }

    }
}

op.patch.addEventListener("performance",update);