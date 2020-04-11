import {createStore} from "effector";

export const $route = createStore({
    route: null,
    route_markers: [],
});

export const $noRoute = $route.map(({route}) => {
    return route === null
});