const inArray = op.inArray("Array In");
const outString = op.outString("String");

inArray.onChange = function() {
    if (!inArray.get()) {
        outString.set("");
        return;
    }

    const arr = inArray.get();
    let result = "";

    for (let i = 0; i < arr.length; i += 1) {
        const objToString = JSON.stringify(arr[i]);
        result += "\n" + objToString;
    }

    outString.set(result);
}