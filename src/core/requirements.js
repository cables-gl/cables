var CABLES=CABLES || {};



CABLES.Requirements=function(patch)
{
    this._patch=patch;
    this.result=[];
}

CABLES.Requirements.MIDI=0;
CABLES.Requirements.POINTERLOCK=1;
CABLES.Requirements.WEBAUDIO=2;

CABLES.Requirements.infos=[];
CABLES.Requirements.infos[CABLES.Requirements.POINTERLOCK]={ title:"pointerLock",caniuse:"https://caniuse.com/#search=pointerlock" }
CABLES.Requirements.infos[CABLES.Requirements.MIDI]={ title:"midi api",caniuse:"https://caniuse.com/#search=midi" }
CABLES.Requirements.infos[CABLES.Requirements.WEBAUDIO]={ title:"web audio",caniuse:"https://caniuse.com/#search=webaudio" }

CABLES.Requirements.prototype.checkRequirement=function(which)
{
    this.result=[];
    switch(which)
    {
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
    if(op.requirements)
    {
        for(var j=0;j<op.requirements.length;j++)
        {
            var reqId=op.requirements[j];
            if(!this.result[reqId])
            {
                var success=this.checkRequirement(reqId);
                
                if(!success)
                {
                    if(CABLES.patch.cgl && CABLES.patch.cgl.canvas)CABLES.patch.cgl.canvas.remove();
                    document.writeln('<pre>browser does not meet requirement: <a href="'+CABLES.Requirements.infos[reqId].caniuse+'" target="_blank">'+CABLES.Requirements.infos[reqId].title+'</a></pre>');
                    console.error("browser does not meet requirement: "+CABLES.Requirements.infos[reqId].title);
                    throw 'this browser does not meet requirement: '+CABLES.Requirements.infos[reqId].title;
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


