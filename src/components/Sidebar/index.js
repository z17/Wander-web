import React from 'react';
import './Sidebar.css';
import {useStore} from 'effector-react'
import {$noRoute, $route} from "../../models/route/state";
import BuildForm from "../BuildForm";
import Route from "../Route";

const Sidebar = () => {
    const {route} = useStore($route);
    const noRoute = useStore($noRoute);

    return (
        <aside className="App-sidebar">
            <div className="App-sidebar__container">
                {noRoute && <BuildForm/>}
                {route && <Route/>}
                <div className="App-sidebar__footer-block">
                    Download on <a href="https://play.google.com/store/apps/details?id=ru.travelpath">Google Play</a>
                </div>
            </div>
        </aside>
    )
};

export default Sidebar;