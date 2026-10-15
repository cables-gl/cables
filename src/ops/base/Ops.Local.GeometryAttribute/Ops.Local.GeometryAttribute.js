const
    inGeometry = op.inObject("Geometry", null, "geometry"),
    inName = op.inString("Name", "vertices"),
    outArray = op.outArray("Array"),
    outItemSize = op.outNumber("Item Size"),
    outFound = op.outBoolNum("Found");

const VERTICES_NAME = "vertices";
const VERTICES_ITEMSIZE = 3;

inGeometry.onChange =
    inName.onChange = update;

function update()
{
    const geom = inGeometry.get();
    const name = inName.get();
    op.setUiAttrib({ "extendTitle": name });

    if (!geom || !geom.isGeometry)
    {
        op.setUiError("notfound", null);
        setOutput(null, 0);
        return;
    }

    if (name == VERTICES_NAME)
    {
        op.setUiError("notfound", null);
        setOutput(geom.vertices, VERTICES_ITEMSIZE);
        return;
    }

    const attribute = geom.getAttribute(name);
    if (!attribute)
    {
        op.setUiError("notfound", "geometry has no attribute \"" + name + "\"", 1);
        setOutput(null, 0);
        return;
    }

    op.setUiError("notfound", null);
    setOutput(attribute.data, attribute.itemSize);
}

function setOutput(data, itemSize)
{
    outArray.setUiAttribs({ "stride": itemSize });
    outItemSize.set(itemSize);
    outFound.set(data != null);
    outArray.setRef(data);
}
