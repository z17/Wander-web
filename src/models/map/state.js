import {createStore} from "effector";
import {default_lat, default_lon, default_zoom} from "./index";

export const $map = createStore({
    map: null,
});

export const $mapSettings = createStore({
    lat: default_lat,
    lon: default_lon,
    zoom: default_zoom,
});