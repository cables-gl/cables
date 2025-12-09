
IN vec3 vPosition;
IN vec3 attrVertNormal;

UNI float strength;
UNI float layer;
UNI float numLayers;
UNI float time;

UNI mat4 projMatrix;
UNI mat4 mvMatrix;


OUT vec3 normal;
OUT vec2 texCoord;
OUT vec2 texCoordMul;
IN vec2 attrTexCoord;


OUT float layerPerc;

{{MODULES_HEAD}}


vec4 fur(vec4 pos)
{

    float spacing=strength;
    vec3 gravity = vec3(0.0,-1.0,0.0);
	vec3 displacement = vec3(0.0,0.0,0.0);
	vec3 forceDirection = vec3(0.0,0.0,0.0);

	// "wind"
	forceDirection.x = sin(time+pos.x*0.05) * 0.2;
	forceDirection.y = cos(time*0.7+pos.y*0.04) * 0.2;
	forceDirection.z = sin(time*0.7+pos.y*0.04) * 0.2;

	// "gravity"
	displacement = gravity + forceDirection;

float offset=layer/numLayers;
layerPerc=offset;

	float displacementFactor = pow(offset, 3.0);

	vec3 aNormal = attrVertNormal;
	aNormal.xyz += displacement*displacementFactor;

	// move outwards depending on offset(layer) and normal+force+gravity
	pos.xyz = vec3( pos.x, pos.y, pos.z )+(normalize(aNormal)*offset*spacing);


normal=attrVertNormal;

//     float dist=layer*strength;
    
//     vec3 gravity=vec3(0.0,-1.0,0.0);
    
// 	float displacementFactor = pow(layer/numLayers, 3.0);
	
// 	displacementFactor*=12.0;
// 	//displacement = gravity;// + forceDirection;,
// 	vec3 tmpD = displacementFactor * gravity;
	
//     // 	pos.xyz+=tmpD;
// 	pos.xyz+=tmpD*normal;

//     // pos.xyz+=dist*(normal);
    return pos; 
}



void main()
{
    texCoordMul=attrTexCoord*22.0;
    texCoord=attrTexCoord;

    vec4 pos=vec4(vPosition,  1.0);
    pos=fur(pos);
    {{MODULE_VERTEX_POSITION}}
    gl_Position = projMatrix * mvMatrix * pos;
}
