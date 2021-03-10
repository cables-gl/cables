this will return information about window.location.hash (the part after the #) in your url.

these parts of the url can be changed without reloading the browserwindow and hence may be used to carry state.

this adheres to "getstring" syntax for key-value-pairs. having multiple # is also allowed. if key-value-pairs are duplicated the last one in the string "wins".