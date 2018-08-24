var self=this;
var cgl=op.patch.cgl;
var patch=op.patch;

this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.finished=this.addOutPort(new Port(this,"finished",OP_PORT_TYPE_FUNCTION));
var result=this.addOutPort(new Port(this,"status",OP_PORT_TYPE_VALUE));
var isFinishedPort = op.outValue('all loaded', false);
var preRenderStatus=this.addOutPort(new Port(this,"preRenderStatus",OP_PORT_TYPE_VALUE));
var preRenderTimeFrames=this.addInPort(new Port(this,"preRenderTimes",OP_PORT_TYPE_VALUE));
var preRenderOps=op.inValueBool("PreRender Ops");
preRenderStatus.set(0);
this.numAssets=this.addOutPort(new Port(this,"numAssets",OP_PORT_TYPE_VALUE));
this.loading=this.addOutPort(new Port(this,"loading",OP_PORT_TYPE_FUNCTION));
var loadingFinished=op.outFunction("loading finished");//this.addOutPort(new Port(this,"loading finished",OP_PORT_TYPE_FUNCTION));

var finishedAll=false;

// var preRenderInc=0;
// var preRenderDone=0;
// var preRenderTime=0;
var preRenderTimes=[];
var firstTime=true;

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,0);
var identTranslateView=vec3.create();
vec3.set(identTranslateView, 0,0,-2);

var prerenderCount=0;
var preRenderAnimFrame=function(t)
{
    var time=preRenderTimes[prerenderCount];

    preRenderStatus.set(prerenderCount/(preRenderTimeFrames.anim.keys.length-1));

    self.patch.timer.setTime(time);
    // console.log('prerender',time,prerenderCount,preRenderTimeFrames.anim.keys.length);

    // cgl.renderStart(cgl,identTranslate);
    cgl.renderStart(cgl,identTranslate,identTranslateView);
    
    self.finished.trigger();

    cgl.gl.clearColor(0,0,0,1);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    self.loading.trigger();
    

    cgl.renderEnd(cgl);
    prerenderCount++;

    // preRenderDone=preRenderInc;
    // preRenderTimes.splice(0,1);
};

this.onAnimFrame=null;

var loadingIdPrerender='';


this.onLoaded=function()
{

    if(preRenderTimeFrames.isAnimated())
    if(preRenderTimeFrames.anim)
        for(i=0;i<preRenderTimeFrames.anim.keys.length;i++)
            preRenderTimes.push( preRenderTimeFrames.anim.keys[i].time );

    preRenderTimes.push(1);
    
    // console.log('prerender steps:',preRenderTimes);
};

function checkPreRender()
{
    
    if(patch.loading.getProgress()>=1.0)
    {
        
        
        // console.log(' checkprerender ',preRenderTimes.length);

        if(preRenderTimeFrames.anim && prerenderCount>=preRenderTimeFrames.anim.keys.length)
        {
            self.onAnimFrame=function(){};
            isFinishedPort.set(true);
            finishedAll=true;
        }
        else
        {
            setTimeout(checkPreRender,30);
        }
    }
    else
    {
        setTimeout(checkPreRender,100);
    }

}

var loadingId=patch.loading.start('delayloading','delayloading');
setTimeout(function()
{
    patch.loading.finished(loadingId);
},100);

this.exe.onTriggered= function()
{
    result.set(patch.loading.getProgress());
    self.numAssets.set(patch.loading.getNumAssets());

    if(patch.loading.getProgress()>=1.0 && finishedAll)
    {
        
        if(firstTime)
        {
            if(preRenderOps.get()) op.patch.preRenderOps();
            
            // console.log('finished loading and prerendering...');
            loadingFinished.trigger();
            self.patch.timer.setTime(0);
            self.patch.timer.play();
            isFinishedPort.set(true);

            firstTime=false;
        }

        self.finished.trigger();
    }
    else
    {
        if(!preRenderTimeFrames.anim)
        {
            finishedAll=true;
            self.onAnimFrame=function(){};

        }
        
        if(preRenderTimeFrames.anim && patch.loading.getProgress()>=1.0
            && prerenderCount<preRenderTimeFrames.anim.keys.length
        )
        {
            self.onAnimFrame=preRenderAnimFrame;
            checkPreRender();
            // preRenderAnimFrame();
            self.loading.trigger();

        }

        if(patch.loading.getProgress()<1.0)
        {
            self.loading.trigger();
            self.patch.timer.setTime(0);
            self.patch.timer.pause();
            
        }
    }

    // if(!finishedLoading && this.onAnimFrame!=preRenderAnimFrame)
    // {
    //     self.onAnimFrame=preRenderAnimFrame;
    // }

//     if(finishedLoading)
//     {
//         if(firstTime)
//         {
//             var loadingId=self.patch.loading.start('loadingstatus');
//             // CGL.incrementLoadingAssets();
//             console.log('firsttime');
//             // console.log('finished loading complete...', CGL.getLoadingStatus());
//             self.patch.timer.setTime(0);
//             self.patch.timer.play();
//             // CGL.decrementLoadingAssets();
//             self.patch.loading.finished(loadingId);
                    
//             firstTime=false;
//         }

//         self.finished.trigger();
//     }
//     else
//     {
//         self.loading.trigger();
//         self.patch.timer.pause();

//         if(self.result.val>=1.0 || CGL.numMaxLoadingAssets===0)
//         {
//             loadingIdPrerender=self.patch.loading.start('loadingstatus prerender');
//             // CGL.incrementLoadingAssets();

//             var i=0;
//             for(i=0;i<self.patch.ops.length;i++)
//             {
//                 if(self.patch.ops[i].onLoaded)self.patch.ops[i].onLoaded();
//             }

//             // cgl.canvasWidth=cgl.canvas.clientWidth;
//             // cgl.canvasHeight=cgl.canvas.clientHeight;

// // console.log('not finished loading...');
    
//             // if(self.preRenderTimeFrames.isAnimated())
//             // {
//             //     for(i=0;i<self.preRenderTimeFrames.anim.keys.length;i++)
//             //         preRenderTimes.push( self.preRenderTimeFrames.anim.keys[i].time );
//             // }
//             // preRenderTimes.push(1);
            
//             console.log('pre rendering....');
            
//             // preRenderAnimFrame(0);
//             // preRenderAnimFrame(0);
//             // preRenderAnimFrame(0);
//             // preRenderAnimFrame(0);
//             // preRenderAnimFrame(0);
            
//             console.log('pre render ok???');
//             // preRenderAnimFrame(1);

//             checkPreRender();
//         }
//     }
};