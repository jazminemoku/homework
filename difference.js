import {getMode} from './modes.js';
import converter from './converter.js';
import normalizeHue from './util/normalizeHue.js';

const differenceHueSaturation = (e, t) => {
    if (void 0 === e.h || void 0 === t.h || !e.s || !t.s) return 0;
    let r = normalizeHue(e.h), a = normalizeHue(t.h), n = Math.sin((a - r + 360) / 2 * Math.PI / 180);
    return 2 * Math.sqrt(e.s * t.s) * n
}, differenceHueNaive = (e, t) => {
    if (void 0 === e.h || void 0 === t.h) return 0;
    let r = normalizeHue(e.h), a = normalizeHue(t.h);
    return Math.abs(a - r) > 180 ? r - (a - 360 * Math.sign(a - r)) : a - r
}, differenceHueChroma = (e, t) => {
    if (void 0 === e.h || void 0 === t.h || !e.c || !t.c) return 0;
    let r = normalizeHue(e.h), a = normalizeHue(t.h), n = Math.sin((a - r + 360) / 2 * Math.PI / 180);
    return 2 * Math.sqrt(e.c * t.c) * n
}, differenceEuclidean = (e = "rgb", t = [1, 1, 1, 0]) => {
    let r = getMode(e), a = r.channels, n = r.difference, h = converter(e);
    return (e, r) => {
        let i = h(e), o = h(r);
        return Math.sqrt(a.reduce(((e, r, a) => {
            let h = n[r] ? n[r](i, o) : i[r] - o[r];
            return e + (t[a] || 0) * Math.pow(isNaN(h) ? 0 : h, 2)
        }), 0))
    }
}, differenceCie76 = () => differenceEuclidean("lab65"), differenceCie94 = (e = 1, t = .045, r = .015) => {
    let a = converter("lab65");
    return (n, h) => {
        let i = a(n), o = a(h), u = i.l, l = i.a, M = i.b, c = Math.sqrt(l * l + M * M), f = o.l, d = o.a, s = o.b,
            v = Math.sqrt(d * d + s * s), H = Math.pow(u - f, 2), p = Math.pow(c - v, 2),
            w = Math.pow(l - d, 2) + Math.pow(M - s, 2) - p;
        return Math.sqrt(H / Math.pow(e, 2) + p / Math.pow(1 + t * c, 2) + w / Math.pow(1 + r * c, 2))
    }
};

/*
	CIEDE2000 color difference, original Matlab implementation by Gaurav Sharma
	Based on "The CIEDE2000 Color-Difference Formula: Implementation Notes, Supplementary Test Data, and Mathematical Observations" 
	by Gaurav Sharma, Wencheng Wu, Edul N. Dalal in Color Research and Application, vol. 30. No. 1, pp. 21-30, February 2005.
	http://www2.ece.rochester.edu/~gsharma/ciede2000/
 */

const differenceCiede2000 = (t = 1, a = 1, h = 1) => {
    let M = converter("lab65");
    return (s, o) => {
        let e = M(s), r = M(o), I = e.l, P = e.a, p = e.b, w = Math.sqrt(P * P + p * p), l = r.l, n = r.a, q = r.b,
            b = (w + Math.sqrt(n * n + q * q)) / 2,
            c = .5 * (1 - Math.sqrt(Math.pow(b, 7) / (Math.pow(b, 7) + Math.pow(25, 7)))), i = P * (1 + c),
            d = n * (1 + c), f = Math.sqrt(i * i + p * p), u = Math.sqrt(d * d + q * q),
            v = Math.abs(i) + Math.abs(p) === 0 ? 0 : Math.atan2(p, i);
        v += 2 * (v < 0) * Math.PI;
        let x = Math.abs(d) + Math.abs(q) === 0 ? 0 : Math.atan2(q, d);
        x += 2 * (x < 0) * Math.PI;
        let C = l - I, g = u - f, j = f * u == 0 ? 0 : x - v;
        j -= 2 * (j > Math.PI) * Math.PI, j += 2 * (j < -Math.PI) * Math.PI;
        let k, m = 2 * Math.sqrt(f * u) * Math.sin(j / 2), y = (I + l) / 2, z = (f + u) / 2;
        f * u == 0 ? k = v + x : (k = (v + x) / 2, k -= (Math.abs(v - x) > Math.PI) * Math.PI, k += 2 * (k < 0) * Math.PI);
        let A = Math.pow(y - 50, 2),
            B = 1 - .17 * Math.cos(k - Math.PI / 6) + .24 * Math.cos(2 * k) + .32 * Math.cos(3 * k + Math.PI / 30) - .2 * Math.cos(4 * k - 63 * Math.PI / 180),
            D = 1 + .015 * A / Math.sqrt(20 + A), E = 1 + .045 * z, F = 1 + .015 * z * B,
            G = 30 * Math.PI / 180 * Math.exp(-1 * Math.pow((180 / Math.PI * k - 275) / 25, 2)),
            H = 2 * Math.sqrt(Math.pow(z, 7) / (Math.pow(z, 7) + Math.pow(25, 7))), J = -1 * Math.sin(2 * G) * H;
        return Math.sqrt(Math.pow(C / (t * D), 2) + Math.pow(g / (a * E), 2) + Math.pow(m / (h * F), 2) + J * g / (a * E) * m / (h * F))
    }
};

/*
	CMC (l:c) difference formula

	References:
		https://en.wikipedia.org/wiki/Color_difference#CMC_l:c_(1984)
		http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
 */
const differenceCmc = (l = 1, c = 1) => {
    let lab = converter('lab65');

    /*
        Comparte two colors:
        std - standard (first) color
        smp - sample (second) color
     */
    return (std, smp) => {
        // convert standard color to Lab
        let LabStd = lab(std);
        let lStd = LabStd.l;
        let aStd = LabStd.a;
        let bStd = LabStd.b;

        // Obtain hue/chroma
        let cStd = Math.sqrt(aStd * aStd + bStd * bStd);
        let hStd = Math.atan2(bStd, aStd);
        hStd = hStd + 2 * Math.PI * (hStd < 0);

        // convert sample color to Lab, obtain LCh
        let LabSmp = lab(smp);
        let lSmp = LabSmp.l;
        let aSmp = LabSmp.a;
        let bSmp = LabSmp.b;

        // Obtain chroma
        let cSmp = Math.sqrt(aSmp * aSmp + bSmp * bSmp);

        // lightness delta squared
        let dL2 = Math.pow(lStd - lSmp, 2);

        // chroma delta squared
        let dC2 = Math.pow(cStd - cSmp, 2);

        // hue delta squared
        let dH2 = Math.pow(aStd - aSmp, 2) + Math.pow(bStd - bSmp, 2) - dC2;

        let F = Math.sqrt(Math.pow(cStd, 4) / (Math.pow(cStd, 4) + 1900));
        let T =
            hStd >= (164 / 180) * Math.PI && hStd <= (345 / 180) * Math.PI
                ? 0.56 + Math.abs(0.2 * Math.cos(hStd + (168 / 180) * Math.PI))
                : 0.36 + Math.abs(0.4 * Math.cos(hStd + (35 / 180) * Math.PI));

        let Sl = lStd < 16 ? 0.511 : (0.040975 * lStd) / (1 + 0.01765 * lStd);
        let Sc = (0.0638 * cStd) / (1 + 0.0131 * cStd) + 0.638;
        let Sh = Sc * (F * T + 1 - F);

        return Math.sqrt(
            dL2 / Math.pow(l * Sl, 2) +
            dC2 / Math.pow(c * Sc, 2) +
            dH2 / Math.pow(Sh, 2)
        );
    };
};

/*

	HyAB color difference formula, introduced in:

		Abasi S, Amani Tehran M, Fairchild MD. 
		"Distance metrics for very large color differences."
		Color Res Appl. 2019; 1–16. 
		https://doi.org/10.1002/col.22451

	PDF available at:
	
		http://markfairchild.org/PDFs/PAP40.pdf
 */
const differenceHyab = () => {
    let e = converter("lab65");
    return (t, r) => {
        let a = e(t), b = e(r), l = a.l - b.l, n = a.a - b.a, c = a.b - b.b;
        return Math.abs(l) + Math.sqrt(n * n + c * c)
    }
};

/*
	"Measuring perceived color difference using YIQ NTSC
	transmission color space in mobile applications"
		
		by Yuriy Kotsarenko, Fernando Ramos in:
		Programación Matemática y Software (2010) 

	Available at:
		
		http://www.progmat.uaem.mx:8080/artVol2Num2/Articulo3Vol2Num2.pdf
 */
const differenceKotsarenkoRamos = () =>
    differenceEuclidean('yiq', [0.5053, 0.299, 0.1957]);

export {
    differenceHueChroma,
    differenceHueSaturation,
    differenceHueNaive,
    differenceEuclidean,
    differenceCie76,
    differenceCie94,
    differenceCiede2000,
    differenceCmc,
    differenceHyab,
    differenceKotsarenkoRamos
};
