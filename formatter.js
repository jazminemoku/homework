import converter from './converter.js';
import round from './round.js';
import prepare from './_prepare.js';
import {getMode} from './modes.js';

let twoDecimals = round(2);
const clamp = e => Math.max(0, Math.min(1, e)), fixup = e => Math.round(255 * clamp(e));
export const serializeHex = e => {
    if (void 0 === e) return;
    return "#" + (1 << 24 | fixup(e.r) << 16 | fixup(e.g) << 8 | fixup(e.b)).toString(16).slice(1)
};
export const serializeHex8 = e => {
    if (void 0 === e) return;
    let r = fixup(void 0 !== e.alpha ? e.alpha : 1);
    return serializeHex(e) + (256 | r).toString(16).slice(1)
};
export const serializeRgb = e => {
    if (void 0 === e) return;
    let r = void 0 !== e.r ? fixup(e.r) : "none", o = void 0 !== e.g ? fixup(e.g) : "none",
        i = void 0 !== e.b ? fixup(e.b) : "none";
    return void 0 === e.alpha || 1 === e.alpha ? `rgb(${r}, ${o}, ${i})` : `rgba(${r}, ${o}, ${i}, ${twoDecimals(clamp(e.alpha))})`
};
export const serializeHsl = e => {
    if (void 0 === e) return;
    const r = twoDecimals(e.h || 0), o = void 0 !== e.s ? twoDecimals(100 * clamp(e.s)) + "%" : "none",
        i = void 0 !== e.l ? twoDecimals(100 * clamp(e.l)) + "%" : "none";
    return void 0 === e.alpha || 1 === e.alpha ? `hsl(${r}, ${o}, ${i})` : `hsla(${r}, ${o}, ${i}, ${twoDecimals(clamp(e.alpha))})`
};
export const formatCss = e => {
    const r = prepare(e);
    if (!r) return;
    const o = getMode(r.mode);
    if (!o.serialize || "string" == typeof o.serialize) {
        let e = `color(${o.serialize || `--${r.mode}`} `;
        return o.channels.forEach(((o, i) => {
            "alpha" !== o && (e += (i ? " " : "") + (void 0 !== r[o] ? r[o] : "none"))
        })), void 0 !== r.alpha && r.alpha < 1 && (e += ` / ${r.alpha}`), e + ")"
    }
    return "function" == typeof o.serialize ? o.serialize(r) : void 0
};
export const formatHex = e => serializeHex(converter("rgb")(e));
export const formatHex8 = e => serializeHex8(converter("rgb")(e));
export const formatRgb = e => serializeRgb(converter("rgb")(e));
export const formatHsl = e => serializeHsl(converter("hsl")(e));
