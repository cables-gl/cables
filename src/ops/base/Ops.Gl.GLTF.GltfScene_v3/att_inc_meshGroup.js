const gltfMeshGroup = class
{
    constructor(gltf, m)
    {
        this.bounds = new CGL.BoundingBox();
        this.meshes = [];
        this.name = m.name;
        const prims = m.primitives;

        for (let i = 0; i < prims.length; i++)
        {
            const mesh = new gltfMesh(this.name, prims[i], gltf,
                (mesh) =>
                {
                    this.bounds.apply(mesh.bounds);
                });

            this.meshes.push(mesh);
        }

        // console.log("mesh group bounds:",this.bounds._maxAxis);
    }

    render(cgl, ignoreMat,skinRenderer)
    {
        for (let i = 0; i < this.meshes.length; i++)
        {

            const useMat =  gltf.shaders[this.meshes[i].material];

            if (useMat) cgl.pushShader(gltf.shaders[this.meshes[i].material]);
            // console.log(gltf.shaders[this.meshes[i].material],this.meshes[i].material)
                if(skinRenderer)skinRenderer.renderStart(cgl,skinRenderer._time);


            this.meshes[i].render(cgl, ignoreMat,skinRenderer);
                if(skinRenderer)skinRenderer.renderFinish(cgl);
            if (useMat) cgl.popShader();

        }
    }
};
