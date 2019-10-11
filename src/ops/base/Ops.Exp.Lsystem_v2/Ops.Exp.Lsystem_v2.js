const inExe = op.inTrigger ('Trigger');
const inStrAxiom = op.inValueString("Axiom / seed","F");
const inStrConstant1 = op.inValueString("Constant 1","F");
const inStrRule1 = op.inValueString("Rule 1","Fx5y2.2F[yxFF]fF[yXFFfzFZF]fF[yXzFFfzFZF]");
const inStrConstant2 = op.inValueString("Constant 2");
const inStrRule2 = op.inValueString("Rule 2");
const inStrConstant3 = op.inValueString("Constant 3");
const inStrRule3 = op.inValueString("Rule 3");
const inStrConstant4 = op.inValueString("Constant 4");
const inStrRule4 = op.inValueString("Rule 4");

inStrAxiom.hidePort();
inStrConstant1.hidePort();
inStrRule1.hidePort();
inStrConstant2.hidePort();
inStrRule2.hidePort();
inStrConstant3.hidePort();
inStrRule3.hidePort();
inStrConstant4.hidePort();
inStrRule4.hidePort();

const inIterations = op.inValueInt("Iterations",1);
const inStepLength = op.inValue("Step length",1.0);
const inStepScale = op.inValue("Step scale multiplier",1.0);
const inDefaultAngle = op.inValue("Default angle",45.0);
const inRotateMutliplier = op.inValue("Rotation multiplier",1.0);

const outTrigger = op.outTrigger("Out trigger geometry");
const lineTrigger = op.outTrigger("Line/point trigger");
//const outArray = op.outArray("Matrix Array out");
const outPoints = op.outArray("Points out");
const outMax=op.outValue("Max Size");
const stringOut = op.outValueString('Final generated string');

const seed = op.inValue("random seed");
const inRandStr = op.inValue("random strength");

var angleMultiplier = inRotateMutliplier.get();
var len = inStepLength.get();
var lenScale = inStepScale.get();

var cgl = op.patch.cgl;

//create a matrix
var trans = mat4.create();
//array to put trans into
var transforms = [];
//pop in and out matrix for branch transforms
var stack = [];

//used for splines array
var pointArrays = [];
var currentPointArray=[];
var lastPointArray=[0,0,0];

//this becomes the axiom after the resetAll() is called
var sentence = "";//axiom;

//an array that holds the string replacment rules
var rules = [];

var needsCalc = true;
//UI input
inRotateMutliplier.onChange = calcLater;
inStepLength.onChange = calcLater;
inStepScale.onChange = calcLater;
inIterations.onChange = calcLater;
inExe.onTriggered = render;
seed.onChange = calcLater;
inRandStr.onChange = calcLater;
inDefaultAngle.onChange = calcLater;

//if user changes rules or constants definesRules is updated
inStrAxiom.onChange = defineRules;
inStrConstant1.onChange = defineRules;
inStrRule1.onChange = defineRules;
inStrConstant2.onChange = defineRules;
inStrRule2.onChange = defineRules;
inStrConstant3.onChange = defineRules;
inStrRule3.onChange = defineRules;
inStrConstant4.onChange = defineRules;
inStrRule4.onChange = defineRules;

op.init = function()
{
    defineRules();
}
//creates the constants and the rule sets
function defineRules()
{
    rules=
    [
        inStrConstant1.get(),
        inStrRule1.get(),
        inStrConstant2.get(),
        inStrRule2.get(),
        inStrConstant3.get(),
        inStrRule3.get(),
        inStrConstant4.get(),
        inStrRule4.get()
    ]
    generate();
}
//reset everything
function resetAll()
{
    //define axiom here
    sentence = inStrAxiom.get();
    angleMultiplier = inRotateMutliplier.get();
    len = inStepLength.get();
    lenScale = inStepScale.get();
}

//generates the string from the ruleset array
function generate()
{
    //reset the state of everything
    resetAll();

    var nextSentence = "";
    var iterationsLimit = Math.min(6,inIterations.get());
    var iter;
    var i;
    var r;

    for (iter = 0; iter < iterationsLimit ; iter++)
    {
        var sentenceArrayLength = sentence.length;
        var rulesArrayLength = rules.length;//

        for (i =0; i < sentenceArrayLength; i++)
        {
            var current = sentence.charAt(i);
            var found = false;

            for (r = 0; r < rulesArrayLength; r+=2)
            {
                if (current === rules[r])
                {
                    found = true;
                    nextSentence += rules[r+1];
                }
            }
            //if nothing is found continue no matter what
            if(!found)nextSentence += current;
        }
        //final result
        sentence = nextSentence ;
        nextSentence ='';
        //removing this will add everything on top of each other recursively
        //nextSentence="";
    }
    stringOut.set(sentence);
    //draw everything once with the turtle function
    turtle();
    needsCalc=false;
}

//used to connect start and end of branches together correctly
var pos=vec3.create();
var empty=vec3.create();

//extracts the user defined angle
//FfFx45FF returns 45 on the x axis
function extract(str,pos)
{
    var slicedSentence = str.slice(pos);


    var output =  "";
    var parsedNumber = "";
    var currentChar = "";
    var canceled=true;
    //starts i at 1 to drop character which is actually the identifying key!
    for (var i = 1; i < slicedSentence.length;i++)
    {
        // output = slicedSentence.slice(i);
        output = slicedSentence.substr(i, 8);
        for (var j = 0; j < output.length; j++)
        {
            currentChar = output.charAt(j);
            if (!Number.isNaN(currentChar)  )
            {
                parsedNumber += currentChar;
            }
            else if (Number.isNaN(currentChar))
            {
                canceled=true;
                break;

            }
        }
        if(canceled)break;
    }
    return parseFloat(parsedNumber);
}

//recreates the turtle algorithm
function turtle()
{
    //used to find max distance from starting point
    var max=0;
    //create the main transform array
    trans = mat4.create();
    transforms.length = 0;
    pointArrays.length=0;
    stack.length = 0;
    var branchCoordStack=[];

    currentPointArray=[];
    var angleUi = "";

    var currentBranch = 0;
    for(var i = 0; i < sentence.length; i++)
    {
        var current = sentence.charAt(i);
        //step forward, create point
        if(current == "F")
        {
            //apply to the trans matrix, take a step
            mat4.translate(trans,trans,[0.0,len,0.0]);
            //push matrix for geometry
            transforms.push(mat4.clone(trans));
            //get xyz for point array
            vec3.transformMat4(pos, empty, trans);
            //spline
            currentPointArray.push(pos[0],pos[1],pos[2]);

            max=Math.max(max,Math.abs(pos[0]));
            max=Math.max(max,Math.abs(pos[1]));
            max=Math.max(max,Math.abs(pos[2]));
        }
        //step forward do not add a point
        else if (current == "f")
        {
            mat4.translate(trans,trans,[0.0,len,0.0]);

        }
        //alter step length by step multiplier
        else if (current == ">")
        {
            len *=lenScale;
        }
        else if (current == "<")
        {
            len /=lenScale;
        }
        //turn counter clockwise x defined by angle
        else if (current == "x")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence,i) * angleMultiplier ;
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn clockwise x defined by angleUi
        else if (current == "X")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence,i) * angleMultiplier;
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise y defined by angleUi
        else if (current == "y")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence,i) * angleMultiplier ;
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn clockwise y defined by angleUi
        else if (current == "Y")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence,i) * angleMultiplier;
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise z defined by angleUi
        else if (current == "z")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = -inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = -extract(sentence,i) * angleMultiplier ;
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn clockwise z defined by angleUi
        else if (current == "Z")
        {
            if(isNaN(sentence.charAt(i+1)) )
                angleUi = inDefaultAngle.get() * angleMultiplier;
            else
                angleUi = extract(sentence,i) * angleMultiplier ;
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        else if (current == "[")
        {
            //get current transform matrix push into stack, branch start
            stack.push(mat4.clone(trans));

            vec3.transformMat4(pos, empty, trans);

            branchCoordStack.push([pos[0],pos[1],pos[2]]);

            //output current branch number
            currentBranch +=1;
        }
        else if (current == "]")
        {
            //get the current branch push into the transform matrix
            //check if branch has a start to avoid error
            if(stack.length === 0)
            {
                break;
            }

            trans = stack[stack.length-1];
            stack.pop();

            //this code section is used to correctly connect the branches together with spline
            var branchStartCoord = branchCoordStack[branchCoordStack.length-1];

            branchCoordStack.pop();

            pointArrays.push(currentPointArray);

            if(branchStartCoord) currentPointArray=[branchStartCoord[0],branchStartCoord[1],branchStartCoord[2]];
                else currentPointArray=[];
        }
    }
    needsCalc = false;
    pointArrays.push(currentPointArray);
    //outArray.set(transforms);
    outMax.set(max);
}

function calcLater()
{
    needsCalc=true;
}

function render ()
{
    if(needsCalc)
    {
        //console.time("lsys");
        generate();
        //console.timeEnd('lsys');
    }
    needsCalc = false;

    //iterate through transforms array and trigger all geometry
    for(var i = 0; i < transforms.length; i++)
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mMatrix,cgl.mMatrix,transforms[i]);
        outTrigger.trigger();
        cgl.popModelMatrix();
    }
    //iterate through points array for spline xyz data
    for(var i = 0; i < pointArrays.length ; i++)
    {
        outPoints.set(pointArrays[i]);
        lineTrigger.trigger();
    }
}
