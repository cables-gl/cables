const
    str = op.inString("Text"),
    inPrefix = op.inString("Prefix", "Ops."),
    inBaseUrl = op.inString("BaseURL", "https://dev.cables.gl/op/"),
    inClass = op.inString("Classname", ""),
    inTarget = op.inString("Target", ""),
    result = op.outString("Result");

function linkPrefixedWords(text, prefix, baseUrl)
{
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|\\s)(${escaped}\\w+(?:\\.\\w+)*)`, "g");

    return text.replace(
        regex,
        (match, leading, word) => { return leading + "<a href=\"" + baseUrl + encodeURIComponent(word) + "\" class=\"" + inClass.get() + "\" target=\"" + inTarget.get() + "\">" + word + "</a>"; });
}

inClass.onChange =
    inTarget.onChange =
    str.onChange = () =>
    {
        let s = str.get() || "";
        s = linkPrefixedWords(s, inPrefix.get() || "", inBaseUrl.get() || "");

        result.set(s);
    };
