const
    inArr = op.inArray("Points"),
    inTheta = op.inFloat("Theta", 0),
    inPhi = op.inFloat("Phi", 0),
    outArr = op.outArray("Rotations");

let q = quat.create();

inTheta.onChange =
inPhi.onChange =
inArr.onChange = () =>
{
    const arr = inArr.get();
    const result = [];

    if (!arr || arr.length == 0)
    {
        outArr.set(null);
        return;
    }

    let vUp = vec3.create();

    let qprev = quat.create();
    let prevqs = [];

    for (let i = 0; i < arr.length - 3; i += 3)
    {
        let va = [arr[i + 0], arr[i + 1], arr[i + 2]];
        let vb = [arr[i + 3 + 0], arr[i + 3 + 1], arr[i + 3 + 2]];

        const
            x = vb[0] - va[0],
            y = vb[1] - va[1],
            z = vb[2] - va[2],
            r = Math.sqrt(x ** 2 + y ** 2 + z ** 2),
            theta = Math.acos(y / r) * (180 / Math.PI) + inTheta.get(),
            phi = Math.atan2(x, z) * (180 / Math.PI) + inPhi.get();

        result.push(phi, -theta, 0);
        // beamContainer.transform.rotation = Quaternion.Euler(-90 + phi, -theta, 0f);

        /// ///////////////////////////

        // vec3.set(vb,
        //     vb[0] - va[0],
        //     vb[1] - va[1],
        //     vb[2] - va[2]);

        // vec3.normalize(vb, vb);

        // vec3.copy(va,vUp);

        // quat.rotationTo(q, va, vb);

        // result.push(q[0],q[1],q[2],q[3]);
    }

    outArr.setRef(result);
};
