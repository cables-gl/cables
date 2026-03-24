const
    inStr = op.inString("String"),
    inPrefix = op.inString("Prefix"),
    inUrl = op.inString("Url"),
    inActive = op.inBool("Active", true),
    outStr = op.outString("Result");

function linkifyPrefix(markdown, prefix, baseUrl)
{
    const regex = new RegExp(`(${prefix}[^ ]*)`, "g");
    return markdown.replace(
        regex,
        (match, word) => { return `[${word}](${baseUrl}/${word})`; }
    );
}

inActive.onChange =
inUrl.onChange =
inPrefix.onChange =
inStr.onChange = () =>
{
    if (inActive.get() && inStr.get() && inPrefix.get() && inUrl.get())
        outStr.set(linkifyPrefix(inStr.get() || "", inPrefix.get(), inUrl.get()));
    else
        outStr.set(inStr.get());
};
