const
    exec = op.inTrigger("Exec"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Uniforms", null);

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
            let v = shader._uniforms[i]._value;
            if (v instanceof Float32Array) v = Array.from(v);

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
