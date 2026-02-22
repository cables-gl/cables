// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    result = op.outString("Result");

exec.onTriggered = () =>
{
    op.patch.tempData.compScad={
        src:"",
        indent:0,
        addLine:(s="")=>{
            let str=""
            for (var i = 0; i < op.patch.tempData.compScad.indent; i++)str+="    ";
            str+=s+"\n";
            op.patch.tempData.compScad.src+=str
        },

        indentStart:()=>{
            op.patch.tempData.compScad.indent++
        },
        indentEnd:()=>{
            op.patch.tempData.compScad.indent--
        }

    }
    next.trigger()
    result.set(op.patch.tempData.compScad.src)
};
