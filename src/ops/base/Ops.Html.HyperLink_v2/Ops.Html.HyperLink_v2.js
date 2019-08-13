const
    exec=op.inTrigger("Open"),
    inUrl=op.inString("URL","https://cables.gl"),
    inTarget=op.inString("Target Name","_self"),
    inSpecs=op.inString("Specs","");


exec.onTriggered=function()
{
    // document.location.href=inUrl.get();
    window.open(inUrl.get(), inTarget.get(), inSpecs.get());
};