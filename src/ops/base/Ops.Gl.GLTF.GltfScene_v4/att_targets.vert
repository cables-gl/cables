



float width=5646.0;
float height=57.0;
float numTargets=19.0;
float numLinesPerTarget=3.0;

float x=(attrVertIndex)/width;


vec3 off;
for(float i=0.0;i<numTargets;i+=1.0)
{
    float targetIdx=i;
    float y=((numLinesPerTarget*targetIdx))/height;

    vec4 targetXYZ=texture(MOD_targetTex,vec2(x,y));

    int ii=int(i);
    off+=targetXYZ.xyz*MOD_weights[ii];

}
pos.xyz+=off;

// pos.x+=attrVertIndex;