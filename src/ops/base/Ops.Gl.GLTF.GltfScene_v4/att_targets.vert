

float MOD_width=MOD_targetTexInfo.x;
float MOD_height=MOD_targetTexInfo.y;
float MOD_numTargets=MOD_targetTexInfo.w;
float MOD_numLinesPerTarget=MOD_targetTexInfo.y/MOD_numTargets;

float halfpix=(1.0/MOD_width)*0.5;

float x=(attrVertIndex)/MOD_width+halfpix;

vec3 off=vec3(0.0);

for(float i=0.0;i<MOD_numTargets;i+=1.0)
{
    float y=(MOD_numLinesPerTarget*i)/MOD_height;
    vec4 targetXYZ = texture(MOD_targetTex,vec2(x,y));

    off+=(targetXYZ.xyz)*MOD_weights[int(i)];
}
pos.xyz+=off;
