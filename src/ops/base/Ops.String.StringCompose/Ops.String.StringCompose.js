var format=op.inValueString('Format',"hello $a, $b $c und $d");
var a=op.inValueString('String A','world');
var b=op.inValueString('String B',1);
var c=op.inValueString('String C',2);
var d=op.inValueString('String D',3);
var e=op.inValueString('String E');
var f=op.inValueString('String F');
var result=op.outValue("Result");

format.onChange=update;
a.onChange=update;
b.onChange=update;
c.onChange=update;
d.onChange=update;
e.onChange=update;
f.onChange=update;

update();

function update()
{
    var str=format.get()||'';
    
    str = str.replace(/\$a/g, a.get());
    str = str.replace(/\$b/g, b.get());
    str = str.replace(/\$c/g, c.get());
    str = str.replace(/\$d/g, d.get());
    str = str.replace(/\$e/g, e.get());
    str = str.replace(/\$f/g, f.get());
    
    result.set(str);
}