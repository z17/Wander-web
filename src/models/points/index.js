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
