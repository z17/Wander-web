import {createEffect, createEvent} from "effector";

export const updateRandomPointsEvent = createEvent('updateRandomPoints');

export const removeObjectsFx = createEffect();
export const addObjects = createEffect();