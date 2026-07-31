// Minimal 4x4 matrix math library — vanilla JS, plain arrays only.
// Matrices are flat arrays of 16 numbers, column-major
// (matches WGSL / WebGPU / WebGL convention, ready to upload directly to a UBO).
//
// Layout (column-major):
//   [ m0  m4  m8  m12 ]
//   [ m1  m5  m9  m13 ]
//   [ m2  m6  m10 m14 ]
//   [ m3  m7  m11 m15 ]
//
// Modifier functions (multiply, translate, scale, rotate, transform) take the
// target matrix as the first argument but do NOT modify it — each returns a
// new array: result = m * op.

class MinMat
{
    static identity()
    {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    // Returns a new array: m * b. Does not modify m or b.
    static mul(m, b)
    {
        const out = new Array(16).fill(0);
        for (let col = 0; col < 4; col++)
        {
            for (let row = 0; row < 4; row++)
            {
                let sum = 0;
                for (let k = 0; k < 4; k++)
                {
                    sum += m[k * 4 + row] * b[col * 4 + k];
                }
                out[col * 4 + row] = sum;
            }
        }
        return out;
    }

    // Returns a new array: m * translation(x, y, z). Does not modify m.
    static translate(m, x, y, z)
    {
        const t = MinMat.identity();
        t[12] = x;
        t[13] = y;
        t[14] = z;
        return MinMat.mul(m, t);
    }

    // Returns a new array: m * scale(x, y, z). Does not modify m.
    static scale(m, x, y, z)
    {
        const s = [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
        return MinMat.mul(m, s);
    }

    // Returns a new array: m * rotation(axis, angleRad). Does not modify m.
    // axis = [x, y, z], should be normalized.
    static rotate(m, axis, angleRad)
    {
        const [x, y, z] = axis;
        const s = Math.sin(angleRad);
        const c = Math.cos(angleRad);
        const t = 1 - c;

        const r = [
            t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
            t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
            t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
            0, 0, 0, 1
        ];
        return MinMat.mul(m, r);
    }

    // Returns a new array: m with translation, rotation, and scale applied
    // (TRS order). Does not modify m.
    static transform(m, translation, rotationAxis, rotationRad, scaleVec)
    {
        let result = MinMat.translate(m, translation[0], translation[1], translation[2]);
        result = MinMat.rotate(result, rotationAxis, rotationRad);
        result = MinMat.scale(result, scaleVec[0], scaleVec[1], scaleVec[2]);
        return result;
    }

    // Normalize a 3-component axis vector (helper, since rotate() expects a unit axis)
    static normalize3(v)
    {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (len === 0) return [0, 0, 0];
        return [v[0] / len, v[1] / len, v[2] / len];
    }

    /**
     * @param {number} fovY
     * @param {number} aspect
     * @param {number} near
     * @param {number} far
     */
    static perspective(fovY, aspect, near, far)
    {
        const f = 1.0 / Math.tan(fovY / 2);
        const nf = 1.0 / (near - far);
        const m = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

        // const m = new Float32Array(16); // zero-initialized
        // const m = MinMat.identity();
        m[0] = f / aspect;
        m[5] = f;
        m[10] = far * nf;
        m[11] = -1;
        m[14] = far * near * nf;
        // m[15] = 0;

        return m;
    }
}

export default MinMat;
