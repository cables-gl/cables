const
    inNum = op.inFloat("Number", 0),
    inNum2 = op.inFloat("Number 2", 0),
    inNum3 = op.inFloat("Number 3", 0),
    inNum4 = op.inFloat("Number 4", 0),
    inNum5 = op.inFloat("Number 5", 0),
    inNum6 = op.inFloat("Number 6", 0),
    inNum7 = op.inFloat("Number 7", 0),
    inNum8 = op.inFloat("Number 8", 0),
    result = op.outNumber("Result");

inNum.onChange =
    inNum2.onChange =
    inNum3.onChange =
    inNum4.onChange =
    inNum5.onChange =
    inNum6.onChange = update;
update();

function update()
{
    result.set(inNum.get() || inNum2.get() || inNum3.get() || inNum4.get() || inNum5.get() || inNum6.get() || inNum7.get() || inNum8.get());
}
