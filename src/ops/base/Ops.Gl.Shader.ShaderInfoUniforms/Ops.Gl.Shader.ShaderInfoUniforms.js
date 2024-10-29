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

        console.log(shader._uniforms);

        for (let i = 0; i < shader._uniforms.length; i++)
        {
            lines.push(shader._uniforms[i]._name);

            let str = "";

            if (shader._uniforms[i]._value && shader._uniforms[i]._value.length)
            {
                for (let j = 0; j < shader._uniforms[i]._value.length; j++)
                {
                    str += shader._uniforms[i]._value[j];

                    if (j < shader._uniforms[i]._value.length - 1)str += ", ";
                }
            }
            else
                str += JSON.stringify(shader._uniforms[i]._value);

            if (!shader._uniforms[i]._isValidLoc())str += " invalid Loc!";
            lines.push(str);

            lines.push(shader._uniforms[i]._type);
        }

        outArr.setRef(lines);
    }
    next.trigger();
}
