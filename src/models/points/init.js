import {createStartPointFx, createEndPointFx, createRoundPointFx} from  "./"
import mapboxgl from "mapbox-gl";
import {forward, sample, split} from "effector"
import {$points} from "./state";
import {
    setRoundMarkerEvent,
    setStartMarkerEvent,
    setEndMarkerEvent,
    mapInitPosition,
    selectPositionEvent
} from "../map";
import {pathPositionsReady} from "./index";
import {$map} from "../map/state";
import {getPathFx} from "../route";

export const createMark = (lat, lon, className, map) => {
    let mark = new mapboxgl.LngLat(lon, lat);
    let el = document.createElement('div');
    el.className = className;
    return new mapboxgl.Marker(el)
        .setLngLat(mark)
        .addTo(map);
};

const createStartMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_start', map)
};

const createEndMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_end', map)
};

const createRoundMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_round', map)
};


createStartPointFx.use(({map, points}) => {
    const startMarker = createStartMark(points.selected.lat, points.selected.lng, map.map);
    startMarker.getElement().addEventListener('click', (event) => {
        setStartMarkerEvent(null);
        event.stopPropagation();
    });

    return startMarker;
});


createEndPointFx.use(({map, points}) => {
    const endMarker = createEndMark(points.selected.lat, points.selected.lng, map.map);
    endMarker.getElement().addEventListener('click', (event) => {
        setEndMarkerEvent(null);
        event.stopPropagation();
    });
    return endMarker;

});

createRoundPointFx.use(({map, points}) => {
    const roundMarker = createRoundMark(points.selected.lat, points.selected.lng, map.map);
    roundMarker.getElement().addEventListener('click', (event) => {
        setRoundMarkerEvent(null);
        event.stopPropagation();
    });
    return roundMarker;
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


forward({
    from: createStartPointFx.done.map(() => null),
    to: setRoundMarkerEvent
});

forward({
    from: createStartPointFx.done.map(({result}) => result),
    to: setStartMarkerEvent
});

sample({
    source: $points,
    clock: createStartPointFx.done,
    target: mapInitPosition,
    fn: ({selected}) => ({lat: selected.lat, lng: selected.lng, field: 'from'}),
});


forward({
    from: createEndPointFx.done.map(() => null),
    to: setRoundMarkerEvent
});

forward({
    from: createEndPointFx.done.map(({result}) => result),
    to: setEndMarkerEvent
});

sample({
    source: $points,
    clock: createEndPointFx.done,
    target: mapInitPosition,
    fn: ({selected}) => ({lat: selected.lat, lng: selected.lng, field: 'to'}),
});


forward({
    from: createRoundPointFx.done.map(() => null),
    to: setStartMarkerEvent
});
forward({
    from: createRoundPointFx.done.map(() => null),
    to: setEndMarkerEvent
});

forward({
    from: createRoundPointFx.done.map(({result}) => result),
    to: setRoundMarkerEvent
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
