op.name="MathExpression";

var expression=op.inValueString("Expression","1+2+A");
var a=op.inValue("A",1);
var b=op.inValue("B",1);
var c=op.inValue("C",1);

var result=op.outValue("Result");


var Obj = new BigEval();

expression.onChange=update;
a.onChange=update;
b.onChange=update;
c.onChange=update;


function update()
{
    Obj.CONSTANT.A = ""+a.get();
    Obj.CONSTANT.B = ""+b.get();
    Obj.CONSTANT.C = ""+c.get();
    result.set( Obj.exec( expression.get() ) );
}

update();