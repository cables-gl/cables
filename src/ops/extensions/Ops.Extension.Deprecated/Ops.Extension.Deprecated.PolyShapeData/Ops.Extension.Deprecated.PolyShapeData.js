op.name = "PolyShapeData";

let pDefaultR = op.addInPort(new CABLES.Port(op, "highlight r", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let pDefaultG = op.addInPort(new CABLES.Port(op, "highlight g", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let pDefaultB = op.addInPort(new CABLES.Port(op, "highlight b", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let p = op.inValueSelect("price", ["free", "low", "middle", "high"]);

let author = op.inValueString("author");
let authorid = op.inValueString("authorid");

let descr = op.addInPort(new CABLES.Port(op, "descr", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
let features = op.addInPort(new CABLES.Port(op, "features", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
let customizable = op.addInPort(new CABLES.Port(op, "customizable", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
