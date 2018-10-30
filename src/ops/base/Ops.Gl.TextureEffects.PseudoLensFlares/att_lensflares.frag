UNI sampler2D tex;
// UNI sampler2D texInput;
UNI float haloWidth;
UNI int numGhosts;
UNI float dispersal;
UNI float amountGhosts;
UNI float amountHalo;
UNI sampler2D texLookup;

in vec2 texCoord;

vec3 lumi(vec3 c)
{
   return vec3(sqrt(c.r*c.r*0.241+c.g*c.g*0.691+c.b*c.b*0.068));
}

vec4 myTexture(sampler2D tex,vec2 coords)
{
    vec4 c=texture(tex, coords);
    c.rgb=lumi(c.rgb);
    return c;
}

void main()
{
    vec2 texcoord = -texCoord + vec2(1.0);
    // vec2 texelSize = 1.0 / vec2(textureSize(texInput, 0));
    vec2 ghostVec = (vec2(0.5) - texcoord) * (0.5*dispersal);
    vec4 result = vec4(0.0,0.0,0.0,1.0);//texture(tex,texCoord);
    

    
    // ghosts
    for (int i = 0; i < numGhosts; ++i)
    {
        vec2 offset = fract(texcoord + ghostVec * float(i));
        float weightA = length(vec2(0.5) - offset) / length(vec2(0.5));
        weightA = pow(1. - weightA, 10.0);
        result += myTexture(tex, offset)*weightA*amountGhosts;
    }

    // halo
    vec2 haloVec = normalize(ghostVec) * haloWidth;
    float weight = length(vec2(0.5) - fract(texcoord + haloVec)) / length(vec2(0.5));
    
    weight = pow(1.0 - weight, 5.0);
    result += myTexture(tex, texcoord + haloVec) * weight * amountHalo;

    #ifdef TEX_LOOPUP
        result *= texture(texLookup, vec2(length(vec2(0.5) - texcoord) / length(vec2(0.5)),0.5));
    #endif

    outColor=result;
}

