const
    number = op.inValueFloat("Value",2),
    range1 = op.inValueFloat("Range 1",1),
    range2 = op.inValueFloat("Range 2",3),
    result = op.outValue("Result");

number.onChange=range1.onChange=range2.onChange=exec;
exec();

function exec() {
  result.set(
      number.get() >= Math.min( range1.get(), range2.get() ) &&
      number.get() <= Math.max( range1.get(), range2.get() )
  );
}

