import React from "react";
import {useStore} from "effector-react";
import {$buildForm} from "../../models/buildForm/state";
import './BuildForm.css';

const BuildForm = () => {

    const {from_text, to_text} = useStore($buildForm);

    return (
        <div className="App-sidebar__build_container">
            <div className="App-sidebar__title-block">
                <h1 className="App-sidebar__title">Wander</h1>
            </div>
            <div className="App-sidebar__build_block">
                <p className="App-sidebar__build_title">New route</p>
                <input
                    className="App-sidebar__build_block_input"
                    type="text"
                    placeholder="From"
                    value={from_text}
                />
                <input
                    className="App-sidebar__build_block_input"
                    type="text"
                    placeholder="To"
                    value={to_text}
                />
                <input
                    className="App-sidebar__build_block_build"
                    type="button"
                    value="Build route"
                />
            </div>

        </div>
    )
};

export default BuildForm