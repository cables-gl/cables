const
    str0=op.inString("String 1"),
    str1=op.inString("String 2"),
    str2=op.inString("String 3"),
    str3=op.inString("String 4"),
    str4=op.inString("String 5"),
    str5=op.inString("String 6"),
    str6=op.inString("String 7"),
    str7=op.inString("String 8"),
    result=op.outString("Result");

str0.onChange=
    str1.onChange=
    str2.onChange=
    str3.onChange=
    str4.onChange=
    str5.onChange=
    str6.onChange=
    str7.onChange=exec;

function exec()
{
    result.set( str0.get() || str1.get()  || str2.get() || str3.get() || str4.get() || str5.get() || str6.get() || str7.get() );
}

