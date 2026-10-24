export class QuadGeom
{
    static DOMAIN_POINT = "point";
    static DOMAIN_FACE = "face";
    static DOMAIN_CORNER = "corner";

    vertices = [];
    verticesIndices = [];
    attributes = {};

    constructor(name)
    {
        this.name = name || "unknown";
    }

    get numVertices()
    {
        return this.vertices.length / 3;
    }

    get numFaces()
    {
        return this.verticesIndices.length / 4;
    }

    addVertex(x, y, z)
    {
        this.vertices.push(x, y, z);
        return this.numVertices - 1;
    }

    addQuad(a, b, c, d)
    {
        this.verticesIndices.push(a, b, c, d);
        return this.numFaces - 1;
    }

    addTriangle(a, b, c)
    {
        return this.addQuad(a, b, c, c);
    }

    setAttribute(name, data, itemSize, domain)
    {
        this.attributes[name] = { "data": data, "itemSize": itemSize, "domain": domain };
    }

    getAttribute(name)
    {
        return this.attributes[name];
    }

    isTriangle(face)
    {
        return this.verticesIndices[face * 4 + 2] == this.verticesIndices[face * 4 + 3];
    }

    getEdges()
    {
        return this.getEdgeTopology().points;
    }

    getEdgeTopology()
    {
        const points = [];
        const faceCounts = [];
        const cornerEdges = new Int32Array(this.verticesIndices.length).fill(-1);
        const edgeIndex = new Map();
        const numVertices = this.numVertices;

        for (let face = 0; face < this.numFaces; face++)
        {
            for (let corner = 0; corner < 4; corner++)
            {
                const a = this.verticesIndices[face * 4 + corner];
                const b = this.verticesIndices[face * 4 + (corner + 1) % 4];
                if (a == b) continue;

                const key = Math.min(a, b) * numVertices + Math.max(a, b);
                let edge = edgeIndex.get(key);
                if (edge === undefined)
                {
                    edge = faceCounts.length;
                    edgeIndex.set(key, edge);
                    points.push(a, b);
                    faceCounts.push(0);
                }
                faceCounts[edge]++;
                cornerEdges[face * 4 + corner] = edge;
            }
        }
        return { "points": points, "faceCounts": faceCounts, "cornerEdges": cornerEdges };
    }

    copy()
    {
        const geom = new QuadGeom(this.name);
        geom.vertices = this.vertices.slice();
        geom.verticesIndices = this.verticesIndices.slice();
        for (const name in this.attributes)
        {
            const attr = this.attributes[name];
            geom.setAttribute(name, attr.data.slice(), attr.itemSize, attr.domain);
        }
        return geom;
    }
}
