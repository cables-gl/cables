var CABLES=CABLES || {};



CABLES.Requirements=function(patch)
{
    this._patch=patch;
    this.result=[];
}

CABLES.Requirements.MIDI=0;
CABLES.Requirements.POINTERLOCK=1;
CABLES.Requirements.WEBAUDIO=2;
CABLES.Requirements.WEBGL2=3;

CABLES.Requirements.infos=[];
CABLES.Requirements.infos[CABLES.Requirements.POINTERLOCK]={ title:"pointerLock",caniuse:"https://caniuse.com/#search=pointerlock" }
CABLES.Requirements.infos[CABLES.Requirements.MIDI]={ title:"midi API",caniuse:"https://caniuse.com/#search=midi" }
CABLES.Requirements.infos[CABLES.Requirements.WEBAUDIO]={ title:"web audio",caniuse:"https://caniuse.com/#search=webaudio" }
CABLES.Requirements.infos[CABLES.Requirements.WEBGL2]={ title:"WebGL 2" }

CABLES.Requirements.prototype.checkRequirement=function(which,op)
{
    this.result=[];
    switch(which)
    {
        
        case CABLES.Requirements.WEBGL2:
            return op.patch.cgl.glVersion>=2;
        break;
        case CABLES.Requirements.POINTERLOCK:
            return "exitPointerLock" in document;
        break;
        case CABLES.Requirements.MIDI:
            return "MIDIAccess" in window;
        break;
        case CABLES.Requirements.WEBAUDIO:
            var has=false;
            if(window.audioContext) has=true;
            if(!has && ( 'webkitAudioContext' in window || 'AudioContext' in window) )  has=true;
            return has;
        break;

        
    }
}

CABLES.Requirements.prototype.checkOp=function(op)
{
    if(op && op.requirements)
    {
        for(var j=0;j<op.requirements.length;j++)
        {
            var reqId=op.requirements[j];
            if(!this.result[reqId])
            {
                var success=this.checkRequirement(reqId,op);
                
                if(!success)
                {
                    if(op.patch.cgl && op.patch.cgl.canvas)op.patch.cgl.canvas.remove();
                    var title=CABLES.Requirements.infos[reqId].title;
                    if(CABLES.Requirements.infos[reqId].caniuse) title='<a href="'+CABLES.Requirements.infos[reqId].caniuse+'" target="_blank">'+CABLES.Requirements.infos[reqId].title+' ('+op.objName+')</a>';
                    // document.writeln('<pre>browser does not meet requirement: '+title+'</pre>');
                    // console.error("browser does not meet requirement: "+CABLES.Requirements.infos[reqId].title);
                    throw 'this browser does not meet requirement: '+CABLES.Requirements.infos[reqId].title+' ('+op.objName+')';
                }

                this.result[reqId]=
                {
                    "success":success,
                    "info": CABLES.Requirements.infos[reqId]
                }
            }
        }
    }

};


