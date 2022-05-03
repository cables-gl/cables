if(CABLES.hasOwnProperty("fakefxhash") && !window.fxhash)
{
    CABLES.fakefxhash=true;
}

const
    isReal = (!!window.fxhash && !CABLES.UI && !CABLES.FXHASH),
    alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

const
    inHash = op.inString("Hash", ""),
    inRandomizeHash=op.inTriggerButton("Randomize Hash"),
    outHash = op.outString("fxhash", window.fxhash || CABLES.uuid()),
    outRandom1=op.outNumber("fxrand 1"),
    outRandom2=op.outNumber("fxrand 2"),
    outRandom3=op.outNumber("fxrand 3"),
    outRandom4=op.outNumber("fxrand 4"),
    outArr=op.outArray("Random Numbers"),
    outEmbedded = op.outBoolNum("fxhash environment", isReal);

inHash.onChange=init;

let inited=false;

inRandomizeHash.onTriggered=()=>
{
    let str="";
    const all=alphabet.length-1;

    for(let i=0;i<51;i++)
    {
        str+=alphabet[Math.round(Math.random()*all)];
    }
    inHash.set(str);
    op.refreshParams();
};

function init()
{
    if(isReal && inited)return;
    if(!isReal)
    {
        CABLES.FXHASH=true; // fake fxhash env...
        window.fxhash = inHash.get();
        let b58dec = (str) => str.split("").reduce((p, c, i) => p + alphabet.indexOf(c) * (Math.pow(alphabet.length, str.length - i - 1)), 0);
        let fxhashTrunc = fxhash.slice(2);
        let regex = new RegExp(".{" + ((fxhash.length / 4) | 0) + "}", "g");
        let hashes = fxhashTrunc.match(regex).map((h) => b58dec(h));
        let sfc32 = (a, b, c, d) =>
            () =>
            {
                a |= 0; b |= 0; c |= 0; d |= 0;
                let t = (a + b | 0) + d | 0;
                d = d + 1 | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = c << 21 | c >>> 11;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            };
        window.fxrand = sfc32(...hashes);
    }

    inited=true;

    outHash.set(window.fxhash);

    outRandom1.set(0);
    outRandom2.set(0);
    outRandom3.set(0);
    outRandom4.set(0);

    outRandom1.set(fxrand());
    outRandom2.set(fxrand());
    outRandom3.set(fxrand());
    outRandom4.set(fxrand());

    const arr=[];
    for(let i=0;i<1000;i++)arr.push(fxrand());
    outArr.set(arr);

}

