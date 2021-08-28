function dracoLoadMesh(view,name,next)
{
    // console.log("!!!!!!DracoDecoderModule");

    new DracoDecoderModule().then( (m) =>
    {
        return m;
    }).then( (e)=>
    {
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

    });
}

function dracoAttributes(draco,decoder,dracoGeometry,geometryType,name)
{

	const attributeIDs = {
		position: 'POSITION',
		normal: 'NORMAL',
		color: 'COLOR',
		uv: 'TEX_COORD'
	};
	const attributeTypes = {
		position: 'Float32Array',
		normal: 'Float32Array',
		color: 'Float32Array',
		uv: 'Float32Array'
	};

// const attributeIDs=[0,1,2];


	const geometry = {
		index: null,
		attributes: []
	}; // Gather all vertex attributes.

    let count=0;
	for ( const attributeName in attributeIDs ) {

		const attributeType = attributeTypes[ attributeName ];
		let attribute;
		let attributeID;


		attributeID = decoder.GetAttributeId( dracoGeometry, count );
		count++;
		if ( attributeID === - 1 ) continue;

		attribute = decoder.GetAttribute( dracoGeometry, attributeID );

		geometry.attributes.push( decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );
	}

	if ( geometryType === draco.TRIANGULAR_MESH ) {
		geometry.index = decodeIndex( draco, decoder, dracoGeometry );
	}

// 	console.log(geometry);

	const geom=new CGL.Geometry("draco mesh "+name);

	for(let i=0;i<geometry.attributes.length;i++)
	{
	    if(geometry.attributes[i].name=="position") geom.vertices=geometry.attributes[i].array;
	    else if(geometry.attributes[i].name=="normal") geom.vertexNormals=geometry.attributes[i].array;
	    else if(geometry.attributes[i].name=="uv") geom.texCoords=geometry.attributes[i].array;
	   // else if(geometry.attributes[i].name=="color") geom.vertexColors=geometry.attributes[i].array;
	    else console.log("unknown draco attrib" , geometry.attributes[i]);
	}

	geom.verticesIndices=geometry.index.array;

// if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
// if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
// if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
// if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
// if(attribs.hasOwnProperty("COLOR_0"))geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];

    // console.log("geom",geom)


	draco.destroy( dracoGeometry );
    return geom;

}


		function decodeIndex( draco, decoder, dracoGeometry ) {

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

		function decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) {

			const numComponents = attribute.num_components();
			const numPoints = dracoGeometry.num_points();
			const numValues = numPoints * numComponents;
			const byteLength = numValues * 4;//attributeType.BYTES_PER_ELEMENT;
			const dataType = getDracoDataType( draco, attributeType );

			const ptr = draco._malloc( byteLength );

            // console.log(attributeName,numComponents,attributeType,numPoints,"byteLength",byteLength,dataType)


            if(attributeType!="Float32Array") console.log("draco unknown attrib type",attributeType);

			decoder.GetAttributeDataArrayForAllPoints( dracoGeometry, attribute, dataType, byteLength, ptr );
			const array = new Float32Array( draco.HEAPF32.buffer, ptr, numValues ).slice();

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
