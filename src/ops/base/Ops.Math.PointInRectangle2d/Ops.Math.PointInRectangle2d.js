
var x=op.inValue("x");
var y=op.inValue("y");

var rtop=op.inValue("rect top");
var rleft=op.inValue("rect left");
var rright=op.inValue("rect right");
var rbottom=op.inValue("rect bottom");

var result=op.outValue("Result");
var outX=op.outValue("Pos x");
var outY=op.outValue("Pos y");

x.onChange=y.onChange=function()
{
    
    var isIn=(x.get()>rleft.get() && x.get()<rright.get() && y.get()>rtop.get() && y.get()<rbottom.get());
    
    outX.set( Math.max(0,Math.min(1.0,( x.get()-rleft.get() ) /( rright.get()-rleft.get() ))));
    outY.set( Math.max(0,Math.min(1.0,( y.get()-rtop.get() ) /( rbottom.get()-rtop.get() ))));
    
    
    result.set(isIn==true);
    
    
    
};
