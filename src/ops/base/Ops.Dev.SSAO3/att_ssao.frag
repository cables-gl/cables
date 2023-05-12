
// https://theorangeduck.com/page/pure-depth-ssao

UNI sampler2D depthTex;
UNI sampler2D normalTex;
IN vec2 texCoord;


UNI float randomness;

UNI float foff;
UNI float area;
UNI float maxDist;

UNI float radius;
UNI float strength;
UNI float base;
// float radius=12.0;
// float total_strength=1.0;

{{MODULES_HEAD}}

{{CGL.RANDOM_TEX}}

vec3 saturate(vec3 v)
{
    return clamp(v,0.0,1.0);
}
vec2 saturate(vec2 v)
{
    return clamp(v,0.0,1.0);
}

float saturate(float v)
{
    return clamp(v,0.0,1.0);
}

#define SAMPLES 16

  vec3 sample_sphere[SAMPLES] = vec3[SAMPLES](
      vec3( 0.5381, 0.1856,-0.4319), vec3( 0.1379, 0.2486, 0.4430),
      vec3( 0.3371, 0.5679,-0.0057), vec3(-0.6999,-0.0451,-0.0019),
      vec3( 0.0689,-0.1598,-0.8547), vec3( 0.0560, 0.0069,-0.1843),
      vec3(-0.0146, 0.1402, 0.0762), vec3( 0.0100,-0.1924,-0.0344),
      vec3(-0.3577,-0.5301,-0.4358), vec3(-0.3169, 0.1063, 0.0158),
      vec3( 0.0103,-0.5869, 0.0046), vec3(-0.0897,-0.4940, 0.3287),
      vec3( 0.7119,-0.0154,-0.0918), vec3(-0.0533, 0.0596,-0.5411),
      vec3( 0.0352,-0.0631, 0.5460), vec3(-0.4776, 0.2847,-0.0271)
  );


vec3 normal_from_depth(float depth, vec2 texcoords)
{
    vec2 offset1 = vec2(0.0,1.0/float(textureSize(depthTex,0).x));
    vec2 offset2 = vec2(1.0/float(textureSize(depthTex,0).y),0.0);

    float depth1 = texture(depthTex, texcoords + offset1).r;
    float depth2 = texture(depthTex, texcoords + offset2).r;

    vec3 p1 = vec3(offset1, depth1 - depth);
    vec3 p2 = vec3(offset2, depth2 - depth);

    vec3 normal = cross(p1, p2);
    normal.z = -normal.z;
    normal=normalize(normal);

    return normal;
}

vec3 mynormal()
{
    float size=1.0;
    float pixelSize=3.0*(1.0/float(textureSize(depthTex,0).x));

    float strength=12.0;

    float tl = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2(-1.0, -1.0)).x);   // top left
    float  l = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2(-1.0,  0.0)).x);   // left
    float bl = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2(-1.0,  1.0)).x);   // bottom left
    float  t = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2( 0.0, -1.0)).x);   // top
    float  b = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2( 0.0,  1.0)).x);   // bottom
    float tr = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2( 1.0, -1.0)).x);   // top right
    float  r = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2( 1.0,  0.0)).x);   // right
    float br = abs(texture(depthTex, texCoord + (size*pixelSize) * vec2( 1.0,  1.0)).x);   // bottom right

    // Compute dx using Sobel:
    //           -1 0 1
    //           -2 0 2
    //           -1 0 1
    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;

    // Compute dy using Sobel:
    //           -1 -2 -1
    //            0  0  0
    //            1  2  1
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;

    // Build the normalized normal
    vec4 N = vec4(normalize(vec3(dX,dY, 1.0 / strength)), 1.0);
    // N= N * 0.5 + 0.5;

    N.z = -N.z;

    return N.rgb;
}


void main()
{
    float pixelSize=(1.0/float(textureSize(depthTex,0).x));
    float rad = radius*pixelSize;

    vec3 random=vec3(1.0,1.0,-0.1);
    random=(cgl_random3(texCoord)-0.5)*randomness;

    float depth = texture(depthTex, texCoord).r;

    vec3 position = vec3(texCoord, depth);

    vec3 normal;

    // normal = normal_from_depth(depth, texCoord);
    // vec3 normal=texture(normalTex,texCoord).rgb;
    normal=mynormal();

    float radius_depth = rad/depth*2.0;
    float occlusion = 0.0;

    for(int i=0; i < SAMPLES; i++)
    {
    // random=(cgl_random3(texCoord+float(i))-0.5)*randomness;
        vec3 ray = radius_depth * reflect(sample_sphere[i], random);
        vec3 hemi_ray = position + sign(dot(ray,normal)) * ray;

        float occ_depth = texture(depthTex, saturate(hemi_ray.xy)).r;
        float difference = depth - occ_depth;

        // occlusion += step(foff, difference) * (1.0-smoothstep(foff, area, difference));

        if(difference < maxDist)
            occlusion += smoothstep(foff, area, difference);
    }


    float ao = 1.0 - strength * occlusion * (1.0 / float(SAMPLES));

    vec4 col=vec4(1.0);
    col.rgb = vec3(saturate(ao + base));

    {{MODULE_COLOR}}
    // col.rgb=normal.rgb;
    outColor = col;
}




