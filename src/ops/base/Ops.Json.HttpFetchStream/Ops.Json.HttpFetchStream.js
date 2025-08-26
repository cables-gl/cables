const
    inres = op.inObject("Fetch Response"),
    outObje = op.outObject("Result"),
    outTrig = op.outTrigger("Received Result"),
    outStart = op.outTrigger("Started");

inres.onChange = start;
let reader;
let decoder;
let outputElement;
let iv = 0;
function start()
{
    const response = inres.get();
    if (!response) return;
    outStart.trigger();
    try
    {
        reader = response.body.getReader();
        decoder = new TextDecoder("utf-8");
        outputElement = document.getElementById("output");

        let done = false;
        clearInterval(iv);
        iv = setInterval(read, 50);
    }
    catch (e) { console.log("text", e); }
}

function read()
{
    reader.read().then((r) =>
    {
        let done = false;
        if (r.value)
        {
            let chunk = decoder.decode(r.value, { "stream": true }).trim();

             if (chunk.length == 0)done = true;

            if (!done)
            {
                const parts = chunk.split("\n").filter(Boolean);

                parts.forEach((part) =>
                {
                    try
                    {
                        if (part.indexOf("data: [DONE]") == 0)done = true; // wtf
                        if (part.indexOf("[DONE]") == 0)part = part.substr(6); // wtf
                        if (part.indexOf("data: ") == 0)part = part.substr(6); // wtf
                        if(!done)
                        {
                            const json = JSON.parse(part);
                            outObje.setRef(json);
                            outTrig.trigger();
                        }
                    }
                    catch (err)
                    {
                        console.log("Error parsing chunk:", err);
                    }
                });
            }
        }
    });
}
