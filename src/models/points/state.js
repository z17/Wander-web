import {createStore} from "effector";


export const $points = createStore({
    selected: null,
    start: null,
    end: null,
    round: null
});

export const $routePositionsReady = $points.map(({start, end, round}) => {
    return start !== null && end !== null || round !== null
});
