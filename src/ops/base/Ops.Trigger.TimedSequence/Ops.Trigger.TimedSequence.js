var self=this;

this.name='TimedSequence';
this.exe=this.addInPort(new Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
this.current=this.addInPort(new Port(this,"current",CABLES.OP_PORT_TYPE_VALUE));
this.current.val=0;

this.overwriteTime=this.addInPort(new Port(this,"overwriteTime",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.overwriteTime.val=false;
this.ignoreInSubPatch=this.addInPort(new Port(this,"ignoreInSubPatch",CABLES.OP_PORT_TYPE_VALUE,{display:"bool"}));
this.ignoreInSubPatch.val=false;

this.triggerAlways=this.addOutPort(new Port(this,"triggerAlways",CABLES.OP_PORT_TYPE_FUNCTION));
var outNames=op.outArray("Names",[]);
this.currentKeyTime=this.addOutPort(new Port(this,"currentKeyTime",CABLES.OP_PORT_TYPE_VALUE));
const outCurrent=op.outValue("Current");
var triggers=[];

for(var i=0;i<32;i++)
{
    var p=this.addOutPort(new Port(this,"trigger "+i,CABLES.OP_PORT_TYPE_FUNCTION));
    p.onLinkChanged=updateNames;
    triggers.push( p );
}

function updateNames()
{
    var names=[];
    for(var i=0;i<triggers.length;i++)
    {
        if(triggers[i].isLinked())
        {
            names.push(triggers[i].links[0].getOtherPort(triggers[i]).parent.uiAttribs.title);
        }
        else
        {
            names.push("none");
        }
        
    }
    outNames.set(names);
}

this.onLoaded=function()
{
    updateNames();
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

this.exe.onTriggered=doTrigger;
// this.current.onValueChanged=doTrigger;


function doTrigger(_time)
{
    var spl=0;
    
    var outIndex=Math.round(self.current.val-0.5);
    
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

    
    if(outIndex>=0 && outIndex<triggers.length)
    {
        outCurrent.set(outIndex);
        triggers[outIndex].trigger();
    }

    self.patch.timer.overwriteTime=-1;
    self.triggerAlways.trigger();
};
