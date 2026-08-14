fn shapeCross(p: vec2<f32>,r:f32,w:f32) -> f32
{
    let pp = abs(p);
    return step(length(pp-min(pp.x+pp.y,w)*vec2<f32>(0.5)) - r,0.);
}
