
const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    result = op.outString("Result");

exec.onTriggered = () =>
{
    op.patch.tempData.compScad={
        src:"\n",
        varNames:{},
        indent:0,
        addLine:(s="")=>{
            let str=""
            for (var i = 0; i < op.patch.tempData.compScad.indent; i++)str+="    ";
            str+=s+"\n";
            op.patch.tempData.compScad.src+=str
        },
        op:(op)=>{
            if(op.uiAttribs.comment)op.patch.tempData.compScad.addLine("// "+op.uiAttribs.comment)
            // if(op.isCurrentUiOp())op.patch.tempData.compScad.src+="#";
        },
        indentStart:()=>{
            op.patch.tempData.compScad.indent++
        },
        indentEnd:()=>{
            op.patch.tempData.compScad.indent--
        },
        portValue:(p)=>{
            if(p&&p.getVariableName&&p.getVariableName())
            {
                op.patch.tempData.compScad.varNames[p.getVariableName()]=true
                return p.getVariableName();
            }
            return p.get()
        }

    }
    next.trigger()


    const varnames=Object.keys(op.patch.tempData.compScad.varNames)

    for (var i = 0; i < varnames.length; i++)
    {
        const v = op.patch.getVar(varnames[i]);
        op.patch.tempData.compScad.src=(varnames[i]+"="+v.getValue())+";\n"+op.patch.tempData.compScad.src
    }

    result.set(op.patch.tempData.compScad.src)
};
