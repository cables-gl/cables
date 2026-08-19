fn bumpcurve(t: f32) -> f32
{
    let rise = smoothstep(0.0, 0.5, t);
    let fall = 1.0 - smoothstep(0.5, 1.0, t);
    return min(rise, fall);
}
