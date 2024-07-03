const render = op.inTrigger("render"),
    filename = op.inUrl("file"),
    extrude = op.inValueFloat("extrude", 1),
    mWidth = op.inValueFloat("width", 3),
    mHeight = op.inValueFloat("height", 3),
    nRows = op.inValueInt("rows", 20),
    nColumns = op.inValueInt("columns", 20),
    sliceTex = op.inValueBool("texCoords slice"),
    flat = op.inValueBool("flat"),
    trigger = op.outTrigger("trigger");

let outGeom = op.outObject("geometry");
outGeom.ignoreValueSerialize = true;

op.toWorkPortsNeedToBeLinked(render);

let geom = new CGL.Geometry(op.name);
let mesh = null;
let cgl = op.patch.cgl;
let image = new Image();

render.onTriggered = function ()
{
    if (!mesh)rebuildGeom();
    if (mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

extrude.onChange = mHeight.onChange = mWidth.onChange =
    nRows.onChange = nColumns.onChange = flat.onChange = () => { mesh = null; };

filename.onChange = reload;

function rebuildGeom()
{
    geom.clear();

    let verts = [];
    let tc = [];
    let indices = [];

    let width = image.width;
    let height = image.height;
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
    let rowStepX = numColumns ? width / numColumns : width;
    let rowStepY = numRows ? height / numRows : height;
    let heightMul = extrude.get() * 0.001;

    let stepRow = numRows ? meshWidth / numRows : meshWidth;
    let stepColumn = numColumns ? meshHeight / numColumns : meshHeight;

    let cycleTex = 0;
    let oldh = 0;

    for (var r = 0; r <= numRows; r++)
    {
        for (var c = 0; c <= numColumns; c++)
        {
            let h = ctx.getImageData(Math.round(c * rowStepX), Math.round(r * rowStepY), 1, 1).data[1] * heightMul;
            // verts.push( c*stepColumn    - meshWidth/2 );
            // verts.push( r*stepRow       - meshHeight/2 );
            verts.push(c * stepColumn);
            verts.push(r * stepRow);
            verts.push(h);

            if (sliceTex.get())
            {
                if (h != oldh)
                {
                    if (c % 2 == 0) tc.push(0.5);
                    else tc.push(1);

                    tc.push(1.0 - r / numRows);
                }
                else
                {
                    tc.push(1);
                    tc.push(0);
                }
                oldh = h;
            }
            else
            {
                tc.push(c / numColumns);
                tc.push(1.0 - r / numRows);
            }
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

    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    if (flat.get())geom.unIndex();
    geom.calculateNormals({ "forceZUp": true });

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    mesh.setGeom(geom);
    outGeom.set(null);
    outGeom.set(geom);
}

function reload()
{
    image.crossOrigin = "";
    let url = op.patch.getFilePath(filename.get());

    let loadingId = op.patch.loading.start("heightmapImage", url, op);

    image.onabort = image.onerror = function (e)
    {
        op.patch.loading.finished(loadingId);
        op.log("error loading heightmap image...");
    };

    image.onload = function (e)
    {
        rebuildGeom();
        op.patch.loading.finished(loadingId);
    };
    image.src = url;
}
