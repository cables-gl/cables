const
    exec = op.inTrigger("Trigger"),
    inColOp = op.inDropDown("Color Operation", ["add", "subtract", "reverse-subtract", "min", "max"], "add"),
    inColSrcFactor = op.inDropDown("Color Src Factor", ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"], "one"),
    inColDstFactor = op.inDropDown("Color Dst Factor", ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"], "one"),
    inAlphaOp = op.inDropDown("Alpha Operation", ["add", "subtract", "reverse-subtract", "min", "max"], "add"),
    inAlphaSrcFactor = op.inDropDown("Alpha Src Factor", ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"], "one"),
    inAlphaDstFactor = op.inDropDown("Alpha Dst Factor", ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"], "one"),
    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

let blend = {
    "color": {
        "operation": "add",
        "srcFactor": "one",
        "dstFactor": "zero",
    },
    "alpha": {
        "operation": "add",
        "srcFactor": "one",
        "dstFactor": "zero",
    },
};

inColOp.onChange =
    inColSrcFactor.onChange =
    inColDstFactor.onChange =
    inAlphaOp.onChange =
    inAlphaSrcFactor.onChange =
    inAlphaDstFactor.onChange = () => { updateObj(); };

function updateObj()
{
    blend = {
        "color": {
            "operation": inColOp.get(),
            "srcFactor": "one",
            "dstFactor": "one-minus-src-alpha"
        },
        "alpha": {
            "operation": inAlphaOp.get(),
            "srcFactor": "one",
            "dstFactor": "one-minus-src-alpha"
        },
    };
}

exec.onTriggered = () =>
{
    op.patch.cgp.pushBlend(blend);

    next.trigger();

    op.patch.cgp.popBlend();
};
