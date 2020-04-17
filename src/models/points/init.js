import {createStartPointFx, createEndPointFx, createRoundPointFx} from  "./"
import mapboxgl from "mapbox-gl";
import {forward, sample, split, attach} from "effector"
import {$points} from "./state";
import {
    setRoundMarkerEvent,
    setStartMarkerEvent,
    setEndMarkerEvent,
    mapInitPosition,
    selectPositionEvent
} from "../map";
import {pathPositionsReady, createMarkFx} from "./";
import {$map} from "../map/state";
import {getPathFx} from "../route";

createMarkFx.use((lat, lon, className, map) => {
    let mark = new mapboxgl.LngLat(lon, lat);
    let el = document.createElement('div');
    el.className = className;
    return new mapboxgl.Marker(el)
        .setLngLat(mark)
        .addTo(map);
});

$points.on(selectPositionEvent, (state, value) => {
    return {
        ...state,
        selected: value
    }
}).on(setStartMarkerEvent, (state, value) => {
    if (state.start) {
        state.start.remove();
    }
    return {
        ...state,
        start: value
    }
}).on(setEndMarkerEvent, (state, value) => {
    if (state.end) {
        state.end.remove();
    }
    return {
        ...state,
        end: value
    }
}).on(setRoundMarkerEvent, (state, value) => {
    if (state.round) {
        state.round.remove();
    }
    return {
        ...state,
        round: value
    }
});

const {createdStart, createdEnd, createdPoint, __: createdRound} = split(createMarkFx.done, {
  createdStart: ({params}) => params.className === 'App-map_marker_start',
  createdEnd: ({parasm}) => params.className === 'App-map_marker_end',
  createdPoint: ({params}) => params.className === 'App-map_marker_point'
})

forward({
    from: [
      createdStart.map(({result}) => result),
      createdRound.map(() => null)
    ],
    to: setStartMarkerEvent
});

forward({
    from: [
      createdEnd.map(({result}) => result),
      createdRound.map(() => null)
    ],
    to: setEndMarkerEvent
});

forward({
    from: [
      createdRound.map(({result}) => result),
      createdStart.map(() => null),
      createdEnd.map(() => null)
    ],
    to: setRoundMarkerEvent
});

sample({
    source: $points,
    clock: createdStart,
    target: mapInitPosition,
    fn: ({selected}) => ({lat: selected.lat, lng: selected.lng, field: 'from'}),
});

sample({
    source: $points,
    clock: createdEnd,
    target: mapInitPosition,
    fn: ({selected}) => ({lat: selected.lat, lng: selected.lng, field: 'to'}),
});

sample({
    source: {points: $points, config: $config},
    clock: pathPositionsReady,
    fn: ({points, map, config}) => ({points, api: config.api}),
    target: resolvePathType,
});

const {resolvedDirectPath, resolvedRoundPath} = split(resolvePathType, {
  resolvedDirectPath: ({points}) => points.start && points.end,
  resolvedRoundPath: ({points}) => points.round
})

forward({
  from: [
    resolvedDirectPath.map(({points, api}) => {
      const {lat, lng} = points.start.getLngLat();
      const {lat: endLat, lng: endLng} = points.end.getLngLat();
      return {
        api,
        points: [{
            lat, lon
          },
          {
            lat: endLat, lon: endLng,
        }],
        type: 'direct'
      };
    }),
    resolvedRoundPath.map(({points, api}) => {
      const {lat, lon} = points.round.getLngLat();
      return {
        api,
        points: [{
          lat, lon
        }],
        radius: 1000,
        type: 'round'
      };
    })
  ],
  to: getPathFx
});


createdStart.watch((startMarker) => {
    startMarker.getElement().addEventListener('click', (event) => {
        setStartMarkerEvent(null);
        event.stopPropagation();
    });
});


createdEnd.watch((endMarker) => {
    endMarker.getElement().addEventListener('click', (event) => {
        setEndMarkerEvent(null);
        event.stopPropagation();
    });
});

createdRound.watch((roundMarker) => {
    roundMarker.getElement().addEventListener('click', (event) => {
        setRoundMarkerEvent(null);
        event.stopPropagation();
    });
});
