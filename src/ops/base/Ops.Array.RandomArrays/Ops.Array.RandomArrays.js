const inModeSwitch = op.inSwitch("Mode",["A","AB", "ABC", "ABCD"],"A");
const numValues=op.inValueInt("Num Values",100);
const inSeed = op.inValueFloat("Random Seed ", 0);
const inInteger = op.inBool("Integer", false);

const letters = ["A", "B", "C", "D"];

const inArray = letters.map(function(value) {
    return {
        min: op.inValueFloat("Min " + value, -1),
        max: op.inValueFloat("Max " + value, 1),
    }
});

for (let i = 0; i < inArray.length; i += 1) {
    const portObj = inArray[i];
    const keys = Object.keys(portObj);

    op.setPortGroup("Value Range " + letters[i], keys.map(function(key) { return portObj[key] }));

    if (i > 0) keys.forEach(function(key) { portObj[key].setUiAttribs({ greyout: true })});
}

const outValues = op.outArray("Array Out");

inModeSwitch.onChange = function() {
    const mode = inModeSwitch.get();
    const modes = inModeSwitch.uiAttribs.values;

    const index = modes.indexOf(mode);

    inArray.forEach(function(portObj, i) {
        const keys = Object.keys(portObj);
        keys.forEach(function(key, j) {
            if (i <= index) portObj[key].setUiAttribs({ greyout: false });
            else portObj[key].setUiAttribs({ greyout: true });
        });
    });
    init();
}

const outTotalPoints = op.outNumber("Chunks Amount");
const outArrayLength = op.outNumber("Array length");


outValues.ignoreValueSerialize=true;

numValues.onChange = inSeed.onChange = inInteger.onChange = init;

const minMaxArray = [];

init();

function init() {
    const arr = [];
    const mode = inModeSwitch.get();
    const modes = inModeSwitch.uiAttribs.values;
    const index = modes.indexOf(mode);

    Math.randomSeed = inSeed.get();

    const dimension = index + 1;
    const length = Math.floor(Math.abs(numValues.get() * dimension));


    arr.length = length;
    const tupleLength = length / dimension;
    const isInteger = inInteger.get();



    // optimization: we only need to fetch the max min for each component once
        for (let i = 0; i < dimension; i += 1) {
            const portObj = inArray[i];
            const max = portObj.max.get();
            const min = portObj.min.get();
            minMaxArray[i] = [min, max];
        }


    for (let j = 0; j < tupleLength; j += 1) {
        for (let k = 0; k < dimension; k += 1) {

            const min = minMaxArray[k][0];
            const max = minMaxArray[k][1];
            const index = j * dimension + k;

            if (isInteger) arr[index] = Math.floor(Math.seededRandom() * ((max + 1) - min) + min);
            else arr[index] = Math.seededRandom() * (max - min) + min;

        }
    }

    outValues.set(null);

    outValues.set(arr);
    outTotalPoints.set(arr.length/dimension);
    outArrayLength.set(arr.length);
};

// assign change handler
inArray.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        const x = obj[key];
        x.onChange = init;

    });
});