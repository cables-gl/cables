
function dracoAttributes(draco,decoder,dracoGeometry,geometryType,gltfMesh)

// if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
// if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
// if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
// if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
// if(attribs.hasOwnProperty("COLOR_0"))geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];


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
		let attributeID; // A Draco file may be created with default vertex attributes, whose attribute IDs
		// are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
		// a Draco file may contain a custom set of attributes, identified by known unique
		// IDs. glTF files always do the latter, and `.drc` files typically do the former.

// 		if ( taskConfig.useUniqueIDs ) {

// 			attributeID = attributeIDs[ attributeName ];
// 			attribute = decoder.GetAttributeByUniqueId( dracoGeometry, attributeID );

// 		} else {

			attributeID = decoder.GetAttributeId( dracoGeometry, count );
			count++;
			if ( attributeID === - 1 ) continue;

			attribute = decoder.GetAttribute( dracoGeometry, attributeID );
			console.log("attribute",attribute,attributeID,attributeIDs[ attributeName ])

// 		}

		geometry.attributes.push( decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );




	} // Add index.


	if ( geometryType === draco.TRIANGULAR_MESH ) {

		geometry.index = decodeIndex( draco, decoder, dracoGeometry );

	}

	console.log(geometry);

	const geom=gltfMesh.geom=new CGL.Geometry("draco mesh "+gltfMesh.name);

	for(let i=0;i<geometry.attributes.length;i++)
	{
	    if(geometry.attributes[i].name=="position") geom.vertices=geometry.attributes[i].array;
	    else if(geometry.attributes[i].name=="normal") geom.vertexNormals=geometry.attributes[i].array;
	    else if(geometry.attributes[i].name=="uv") geom.texCoords=geometry.attributes[i].array;
	   // else if(geometry.attributes[i].name=="color") geom.vertexColors=geometry.attributes[i].array;
	    else console.log("unknown draco attrib" , geometry.attributes[i]);
	}

	geom.verticesIndices=geometry.index.array

// if(attribs.hasOwnProperty("POSITION"))geom.vertices=gltf.accBuffers[attribs.POSITION];
// if(attribs.hasOwnProperty("NORMAL"))geom.vertexNormals=gltf.accBuffers[attribs.NORMAL];
// if(attribs.hasOwnProperty("TEXCOORD_0"))geom.texCoords=gltf.accBuffers[attribs.TEXCOORD_0];
// if(attribs.hasOwnProperty("TANGENT"))geom.tangents=gltf.accBuffers[attribs.TANGENT];
// if(attribs.hasOwnProperty("COLOR_0"))geom.vertexColors=gltf.accBuffers[attribs.COLOR_0];




	draco.destroy( dracoGeometry );

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

console.log(attributeName,numComponents,attributeType,numPoints,"byteLength",byteLength,dataType)


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
