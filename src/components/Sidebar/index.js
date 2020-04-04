import React from 'react';
import './Sidebar.css';
import {createStore, createEvent} from 'effector'
import {useStore} from 'effector-react'

const randomEvent = createEvent('randomEvent');

export const changedFromField = createEvent();
export const changedToField = createEvent();

const $fieldsStore = createStore({
    from_text: null,
    to_text: null,
}).on(changedFromField, (state, value) => {
    return {
        ...state,
        from_text: value,
    };
}).on(changedToField, (state, value) => {
    return {
        ...state,
        to_text: value
    };
}).on(randomEvent, (state) => {
    return {
        ...state,
        from_text: "test"
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
                    onChange={(event) => changedFromField(event.target.value)}
                    value={from_text}
                />
                <input
                    className="App-sidebar__route_block_input"
                    type="text"
                    placeholder="To"
                    onChange={(event) => changedToField(event.target.value)}
                    value={to_text}
                />
                <input
                    className="App-sidebar__route_block_build"
                    type="button"
                    value="Build route"
                    onClick={randomEvent}
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