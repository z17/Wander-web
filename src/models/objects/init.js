import {$map} from "../map/state";
import {sample, forward} from "effector";
import {$objects} from "./state";
import {addObjects, removeObjectsFx, updateRandomObjectsEvent} from "./";
import {createObjectMarkersFx} from "../map";

removeObjectsFx.use(async ({objects, points}) => {
    // todo: make something with points
    objects.forEach(async function (object) {
        console.log(object.marker)
        object.marker.remove();
    });
    return points;
});

removeObjectsFx.watch(console.log)
$objects.on(addObjects, (state, objects) => {
    return objects
});

sample({
    source: $objects,
    clock: updateRandomObjectsEvent,
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
