let geometry = op.inObject("Geometry");
let outGeom = op.outObject("Result", null, "geometry");

geometry.onChange = update;

function update()
{
    outGeom.set(null);
    if (geometry.get())
    {
        let geom = geometry.get();
        let newGeom = new CGL.Geometry(op.name);

        let newVerts = [];
        let newFaces = [];
        let newNormals = [];
        let newTexCoords = [];

        let indices = geom.verticesIndices;
        if (!indices || !indices.length)
        {
            indices = [];
            for (let i = 0; i < geom.vertices.length / 3; i++) indices.push(i);
        }

        const hasNormals = geom.vertexNormals && geom.vertexNormals.length > 0;
        const hasTexCoords = geom.texCoords && geom.texCoords.length > 0;

        for (let i = 0; i < indices.length; i++)
        {
            const idx = indices[i];

            newFaces.push(newVerts.length / 3);
            newVerts.push(geom.vertices[idx * 3 + 0]);
            newVerts.push(geom.vertices[idx * 3 + 1]);
            newVerts.push(geom.vertices[idx * 3 + 2]);

            if (hasNormals)
            {
                newNormals.push(geom.vertexNormals[idx * 3 + 0]);
                newNormals.push(geom.vertexNormals[idx * 3 + 1]);
                newNormals.push(geom.vertexNormals[idx * 3 + 2]);
            }

            if (hasTexCoords)
            {
                newTexCoords.push(geom.texCoords[idx * 2 + 0]);
                newTexCoords.push(geom.texCoords[idx * 2 + 1]);
            }
        }

        newGeom.vertices = newVerts;
        newGeom.verticesIndices = newFaces;
        if (hasNormals) newGeom.vertexNormals = newNormals;
        else newGeom.calculateNormals();
        if (hasTexCoords) newGeom.setTexCoords(newTexCoords);

        outGeom.set(newGeom);
    }
}
