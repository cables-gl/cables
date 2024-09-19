// export default class UniformBuffer
// {
//     constructor(shader, shaderType)
//     {
//         this._shaderType = shaderType; // frag, vert...
//         this._shader = shader;
//         this._cgp = shader._cgp;

//         this._gpuBuffer = null;
//         this._values = null;

//         this._sizeBytes = 0;
//         this.update();
//     }

//     update()
//     {
//         this._sizeBytes = 0;

//         for (let i = 0; i < this._shader.uniforms.length; i++)
//         {
//             const uni = this._shader.uniforms[i];

//             if (this._shaderType == uni.shaderType) this._sizeBytes += uni.getSizeBytes();
//         }

//         this._gpuBuffer = this._cgp.device.createBuffer(
//             {
//                 "size": this._sizeBytes,
//                 "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//             });


//         this._values = new Float32Array(this._sizeBytes / 4);
//         this.updateUniformValues();
//     }

//     updateUniformValues()
//     {
//         let count = 0;
//         for (let i = 0; i < this._shader.uniforms.length; i++)
//         {
//             const uni = this._shader.uniforms[i];
//             if (uni.shaderType == this._shaderType)
//             {
//                 if (uni.getSizeBytes() / 4 > 1)
//                 {
//                     for (let j = 0; j < uni.getValue().length; j++)
//                     {
//                         this._values[count] = uni.getValue()[j];
//                         count++;
//                     }
//                 }
//                 else
//                 {
//                     this._values[count] = uni.getValue();
//                     count++;
//                 }
//             }
//         }


//         this._cgp.device.queue.writeBuffer(
//             this._gpuBuffer,
//             0,
//             this._values.buffer,
//             this._values.byteOffset,
//             this._values.byteLength
//         );
//     }
// }
