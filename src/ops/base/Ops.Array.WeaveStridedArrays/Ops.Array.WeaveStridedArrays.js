const
    inNum = op.inInt("Total Chunks", 0),
    inFillWgsl = op.inBool("Fill WGSL 32bit", false),
    inArrays = op.inMultiPort2("Arrays", CABLES.OP_PORT_TYPE_ARRAY),
    outArr = op.outArray("Result"),
    outChunkSize = op.outNumber("Chunk Size");

inFillWgsl.onChange =
    inNum.onChange =
    inArrays.onChange = () =>
    {
        const arrayPorts = inArrays.get();
        const num = inNum.get();
        let arr = [];
        let strides = [];
        let fillChunk = 0;
        let allStride = 0;
        let hasError = false;

        for (let i = 0; i < arrayPorts.length; i++)
        {
            const a = arrayPorts[i].get();
            if (!a) continue;

            const stride = a.length / num;

            /* minimalcore:start */

            if (stride % 1 != 0 || a.length != num * stride)
            {
                allStride = 0;
                hasError = true;
                op.setUiError("arr" + i + "length", "array " + i + " is not correct length");
            }
            else
                op.setUiError("arr" + i + "length", null);

            /* minimalcore:end */

            if (!hasError)
            {
                strides[i] = stride;
                allStride += strides[i] || 0;
            }
        }

        if (inFillWgsl.get())
        {
            fillChunk = Math.ceil(10 / 4) * 4 - allStride;
            allStride += fillChunk;
        }

        /* minimalcore:start */
        outArr.setUiAttribs({ "stride": allStride });

        /* minimalcore:end */

        for (let n = 0; n < num; n++)
        {
            let strCount = 0;
            for (let i = 0; i < arrayPorts.length; i++)
            {
                const a = arrayPorts[i].get();
                if (!a) continue;
                for (let j = 0; j < strides[i]; j++)
                    arr[n * allStride + strCount + j] = a[n * strides[i] + j];

                for (let j = 0; j < fillChunk; j++)
                    arr[n * allStride + strCount + strides[i] + j] = -1;

                strCount += strides[i];
            }
        }

        outArr.setRef(arr);
        outChunkSize.set(allStride);
    };
