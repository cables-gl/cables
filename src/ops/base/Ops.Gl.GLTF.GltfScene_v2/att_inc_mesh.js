
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
    }
    fillGeomAttribs(gltf,geom,attribs)
    {
        if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
        if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
        if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
        if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
        if(attribs.hasOwnProperty("COLOR_0"))
        {


            // if( gltf.accBuffers[attribs.COLOR_0] instanceof Uint16Array)
            // {
            //     // const newBuff=new Uin
            //     console.log("YES 16!");

            //     const sixtyfour=(256*256)-1;

            //     geom.vertexColors=new Float32Array(gltf.accBuffers[attribs.COLOR_0].length);
            //     // geom.vertexColors=Float32Array.from(gltf.accBuffers[attribs.COLOR_0]);
            //     // console.log(geom.vertexColors);

            //     for(let i=0;i<geom.vertexColors.length;i++)
            //     {
            //         geom.vertexColors[i]=gltf.accBuffers[attribs.COLOR_0]/sixtyfour;

            //     }

            // }
            // else
            // {
                geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];

            // }


            console.log("geom.vertexColors",geom.vertexColors)
        }

// Implementation note: When normals and tangents are specified,
// client implementations should compute the bitangent by taking
// the cross product of the normal and tangent xyz vectors and
// multiplying against the w component of the tangent:
// bitangent = cross(normal, tangent.xyz) * tangent.w

        if(inNormFormat.get()=="X-ZY")
        {
            for(let i=0;i<geom.vertexNormals.length;i+=3)
            {
                let t=geom.vertexNormals[i+2];
                geom.vertexNormals[i+2]=geom.vertexNormals[i+1];
                geom.vertexNormals[i+1]=-t;
            }

            // for(let i=0;i<geom.tangents.length;i+=3)
            // {
            //     let t=geom.tangents[i+2];
            //     geom.tangents[i+2]=geom.tangents[i+1];
            //     geom.tangents[i+1]=-t;

            // }
        }


        if(inVertFormat.get()=="XZ-Y")
        {
            for(let i=0;i<geom.vertices.length;i+=3)
            {
                let t=geom.vertices[i+2];
                geom.vertices[i+2]=-geom.vertices[i+1];
                geom.vertices[i+1]=t;
            }
        }

        if(!geom.vertexNormals.length || inCalcNormals.get()) geom.calculateNormals();

        if( (!geom.biTangents || geom.biTangents.length==0) && geom.tangents)
        {
            const bitan=vec3.create();
            const tan=vec3.create();

            const tangents=geom.tangents;
            geom.tangents=new Float32Array(tangents.length/4*3);
            geom.biTangents=new Float32Array(tangents.length/4*3);

            for(let i=0;i<tangents.length;i+=4)
            {
                const idx=i/4*3;

                vec3.cross(
                    bitan,
                    [geom.vertexNormals[idx],geom.vertexNormals[idx+1],geom.vertexNormals[idx+2] ],
                    [tangents[i],tangents[i+1],tangents[i+2]]
                    );

                vec3.div(bitan,bitan,[tangents[i+3],tangents[i+3],tangents[i+3]]);
                vec3.normalize(bitan,bitan);

                geom.biTangents[idx+0]=bitan[0];
                geom.biTangents[idx+1]=bitan[1];
                geom.biTangents[idx+2]=bitan[2];

                geom.tangents[idx+0]=tangents[i+0];
                geom.tangents[idx+1]=tangents[i+1];
                geom.tangents[idx+2]=tangents[i+2];
            }
        }

        if(geom.tangents.length===0 || inCalcNormals.get())  geom.calcTangentsBitangents();

    }

    render(cgl,ignoreMaterial)
    {
        if(!this.geom)return;

        if(!this.mesh)
        {
            let g=this.geom;
            if(this.geom.vertices.length/3>64000)
            {
                g=this.geom.copy();
                g.unIndex();
            }

            this.mesh=new CGL.Mesh(cgl,g);

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


            const useMat=!ignoreMaterial && this.material!=-1 && gltf.shaders[this.material];

            // console.log(gltf.shaders);
            // console.log(this.material);

            if(useMat) cgl.pushShader(gltf.shaders[this.material]);

            this.mesh.render(cgl.getShader(),ignoreMaterial);

            if(useMat) cgl.popShader();

        }
    }

};
