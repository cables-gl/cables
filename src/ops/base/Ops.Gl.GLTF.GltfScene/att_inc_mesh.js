
var gltfMesh=class
{
    constructor(name,prim,gltf)
    {
        this.test=0;
        this.name=name;
        this.material=prim.material;
        this.mesh=null;
        this.geom=new CGL.Geometry("gltf_"+this.name);
        this.geom.verticesIndices = [];

        if(prim.hasOwnProperty("indices")) this.geom.verticesIndices=gltf.accBuffers[prim.indices];

        this.fillGeomAttribs(gltf,this.geom,prim.attributes);

        if(prim.targets)
            for(var j=0;j<prim.targets.length;j++)
            {
                var tgeom=new CGL.Geometry("gltf_"+this.name);
                if(prim.hasOwnProperty("indices")) tgeom.verticesIndices=gltf.accBuffers[prim.indices];
                this.fillGeomAttribs(gltf,tgeom,prim.targets[j]);
                this.geom.morphTargets.push(tgeom);
            }

        this.morphGeom=this.geom.copy();
        this.bounds=this.geom.getBounds();

        // console.log("mesh bounds:",this.bounds._maxAxis);
    }

    fillGeomAttribs(gltf,geom,attribs)
    {
        if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
        if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
        if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
        if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];

        if(attribs.hasOwnProperty("COLOR_0"))geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];


        if(!geom.vertexNormals.length)geom.calculateNormals();
        geom.calcTangentsBitangents();

    }

    render(cgl,ignoreMaterial)
    {
        if(!this.geom)return;

        if(!this.mesh)
        {
            this.mesh=new CGL.Mesh(cgl,this.geom);
        }
        else
        {
            // update morphTargets
            if(this.geom.morphTargets.length)
            {
                this.test=time*11.7;

                if(this.test>=this.geom.morphTargets.length-1)this.test=0;

                const mt=this.geom.morphTargets[Math.floor(this.test)];
                const mt2=this.geom.morphTargets[Math.floor(this.test+1)];

                if(mt && mt.vertices)
                {
                    const fract=this.test%1;
                    for(var i=0;i<this.morphGeom.vertices.length;i++)
                    {
                        this.morphGeom.vertices[i]=
                            this.geom.vertices[i]+
                            (1.0-fract)*mt.vertices[i]+
                            fract*mt2.vertices[i];
                    }

                    this.mesh.updateVertices(this.morphGeom);
                }
            }


            if(!ignoreMaterial && this.material!=-1 && gltf.shaders[this.material])
            {
                cgl.pushShader(gltf.shaders[this.material]);
            }

            this.mesh.render(cgl.getShader(),ignoreMaterial);

            if(!ignoreMaterial && this.material!=-1 && gltf.shaders[this.material])
            {
                cgl.popShader();
            }


        }
    }

};