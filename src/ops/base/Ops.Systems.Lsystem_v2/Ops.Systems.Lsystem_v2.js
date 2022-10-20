const inExe = op.inTrigger("Trigger");
const inStrAxiom = op.inString("Axiom / seed", "F");
const inStrConstant1 = op.inString("Constant 1", "F");
const inStrRule1 = op.inString("Rule 1", "Fx5y2.2F[yxFF]fF[yXFFfzFZF]fF[yXzFFfzFZF]");
const inStrConstant2 = op.inString("Constant 2", "x");
const inStrRule2 = op.inString("Rule 2");
const inStrConstant3 = op.inString("Constant 3", "y");
const inStrRule3 = op.inString("Rule 3");
const inStrConstant4 = op.inString("Constant 4", "z");
const inStrRule4 = op.inString("Rule 4");

inStrAxiom.setUiAttribs({ "hidePort": true });
inStrConstant1.setUiAttribs({ "hidePort": true });
inStrRule1.setUiAttribs({ "hidePort": true });
inStrConstant2.setUiAttribs({ "hidePort": true });
inStrRule2.setUiAttribs({ "hidePort": true });
inStrConstant3.setUiAttribs({ "hidePort": true });
inStrRule3.setUiAttribs({ "hidePort": true });
inStrConstant4.setUiAttribs({ "hidePort": true });
inStrRule4.setUiAttribs({ "hidePort": true });

const inIterations = op.inValueInt("Iterations", 1);
const inStepLength = op.inValue("Step length", 1.0);
const inStepScale = op.inValue("Step scale multiplier", 1.0);
const inDefaultAngle = op.inValue("Default angle", 45.0);
const inRotateMutliplier = op.inValue("Rotation multiplier", 1.0);

const outTrigger = op.outTrigger("Out trigger geometry");
const lineTrigger = op.outTrigger("Line/point trigger");
// const outArray = op.outArray("Matrix Array out");
const outPoints = op.outArray("Points out");
const outMax = op.outNumber("Max Size");
const stringOut = op.outString("Final generated string");

const seed = op.inValue("random seed");
const inRandStr = op.inValue("random strength");

let angleMultiplier = inRotateMutliplier.get();
let len = inStepLength.get();
let lenScale = inStepScale.get();

const cgl = op.patch.cgl;

// create a matrix
let trans = mat4.create();
// array to put trans into
const transforms = [];
// pop in and out matrix for branch transforms
const stack = [];

// used for splines array
const pointArrays = [];
let currentPointArray = [];
const lastPointArray = [0, 0, 0];

// this becomes the axiom after the resetAll() is called
let sentence = "";// axiom;

// an array that holds the string replacment rules
let rules = [];

let needsCalc = true;
// UI input
inRotateMutliplier.onChange = calcLater;
inStepLength.onChange = calcLater;
inStepScale.onChange = calcLater;
inIterations.onChange = calcLater;
inExe.onTriggered = render;
seed.onChange = calcLater;
inRandStr.onChange = calcLater;
inDefaultAngle.onChange = calcLater;

// if user changes rules or constants definesRules is updated
inStrAxiom.onChange = defineRules;
inStrConstant1.onChange = defineRules;
inStrRule1.onChange = defineRules;
inStrConstant2.onChange = defineRules;
inStrRule2.onChange = defineRules;
inStrConstant3.onChange = defineRules;
inStrRule3.onChange = defineRules;
inStrConstant4.onChange = defineRules;
inStrRule4.onChange = defineRules;

op.init = function ()
{
    defineRules();
};
// creates the constants and the rule sets
function defineRules()
{
    rules =
    [
        inStrConstant1.get(),
        inStrRule1.get(),
        inStrConstant2.get(),
        inStrRule2.get(),
        inStrConstant3.get(),
        inStrRule3.get(),
        inStrConstant4.get(),
        inStrRule4.get()
    ];
    generate();
}

// reset everything
function resetAll()
{
    // define axiom here
    sentence = inStrAxiom.get();
    angleMultiplier = inRotateMutliplier.get();
    len = inStepLength.get();
    lenScale = inStepScale.get();
}

// generates the string from the ruleset array
function generate()
{
    // reset the state of everything
    resetAll();

    let nextSentence = "";
    const iterationsLimit = Math.min(6, inIterations.get());
    let iter;
    let i;
    let r;

    for (iter = 0; iter < iterationsLimit; iter++)
    {
        const sentenceArrayLength = sentence.length;
        const rulesArrayLength = rules.length;//

        for (i = 0; i < sentenceArrayLength; i++)
        {
            const current = sentence.charAt(i);
            let found = false;

            for (r = 0; r < rulesArrayLength; r += 2)
            {
                if (current === rules[r])
                {
                    found = true;
                    nextSentence += rules[r + 1];
                }
            }
            // if nothing is found continue no matter what
            if (!found)nextSentence += current;
        }
        // final result
        sentence = nextSentence;
        nextSentence = "";
        // removing this will add everything on top of each other recursively
        // nextSentence="";
    }
    stringOut.set(sentence);
    // draw everything once with the turtle function
    turtle();
    needsCalc = false;
}

// used to connect start and end of branches together correctly
const pos = vec3.create();
const empty = vec3.create();

// extracts the user defined angle
// FfFx45FF returns 45 on the x axis
function extract(str, pos)
{
    const slicedSentence = str.slice(pos);

    let output = "";
    let parsedNumber = "";
    let currentChar = "";
    let canceled = true;
    // starts i at 1 to drop character which is actually the identifying key!
    for (let i = 1; i < slicedSentence.length; i++)
    {
        // output = slicedSentence.slice(i);
        output = slicedSentence.substr(i, 8);
        for (let j = 0; j < output.length; j++)
        {
            currentChar = output.charAt(j);
            if (!Number.isNaN(currentChar))
            {
                parsedNumber += currentChar;
            }
            else if (Number.isNaN(currentChar))
            {
                canceled = true;
                break;
            }
        }
        if (canceled) break;
    }
    return parseFloat(parsedNumber);
}

// recreates the turtle algorithm
function turtle()
{
    // used to find max distance from starting point
    let max = 0;
    // create the main transform array
    trans = mat4.create();
    transforms.length = 0;
    pointArrays.length = 0;
    stack.length = 0;
    const branchCoordStack = [];

    currentPointArray = [];
    let angleUi = "";

    let currentBranch = 0;
    for (let i = 0; i < sentence.length; i++)
    {
        const current = sentence.charAt(i);
        // step forward, create point
        if (current == "F")
        {
            // apply to the trans matrix, take a step
            mat4.translate(trans, trans, [0.0, len, 0.0]);
            // push matrix for geometry
            transforms.push(mat4.clone(trans));
            // get xyz for point array
            vec3.transformMat4(pos, empty, trans);
            // spline
            currentPointArray.push(pos[0], pos[1], pos[2]);

            max = Math.max(max, Math.abs(pos[0]));
            max = Math.max(max, Math.abs(pos[1]));
            max = Math.max(max, Math.abs(pos[2]));
        }
        // step forward do not add a point
        else if (current == "f")
        {
            mat4.translate(trans, trans, [0.0, len, 0.0]);
        }
        // alter step length by step multiplier
        else if (current == ">")
        {
            len *= lenScale;
        }
        else if (current == "<")
        {
            len /= lenScale;
        }
        // turn counter clockwise x defined by angle
        else if (current == "x")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence, i) * angleMultiplier;
            mat4.rotateX(trans, trans, CGL.DEG2RAD * (angleUi - Math.seededRandom() * inRandStr.get()));
        }
        // turn clockwise x defined by angleUi
        else if (current == "X")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence, i) * angleMultiplier;
            mat4.rotateX(trans, trans, CGL.DEG2RAD * (angleUi + Math.seededRandom() * inRandStr.get()));
        }
        // turn counter clockwise y defined by angleUi
        else if (current == "y")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence, i) * angleMultiplier;
            mat4.rotateY(trans, trans, CGL.DEG2RAD * (angleUi - Math.seededRandom() * inRandStr.get()));
        }
        // turn clockwise y defined by angleUi
        else if (current == "Y")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence, i) * angleMultiplier;
            mat4.rotateY(trans, trans, CGL.DEG2RAD * (angleUi + Math.seededRandom() * inRandStr.get()));
        }
        // turn counter clockwise z defined by angleUi
        else if (current == "z")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence, i) * angleMultiplier;
            mat4.rotateZ(trans, trans, CGL.DEG2RAD * (angleUi - Math.seededRandom() * inRandStr.get()));
        }
        // turn clockwise z defined by angleUi
        else if (current == "Z")
        {
            if (isNaN(sentence.charAt(i + 1)))
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence, i) * angleMultiplier;
            mat4.rotateZ(trans, trans, CGL.DEG2RAD * (angleUi + Math.seededRandom() * inRandStr.get()));
        }
        else if (current == "[")
        {
            // get current transform matrix push into stack, branch start
            stack.push(mat4.clone(trans));

            vec3.transformMat4(pos, empty, trans);

            branchCoordStack.push([pos[0], pos[1], pos[2]]);

            // output current branch number
            currentBranch += 1;
        }
        else if (current == "]")
        {
            // get the current branch push into the transform matrix
            // check if branch has a start to avoid error
            if (stack.length === 0)
            {
                break;
            }

            trans = stack[stack.length - 1];
            stack.pop();

            // this code section is used to correctly connect the branches together with spline
            const branchStartCoord = branchCoordStack[branchCoordStack.length - 1];

            branchCoordStack.pop();

            pointArrays.push(currentPointArray);

            if (branchStartCoord) currentPointArray = [branchStartCoord[0], branchStartCoord[1], branchStartCoord[2]];
            else currentPointArray = [];
        }
    }
    needsCalc = false;
    pointArrays.push(currentPointArray);
    // outArray.set(transforms);
    outMax.set(max);
}

function calcLater()
{
    needsCalc = true;
}

function render()
{
    if (needsCalc)
    {
        generate();
    }
    needsCalc = false;

    // iterate through transforms array and trigger all geometry
    for (var i = 0; i < transforms.length; i++)
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mMatrix, cgl.mMatrix, transforms[i]);
        outTrigger.trigger();
        cgl.popModelMatrix();
    }
    // iterate through points array for spline xyz data
    for (var i = 0; i < pointArrays.length; i++)
    {
        outPoints.set(pointArrays[i]);
        lineTrigger.trigger();
    }
}
