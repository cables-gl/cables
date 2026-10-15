const
    inFile = op.inUrl("File", [".ply"]),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outNumPoints = op.outNumber("Num Points"),
    outLoading = op.outBoolNum("Loading");

const MAX_HEADER_BYTES = 65536;
const HEADER_END = "end_header";
const FLOAT_MAX = 1;

const TYPES = {
    "char": { "size": 1, "getter": "getInt8", "max": 127 },
    "int8": { "size": 1, "getter": "getInt8", "max": 127 },
    "uchar": { "size": 1, "getter": "getUint8", "max": 255 },
    "uint8": { "size": 1, "getter": "getUint8", "max": 255 },
    "short": { "size": 2, "getter": "getInt16", "max": 32767 },
    "int16": { "size": 2, "getter": "getInt16", "max": 32767 },
    "ushort": { "size": 2, "getter": "getUint16", "max": 65535 },
    "uint16": { "size": 2, "getter": "getUint16", "max": 65535 },
    "int": { "size": 4, "getter": "getInt32", "max": 2147483647 },
    "int32": { "size": 4, "getter": "getInt32", "max": 2147483647 },
    "uint": { "size": 4, "getter": "getUint32", "max": 4294967295 },
    "uint32": { "size": 4, "getter": "getUint32", "max": 4294967295 },
    "float": { "size": 4, "getter": "getFloat32", "max": FLOAT_MAX },
    "float32": { "size": 4, "getter": "getFloat32", "max": FLOAT_MAX },
    "double": { "size": 8, "getter": "getFloat64", "max": FLOAT_MAX },
    "float64": { "size": 8, "getter": "getFloat64", "max": FLOAT_MAX }
};

const TEXCOORD_NAMES = [["u", "v"], ["s", "t"], ["texture_u", "texture_v"]];
const FACE_INDEX_NAMES = ["vertex_indices", "vertex_index"];

inFile.onChange = load;

function load()
{
    const fileToLoad = inFile.get();
    if (!fileToLoad || fileToLoad == "null")
    {
        outGeom.set(null);
        outNumPoints.set(0);
        return;
    }

    const url = op.patch.getFilePath(String(fileToLoad));
    const loadingId = op.patch.loading.start("plyGeometry", fileToLoad, op);
    outLoading.set(true);

    op.patch.loading.addAssetLoadingTask(() =>
    {
        fetch(url)
            .then((res) => { return res.arrayBuffer(); })
            .then((buffer) =>
            {
                if (inFile.get() == fileToLoad) parse(buffer);
                finishLoading(loadingId);
            })
            .catch((e) =>
            {
                op.setUiError("load", "could not load ply file: " + e.message, 2);
                op.logError(e);
                finishLoading(loadingId);
            });
    });
}

function finishLoading(loadingId)
{
    op.patch.loading.finished(loadingId);
    outLoading.set(false);
}

function parse(buffer)
{
    op.setUiError("load", null);
    op.setUiError("elements", null);

    const header = parseHeader(buffer);
    if (!header) return;

    let reader = null;
    if (header.format == "ascii") reader = createAsciiReader(buffer, header.length);
    else reader = createBinaryReader(buffer, header.length, header.format == "binary_little_endian");

    let vertexProps = null;
    let numVertices = 0;
    let faces = null;
    const ignored = [];

    for (let i = 0; i < header.elements.length; i++)
    {
        const element = header.elements[i];
        if (element.name == "vertex" && !vertexProps)
        {
            vertexProps = readVertices(reader, element);
            numVertices = element.count;
        }
        else if (element.name == "face" && !faces) faces = readFaces(reader, element);
        else
        {
            skipElement(reader, element);
            ignored.push(element.name);
        }
    }

    if (ignored.length > 0) op.setUiError("elements", "ignored ply elements: " + ignored.join(", "), 0);

    if (!vertexProps)
    {
        op.setUiError("load", "ply file has no vertex element", 2);
        return;
    }

    outNumPoints.set(numVertices);
    outGeom.set(null);
    outGeom.set(buildGeometry(vertexProps, numVertices, faces));
}

function parseHeader(buffer)
{
    const headerBytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, MAX_HEADER_BYTES));
    const text = new TextDecoder("latin1").decode(headerBytes);
    const endPos = text.indexOf(HEADER_END);
    const lineEndPos = text.indexOf("\n", endPos);

    if (!text.startsWith("ply") || endPos == -1 || lineEndPos == -1)
    {
        op.setUiError("load", "not a valid ply file", 2);
        return null;
    }

    const header = { "format": "", "length": lineEndPos + 1, "elements": [] };
    const lines = text.substring(0, endPos).split("\n");

    for (let i = 0; i < lines.length; i++)
    {
        const tokens = lines[i].trim().split(/\s+/);

        if (tokens[0] == "format") header.format = tokens[1];
        else if (tokens[0] == "element") header.elements.push({ "name": tokens[1], "count": parseInt(tokens[2]), "properties": [] });
        else if (tokens[0] == "property")
        {
            const element = header.elements[header.elements.length - 1];
            if (tokens[1] == "list") element.properties.push({ "name": tokens[4], "isList": true, "countType": tokens[2], "type": tokens[3] });
            else element.properties.push({ "name": tokens[2], "isList": false, "type": tokens[1] });
        }
    }

    for (let i = 0; i < header.elements.length; i++)
    {
        const properties = header.elements[i].properties;
        for (let j = 0; j < properties.length; j++)
        {
            if (TYPES[properties[j].type] && (!properties[j].isList || TYPES[properties[j].countType])) continue;
            op.setUiError("load", "unknown ply property type: " + properties[j].type, 2);
            return null;
        }
    }

    return header;
}

function createBinaryReader(buffer, offset, littleEndian)
{
    const view = new DataView(buffer);
    return {
        "read": (type) =>
        {
            const typeInfo = TYPES[type];
            const value = view[typeInfo.getter](offset, littleEndian);
            offset += typeInfo.size;
            return value;
        }
    };
}

function createAsciiReader(buffer, offset)
{
    const text = new TextDecoder("latin1").decode(new Uint8Array(buffer, offset));
    const tokens = text.trim().split(/\s+/);
    let index = 0;
    return {
        "read": () => { return Number(tokens[index++]); }
    };
}

function readList(reader, property)
{
    const values = [];
    const count = reader.read(property.countType);
    for (let i = 0; i < count; i++) values.push(reader.read(property.type));
    return values;
}

function readVertices(reader, element)
{
    const props = {};
    const properties = element.properties;

    for (let j = 0; j < properties.length; j++)
        if (!properties[j].isList) props[properties[j].name] = { "type": properties[j].type, "data": new Float32Array(element.count) };

    for (let i = 0; i < element.count; i++)
    {
        for (let j = 0; j < properties.length; j++)
        {
            if (properties[j].isList) readList(reader, properties[j]);
            else props[properties[j].name].data[i] = reader.read(properties[j].type);
        }
    }
    return props;
}

function readFaces(reader, element)
{
    const indices = [];
    const properties = element.properties;

    for (let i = 0; i < element.count; i++)
    {
        for (let j = 0; j < properties.length; j++)
        {
            if (!properties[j].isList)
            {
                reader.read(properties[j].type);
                continue;
            }

            const polygon = readList(reader, properties[j]);
            if (FACE_INDEX_NAMES.indexOf(properties[j].name) == -1) continue;

            for (let k = 1; k < polygon.length - 1; k++) indices.push(polygon[0], polygon[k], polygon[k + 1]);
        }
    }
    return indices;
}

function skipElement(reader, element)
{
    const properties = element.properties;
    for (let i = 0; i < element.count; i++)
    {
        for (let j = 0; j < properties.length; j++)
        {
            if (properties[j].isList) readList(reader, properties[j]);
            else reader.read(properties[j].type);
        }
    }
}

function hasProps(props, names)
{
    for (let i = 0; i < names.length; i++)
        if (!props[names[i]]) return false;
    return true;
}

function interleave(props, names, count, used)
{
    const result = new Float32Array(count * names.length);
    for (let j = 0; j < names.length; j++)
    {
        const prop = props[names[j]];
        const scale = 1 / TYPES[prop.type].max;
        used[names[j]] = true;
        for (let i = 0; i < count; i++) result[i * names.length + j] = prop.data[i] * scale;
    }
    return result;
}

function buildColors(props, count, used)
{
    const hasAlpha = hasProps(props, ["alpha"]);
    let names = ["red", "green", "blue"];
    if (hasAlpha) names = ["red", "green", "blue", "alpha"];

    const colors = interleave(props, names, count, used);
    if (hasAlpha) return colors;

    const rgba = new Float32Array(count * 4);
    for (let i = 0; i < count; i++)
    {
        rgba[i * 4 + 0] = colors[i * 3 + 0];
        rgba[i * 4 + 1] = colors[i * 3 + 1];
        rgba[i * 4 + 2] = colors[i * 3 + 2];
        rgba[i * 4 + 3] = 1;
    }
    return rgba;
}

function buildGeometry(props, count, faces)
{
    const geom = new CGL.Geometry("ply");
    const used = {};

    if (hasProps(props, ["x", "y", "z"])) geom.vertices = interleave(props, ["x", "y", "z"], count, used);
    if (hasProps(props, ["nx", "ny", "nz"])) geom.vertexNormals = interleave(props, ["nx", "ny", "nz"], count, used);
    if (hasProps(props, ["red", "green", "blue"])) geom.vertexColors = buildColors(props, count, used);

    for (let i = 0; i < TEXCOORD_NAMES.length; i++)
    {
        if (!hasProps(props, TEXCOORD_NAMES[i])) continue;
        geom.texCoords = interleave(props, TEXCOORD_NAMES[i], count, used);
        break;
    }

    for (const name in props)
        if (!used[name]) geom.setAttribute(name, props[name].data, 1);

    if (faces && faces.length > 0) geom.verticesIndices = new Uint32Array(faces);
    else geom.glPrimitive = op.patch.cgl.gl.POINTS;

    return geom;
}
