float shapeRectRound(vec2 p,vec2 b,float rf)
{
    vec4 r = vec4(rf/5.0);
    r.x  = ( p.x > 0.0) ?r.z:r.x;
    r.y  = ( p.x > 0.0) ?r.w:r.y;
    r.x  = ( p.y > 0.0) ?r.y:r.x;

vec2 q = abs(p) - b + r.x;
      float a=min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r.x;

    float aa = fwidth(a);
    float alpha = 1.0 - smoothstep(-aa, aa, a);
    return alpha;
}
