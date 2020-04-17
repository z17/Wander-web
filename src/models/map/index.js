import {createEffect, createEvent} from "effector";

export const setStartPointEvent = createEvent();
export const setEndPointEvent = createEvent();
export const setRoundPointEvent = createEvent();

export const setStartMarkerEvent = createEvent();
export const setEndMarkerEvent = createEvent();
export const setRoundMarkerEvent = createEvent();

export const mapBoundsUpdatedEvent = createEvent();
export const getRandomPointsFx = createEffect();
export const drawLineFx = createEffect();

export const mapInitPosition = createEvent();

export const createMapFx = createEffect();
export const createObjectMarkersFx = createEffect();
export const createRouteObjectMarkersFx = createEffect();
export const removeRouteFromMapFx = createEffect();

export const selectPositionEvent = createEvent();
export const mapPositionUpdatedEvent = createEvent();

export const MapGate = createGate();

export const default_lat = 59.9402;
export const default_lon = 30.3154;
export const default_zoom = 12;

export const mapbox_access_key = 'pk.eyJ1Ijoiei0xNyIsImEiOiJjazZ1c3dkM2gwY2RkM2VueHh5bTdubTV6In0.3l6vnKrR964Fme8IPQ_eQA';
