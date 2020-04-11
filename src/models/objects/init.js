import {$map} from "../map/state";
import {sample, forward} from "effector";
import {$objects} from "./state";
import {addObjects, removeObjectsFx, updateRandomPointsEvent} from "./index";
import {createObjectMarkersFx} from "../map";

removeObjectsFx.use(({objects, points}) => {
    // todo: make something with points
    objects.forEach(function (object) {
        object.marker.remove();
    });
    return points;
});

sample({
    source: $objects,
    clock: updateRandomPointsEvent,
    target: removeObjectsFx,
    fn: (source, clock) => ({objects: source, points: clock})
});

sample({
    source: $map,
    clock: removeObjectsFx.done,
    target: createObjectMarkersFx,
    fn: (source, clock) => ({objects: clock.result, map: source.map})
});

forward({
    from: createObjectMarkersFx.doneData,
    to: addObjects
});

$objects.on(addObjects, (state, objects) => {
    return objects
});