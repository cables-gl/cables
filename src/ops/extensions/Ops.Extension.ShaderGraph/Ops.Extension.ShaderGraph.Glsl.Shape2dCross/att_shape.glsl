float shapeCross(vec2 p,float r,float w)
{
    vec2 pp = abs(p);
    return step(length(pp-min(pp.x+pp.y,w)*vec2(0.5)) - r,0.);
}
