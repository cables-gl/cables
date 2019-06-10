var exec=op.inTrigger("Open");
var inUrl=op.inString("URL","http://cables.gl");

exec.onTriggered=function()
{
    document.location.href=inUrl.get();
};