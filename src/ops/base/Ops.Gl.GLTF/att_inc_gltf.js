function readChunk(dv,bArr,arrayBuffer,offset)
{
    const chunk={};

    chunk.size=dv.getUint32(offset+0,le);
    chunk.type = new TextDecoder("utf-8").decode(bArr.subarray(offset+4, offset+4+4));

    if(chunk.type=="BIN\0")
    {
        chunk.dataView=new DataView(arrayBuffer,offset+8,chunk.size);
    }
    else
    if(chunk.type=="JSON")
    {
        const json = new TextDecoder("utf-8").decode(bArr.subarray(offset+8, offset+8+chunk.size));

        try
        {
            const obj=JSON.parse(json);
            console.log(obj);
            chunk.data=obj;
            outGenerator.set(obj.asset.generator);
        }
        catch(e)
        {
            console.log("could not parse json!");
        }
    }
    else
    {
        console.log("unknown chunk type",'_'+chunk.type+'_');
    }

    return chunk;
}

function parseGltf(arrayBuffer)
{
    var j=0,i=0;

    var gltf=
        {
            json:{},
            buffers:[],
            meshes:[],
            nodes:[]
        };

    if (!arrayBuffer) return;
    var byteArray = new Uint8Array(arrayBuffer);
    var pos=0;

    var string = new TextDecoder("utf-8").decode(byteArray.subarray(pos, 4));
    pos+=4;
    if(string!='glTF')
    {
        console.log("invalid glTF fileformat");
        return;
    }

    const dv=new DataView(arrayBuffer);
    const version=dv.getUint32(pos,le);
    pos+=4;
    const size=dv.getUint32(pos,le);
    pos+=4;

    outVersion.set(version);

    var chunks=[];

    chunks.push(readChunk(dv,byteArray,arrayBuffer,pos));
    pos+=chunks[0].size+CHUNK_HEADER_SIZE;
    gltf.json=chunks[0].data;

    chunks.push(readChunk(dv,byteArray,arrayBuffer,pos));

    var views=chunks[0].data.bufferViews;
    var accessors=chunks[0].data.accessors;
    if(views)
    {
        for(i=0;i<accessors.length;i++)
        {
            const acc=accessors[i];
            const view=views[acc.bufferView];

            var dataBuff=null;


// 5120 (BYTE)	1
// 5121(UNSIGNED_BYTE)	1
// 5122 (SHORT)	2

            if(acc.componentType==5126) // FLOAT
            {
                var numComps=0;

                if(acc.type=="VEC2")numComps=2;
                else if(acc.type=="VEC3")numComps=3;
                else if(acc.type=="VEC4")numComps=4;

                var stride=4;
                var num=view.byteLength/stride;

                if(view.byteStride)
                {
                    console.log('view.byteStride',view.byteStride,acc.type);
                    stride=view.byteStride;
                    num=(view.byteLength/view.byteStride)*numComps;
                }

                // num=view.byteLength/(view.byteStride||4);
                // console.log(num);

                dataBuff=new Float32Array(num);

                var pos=view.byteOffset;
                for(j=0;j<num;j++)
                {

                    dataBuff[j]=chunks[1].dataView.getFloat32(pos,le);

                    if(stride!=4)
                    {
                        if((j+1)%numComps==0)pos+=stride-(numComps*4);
                    }
                    pos+=4;
                }
            }
            else if(acc.componentType==5123) // UNSIGNED_SHORT
            {
                if(view.byteStride)
                {
                    console.log("STRIDE IN SHORTS");
                }

                const num=view.byteLength/2;
                dataBuff=new Uint32Array(num);

                for(j=0;j<num;j++)
                {
                    dataBuff[j]=chunks[1].dataView.getUint16(view.byteOffset+j*2,le);
                }
            }
            else
            {
                console.log("unknown component type",acc.componentType);
            }

            gltf.buffers.push(dataBuff);
        }
    }

    for(i=0;i<gltf.json.meshes.length;i++)
    {
        var mesh=new gltfMesh(gltf.json.meshes[i],gltf);
        gltf.meshes.push(mesh);
    }

    for(i=0;i<gltf.json.nodes.length;i++)
    {
        var node=new gltfNode(gltf.json.nodes[i],gltf);
        gltf.nodes.push(node);
    }

    return gltf;

}