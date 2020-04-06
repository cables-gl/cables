const
    outStr=op.outString("String"),
    outHtml=op.outString("HTML String"),
    outArray=op.outArray("Array");

const paragraphs=[
"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris pretium tempor enim, sit amet elementum ex sodales eu. Nulla porttitor, ante vel condimentum volutpat, nisi est faucibus enim, sed pulvinar arcu justo eget eros. Vivamus blandit ex et ipsum ornare bibendum. Proin rutrum nisl est, eu pellentesque enim fermentum vel. Praesent tempor eget ligula sed lacinia. Curabitur at interdum nibh. Mauris porta ultricies eros, eu varius nisi.",
"Maecenas quis sapien eget eros luctus lacinia in quis turpis. Fusce luctus, nibh ac dictum elementum, turpis libero tincidunt nulla, a facilisis nulla erat scelerisque felis. In hac habitasse platea dictumst. Vestibulum cursus malesuada diam ut laoreet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque venenatis arcu leo, ut ornare nunc ultrices a. Curabitur pellentesque odio ac est aliquet porta. Morbi metus felis, ornare vitae dictum sit amet, elementum sed dolor. Duis quis commodo dolor. Cras nec ipsum semper, lobortis libero et, finibus felis. Donec ipsum felis, fermentum et congue non, rhoncus non risus. Nullam et lacus eu eros imperdiet blandit in sed arcu. Nullam a massa nec turpis consequat aliquam. Nulla nec purus a sem convallis mattis.",
"Phasellus sed interdum risus. Aliquam fermentum nulla eget egestas condimentum. Vestibulum et nulla et leo suscipit facilisis. Pellentesque ut lectus porttitor, facilisis quam eu, ultrices nulla. Maecenas dapibus aliquet suscipit. Sed pretium justo molestie purus vehicula hendrerit. Quisque auctor tempus ipsum, ut tincidunt libero dapibus vel. Sed faucibus mi at nisi tristique, id efficitur nunc commodo. Quisque ac erat tincidunt, iaculis augue eu, imperdiet magna. Donec tempor facilisis placerat. Nam sed turpis molestie, efficitur dolor vitae, sollicitudin quam.",
"Nunc vehicula, nisl et egestas euismod, eros eros mollis lacus, sit amet vehicula quam mi ac massa. Integer pellentesque interdum porta. Cras iaculis velit orci, ut volutpat ex scelerisque id. Sed tincidunt massa eget lectus molestie eleifend. Nam egestas maximus urna, a volutpat felis. Mauris vehicula molestie justo vel accumsan. Nulla facilisi.",
"Praesent eu hendrerit nulla. Suspendisse quam risus, tincidunt ut viverra in, tristique ut massa. Integer dignissim consequat commodo. Integer mollis risus vitae augue congue, et fermentum tellus vehicula. Praesent sit amet posuere eros. Vivamus vulputate massa a augue luctus facilisis. Donec purus ipsum, venenatis ut commodo in, pretium ac erat. Donec vulputate tortor ut ante consequat molestie. Vestibulum tempus felis quam, vitae fringilla nulla facilisis non. Integer porttitor condimentum lacinia. Maecenas porttitor ullamcorper augue nec scelerisque. Etiam mattis felis eget lacus porta, sit amet lacinia diam efficitur."
];

outArray.set(paragraphs);
outStr.set(paragraphs.join('\n'));
outHtml.set(paragraphs.join('<br/><br/>'));
