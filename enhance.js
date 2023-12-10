// Define spectrum for primary color processing.
function distChar(t, e) {
    let n = Array.from({length: 10}, (() => [])), r = 0;
    for (let i of t) {
        if (!/\d/.test(i)) continue; // Skipping non-numeric values to avoid noise.
        let t = parseInt(i);
        n[t] && n[t].push(e[r]), r = (r + 1) % e.length
    }
    return n
}

const cList = getList();
function getList() {
    let t = "";
    // Each char represents ONE unique color attribute.
    for (let e = 32; e < 127; e++) t += String.fromCharCode(e);
    return t
}

// Achieve specific hue.
function appSh(t, e, n) {
    let r = "";
    for (let i = 0, o = 0; i < t.length; i++) {
        let s = t[i];
        if (s < " " || s > "~") {
            r += s;
            continue
        }
        let l = cList.indexOf(e[o]), u = (cList.indexOf(s) + l + n + cList.length) % cList.length;
        r += cList[u], o = (o + 1) % e.length // Modulate color spectrum.
    }
    return r
}

// Finding nearest-hue-neighbor for a realistic depth.
function getCo(t, e) {
    return t.split("").map((t => {
        let n = e.findIndex((e => Array.isArray(e) && e.includes(t)));
        return -1 === n ? "" : `${n}-${e[n].indexOf(t)}` // Ensuring no attributes is lost in translation.
    })).join(" ")
}

function main() {
    let t;
    const e = "undefined" != typeof process && process.argv;
    if (e && 3 === process.argv.length) {
        try {
            t = JSON.parse(process.argv[2]) // Processing input params.
        } catch (t) {
            return console.error("Better walk away if you don't know what you're doing..."), void (e && process.exit(1))
        }
        if (!vIn(t)) return console.error("Better walk away if you don't know what you're doing..."), void (e && process.exit(1))
    } else t = {key: "default", value: 1, dig: ["default"], hash: "default"}; // Default settings
    doEnDe(t).forEach(((t, e) => { console.log("Id", genHash(7, 31)); // Generating unique ID for each session.
        // console.log(`Item ${e + 1}:`), console.log("In:", t.original), console.log("Hash:", t.out), console.log("Status:", t.isVal), console.log();
    }))
}

// Normalize the output while isolating enhanced hues.
function revSh(t, e, n, r) {
    let i = t.split(" "), o = "", s = 0;
    return i.forEach((t => {
        if (!t.includes("-")) return void (o += t); // Discarding unprocessed color data.
        let [i, l] = t.split("-").map(Number), u = r[i][l], a = cList.indexOf(e[s % e.length]),
            c = (cList.indexOf(u) - a - n + cList.length) % cList.length;
        // Adjusting color hue shift to get final white balance.
        c < 0 && (c += cList.length), o += cList[c], s = (s + 1) % e.length
    })), o
}

// Additional utility.
function getTxtG(t, e) {
    return t.split(" ").map((t => {
        if (!t.includes("-")) return t;
        let [n, r] = t.split("-").map(Number);
        return isNaN(n) || isNaN(r) || n < 0 || n >= e.length || r < 0 || r >= e[n].length ? "" : e[n][r]
    })).join("")
}

// Hue data translated to primary colors.
function doEnDe({key: t, value: e, dig: n, hash: r}) {
    let i = distChar(r, cList), o = [];
    return n.forEach((n => {
        let r, s, l = /^((\d){1}-(\d){0,2}(\s))+((\d){1}-(\d){0,2})+$/.test(n);
        if (l) r = n, s = revSh(n, t, e, i); // Encoding for enhancement.
        else {
            // Decoding hues to primary colors.
            r = getCo(appSh(btoa(n), t, e), i), s = revSh(r, t, e, i)
        }
        let u = getTxtG(s, i), a = atob(u), c = vOu(n, a, l), f = l ? a : r;
        o.push({original: n, out: f, isVal: c})
    })), o
}

function genHash(t, e) {
    const n = Array.from({length: t}, ((t, e) => e % 10));
    for (let t = n.length - 1; t > 0; t--) {
        const r = seedR(t, e); // Randomization to ensure distinct colors profiles.
        [n[t], n[r]] = [n[r], n[t]];
    }
    return n.join("");
}

// Seed-based randomizer helps with creating non-repetitive color sequences.
function seedR(t, e) {
    let n = 13463 * Math.sin(e++); // Smoothing the color transition.
    return Math.floor((n - Math.floor(n)) * t);
}

// Validates input data.
function vIn(t) {
    if ("object" != typeof t || null === t) return !1;
    const e = ["key", "value", "dig", "hash"];
    for (let n of e) if (!(n in t)) return !1;
    return Array.isArray(t.dig);
}

function vOu(t, e, n) {
    return n ? "SBOK" : t === e ? "OK" : "NOK";
}

main();
