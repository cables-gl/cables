!(function (f)
{
    if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f(); }
    else if (typeof define === "function" && define.amd) { define([], f); }
    else
    {
        let g; if (typeof window !== "undefined") { g = window; }
        else if (typeof global !== "undefined") { g = global; }
        else if (typeof self !== "undefined") { g = self; }
        else { g = this; }g.conwayhart = f();
    }
}(function ()
{
    let define, module, exports; return (function e(t, n, r)
    {
        function s(o, u) { if (!n[o]) { if (!t[o]) { let a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); let f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f; } let l = n[o] = { "exports": {} }; t[o][0].call(l.exports, function (e) { let n = t[o][1][e]; return s(n || e); }, l, l.exports, e, t, n, r); } return n[o].exports; }

        var i = typeof require == "function" && require; for (let o = 0; o < r.length; o++)s(r[o]); return s;
    }({ "1": [function (require, module, exports)
    {
        // Import operators
        let seeds = require("./lib/seeds.js");
        let operators = require("./lib/operators.js");

        // Seed types
        let SEED_FUNCS = {
            "T": seeds.tetrahedron,
            "O": seeds.octahedron,
            "C": seeds.cube,
            "I": seeds.icosahedron,
            "D": seeds.dodecahedron,
            "P": seeds.prism,
            "A": seeds.antiprism,
            "Y": seeds.pyramid
        };

        // Operator types
        let OPERATOR_FUNCS = {
            "k": operators.kis,
            "a": operators.ambo,
            "g": operators.gyro,
            "p": operators.propellor,
            "d": operators.dual,
            "r": operators.reflect,
            "c": operators.canonicalize
        };

        // Checks if a seed is a token
        function isToken(c)
        {
            return "kagpdcrTOCIDPAY".indexOf(c) >= 0;
        }

        // Checks if a value is numeric
        function isNumeric(c)
        {
            return c >= 48 && c <= 57;
        }

        // Tokenize an expression in Conway notation
        function tokenize(expr)
        {
            expr = expr.replace(/P4$/g, "C") // P4 --> C   (C is prism)
                .replace(/A3$/g, "O") // A3 --> O   (O is antiprism)
                .replace(/Y3$/g, "T") // Y3 --> T   (T is pyramid)
                .replace(/e/g, "aa") // e --> aa   (abbr. for explode)
                .replace(/b/g, "ta") // b --> ta   (abbr. for bevel)
                .replace(/o/g, "jj") // o --> jj   (abbr. for ortho)
                .replace(/m/g, "kj") // m --> kj   (abbr. for meta)
                .replace(/t(\d*)/g, "dk$1d") // t(n) --> dk(n)d  (dual operations)
                .replace(/j/g, "dad") // j --> dad  (dual operations)
                .replace(/s/g, "dgd") // s --> dgd  (dual operations)
                .replace(/dd/g, "") // dd --> null  (order 2)
                .replace(/ad/g, "a") // ad --> a   (a_ = ad_)
                .replace(/gd/g, "g") // gd --> g   (g_ = gd_)
                .replace(/aY/g, "A") // aY --> A   (interesting fact)
                .replace(/dT/g, "T") // dT --> T   (self-dual)
                .replace(/gT/g, "D") // gT --> D   (symm change)
                .replace(/aT/g, "O") // aT --> O   (symm change)
                .replace(/dC/g, "O") // dC --> O   (dual pair)
                .replace(/dO/g, "C") // dO --> C   (dual pair)
                .replace(/dI/g, "D") // dI --> D   (dual pair)
                .replace(/dD/g, "I") // dD --> I   (dual pair)
                .replace(/aO/g, "aC") // aO --> aC  (for uniqueness)
                .replace(/aI/g, "aD") // aI --> aD  (for uniqueness)
                .replace(/gO/g, "gC") // gO --> gC  (for uniqueness)
                .replace(/gI/g, "gD"); // gI --> gD  (for uniqueness)
            let toks = [];
            let ptr = 0;
            while (ptr < expr.length)
            {
                let op = expr.charAt(ptr);
                if (!isToken(op))
                {
                    throw new Error("Unexpected token: " + op + " in input " + expr + " at " + ptr);
                }
                let start_n = ++ptr;
                while (ptr < expr.length && isNumeric(expr.charCodeAt(ptr)))
                {
                    ++ptr;
                }
                let n = parseInt(expr.substr(start_n, ptr));
                toks.push({
                    "op": op,
                    "n": n | 0
                });
            }
            toks.reverse();
            return toks;
        }

        // Main expression interpreter
        function evalConwayHart(expr)
        {
            // Parse expression
            let toks = tokenize(expr);

            // Initialize seed
            let ctor = SEED_FUNCS[toks[0].op];
            if (!ctor)
            {
                throw Error("Invalid seed type: " + JSON.stringify(toks[0]));
            }
            else if ("PAY".indexOf(toks[0].op) >= 0)
            {
                if (toks[0].n < 3)
                {
                    throw Error("Invalid number of faces for seed");
                }
            }
            else if (toks[0].n !== 0)
            {
                throw Error("Seed " + toks[0].op + " does not use a parameter");
            }
            let poly = ctor(toks[0].n);

            // Apply operators
            for (let i = 1; i < toks.length; ++i)
            {
                let op = OPERATOR_FUNCS[toks[i].op];
                if (!op)
                {
                    throw Error("Invalid operator: " + toks[i]);
                }
                poly = op(poly, toks[i].n);
            }
            return { "name": poly.name, "cells": poly.faces, "positions": poly.positions };
        }

        module.exports = evalConwayHart;
    }, { "./lib/operators.js": 5, "./lib/seeds.js": 6 }],
    "2": [function (require, module, exports)
    {
        function Assembler()
        {
            this.flags = {};
            this.positions = {};
            this.faces = {};
        }

        Assembler.prototype.newFlag = function (face, v1, v2)
        {
            if (!this.flags[face])
            {
                this.flags[face] = { };
            }
            this.flags[face][v1] = v2;
        };

        Assembler.prototype.newV = function (name, p)
        {
            this.positions[name] = p;
        };

        Assembler.prototype.flags2poly = function ()
        {
            let rpositions = [];
            let verts = {};
            for (var i in this.positions)
            {
                verts[i] = rpositions.length;
                rpositions.push(this.positions[i]);
            }
            let rfaces = [];
            for (var i in this.flags)
            {
                let flag = this.flags[i];
                let f = [];
                let v0 = Object.keys(flag)[0];
                let v = v0;
                do
                {
                    f.push(verts[v]);
                    v = flag[v];
                } while (v != v0);
                rfaces.push(f);
            }
            return {
                "name": "?",
                "positions": rpositions,
                "faces": rfaces
            };
        };

        module.exports = Assembler;
    }, {}],
    "3": [function (require, module, exports)
    {
        // -------------------Canonicalization Algorithm--------------------------
        // True canonicalization rather slow.  Using center of gravity of vertices for each
        // face gives a quick "adjustment" which planarizes faces at least.


        let util = require("./util.js");
        let makeDual = require("./dual.js");

        function reciprocalN(poly)
        { // make array of vertices reciprocal to given planes
            let ans = new Array(poly.faces.length);
            for (let i = 0; i < poly.faces.length; ++i)
            { // for each face:
                let centroid = [0.0, 0.0, 0.0]; // running sum of vertex coords
                let normal = [0.0, 0.0, 0.0]; // running sum of normal vectors
                let avgEdgeDist = 0.0; // running sum for avg edge distance
                let v1 = poly.faces[i][poly.faces[i].length - 2]; // preprevious vertex
                let v2 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (let j = 0; j < poly.faces[i].length; j++)
                {
                    let v3 = poly.faces[i][j]; // this vertex
                    centroid = util.add(centroid, poly.positions[v3]);
                    normal = util.add(normal, util.orthogonal(poly.positions[v1], poly.positions[v2], poly.positions[v3]));
                    avgEdgeDist += util.edgeDist(poly.positions[v1], poly.positions[v2]);
                    v1 = v2; // shift over one
                    v2 = v3;
                }
                centroid = util.mult(1.0 / poly.faces[i].length, centroid);
                normal = util.unit(normal);
                avgEdgeDist /= poly.faces[i].length;
                ans[i] = util.reciprocal(util.mult(util.dot(centroid, normal), normal)); // based on face
                ans[i] = util.mult((1 + avgEdgeDist) / 2, ans[i]); // edge correction
            }
            return (ans);
        }

        function reciprocalC(poly)
        { // return array of reciprocals of face centers
            let center = faceCenters(poly);
            for (let i = 0; i < poly.faces.length; i++)
            {
                let m2 = center[i][0] * center[i][0] + center[i][1] * center[i][1] + center[i][2] * center[i][2];
                center[i][0] = center[i][0] / m2; // divide each coord by magnitude squared
                center[i][1] = center[i][1] / m2;
                center[i][2] = center[i][2] / m2;
            }
            return (center);
        }

        function faceCenters(poly)
        { // return array of "face centers"
            let ans = new Array(poly.faces.length);
            for (let i = 0; i < poly.faces.length; i++)
            {
                ans[i] = util.vecZero(); // running sum
                for (let j = 0; j < poly.faces[i].length; j++) // just average vertex coords:
                    ans[i] = util.add(ans[i], poly.positions[poly.faces[i][j]]); // sum and...
                ans[i] = util.mult(1.0 / poly.faces[i].length, ans[i]); // ...divide by n
            }
            return (ans);
        }

        exports.faceCenters = faceCenters;

        function canonicalpositions(poly, nIterations)
        { // compute new vertex coords.
            let dpoly = makeDual(poly); // v's of dual are in order or arg's f's
            for (let count = 0; count < nIterations; count++)
            { // iteration:
                dpoly.positions = reciprocalN(poly);
                poly.positions = reciprocalN(dpoly);
            }
        }

        exports.canonicalpositions = canonicalpositions;

        function adjustpositions(poly, nIterations)
        {
            let dpoly = makeDual(poly); // v's of dual are in order or arg's f's
            for (let count = 0; count < 1; count++)
            { // iteration:
                dpoly.positions = reciprocalC(poly); // reciprocate face centers
                poly.positions = reciprocalC(dpoly); // reciprocate face centers
            }
        }

        exports.adjustpositions = adjustpositions;
    }, { "./dual.js": 4, "./util.js": 7 }],
    "4": [function (require, module, exports)
    {
        // --------------------------------Dual------------------------------------------
        // the makeDual function computes the dual's topology, needed for canonicalization,
        // where positions's are determined.  It is then saved in a global variable globSavedDual.
        // when the d operator is executed, d just returns the saved value.


        let Assembler = require("./assembler.js");
        let util = require("./util.js");

        module.exports = function (poly)
        { // compute dual of argument, matching V and F indices
            let result = new Assembler();
            let faces = new Array(poly.positions.length); // make table of face as fn of edge
            for (var i = 0; i < poly.positions.length; i++)
            {
                faces[i] = new Object(); // create empty associative table
            }
            for (var i = 0; i < poly.faces.length; i++)
            {
                var v1 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (j = 0; j < poly.faces[i].length; j++)
                {
                    var v2 = poly.faces[i][j]; // this vertex
                    faces[v1]["v" + v2] = i; // fill it.  2nd index is associative
                    v1 = v2; // current becomes previous
                }
            }
            for (var i = 0; i < poly.faces.length; i++)
            { // create d's v's per p's f's
                result.newV(i, [0, 0, 0]); // only topology needed for canonicalize
            }
            for (var i = 0; i < poly.faces.length; i++)
            { // one new flag for each old one
                var v1 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (j = 0; j < poly.faces[i].length; j++)
                {
                    var v2 = poly.faces[i][j]; // this vertex
                    result.newFlag(v1, faces[v2]["v" + v1], i); // look up face across edge
                    v1 = v2; // current becomes previous
                }
            }
            let ans = result.flags2poly(); // this gives one indexing of answer
            let sortF = new Array(ans.faces.length); // but f's of dual are randomly ordered, so sort
            for (var i = 0; i < ans.faces.length; i++)
            {
                var j = util.intersect(poly.faces[ans.faces[i][0]], poly.faces[ans.faces[i][1]], poly.faces[ans.faces[i][2]]);
                sortF[j] = ans.faces[i]; // p's v for d's f is common to three of p's f's
            }
            ans.faces = sortF; // replace with the sorted list of faces
            if (poly.name)
            {
                if (poly.name.substr(0, 1) != "d")
                {
                    ans.name = "d" + poly.name; // dual name is same with "d" added...
                }
                else
                {
                    ans.name = poly.name.substr(1); // ...or removed
                }
            }
            return ans;
        };
    }, { "./assembler.js": 2, "./util.js": 7 }],
    "5": [function (require, module, exports)
    {
        let util = require("./util.js");
        let makeDual = require("./dual.js");
        let Assembler = require("./assembler.js");
        let canonicalize = require("./canonicalize.js");

        exports.dual = function (poly)
        {
            let dpoly = makeDual(poly);
            dpoly.positions = canonicalize.faceCenters(poly);
            return dpoly;
        };

        exports.canonicalize = function (poly)
        {
            poly = util.clone(poly);
            canonicalize.canonicalpositions(poly);
            return poly;
        };

        function kis(poly, n)
        { // only kis n-sided faces, but n==0 means kiss all.
            let result = new Assembler();
            for (var i = 0; i < poly.positions.length; i++)
            {
                result.newV("v" + i, poly.positions[i]); // each old vertex is a new vertex
            }
            let centers = canonicalize.faceCenters(poly); // new vertices in centers of n-sided face
            let foundAny = false; // alert if don't find any
            for (var i = 0; i < poly.faces.length; i++)
            {
                let v1 = "v" + poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (let j = 0; j < poly.faces[i].length; j++)
                {
                    let v2 = "v" + poly.faces[i][j]; // this vertex
                    if (poly.faces[i].length == n || n == 0)
                    { // kiss the n's, or all
                        foundAny = true; // flag that we found some
                        result.newV("f" + i, centers[i]); // new vertex in face center
                        let fname = i + v1;
                        result.newFlag(fname, v1, v2); // three new flags, if n-sided
                        result.newFlag(fname, v2, "f" + i);
                        result.newFlag(fname, "f" + i, v1);
                    }
                    else
                        result.newFlag(i, v1, v2); // same old flag, if non-n
                    v1 = v2; // current becomes previous
                }
            }
            let ans = result.flags2poly();
            ans.name = "k" + (n === 0 ? "" : n) + poly.name;
            canonicalize.adjustpositions(ans, 3); // adjust and
            return (ans);
        }

        exports.kis = kis;

        function ambo(poly)
        { // compute ambo of argument
            let result = new Assembler();
            for (let i = 0; i < poly.faces.length; i++)
            {
                let v1 = poly.faces[i][poly.faces[i].length - 2]; // preprevious vertex
                let v2 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (let j = 0; j < poly.faces[i].length; j++)
                {
                    let v3 = poly.faces[i][j]; // this vertex
                    if (v1 < v2) // new vertices at edge midpoints
                        result.newV(midName(v1, v2), util.midpoint(poly.positions[v1], poly.positions[v2]));
                    result.newFlag("f" + i, midName(v1, v2), midName(v2, v3)); // two new flags
                    result.newFlag("v" + v2, midName(v2, v3), midName(v1, v2));
                    v1 = v2; // shift over one
                    v2 = v3;
                }
            }
            let ans = result.flags2poly();
            ans.name = "a" + poly.name;
            canonicalize.adjustpositions(ans, 2); // canonicalize lightly
            return (ans);
        }

        exports.ambo = ambo;

        function midName(v1, v2)
        { // unique symbolic name, e.g. "1_2"
            if (v1 < v2)
                return (v1 + "_" + v2);
            else
                return (v2 + "_" + v1);
        }

        function gyro(poly)
        { // compute gyro of argument
            let result = new Assembler();
            for (var i = 0; i < poly.positions.length; i++)
                result.newV("v" + i, util.unit(poly.positions[i])); // each old vertex is a new vertex
            let centers = canonicalize.faceCenters(poly); // new vertices in center of each face
            for (var i = 0; i < poly.faces.length; i++)
                result.newV("f" + i, util.unit(centers[i]));
            for (var i = 0; i < poly.faces.length; i++)
            {
                let v1 = poly.faces[i][poly.faces[i].length - 2]; // preprevious vertex
                let v2 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (let j = 0; j < poly.faces[i].length; j++)
                {
                    let v3 = poly.faces[i][j]; // this vertex
                    result.newV(v1 + "~" + v2, util.oneThird(poly.positions[v1], poly.positions[v2])); // new v in face
                    let fname = i + "f" + v1;
                    result.newFlag(fname, "f" + i, v1 + "~" + v2); // five new flags
                    result.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
                    result.newFlag(fname, v2 + "~" + v1, "v" + v2);
                    result.newFlag(fname, "v" + v2, v2 + "~" + v3);
                    result.newFlag(fname, v2 + "~" + v3, "f" + i);
                    v1 = v2; // shift over one
                    v2 = v3;
                }
            }
            let ans = result.flags2poly();
            ans.name = "g" + poly.name;
            canonicalize.adjustpositions(ans, 3); // canonicalize lightly
            return (ans);
        }

        exports.gyro = gyro;

        function propellor(poly)
        { // compute propellor of argument
            let result = new Assembler();
            for (var i = 0; i < poly.positions.length; i++)
                result.newV("v" + i, util.unit(poly.positions[i])); // each old vertex is a new vertex
            for (var i = 0; i < poly.faces.length; i++)
            {
                let v1 = poly.faces[i][poly.faces[i].length - 2]; // preprevious vertex
                let v2 = poly.faces[i][poly.faces[i].length - 1]; // previous vertex
                for (let j = 0; j < poly.faces[i].length; j++)
                {
                    let v3 = poly.faces[i][j]; // this vertex
                    result.newV(v1 + "~" + v2, util.oneThird(poly.positions[v1], poly.positions[v2])); // new v in face
                    let fname = i + "f" + v2;
                    result.newFlag("v" + i, v1 + "~" + v2, v2 + "~" + v3); // five new flags
                    result.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
                    result.newFlag(fname, v2 + "~" + v1, "v" + v2);
                    result.newFlag(fname, "v" + v2, v2 + "~" + v3);
                    result.newFlag(fname, v2 + "~" + v3, v1 + "~" + v2);
                    v1 = v2; // shift over one
                    v2 = v3;
                }
            }
            let ans = result.flags2poly();
            ans.name = "p" + poly.name;
            canonicalize.adjustpositions(ans, 3); // canonicalize lightly
            return (ans);
        }

        exports.propellor = propellor;

        function reflect(poly)
        { // compute reflection through origin
            poly = util.clone(poly);
            for (var i = 0; i < poly.positions.length; i++)
                poly.positions[i] = util.mult(-1, poly.positions[i]); // reflect each point
            for (var i = 0; i < poly.faces.length; i++)
                poly.faces[i] = poly.faces[i].reverse(); // repair clockwise-ness
            poly.name = "r" + poly.name;
            canonicalize.adjustpositions(poly, 1); // build dual
            return (poly);
        }

        exports.reflect = reflect;


        exports.expand = function (poly)
        {
            return ambo(ambo(poly));
        };

        exports.bevel = function (poly)
        {
            return truncate(ambo(poly));
        };

        exports.ortho = function (poly)
        {
            return join(join(poly));
        };

        exports.meta = function (poly)
        {
            return kis(join(poly));
        };

        exports.truncate = function (poly, n)
        {
            return dual(kis(dual(poly), n));
        };

        exports.join = function (poly)
        {
            return dual(ambo(dual(poly)));
        };

        exports.split = function (poly)
        {
            return dual(gyro(dual(poly)));
        };
    }, { "./assembler.js": 2, "./canonicalize.js": 3, "./dual.js": 4, "./util.js": 7 }],
    "6": [function (require, module, exports)
    {
        let util = require("./util.js");
        let canonicalize = require("./canonicalize.js");

        module.exports = {
            "tetrahedron": function ()
            {
                return {
                    "name": "T",
                    "faces": [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]],
                    "positions": [[1.0, 1.0, 1.0], [1.0, -1.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, -1.0, 1.0]]
                };
            },
            "octahedron": function ()
            {
                return {
                    "name": "O",
                    "faces": [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [1, 4, 5], [1, 5, 2], [2, 5, 3], [3, 5, 4]],
                    "positions": [[0, 0, 1.414], [1.414, 0, 0], [0, 1.414, 0], [-1.414, 0, 0], [0, -1.414, 0], [0, 0, -1.414]]
                };
            },
            "cube": function ()
            {
                return {
                    "name": "C",
                    "faces": [[3, 0, 1, 2], [3, 4, 5, 0], [0, 5, 6, 1], [1, 6, 7, 2], [2, 7, 4, 3], [5, 4, 7, 6]],
                    "positions": [[0.707, 0.707, 0.707], [-0.707, 0.707, 0.707],
                        [-0.707, -0.707, 0.707], [0.707, -0.707, 0.707],
                        [0.707, -0.707, -0.707], [0.707, 0.707, -0.707],
                        [-0.707, 0.707, -0.707], [-0.707, -0.707, -0.707]]
                };
            },
            "icosahedron": function ()
            {
                return {
                    "name": "I",
                    "faces": [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5],
                        [0, 5, 1], [1, 5, 7], [1, 7, 6], [1, 6, 2],
                        [2, 6, 8], [2, 8, 3], [3, 8, 9], [3, 9, 4],
                        [4, 9, 10], [4, 10, 5], [5, 10, 7], [6, 7, 11],
                        [6, 11, 8], [7, 10, 11], [8, 11, 9], [9, 11, 10]],
                    "positions": [[0, 0, 1.176], [1.051, 0, 0.526],
                        [0.324, 1.0, 0.525], [-0.851, 0.618, 0.526],
                        [-0.851, -0.618, 0.526], [0.325, -1.0, 0.526],
                        [0.851, 0.618, -0.526], [0.851, -0.618, -0.526],
                        [-0.325, 1.0, -0.526], [-1.051, 0, -0.526],
                        [-0.325, -1.0, -0.526], [0, 0, -1.176]]

                };
            },
            "dodecahedron": function ()
            {
                return {
                    "name": "D",
                    "faces": [[0, 1, 4, 7, 2], [0, 2, 6, 9, 3], [0, 3, 8, 5, 1],
                        [1, 5, 11, 10, 4], [2, 7, 13, 12, 6], [3, 9, 15, 14, 8],
                        [4, 10, 16, 13, 7], [5, 8, 14, 17, 11], [6, 12, 18, 15, 9],
                        [10, 11, 17, 19, 16], [12, 13, 16, 19, 18], [14, 15, 18, 19, 17]],
                    "positions": [[0, 0, 1.07047], [0.713644, 0, 0.797878],
                        [-0.356822, 0.618, 0.797878], [-0.356822, -0.618, 0.797878],
                        [0.797878, 0.618034, 0.356822], [0.797878, -0.618, 0.356822],
                        [-0.934172, 0.381966, 0.356822], [0.136294, 1.0, 0.356822],
                        [0.136294, -1.0, 0.356822], [-0.934172, -0.381966, 0.356822],
                        [0.934172, 0.381966, -0.356822], [0.934172, -0.381966, -0.356822],
                        [-0.797878, 0.618, -0.356822], [-0.136294, 1.0, -0.356822],
                        [-0.136294, -1.0, -0.356822], [-0.797878, -0.618034, -0.356822],
                        [0.356822, 0.618, -0.797878], [0.356822, -0.618, -0.797878],
                        [-0.713644, 0, -0.797878], [0, 0, -1.07047]]
                };
            },
            "prism": function (n)
            {
                let theta = Math.PI * 2.0 / n;
                let h = Math.sin(theta / 2);
                let positions = [];
                for (var i = 0; i < n; i++)
                {
                    positions.push([Math.cos(i * theta), Math.sin(i * theta), h]);
                }
                for (var i = 0; i < n; i++)
                {
                    positions.push([Math.cos(i * theta), Math.sin(i * theta), -h]);
                }
                let faces = [util.sequence(n - 1, 0), util.sequence(n, 2 * n - 1)];
                for (var i = 0; i < n; ++i)
                {
                    faces.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
                }
                let result = {
                    "name": "P" + n,
                    "positions": positions,
                    "faces": faces
                };
                canonicalize.adjustpositions(result, 1);
                return result;
            },
            "antiprism": function (n)
            {
                let theta = Math.PI * 2.0 / n;
                let h = Math.sqrt(1 - 4 / (4 + 2 * Math.cos(theta / 2) - 2 * Math.cos(theta)));
                let r = Math.sqrt(1 - h * h);
                let f = Math.sqrt(h * h + Math.pow(r * Math.cos(theta / 2), 2));
                r /= f;
                h /= f;
                let positions = [];
                for (var i = 0; i < n; i++)
                {
                    positions.push([r * Math.cos(i * theta), r * Math.sin(i * theta), h]);
                }
                for (var i = 0; i < n; i++)
                {
                    positions.push([r * Math.cos((i + 0.5) * theta), r * Math.sin((i + 0.5) * theta), -h]);
                }
                let faces = [util.sequence(n - 1, 0), util.sequence(n, 2 * n - 1)];
                for (var i = 0; i < n; i++)
                {
                    faces.push([i, (i + 1) % n, i + n]);
                    faces.push([i, i + n, ((n + i - 1) % n + n)]);
                }
                let result = {
                    "name": "A" + n,
                    "positions": positions,
                    "faces": faces
                };
                canonicalize.adjustpositions(result, 1);
                return result;
            },
            "pyramid": function (n)
            {
                let theta = Math.PI * 2.0 / n;
                let positions = [];
                for (var i = 0; i < n; ++i)
                {
                    positions.push([Math.cos(i * theta), Math.sin(i * theta), 0.2]);
                }
                positions.push([0, 0, -2]);
                let faces = [util.sequence(n - 1, 0)];
                for (var i = 0; i < n; ++i)
                {
                    faces.push([i, (i + 1) % n, n]);
                }
                let result = {
                    "name": "Y" + n,
                    "positions": positions,
                    "faces": faces
                };
                canonicalize.canonicalpositions(result, 3);
                return result;
            }
        };
    }, { "./canonicalize.js": 3, "./util.js": 7 }],
    "7": [function (require, module, exports)
    {
        function clone(poly)
        {
            let npositions = new Array(poly.positions.length);
            for (var i = 0; i < poly.positions.length; ++i)
            {
                npositions[i] = poly.positions[i].slice(0);
            }
            let nfaces = [];
            for (var i = 0; i < poly.faces.length; ++i)
            {
                nfaces[i] = poly.faces[i].slice(0);
            }
            return {
                "name": poly.name.slice(0),
                "positions": npositions,
                "faces": nfaces
            };
        }

        exports.clone = clone;

        function intersect(set1, set2, set3)
        { // find element common to 3 sets
            for (let i = 0; i < set1.length; i++)
            { // by brute force search
                for (let j = 0; j < set2.length; j++)
                {
                    if (set1[i] === set2[j])
                    {
                        for (let k = 0; k < set3.length; k++)
                        {
                            if (set1[i] === set3[k])
                            {
                                return set1[i];
                            }
                        }
                    }
                }
            }
            throw new Error("program bug in intersect()");
            return null;
        }

        exports.intersect = intersect;

        function sequence(start, stop)
        { // make list of integers, inclusive
            let ans = new Array();
            if (start <= stop)
            {
                for (var i = start; i <= stop; i++)
                {
                    ans.push(i);
                }
            }
            else
            {
                for (var i = start; i >= stop; i--)
                {
                    ans.push(i);
                }
            }
            return ans;
        }

        exports.sequence = sequence;

        function orthogonal(v3, v2, v1)
        { // find unit vector orthog to plane of 3 pts
            let d1 = sub(v2, v1); // adjacent edge vectors
            let d2 = sub(v3, v2);
            return [d1[1] * d2[2] - d1[2] * d2[1], // cross product
                d1[2] * d2[0] - d1[0] * d2[2],
                d1[0] * d2[1] - d1[1] * d2[0]];
        }

        exports.orthogonal = orthogonal;

        function mag2(vec)
        { // magnitude squared of 3-vector
            return vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];
        }

        exports.mag2 = mag2;

        function tangentPoint(v1, v2)
        { // point where line v1...v2 tangent to an origin sphere
            let d = sub(v2, v1); // difference vector
            console.log(d);
            return (sub(v1, mult(dot(d, v1) / mag2(d), d)));
        }

        exports.tangentPoint = tangentPoint;

        function edgeDist(v1, v2)
        { // distance of line v1...v2 to origin
            return (Math.sqrt(mag2(tangentPoint(v1, v2))));
        }

        exports.edgeDist = edgeDist;

        function vecZero()
        {
            return [0.0, 0.0, 0.0];
        }

        exports.vecZero = vecZero;

        function mult(c, vec)
        { // c times 3-vector
            return [c * vec[0],
                c * vec[1],
                c * vec[2]];
        }

        exports.mult = mult;

        function add(vec1, vec2)
        { // sum two 3-vectors
            return [vec1[0] + vec2[0],
                vec1[1] + vec2[1],
                vec1[2] + vec2[2]];
        }

        exports.add = add;

        function sub(vec1, vec2)
        { // subtract two 3-vectors
            return [vec1[0] - vec2[0],
                vec1[1] - vec2[1],
                vec1[2] - vec2[2]];
        }

        exports.sub = sub;

        function dot(vec1, vec2)
        { // dot product two 3-vectors
            return (vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]);
        }

        exports.dot = dot;

        function midpoint(vec1, vec2)
        { // mean of two 3-vectors
            return [0.5 * (vec1[0] + vec2[0]),
                0.5 * (vec1[1] + vec2[1]),
                0.5 * (vec1[2] + vec2[2])];
        }

        exports.midpoint = midpoint;

        function oneThird(vec1, vec2)
        { // approx. (2/3)v1 + (1/3)v2   (assumes 3-vector)
            return [0.7 * vec1[0] + 0.3 * vec2[0],
                0.7 * vec1[1] + 0.3 * vec2[1],
                0.7 * vec1[2] + 0.3 * vec2[2]];
            return ans;
        }

        exports.oneThird = oneThird;

        function reciprocal(vec)
        { // reflect 3-vector in unit sphere
            let factor = 1.0 / mag2(vec);
            return [factor * vec[0],
                factor * vec[1],
                factor * vec[2]];
        }

        exports.reciprocal = reciprocal;

        function unit(vec)
        { // normalize 3-vector to unit magnitude
            let size = mag2(vec);
            if (size <= 1e-8)
            { // remove this test someday...
                return (vec);
            }
            let c = 1.0 / Math.sqrt(size);
            return mult(c, vec);
        }

        exports.unit = unit;
    }, {}] }, {}, [1]))(1);
}));
