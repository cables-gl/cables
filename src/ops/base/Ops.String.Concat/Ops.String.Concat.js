var string1=op.inValueString("string1","ABC");
var string2=op.inValueString("string2","XYZ");
var newLine=op.inValueBool("New Line",false);

var result=op.outValueString("result");

function exec()
{
    var nl='';
    if(newLine.get())nl='\n';
    result.set( String(string1.get())+nl+String(string2.get()));
}

newLine.onChange=string2.onChange=string1.onChange=exec;

