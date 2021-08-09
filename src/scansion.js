// (C) 2014-2021 Dylan Holmes
// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License (GNU
// GPL) as published by the Free Software Foundation, either version 3
// of the License, or (at your option) any later version.  The code is
// distributed WITHOUT ANY WARRANTY; without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU GPL for more details.

// As additional permission under GNU GPL version 3 section 7, you
// may distribute non-source (e.g., minimized or compacted) forms of
// this code without the copy of the GNU GPL normally required by
// section 4, provided you include this license notice and a URL
// through which recipients can access the Corresponding Source.

// @source: http://logical.ai/arma/scansion.js

function Scansion (input) {
    init_vowels();

    var $ip;

    //var dipthongs = ["ae","au","ei","eu","oe"]; //ui
    var short = {};
    var long = {};
    // unicode values
    const diacritic = {
        772: "long",
        774: "short",
        769: "stress",
        124: "pipe",
        8255: "elision"
    };



    function html (h) {
        return $("<div/>").append(h).html();
    }



    function init_vowels () {
        short = {
            "a": 259,
            "e": 277,
            "i": 301,
            "o": 335,
            "u": 365,
            "A": 258,
            "E": 276,
            "I": 300,
            "O": 334,
            "U": 364,
            "oe": 338,
        };

        long = {
            "a": 257,
            "e": 275,
            "i": 299,
            "o": 333,
            "u": 363,
            "A": 256,
            "E": 274,
            "I": 298,
            "O": 332,
            "U": 362,
            "oe": 338,
        };


        //short["y"] = html("&#xe776;");
        for (v in short) {
            short[v] = html("&#" + short[v] + ";");
        }
        for (v in long) {
            long[v] = html("&#" + long[v] + ";");
        }
    }



    function is_string (x) {
        return (typeof x == "string")
    }



    function tokenizer (search_expr, match_into_token) {
        // Convert a string into a sequence of tokens
        // given an expression to look for and instructions
        // for how to process each match.

        var recur = function (tokens) {
            ret = [];
            for (var i in tokens) {
                if (is_string(tokens[i])) {
                    prev = 0;
                    search_expr.lastIndex = 0;
                    while ((m = search_expr.exec(tokens[i])) != null) {
                        ret.push(tokens[i].substr(prev, m.index - prev));
                        ret.push(match_into_token(m));
                        prev = m.index + m[1].length;
                    }
                    ret.push(tokens[i].substr(prev));
                } else {
                    ret.push(tokens[i]);
                }
            }
            return ret;
        };
        return recur;
    }



    var tokenize_j = function (tokens) {

        // STAGE ONE:
        // initial "i" followed by a vowel is a consonant.

        var e = /(\b|^)(|in|ex?|pro|a[bd]|sub|non|super|per|ob)(i)([aeiou])/ig;

        var ret = [];
        var m;
        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0; // reset for each token
                while ((m = e.exec(tokens[i])) != null) {
                    //		console.log(m);
                    // add all the characters between the last match and this one
                    ret.push(tokens[i].substr(prev, m.index - prev) + m[2]);
                    ret.push({
                        "type": "token",
                        "vowel": false,
                        "text": m[3] == m[3].toLowerCase() ? "j" : "J",
                        "root": "j",
                        "mora": 1
                    });
                    prev = m.index + m[2].length + m[3].length;


                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }

        // STAGE TWO:
        // "i" between two vowels is a consonant. (intervocalic)
        tokens = ret;
        ret = [];
        var e = /([aeiou])(i)([aeiou])/ig;
        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0; // reset for each token
                while ((m = e.exec(tokens[i])) != null) {
                    //		console.log(m);
                    // add all the characters between the last match and this one
                    ret.push(tokens[i].substr(prev, m.index - prev) + m[1]);
                    ret.push({
                        "type": "token",
                        "vowel": false,
                        "text": m[3] == m[3].toLowerCase() ? "j" : "J",
                        "root": "j",
                        "mora": 1
                    });
                    prev = m.index + m[2].length + m[3].length;
                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }


        return ret;
    }



    var tokenize_i_vowel = function (tokens) {

        // STAGE ONE:
        // "i" which is the only potential vowel in a word is a vowel.
        var e = /(\b|^)([^aeiou]*)(i)([^aeiou]*)(\b|$)/ig;

        //var e = /(()(i)([^aeoiu\b])|(\b[^aeiou\b]*)(i)([^aeiou\b]*\b))/ig;
        var ret = [];
        var m;
        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0; // reset for each token
                while ((m = e.exec(tokens[i])) != null) {

                    // add all the characters between the last match and this one
                    ret.push(tokens[i].substr(prev, m.index - prev) + m[2]);
                    ret.push({
                        "type": "token",
                        "vowel": true,
                        "text": m[3],
                        "root": m[3].toLowerCase()
                    });
                    prev = m.index + m[2].length + m[3].length;

                    //		console.log(m);
                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }

        // STAGE TWO:
        // "i" followed by a consonant or word boundary is definitely a vowel.

        tokens = ret;
        ret = [];
        var e = /(i)([^aeiou]|\b)/ig;

        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0; // reset for each token
                while ((m = e.exec(tokens[i])) != null) {
                    // console.log(m);
                    // // add all the characters between the last match and this one
                    ret.push(tokens[i].substr(prev, m.index - prev));
                    ret.push({
                        "type": "token",
                        "vowel": true,
                        "text": m[1],
                        "root": m[1].toLowerCase()
                    });
                    prev = m.index + m[0].length - 1;
                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }


        return ret;
    }

    var tokenize_j_PREVIOUS = function (tokens) {
        var ret = [];
        // "i" followed by a consonant is definitely a vowel
        // "i" which is the only vowel in a word is a vowel
        // "i" which is at the beginning of the word and followed by a vowel is a consonant

        var e = /(()(i)([^aeoiu\b])|(\b[^aeiou\b]*)(i)([^aeiou\b]\b))/ig;
        //var e = /(\b([^aeiou\b]*i[^\baeiou]*)\b)/ig;
        var m;
        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0;
                while ((m = e.exec(tokens[i])) != null) {
                    var n = ret.slice(2);
                    while (n.length > 0 && !n[0]) {
                        n.shift();
                    }

                    ret.push(tokens[i].substr(prev, m.index - prev) + m[2]);
                    ret.push({
                        "type": "token",
                        "vowel": true,
                        "text": m[3],
                        "root": m[3].toLowerCase()
                    });
                    prev = m.index + m[2].length + m[3].length;
                    e.lastIndex += m[2].length;
                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }

        return ret;
    }



    var tokenize_j2 = function (tokens) {
        var ret = [];
        // "i" which is at the beginning of the word and followed by a vowel is a consonant
        // maybe "i" which is between certain vowels is a consonant

        // [counter]examples
        // initial i followed by vowel: iunonis, io?, iactatus
        // i followed by a vowel: eiacio, pompeii xxxxx
        // i after consonant: diu, adiectus

        var e = /((^|\b)(i)([aeiou]))/ig;
        // |([aeo])(i)([aeo])
        var m;
        for (var i in tokens) {
            if (is_string(tokens[i])) {
                prev = 0;
                e.lastIndex = 0;
                while ((m = e.exec(tokens[i])) != null) {
                    m = m.filter(function (x) {
                        return typeof x != "undefined"
                    });
                    var n = ret.slice(2);
                    while (n.length > 0 && !n[0]) {
                        n.shift();
                    }

                    ret.push(tokens[i].substr(prev, m.index - prev) + m[2]);
                    ret.push({
                        "type": "token",
                        "vowel": false,
                        "text": m[3] == m[3].toLowerCase() ? "j" : "J",
                        "root": "j"
                    });
                    prev = m.index + m[2].length + m[3].length;
                    e.lastIndex += m[2].length;
                }
                ret.push(tokens[i].substr(prev));
            } else {
                ret.push(tokens[i]);
            }
        }

        return ret;
    }



    var tokenize_digraphs = tokenizer(/(qu|[cpt]h)/ig, function (m) {
        // I've removed gu digraph because of profugus
        return {
            "type": "token",
            "root": m[1].toLowerCase(),
            "text": m[1],
            "mora": 1
        };
    });

    var tokenize_dipthongs = tokenizer(/(ae|au|ei|oe|ui)/ig, function (m) {
        return {
            "type": "token",
            "root": m[1].toLowerCase(),
            "text": m[1],
            "mora": 2,
            "vowel": true
        };
    });

    var tokenize_liquids = tokenizer(/([bcdfgpt][lr])/ig, function (m) {
        return {
            "type": "token",
            "root": m[1].toLowerCase(),
            "text": m[1],
            "mora": 1
        };
    });


    var tokenize_doubles = tokenizer(/([xz])/ig, function () {
        return {
            "type": "token",
            "root": m[1].toLowerCase(),
            "text": m[1],
            "mora": 2
        };
    });

    var tokenize_vowels = tokenizer(/([aeiouy])/ig, function (m) {
        return {
            "type": "token",
            "vowel": true,
            "root": m[1].toLowerCase(),
            "text": m[1]
        }
    });

    var tokenize_rest = tokenizer(/([a-z ])/ig, function (m) {
        return {
            "root": m[1].toLowerCase(),
            "text": m[1],
            "whitespace": (m[1].match(/[ ]/)),
            "fullstop": !!(m[1].match(/[\.;]/))
        };
    });



    function debug_untokenize (tokens) {
        var ret = "";
        for (var t of tokens) {
            if (is_string(t)) {
                ret += t;
            } else {
                ret += "<u>" + t.text + "</u>";
            }
        }
        return ret;
    }



    function deprecated_untokenize (tokens) { // dxh 2021
        var ret = "";
        for (var t of tokens) {
            if (is_string(t)) {
                ret += t;
            } else {
                //ret += "("+t.text+")";
                if (false) {
                } else if (false && t.root == "ae") {
                    ret += "00";
                    //ret += (t.root == t.text ? html("&#483;") : html("&#482;"));
                } else if (t.vowel) {
                    if (t.mora == 2) {
                        ret += "<span class='long'>" + t.text + "</span>";
                    } else if (t.mora == 0) {
                        ret += "&rsquo;";
                        //ret += "<span class='silent'>"+t.text+"</span>";
                    } else if (t.mora == 1) {
                        ret += short[t.text] || t.text;
                    } else {
                        ret += t.text;
                    }
                    //ret += t.mora == 2 ? "<span class='long'>"+t.text+"</span>" : t.text;

                    if (false) {
                        ret += t.text.split('').map(function (v) {
                            return t.mora == 2 ? long[v] : t.mora == 1 ? short[v] : v;
                        }).join("");
                    }
                } else {
                    ret += t.text;
                }
            }
        }
        return ret;
    }



    function untokenize (tokens) {
        var ret = "";
        const include_labels = $("label_caesurae").is(":checked")
        //console.log(include_labels)
        for (var t of tokens) {
            if (is_string(t)) {
                ret += t;
            } else {
                if (t.vowel) {
                    if (t.mora == 2) {
                        if (t.text.length == 1) {
                            ret += t.text + "&#772;"
                        } else {
                            ret += t.text + "&#772;"
                        }

                        //ret += t.text + (t.text.length == 1 ? "&#772;")
                        //ret += "<span class='long'>"+t.text+"</span>";
                    } else if (t.mora == 0) {
                        //ret += t.text
                        //ret += "&#8255;"

                        ret += "&rsquo;";
                    } else if (t.mora == 1) {
                        ret += t.text + "&#774;"
                        //ret += short[t.text] || t.text;
                    } else {
                        ret += t.text;
                    }


                } else if (t["caesura_type"]) {
                    if (!true) {
                        let $span = $("<span/>", {"class": "caesura"})
                        $span.append(t["caesura_position"]).append(t["caesura_type"])
                        ret += $span[0].outerHTML
                    } else {
                        ret += " "
                    }
                } else {
                    ret += t.text;
                }
            }
        }
        return ret;
    }



    function make_domains (tokens) {
        for (var i in tokens) {
            var t = tokens[i]
            if (!is_string(t) && t.vowel) {
                tokens[i].mora = t.mora >= 0 ? [t.mora] : [1, 2];
            }
        }
        return tokens;
    }



    function hack_o (tokens) {
        for (var j = 0; j < tokens.length - 1; j++) {
            if (tokens[j].root == "o" && (!tokens[j + 1].root || tokens[j + 1].root.match(/[^a-z]/i))) {
                // confirm that it is not one of the exceptional words
                let exception = false
                for (let word of ["modo", "ego", "homo", "nemo"]) {
                    if (word == tokens.slice(j - word.length + 1, j + 1).map(x => x.root).join("")) {
                        exception = true
                        break
                    }
                }
                if (!exception) {
                    tokens[j].mora = 2;
                }

            }
            // if(tokens[j].root == "i" && (!tokens[j+1].root || tokens[j+1].root.match(/[^a-z]/i) ) ) {

            //     // confirm that it is not one of the exceptional words
            //     let exception = false
            //     for (let word of ["mihi", "tibi", "sibi"]) {
            // 	if (word == tokens.slice(j-word.length+1,j+1).map(x=>x.root).join("")) {
            // 	    exception = true
            // 	    break
            // 	}
            //     }

            //     if(!exception) {
            // 	tokens[j].mora = 2;
            //     }
            // }
        }
        return tokens;
    }



    function elide (tokens) {

        for (var j in tokens) {
            if (tokens[j].vowel) {
                var next = tokens.slice(j);
                next.shift();


                if (next.length > 0) {
                    if (next[0].whitespace) {
                        next = next.slice(1);
                    } else if (next.length > 1 &&
                        next[1].whitespace &&
                        next[0].root == "m") {
                        next = next.slice(2);
                    } else {
                        next = [];
                    }

                    if (next.length > 1) {
                        if (false && next[0].root == "e" &&
                            next[1].root == "s" &&
                            (next.length == 2 ||
                                next[2].whitespace ||
                                (next[2].root == "t" &&
                                    next.length == 3 || next[3].whitespace))
                        ) {
                            tokens[parseInt(j) + 2].mora = 0;
                            /*console.log(tokens[parseInt(j) + 2]);*/
                            continue;
                        }

                        var v = next[0].root == "h" ? next[1] : next[0];

                        if (v.vowel) {

                            // elide!!
                            // todo: elide secondary "est" as special case
                            tokens[j].mora = 0;
                        }
                        //		console.log(v.vowel,v.text, next.map(function(x){return x.text}));
                    }
                }

                if (next.length > 0 && next[0].whitespace) {


                }

                //if(tokens[i+1] && !is_string(tokens[i+1]) && tokens[i+1].whitespace) {
                //console.log(tokens.slice(i).map(function(x){return x.text}).join(''));
                //}
            } else {


            }
        }

        return tokens;
    }



    function long_by_position (tokens) {
        var ret = [];
        var two_consonants_after = function (j) {
            //console.log(tokens[j].text);
            var next = tokens.slice(j).slice(1).filter(function (x) {
                return x && !x.whitespace
            });

            next = next.filter(function (x) {
                return !x.whitespace && x.root != "h"
            });
            //console.log(next.map(function(x){return x}));

            if (next.length > 0 && !next[0].vowel && next[0].mora == 2) {
                return true;
            } else if (next.length > 1 && !next[0].vowel && !next[1].vowel
                && next[0].root != "i" && next[1].root != "i") {
                return true;
            }

        };



        for (var i in tokens) {
            var t = tokens[i];
            if (!is_string(t) && t.vowel && !t.mora) {
                if (two_consonants_after(i)) {
                    //	console.log("2after",tokens.slice(i).map(function(x){return x.text}));
                    tokens[i].mora = 2;
                }
            }
        }
        return tokens;
    }



    function zip () {
        var args = [].slice.call(arguments);
        var shortest = args.length == 0 ? [] : args.reduce(function (a, b) {
            return a.length < b.length ? a : b
        });

        return shortest.map(function (_, i) {
            return args.map(function (array) {
                return array[i]
            })
        });
    }



    function constrain_hexameter (tokens) {
        // Fill in unmarked long vowels under the assumption
        // that the meter is dactyllic hexameter.

        // Returns nothing. Destructively modifies the given list of tokens with length assignments.

        const is_spoken_vowel = (t => (t.vowel && t.mora != 0))
        const spoken_vowels = tokens.filter(is_spoken_vowel).reverse()

        if (spoken_vowels.length < 12 || spoken_vowels.length > 17) {
            return tokens; // not elligible for dactyllic hexameter
        }

        const num_syllables = spoken_vowels.length
        const num_dactyls = spoken_vowels.length - 12

        // assignment: 1 is short, 2 is long, null is doesn't matter
        let assignment_stack = [{
            "meter": [null, 2],
            "dactyls_remaining": num_dactyls
        }]

        while (assignment_stack.length > 0) {
            let assignment = assignment_stack.pop()

            let is_valid_assignment = true

            // number of assignments cannot exceed number of syllables.
            // this also prevents infinite loops
            if (assignment.meter.length > spoken_vowels.length) {
                is_valid_assignment = false
            }

            // cannot assign short syllables to long-by-nature vowels 
            for (let i = 0; i < spoken_vowels.length && i < assignment.meter.length; i++) {
                if (spoken_vowels[i].mora == 2 && assignment.meter[i] == 1) {
                    // long by nature conflicts with assignment
                    is_valid_assignment = false
                }
            }

            // initial syllable must be long
            if (assignment.meter.length == num_syllables && // assigned every syllable
                assignment.meter[num_syllables - 1] == 1 // initial syllable is assigned short
            ) {
                is_valid_assignment = false
            }

            /*console.log(is_valid_assignment, assignment.meter.join(" "))*/
            if (!is_valid_assignment) {
                continue
            }

            // ELSE, PARTIAL ASSIGNMENT IS VALID
            if (assignment.meter.length == num_syllables) {
                /*console.log("M", tokens.map(x => x.root).join(""), assignment.meter)
                console.log(assignment.meter.join(" "))
                console.log(spoken_vowels.map(x => [x.root, x.mora]))*/

                if (assignment.dactyls_remaining == 0) {
                    // ---- Assignment is complete. copy it over and return.
                    for (let i = 0; i < tokens.length; i++) {
                        if (is_spoken_vowel(tokens[i])) {
                            tokens[i].mora = assignment.meter.pop()
                        }
                    }
                    /*console.log(num_dactyls)
                    console.log(spoken_vowels.map(x => [x.root, x.mora]))*/
                    return tokens
                }
                // else {
                //     // complete assignment has wrong number of dactyls
                //     // for dactyllic hexameter. reject.
                //     continue
                // }
            } else {
                // ---- Assignment is incomplete. Extend it by adding a new foot (prefer dactyls).
                // ---- Note that feet are written in reverse because syllables are traversed in reverse.

                assignment_stack.push({
                    "dactyls_remaining": assignment.dactyls_remaining,
                    "meter": assignment.meter.concat([2, 2])
                })  // spondee

                assignment_stack.push({
                    "dactyls_remaining": assignment.dactyls_remaining - 1,
                    "meter": assignment.meter.concat([1, 1, 2])
                })  // dactyl

            }
        }
        return tokens
    }



    function constrain_hexameter_old (tokens) {
        // fill in unmarked long vowels under the assumption that
        // the meter is dactyllic hexameter.


        const is_spoken_vowel = (t => (t.vowel && t.mora != 0))

        var syllables = tokens
            .filter(is_spoken_vowel) // x is a vowel that is not elided
            .map(x => x.root);

        if (syllables.length < 12 || syllables.length > 17) {
            return tokens; // not eligible for dactyllic hexameter
        }

        //var dactyls = syllables.length - 12;

        // METER: lists the lengths of the syllables in *** reverse *** order.
        // i.e. starting with the last syllable, then the second to last syllable, etc.

        // 1 is short, 2 is long, null is doesn't matter

        var n = tokens.length - 1;
        var loop = function (stack) {
            if (stack.length == 0) {
                return null
            }

            // "stack" consists of csp objects
            // which are maps {dactyls : # of dactyls left to assign,
            //                 meter : shape of the current reversed foot e.g. [1,1,2] for dactyl }


            // reset tentative assignments
            for (var i in tokens) {
                if (is_spoken_vowel(tokens[i])) {
                    delete tokens[i].temp
                }
            }

            var csp = stack.pop()


            var meter_index = 0
            var failed = false

            if (csp.assigned_meter.length > tokens.filter(is_spoken_vowel).length) {
                failed = true
            }

            // apply partial meter assignment to tokens, traversing in reverse order
            for (var i = tokens.length - 1;
                 !failed && meter_index < csp.assigned_meter.length && i >= 0;
                 i--) {

                if (is_spoken_vowel(tokens[i])) {
                    var x = csp.assigned_meter[meter_index]
                    meter_index++
                    if (tokens[i].mora == 2 && x == 1) { //long-by-nature conflicts with assignment
                        failed = true;
                    }
                }
            }


            if (!failed) {
                if (csp.dactyls == 0) {
                    // finished searching; lengthen all remaining syllables and return.

                    var j = 0;

                    for (var i in tokens) {
                        if (is_spoken_vowel(tokens[n - i])) {
                            tokens[n - i].temp = j < csp.assigned_meter.length ? csp.assigned_meter[j] : 2;
                            j++;

                            tokens[n - i].mora = tokens[n - i].temp;
                        }
                    }
                    return tokens;
                } else {


                    // recurse on subtrees
                    // spondee subtree
                    stack.push({
                        "dactyls": csp.dactyls,
                        "assigned_meter": csp.assigned_meter.concat([2, 2])
                    });

                    // dactyl subtree
                    stack.push({
                        "dactyls": csp.dactyls - 1,
                        "assigned_meter": csp.assigned_meter.concat([1, 1, 2])
                    });

                }

            }

            loop(stack);
        };


        loop([{
            "dactyls": syllables.length - 12,
            "assigned_meter": [null, 2]
        }]);



        // var vowel_count = 0;
        // for(var i in tokens) {
        // 	if(tokens[n-i].vowel){vowel_count++;}
        // 	if(vowel_count == 2) {
        // 	    tokens[n-i].mora = 2;
        // 	}

        // }


        return tokens;
    }



    function constrain_hendecasyllables (tokens) {
        // fill in unmarked long vowels under the assumption that
        // the meter is hendecasyllabic

        var syllables = tokens.filter(function (x) {
            return x.vowel && x.mora != 0
        }).map(function (x) {
            return x.root
        });
        //  console.log(syllables.join(' '), syllables.length);


        //var dactyls = syllables.length - 12;

        // METER: lists the lengths of the syllables in *** reverse *** order.
        // i.e. starting with the last syllable, then the second to last syllable, etc.

        // 1 is short, 2 is long, null is doesn't matter


        var meter = [2, 2, 1, 2, 1, 2, 1, 1, 2, null, null];

        var n = tokens.length - 1;
        var scannable = function (t) {
            return t.vowel && t.mora != 0;
        };


        var j = 0;

        for (var i in tokens) {
            if (scannable(tokens[n - i])) {
                tokens[n - i].temp = j < meter.length ? meter[j] : null;
                j++;

                tokens[n - i].mora = tokens[n - i].temp || tokens[n - i].mora;

            }
        }



        // var vowel_count = 0;
        // for(var i in tokens) {
        // 	if(tokens[n-i].vowel){vowel_count++;}
        // 	if(vowel_count == 2) {
        // 	    tokens[n-i].mora = 2;
        // 	}

        // }


        return tokens;
    }



    function eq (a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }



    function identify_caesurae (tokens) {
        // Given a single tokenized line of poetry, identify the type of caesura.
        // A caesura is a word-break; it is identified by the type of poetic foot it interrupts.

        // Exultent terre, letatur et insula queque

        let foot = [] // list of morae, 1 (short) or 2 (long) in foot so far.
        let num_feet = 0

        /*console.log(tokens)*/
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i]

            if (token["mora"] && token["vowel"]) {

                if (eq(foot, [2, 1, 1]) || eq(foot, [2, 2])) {
                    foot = [] // end of one foot and start of next
                    num_feet += 1
                }
                foot.push(token["mora"])
                // console.log("m", num_feet, token["root"], foot)
            }

            if (token["root"] == " ") {
                // caesura.
                token["caesura_position"] = num_feet + 1
                if (eq(foot, [2])) {
                    token["caesura_type"] = "m"
                } else if (eq(foot, [2, 1])) {
                    token["caesura_type"] = "f"
                } else if (eq(foot, [2, 1, 1]) || eq(foot, [2, 2])) {
                    token["caesura_type"] = "d"

                }
                //console.log("c", foot, token["caesura_position"], token["caesura_type"], token)
            }
        }

        // The final caesura apparently doesn't count?

        // for(let i=tokens.length-1; i>=0; i--) {
        //     let token = tokens[i]
        //     if(token["caesura_position"] ) {
        // 	token["caesura_position"] = null
        // 	token["caesura_type"] = null
        // 	break
        //     }
        // }


        return tokens
    }



    function scan_new () {

        $op.html("");
        if ($ip.html().length < 1) {
            return;
        }
        var lines = $ip.html().split(/<\/?br\/?>\n?/ig);
        while (!lines[0]) {
            lines.shift();
        }
        while (!lines[lines.length - 1]) {
            lines.pop()
        }


        const $table = $("<table/>", {"class": "array"}).appendTo($op)

        for (var text of lines) {
            text = text.replace(/ +/g, " ");


            // console.log("T", text.split("").map(function(x,i){return [x, x.charCodeAt(0)]}))

            var tokens = text.split("").map(
                function (s) {
                    return diacritic[s.charCodeAt(0)] || ""
                }).filter(function (s) {
                return s != ""
            })



            let foot = [] // list of morae, 1 (short) or 2 (long) in foot so far.
            let num_feet = 0
            let caesura_list = []
            /*console.log(tokens)*/

            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i]

                if (token == "long" || token == "short") {

                    if (eq(foot, [2, 1, 1]) || eq(foot, [2, 2])) {
                        foot = [] // end of one foot and start of next
                        num_feet += 1
                    }
                    foot.push({"short": 1, "long": 2}[token])
                }

                if (token == "pipe") {
                    // caesura.
                    let caesura = {}
                    caesura["position"] = num_feet + 1
                    if (eq(foot, [2])) {
                        caesura["type"] = "m"
                    } else if (eq(foot, [2, 1])) {
                        caesura["type"] = "f"
                    } else if (eq(foot, [2, 1, 1]) || eq(foot, [2, 2])) {
                        caesura["type"] = "d"
                    }

                    caesura_list.push(caesura)
                    /*console.log(caesura_list)*/
                }
            }

            /*console.log(text)*/

            const $tr = $("<tr/>").appendTo($table)
            $("<td/>").appendTo($tr).append($("<span/>").append(text).text())

            var $annotation = $("<td/>", {"class": "caesurae"}).appendTo($tr)
            $annotation.append(caesura_list.map(function (c) {
                return c["position"] + c["type"]
            }).join(" "))

            $op.append("<br/>")



            // 	var tokens = [text];

            // 	// I/J tokenization must come first because it depends on other vowels/dipthongs and consonants.

            // 	tokens = tokenize_j(tokens); // I->J when initial before vowel, or when between two vowels
            // 	//tokens = tokenize_i_vowel(tokens); // I when terminal, when before consonant, or when only vowel in word

            // 	tokens = tokenize_digraphs(tokens);
            // 	tokens = tokenize_dipthongs(tokens); // DIPTHONGS
            // 	tokens = tokenize_doubles(tokens); // X, Z
            // 	tokens = tokenize_liquids(tokens); // MUTED + LIQUID count as one consonant


            // 	tokens = tokenize_vowels(tokens); // 
            // 	tokens = tokenize_rest(tokens);

            // 	tokens = tokens.filter(function(x){return x});

            // 	// HACK: TERMINAL O USUALLY LONG
            // 	tokens = hack_o(tokens);

            // 	// ELISION / LENGTH BY POSITION
            // 	tokens = elide(tokens);
            // 	tokens = long_by_position(tokens);

            // 	tokens = constrain_hexameter(tokens);

            // 	// CAESURA ANNOTATION
            // 	tokens = identify_caesurae(tokens) // Tony's feature

            // //	tokens = constrain_hendecasyllables(tokens);


            // 	$op.append(untokenize(tokens)+"<br/>");
        }



        return;
    }



    function scan (text) {


        text = text.replace(/ +/g, " ");

        var tokens = [text];

        // I/J tokenization must come first because it depends on other vowels/dipthongs and consonants.

        tokens = tokenize_j(tokens); // I->J when initial before vowel, or when between two vowels
        //tokens = tokenize_i_vowel(tokens); // I when terminal, when before consonant, or when only vowel in word

        tokens = tokenize_digraphs(tokens);
        tokens = tokenize_dipthongs(tokens); // DIPTHONGS
        tokens = tokenize_doubles(tokens); // X, Z
        tokens = tokenize_liquids(tokens); // MUTED + LIQUID count as one consonant


        tokens = tokenize_vowels(tokens); // 
        tokens = tokenize_rest(tokens);

        tokens = tokens.filter(function (x) {
            return x
        });

        // HACK: TERMINAL O USUALLY LONG
        tokens = hack_o(tokens);

        // ELISION / LENGTH BY POSITION
        tokens = elide(tokens);
        tokens = long_by_position(tokens);

        tokens = constrain_hexameter(tokens);

        // CAESURA ANNOTATION
        tokens = identify_caesurae(tokens) // Tony's feature
        //	tokens = constrain_hendecasyllables(tokens);

        return untokenize(tokens);



        return;
        //$op.html($ip.html()+short["a"]);
    }



    return scan(input);


}
module.exports = Scansion;