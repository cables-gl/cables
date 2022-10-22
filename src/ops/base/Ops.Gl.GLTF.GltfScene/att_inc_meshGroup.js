let gltfMeshGroup = class
{
    constructor(gltf, m)
    {
        this.bounds = new CABLES.CG.BoundingBox();
        this.meshes = [];
        this.name = m.name;
        const prims = m.primitives;

        for (let i = 0; i < prims.length; i++)
        {
            let mesh = new gltfMesh(this.name, prims[i], gltf);
            this.meshes.push(mesh);
            this.bounds.apply(mesh.bounds);
        }

        // console.log("mesh group bounds:",this.bounds._maxAxis);
    }

    render(cgl, ignoreMat)
    {
        for (let i = 0; i < this.meshes.length; i++)
        {
            this.meshes[i].render(cgl, ignoreMat);
        }
    }
};
