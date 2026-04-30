float MOD_width=MOD_targetTexInfo.x;
float MOD_height=MOD_targetTexInfo.y;
float MOD_numTargets=MOD_targetTexInfo.w;
float MOD_numLinesPerTarget=MOD_ROWSTARGET;

float halfpix=(1.0/MOD_width)*0.5;
float halfpixy=(1.0/MOD_height)*0.5;

float x=fract(attrVertIndex/MOD_width)+halfpix;
float ya=floor(attrVertIndex/MOD_width)*(1.0/MOD_height);
vec3 off=vec3(0.0);

for(float i=0.0;i<MOD_numTargets;i+=1.0)
{
    float y=1.0-((MOD_numLinesPerTarget*i)/MOD_height+halfpixy);
    vec2 coord=vec2(x,y-ya);
    vec3 targetXYZ = texture(MOD_targetTex,coord).xyz;

    off+=(targetXYZ*MOD_weights[int(i)]);

    coord.y+=(1.0/MOD_height)*MOD_ROWSGEOM; // normals are in next row
    vec3 targetNormal = texture(MOD_targetTex,coord).xyz;
    norm+=targetNormal*MOD_weights[int(i)];


}

// norm=normalize(norm);
pos.xyz+=off;
