Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='loadingStatus';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.finished=this.addOutPort(new Port(this,"finished",OP_PORT_TYPE_FUNCTION));
this.result=this.addOutPort(new Port(this,"status",OP_PORT_TYPE_VALUE));
this.preRenderStatus=this.addOutPort(new Port(this,"preRenderStatus",OP_PORT_TYPE_VALUE));
this.preRenderTimeFrames=this.addInPort(new Port(this,"preRenderTimes",OP_PORT_TYPE_VALUE));
this.preRenderStatus.val=0;
this.numAssets=this.addOutPort(new Port(this,"numAssets",OP_PORT_TYPE_VALUE));
this.loading=this.addOutPort(new Port(this,"loading",OP_PORT_TYPE_FUNCTION));

var finishedLoading=false;

var preRenderInc=0;
var preRenderDone=0;
var preRenderTime=0;
var preRenderTimes=[];
var firstTime=true;

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,-2);

var preRenderAnimFrame=function(time)
{
    // self.patch.timer.setTime(preRenderTime);
    self.finished.trigger();
    // cgl.gl.flush();

    cgl.renderStart(cgl,identTranslate);

    cgl.gl.clearColor(0,0,0,1);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    self.loading.trigger();
    // console.log('pre anim');
    
    cgl.renderEnd(cgl);
    preRenderDone=preRenderInc;
};

this.onAnimFrame=function(){};

var loadingIdPrerender='';

function checkPreRender()
{
    console.log(' checkprerender ',preRenderTimes.length,preRenderInc,preRenderDone);

    if(preRenderTimes.length>0)
    {
        if(preRenderInc==preRenderDone)
        {
            preRenderInc++;
            preRenderTime=preRenderTimes[preRenderInc];
        }
    }
    self.preRenderStatus.val=preRenderInc/preRenderTimes.length;

    if(preRenderTimes.length===0 || preRenderDone==preRenderTimes.length-1 )
    {
        // self.patch.timer.setTime(0);
        // self.patch.timer.pause();

        self.onAnimFrame=function(){};
        self.patch.loading.finished(loadingIdPrerender);
        // CGL.decrementLoadingAssets();
        finishedLoading=true;

    }
    else
        setTimeout(checkPreRender,30);

}

this.exe.onTriggered= function()
{
    self.result.val=self.patch.loading.getProgress();
    self.numAssets.val=CGL.numMaxLoadingAssets;

    if(!finishedLoading && this.onAnimFrame!=preRenderAnimFrame)
    {
        self.onAnimFrame=preRenderAnimFrame;
    }

    if(finishedLoading)
    {
        if(firstTime)
        {
            var loadingId=self.patch.loading.start('loadingstatus');
            // CGL.incrementLoadingAssets();
            console.log('firsttime');
            // console.log('finished loading complete...', CGL.getLoadingStatus());
            self.patch.timer.setTime(0);
            self.patch.timer.play();
            // CGL.decrementLoadingAssets();
            self.patch.loading.finished(loadingId);
                    
            firstTime=false;
        }

        self.finished.trigger();
    }
    else
    {
        self.loading.trigger();
        self.patch.timer.pause();

        if(self.result.val>=1.0 || CGL.numMaxLoadingAssets===0)
        {
            loadingIdPrerender=self.patch.loading.start('loadingstatus prerender');
            // CGL.incrementLoadingAssets();

            var i=0;
            for(i=0;i<self.patch.ops.length;i++)
            {
                if(self.patch.ops[i].onLoaded)self.patch.ops[i].onLoaded();
            }

            // cgl.canvasWidth=cgl.canvas.clientWidth;
            // cgl.canvasHeight=cgl.canvas.clientHeight;

// console.log('not finished loading...');
    
            // if(self.preRenderTimeFrames.isAnimated())
            // {
            //     for(i=0;i<self.preRenderTimeFrames.anim.keys.length;i++)
            //         preRenderTimes.push( self.preRenderTimeFrames.anim.keys[i].time );
            // }
            // preRenderTimes.push(1);
            
            console.log('pre rendering....');
            
            // preRenderAnimFrame(0);
            // preRenderAnimFrame(0);
            // preRenderAnimFrame(0);
            // preRenderAnimFrame(0);
            // preRenderAnimFrame(0);
            
            console.log('pre render ok???');
            // preRenderAnimFrame(1);

            checkPreRender();
        }
    }
};