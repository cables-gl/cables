const
    exec = op.inTrigger("Exec"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Uniforms", null, 3);

const cgl = op.patch.cgl;

exec.onTriggered = update;

function update()
{
    const shader = cgl.getShader();

    if (shader)
    {
        let lines = [];

        for (let i = 0; i < shader._uniforms.length; i++)
        {
            // let str = "";

            // if (shader._uniforms[i]._value && shader._uniforms[i]._value.length)
            // {
            //     for (let j = 0; j < shader._uniforms[i]._value.length; j++)
            //     {
            //         str += shader._uniforms[i]._value[j];

            //         if (j < shader._uniforms[i]._value.length - 1)str += ", ";
            //     }
            // }
            // else
            //     str += JSON.stringify(shader._uniforms[i]._value);

            let v = shader._uniforms[i]._value;
            if (v instanceof Float32Array)
            {
                console.log("arraybuff");
                v = Array.from(v);
            }

            lines.push(
                {
                    "name": shader._uniforms[i]._name,
                    "type": shader._uniforms[i]._type,
                    "value": v

                });
        }

        outArr.setRef(lines);
    }
    next.trigger();
}
