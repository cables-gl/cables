const
    points = op.inArray("positions"),
    array = op.inArray("array"),
    result = op.outArray("result");

points.onChange =
    array.onChange = () =>
    {

        const arrp = points.get();
        const arra = array.get();
        if (!arrp || !arra) return result.set([]);

        let arr = [];
        for (let i = 0; i < arrp.length / 3; i++)
        {
            const copy = structuredClone(arra);

            for (let j = 0; j < copy.length / 3; j++)
            {
                copy[j * 3 + 0] += arrp[i * 3 + 0];
                copy[j * 3 + 1] += arrp[i * 3 + 1];
                copy[j * 3 + 2] += arrp[i * 3 + 2];
            }
            arr = arr.concat(copy);

        }
        result.setRef(arr);
    };
