const
    inNum = op.inInt("Total Chunks", 0),
    inArrays = op.inMultiPort2("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outChunkSize = op.outNumber("Chunk Size");

inNum.onChange =
    inArrays.onChange = () =>
    {
        const arrayPorts = inArrays.get();
        let arr = [];
        const num = inNum.get();

        let allStride = 0;
        let hasError = false;
        let strides = [];
        for (let i = 0; i < arrayPorts.length; i++)
        {
            const a = arrayPorts[i].get();

            if (!a) continue;
            const stride = a.length / num;
            if (stride % 1 != 0 || a.length != num * stride)
            {
                allStride = 0;
                hasError = true;
                op.setUiError("arr" + i + "length", "array " + i + " is not correct length");
            }
            else
                op.setUiError("arr" + i + "length", null);

            if (!hasError)
            {
                strides[i] = stride;
                allStride += strides[i] || 0;
            }

        }

        for (let n = 0; n < num; n++)
        {
            let strCount = 0;
            for (let i = 0; i < arrayPorts.length; i++)
            {
                const a = arrayPorts[i].get();
                for (let j = 0; j < strides[i]; j++)
                {
                    arr[n * allStride + strCount + j] = a[n * strides[i] + j];

                }

                strCount += strides[i];
            }
        }

        outArr.setRef(arr);
        outChunkSize.set(allStride);
    };
