// todo: support quads
const
    inStr = op.inString("Obj", ""),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outStatus = op.outString("Status");

inStr.onChange = () => { parse(inStr.get()); };

function obj(name)
{
    const a = {
        "prim": 0,
        "name": name,
        "verts": [],
        "vertNorms": [],
        "texCoords": [],
        "indexVerts": [],
        "indexNorms": [],
        "indexTexcoords": []
    };

    return a;
}

function parseTri(parts, o)
{
    for (let j = 0; j < parts.length; j++)
    {
        const faceParts = parts[j].split("/");

        if (faceParts.length == 3)
        {
            o.indexVerts.push(parseInt(faceParts[0]) - 1);
            if (faceParts[1])o.indexTexcoords.push(parseInt(faceParts[1]) - 1);
            o.indexNorms.push(parseInt(faceParts[2]) - 1);
        }
        else if (faceParts.length == 1)
        {
            o.indexVerts.push(parseInt(faceParts[0]) - 1);
        }
        else if (faceParts.length == 2)
        {
            o.indexVerts.push(parseInt(faceParts[0]) - 1);
            o.indexTexcoords.push(parseInt(faceParts[2]) - 1);
        }
        else op.warn("unknown face structure", faceParts);
    }
}

function parse(str)
{
    if (!str) return outGeom.set(null);

    let objects = [];
    let strStatus = "";
    const lines = str.split("\n");

    {
        let o = obj("unknown");

        for (let i = 0; i < lines.length; i++)
        {
            lines[i] = lines[i].replaceAll("  ", " ");
            lines[i] = lines[i].replaceAll(" \r", "");
            lines[i] = lines[i].replaceAll(" \n", "\n");

            if (lines[i].length < 3 || lines[i].charAt(0) == "#") continue;

            // vertices
            if (lines[i].charAt(0) == "o" && lines[i].charAt(1) == " ")
            {
                const parts = lines[i].split(" ");
                o.name = obj(parts[1] || "unknown");
                continue;
            }

            if (lines[i].charAt(0) == "v")
            {
                if (o.indexVerts.length > 0)
                {
                    // new object...
                    if (o.indexVerts.length > 0) objects.push(o);
                    o = obj("unknown");
                }

                // vertices
                if (lines[i].charAt(1) == " ")
                {
                    const parts = lines[i].split(" ");
                    o.verts.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    continue;
                }

                // texcoords
                if (lines[i].charAt(1) == "t" && lines[i].charAt(2) == " ")
                {
                    const parts = lines[i].split(" ");
                    o.texCoords.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    continue;
                }

                // normals
                if (lines[i].charAt(1) == "n" && lines[i].charAt(2) == " ")
                {
                    const parts = lines[i].split(" ");
                    o.vertNorms.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    continue;
                }
            }

            // faces
            if (lines[i].charAt(0) == "f" && lines[i].charAt(1) == " ")
            {
                const parts = lines[i].split(" ");
                parts.shift();
                while (parts[parts.length - 1] == "")
                {
                    parts.pop();
                }

                if (o.prim == 0) o.prim = parts.length;

                if (o.prim == 3 && parts.length == 3) // tris
                {
                    parseTri(parts, o);
                }
                else if (o.prim == 4 && parts.length == 4) // quads
                {
                    parseTri([parts[0], parts[1], parts[2]], o);
                    parseTri([parts[0], parts[2], parts[3]], o);
                }
                continue;
            }
        }
        objects.push(o);
    }

    op.log("objects", objects);

    let finalgeom = new CGL.Geometry("objfile");
    for (let io = 0; io < objects.length; io++)
    {
        const geom = new CGL.Geometry("objfile");
        geom.clear();

        let o = objects[io];
        op.log(o);

        if (o.indexVerts.length > 0)
        {
            let gVerts = [];
            let gNorms = [];
            let gTexCoords = [];
            let isIndexed = true;

            for (let i = 0; i < o.indexVerts.length; i++)
            {
                if (isIndexed)
                {
                    if (!(o.indexVerts[i] == o.indexNorms[i] && o.indexNorms[i] == o.indexTexcoords[i]))
                    {
                        op.log("false");
                        isIndexed = false;
                        break;
                    }
                }
            }

            op.log("isIndexed", isIndexed);
            if (isIndexed)
            {
                geom.verticesIndices = o.indexVerts;
                gNorms = o.vertNorms;

                gTexCoords = [];
                for (let i = 0; i < o.texCoords.length; i += 3)
                {
                    gTexCoords.push(o.texCoords[i + 0], o.texCoords[i + 1]);
                }
                gVerts = o.verts;
            }
            else
                for (let i = 0; i < o.indexVerts.length; i++)
                {
                    for (let j = 0; j < 3; j++)
                    {
                        gVerts.push(o.verts[o.indexVerts[i] * 3 + j]);

                        if (o.indexNorms.length > 0)gNorms.push(o.vertNorms[o.indexNorms[i] * 3 + j]);
                        if (o.indexTexcoords.length > 0 && j < 2)gTexCoords.push(o.texCoords[o.indexTexcoords[i] * 3 + j]);
                    }
                }

            geom.vertices = gVerts;
            geom.vertexNormals = gNorms;
            geom.texCoords = gTexCoords;

            if (geom.vertexNormals.length == 0)
            {
                geom.calculateNormals();
            }
        }
        finalgeom.merge(geom);
        // finalgeom = geom;
    }

    finalgeom.calcTangentsBitangents();

    outGeom.set(null);
    outGeom.set(finalgeom);

    outStatus.set(strStatus);
}
