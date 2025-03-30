UNI sampler2D tex;
UNI sampler2D texMask;
UNI float radius;
UNI float amount;
UNI float width;


#define SAMPLES 20.
IN vec2 texCoord;

vec2 hash2(vec2 p)
{
	return normalize(fract(cos(p*mat2(195,174,286,183))*742.)-.5711);
}

{{MODULES_HEAD}}

{{CGL.BLENDMODES3}}


void main()
{
    float texel=1.0/width;
    vec4 col=vec4(1.0,1.0,1.0,1.0);
    vec4 base=texture(tex,texCoord);

	//Initialize blur output color
	vec4 blur = vec4(0);
	//Total weight from all samples
	float total = 0.;

	//First sample offset scale
	float scale = radius/sqrt(SAMPLES);
	//Pseudo-random sample direction
	vec2 point = hash2(texCoord)*scale;
	//Try without noise here:
	//vec2 point = vec2(scale,0);

	//Radius iteration variable
	float rad = 1.;
	//Golden angle rotation matrix
	mat2 ang = mat2(-0.7373688, -0.6754904, 0.6754904,  -0.7373688);

	//Look through all the samples
	for(float i = 0.;i<SAMPLES;i++)
	{
		//Rotate point direction
		point *= ang;
		//Iterate radius variable. Approximately 1+sqrt(i)
		rad += 1./rad;

		//Get sample coordinates
		vec2 coord = texCoord + point*(rad-1.)*texel;
		//Set sample weight
		float weight = 1./rad;
		//Sample texture
		vec4 samp = texture(tex,coord);

		//Add sample and weight totals
		blur += samp * weight;
		total += weight;
	}
	//Divide the blur total by the weight total
	blur /= total;


    {{MODULE_COLOR}}
    float am=amount;
    #ifdef USE_MASK
        float m=texture(texMask,texCoord).r;

        #ifdef MASK_INVERT
            m=1.0-m;
        #endif

        am*=m;

    #endif

    outColor=cgl_blendPixel(base,col * blur,am);

}
