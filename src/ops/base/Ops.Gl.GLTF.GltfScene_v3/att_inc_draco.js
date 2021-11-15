function dracoLoadMesh(view,name,next)
{
    // console.log("!!!!!!DracoDecoderModule");

    // console.log("start dracoloadmesh.... ",name);
    new DracoDecoderModule().then( (m) =>
    {
        return m;
    }).then( (e)=>
    {
        // console.log("dracoloadmesh finished",name);
        const f=new e.Decoder();


        // console.log("f",f);
        // const view =gltf.chunks[0].data.bufferViews[0];
        // console.log("view",view);
        const num = view.byteLength;
        const dataBuff = new Int8Array(num);

        const stride=0;

        let accPos = (view.byteOffset || 0) ;//+ (acc.byteOffset || 0);

        for (let j = 0; j < num; j++)
        {
            // if (isInt)
            dataBuff[j] = gltf.chunks[1].dataView.getInt8(accPos, le);
            // else dataBuff[j] = chunks[1].dataView.getFloat32(accPos, le);

            // if (stride != 4 && (j + 1) % numComps === 0)accPos += stride - (numComps * 4);
            accPos++;

        }

        // console.log("dataBuff",dataBuff);
        const geometryType = f.GetEncodedGeometryType(dataBuff);
        // console.log("geometryType",geometryType);

        const buffer = new e.DecoderBuffer();
        buffer.Init(dataBuff, dataBuff.byteLength);

        // console.log("buffer",buffer);

        let outputGeometry = new e.Mesh();
        const status=f.DecodeBufferToMesh(buffer,outputGeometry);

        // console.log("outputGeometry",outputGeometry);
        // console.log("status ",status.ok());
        // console.log("status",status.error_msg());

		const attribute = f.GetAttributeByUniqueId( outputGeometry, 1 );
// 		console.log("attribute",attribute);

		const geom=dracoAttributes(e,f,outputGeometry,geometryType,name);

		next(geom);

        e.destroy(f);
        e.destroy(buffer);
        // f.destroy(dracoGeometry);
        // e.destroy();
    });
}

function dracoAttributes(draco,decoder,dracoGeometry,geometryType,name)
{

	const attributeIDs = {
		position: draco.POSITION,
		normal: draco.NORMAL,
		color: draco.COLOR,
		uv: draco.TEX_COORD,
		joints: draco.GENERIC,
		weights: draco.GENERIC,
	};
	const attributeTypes = {
		position: 'Float32Array',
		normal: 'Float32Array',
		color: 'Float32Array',
		weights: 'Float32Array',
		joints: 'Uint8Array',
		uv: 'Float32Array'
	};

	const geometry = {
		index: null,
		attributes: []
	}; // Gather all vertex attributes.

    let count=0;
	for ( const attributeName in attributeIDs ) {

		const attributeType = attributeTypes[ attributeName ];

		let attributeID = decoder.GetAttributeId( dracoGeometry, attributeIDs[attributeName] );
		count++;
		if ( attributeID != - 1 )
		{
    		let attribute = decoder.GetAttribute( dracoGeometry, attributeID );
    		geometry.attributes.push( decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );
		}
	}

	if ( geometryType === draco.TRIANGULAR_MESH ) {
		geometry.index = decodeIndex( draco, decoder, dracoGeometry );
	}

	const geom=new CGL.Geometry("draco mesh "+name);

	for(let i=0;i<geometry.attributes.length;i++)
	{
	    const attr=geometry.attributes[i];

	    if(attr.name=="position") geom.vertices=attr.array;
	    else if(attr.name=="normal") geom.vertexNormals=attr.array;
	    else if(attr.name=="uv") geom.texCoords=attr.array;
	    else if(attr.name=="weights")
	    {
	        const arr4=new Float32Array(attr.array.length/attr.itemSize*4);

	        for(let k=0;k<attr.array.length/attr.itemSize;k++)
	        {
	            arr4[k*4+0]=arr4[k*4+1]=arr4[k*4+2]=arr4[k*4+3]=0;
	            for(let j=0;j<attr.itemSize;j++)
	            {
	                arr4[k*4+j]=attr.array[k*attr.itemSize+j];
	            }
	        }
	        geom.setAttribute("attrWeights", arr4, 4);
	    }
	    else if(attr.name=="joints")
	    {
	        geom.setAttribute("attrJoints", Array.from(attr.array), 4);
	    }
	    else console.log("unknown draco attrib" , attr);
	}

	geom.verticesIndices=geometry.index.array;



	draco.destroy( dracoGeometry );
    return geom;

}


function decodeIndex( draco, decoder, dracoGeometry )
{
	const numFaces = dracoGeometry.num_faces();
	const numIndices = numFaces * 3;
	const byteLength = numIndices * 4;

	const ptr = draco._malloc( byteLength );

	decoder.GetTrianglesUInt32Array( dracoGeometry, byteLength, ptr );
	const index = new Uint32Array( draco.HEAPF32.buffer, ptr, numIndices ).slice();

	draco._free( ptr );

	return {
		array: index,
		itemSize: 1
	};

}

function decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute )
{
    let bytesPerElement=4;
    if(attributeType=="Float32Array")bytesPerElement=4;
    else if(attributeType=="Uint8Array")bytesPerElement=1;
    else console.log("unknown attrtype bytesPerElement",attributeType);

	const numComponents = attribute.num_components();
	const numPoints = dracoGeometry.num_points();
	const numValues = numPoints * numComponents;
	const byteLength = numValues * bytesPerElement;
	const dataType = getDracoDataType( draco, attributeType );
	const ptr = draco._malloc( byteLength );

	decoder.GetAttributeDataArrayForAllPoints( dracoGeometry, attribute, dataType, byteLength, ptr );

	let array=null;


	if(attributeType=="Float32Array") array = new Float32Array( draco.HEAPF32.buffer, ptr, numValues ).slice();
	else if(attributeType=="Uint8Array") array = new Uint8Array( draco.HEAPF32.buffer, ptr, numValues ).slice();
	else console.log("unknown attrtype",attributeType);

	draco._free( ptr );

	return {
		name: attributeName,
		array: array,
		itemSize: numComponents
	};

}

function getDracoDataType( draco, attributeType ) {

	switch ( attributeType ) {

		case "Float32Array":
			return draco.DT_FLOAT32;

		case "Int8Array":
			return draco.DT_INT8;

		case "Int16Array":
			return draco.DT_INT16;

		case "Int32Array":
			return draco.DT_INT32;

		case "Uint8Array":
			return draco.DT_UINT8;

		case "Uint16Array":
			return draco.DT_UINT16;

		case "Uint32Array":
			return draco.DT_UINT32;
	}

}
