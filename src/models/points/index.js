import {createEffect, createEvent, attach} from "effector";

export const pathPositionsReady = createEvent();
export const resolvePathType = createEvent();
export const createMarkFx = createEffect();

export const createdPointMark = attach({
  effect: createMarkFx,
  mapParams: (params) => ({className: 'App-map_marker_point', ...params})
});
