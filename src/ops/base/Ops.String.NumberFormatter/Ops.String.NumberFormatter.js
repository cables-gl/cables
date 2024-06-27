const inNum = op.inFloat("Input Number");
const inLocaleSwitch = op.inSwitch("Locale", ["browser", "custom"], "browser");
const inLocaleString = op.inString("Locale string", "en-US");
const inStyle = op.inSwitch("Style", ["decimal", "currency", "percent"], "decimal");
const inMinDig = op.inInt("Minimum Integer Digits", 1);
const inMinFrac = op.inInt("Minimum Fraction Digits", 3);
const inMaxFrac = op.inInt("Maximum Fraction Digits", 3);
op.setPortGroup("Format", [inMinDig, inMinFrac, inMaxFrac]);
const inMinSign = op.inInt("Minimum Significant Digits", 0);
const inMaxSign = op.inInt("Maximum Significant Digits", 0);
op.setPortGroup("Significant Digits", [inMaxSign, inMinSign]);
const inUseGroup = op.inBool("Use Grouping", true);

const inCurrencyName = op.inString("Currency Name", "EUR");
const inCurrencyDisplay = op.inSwitch("Currency Display", ["symbol", "code", "name"], "symbol");
op.setPortGroup("Currency", [inCurrencyName, inCurrencyDisplay]);

const outString = op.outString("Formatted Number", "0,000");
const outError = op.outBoolNum("Has error");

// Bind functions
inNum.onChange = inLocaleString.onChange =
inStyle.onChange = inMaxFrac.onChange =
inMaxSign.onChange = inMinFrac.onChange =
inMinDig.onChange = inMinSign.onChange =
inUseGroup.onChange = inCurrencyName.onChange =
inCurrencyDisplay.onChange = inLocaleSwitch.onChange = formatNumber;

function formatNumber()
{
    const num = inNum.get();
    const style = inStyle.get();

    let minimumFractionDigits = CABLES.clamp(inMinFrac.get(), 0, 20);
    let maximumFractionDigits = CABLES.clamp(inMaxFrac.get(), 0, 20);

    op.setUiError("minmaxfrac", null);
    if (minimumFractionDigits > maximumFractionDigits)
    {
        op.setUiError("minmaxfrac", "Minimum bigger than maximum for fraction digits, using minimum", 1);
        maximumFractionDigits = minimumFractionDigits;
    }

    let opts = {
        "style": style,
        "minimumFractionDigits": minimumFractionDigits,
        "maximumFractionDigits": maximumFractionDigits,
        "minimumIntegerDigits": CABLES.clamp(inMinDig.get(), 1, 21),
        "useGrouping": inUseGroup.get() == true
    };

    if (inMinSign.get() > 0) opts.minimumSignificantDigits = CABLES.clamp(inMinSign.get(), 1, 21);
    if (inMaxSign.get() > 0) opts.maximumSignificantDigits = CABLES.clamp(inMaxSign.get(), 1, 21);

    op.setUiError("minmaxsig", null);
    if (opts.minimumSignificantDigits > opts.maximumSignificantDigits)
    {
        op.setUiError("minmaxsig", "Minimum bigger than maximum for significant digits, using minimum", 1);
        opts.maximumSignificantDigits = opts.minimumSignificantDigits;
    }

    if (style === "currency")
    {
        opts.currency = inCurrencyName.get();
        opts.currencyDisplay = inCurrencyDisplay.get();
    }

    try
    {
        let res = "";
        if (inLocaleSwitch.get() === "browser")
            res = num.toLocaleString([], opts);
        else
            res = num.toLocaleString(inLocaleString.get(), opts);

        outString.set(res);

        if (outError.get())
            op.setUiError("format_error", null);
        outError.set(false);
    }
    catch (e)
    {
        outError.set(true);
        outString.set("");
        op.setUiError("format_error", e);
    }
}
