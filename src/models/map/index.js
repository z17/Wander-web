import {createEffect, createEvent} from "effector";

export const setStartPointEvent = createEvent('setStartPoint');
export const setEndPointEvent = createEvent('setEndPoint');
export const setRoundPointEvent = createEvent('setRoundPoint');

export const setStartMarkerEvent = createEvent('setStartMarker');
export const setEndMarkerEvent = createEvent('setEndMarker');
export const setRoundMarkerEvent = createEvent('setRoundMarker');

export const mapBoundsUpdatedEvent = createEvent('mapBoundsUpdated');
export const getRandomPointsFx = createEffect();
export const drawLineFx = createEffect();

export const mapInitPosition = createEvent();

export const createMapFx = createEffect();
export const createObjectMarkersFx = createEffect();
export const createRouteObjectMarkersFx = createEffect();
export const removeRouteFromMapFx = createEffect();

export const selectPositionEvent = createEvent('selectPosition');
export const mapPositionUpdatedEvent = createEvent('mapPositionUpdated');

export const default_lat = 59.9402;
export const default_lon = 30.3154;
export const default_zoom = 12;

export const mapbox_access_key = 'pk.eyJ1Ijoiei0xNyIsImEiOiJjazZ1c3dkM2gwY2RkM2VueHh5bTdubTV6In0.3l6vnKrR964Fme8IPQ_eQA';
