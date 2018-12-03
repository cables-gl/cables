const exe=op.inTrigger("exe");
const current=op.inValueInt("current",0);
const overwriteTime=op.inValueBool("overwriteTime");
const ignoreInSubPatch=op.inValueBool("ignoreInSubPatch",false);
const triggerAlways=op.outTrigger("triggerAlways");
const outNames=op.outArray("Names",[]);
const currentKeyTime=op.outValue("currentKeyTime");
const outCurrent=op.outValue("Current");
var triggers=[];

for(var i=0;i<32;i++)
{
    var p=op.outTrigger("trigger "+i);
    p.onLinkChanged=updateNames;
    triggers.push( p );
}

function updateNames()
{
    var names=[];
    for(var i=0;i<triggers.length;i++)
        if(triggers[i].isLinked()) names.push(triggers[i].links[0].getOtherPort(triggers[i]).parent.uiAttribs.title);
            else names.push("none");

    outNames.set(names);
}

op.onLoaded=updateNames;

var lastUiValue=-1;

exe.onTriggered=doTrigger;

function doTrigger(_time)
{
    var spl=0;

    var outIndex=Math.round(current.get()-0.5);

    if(window.gui)
    {

        if(current.get()!=lastUiValue)
        {
            lastUiValue=current.get();
            for(spl=0;spl<triggers.length;spl++)
            {
                if(spl==lastUiValue) triggers[spl].setUiActiveState(true);
                    else triggers[spl].setUiActiveState(false);
            }
        }
    }

    if(current.anim)
    {
        var time=_time;
        if(_time===undefined) time=current.parent.patch.timer.getTime();

        currentKeyTime.set(time-current.anim.getKey(time).time);

        if(current.isAnimated())
        {
            if(overwriteTime.get())
            {
                current.parent.patch.timer.overwriteTime=currentKeyTime.get();  // todo  why current ? why  not self ?
            }
        }
    }

    if(op.patch.gui && ignoreInSubPatch.get() )
    {
        for(var i=0;i<triggers.length;i++)
        {
            for(spl=0;spl<triggers[i].links.length;spl++)
            {
                if(triggers[i].links[spl])
                {
                    if(triggers[i].links[spl].portIn.parent.patchId)
                    {
                        if(gui.patch().getCurrentSubPatch() == triggers[i].links[spl].portIn.parent.patchId.get())
                        {
                            op.patch.timer.overwriteTime=-1;
                            triggers[i].trigger();
                            return;
                        }
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

    op.patch.timer.overwriteTime=-1;
    triggerAlways.trigger();
}
