import {differenceEuclidean} from './difference.js';

/*
	This works linearly right now, but we might get better performance
	with a V-P Tree (Vantage Point Tree). 

	Reference:
	* http://pnylab.com/papers/vptree/main.html
 */

const nearest = (e, t = differenceEuclidean(), r = (e => e)) => {
    let a = e.map(((e, t) => ({color: r(e), i: t})));
    return (r, i = 1, n = 1 / 0) => (isFinite(i) && (i = Math.max(1, Math.min(i, a.length - 1))), a.forEach((e => {
        e.d = t(r, e.color)
    })), a.sort(((e, t) => e.d - t.d)).slice(0, i).filter((e => e.d < n)).map((t => e[t.i])))
};
export default nearest;
