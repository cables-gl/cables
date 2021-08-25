
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

        if(prim.hasOwnProperty("indices")) this.geom.verticesIndices=gltf.accBuffers[prim.indices]||[];


// if(true)
// {

// // function decodeDracoData(rawBuffer, decoder) {
// //   const buffer = new decoderModule.DecoderBuffer();
// //   buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
// //   const geometryType = decoder.GetEncodedGeometryType(buffer);

// //   let dracoGeometry;
// //   let status;
// //   if (geometryType === decoderModule.TRIANGULAR_MESH) {
// //     dracoGeometry = new decoderModule.Mesh();
// //     status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
// //   } else {
// //     const errorMsg = 'Error: Unknown geometry type.';
// //     console.error(errorMsg);
// //   }
// //   decoderModule.destroy(buffer);

// //   return dracoGeometry;
// // }

//     new DracoDecoderModule().then((m) =>{

//         return m;

//         }).then( (e)=>{

//           const f=new e.Decoder();
//           console.log("f",f);

//              const buffer = new e.DecoderBuffer();

//              console.log("CHIUNKDS")
//              console.log(gltf.chunks)


//              const dv=gltf.chunks[1].dataView;
//              console.log("dv",dv);
//              const idx=0;

//              const bv=gltf.chunks[0].data.bufferViews[idx];
//              console.log("bufferview",bv);

//             const dataBuff = gltf.chunks[0].dataView.getUint8(accPos, le);


//             buffer.Init("chunks[1].data.bufferViews",gltf.accBuffers[bv.buffer], bv.byteLength);

//             console.log("buffer",buffer);

//             const g=f.DecodeBufferToMesh(
//                 buffer// gltf.accBuffers[prim.attributes.POSITION]
//                 );


//                 console.log("g",g,g.error_msg());
//                 console.log("f",f.GetAttributeFloat(prim.attributes.POSITION));
//         });
//         // ).then(d )

//     //   const decoder = new DracoDecoderModule;
//     //   const decodedGeometry = decodeDracoData(data, decoder);
//     //   // Encode mesh
//     //   encodeMeshToFile(decodedGeometry, decoder);

//     //   decoderModule.destroy(decoder);
//     //   decoderModule.destroy(decodedGeometry);
// }



{
    console.log("!!!!!!DracoDecoderModule");

    new DracoDecoderModule().then((m) =>
    {
        return m;
    }).then(
        (e)=>
    {
        const f=new e.Decoder();
        console.log("f",f);


        //  console.log("CHIUNKDS")
        //  console.log(gltf.chunks)


        //  const dv=gltf.chunks[1].dataView;
        //  console.log("dv",dv);
        //  const idx=0;

        //  const bv=gltf.chunks[0].data.bufferViews[idx];
        //  console.log("bufferview",bv);
        // const buffview=1;
        // const view = views[buffview];
        // let accPos = (view.byteOffset || 0);// + (acc.byteOffset || 0);
        // const num = acc.count * numComps;

        // console.log("views[0]",views[0]);
        // const dataBuff = views[0].getUint8(accPos, le);



const view =gltf.chunks[0].data.bufferViews[0];
console.log("view",view);
        const num = view.byteLength;
        const dataBuff = new Int8Array(num);

// console.log("acc",acc)


        // stride = stride || 4;
        const stride=0;

        // const isInt = acc.componentType == 5125;

let accPos = (view.byteOffset || 0) ;//+ (acc.byteOffset || 0);
// let stride = view.byteStride || 0;

        for (let j = 0; j < num; j++)
        {
            // if (isInt)
            dataBuff[j] = gltf.chunks[1].dataView.getInt8(accPos, le);
            // else dataBuff[j] = chunks[1].dataView.getFloat32(accPos, le);

            // if (stride != 4 && (j + 1) % numComps === 0)accPos += stride - (numComps * 4);
            accPos++;

        }

        console.log("dataBuff",dataBuff);
        const geometryType = f.GetEncodedGeometryType(dataBuff);
        console.log("geometryType",geometryType);

        const buffer = new e.DecoderBuffer();
        buffer.Init(dataBuff, dataBuff.byteLength);

// chunks[1].dataView.getFloat32(accPos, le);

        console.log("buffer",buffer);

        // console.log("views",views[0])


        let outputGeometry = new e.Mesh();
        const status=f.DecodeBufferToMesh( buffer ,outputGeometry);

        console.log("outputGeometry",outputGeometry)
        console.log("status ",status.ok());
        console.log("status",status.error_msg());

		const attribute = f.GetAttributeByUniqueId( outputGeometry, 1 );
		console.log("attribute",attribute);

		dracoAttributes(e,f,outputGeometry,geometryType,this);

    });
}

        if(this.geom.vertices.length>0)
        {

            this.fillGeomAttribs(gltf,this.geom,prim.attributes);

            if(prim.targets)
                for(var j=0;j<prim.targets.length;j++)
                {
                    // var tgeom=new CGL.Geometry("gltf_"+this.name);
                    let tgeom=this.geom.copy();

                    if(prim.hasOwnProperty("indices")) tgeom.verticesIndices=gltf.accBuffers[prim.indices]||[];
                    this.fillGeomAttribs(gltf,tgeom,prim.targets[j]);

                    // console.log( Object.keys(prim.targets[j]) );


                    { // calculate normals for final position of morphtarget for later...
                        for(let i=0;i<tgeom.vertices.length;i++) tgeom.vertices[i]+= this.geom.vertices[i];
                        tgeom.calculateNormals();
                        for(let i=0;i<tgeom.vertices.length;i++) tgeom.vertices[i]-=this.geom.vertices[i];
                    }


                    this.geom.morphTargets.push(tgeom);
                }

            this.morphGeom=this.geom.copy();
            this.bounds=this.geom.getBounds();
        }

    }

    fillGeomAttribs(gltf,geom,attribs)
    {
        if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
        if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
        if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
        if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
        if(attribs.hasOwnProperty("COLOR_0"))geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];



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

        if(!geom.vertexNormals || !geom.vertexNormals.length || inCalcNormals.get()) geom.calculateNormals();

        if( (!geom.biTangents || geom.biTangents.length==0) && geom.tangents)
        {
            const bitan=vec3.create();
            const tan=vec3.create();

            const tangents=geom.tangents;
            geom.tangents=new Float32Array(tangents.length/4*3);
            geom.biTangents=new Float32Array(tangents.length/4*3);

            if(tangents)
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
            // console.log("no mesh",this.geom)
            let g=this.geom;
            if(this.geom.vertices.length/3>64000)
            {
                g=this.geom.copy();
                g.unIndex(false,true);
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
                    for(let i=0;i<this.morphGeom.vertices.length;i++)
                    {
                        this.morphGeom.vertices[i]=
                            this.geom.vertices[i]+
                            (1.0-fract)*mt.vertices[i]+
                            fract*mt2.vertices[i];

                        this.morphGeom.vertexNormals[i]=
                            (1.0-fract)*mt.vertexNormals[i]+
                            fract*mt2.vertexNormals[i];
                    }

                    this.mesh.updateNormals(this.morphGeom);
                    this.mesh.updateVertices(this.morphGeom);
                }
            }

            const useMat=!ignoreMaterial && this.material!=-1 && gltf.shaders[this.material];

            if(useMat) cgl.pushShader(gltf.shaders[this.material]);

            this.mesh.render(cgl.getShader(),ignoreMaterial);

            if(useMat) cgl.popShader();
        }
    }

};
