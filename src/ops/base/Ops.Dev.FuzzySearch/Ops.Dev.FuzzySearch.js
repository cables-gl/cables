const inSearch = op.inTriggerButton("Search");
const inTextInput = op.inString("Text input");
const inObjects = op.inArray("Values");

const inKeysStr = op.inString("Keys", "");
const inMaxResults = op.inInt("Max results", 0);
const useExtendedSearch = op.inBool("Extended search", false);

const isCaseSensitive = op.inBool("Case sensitive", false);
const includeScore = op.inBool("Include score", false);
const includeMatches = op.inBool("Include matched characters", false);
const minMatchCharLength = op.inInt("Min match char length", 1);
const shouldSort = op.inBool("Sort by score", true);
const findAllMatches = op.inBool("findAllMatches", false);

op.setPortGroup("Basic options", [isCaseSensitive,
    includeScore, includeMatches, minMatchCharLength, shouldSort,
    findAllMatches
]);

const location = op.inInt("Approximate location (char)", 0);
const threshold = op.inFloatSlider("Score threshold (lower is more selective)", 0.6);
const distance = op.inInt("Distance from location (char)", 100);
const ignoreLocation = op.inBool("Ignore location", false);

op.setPortGroup("Fuzzy Matching options", [location,
    threshold, distance, ignoreLocation
]);

const inKeysArr = op.inArray("Keys (array)");
const inOptions = op.inObject("Options");
const inIndex = op.inObject("Pre-computed index");

op.setPortGroup("Overrides", [inKeysArr, inOptions, inIndex]);

const outFinished = op.outTrigger("Finished");
const outResults = op.outArray("Results");
const outItems = op.outArray("Items");
const outError = op.outBool("Has error");


inSearch.onTriggered = search;
inObjects.onChange = updateIndex;

useExtendedSearch.onChange =
inMaxResults.onChange =
isCaseSensitive.onChange =
includeScore.onChange =
includeMatches.onChange =
minMatchCharLength.onChange =
shouldSort.onChange =
findAllMatches.onChange =
location.onChange =
threshold.onChange =
distance.onChange =
ignoreLocation.onChange = search;

inKeysArr.onChange =
inKeysStr.onChange =
inObjects.onChange = needToReindex;

let fuseObj = null;
let indexCreated = false;


function needToReindex()
{
    indexCreated = false;
}

function updateIndex()
{
    if (!fuseObj) return false;

    const values = inObjects.get();

    if (!values) return false;

    const idx = inIndex.get();
    fuseObj.setCollection(values, idx);
    indexCreated = true;
    return true;
}

function setOptions()
{
    if (!fuseObj) return false;
    let opts = inOptions.get();
    if (!opts)
    {
        opts = {
            "useExtendedSearch": useExtendedSearch.get(),
            "isCaseSensitive": isCaseSensitive.get(),
            "includeScore": includeScore.get(),
            "includeMatches": includeMatches.get(),
            "minMatchCharLength": minMatchCharLength.get(),
            "shouldSort": shouldSort.get(),
            "findAllMatches": findAllMatches.get(),
            "location": location.get(),
            "threshold": threshold.get(),
            "distance": distance.get(),
            "ignoreLocation": ignoreLocation.get()
        };
    }

    // Update Fuse config
    for (const [key, value] of Object.entries(opts))
    {
        if (fuseObj.options.hasOwnProperty(key))
            fuseObj.options[key] = value;
    }

    return true;
}

function setKeys()
{
    if (!fuseObj) return false;
    let keys = inKeysArr.get();
    if (!keys)
    {
        keys = inKeysStr.get();
        if (!keys) return false;

        keys = keys.split(" ");
    }

    fuseObj.options.keys = keys;
    return true;
}

function search()
{
    if (window.Fuse === undefined)
    {
        outError.set(true);
        return;
    }
    outError.set(false);
    outResults.set(null);
    outItems.set(null);

    const text = inTextInput.get();
    if (!text)
    {
        outResults.set(null);
        return;
    }

    let ok = false;
    if (!fuseObj)
    {
        fuseObj = new Fuse();
    }

    let fuseError = null;
    op.setUiError("fuse", fuseError);

    ok = setOptions();
    if (!ok)
    {
        fuseError = "error setting options";
    }

    ok = setKeys();
    if (!ok)
    {
        fuseError = "error setting keys";
    }

    if (!indexCreated)
    {
        ok = updateIndex();
        if (!ok)
        {
            fuseError = "error building index";
        }
    }
    if (fuseError)
    {
        op.setUiError("fuse", fuseError, 1);
        return;
    }

    let results;
    if (inMaxResults.get() > 0)
    {
        results = fuseObj.search(text, { "limit": inMaxResults.get() });
    }
    else
    {
        results = fuseObj.search(text);
    }

    outResults.set(results);
    outItems.set(results.map((r) => { return r.item; }));
    outFinished.trigger();
}
