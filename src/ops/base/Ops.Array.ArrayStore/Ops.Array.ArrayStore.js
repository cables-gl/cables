//original code by LJ
const
    inTrigger=op.inTrigger("store"),
    inInitial=op.inArray("initial"),
    inArray=op.inArray("inarray"),
    inReset=op.inTriggerButton("reset"),
    outTrigger=op.outTrigger("next"),
    outArray=op.outArray("outarray")
;
inInitial.onChange=inReset.onTriggered=function(){outArray.set(inInitial.get());};
inTrigger.onTriggered=function(){
    outArray.set(null);
    outArray.set(inArray.get());
    outTrigger.trigger();
};