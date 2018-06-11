op.name="PolyShapeData";

var pDefaultR=op.addInPort(new Port(op,"highlight r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var pDefaultG=op.addInPort(new Port(op,"highlight g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var pDefaultB=op.addInPort(new Port(op,"highlight b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var p=op.inValueSelect("price",["free","low","middle","high"]);

var author=op.inValueString("author");
var authorid=op.inValueString("authorid");

var descr=op.addInPort(new Port(op,"descr",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'markdown'}));
var features=op.addInPort(new Port(op,"features",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'markdown'}));
var customizable=op.addInPort(new Port(op,"customizable",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'markdown'}));
