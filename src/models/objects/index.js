import {createEffect, createEvent} from "effector";
import {apiParseObject} from '../app';

export const updateRandomObjectsEvent = createEvent();

export const removeObjectsFx = createEffect();
export const addObjects = createEffect();

export const objectsParse = createEvent();
export const objectsParsed = objectsParse.map((objects) => objects.map(apiParseObject));
