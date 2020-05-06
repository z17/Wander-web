import {$buildForm} from './state'
import {forward, split} from "effector";
import {mapbox_access_key, mapInitPosition} from "../map";
import {getTextByCoordinatesFx} from './'

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({accessToken: mapbox_access_key});

getTextByCoordinatesFx.use(async (lngLat) => {
        return await geocodingService.reverseGeocode({
            query: [lngLat.lng, lngLat.lat],
            types: ['address'],
            limit: 1,
            language: ['ru']
        }).send();
    }
);

const textByCoordinates = getTextByCoordinatesFx.done.map(({params, result}) => {
    const match = result.body;
    let text = params.lat + ' ' + params.lng;
    if (match.features[0]) {
        const address = match.features[0].address || '';
        text = match.features[0].text + ' ' + address;
    }
    const field = params.field;
    return {text, field};
});

const {getFromTextDone, getToTextDone} = split(textByCoordinates, {
    getFromTextDone: ({text, field}) => field === 'from',
    getToTextDone: ({text, field}) => field === 'to',
});

$buildForm.on(getFromTextDone, (state, value) => {
    return {
        ...state,
        from_text: value.text,
    };
}).on(getToTextDone, (state, value) => {
    return {
        ...state,
        to_text: value.text
    };
});

forward({
    from: mapInitPosition,
    to: getTextByCoordinatesFx,
});
