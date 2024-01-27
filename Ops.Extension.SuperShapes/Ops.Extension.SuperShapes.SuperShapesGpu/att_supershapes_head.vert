IN vec4 attrIdx;

#define PI 3.1415926535897932384626433832795
#define HALF_PI 1.5707963267948966


float interpolate(float t, float e, float r)
{
    return t + r * (e - t);
}

float myPow(float x,float y)
{
    if(x<0.0)
    {
        float p=pow(abs(x),y);
        if(mod(y,2.0)!=0.0)p*=-1.0;
        return p;
    }

    return pow(x,y);
}

vec3 calcNormal(vec3 e, vec3 a, vec3 t)
{
    float i = t.x - e.x
        , o = t.y - e.y
        , s = t.z - e.z
        , n = a.x - e.x
        , p = a.y - e.y
        , l = a.z - e.z;

    vec3 r;
    r.x = o * l - s * p,
    r.y = s * n - i * l,
    r.z = i * p - o * n,
    r=normalize(r);
    return -r;
}
/////////////////////
//
// superformula

float superformula_e(float e,float  a,float  t,float  r,float  i, float o, float s)
{
    return pow(pow(abs(cos(r * e / 4.0) / a), o) + pow(abs(sin(r * e / 4.0) / t), s), -1.0 / i);
}

vec3 superformula_calc(float a, float t, float r, float i, float o, float s, float n, float p, float l, float h, float d, float c, float u, float m, float S, float g, float f, float v, float P)
{
    vec3 M=vec3 (0. ,0. ,0. );
    float b = a * pow(o, v) * g * i / 2.0;
    g = g * i * t;
    f = pow(t * i + 0.1, f);
    v = pow(t * o + 0.1, v);

    float A = interpolate(-PI, PI, t) * i
      , x = interpolate(HALF_PI, -HALF_PI, r) * o
      , T = x + s * t
      , C = superformula_e(A, 1.0, 1.0, n, p, l, h)
      , y = superformula_e(x, 1.0, 1.0, d, c, u, m)
      , D = cos(T)
      , w = (1.0 + P) * params_14;

    M.x = a * C * w * (S + f * y * D) * cos(A);
    M.y = -a * C * w * (S + f * y * D) * sin(A);
    M.z = P * r * 50.0 - clamp(1.0 + P, 0.0, 2.0) * (a * v * (y * sin(T) - g) + b);

    return M;
}


vec3 superformula( float n,float s)
{
    float stepX = 1.0 / MOD_res, stepY = 1.0 / MOD_res;
    float l=n*stepY;
    float p = s * stepX;

    return superformula_calc(1.0,p, l, params_12,params_13,0.0,params_0,params_1,params_2,params_3,params_4,params_5,params_6,params_7,params_8,params_9,params_10,params_11,params_15);
}

//////////////////////////
//
// sphericalHarmonics

vec3 sphericalHarmonics_e(float e, float a, float t, float r, float i, float o, float s, float n, float p, float l, float h, float d)
{
    float u = 0.0;
    u += myPow(sin(params_1 * e), round(params_0));
    u += myPow(cos(params_3 * e), round(params_2));
    u += myPow(sin(params_5 * a), round(params_4));
    u += myPow(cos(params_7 * a), round(params_6));
    float m = (1.0 + 3.0 * myPow(d, 2.0)) * params_14;

    vec3 c;
    c.x = -u * m * s * t * o - l * m * o,
    c.y = u * m * s * t * r + l * m * r,
    c.z = myPow(d, 2.5) * h * n * 25.0 - clamp(1.0 + d, 0.0, 2.0) * (u * n * i) - p;

    return c;
}

vec3 sphericalHarmonics_calc(float n,float s)
{

    float p, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T = params_15, C = 1.0, y = 1.0, D = y / 10.0;
    float l = n * y;
    h = HALF_PI + interpolate(-HALF_PI, HALF_PI,n) * params_13;
    u = sin(h);
    g = cos(h);
    p = s * C;

    c = PI + interpolate(-PI, PI, p) * params_12;
    S = sin(c);
    v = cos(c);
    M = pow(p * params_12 + .1, .5 * params_10);
    x = 1.0 - p;
    P = 3.0 * (x) * params_9 * (1.0 + 25.0 * T);
    b = pow(p * params_13 + .1, .5 * params_11);
    A = 3.0 * params_8 * (p + x * M);
    return sphericalHarmonics_e(h, c, u, S, g, v, M, b , P, A, l, T);
}

vec3 sphericalHarmonics(float n, float s)
{
    float stepX = 1.0 / MOD_res, stepY = 1.0 / MOD_res;
    float p = n * stepX;
    float l = s * stepY;

    return sphericalHarmonics_calc(p,l);
}

////////////////////
//
// eliptic torus

vec3 ellipticTorus_e(float e, float a, float t, float r, float i, float o, float s, float n, float p, float l, float h, float d, float c)
{
    float m = params_14;

    vec3 u;
    u.x = 2. * ((h + i) * m * s * r + l * m * r);
    u[1] = 2. * ((h + i) * m * s * o + l * m * o);
    u[2] = 2. * (c * d * n + clamp(1. - c, 0., 1.) * (-n * (t + i)) - p);

    return u;
}

vec3 ellipticTorus_calc(float s, float n)
{
    float p, d, c, u, m, S, g, f, v, P, M, b, A, x, T = params_15, C = 1., y = 1. , D = y / 10.;//, _ = params_0 < 1e-6 ? 1e-6 : params_0;
    float _=params_0;

    vec3  w,E;
    float l = n * y;
    float h = PI + interpolate(-PI, PI, l) * params_13;
    u = sin(h),
    g = cos(h),
    d = PI + interpolate(-PI, PI, l - D) * params_13,
    m = sin(d),
    f = cos(d),
    p = s * C,
    c = HALF_PI + interpolate(-PI, PI, p) * params_12,
    S = sin(c),
    v = cos(c),
    P = 3. * (x = 1. - p) * params_9;

    M = pow(p * params_12 + .1, .5 * params_10);
    b = pow(p * params_13 + .1, .5 * params_11);
    A = 3. * params_8 * (p + x * M);

    p += D,
    c = HALF_PI + interpolate(-PI, PI, p) * params_12,
    S = sin(c),
    v = cos(c),
    P = 3. * (x = 1. - p) * params_9;
    return -ellipticTorus_e(0., 0., u, S, g, v, M = pow(p * params_12 + .1, .5 * params_10), b = pow(p * params_13 + .1, .5 * params_11), P, A = 3. * params_8 * (p + x * M), _, l, T);

}

vec3 ellipticTorus( float n, float s)
{
    float stepX = 1.0 / MOD_res, stepY = 1.0 / MOD_res;
    float p = s * stepX;
    float l = n * stepY;

    return ellipticTorus_calc(p,l);
}

//////////////////////////
//
// super torois

float superToroid_e(float e, float a)
{
    float t = e < 0.0 ? -e : e;
    return t < 1e-5 ? 0.0 : (e < 0.0 ? -1.0 : 1.0) * pow(t, a);
}

vec3 superToroid_a(float a, float t, float r, float i, float o, float s, float n, float p, float l, float h, float d, float c, float u, float m, float S, float g)
{
    float v = params_14,
        P = n * (u + m * superToroid_e(o, c));
    vec3 f;
    f[0] = 4.0 * (-superToroid_e(s, d) * v * P - h * v * s),
    f[1] = 4.0 * (superToroid_e(i, d) * v * P + h * v * i),
    f[2] = 4.0 * (g * S * p - clamp(1.0 - g, 0.0, 1.0) * (m * p * superToroid_e(r, c)) - l);
    return f;
}


vec3 superToroid_calc(float s,float n)
{
    float p, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T = params_15, C = 1., y = 1., D = y / 10.0, O = 0.0;
    float I = 1.0-clamp(params_2, .001, .999);
    float _=params_1;
    float R=params_0;

    vec3 w,E;
    float l=n*y;

    h = interpolate(-PI, PI, 1.0 - l) * params_13,
    u = sin(h),
    g = cos(h),
    d = interpolate(-PI, PI, 1.0 - (l + D)) * params_13,
    m = sin(d),
    f = cos(d),
    p = s * C,
    c = PI + interpolate(-PI, PI, p) * params_12,
    S = sin(c),
    v = cos(c),
    P = 3.0 * (x = 1.0 - p) * params_9,
    superToroid_a(0.0, 0.0, u, S, g, v, M = pow(p * params_12 + .1, .5 * params_10), b = pow(p * params_13 + .1, .5 * params_11), P, A = 3.0 * params_8 * (p + x * M), _, R, 1.0, I, l, T),
    superToroid_a(0.0, 0.0, m, S, f, v, M, b, P, A, _, R, 1.0, I, l + D, T),
    p += D,
    c = PI + interpolate(-PI, PI, p) * params_12,
    S = sin(c),
    v = cos(c),
    P = 3.0 * (x = 1.0 - p) * params_9;

    return superToroid_a(0.0, 0.0, u, S, g, v, M = pow(p * params_12 + .1, .5 * params_10), b = pow(p * params_13 + .1, .5 * params_11), P, A = 3.0 * params_8 * (p + x * M), _, R, 1.0, I, l, T);
}

vec3 superToroid( float n, float s)
{
    float stepX = 1.0 / MOD_res, stepY = 1.0 / MOD_res;
    float p = s * stepX;
    float l = n * stepY;

    return superToroid_calc(p,l);
}

///////////////////////////
//
// SuperEllipsoid


float superEllipsoid_e(float e, float a)
{
    float t = e < 0.0 ? -e : e;
    return t < 1e-5 ? 0.0 : (e < 0.0 ? -1.0 : 1.0) * pow(t, a);
}

vec3 superEllipsoid_a(float a, float t, float r, float i, float o, float s, float n, float p, float l, float h, float d, float c, float u, float m, float S)
{
    float f = params_14;
    vec3 g;
    g.x = 4.0 * (u * f * n * superEllipsoid_e(s, c) + h * f * s),
    g.y = 4.0 * (-u * f * n * superEllipsoid_e(i, c) - h * f * i),
    g.z = 4.0 * (S * m * p + clamp(1.0 + S, 0.0, 2.0) * (p * superEllipsoid_e(r, d)) - l);
    return g;
}


vec3 superEllipsoid_calc(float p,float n)
{
    float  l, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T, C = params_15, y = 1.0, D = 1.0 , w = D / 10.0;
    vec3 E,O;//E = [0, 0, 0], O = [0, 0, 0],
    float _ = 0., R = params_0 < 1e-6 ? 1e-6 : params_0, I = params_1 < 1e-6 ? 1e-6 : params_1;

    h=p*D;
    // for (p = 0; p <= r; p++)
        // for (h = p * D,
        u = interpolate(-HALF_PI, HALF_PI, h) * params_13,
        g = sin(u),
        d = superEllipsoid_e(cos(u), R),
        m = interpolate(-HALF_PI, HALF_PI, h + w) * params_13,
        f = sin(m),
        c = superEllipsoid_e(cos(m), R),
        // n = 0; n <= t; n++)
            l = n * y,
            S = interpolate(-PI, PI, l) * params_12,
            v = sin(S),
            P = cos(S),
            M = 3.0 * (T = 1.0 - l) * params_9,
            superEllipsoid_a(0.0, 0.0, g, v, 0.0, P, b = pow(l * params_12 + .1, .5 * params_10), A = pow(l * params_13 + .1, .5 * params_11), M, x = 3.0 * params_8 * (l + T * b), R, I, d, h, C),
            superEllipsoid_a(0.0, 0.0, f, v, 0.0, P, b, A, M, x, R, I, c, h + w, C),
            l += w,
            S = interpolate(-PI, PI, l) * params_12,
            v = sin(S),
            P = cos(S),
            M = 3.0 * (T = 1.0 - l) * params_9;
    return -superEllipsoid_a(0.0, 0.0, g, v, 0.0, P, b = pow(l * params_12 + .1, .5 * params_10), A = pow(l * params_13 + .1, .5 * params_11), M, x = 3.0 * params_8 * (l + T * b), R, I, d, h, C);
}


vec3 superEllipsoid( float n, float s)
{
    float stepX = 1.0 / MOD_res, stepY = 1.0 / MOD_res;
    float p = s * stepX;
    float l = n * stepY;

    return superEllipsoid_calc(p,l);
}





//