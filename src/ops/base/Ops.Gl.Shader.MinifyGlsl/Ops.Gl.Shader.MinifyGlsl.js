const
    inStr = op.inString("Shader Source"),
    outStr = op.outString("Minified Shader Source");

inStr.onChange = () =>
{
    if (!window.tokenString) return console.error("glsl tokeinizer / tokenstring not found");

    const tokens = window.tokenString(inStr.get());

    // console.log(tokens);

    let str = "";
    for (let i = 0; i < tokens.length - 1; i++)
    {
    	const token = tokens[i];

    	if (i > 0)
    	{
    		if (token.type == "line-comment") continue;
    		if (token.type == "block-comment") continue;

            if (token.type == "whitespace" && token.data == "\n" && tokens[i - 1].type == "line-comment") continue;

    		if (token.type == "whitespace")
    		{
		        if (token.data.indexOf("\n") == 0 && token.data.endsWith(" ")) token.data = "\n";

    		    for (let j = 0; j < 3; j++)
    			    token.data = token.data.replaceAll("\n\n", "\n");

    			token.data = token.data.replaceAll("\t", " ");

    		 	for (let j = 0; j < 3; j++)
        		 	token.data = token.data.replaceAll("  ", " ");

    		 	for (let j = 0; j < 2; j++)
        		 	token.data = token.data.replaceAll("\n\n", "\n");
    		}

    		if (token.type == "float")
    			while (token.data.indexOf(".") > 0 && token.data.endsWith("0"))
    				token.data = token.data.substring(0, token.data.length - 1);

    		if (token.type == "whitespace" && token.data == " ")
    		{
    			if (tokens[i - 1].type == "ident" && tokens[i + 1].type == "ident") continue;
    			if (tokens[i - 1].type == "ident" && tokens[i + 1].type == "operator") continue;
    			if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "ident") continue;
    			if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "float") continue;
    			if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "keyword") continue;
    			if (tokens[i - 1].type == "operator" && tokens[i + 1].type == "operator") continue;
    			if (tokens[i + 1].type != "ident" && tokens[i + 1].type != "keyword" && tokens[i - 1].type != "ident" && tokens[i - 1].type != "keyword") continue;
    		}
    	}

    	str += token.data;
    }
    outStr.set(str);
};
