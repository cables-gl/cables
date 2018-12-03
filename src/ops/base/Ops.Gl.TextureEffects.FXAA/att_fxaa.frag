IN vec2 texCoord;
UNI sampler2D tex;
UNI float FXAA_SPAN_MAX;
UNI float FXAA_REDUCE_MUL;
UNI float FXAA_REDUCE_MIN;
UNI float width;
UNI float height;

vec4 getColorFXAA(vec2 coord)
{
    vec2 invtexsize=vec2(1.0/width,1.0/height);

    float step=1.0;

    vec3 rgbNW = texture2D(tex, coord.xy + (vec2(-step, -step)*invtexsize )).xyz;
    vec3 rgbNE = texture2D(tex, coord.xy + (vec2(+step, -step)*invtexsize )).xyz;
    vec3 rgbSW = texture2D(tex, coord.xy + (vec2(-step, +step)*invtexsize )).xyz;
    vec3 rgbSE = texture2D(tex, coord.xy + (vec2(+step, +step)*invtexsize )).xyz;
    vec3 rgbM  = texture2D(tex, coord.xy).xyz;

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot( rgbM, luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);

    dir = min(vec2(FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin))*invtexsize ;

    vec3 rgbA = (1.0/2.0) * (
                texture2D(tex, coord.xy + dir * (1.0/3.0 - 0.5)).xyz +
                texture2D(tex, coord.xy + dir * (2.0/3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
                texture2D(tex, coord.xy + dir * (0.0/3.0 - 0.5)).xyz +
                texture2D(tex, coord.xy + dir * (3.0/3.0 - 0.5)).xyz);
    float lumaB = dot(rgbB, luma);

    vec4 color=texture2D(tex,coord).rgba;

    if((lumaB < lumaMin) || (lumaB > lumaMax)){
      color.xyz=rgbA;
    } else {
      color.xyz=rgbB;
    }
    return color;
}

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   outColor= getColorFXAA(texCoord);
}