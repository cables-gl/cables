op.name = "PolyShapeData";

let pDefaultR = op.addInPort(new CABLES.Port(op, "highlight r", CABLES.Port.TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let pDefaultG = op.addInPort(new CABLES.Port(op, "highlight g", CABLES.Port.TYPE_VALUE, { "display": "range" }));
let pDefaultB = op.addInPort(new CABLES.Port(op, "highlight b", CABLES.Port.TYPE_VALUE, { "display": "range" }));

let p = op.inValueSelect("price", ["free", "low", "middle", "high"]);

let author = op.inValueString("author");
let authorid = op.inValueString("authorid");

let descr = op.addInPort(new CABLES.Port(op, "descr", CABLES.Port.TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
let features = op.addInPort(new CABLES.Port(op, "features", CABLES.Port.TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
let customizable = op.addInPort(new CABLES.Port(op, "customizable", CABLES.Port.TYPE_VALUE, { "display": "editor", "editorSyntax": "markdown" }));
