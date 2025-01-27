const
    inArr = op.inArray("Array"),
    inWidth = op.inInt("Width", 10),
    inHeight = op.inInt("Height", 10),
    inZip = op.inBool("ZIP compression", true),
    inStr = op.inString("Filename", "file.exr"),
    exec = op.inTriggerButton("Download");

const FloatType = 1015;
const HalfFloatType = 1016;

const NO_COMPRESSION = 0;
const ZIPS_COMPRESSION = 2;
const ZIP_COMPRESSION = 3;

const textEncoder = new TextEncoder();

function downloadBlob(data, fileName, mimeType)
{
    let blob, url;
    blob = new Blob([data],
        {
            "type": mimeType
        });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function ()
    {
        return window.URL.revokeObjectURL(url);
    }, 1000);
}

function downloadURL(data, fileName)
{
    let a;
    a = document.createElement("a");
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = "display: none";
    a.click();
    a.remove();
}

exec.onTriggered = () =>
{
    const info = buildInfoDT();
    const rawContentBuffer = reorganizeDataBuffer(inArr.get(), info);
    const chunks = compressData(rawContentBuffer, info);

    const data = fillData(chunks, info);

    downloadBlob(data, inStr.get(), "application/octet-stream");
};

function buildInfoDT()
{
    const compressionSizes = {
        "0": 1,
        "2": 1,
        "3": 16
    };

    let cmp = NO_COMPRESSION;
    if (inZip.get())cmp = ZIP_COMPRESSION;

    const
	    WIDTH = inWidth.get(),
        HEIGHT = inHeight.get(),
        TYPE = FloatType,
        FORMAT = FloatType,
        COMPRESSION = cmp,
        EXPORTER_TYPE = FloatType,
        OUT_TYPE = (EXPORTER_TYPE === FloatType) ? 2 : 1,
        COMPRESSION_SIZE = compressionSizes[COMPRESSION],
        NUM_CHANNELS = 4;

    return {
        "width": WIDTH,
        "height": HEIGHT,
        "type": TYPE,
        "format": FORMAT,
        "compression": COMPRESSION,
        "blockLines": COMPRESSION_SIZE,
        "dataType": OUT_TYPE,
        "dataSize": 2 * OUT_TYPE,
        "numBlocks": Math.ceil(HEIGHT / COMPRESSION_SIZE),
        "numInputChannels": 4,
        "numOutputChannels": NUM_CHANNELS,
    };
}

function decodeLinear(dec, r, g, b, a)
{
    dec.r = r;
    dec.g = g;
    dec.b = b;
    dec.a = a;
}

function reorganizeDataBuffer(inBuffer, info)
{
    console.log("info.dataSize", info.dataSize);

    const w = info.width,
        h = info.height,
        dec = { "r": 0, "g": 0, "b": 0, "a": 0 },
        offset = { "value": 0 },
        cOffset = (info.numOutputChannels == 4) ? 1 : 0,
        getValue = (info.type == FloatType) ? getFloat32 : getFloat16,
        setValue = (info.dataType == 1) ? setFloat16 : setFloat32,
        outBuffer = new Uint8Array(info.width * info.height * info.numOutputChannels * info.dataSize);
    const dv = new DataView(outBuffer.buffer);

    for (let y = 0; y < h; ++y)
    {
        for (let x = 0; x < w; ++x)
        {
            const i = y * w * 4 + x * 4;

            const r = getValue(inBuffer, i);
            const g = getValue(inBuffer, i + 1);
            const b = getValue(inBuffer, i + 2);
            const a = getValue(inBuffer, i + 3);

            const line = (h - y - 1) * w * (3 + cOffset) * info.dataSize;

            decodeLinear(dec, r, g, b, a);

            offset.value = line + x * info.dataSize;
            setValue(dv, dec.a, offset);

            offset.value = line + (cOffset) * w * info.dataSize + x * info.dataSize;
            setValue(dv, dec.b, offset);

            offset.value = line + (1 + cOffset) * w * info.dataSize + x * info.dataSize;
            setValue(dv, dec.g, offset);

            offset.value = line + (2 + cOffset) * w * info.dataSize + x * info.dataSize;
            setValue(dv, dec.r, offset);
        }
    }

    return outBuffer;
}

function compressData(inBuffer, info)
{
    let compress,
        tmpBuffer,
        sum = 0;

    const chunks = { "data": new Array(), "totalSize": 0 },
        size = info.width * info.numOutputChannels * info.blockLines * info.dataSize;

    switch (info.compression)
    {
    case 0:
        compress = compressNONE;
        break;

    case 2:
    case 3:
        compress = compressZIP;
        break;
    }

    console.log("cpmress", compressZIP);

    if (info.compression !== 0)
    {
        tmpBuffer = new Uint8Array(size);
    }

    for (let i = 0; i < info.numBlocks; ++i)
    {
        const arr = inBuffer.subarray(size * i, size * (i + 1));
        const block = compress(arr, tmpBuffer);
        sum += block.length;
        chunks.data.push({ "dataChunk": block, "size": block.length });
    }

    chunks.totalSize = sum;

    return chunks;
}

function compressNONE(data)
{
    return data;
}

function compressZIP(data, tmpBuffer)
{
    //
    // Reorder the pixel data.
    //

    let t1 = 0,
        t2 = Math.floor((data.length + 1) / 2),
        s = 0;

    const stop = data.length - 1;

    while (true)
    {
        if (s > stop) break;
        tmpBuffer[t1++] = data[s++];

        if (s > stop) break;
        tmpBuffer[t2++] = data[s++];
    }

    //
    // Predictor.
    //

    let p = tmpBuffer[0];

    for (let t = 1; t < tmpBuffer.length; t++)
    {
        const d = tmpBuffer[t] - p + (128 + 256);
        p = tmpBuffer[t];
        tmpBuffer[t] = d;
    }

    const deflate = fflate.zlibSync(tmpBuffer);

    return deflate;
}

function fillHeader(outBuffer, chunks, info)
{
    const offset = { "value": 0 };
    const dv = new DataView(outBuffer.buffer);

    setUint32(dv, 20000630, offset); // magic
    setUint32(dv, 2, offset); // mask

    // = HEADER =

    setString(dv, "compression", offset);
    setString(dv, "compression", offset);
    setUint32(dv, 1, offset);
    setUint8(dv, info.compression, offset);

    setString(dv, "screenWindowCenter", offset);
    setString(dv, "v2f", offset);
    setUint32(dv, 8, offset);
    setUint32(dv, 0, offset);
    setUint32(dv, 0, offset);

    setString(dv, "screenWindowWidth", offset);
    setString(dv, "float", offset);
    setUint32(dv, 4, offset);
    setFloat32(dv, 1.0, offset);

    setString(dv, "pixelAspectRatio", offset);
    setString(dv, "float", offset);
    setUint32(dv, 4, offset);
    setFloat32(dv, 1.0, offset);

    setString(dv, "lineOrder", offset);
    setString(dv, "lineOrder", offset);
    setUint32(dv, 1, offset);
    setUint8(dv, 0, offset);

    setString(dv, "dataWindow", offset);
    setString(dv, "box2i", offset);
    setUint32(dv, 16, offset);
    setUint32(dv, 0, offset);
    setUint32(dv, 0, offset);
    setUint32(dv, info.width - 1, offset);
    setUint32(dv, info.height - 1, offset);

    setString(dv, "displayWindow", offset);
    setString(dv, "box2i", offset);
    setUint32(dv, 16, offset);
    setUint32(dv, 0, offset);
    setUint32(dv, 0, offset);
    setUint32(dv, info.width - 1, offset);
    setUint32(dv, info.height - 1, offset);

    setString(dv, "channels", offset);
    setString(dv, "chlist", offset);
    setUint32(dv, info.numOutputChannels * 18 + 1, offset);

    setString(dv, "A", offset);
    setUint32(dv, info.dataType, offset);
    offset.value += 4;
    setUint32(dv, 1, offset);
    setUint32(dv, 1, offset);

    setString(dv, "B", offset);
    setUint32(dv, info.dataType, offset);
    offset.value += 4;
    setUint32(dv, 1, offset);
    setUint32(dv, 1, offset);

    setString(dv, "G", offset);
    setUint32(dv, info.dataType, offset);
    offset.value += 4;
    setUint32(dv, 1, offset);
    setUint32(dv, 1, offset);

    setString(dv, "R", offset);
    setUint32(dv, info.dataType, offset);
    offset.value += 4;
    setUint32(dv, 1, offset);
    setUint32(dv, 1, offset);

    setUint8(dv, 0, offset);

    // null-byte
    setUint8(dv, 0, offset);

    // = OFFSET TABLE =

    let sum = offset.value + info.numBlocks * 8;

    for (let i = 0; i < chunks.data.length; ++i)
    {
        setUint64(dv, sum, offset);

        sum += chunks.data[i].size + 8;
    }
}

function fillData(chunks, info)
{
    const TableSize = info.numBlocks * 8,
        HeaderSize = 259 + (18 * info.numOutputChannels), // 259 + 18 * chlist
        offset = { "value": HeaderSize + TableSize },
        outBuffer = new Uint8Array(HeaderSize + TableSize + chunks.totalSize + info.numBlocks * 8),
        dv = new DataView(outBuffer.buffer);

    fillHeader(outBuffer, chunks, info);

    for (let i = 0; i < chunks.data.length; ++i)
    {
        const data = chunks.data[i].dataChunk;
        const size = chunks.data[i].size;

        setUint32(dv, i * info.blockLines, offset);
        setUint32(dv, size, offset);

        outBuffer.set(data, offset.value);
        offset.value += size;
    }

    return outBuffer;
}

function setUint8(dv, value, offset)
{
    dv.setUint8(offset.value, value);

    offset.value += 1;
}

function setUint32(dv, value, offset)
{
    dv.setUint32(offset.value, value, true);

    offset.value += 4;
}

function setFloat16(dv, value, offset)
{
    dv.setUint16(offset.value, DataUtils.toHalfFloat(value), true);

    offset.value += 2;
}

function setFloat32(dv, value, offset)
{
    dv.setFloat32(offset.value, value, true);

    offset.value += 4;
}

function setUint64(dv, value, offset)
{
    dv.setBigUint64(offset.value, BigInt(value), true);

    offset.value += 8;
}

function setString(dv, string, offset)
{
    const tmp = textEncoder.encode(string + "\0");

    for (let i = 0; i < tmp.length; ++i)
    {
        setUint8(dv, tmp[i], offset);
    }
}

function decodeFloat16(binary)
{
    const exponent = (binary & 0x7C00) >> 10,
        fraction = binary & 0x03FF;

    return (binary >> 15 ? -1 : 1) * (
        exponent ?
            (
                exponent === 0x1F ?
                    fraction ? NaN : Infinity :
                    Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
            ) :
            6.103515625e-5 * (fraction / 0x400)
    );
}

function getFloat16(arr, i)
{
    return decodeFloat16(arr[i]);
}

function getFloat32(arr, i)
{
    return arr[i];
}
