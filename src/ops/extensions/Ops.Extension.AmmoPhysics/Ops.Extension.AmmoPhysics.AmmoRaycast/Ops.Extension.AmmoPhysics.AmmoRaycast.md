This operator will report if there is a physics object at the specific location and will also output the name of the object from the string output port. With something like a Mouse Op you can use this for navigation or user interaction. Of course you are not limited to using mouse coordinates, but can get creative and use any other input method.

Make sure to normalize your input screen coordinates - so they are scaled to 0-1 .

