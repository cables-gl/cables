var gltfMeshGroup=class
{
    constructor(gltf,m)
    {
        this.meshes=[];
        this.name=m.name;
        const prims=m.primitives;

        for(var i=0;i<prims.length;i++)
        {
            var mesh=new gltfMesh(this.name+' '+i,prims[i],gltf);
            this.meshes.push(mesh);
        }
    }

    render(cgl, ignoreMat)
    {
        for(var i=0;i<this.meshes.length;i++)
        {
            this.meshes[i].render(cgl,ignoreMat);
        }

    }
};
