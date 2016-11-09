op.name='Concat';

var string1=op.inValueString("string1","ABC");
var string2=op.inValueString("string2","XYZ");

var result=op.outValueString("result");

function exec()
{
    result.set( String(string1.get())+String(string2.get()));
}

string1.onChange=exec;
string2.onChange=exec;

