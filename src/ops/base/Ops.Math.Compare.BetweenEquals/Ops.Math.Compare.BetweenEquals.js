var number = op.addInPort(new CABLES.Port(this,"Value"));
var range1 = op.addInPort(new CABLES.Port(this,"Range 1"));
var range2 = op.addInPort(new CABLES.Port(this,"Range 2"));

var result = op.addOutPort(new CABLES.Port(this,"Result"));

number.set(2.0);
range1.set(1.0);
range2.set(3.0);

var exec = function() {
  result.set(
      number.get() >= Math.min( range1.get(), range2.get() ) &&
      number.get() <= Math.max( range1.get(), range2.get() )
  );
};

number.onValueChanged = exec;
range1.onValueChanged = exec;
range2.onValueChanged = exec;
exec();
