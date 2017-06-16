op.name="HyperLink";

var exec=op.inFunction("open");
var inUrl=op.inValueString("URL","http://cables.gl");

exec.onTriggered=function()
{
    document.location.href=inUrl.get();
    
};