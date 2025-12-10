const HALF_PI = 0.5 * Math.PI;

function interpolate(t, e, r)
{
    return t + r * (e - t);
}

function constrainTo(t, e, r)
{
    if (!isFinite(t)) return e;
    if (r < e)
    {
        if (t > e) return e;
        if (t < r) return r;
    }
    else
    {
        if (t < e) return e;
        if (t > r) return r;
    }
    return t;
}

/// //////

class SphericalHarmonics
{
    constructor(shapeParameters)
    {
        this.shapeParameters = shapeParameters;
        let v = [1, 1, 1];
    }

    e(e, a, t, r, i, o, s, n, p, l, h, d, c)
    {
        let u = 0;
        u += Math.pow(Math.sin(this.shapeParameters[1] * e), Math.round(this.shapeParameters[0])),
        u += Math.pow(Math.cos(this.shapeParameters[3] * e), Math.round(this.shapeParameters[2])),
        u += Math.pow(Math.sin(this.shapeParameters[5] * a), Math.round(this.shapeParameters[4])),
        u += Math.pow(Math.cos(this.shapeParameters[7] * a), Math.round(this.shapeParameters[6]));
        let m = (1 + 3 * Math.pow(d, 2)) * this.shapeParameters[14];
        c[0] = -u * m * s * t * o - l * m * o,
        c[1] = u * m * s * t * r + l * m * r,
        c[2] = Math.pow(d, 2.5) * h * n * 25 - constrainTo(1 + d, 0, 2) * (u * n * i) - p;
    }

    getShapeName()
    {
        return "Spherical Harmonics";
    }

    numParams()
    {
        return 8;
    }

    generate(a, t, r, i, o)
    {
        let s, n, p, l, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T = this.shapeParameters[15], C = 1 / a, y = 1 / t, D = y / 10, w = [0, 0, 0], E = [0, 0, 0], O = 0;

        for (n = 0; n <= t; n++)
            for (l = n * y,
            h = HALF_PI + interpolate(-HALF_PI, HALF_PI, l) * this.shapeParameters[13],
            u = Math.sin(h),
            g = Math.cos(h),
            d = HALF_PI + interpolate(-HALF_PI, HALF_PI, l + D) * this.shapeParameters[13],
            m = Math.sin(d),
            f = Math.cos(d),
            s = 0; s <= a; s++)
            {
                p = s * C,

                c = Math.PI + interpolate(-Math.PI, Math.PI, p) * this.shapeParameters[12],
                S = Math.sin(c),
                v = Math.cos(c),
                P = 3 * (x = 1 - p) * this.shapeParameters[9] * (1 + 25 * T),
                this.e(h, c, u, S, g, v, M = Math.pow(p * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), b = Math.pow(p * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), P, A = 3 * this.shapeParameters[8] * (p + x * M), l, T, r[O]),
                O++;
            }
        let _ = -0.5 * (o.max[2] + o.min[2]);
        for (o.max[2] += _,
        o.min[2] += _,
        O = 0,
        n = 0; n <= t; n++)
            for (s = 0; s <= a; s++)
                r[O++][2] += _;
        return !0;
    }
}

/// /////////

class SuperFormula
{
    constructor(shapeParameters)
    {
        this.shapeParameters = shapeParameters;
    }

    e(e, a, t, r, i, o, s)
    {
        return Math.pow(Math.pow(Math.abs(Math.cos(r * e / 4) / a), o) + Math.pow(Math.abs(Math.sin(r * e / 4) / t), s), -1 / i);
    }

    aa(a, t, r, i, o, s, n, p, l, h, d, c, u, m, S, g, f, v, P)
    {
        let M = [0.0, 0.0, 0.0];
        let b = a * Math.pow(o, v) * g * i / 2.0;
        g = g * i * t;
        f = Math.pow(t * i + 0.1, f);
        v = Math.pow(t * o + 0.1, v);

        let A = interpolate(-Math.PI, Math.PI, t) * i,
            x = interpolate(HALF_PI, -HALF_PI, r) * o,
            T = x + s * t,
            C = this.e(A, 1.0, 1.0, n, p, l, h),
            y = this.e(x, 1.0, 1.0, d, c, u, m),
            D = Math.cos(T),
            w = (1 + P) * this.shapeParameters[14];

        M[0] = a * C * w * (S + f * y * D) * Math.cos(A);
        M[1] = -a * C * w * (S + f * y * D) * Math.sin(A);
        M[2] = P * r * 50.0 - constrainTo(1 + P, 0.0, 2.0) * (a * v * (y * Math.sin(T) - g) + b);

        let E = 4294967295.0;

        M[0] = constrainTo(M[0], -E, E);
        M[1] = constrainTo(M[1], -E, E);
        M[2] = constrainTo(M[2], -E, E);

        return M;
    }

    a(a, t, r)
    {
        return this.aa(3.5, a, t, this.shapeParameters[12], this.shapeParameters[13], 0.0, this.shapeParameters[0], this.shapeParameters[1], this.shapeParameters[2], this.shapeParameters[3], this.shapeParameters[4], this.shapeParameters[5], this.shapeParameters[6], this.shapeParameters[7], this.shapeParameters[8], this.shapeParameters[9], this.shapeParameters[10], this.shapeParameters[11], this.shapeParameters[15]);
    }

    generate(resX, resY, verts, normals, bounds)
    {
        let n, s; // iterator vars
        let p, l, stepX = 1.0 / resX, stepY = 1.0 / resY, c = stepY / 10.0, S = 0.0;
        let u = [0.0, 0.0, 0.0];
        let m = [0.0, 0.0, 0.0];

        for (n = 0; n <= resY; n++)
        {
            for (l = n * stepY, s = 0.0; s <= resX; s++)
            {
                Math.abs(this.shapeParameters[1]) < 0.1 && (this.shapeParameters[1] = constrainTo(Math.abs(this.shapeParameters[1]), 0.1, 15.0)),
                Math.abs(this.shapeParameters[5]) < 0.1 && (this.shapeParameters[5] = constrainTo(Math.abs(this.shapeParameters[5]), 0.1, 15.0));

                p = s * stepX;
                u = this.a(p + c, l, 0.0);
                m = this.a(p, l + c, 0.0);
                verts[S] = this.a(p, l, 0.0);
                S++;
            }
        }

        let g = -0.5 * (bounds.max[2] + bounds.min[2]);
        for (bounds.max[2] += g, bounds.min[2] += g, S = 0.0, n = 0.0; n <= resY; n++)
            for (s = 0.0; s <= resX; s++)
                verts[S++][2] += g;

        return !0;
    }

    numParams()
    {
        return 8;
    }
}

/// ///////

class SuperEllipsoid
{
    constructor(shapeParameters)
    {
        this.shapeParameters = shapeParameters;
    }

    e(e, a)
    {
        let t = e < 0 ? -e : e;
        return t < 1e-5 ? 0 : (e < 0 ? -1 : 1) * Math.pow(t, a);
    }

    a(a, t, r, i, o, s, n, p, l, h, d, c, u, m, S, g)
    {
        let f = this.shapeParameters[14];
        g[0] = 4 * (u * f * n * this.e(s, c) + h * f * s),
        g[1] = 4 * (-u * f * n * this.e(i, c) - h * f * i),
        g[2] = 4 * (S * m * p + constrainTo(1 + S, 0, 2) * (p * this.e(r, d)) - l);
    }

    numParams()
    {
        return 2;
    }

    generate(t, r, i, o, s)
    {
        let n, p, l, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T, C = this.shapeParameters[15], y = 1 / t, D = 1 / r, w = D / 10, E = [0, 0, 0], O = [0, 0, 0], _ = 0, R = this.shapeParameters[0] < 1e-6 ? 1e-6 : this.shapeParameters[0], I = this.shapeParameters[1] < 1e-6 ? 1e-6 : this.shapeParameters[1];
        for (p = 0; p <= r; p++)
            for (h = p * D,
            u = interpolate(-HALF_PI, HALF_PI, h) * this.shapeParameters[13],
            g = Math.sin(u),
            d = this.e(Math.cos(u), R),
            m = interpolate(-HALF_PI, HALF_PI, h + w) * this.shapeParameters[13],
            f = Math.sin(m),
            c = this.e(Math.cos(m), R),
            n = 0; n <= t; n++)
                l = n * y,
                S = interpolate(-Math.PI, Math.PI, l) * this.shapeParameters[12],
                v = Math.sin(S),
                P = Math.cos(S),
                M = 3 * (T = 1 - l) * this.shapeParameters[9],
                this.a(0, 0, g, v, 0, P, b = Math.pow(l * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), A = Math.pow(l * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), M, x = 3 * this.shapeParameters[8] * (l + T * b), R, I, d, h, C, i[_]),
                this.a(0, 0, f, v, 0, P, b, A, M, x, R, I, c, h + w, C, O),
                l += w,
                S = interpolate(-Math.PI, Math.PI, l) * this.shapeParameters[12],
                v = Math.sin(S),
                P = Math.cos(S),
                M = 3 * (T = 1 - l) * this.shapeParameters[9],
                this.a(0, 0, g, v, 0, P, b = Math.pow(l * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), A = Math.pow(l * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), M, x = 3 * this.shapeParameters[8] * (l + T * b), R, I, d, h, C, E),
                _++;
        let L = -0.5 * (s.max[2] + s.min[2]);
        for (s.max[2] += L,
        s.min[2] += L,
        _ = 0,
        p = 0; p <= r; p++)
            for (n = 0; n <= t; n++)
                i[_++][2] += L;
        return !0;
    }
}

class SuperToroid
{
    constructor(shapeParameters)
    {
        this.shapeParameters = shapeParameters;
    }

    e(e, a)
    {
        let t = e < 0 ? -e : e;
        return t < 1e-5 ? 0 : (e < 0 ? -1 : 1) * Math.pow(t, a);
    }

    a(a, t, r, i, o, s, n, p, l, h, d, c, u, m, S, g, f)
    {
        let v = this.shapeParameters[14],
            P = n * (u + m * this.e(o, c));
        f[0] = 4 * (-this.e(s, d) * v * P - h * v * s),
        f[1] = 4 * (this.e(i, d) * v * P + h * v * i),
        f[2] = 4 * (g * S * p - constrainTo(1 - g, 0, 1) * (m * p * this.e(r, c)) - l);
    }

    numParams()
    {
        return 3;
    }

    generate(e, t, r, i, o)
    {
        let s, n, p, l, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T = this.shapeParameters[15], C = 1 / e, y = 1 / t, D = y / 10, w = [0, 0, 0], E = [0, 0, 0], O = 0, _ = this.shapeParameters[1] < 1e-6 ? 1e-6 : this.shapeParameters[1], R = this.shapeParameters[0] < 1e-6 ? 1e-6 : this.shapeParameters[0], I = 1 - constrainTo(this.shapeParameters[2], 0.001, 0.999);
        for (n = 0; n <= t; n++)
            for (l = n * y,
            h = interpolate(-Math.PI, Math.PI, 1 - l) * this.shapeParameters[13],
            u = Math.sin(h),
            g = Math.cos(h),
            d = interpolate(-Math.PI, Math.PI, 1 - (l + D)) * this.shapeParameters[13],
            m = Math.sin(d),
            f = Math.cos(d),
            s = 0; s <= e; s++)
                p = s * C,
                c = Math.PI + interpolate(-Math.PI, Math.PI, p) * this.shapeParameters[12],
                S = Math.sin(c),
                v = Math.cos(c),
                P = 3 * (x = 1 - p) * this.shapeParameters[9],
                this.a(0, 0, u, S, g, v, M = Math.pow(p * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), b = Math.pow(p * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), P, A = 3 * this.shapeParameters[8] * (p + x * M), _, R, 1, I, l, T, r[O]),
                this.a(0, 0, m, S, f, v, M, b, P, A, _, R, 1, I, l + D, T, E),
                p += D,
                c = Math.PI + interpolate(-Math.PI, Math.PI, p) * this.shapeParameters[12],
                S = Math.sin(c),
                v = Math.cos(c),
                P = 3 * (x = 1 - p) * this.shapeParameters[9],
                this.a(0, 0, u, S, g, v, M = Math.pow(p * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), b = Math.pow(p * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), P, A = 3 * this.shapeParameters[8] * (p + x * M), _, R, 1, I, l, T, w),
                O++;
        let L = -0.5 * (o.max[2] + o.min[2]);
        for (o.max[2] += L,
        o.min[2] += L,
        O = 0,
        n = 0; n <= t; n++)
            for (s = 0; s <= e; s++)
                r[O++][2] += L;
        return !0;
    }
}

class EllipticTorus
{
    constructor(shapeParameters)
    {
        this.shapeParameters = shapeParameters;
    }

    e(e, a, t, r, i, o, s, n, p, l, h, d, c, u)
    {
        let m = this.shapeParameters[14];
        u[0] = 2 * ((h + i) * m * s * r + l * m * r),
        u[1] = 2 * ((h + i) * m * s * o + l * m * o),
        u[2] = 2 * (c * d * n + constrainTo(1 - c, 0, 1) * (-n * (t + i)) - p);
    }

    numParams()
    {
        return 1;
    }

    generate(a, t, r, i, o)
    {
        let s, n, p, l, h, d, c, u, m, S, g, f, v, P, M, b, A, x, T = this.shapeParameters[15], C = 1 / a, y = 1 / t, D = y / 10, w = [0, 0, 0], E = [0, 0, 0], O = 0, _ = this.shapeParameters[0] < 1e-6 ? 1e-6 : this.shapeParameters[0];
        for (n = 0; n <= t; n++)
            for (l = n * y,
            h = Math.PI + interpolate(-Math.PI, Math.PI, l) * this.shapeParameters[13],
            u = Math.sin(h),
            g = Math.cos(h),
            d = Math.PI + interpolate(-Math.PI, Math.PI, l - D) * this.shapeParameters[13],
            m = Math.sin(d),
            f = Math.cos(d),
            s = 0; s <= a; s++)
                p = s * C,
                c = HALF_PI + interpolate(-Math.PI, Math.PI, p) * this.shapeParameters[12],
                S = Math.sin(c),
                v = Math.cos(c),
                P = 3 * (x = 1 - p) * this.shapeParameters[9],
                this.e(0, 0, u, S, g, v, M = Math.pow(p * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), b = Math.pow(p * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), P, A = 3 * this.shapeParameters[8] * (p + x * M), _, l, T, r[O]),
                this.e(0, 0, m, S, f, v, M, b, P, A, _, l + D, T, E),
                p += D,
                c = HALF_PI + interpolate(-Math.PI, Math.PI, p) * this.shapeParameters[12],
                S = Math.sin(c),
                v = Math.cos(c),
                P = 3 * (x = 1 - p) * this.shapeParameters[9],
                this.e(0, 0, u, S, g, v, M = Math.pow(p * this.shapeParameters[12] + 0.1, 0.5 * this.shapeParameters[10]), b = Math.pow(p * this.shapeParameters[13] + 0.1, 0.5 * this.shapeParameters[11]), P, A = 3 * this.shapeParameters[8] * (p + x * M), _, l, T, w),

                O++;
        let R = -0.5 * (o.max[2] + o.min[2]);
        for (o.max[2] += R,
        o.min[2] += R,
        O = 0,
        n = 0; n <= t; n++)
            for (s = 0; s <= a; s++)
                r[O++][2] += R;
        return !0;
    }
}
