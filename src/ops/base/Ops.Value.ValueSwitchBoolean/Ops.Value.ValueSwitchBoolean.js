var inBool=op.inValueBool("Boolean");
var valTrue=op.inValue("Value true",1);
var valFalse=op.inValue("Value false",0);

var outVal=op.outValue("Result");

inBool.onChange = update;
valTrue.onChange = update;
valFalse.onChange = update;

function update() {
    if(inBool.get()) outVal.set(valTrue.get());
    else outVal.set(valFalse.get());
}