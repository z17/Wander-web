import {createEffect, createEvent} from "effector";

export const getDirectPathFx = createEffect();
export const createRouteEvent = createEvent('updateRandomPoints');
export const removeRouteEvent = createEvent('updateRandomPoints');

export const removeRouteMarkersFx = createEffect();
export const filledRoute = createEvent();