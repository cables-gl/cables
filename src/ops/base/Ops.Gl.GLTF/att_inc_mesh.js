
var gltfMesh=class
{
    constructor(m,gltf)
    {
        this.name=m.name;
        this.mesh=null;
        this.geom=new CGL.Geometry("gltf_"+this.name);
        this.geom.verticesIndices = [];

        const prims=m.primitives;

        for(var i=0;i<prims.length;i++)
        {
            if(!prims[i].attributes)continue;

            if(prims[i].hasOwnProperty("indices"))
            {
                this.geom.verticesIndices=gltf.buffers[prims[i].indices];
            }

            if(prims[i].attributes.hasOwnProperty("POSITION"))
            {
                this.geom.vertices=gltf.buffers[prims[i].attributes.POSITION];
            }

            if(prims[i].attributes.hasOwnProperty("NORMAL"))
            {
                this.geom.vertexNormals=gltf.buffers[prims[i].attributes.NORMAL];
            }
        }
    }

    render(cgl)
    {
        if(!this.geom)return;

        if(!this.mesh)
        {
            this.mesh=new CGL.Mesh(cgl,this.geom);
        }
        else
        {
            this.mesh.render(cgl.getShader());
        }
    }

};