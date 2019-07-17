// var CABLES=CABLES || {};



const Requirements=function(patch)
{
    this._patch=patch;
    this.result=[];
}

Requirements.MIDI=0;
Requirements.POINTERLOCK=1;
Requirements.WEBAUDIO=2;
Requirements.WEBGL2=3;

Requirements.infos=[];
Requirements.infos[Requirements.POINTERLOCK]={ title:"pointerLock",caniuse:"https://caniuse.com/#search=pointerlock" }
Requirements.infos[Requirements.MIDI]={ title:"midi API",caniuse:"https://caniuse.com/#search=midi" }
Requirements.infos[Requirements.WEBAUDIO]={ title:"web audio",caniuse:"https://caniuse.com/#search=webaudio" }
Requirements.infos[Requirements.WEBGL2]={ title:"WebGL 2" }

Requirements.prototype.checkRequirement=function(which,op)
{
    this.result=[];
    switch(which)
    {
        
        case Requirements.WEBGL2:
            return op.patch.cgl.glVersion>=2;
        break;
        case Requirements.POINTERLOCK:
            return "exitPointerLock" in document;
        break;
        case Requirements.MIDI:
            return "MIDIAccess" in window;
        break;
        case Requirements.WEBAUDIO:
            var has=false;
            if(window.audioContext) has=true;
            if(!has && ( 'webkitAudioContext' in window || 'AudioContext' in window) )  has=true;
            return has;
        break;
    }
}

Requirements.prototype.checkOp=function(op)
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
                    var title=Requirements.infos[reqId].title;
                    if(Requirements.infos[reqId].caniuse) title='<a href="'+Requirements.infos[reqId].caniuse+'" target="_blank">'+Requirements.infos[reqId].title+' ('+op.objName+')</a>';
                    // document.writeln('<pre>browser does not meet requirement: '+title+'</pre>');
                    // console.error("browser does not meet requirement: "+Requirements.infos[reqId].title);
                    throw 'this browser does not meet requirement: '+Requirements.infos[reqId].title+' ('+op.objName+')';
                }

                this.result[reqId]=
                {
                    "success":success,
                    "info": Requirements.infos[reqId]
                }
            }
        }
    }

};

export default Requirements;
