var string1=op.inString("string1","ABC");
var string2=op.inString("string2","XYZ");
var newLine=op.inValueBool("New Line",false);
var result=op.outString("result");

newLine.onChange=string2.onChange=string1.onChange=exec;
exec();

function exec()
{
    var nl='';
    if(newLine.get())nl='\n';
    result.set( String(string1.get())+nl+String(string2.get()));
}


