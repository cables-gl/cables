
class PixelReader
{
    constructor()
    {
        this.pixelData = null;
        this._finishedFence = true;
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
        const isFloatingPoint = textureType == CGL.Texture.TYPE_FLOAT;
        if (isFloatingPoint) channelType = gl.FLOAT;

        const size = 4 * w * h;

        if (!this._pixelData)
            if (isFloatingPoint) this._pixelData = new Float32Array(size);
            else this._pixelData = new Uint8Array(size);


        if (this._finishedFence)
        {
            this._pbo = gl.createBuffer();
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, 4 * 4, gl.DYNAMIC_READ);
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
                let starttime = performance.now();
                this._wasTriggered = false;
                // texChanged = false;

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
