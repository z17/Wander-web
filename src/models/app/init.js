import {forward} from 'effector';

import {objectsParsed, setConfig} from './';
import {$config} from './state';
import {updateRandomObjectsEvent} from "../objects";

$config.on(setConfig, () => ({
  api: 'http://127.0.0.1:1323/api/'
}))

forward({
  from: objectsParsed,
  to: updateRandomObjectsEvent
})

setConfig();
