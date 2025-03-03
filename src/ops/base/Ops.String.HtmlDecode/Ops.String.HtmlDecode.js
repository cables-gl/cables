const
    instr = op.inString("String", "default"),
    result = op.outString("result");

let textArea = document.createElement("textarea");

instr.onChange = () =>
{
    result.set(decodeHTMLEntities(instr.get() || ""));
};

function decodeHTMLEntities(text)
{
    textArea.innerHTML = text;
    return textArea.value;
}

op.onDelete = () =>
{
    textArea.remove();
};
