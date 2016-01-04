CABLES.Op.apply(this, arguments);
var self=this;

this.name='TimedSequence';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.current=this.addInPort(new Port(this,"current",OP_PORT_TYPE_VALUE));
this.current.val=0;

this.overwriteTime=this.addInPort(new Port(this,"overwriteTime",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.overwriteTime.val=false;
this.ignoreInSubPatch=this.addInPort(new Port(this,"ignoreInSubPatch",OP_PORT_TYPE_VALUE,{display:"bool"}));
this.ignoreInSubPatch.val=false;

this.triggerAlways=this.addOutPort(new Port(this,"triggerAlways",OP_PORT_TYPE_FUNCTION));
this.currentKeyTime=this.addOutPort(new Port(this,"currentKeyTime",OP_PORT_TYPE_VALUE));

var triggers=[];

for(var i=0;i<30;i++)
{
    triggers.push( this.addOutPort(new Port(this,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
}

this.onLoaded=function()
{

    var i=0;
    // console.log('TimedSequence loading---------------------------------------------');
    // for(i=0;i<triggers.length;i++)
    // {
    //     cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    //     triggers[i].trigger();
    // }

    // if(self.current.anim)
    // {
    //     for(i=0;i<self.current.anim.keys.length;i++)
    //     {
    //         preRenderTimes.push(self.current.anim.keys[i].time);
    //         // var ii=i;
    //         // cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    //         // var time=self.current.anim.keys[ii].time+0.001;
    //         // self.exe.onTriggered(time);
    //         // console.log('timed pre init...');
    //         // cgl.gl.flush();
    //     }
    // }

    // self.triggerAlways.trigger();
    // console.log('TimedSequence loaded---------------------------------------------');

};

var lastUiValue=-1;
this.exe.onTriggered=function(_time)
{
    var spl=0;
    if(window.gui)
    {

        if(self.current.val!=lastUiValue)
        {
            lastUiValue=parseInt(self.current.val,10);
            for(spl=0;spl<triggers.length;spl++)
            {
                if(spl==lastUiValue) triggers[spl].setUiActiveState(true);
                    else triggers[spl].setUiActiveState(false);
            }

        }
    }

    if(self.current.anim)
    {
        var time=_time;
        if(_time===undefined) time=self.current.parent.patch.timer.getTime();

        self.currentKeyTime.val=time-self.current.anim.getKey(time).time;

        if(self.current.isAnimated())
        {
            if(self.overwriteTime.val)
            {
                self.current.parent.patch.timer.overwriteTime=self.currentKeyTime.val;  // todo  why current ? why  not self ?
            }
        }
    }

    if(self.patch.gui && self.ignoreInSubPatch.val )
    {
        for(var i=0;i<triggers.length;i++)
        {
            for(spl=0;spl<triggers[i].links.length;spl++)
            {
                if(triggers[i].links[spl])
                {
                    if(triggers[i].links[spl].portIn.parent.patchId)
                    {
                        if(gui.patch().getCurrentSubPatch() == triggers[i].links[spl].portIn.parent.patchId.val)
                        {
                            self.patch.timer.overwriteTime=-1;
                            triggers[i].trigger();
                            return;
                        }
                        // console.log(triggers[i].links[spl].portIn.parent.patchId.val);
                    }
                }
            }
        }
    }

    var outIndex=Math.round(self.current.val-0.5);
    if(outIndex>=0 && outIndex<triggers.length)
    {
        triggers[outIndex].trigger();
    }

    self.patch.timer.overwriteTime=-1;
    self.triggerAlways.trigger();
};
