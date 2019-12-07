
var gltfMesh=class
{
    constructor(m,gltf)
    {
        this.test=0;
        this.name=m.name;
        this.mesh=null;
        this.geom=new CGL.Geometry("gltf_"+this.name);
        this.geom.verticesIndices = [];

        const prims=m.primitives;

        for(var i=0;i<prims.length;i++)
        {
            const prim=prims[i];

            if(!prim.attributes)continue;

            if(prim.hasOwnProperty("indices")) this.geom.verticesIndices=gltf.accBuffers[prim.indices];

            this.fillGeomAttribs(gltf,this.geom,prim.attributes);

            if(prim.targets)
                for(var j=0;j<prim.targets.length;j++)
                {
                    var tgeom=new CGL.Geometry("gltf_"+this.name);
                    if(prim.hasOwnProperty("indices")) tgeom.verticesIndices=gltf.accBuffers[prim.indices];
                    this.fillGeomAttribs(gltf,tgeom,prim.targets[j]);

                    // {//calcnormals
                    //     this.morphGeom.vertices= new Float32Array(this.geom.vertices.length);
                    //     for(var i=0;i<this.morphGeom.vertices.length;i++)
                    //     {
                    //         this.morphGeom.vertices[i]=this.geom.vertices[i]+tgeom.vertices[i];
                    //     }

                    //     this.morphGeom.calculateNormals();
                    //     tgeom.vertexNormals=this.morphGeom.vertexNormals;
                    // }

                    this.geom.morphTargets.push(tgeom);
                }
        }

        this.morphGeom=this.geom.copy();
        this.bounds=this.geom.getBounds();
    }

    fillGeomAttribs(gltf,geom,attribs)
    {
        if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
        if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
        if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
        if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
        // todo calc bi tangents...?!
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

            if(this.geom.morphTargets.length)
            {
                this.test+=0.1;

                if(this.test>=this.geom.morphTargets.length)this.test=0;

                var mt=this.geom.morphTargets[Math.floor(this.test)];
                if(mt.vertices)
                {

                    for(var i=0;i<this.morphGeom.vertices.length;i++)
                    {
                        this.morphGeom.vertices[i]=this.geom.vertices[i]+mt.vertices[i];
                    }

                    this.mesh.updateVertices(this.morphGeom);
                    // this.mesh.updateNormals(this.morphGeom);
                }
            }
        }
    }

};