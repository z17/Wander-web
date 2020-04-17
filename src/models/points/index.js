import {createEffect, createEvent} from "effector";

export const createStartPointFx = createEffect();
export const createEndPointFx = createEffect();
export const createRoundPointFx = createEffect();
export const pathPositionsReady = createEvent();
export const resolvePathType = createEvent();
export const pointsParse = createEvent();
export const pointsParsed = parsePoints.map((points) =>
  point.map(({lat, lon}) => ({
    lat,
    lon
  })
);
export const createMarkFx = createEffect();

export const createdStartMark = attach({
  effect: createMarkFx,
  mapParams: (params) => ({className: 'App-map_marker_start', ...params})
});

export const createdEndMark = attach({
  effect: createMarkFx,
  mapParams: (params) => ({className: 'App-map_marker_end', ...params})
});

export const createdRoundMark = attach({
  effect: createMarkFx,
  mapParams: (params) => ({className: 'App-map_marker_round', ...params})
});

export const createdPointMark = attach({
  effect: createMarkFx,
  mapParams: (params) => ({className: 'App-map_marker_point', ...params})
});
