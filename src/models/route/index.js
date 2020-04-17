import {createEffect, createEvent} from "effector";

export const getPathFx = createEffect();
export const createRouteEvent = createEvent();
export const removeRouteEvent = createEvent();

export const removeRouteMarkersFx = createEffect();
export const filledRoute = createEvent();
