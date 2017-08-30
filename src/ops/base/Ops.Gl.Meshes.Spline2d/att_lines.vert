IN vec3 aPos;
IN vec3 aPrevPos;
IN vec3 aNextPos;

IN float aOffset;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI vec4 u_linewidth;
OUT float v_alpha;
UNI float u_shift;


void main()
{
    // vec4 u_linewidth=vec4(11.0,1.0,11.0,1.0);
    // mat4 mvMatrix= modelMatrix;

    vec4 pos = projMatrix * viewMatrix * modelMatrix * vec4(aPos.xyz, 1.0);
    vec4 posPrev = projMatrix * viewMatrix * modelMatrix * vec4(aPrevPos.xyz, 1.0);
    vec4 posNext = projMatrix * viewMatrix * modelMatrix * vec4(aNextPos.xyz, 1.0);
    v_alpha = 1.0;


    // vec4 u_linewidth=vec4(aOffset*0.2,
    //     aOffset*0.2,
    //     aOffset*0.2,
    //     aOffset*0.2);

    if (u_shift==1.0)
    {
        vec2 deltaNext = posNext.xy - aPos.xy;
        vec2 deltaPrev = aPos.xy - posPrev.xy;
        float angleNext = atan(deltaNext.y, deltaNext.x);
        float anglePrev = atan(deltaPrev.y, deltaPrev.x);
        if (deltaPrev.xy == vec2(0, 0)) anglePrev = angleNext;
        if (deltaNext.xy == vec2(0, 0)) angleNext = anglePrev;

        float angle = (anglePrev + angleNext) / 2.0;
        float distance = aOffset * (aOffset > 0.0 ? u_linewidth.s : u_linewidth.p) / cos(anglePrev - angle);

        pos.x += distance * sin(angle);
        pos.y -= distance * cos(angle);

        if (aOffset > 0.0)
        {
            v_alpha = u_linewidth.t;
        }
        else
        {
            v_alpha = u_linewidth.q;
        }
        v_alpha=aOffset;

    }

    gl_Position =  pos;

}
