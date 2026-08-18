
// Cellular noise ("Worley noise") in 3D in GLSL.
// Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved.
// This code is released under the conditions of the MIT license.
// See LICENSE file for details.

fn mod289_4(x: vec4<f32>) -> vec4<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
fn mod289_3(x: vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute4(x: vec4<f32>) -> vec4<f32> {
    return mod289_4((34.0 * x + 1.0) * x);
}
fn permute3(x: vec3<f32>) -> vec3<f32> {
    return mod289_3((34.0 * x + 1.0) * x);
}
fn mod_f32(x: f32, y: f32) -> f32 {
    return x - y * floor(x / y);
}
fn mod4(x: vec4<f32>, y: f32) -> vec4<f32> {
    return x - y * floor(x / y);
}
fn mod3(x: vec3<f32>, y: f32) -> vec3<f32> {
    return x - y * floor(x / y);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Speeded up by using 2x2x2 search window instead of 3x3x3,
// at the expense of some pattern artifacts.
// F2 is often wrong and has sharp discontinuities.
// If you need a good F2, use the slower 3x3x3 version.
// vec2 cellular2x2x2(vec3 P) {
fn cellular2x2x2(PP: vec3<f32>,scale:f32) -> f32 {
	var K:f32 =0.142857142857; // 1/7
	var Ko:f32= 0.428571428571; // 1/2-K/2
	var K2:f32= 0.020408163265306; // 1/(7*7)
	var Kz:f32= 0.166666666667; // 1/6
	var Kzo:f32= 0.416666666667; // 1/2-1/6*2
	var jitter:f32= 0.8; // smaller jitter gives less errors in F2

var P:vec3f =PP;
P.x*=scale;
P.y*=scale;

    let Pi: vec3<f32> = mod3(floor(P), 289.0);
    let Pf: vec3<f32> = fract(P);

    let Pfx: vec4<f32> = Pf.x + vec4<f32>(0.0, -1.0, 0.0, -1.0);
    let Pfy: vec4<f32> = Pf.y + vec4<f32>(0.0, 0.0, -1.0, -1.0);

    var p: vec4<f32> = permute4(Pi.x + vec4<f32>(0.0, 1.0, 0.0, 1.0));
    p = permute4(p + Pi.y + vec4<f32>(0.0, 0.0, 1.0, 1.0));

    let p1: vec4<f32> = permute4(p + Pi.z);                    // z+0
    let p2: vec4<f32> = permute4(p + Pi.z + vec4<f32>(1.0));   // z+1

    let ox1: vec4<f32> = fract(p1 * K) - Ko;
    let oy1: vec4<f32> = mod4(floor(p1 * K), 7.0) * K - Ko;
    let oz1: vec4<f32> = floor(p1 * K2) * Kz - Kzo;            // p1 < 289 guaranteed

    let ox2: vec4<f32> = fract(p2 * K) - Ko;
    let oy2: vec4<f32> = mod4(floor(p2 * K), 7.0) * K - Ko;
    let oz2: vec4<f32> = floor(p2 * K2) * Kz - Kzo;

    let dx1: vec4<f32> = Pfx + jitter * ox1;
    let dy1: vec4<f32> = Pfy + jitter * oy1;
    let dz1: vec4<f32> = Pf.z + jitter * oz1;

    let dx2: vec4<f32> = Pfx + jitter * ox2;
    let dy2: vec4<f32> = Pfy + jitter * oy2;
    let dz2: vec4<f32> = Pf.z - 1.0 + jitter * oz2;

    let d1: vec4<f32> = dx1 * dx1 + dy1 * dy1 + dz1 * dz1; // z+0
    let d2: vec4<f32> = dx2 * dx2 + dy2 * dy2 + dz2 * dz2; // z+1

    // Sort out both F1 and F2 (the "#if 0" cheat branch is omitted — this is the "#else" full version)
    var d: vec4<f32> = min(d1, d2);       // F1 is now in d
    let d2max: vec4<f32> = max(d1, d2);   // keep all candidates for F2


    d = vec4<f32>(select(d.yx, d.xy, d.x < d.y), d.z, d.w); // swap smallest into d.x
    d = vec4<f32>(select(d.zy, d.xz, d.x < d.z).x, d.y, select(d.zy, d.xz, d.x < d.z).y, d.w);
    d = vec4<f32>(select(d.wy, d.xw, d.x < d.w).x, d.y, d.z, select(d.wy, d.xw, d.x < d.w).y);
    // F1 is now in d.x

    let dyzw = min(d.yzw, d2max.yzw);     // F2 now not in d2max.yzw
    var f2 = min(dyzw.x, dyzw.y);
    f2 = min(f2, dyzw.z);
    f2 = min(f2, d2max.x);
    // F2 is now in f2
    return sqrt(vec2<f32>(d.x, f2).x);
}