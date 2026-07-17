/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["glsltokenizer"] = factory();
	else
		root["glsltokenizer"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const tokenString = __webpack_require__(/*! glsl-tokenizer/string */ \"./node_modules/glsl-tokenizer/string.js\")\n\nwindow.tokenString=tokenString;\n\n\n\n//# sourceURL=webpack://glsltokenizer/./index.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/index.js":
/*!**********************************************!*\
  !*** ./node_modules/glsl-tokenizer/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = tokenize\r\n\r\nvar literals100 = __webpack_require__(/*! ./lib/literals */ \"./node_modules/glsl-tokenizer/lib/literals.js\")\r\n  , operators = __webpack_require__(/*! ./lib/operators */ \"./node_modules/glsl-tokenizer/lib/operators.js\")\r\n  , builtins100 = __webpack_require__(/*! ./lib/builtins */ \"./node_modules/glsl-tokenizer/lib/builtins.js\")\r\n  , literals300es = __webpack_require__(/*! ./lib/literals-300es */ \"./node_modules/glsl-tokenizer/lib/literals-300es.js\")\r\n  , builtins300es = __webpack_require__(/*! ./lib/builtins-300es */ \"./node_modules/glsl-tokenizer/lib/builtins-300es.js\")\r\n\r\nvar NORMAL = 999          // <-- never emitted\r\n  , TOKEN = 9999          // <-- never emitted\r\n  , BLOCK_COMMENT = 0\r\n  , LINE_COMMENT = 1\r\n  , PREPROCESSOR = 2\r\n  , OPERATOR = 3\r\n  , INTEGER = 4\r\n  , FLOAT = 5\r\n  , IDENT = 6\r\n  , BUILTIN = 7\r\n  , KEYWORD = 8\r\n  , WHITESPACE = 9\r\n  , EOF = 10\r\n  , HEX = 11\r\n\r\nvar map = [\r\n    'block-comment'\r\n  , 'line-comment'\r\n  , 'preprocessor'\r\n  , 'operator'\r\n  , 'integer'\r\n  , 'float'\r\n  , 'ident'\r\n  , 'builtin'\r\n  , 'keyword'\r\n  , 'whitespace'\r\n  , 'eof'\r\n  , 'integer'\r\n]\r\n\r\nfunction tokenize(opt) {\r\n  var i = 0\r\n    , total = 0\r\n    , mode = NORMAL\r\n    , c\r\n    , last\r\n    , content = []\r\n    , tokens = []\r\n    , token_idx = 0\r\n    , token_offs = 0\r\n    , line = 1\r\n    , col = 0\r\n    , start = 0\r\n    , isnum = false\r\n    , isoperator = false\r\n    , input = ''\r\n    , len\r\n\r\n  opt = opt || {}\r\n  var allBuiltins = builtins100\r\n  var allLiterals = literals100\r\n  if (opt.version === '300 es') {\r\n    allBuiltins = builtins300es\r\n    allLiterals = literals300es\r\n  }\r\n\r\n  // cache by name\r\n  var builtinsDict = {}, literalsDict = {}\r\n  for (var i = 0; i < allBuiltins.length; i++) {\r\n    builtinsDict[allBuiltins[i]] = true\r\n  }\r\n  for (var i = 0; i < allLiterals.length; i++) {\r\n    literalsDict[allLiterals[i]] = true\r\n  }\r\n\r\n  return function(data) {\r\n    tokens = []\r\n    if (data !== null) return write(data)\r\n    return end()\r\n  }\r\n\r\n  function token(data) {\r\n    if (data.length) {\r\n      tokens.push({\r\n        type: map[mode]\r\n      , data: data\r\n      , position: start\r\n      , line: line\r\n      , column: col\r\n      })\r\n    }\r\n  }\r\n\r\n  function write(chunk) {\r\n    i = 0\r\n\r\n    if (chunk.toString) chunk = chunk.toString()\r\n\r\n    input += chunk.replace(/\\r\\n/g, '\\n')\r\n    len = input.length\r\n\r\n\r\n    var last\r\n\r\n    while(c = input[i], i < len) {\r\n      last = i\r\n\r\n      switch(mode) {\r\n        case BLOCK_COMMENT: i = block_comment(); break\r\n        case LINE_COMMENT: i = line_comment(); break\r\n        case PREPROCESSOR: i = preprocessor(); break\r\n        case OPERATOR: i = operator(); break\r\n        case INTEGER: i = integer(); break\r\n        case HEX: i = hex(); break\r\n        case FLOAT: i = decimal(); break\r\n        case TOKEN: i = readtoken(); break\r\n        case WHITESPACE: i = whitespace(); break\r\n        case NORMAL: i = normal(); break\r\n      }\r\n\r\n      if(last !== i) {\r\n        switch(input[last]) {\r\n          case '\\n': col = 0; ++line; break\r\n          default: ++col; break\r\n        }\r\n      }\r\n    }\r\n\r\n    total += i\r\n    input = input.slice(i)\r\n    return tokens\r\n  }\r\n\r\n  function end(chunk) {\r\n    if(content.length) {\r\n      token(content.join(''))\r\n    }\r\n\r\n    mode = EOF\r\n    token('(eof)')\r\n    return tokens\r\n  }\r\n\r\n  function normal() {\r\n    content = content.length ? [] : content\r\n\r\n    if(last === '/' && c === '*') {\r\n      start = total + i - 1\r\n      mode = BLOCK_COMMENT\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(last === '/' && c === '/') {\r\n      start = total + i - 1\r\n      mode = LINE_COMMENT\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(c === '#') {\r\n      mode = PREPROCESSOR\r\n      start = total + i\r\n      return i\r\n    }\r\n\r\n    if(/\\s/.test(c)) {\r\n      mode = WHITESPACE\r\n      start = total + i\r\n      return i\r\n    }\r\n\r\n    isnum = /\\d/.test(c)\r\n    isoperator = /[^\\w_]/.test(c)\r\n\r\n    start = total + i\r\n    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN\r\n    return i\r\n  }\r\n\r\n  function whitespace() {\r\n    if(/[^\\s]/g.test(c)) {\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function preprocessor() {\r\n    if((c === '\\r' || c === '\\n') && last !== '\\\\') {\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function line_comment() {\r\n    return preprocessor()\r\n  }\r\n\r\n  function block_comment() {\r\n    if(c === '/' && last === '*') {\r\n      content.push(c)\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i + 1\r\n    }\r\n\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function operator() {\r\n    if(last === '.' && /\\d/.test(c)) {\r\n      mode = FLOAT\r\n      return i\r\n    }\r\n\r\n    if(last === '/' && c === '*') {\r\n      mode = BLOCK_COMMENT\r\n      return i\r\n    }\r\n\r\n    if(last === '/' && c === '/') {\r\n      mode = LINE_COMMENT\r\n      return i\r\n    }\r\n\r\n    if(c === '.' && content.length) {\r\n      while(determine_operator(content));\r\n\r\n      mode = FLOAT\r\n      return i\r\n    }\r\n\r\n    if(c === ';' || c === ')' || c === '(') {\r\n      if(content.length) while(determine_operator(content));\r\n      token(c)\r\n      mode = NORMAL\r\n      return i + 1\r\n    }\r\n\r\n    var is_composite_operator = content.length === 2 && c !== '='\r\n    if(/[\\w_\\d\\s]/.test(c) || is_composite_operator) {\r\n      while(determine_operator(content));\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function determine_operator(buf) {\r\n    var j = 0\r\n      , idx\r\n      , res\r\n\r\n    do {\r\n      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))\r\n      res = operators[idx]\r\n\r\n      if(idx === -1) {\r\n        if(j-- + buf.length > 0) continue\r\n        res = buf.slice(0, 1).join('')\r\n      }\r\n\r\n      token(res)\r\n\r\n      start += res.length\r\n      content = content.slice(res.length)\r\n      return content.length\r\n    } while(1)\r\n  }\r\n\r\n  function hex() {\r\n    if(/[^a-fA-F0-9]/.test(c)) {\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function integer() {\r\n    if(c === '.') {\r\n      content.push(c)\r\n      mode = FLOAT\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(/[eE]/.test(c)) {\r\n      content.push(c)\r\n      mode = FLOAT\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(c === 'x' && content.length === 1 && content[0] === '0') {\r\n      mode = HEX\r\n      content.push(c)\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(/[^\\d]/.test(c)) {\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function decimal() {\r\n    if(c === 'f') {\r\n      content.push(c)\r\n      last = c\r\n      i += 1\r\n    }\r\n\r\n    if(/[eE]/.test(c)) {\r\n      content.push(c)\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if ((c === '-' || c === '+') && /[eE]/.test(last)) {\r\n      content.push(c)\r\n      last = c\r\n      return i + 1\r\n    }\r\n\r\n    if(/[^\\d]/.test(c)) {\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n\r\n  function readtoken() {\r\n    if(/[^\\d\\w_]/.test(c)) {\r\n      var contentstr = content.join('')\r\n      if(literalsDict[contentstr]) {\r\n        mode = KEYWORD\r\n      } else if(builtinsDict[contentstr]) {\r\n        mode = BUILTIN\r\n      } else {\r\n        mode = IDENT\r\n      }\r\n      token(content.join(''))\r\n      mode = NORMAL\r\n      return i\r\n    }\r\n    content.push(c)\r\n    last = c\r\n    return i + 1\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/index.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/lib/builtins-300es.js":
/*!***********************************************************!*\
  !*** ./node_modules/glsl-tokenizer/lib/builtins-300es.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// 300es builtins/reserved words that were previously valid in v100\r\nvar v100 = __webpack_require__(/*! ./builtins */ \"./node_modules/glsl-tokenizer/lib/builtins.js\")\r\n\r\n// The texture2D|Cube functions have been removed\r\n// And the gl_ features are updated\r\nv100 = v100.slice().filter(function (b) {\r\n  return !/^(gl\\_|texture)/.test(b)\r\n})\r\n\r\nmodule.exports = v100.concat([\r\n  // the updated gl_ constants\r\n    'gl_VertexID'\r\n  , 'gl_InstanceID'\r\n  , 'gl_Position'\r\n  , 'gl_PointSize'\r\n  , 'gl_FragCoord'\r\n  , 'gl_FrontFacing'\r\n  , 'gl_FragDepth'\r\n  , 'gl_PointCoord'\r\n  , 'gl_MaxVertexAttribs'\r\n  , 'gl_MaxVertexUniformVectors'\r\n  , 'gl_MaxVertexOutputVectors'\r\n  , 'gl_MaxFragmentInputVectors'\r\n  , 'gl_MaxVertexTextureImageUnits'\r\n  , 'gl_MaxCombinedTextureImageUnits'\r\n  , 'gl_MaxTextureImageUnits'\r\n  , 'gl_MaxFragmentUniformVectors'\r\n  , 'gl_MaxDrawBuffers'\r\n  , 'gl_MinProgramTexelOffset'\r\n  , 'gl_MaxProgramTexelOffset'\r\n  , 'gl_DepthRangeParameters'\r\n  , 'gl_DepthRange'\r\n\r\n  // other builtins\r\n  , 'trunc'\r\n  , 'round'\r\n  , 'roundEven'\r\n  , 'isnan'\r\n  , 'isinf'\r\n  , 'floatBitsToInt'\r\n  , 'floatBitsToUint'\r\n  , 'intBitsToFloat'\r\n  , 'uintBitsToFloat'\r\n  , 'packSnorm2x16'\r\n  , 'unpackSnorm2x16'\r\n  , 'packUnorm2x16'\r\n  , 'unpackUnorm2x16'\r\n  , 'packHalf2x16'\r\n  , 'unpackHalf2x16'\r\n  , 'outerProduct'\r\n  , 'transpose'\r\n  , 'determinant'\r\n  , 'inverse'\r\n  , 'texture'\r\n  , 'textureSize'\r\n  , 'textureProj'\r\n  , 'textureLod'\r\n  , 'textureOffset'\r\n  , 'texelFetch'\r\n  , 'texelFetchOffset'\r\n  , 'textureProjOffset'\r\n  , 'textureLodOffset'\r\n  , 'textureProjLod'\r\n  , 'textureProjLodOffset'\r\n  , 'textureGrad'\r\n  , 'textureGradOffset'\r\n  , 'textureProjGrad'\r\n  , 'textureProjGradOffset'\r\n])\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/lib/builtins-300es.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/lib/builtins.js":
/*!*****************************************************!*\
  !*** ./node_modules/glsl-tokenizer/lib/builtins.js ***!
  \*****************************************************/
/***/ ((module) => {

eval("module.exports = [\r\n  // Keep this list sorted\r\n  'abs'\r\n  , 'acos'\r\n  , 'all'\r\n  , 'any'\r\n  , 'asin'\r\n  , 'atan'\r\n  , 'ceil'\r\n  , 'clamp'\r\n  , 'cos'\r\n  , 'cross'\r\n  , 'dFdx'\r\n  , 'dFdy'\r\n  , 'degrees'\r\n  , 'distance'\r\n  , 'dot'\r\n  , 'equal'\r\n  , 'exp'\r\n  , 'exp2'\r\n  , 'faceforward'\r\n  , 'floor'\r\n  , 'fract'\r\n  , 'gl_BackColor'\r\n  , 'gl_BackLightModelProduct'\r\n  , 'gl_BackLightProduct'\r\n  , 'gl_BackMaterial'\r\n  , 'gl_BackSecondaryColor'\r\n  , 'gl_ClipPlane'\r\n  , 'gl_ClipVertex'\r\n  , 'gl_Color'\r\n  , 'gl_DepthRange'\r\n  , 'gl_DepthRangeParameters'\r\n  , 'gl_EyePlaneQ'\r\n  , 'gl_EyePlaneR'\r\n  , 'gl_EyePlaneS'\r\n  , 'gl_EyePlaneT'\r\n  , 'gl_Fog'\r\n  , 'gl_FogCoord'\r\n  , 'gl_FogFragCoord'\r\n  , 'gl_FogParameters'\r\n  , 'gl_FragColor'\r\n  , 'gl_FragCoord'\r\n  , 'gl_FragData'\r\n  , 'gl_FragDepth'\r\n  , 'gl_FragDepthEXT'\r\n  , 'gl_FrontColor'\r\n  , 'gl_FrontFacing'\r\n  , 'gl_FrontLightModelProduct'\r\n  , 'gl_FrontLightProduct'\r\n  , 'gl_FrontMaterial'\r\n  , 'gl_FrontSecondaryColor'\r\n  , 'gl_LightModel'\r\n  , 'gl_LightModelParameters'\r\n  , 'gl_LightModelProducts'\r\n  , 'gl_LightProducts'\r\n  , 'gl_LightSource'\r\n  , 'gl_LightSourceParameters'\r\n  , 'gl_MaterialParameters'\r\n  , 'gl_MaxClipPlanes'\r\n  , 'gl_MaxCombinedTextureImageUnits'\r\n  , 'gl_MaxDrawBuffers'\r\n  , 'gl_MaxFragmentUniformComponents'\r\n  , 'gl_MaxLights'\r\n  , 'gl_MaxTextureCoords'\r\n  , 'gl_MaxTextureImageUnits'\r\n  , 'gl_MaxTextureUnits'\r\n  , 'gl_MaxVaryingFloats'\r\n  , 'gl_MaxVertexAttribs'\r\n  , 'gl_MaxVertexTextureImageUnits'\r\n  , 'gl_MaxVertexUniformComponents'\r\n  , 'gl_ModelViewMatrix'\r\n  , 'gl_ModelViewMatrixInverse'\r\n  , 'gl_ModelViewMatrixInverseTranspose'\r\n  , 'gl_ModelViewMatrixTranspose'\r\n  , 'gl_ModelViewProjectionMatrix'\r\n  , 'gl_ModelViewProjectionMatrixInverse'\r\n  , 'gl_ModelViewProjectionMatrixInverseTranspose'\r\n  , 'gl_ModelViewProjectionMatrixTranspose'\r\n  , 'gl_MultiTexCoord0'\r\n  , 'gl_MultiTexCoord1'\r\n  , 'gl_MultiTexCoord2'\r\n  , 'gl_MultiTexCoord3'\r\n  , 'gl_MultiTexCoord4'\r\n  , 'gl_MultiTexCoord5'\r\n  , 'gl_MultiTexCoord6'\r\n  , 'gl_MultiTexCoord7'\r\n  , 'gl_Normal'\r\n  , 'gl_NormalMatrix'\r\n  , 'gl_NormalScale'\r\n  , 'gl_ObjectPlaneQ'\r\n  , 'gl_ObjectPlaneR'\r\n  , 'gl_ObjectPlaneS'\r\n  , 'gl_ObjectPlaneT'\r\n  , 'gl_Point'\r\n  , 'gl_PointCoord'\r\n  , 'gl_PointParameters'\r\n  , 'gl_PointSize'\r\n  , 'gl_Position'\r\n  , 'gl_ProjectionMatrix'\r\n  , 'gl_ProjectionMatrixInverse'\r\n  , 'gl_ProjectionMatrixInverseTranspose'\r\n  , 'gl_ProjectionMatrixTranspose'\r\n  , 'gl_SecondaryColor'\r\n  , 'gl_TexCoord'\r\n  , 'gl_TextureEnvColor'\r\n  , 'gl_TextureMatrix'\r\n  , 'gl_TextureMatrixInverse'\r\n  , 'gl_TextureMatrixInverseTranspose'\r\n  , 'gl_TextureMatrixTranspose'\r\n  , 'gl_Vertex'\r\n  , 'greaterThan'\r\n  , 'greaterThanEqual'\r\n  , 'inversesqrt'\r\n  , 'length'\r\n  , 'lessThan'\r\n  , 'lessThanEqual'\r\n  , 'log'\r\n  , 'log2'\r\n  , 'matrixCompMult'\r\n  , 'max'\r\n  , 'min'\r\n  , 'mix'\r\n  , 'mod'\r\n  , 'normalize'\r\n  , 'not'\r\n  , 'notEqual'\r\n  , 'pow'\r\n  , 'radians'\r\n  , 'reflect'\r\n  , 'refract'\r\n  , 'sign'\r\n  , 'sin'\r\n  , 'smoothstep'\r\n  , 'sqrt'\r\n  , 'step'\r\n  , 'tan'\r\n  , 'texture2D'\r\n  , 'texture2DLod'\r\n  , 'texture2DProj'\r\n  , 'texture2DProjLod'\r\n  , 'textureCube'\r\n  , 'textureCubeLod'\r\n  , 'texture2DLodEXT'\r\n  , 'texture2DProjLodEXT'\r\n  , 'textureCubeLodEXT'\r\n  , 'texture2DGradEXT'\r\n  , 'texture2DProjGradEXT'\r\n  , 'textureCubeGradEXT'\r\n]\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/lib/builtins.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/lib/literals-300es.js":
/*!***********************************************************!*\
  !*** ./node_modules/glsl-tokenizer/lib/literals-300es.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var v100 = __webpack_require__(/*! ./literals */ \"./node_modules/glsl-tokenizer/lib/literals.js\")\r\n\r\nmodule.exports = v100.slice().concat([\r\n   'layout'\r\n  , 'centroid'\r\n  , 'smooth'\r\n  , 'case'\r\n  , 'mat2x2'\r\n  , 'mat2x3'\r\n  , 'mat2x4'\r\n  , 'mat3x2'\r\n  , 'mat3x3'\r\n  , 'mat3x4'\r\n  , 'mat4x2'\r\n  , 'mat4x3'\r\n  , 'mat4x4'\r\n  , 'uvec2'\r\n  , 'uvec3'\r\n  , 'uvec4'\r\n  , 'samplerCubeShadow'\r\n  , 'sampler2DArray'\r\n  , 'sampler2DArrayShadow'\r\n  , 'isampler2D'\r\n  , 'isampler3D'\r\n  , 'isamplerCube'\r\n  , 'isampler2DArray'\r\n  , 'usampler2D'\r\n  , 'usampler3D'\r\n  , 'usamplerCube'\r\n  , 'usampler2DArray'\r\n  , 'coherent'\r\n  , 'restrict'\r\n  , 'readonly'\r\n  , 'writeonly'\r\n  , 'resource'\r\n  , 'atomic_uint'\r\n  , 'noperspective'\r\n  , 'patch'\r\n  , 'sample'\r\n  , 'subroutine'\r\n  , 'common'\r\n  , 'partition'\r\n  , 'active'\r\n  , 'filter'\r\n  , 'image1D'\r\n  , 'image2D'\r\n  , 'image3D'\r\n  , 'imageCube'\r\n  , 'iimage1D'\r\n  , 'iimage2D'\r\n  , 'iimage3D'\r\n  , 'iimageCube'\r\n  , 'uimage1D'\r\n  , 'uimage2D'\r\n  , 'uimage3D'\r\n  , 'uimageCube'\r\n  , 'image1DArray'\r\n  , 'image2DArray'\r\n  , 'iimage1DArray'\r\n  , 'iimage2DArray'\r\n  , 'uimage1DArray'\r\n  , 'uimage2DArray'\r\n  , 'image1DShadow'\r\n  , 'image2DShadow'\r\n  , 'image1DArrayShadow'\r\n  , 'image2DArrayShadow'\r\n  , 'imageBuffer'\r\n  , 'iimageBuffer'\r\n  , 'uimageBuffer'\r\n  , 'sampler1DArray'\r\n  , 'sampler1DArrayShadow'\r\n  , 'isampler1D'\r\n  , 'isampler1DArray'\r\n  , 'usampler1D'\r\n  , 'usampler1DArray'\r\n  , 'isampler2DRect'\r\n  , 'usampler2DRect'\r\n  , 'samplerBuffer'\r\n  , 'isamplerBuffer'\r\n  , 'usamplerBuffer'\r\n  , 'sampler2DMS'\r\n  , 'isampler2DMS'\r\n  , 'usampler2DMS'\r\n  , 'sampler2DMSArray'\r\n  , 'isampler2DMSArray'\r\n  , 'usampler2DMSArray'\r\n])\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/lib/literals-300es.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/lib/literals.js":
/*!*****************************************************!*\
  !*** ./node_modules/glsl-tokenizer/lib/literals.js ***!
  \*****************************************************/
/***/ ((module) => {

eval("module.exports = [\r\n  // current\r\n    'precision'\r\n  , 'highp'\r\n  , 'mediump'\r\n  , 'lowp'\r\n  , 'attribute'\r\n  , 'const'\r\n  , 'uniform'\r\n  , 'varying'\r\n  , 'break'\r\n  , 'continue'\r\n  , 'do'\r\n  , 'for'\r\n  , 'while'\r\n  , 'if'\r\n  , 'else'\r\n  , 'in'\r\n  , 'out'\r\n  , 'inout'\r\n  , 'float'\r\n  , 'int'\r\n  , 'uint'\r\n  , 'void'\r\n  , 'bool'\r\n  , 'true'\r\n  , 'false'\r\n  , 'discard'\r\n  , 'return'\r\n  , 'mat2'\r\n  , 'mat3'\r\n  , 'mat4'\r\n  , 'vec2'\r\n  , 'vec3'\r\n  , 'vec4'\r\n  , 'ivec2'\r\n  , 'ivec3'\r\n  , 'ivec4'\r\n  , 'bvec2'\r\n  , 'bvec3'\r\n  , 'bvec4'\r\n  , 'sampler1D'\r\n  , 'sampler2D'\r\n  , 'sampler3D'\r\n  , 'samplerCube'\r\n  , 'sampler1DShadow'\r\n  , 'sampler2DShadow'\r\n  , 'struct'\r\n\r\n  // future\r\n  , 'asm'\r\n  , 'class'\r\n  , 'union'\r\n  , 'enum'\r\n  , 'typedef'\r\n  , 'template'\r\n  , 'this'\r\n  , 'packed'\r\n  , 'goto'\r\n  , 'switch'\r\n  , 'default'\r\n  , 'inline'\r\n  , 'noinline'\r\n  , 'volatile'\r\n  , 'public'\r\n  , 'static'\r\n  , 'extern'\r\n  , 'external'\r\n  , 'interface'\r\n  , 'long'\r\n  , 'short'\r\n  , 'double'\r\n  , 'half'\r\n  , 'fixed'\r\n  , 'unsigned'\r\n  , 'input'\r\n  , 'output'\r\n  , 'hvec2'\r\n  , 'hvec3'\r\n  , 'hvec4'\r\n  , 'dvec2'\r\n  , 'dvec3'\r\n  , 'dvec4'\r\n  , 'fvec2'\r\n  , 'fvec3'\r\n  , 'fvec4'\r\n  , 'sampler2DRect'\r\n  , 'sampler3DRect'\r\n  , 'sampler2DRectShadow'\r\n  , 'sizeof'\r\n  , 'cast'\r\n  , 'namespace'\r\n  , 'using'\r\n]\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/lib/literals.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/lib/operators.js":
/*!******************************************************!*\
  !*** ./node_modules/glsl-tokenizer/lib/operators.js ***!
  \******************************************************/
/***/ ((module) => {

eval("module.exports = [\r\n    '<<='\r\n  , '>>='\r\n  , '++'\r\n  , '--'\r\n  , '<<'\r\n  , '>>'\r\n  , '<='\r\n  , '>='\r\n  , '=='\r\n  , '!='\r\n  , '&&'\r\n  , '||'\r\n  , '+='\r\n  , '-='\r\n  , '*='\r\n  , '/='\r\n  , '%='\r\n  , '&='\r\n  , '^^'\r\n  , '^='\r\n  , '|='\r\n  , '('\r\n  , ')'\r\n  , '['\r\n  , ']'\r\n  , '.'\r\n  , '!'\r\n  , '~'\r\n  , '*'\r\n  , '/'\r\n  , '%'\r\n  , '+'\r\n  , '-'\r\n  , '<'\r\n  , '>'\r\n  , '&'\r\n  , '^'\r\n  , '|'\r\n  , '?'\r\n  , ':'\r\n  , '='\r\n  , ','\r\n  , ';'\r\n  , '{'\r\n  , '}'\r\n]\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/lib/operators.js?");

/***/ }),

/***/ "./node_modules/glsl-tokenizer/string.js":
/*!***********************************************!*\
  !*** ./node_modules/glsl-tokenizer/string.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var tokenize = __webpack_require__(/*! ./index */ \"./node_modules/glsl-tokenizer/index.js\")\r\n\r\nmodule.exports = tokenizeString\r\n\r\nfunction tokenizeString(str, opt) {\r\n  var generator = tokenize(opt)\r\n  var tokens = []\r\n\r\n  tokens = tokens.concat(generator(str))\r\n  tokens = tokens.concat(generator(null))\r\n\r\n  return tokens\r\n}\r\n\n\n//# sourceURL=webpack://glsltokenizer/./node_modules/glsl-tokenizer/string.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});