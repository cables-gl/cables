// deprecated json3d loader geomgetry helper

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Use a lookup table to find the index.
const _base64lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) _base64lookup[base64Chars.charCodeAt(i)] = i;

const base64lookup = _base64lookup;

function b64encTypesArray(arraybuffer)
{
    if (arraybuffer.buffer) arraybuffer = arraybuffer.buffer;
    let bytes = new Uint8Array(arraybuffer),
        i,
        len = bytes.length,
        base64 = "";

    for (i = 0; i < len; i += 3)
    {
        base64 += base64Chars[bytes[i] >> 2];
        base64 += base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += base64Chars[bytes[i + 2] & 63];
    }

    if (len % 3 === 2) base64 = base64.substring(0, base64.length - 1) + "=";
    else if (len % 3 === 1) base64 = base64.substring(0, base64.length - 2) + "==";

    return base64;
}

function b64decTypedArray(base64)
{
    let bufferLength = base64.length * 0.75,
        len = base64.length,
        i,
        p = 0,
        encoded1,
        encoded2,
        encoded3,
        encoded4;

    if (base64[base64.length - 1] === "=")
    {
        bufferLength--;
        if (base64[base64.length - 2] === "=") bufferLength--;
    }

    let arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i += 4)
    {
        encoded1 = base64lookup[base64.charCodeAt(i)];
        encoded2 = base64lookup[base64.charCodeAt(i + 1)];
        encoded3 = base64lookup[base64.charCodeAt(i + 2)];
        encoded4 = base64lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
}


// TODO: not needed anymore ?! move to deprecated ops?
CABLES.CG.Geometry.json2geom = function (jsonMesh)
{
    const geom = new CABLES.CG.Geometry("jsonMeshGeom");
    geom.verticesIndices = [];

    geom.vertices = jsonMesh.vertices || [];
    geom.vertexNormals = jsonMesh.normals || [];
    geom.vertexColors = jsonMesh.colors || [];
    geom.tangents = jsonMesh.tangents || [];
    geom.biTangents = jsonMesh.bitangents || [];
    if (jsonMesh.texturecoords) geom.setTexCoords(jsonMesh.texturecoords[0]);

    if (jsonMesh.vertices_b64)geom.vertices = new Float32Array(b64decTypedArray(jsonMesh.vertices_b64));
    if (jsonMesh.normals_b64) geom.vertexNormals = new Float32Array(b64decTypedArray(jsonMesh.normals_b64));
    if (jsonMesh.tangents_b64) geom.tangents = new Float32Array(b64decTypedArray(jsonMesh.tangents_b64));
    if (jsonMesh.bitangents_b64) geom.biTangents = new Float32Array(b64decTypedArray(jsonMesh.bitangents_b64));
    if (jsonMesh.texturecoords_b64) geom.setTexCoords(new Float32Array(b64decTypedArray(jsonMesh.texturecoords_b64[0])));

    if (jsonMesh.faces_b64)
    {
        geom.verticesIndices = new Uint32Array(b64decTypedArray(jsonMesh.faces_b64));
    }
    else
    {
        geom.verticesIndices.length = jsonMesh.faces.length * 3;
        for (let i = 0; i < jsonMesh.faces.length; i++)
        {
            geom.verticesIndices[i * 3] = jsonMesh.faces[i][0];
            geom.verticesIndices[i * 3 + 1] = jsonMesh.faces[i][1];
            geom.verticesIndices[i * 3 + 2] = jsonMesh.faces[i][2];
        }
    }

    return geom;
};

