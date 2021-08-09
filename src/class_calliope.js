let Scansion = require('./scansion')

/**
 * (C) 2021 Benedikt Blumenfelder (www.hermeneus.eu)
 * The underlying scansion-method (scansion.js) was written by Dylan Holmes
 * (http://www.logical.ai/arma/) under the GNU GPL 3.0+-licence.
 * This code is licensed under the same conditions, which means
 * that you are free to use, modify, and re-distribute this
 * work — even commercially — as long as you attribute the
 * original to me and share your modified versions
 * in the same way.
 */
export default class Calliope {
    constructor (text) {
        this.text = text;
        this.text_original = text;
        this.text_scanned = null;
        this.text_macronized = null;
        this.text_scanned_unescaped = null;
        this.scansion_aligned = null;
        this.scansion_strict = null;
    }


    /**
     * This is the analysis-pipeline
     * @returns {{original, scanned: string, working_line: string, scansion: string, scansion_strict: string}}
     */
    analyze () {
        const text_scanned = this.scan(this.text)
        const text_macronized = this.macronize(text_scanned);
        const text_working_line = this.getWorkingLine(text_scanned);
        const text_scanned_transcribed = this.transcribe(text_scanned);
        const text_scanned_unescaped = this.unescape(text_scanned)
        const scansion_aligned = this.getScansion(text_scanned_transcribed)
        const scansion_strict = this.getScansionStrict(scansion_aligned)

        return {
            "scanned": text_scanned_unescaped,
            "macronized": text_macronized,
            "scansion": scansion_aligned,
            "original": this.text_original,
            "working_line": text_working_line,
            "scansion_strict": scansion_strict
        }
    }



    /**
     * Replace all HTML-Breves and Macrons (&#772; &#774) with = and *
     * for better string transformation.
     * @param text_scanned_escaped
     * @returns {string}
     */
    transcribe (text_scanned_escaped) {
        return text_scanned_escaped.replaceAll("&#772;", "=").replaceAll("&#774;", "*")
    }


    /**
     * Only maintain macrons to get a macronized version of the text-string
     * @param text_scanned_escaped
     * @returns {string}
     */
    macronize (text_scanned_escaped) {
        let text_macronized = this.unescape(text_scanned_escaped.replaceAll("&#774;", ""));
        this.text_macronized = text_macronized;
        return text_macronized;
    }


    /**
     * Transform HTML-encoded string to UTF-8-String
     * &#772; => ¯
     * &#774; => ˘
     * @param text_scanned
     * @returns {string}
     */
    unescape (text_scanned) {
        const txt = document.createElement("textarea");
        txt.innerHTML = text_scanned;
        this.text_scanned_unescaped = txt.value;
        return txt.value;
    }


    /**
     * Returns unscanned version of the string with elisions and substitutions of half-vowels (i => j)
     * @param text_scanned
     * @returns {string}
     */
    getWorkingLine (text_scanned) {
        return text_scanned.replaceAll("&#772;", "").replaceAll("&#774;", "");
    }


    /**
     * Get an utf-8 string with proper breves and macrons from the transcribed string.
     * Remove empty strings/spaces, that remained from letters with metric notations, so
     * the scansion is perfectly aligned with the original text again.
     * @param text_scanned_transcribed
     * @returns {string}
     */
    getScansion (text_scanned_transcribed) {
        const Meter = text_scanned_transcribed.split('').map(letter => {
            if (letter === "=") {
                return "¯"
            } else if (letter === "*") {
                return "˘"
            } else {
                return ' '
            }
        }).join("") + "x";

        return Meter.split("").map((letter, index) => {
            let nextletter = Meter.split("")[index + 1]
            if (letter === " " && (nextletter === "¯" || nextletter === "˘" || nextletter === "x")) {
                return null;
            }
            return letter;
        }).filter(letter => letter).join("")

    }


    /**
     * Get Scansion without spaces
     * @param scansion_aligned
     * @returns {string}
     */
    getScansionStrict (scansion_aligned) {
        return scansion_aligned.replaceAll(' ', '');
    }


    /**
     * Returns a scanned version of the text with breves and macrons
     * @returns {*}
     */
    scan (text_input) {

        const text_scanned = Scansion(text_input)
        this.text_scanned = text_scanned;
        return text_scanned;
    }


    /**
     * :DEPRECATED:
     * @param text_scanned_unescaped
     * @returns {Promise<void>}
     */
    async normalizeText (text_scanned_unescaped) {

        const replaceLetter = (search, replace, text_scanned_unescaped) => {
            return new Promise(async (resolve, reject) => {
                resolve(text_scanned_unescaped.replace(search, replace));
            });
        }



        const substitutionLookupTable = {
            "aē": "ae",
            "oē": "oe",
            "ă": "a",
            "ĕ": "e",
            "ĭ": "i",
            "ŏ": "o",
            "ŭ": "u",
        }



        for await (let key of Object.entries(substitutionLookupTable)) {
            let search = key;
            let replace = substitutionLookupTable[search];
            text_scanned_unescaped = await replaceLetter(search, replace, text_scanned_unescaped)
        }



    }

}

