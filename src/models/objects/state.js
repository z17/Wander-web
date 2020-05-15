import {createStore} from "effector";

export const $objects = createStore([]);

$objects.watch(console.log);
