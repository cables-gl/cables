
class PixelReader
{
    constructor()
    {
        this.pixelData = null;
        this._finishedFence = true;
        this._size = 0;
        this._pbo = null;
    }

    _fence(gl)
    {
        this._finishedFence = false;
        return new Promise(function (resolve, reject)
        {
            let sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!sync) return;
            gl.flush(); // Ensure the fence is submitted.
            function check()
            {
                const status = gl.clientWaitSync(sync, 0, 0);

                if (status == gl.WAIT_FAILED)
                {
                    if (reject) reject();
                }
                else
                if (status == gl.TIMEOUT_EXPIRED)
                {
                    setTimeout(check, 0);
                }
                else
                if (status == gl.CONDITION_SATISFIED)
                {
                    resolve();
                    gl.deleteSync(sync);
                }
                else
                {
                    console.log("unknown fence status", status);
                }
            }

            check();
        });
    }


    read(cgl, fb, textureType, x, y, w, h, finishedcb)
    {
        const gl = cgl.gl;
        let channelType = gl.UNSIGNED_BYTE;
        let bytesPerItem = 1;

        const isFloatingPoint = textureType == CGL.Texture.TYPE_FLOAT;
        const numItems = 4 * w * h;

        if (isFloatingPoint)
        {
            channelType = gl.FLOAT;
            bytesPerItem = 4;
        }

        if (!this._pixelData || this._size != numItems * bytesPerItem)
        {
            if (isFloatingPoint) this._pixelData = new Float32Array(numItems);
            else this._pixelData = new Uint8Array(numItems);

            this._size = numItems * bytesPerItem;
        }

        if (this._size == 0)
        {
            console.error("readpixel size 0");
            return;
        }

        if (this._finishedFence)
        {
            this._pbo = gl.createBuffer();
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, this._size, gl.DYNAMIC_READ);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);

            gl.readPixels(
                x, y,
                w, h,
                gl.RGBA,
                channelType,
                0
            );

            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        if (this._finishedFence)
            this._fence(gl).then(() =>
            {
                this._wasTriggered = false;

                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
                gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this._pixelData);
                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
                this._finishedFence = true;
                gl.deleteBuffer(this._pbo);

                if (finishedcb) finishedcb(this._pixelData);
            });
    }
}

export { PixelReader };
