op.name="ReloadPage";

var exec=op.inTrigger("Exec");

exec.onTriggered=function()
{
    location.reload();
    
};