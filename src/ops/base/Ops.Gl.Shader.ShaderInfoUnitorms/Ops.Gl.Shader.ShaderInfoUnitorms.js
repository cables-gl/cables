const
    exec = op.inTrigger("Exec"),
    next = op.outTrigger("Next"),
    outStr = op.outString("Uniforms");

const cgl = op.patch.cgl;

exec.onTriggered = update;

function update()
{
    const shader = cgl.getShader();
    let str = "";

    // if (doUniformDump)
    {
        // const json = [];
        for (let i = 0; i < shader._uniforms.length; i++)
        {
            str += shader._uniforms[i]._name + ": ";
            // +JSON.stringify(shader._uniforms[i]._value);

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

            str += "\n";

            // json.push({
            //     "validLoc": shader._uniforms[i]._isValidLoc(),
            //     "name": shader._uniforms[i]._name,
            //     "type": shader._uniforms[i]._type,
            //     "value": shader._uniforms[i]._value,
            //     "structName": shader._uniforms[i]._structName,
            //     "structUniformName": shader._uniforms[i]._structUniformName
            // });
        }

        // console.log(json);

        // showCodeModal("shader uniforms", JSON.stringify(json, false, 2), "json");

        outStr.set(str);

        // doUniformDump = false;
    }

    next.trigger();
}
