fn shapeRectRound(p: vec2<f32>,b:vec2<f32>,rf:f32) -> f32
{
    var r = vec4f(rf/5.0);
    r.x  = select(r.z, r.x, p.x > 0.0);
    r.y  = select(r.w, r.y, p.x > 0.0);
    r.x  = select(r.y, r.x, p.y > 0.0);

    let q: vec2f = abs(p) - b + r.x;
      var a=min(max(q.x, q.y), 0.0) + length(max(q, vec2f(0.0))) - r.x;

    let aa = fwidth(a);
    let alpha = 1.0 - smoothstep(-aa, aa, a);
    return alpha;
}
