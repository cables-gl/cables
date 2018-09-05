const exe=op.inFunctionButton("Remove");
const inName=op.inValueString("Classname");

exe.onTriggered=function()
{
    var els=document.getElementsByClassName(inName.get());
    
    for(var i=0;i<els.length;i++)
    {
        els[i].classList.remove( inName.get() );
    }
    
};
