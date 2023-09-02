

float MOD_width=MOD_targetTexInfo.x;
float MOD_height=MOD_targetTexInfo.y;
float MOD_numTargets=MOD_targetTexInfo.w;
float MOD_numLinesPerTarget=MOD_targetTexInfo.y/MOD_numTargets;

float halfpix=(1.0/5646.0)*0.5;

float x=(attrVertIndex)/MOD_width+halfpix;


vec3 off;
for(float i=0.0;i<MOD_numTargets;i+=1.0)
{
    float targetIdx = i;
    float y = ((MOD_numLinesPerTarget*targetIdx))/MOD_height;

    vec4 targetXYZ = texture(MOD_targetTex,vec2(x,y));

    int ii = int(i);

    off+=targetXYZ.xyz*MOD_weights[ii]*1.0;

}
pos.xyz+=off;
