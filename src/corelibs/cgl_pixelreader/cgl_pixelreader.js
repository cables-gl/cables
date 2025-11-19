import { Logger } from "cables-shared-client";

export class PixelReader
{
    constructor()
    {
        this._log = new Logger("LoadingStatus");

        this.pixelData = null;
        this._finishedFence = true;
        this._size = 0;
        this._pbo = null;
    }

    _fence(cgl)
    {
        const gl = cgl.gl;
        this._finishedFence = false;
        return new Promise(function (resolve, reject)
        {
            if (cgl.aborted) return;
            let sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!sync) return;
            gl.flush(); // Ensure the fence is submitted.

            function check()
            {
                if (cgl.aborted) return;
                const status = gl.clientWaitSync(sync, 0, 0);

                if (status == gl.WAIT_FAILED)
                {
                    console.error("fence wait failed");
                    if (reject) reject();
                }
                else
                if (status == gl.TIMEOUT_EXPIRED)
                {
                    // this._log.log("TIMEOUT_EXPIRED");
                    return setTimeout(check, 0);
                }
                else
                if (status == gl.CONDITION_SATISFIED)
                {
                    // this._log.log("CONDITION_SATISFIED");
                    resolve();
                    gl.deleteSync(sync);
                }
                else if (status == gl.ALREADY_SIGNALED)
                {
                    // this._log.log("already signaled");
                    resolve();
                    gl.deleteSync(sync);
                }
                else
                {
                    this._log.log("unknown fence status", status);
                }
            }

            // setTimeout(check, 3);
            check();
        });
    }

    read(cgl, fb, pixelFormat, x, y, w, h, finishedcb)
    {
        if (CABLES.UI)
            if (!CABLES.UI.loaded || performance.now() - CABLES.UI.loadedTime < 1000) return;

        if (!this._finishedFence) return;

        const gl = cgl.gl;
        let bytesPerItem = 1;

        if (cgl.aborted) return;
        if (!fb) return;

        if (pixelFormat === CGL.Texture.TYPE_FLOAT) pixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
        // let isFloatingPoint = pixelFormat == CGL.Texture.TYPE_FLOAT; // old parameter was "textureType", now it is pixelformat, keeping this for compatibility...

        let isFloatingPoint = CGL.Texture.isPixelFormatFloat(pixelFormat);

        if (isFloatingPoint)bytesPerItem = 4;
        if (CGL.Texture.isPixelFormatHalfFloat(pixelFormat)) bytesPerItem = 2;

        const pixelInfo = CGL.Texture.setUpGlPixelFormat(cgl, pixelFormat);
        const numItems = pixelInfo.numColorChannels * w * h;

        if (w == 0 || h == 0 || numItems == 0) return;

        if (!this._pixelData || this._size != numItems * bytesPerItem)
        {
            if (bytesPerItem > 1) this._pixelData = new Float32Array(numItems);
            else this._pixelData = new Uint8Array(numItems);

            this._size = numItems * bytesPerItem;
        }

        let channelType = gl.UNSIGNED_BYTE;
        if (bytesPerItem > 1)channelType = gl.FLOAT;

        if (this._size == 0 || !this._pixelData)
        {
            this._log.error("readpixel size 0", this._size, w, h);
            return;
        }

        if (this._finishedFence)
        {
            this._pbo = gl.createBuffer();
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, this._pixelData.byteLength, gl.DYNAMIC_READ);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
            cgl.profileData.profileFencedPixelRead++;

            if (this._size != numItems * bytesPerItem)
                this._log.error("buffer size invalid", numItems, w, h, bytesPerItem);

            let dataType = pixelInfo.glDataType;
            if (bytesPerItem > 1)dataType = cgl.gl.FLOAT;

            let format = pixelInfo.glDataFormat;
            gl.readPixels(x, y, w, h, format, dataType, 0);

            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        let startLength = this._pixelData.byteLength;

        if (this._finishedFence && this._pbo)
            this._fence(cgl).then((error) =>
            {
                this._wasTriggered = false;
                this._finishedFence = true;

                if (!error && this._pixelData && this._pixelData.byteLength == startLength)
                {
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._pbo);
                    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this._pixelData);
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

                    if (finishedcb) finishedcb(this._pixelData);
                }
                gl.deleteBuffer(this._pbo);
                this._pbo = null;
            });

        return true;
    }
}
