// Op.apply(this, arguments);
this.name = "HeightMap";

const render = op.inTrigger("render");
let filename = this.addInPort(new CABLES.Port(this, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "image" }));

let extrude = this.addInPort(new CABLES.Port(this, "extrude", CABLES.OP_PORT_TYPE_VALUE));
extrude.set(1);

let mWidth = this.addInPort(new CABLES.Port(this, "width", CABLES.OP_PORT_TYPE_VALUE));
let mHeight = this.addInPort(new CABLES.Port(this, "height", CABLES.OP_PORT_TYPE_VALUE));

let nRows = this.addInPort(new CABLES.Port(this, "rows", CABLES.OP_PORT_TYPE_VALUE));
let nColumns = this.addInPort(new CABLES.Port(this, "columns", CABLES.OP_PORT_TYPE_VALUE));

const trigger = op.outTrigger("trigger");

mHeight.set(3.0);
mWidth.set(3.0);
nRows.set(20);
nColumns.set(20);

let geom = new CGL.Geometry();
let mesh = null;
let cgl = this.patch.cgl;
let image = new Image();

render.onTriggered = function ()
{
    if (mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

let rebuildGeom = function ()
{
    geom.clear();

    let verts = [];
    let tc = [];
    let indices = [];

    let width = image.width;
    let height = image.height;
    console.log("img ", width, height);
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    let meshWidth = mWidth.get();
    let meshHeight = mHeight.get();

    let count = 0;

    let vertStepX = meshWidth / width;
    let vertStepY = meshHeight / height;

    let numRows = parseFloat(nRows.get());
    let numColumns = parseFloat(nColumns.get());
    let rowStepX = width / numColumns;
    let rowStepY = height / numRows;
    let heightMul = extrude.get() * 0.001;

    let stepRow = meshWidth / numRows;
    let stepColumn = meshHeight / numColumns;

    for (r = 0; r <= numRows; r++)
    {
        for (c = 0; c <= numColumns; c++)
        {
            let h = ctx.getImageData(c * rowStepY, r * rowStepX, 1, 1).data[1] * heightMul;

            verts.push(c * stepColumn - meshWidth / 2);
            verts.push(r * stepRow - meshHeight / 2);
            verts.push(h);

            tc.push(c / numColumns);
            tc.push(1.0 - r / numRows);
        }
    }

    for (c = 0; c < numColumns; c++)
    {
        for (r = 0; r < numRows; r++)
        {
            let ind = c + (numColumns + 1) * r;
            let v1 = ind;
            let v2 = ind + 1;
            let v3 = ind + numColumns + 1;
            let v4 = ind + 1 + numColumns + 1;

            indices.push(v1);
            indices.push(v2);
            indices.push(v3);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    console.log("count", count);
    console.log("indices", indices.length);
    console.log("verts", verts.length / 3);

    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.calcNormals();

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    mesh.setGeom(geom);
};

let reload = function ()
{
    image.crossOrigin = "";

    image.onabort = image.onerror = function (e)
    {
        console.log("error loading image...");
    };

    image.onload = function (e)
    {
        rebuildGeom();
    };
    image.src = filename.get();
};

extrude.onChange = rebuildGeom;
mHeight.onChange = rebuildGeom;
mWidth.onChange = rebuildGeom;
nRows.onChange = rebuildGeom;
nColumns.onChange = rebuildGeom;
filename.onChange = reload;
