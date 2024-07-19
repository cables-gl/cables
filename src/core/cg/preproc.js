/**
   * @type {!RegExp}
   * @inner
   */
let GLOB_EXP = /(?:^|[^\\])\*/;

/**
    * @type {!RegExp}
    * @inner
    */
let NOT_LINE_ENDING = /[^\r\n]/g;

/**
    * Constructs a new Preprocessor.
    * @exports Preprocessor
    * @class Provides pre-processing of JavaScript source files, e.g. to build different versions of a library.
    * @param {string} source Source to process
    * @param {string|Object.<string,string>=} baseDirOrIncludes Source base directory used for includes (node.js only)
    *  or an object containing all the included sources by filename. Defaults to the current working directory.
    * @param {boolean} preserveLineNumbers When removing blocks of code, replace the block with blank lines so that
    *  line numbers are preserved, as long as #include is not used
    * @constructor
    */
const Preprocessor = function Preprocessor(source, baseDirOrIncludes, preserveLineNumbers)
{
    /**
      * Source code to pre-process.
      * @type {string}
      * @expose
      */
    this.source = "" + source;

    /**
      * Source base directory.
      * @type {string}
      * @expose
      */
    this.baseDir = typeof baseDirOrIncludes === "string" ? baseDirOrIncludes : ".";

    /**
      * Included sources by filename.
      * @type {Object.<string, string>}
      */
    this.includes = typeof baseDirOrIncludes === "object" ? baseDirOrIncludes : {};

    /**
      * Preserve line numbers when removing blocks of code
      * @type {boolean}
      */
    this.preserveLineNumbers = typeof preserveLineNumbers === "boolean" ? preserveLineNumbers : false;

    /**
      * Whether running inside of node.js or not.
      * @type {boolean}
      * @expose
      */
    this.isNode = (typeof window === "undefined" || !window.window) && typeof require === "function";

    /**
      * Error reporting source ahead length.
      * @type {number}
      * @expose
      */
    this.errorSourceAhead = 50;

    /**
      * Runtime defines.
      * @type {Array.<string>}
      */
    this.defines = [];
};

/**
    * Definition expression
    * @type {!RegExp}
    */
Preprocessor.EXPR = /([ ]*)\/\/[ ]+#(include_once|include|ifn?def|if|endif|else|elif|put|define)/g;

/**
    * #* EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.ALL = /([^\r\n]*)\r?(?:\n|$)/;

/**
    * #include "path/to/file". Requires node.js' "fs" module.
    * @type {!RegExp}
    */
Preprocessor.INCLUDE = /(include_once|include)[ ]+"([^"\\]*(\\.[^"\\]*)*)"[ ]*\r?(?:\n|$)/g;

/**
    * #ifdef/#ifndef SOMEDEFINE, #if EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.IF = /(ifdef|ifndef|if)[ ]*([^\r\n]+)\r?\n/g;

/**
    * #endif/#else, #elif EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.ENDIF = /(endif|else|elif)([ ]+[^\r\n]+)?\r?(?:\n|$)/g;

/**
    * #put EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.PUT = /put[ ]+([^\n]+)[ ]*/g;

/**
    * #define EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.DEFINE = /define[ ]+([^\n\r]+)\r?(?:\n|$)/g;

/**
    * #define EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.VAR = /define[ ]+var[ ]+([a-zA-Z_][a-zA-Z0-9_]*)[ ]*=[ ]*(.+)/g;

/**
    * #define EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.BOOLVAR = /define[ ]+([a-zA-Z_][a-zA-Z0-9_]*)[ ]*/g;

/**
    * #define EXPRESSION
    * @type {!RegExp}
    */
Preprocessor.FUNCTION = /define[ ]+function[ ]+([a-zA-Z_][a-zA-Z0-9_]*)[ ]*(.+)/g;

/**
    * Strips slashes from an escaped string.
    * @param {string} str Escaped string
    * @return {string} Unescaped string
    * @expose
    */
Preprocessor.stripSlashes = function (str)
{
    // ref: http://phpjs.org/functions/stripslashes/
    return (str + "").replace(/\\(.?)/g, function (s, n1)
    {
        switch (n1)
        {
        case "\\": return "\\";
        case "0": return "\u0000";
        case "": return "";
        default: return n1;
        }
    });
};

/**
    * Adds slashes to an unescaped string.
    * @param {string} str Unescaped string
    * @return {string} Escaped string
    * @expose
    */
Preprocessor.addSlashes = function (str)
{
    return (str + "").replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
};

/**
    * Indents a multi-line string.
    * @param {string} str Multi-line string to indent
    * @param {string} indent Indent to use
    * @return {string} Indented string
    * @expose
    */
Preprocessor.indent = function (str, indent)
{
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++)
    {
        lines[i] = indent + lines[i];
    }
    return lines.join("\n");
};

/**
    * Transforms a string for display in error messages.
    * @param {string} str String to transform
    * @return {string}
    * @expose
    */
Preprocessor.nlToStr = function (str)
{
    return "[" + str.replace(/\r/g, "").replace(/\n/g, "\\n") + "]";
};

/**
    * Evaluates an expression.
    * @param {object.<string,string>} defines Defines
    * @param {string=} expr Expression to evaluate
    * @return {*} Expression result
    * @throws {Error} If the expression cannot be evaluated
    * @expose
    */
Preprocessor.evaluate = function (defines, expr)
{
    let evalFunction = function ()
    {
        for (let key in defines)
        {
            if (defines.hasOwnProperty(key))
            {
                if (defines[key].type === "var")
                {
                    eval("var " + key + " = " + defines[key].value + ";");
                }
                else
                {
                    eval("function " + key + defines[key].value);
                }
            }
        }

        return eval(expr);
    };
    return evalFunction();
};

/**
    * Preprocesses.
    * @param {object.<string,string>} defines Defines
    * @param {function(string)=} verbose Print verbose processing information to
    *    the specified function as the first parameter. Defaults to not print debug information.
    * @return {string} Processed source
    * @throws {Error} If the source cannot be pre-processed
    * @expose
    */
Preprocessor.prototype.process = function (defines, verbose)
{
    defines = defines || {};
    verbose = typeof verbose === "function" ? verbose : function () {};
    verbose("Defines: " + JSON.stringify(defines));

    let match, match2, match3, include, p, stack = [], before;
    let isSkip = false;

    while ((match = Preprocessor.EXPR.exec(this.source)) !== null)
    {
        verbose(match[2] + " @ " + match.index + "-" + Preprocessor.EXPR.lastIndex);
        let indent = match[1];

        if (isSkip && stack.length > 0 && match[2] !== "endif" && match[2] !== "else" && match[2] !== "elif")
        {
            before = stack.pop();
            verbose("  pop (" + stack.length + "): " + JSON.stringify(before));

            Preprocessor.ALL.lastIndex = match.index;
            if ((match2 = Preprocessor.ALL.exec(this.source)) === null)
            {
                throw (new Error("Illegal #" + match[2] + ": " +
             this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }

            stack.push(p = {
                "include": before.include,
                "index": before.index,
                "lastIndex": Preprocessor.ALL.lastIndex
            });
            verbose("  push (" + stack.length + "): " + JSON.stringify(p));
            continue;
        }

        switch (match[2])
        {
        // case "include_once":
        // case "include":
        // Preprocessor.INCLUDE.lastIndex = match.index;
        // if ((match2 = Preprocessor.INCLUDE.exec(this.source)) === null)
        // {
        //     throw (new Error("Illegal #" + match[2] + ": " +
        //    this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
        // }
        // include = Preprocessor.stripSlashes(match2[2]);
        // if (typeof this.includes[include] !== "undefined")
        // { // Do we already know it?
        //     if (match2[1] === "include_once")
        //     {
        //         verbose("  skip incl: " + include);
        //         include = "";
        //     }
        //     else
        //     {
        //         verbose("  incl: " + include);
        //         include = this.includes[include];
        //     }
        // }
        // else
        // { // Load it if in node.js...
        //     if (!this.isNode)
        //     {
        //         throw (new Error("Failed to resolve include: " + this.baseDir + "/" + include));
        //     }
        //     try
        //     {
        //         let key = include,
        //             fs = require("fs");
        //         if (GLOB_EXP.test(include))
        //         {
        //             let glob = require("glob");
        //             verbose("  glob incl: " + this.baseDir + "/" + include);
        //             let _this = this;
        //             /* eslint no-loop-func: 0 */
        //             let files = glob(this.baseDir + "/" + include, { "sync": true });
        //             include = "";
        //             for (let i = 0; i < files.length; i++)
        //             {
        //                 verbose("  incl: " + files[i]);
        //                 let contents = fs.readFileSync(files[i]) + "";
        //                 _this.includes[key] = contents;
        //                 include += contents;
        //             }
        //         }
        //         else
        //         {
        //             verbose("  incl: " + include);
        //             include = fs.readFileSync(this.baseDir + "/" + include) + "";
        //             this.includes[key] = include;
        //         }
        //     }
        //     catch (e)
        //     {
        //         throw (new Error("Include failed: " + include + " (" + e + ")"));
        //     }
        // }
        // this.source = this.source.substring(0, match.index) +
        //  Preprocessor.indent(include, indent) + this.source.substring(Preprocessor.INCLUDE.lastIndex);
        // Preprocessor.EXPR.lastIndex = stack.length > 0 ? stack[stack.length - 1].lastIndex : 0; // Start over again
        // verbose("  continue at " + Preprocessor.EXPR.lastIndex);
        // break;
        // case "put":
        //     Preprocessor.PUT.lastIndex = match.index;
        //     if ((match2 = Preprocessor.PUT.exec(this.source)) === null)
        //     {
        //         throw (new Error("Illegal #" + match[2] + ": " +
        //        this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
        //     }
        //     include = match2[1];
        //     verbose("  expr: " + include);
        //     include = Preprocessor.evaluate(defines, include);
        //     verbose("  value: " + Preprocessor.nlToStr(include));
        //     this.source = this.source.substring(0, match.index) + indent + include +
        //      this.source.substring(Preprocessor.PUT.lastIndex);
        //     Preprocessor.EXPR.lastIndex = match.index + include.length;
        //     verbose("  continue at " + Preprocessor.EXPR.lastIndex);
        //     break;
        case "ifdef":
        case "ifndef":
        case "if":
            Preprocessor.IF.lastIndex = match.index;
            if ((match2 = Preprocessor.IF.exec(this.source)) === null)
            {
                throw (new Error("Illegal #" + match[2] + ": " +
               this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }
            verbose("  test: " + match2[2]);
            verbose("  defines  " + JSON.stringify(defines));
            if (match2[1] === "ifdef")
            {
                include = defines[match2[2]] !== undefined;
            }
            else if (match2[1] === "ifndef")
            {
                include = defines[match2[2]] === undefined;
            }
            else
            {
                include = Preprocessor.evaluate(defines, match2[2]);
            }
            isSkip = !include;
            verbose("  value: " + include + ", isSkip: " + isSkip);
            stack.push(p = {
                "include": include,
                "index": match.index,
                "lastIndex": Preprocessor.IF.lastIndex
            });
            verbose("  push (" + stack.length + "): " + JSON.stringify(p));
            break;
        case "endif":
        case "else":
        case "elif":
            Preprocessor.ENDIF.lastIndex = match.index;
            if ((match2 = Preprocessor.ENDIF.exec(this.source)) === null)
            {
                throw (new Error("Illegal #" + match[2] + ": \"" +
               this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }
            if (stack.length === 0)
            {
                throw (new Error("Unexpected #" + match2[1] + ": \"" +
               this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }
            before = stack.pop();
            verbose("  pop (" + stack.length + "): " + JSON.stringify(before));

            if (this.preserveLineNumbers)
            {
                include = this.source.substring(before.index, before.lastIndex).replace(NOT_LINE_ENDING, "") +
               this.source.substring(before.lastIndex, match.index) +
               this.source.substring(match.index, Preprocessor.ENDIF.lastIndex).replace(NOT_LINE_ENDING, "");
            }
            else
            {
                include = this.source.substring(before.lastIndex, match.index);
            }

            if (before.include)
            {
                verbose("  incl: " + Preprocessor.nlToStr(include) + ", 0-" + before.index +
               " + " + include.length + " bytes + " + Preprocessor.ENDIF.lastIndex + "-" + this.source.length);
                this.source = this.source.substring(0, before.index) + include +
               this.source.substring(Preprocessor.ENDIF.lastIndex);
            }
            else if (this.preserveLineNumbers)
            {
                verbose("  excl(\\n): " + Preprocessor.nlToStr(include) + ", 0-" + before.index +
               " + " + Preprocessor.ENDIF.lastIndex + "-" + this.source.length);
                include = include.replace(NOT_LINE_ENDING, "");
                this.source = this.source.substring(0, before.index) + include +
               this.source.substring(Preprocessor.ENDIF.lastIndex);
            }
            else
            {
                verbose("  excl: " + Preprocessor.nlToStr(include) + ", 0-" + before.index +
               " + " + Preprocessor.ENDIF.lastIndex + "-" + this.source.length);
                include = "";
                this.source = this.source.substring(0, before.index) +
               this.source.substring(Preprocessor.ENDIF.lastIndex);
            }
            if (this.source === "")
            {
                verbose("  result empty");
            }
            isSkip = false;
            Preprocessor.EXPR.lastIndex = before.index + include.length;
            verbose("  continue at " + Preprocessor.EXPR.lastIndex);
            if (match2[1] === "else" || match2[1] === "elif")
            {
                if (match2[1] === "else")
                {
                    include = !before.include;
                }
                else
                {
                    include = Preprocessor.evaluate(defines, match2[2]);
                }
                isSkip = !include;
                verbose("  isSkip: " + isSkip);
                stack.push(p = {
                    "include": include,
                    "index": Preprocessor.EXPR.lastIndex,
                    "lastIndex": Preprocessor.EXPR.lastIndex
                });
                verbose("  push (" + stack.length + "): " + JSON.stringify(p));
            }
            break;
        case "define":
            Preprocessor.DEFINE.lastIndex = match.index;
            Preprocessor.VAR.lastIndex = match.index;
            Preprocessor.FUNCTION.lastIndex = match.index;
            Preprocessor.BOOLVAR.lastIndex = match.index;

            if ((match2 = Preprocessor.DEFINE.exec(this.source)) === null)
            {
                throw (new Error("Illegal #" + match[2] + ": " +
               this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }
            var define = match2[1];
            verbose("  def: \"" + define + "\"");

            var identifier, value, type;
            if ((match3 = Preprocessor.VAR.exec(this.source)) !== null)
            {
                type = "var";
                identifier = match3[1];
                value = match3[2];
                verbose(" match3(var): " + JSON.stringify(match3));
            }
            else if ((match3 = Preprocessor.FUNCTION.exec(this.source)) !== null)
            {
                type = "function";
                identifier = match3[1];
                value = match3[2];
                verbose(" match3(function): " + JSON.stringify(match3));
            }
            else if ((match3 = Preprocessor.BOOLVAR.exec(this.source)) !== null)
            {
                type = "var";
                identifier = match3[1];
                value = true;
                verbose(" match3(boolvar): " + JSON.stringify(match3));
            }
            else
            {
                throw (new Error("Illegal #" + match[2] + ": " +
               this.source.substring(match.index, match.index + this.errorSourceAhead) + "..."));
            }

            verbose("  type: " + type);
            verbose("  identifier: " + identifier);
            verbose("  value: " + value);

            defines[identifier] = {
                "type": type,
                "value": value
            };

            verbose("  defines  " + JSON.stringify(defines));

            var lineEnding = "";
            if (this.preserveLineNumbers)
            {
                lineEnding = this.source.substring(match.index, Preprocessor.DEFINE.lastIndex).replace(NOT_LINE_ENDING, "");
            }
            this.source = this.source.substring(0, match.index) + indent +
             lineEnding + this.source.substring(Preprocessor.DEFINE.lastIndex);
            Preprocessor.EXPR.lastIndex = match.index;
            verbose("  continue at " + Preprocessor.EXPR.lastIndex);
            break;
        default:
            break;
        }
    }
    if (stack.length > 0)
    {
        verbose("Still on stack (" + stack.length + "): " + JSON.stringify(stack.pop()));
    }
    return this.source;
};

export default Preprocessor;


