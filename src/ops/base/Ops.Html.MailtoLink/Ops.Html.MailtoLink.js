const
    inEmail=op.inString("Email","test@test.com"),
    inSubject=op.inString("Subject",""),
    exec=op.inTriggerButton("Execute");

exec.onTriggered=function()
{
    var str="mailto:";
    str+=inEmail.get();
    if(inSubject.get())str+="?subject="+inSubject.get();
    window.location.href=str;
};