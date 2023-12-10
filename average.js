import converter from './converter.js';
import {getMode} from './modes.js';

const averageAngle = e => {
    let r = e.reduce(((e, r) => {
        if (void 0 !== r) {
            let a = r * Math.PI / 180;
            e.sin += Math.sin(a), e.cos += Math.cos(a)
        }
        return e
    }), {sin: 0, cos: 0}), a = 180 * Math.atan2(r.sin, r.cos) / Math.PI;
    return a < 0 ? 360 + a : a
}, averageNumber = e => {
    let r = e.filter((e => void 0 !== e));
    return r.length ? r.reduce(((e, r) => e + r), 0) / r.length : void 0
}, isfn = e => "function" == typeof e;

function average(e, r = "rgb", a) {
    let t = getMode(r), n = e.map(converter(r));
    return t.channels.reduce(((e, r) => {
        let i = n.map((e => e[r])).filter((e => void 0 !== e));
        if (i.length) {
            let n;
            n = isfn(a) ? a : a && isfn(a[r]) ? a[r] : t.average && isfn(t.average[r]) ? t.average[r] : averageNumber, e[r] = n(i, r)
        }
        return e
    }), {mode: r})
}

export {average, averageAngle, averageNumber};
