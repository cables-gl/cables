const result = op.outArray('result');
const v = op.inArray('array');
const old_min = op.inValueFloat('old min');
const old_max = op.inValueFloat('old max');
const new_min = op.inValueFloat('new min');
const new_max = op.inValueFloat('new max');
const easing = op.inValueSelect('Easing', ['Linear', 'Smoothstep', 'Smootherstep'], 'Linear');

op.setPortGroup('Input Range', [old_min, old_max]);
op.setPortGroup('Output Range', [new_min, new_max]);

let ease = 0;
let r = 0;

easing.onChange = function() {
  if (easing.get() === 'Smoothstep') {
    ease = 1;
  } else if (easing.get() === 'Smootherstep') {
    ease = 2;
  } else {
    ease = 0;
  }
};


function exec() {
  const inArray = v.get();
  if (!inArray || inArray.length === 0) {
    result.set([]);
    return;
  }
  const outArray = Array(inArray.length);
  for (let i = 0; i < inArray.length; i++) {
    let x = inArray[i];

    if (x >= Math.max(old_max.get(), old_min.get())) {
      outArray[i] = new_max.get();
    } else if (x <= Math.min(old_max.get(), old_min.get())) {
      outArray[i] = new_min.get();
    } else {

      const nMin = new_min.get();
      const nMax = new_max.get();
      const oMin = old_min.get();
      const oMax = old_max.get();

      let reverseInput = false;
      const oldMin = Math.min(oMin, oMax);
      const oldMax = Math.max(oMin, oMax);
      if (oldMin !== oMin) reverseInput = true;

      let reverseOutput = false;
      const newMin = Math.min(nMin, nMax);
      const newMax = Math.max(nMin, nMax);
      if (newMin !== nMin) reverseOutput = true;

      let portion = 0;

      if (reverseInput) {
        portion = (oldMax - x) * (newMax - newMin) / (oldMax - oldMin);
      } else {
        portion = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin);
      }

      if (reverseOutput) {
        r = newMax - portion;
      } else {
        r = portion + newMin;
      }

      if (ease === 0) {
        outArray[i] = r;
      } else if (ease === 1) {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        outArray[i] = nMin + x * x * (3 - 2 * x) * (nMax - nMin); // smoothstep
      } else if (ease === 2) {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        outArray[i] = nMin + x * x * x * (x * (x * 6 - 15) + 10) * (nMax - nMin); // smootherstep
      }
    }
  }
  result.set(outArray);
}

v.set(null);
old_min.set(0);
old_max.set(1);
new_min.set(-1);
new_max.set(1);


v.onChange = exec;
old_min.onChange = exec;
old_max.onChange = exec;
new_min.onChange = exec;
new_max.onChange = exec;

result.set(null);

exec();