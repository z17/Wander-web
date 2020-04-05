import React from 'react';
import './Sidebar.css';
import {createEffect, createEvent, createStore, forward, sample, split} from 'effector'
import {useStore} from 'effector-react'
import {mapbox_access_key} from "../../models/Map";

export const sidebarSetField = createEvent();

const getTextByCoordinatesFx = createEffect();

getTextByCoordinatesFx.use(async (lngLat) => {
        return await geocodingService.reverseGeocode({
            query: [lngLat.lng, lngLat.lat],
            types: ['address'],
            limit: 1,
            language: ['ru']
        }).send();
    }
);

const textByCoordinates = getTextByCoordinatesFx.done.map(({params, result} )=> {
    const match = result.body;
    let text = params.lat + ' ' + params.lng;
    if (match.features[0]) {
        const address = match.features[0].address || '';
        text = match.features[0].text + ' ' + address;
    }
    const field = params.field;
    return {text, field};
});

forward({
    from: sidebarSetField,
    to: getTextByCoordinatesFx,
});

const {getFromTextDone, getToTextDone} = split(textByCoordinates,  {
    getFromTextDone: ({text, field}) => field === 'from',
    getToTextDone: ({text, field}) => field === 'to',
});

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({ accessToken: mapbox_access_key });

const $fieldsStore = createStore({
    from_text: null,
    to_text: null,
}).on(getFromTextDone, (state, value) => {
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

const Sidebar = () => {
    const {from_text, to_text} = useStore($fieldsStore);

    return (
      <aside className="App-sidebar">
        <div className="App-sidebar__container">
          <div className="App-sidebar__title-block">
            <h1 className="App-sidebar__title">Wander</h1>
          </div>
            <div className="App-sidebar__route_block">
                <p className="App-sidebar__route_title">New route</p>
                <input
                    className="App-sidebar__route_block_input"
                    type="text"
                    placeholder="From"
                    value={from_text}
                />
                <input
                    className="App-sidebar__route_block_input"
                    type="text"
                    placeholder="To"
                    value={to_text}
                />
                <input
                    className="App-sidebar__route_block_build"
                    type="button"
                    value="Build route"
                />
            </div>
          <div className="App-sidebar__footer-block">
              Download on <a href="https://play.google.com/store/apps/details?id=ru.travelpath">Google Play</a>
          </div>
        </div>
      </aside>
    )
};

export default Sidebar;