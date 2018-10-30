/*
SSAO GLSL shader v1.2
assembled by Martins Upitis (martinsh) (devlog-martinsh.blogspot.com)
original technique is made by Arkano22 (www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)

changelog:
1.2 - added fog calculation to mask AO. Minor fixes.
1.1 - added spiral sampling method from here:
(http://www.cgafaq.info/wiki/Evenly_distributed_points_on_sphere)

*/
precision highp float;

IN vec2 texCoord;

UNI sampler2D texDepth;
UNI sampler2D tex;
// const float bgl_RenderedTextureWidth=800.0;
// const float bgl_RenderedTextureHeight=600.0;

#define PI    3.14159265

UNI float width;
UNI float height;
// float width = 800.0; //texture width
// float height = 600.0; //texture height

// vec2 texCoord = texCoord.st;

//------------------------------------------
//general stuff

//make sure that these two values are the same for your camera, otherwise distances will be wrong.

// const float znear = 0.01; //Z-near
// const float zfar = 20.0; //Z-far
UNI float znear;
UNI float zfar;

//user variables
// const int SAMPLES = 16; //ao sample count
// UNI int SAMPLES;

// const float radius = 3.0; //ao radius
// const float aoclamp = 0.25; //depth clamp - reduces haloing at screen edges

UNI float radius;
UNI float aoclamp;
const bool noise = false; //use noise instead of pattern for sample dithering
const float noiseamount = 0.0002; //dithering amount

const float diffarea = 0.4; //self-shadowing reduction
const float gdisplace = 0.4; //gauss bell center

// const bool mist = false; //use mist?
// const float miststart = 0.0; //mist start
// const float mistend = 16.0; //mist end

// const bool onlyAO = false; //use only ambient occlusion pass?
// const float lumInfluence = 0.7; //how much luminance affects occlusion
UNI float lumInfluence;

//--------------------------------------------------------

vec2 rand(vec2 coord) //generating noise/pattern texture for dithering
{
	float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;
	float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;
	
	if (noise)
	{
		noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;
		noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;
	}
	return vec2(noiseX,noiseY)*noiseamount;
}

// float doMist()
// {
// 	float zdepth = texture2D(texDepth,texCoord.xy).x;
// 	float depth = -zfar * znear / (zdepth * (zfar - znear) - zfar);
// 	return clamp((depth-miststart)/mistend,0.0,1.0);
// }

float readDepth(in vec2 coord) 
{
	if (texCoord.x<0.0||texCoord.y<0.0) return 1.0;
	return (2.0 * znear) / (zfar + znear - texture2D(texDepth, coord ).x * (zfar-znear));
}

float compareDepths(in float depth1, in float depth2,inout int far)
{   
	float garea = 2.0; //gauss bell width    
	float diff = (depth1 - depth2)*100.0; //depth difference (0-100)
	//reduce left bell width to avoid self-shadowing 
	if (diff<gdisplace)
	{
	garea = diffarea;
	}else{
	far = 1;
	}
	
	float gauss = pow(2.7182,-2.0*(diff-gdisplace)*(diff-gdisplace)/(garea*garea));
	return gauss;
}

float calAO(float depth,float dw, float dh)
{   
	float dd = (1.0-depth)*radius;
	
	float temp = 0.0;
	float temp2 = 0.0;
	float coordw = texCoord.x + dw*dd;
	float coordh = texCoord.y + dh*dd;
	float coordw2 = texCoord.x - dw*dd;
	float coordh2 = texCoord.y - dh*dd;
	
	vec2 coord = vec2(coordw , coordh);
	vec2 coord2 = vec2(coordw2, coordh2);
	
	int far = 0;
	temp = compareDepths(depth, readDepth(coord),far);
	//DEPTH EXTRAPOLATION:
	if (far > 0)
	{
		temp2 = compareDepths(readDepth(coord2),depth,far);
		temp += (1.0-temp)*temp2;
	}
	
	return temp;
} 

void main(void)
{
	vec2 noise = rand(texCoord);
	float depth = readDepth(texCoord);
	
	float w = (1.0 / width)/clamp(depth,aoclamp,1.0)+(noise.x*(1.0-noise.x));
	float h = (1.0 / height)/clamp(depth,aoclamp,1.0)+(noise.y*(1.0-noise.y));
	
	float pw;
	float ph;
	
	float ao;
	
	float dl = PI*(3.0-sqrt(5.0));
	float dz = 1.0/float(SAMPLES);
	float l = 0.0;
	float z = 1.0 - dz/2.0;
	
	for (int i = 0; i <= SAMPLES; i ++)
	{     
		float r = sqrt(1.0-z);
		
		pw = cos(l)*r;
		ph = sin(l)*r;
		ao += calAO(depth,pw*w,ph*h);        
		z = z - dz;
		l = l + dl;
	}
	
	ao /= float(SAMPLES);
	ao = 1.0-ao;	
	
// 	if (mist)
// 	{
// 	ao = mix(ao, 1.0,doMist());
// 	}
	
	vec3 color = texture2D(tex,texCoord).rgb;
	
	vec3 lumcoeff = vec3(0.299,0.587,0.114);
	float lum = dot(color.rgb, lumcoeff);
	vec3 luminance = vec3(lum, lum, lum);
	
	vec3 final = vec3(color*mix(vec3(ao),vec3(1.0),luminance*lumInfluence));//mix(color*ao, white, luminance)
	
// 	if (onlyAO)
// 	{
// 	final = vec3(mix(vec3(ao),vec3(1.0),luminance*lumInfluence)); //ambient occlusion only
// 	}
	
	
	outColor= vec4(final,1.0); 
	
}