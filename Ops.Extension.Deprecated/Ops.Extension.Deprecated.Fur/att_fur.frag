
IN vec2 texCoord;
IN vec2 texCoordMul;
IN vec3 normal;
UNI sampler2D texStructure;
UNI sampler2D texColor;
UNI sampler2D texLength;
IN float layerPerc;

{{MODULE_BEGIN_FRAG}}

void main()
{
    vec4 col=vec4(1.0,1.0,0.0,1.0);
    
    float lengthMask=texture(texLength,vec2(texCoord.x,(1.0-texCoord.y))).r;
    
    if(layerPerc>lengthMask)
        discard;


    vec4 hairColor=texture(texStructure,vec2(texCoordMul.x,(1.0-texCoordMul.y)));
    col=texture(texColor,vec2(texCoord.x,(1.0-texCoord.y)));


	if (hairColor.a <= 0.0 || hairColor.g < layerPerc) {
		discard;
	}


// col.rgb=vec3(1.0,1.0,1.0);
// col.rgb*=0.7;
	
// 	float shadow = mix(0.0,col.r*1.2,(layerPerc));
	float shadow = mix(0.5,hairColor.b*2.5,layerPerc);
	shadow*=1.0;
// 	float shadow=hairColor.b;

// 	col.rgb*=shadow;;

// 	vec3 light = vec3(0.1,1.0,0.3);

// 	float d = pow(max(0.25,dot(normal.xyz, light))*2.75, 1.4);

// d=1.0;
    col=vec4(col.xyz*shadow, layerPerc);


// col=vec4(layerPerc,0.0,0.0,1.0);

	
// col.rgb=vec3(1.0-layerPerc);

    

// col.rgb=vec3(layerPerc);

    // col.a=col.r*(1.0-layerPerc);
    
    col.a=(1.0-layerPerc);
    // col.a=col.r*(1.0-layerPerc)*0.9;
    // col.a*=alpha*0.8;
    // col.a*=col.r;


   {{MODULE_COLOR}}
   outColor= col;
}
