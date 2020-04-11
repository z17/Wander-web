import React from 'react';
import './Sidebar.css';
import {useStore} from 'effector-react'
import {$buildForm} from "../../models/buildForm/state";
import {$route} from "../../models/route/state";

const formatLength = (meters) => {
    return Number(meters / 1000).toFixed(1)
};

const formatDurationTime = (seconds) => {
    let minutes = seconds / 60;
    let result = Math.ceil(minutes / 10) * 10;
    if (minutes > 90) {
        result = minutes / 60;
        return Number(result).toFixed(1)
    } else {
        return result;
    }
};

const formatDurationName = (seconds) => {
    const minutes = seconds / 60;
    let timeName = 'минут';
    if (minutes > 90) {
        timeName = 'часов'
    }
    return timeName;
};

const Sidebar = () => {
    const {from_text, to_text} = useStore($buildForm);

    const {route} = useStore($route);

    const renderObjects = (objects) => {
        return objects.map((item) =>
            <div key={'object_' + item.id} className="App-sidebar__route_points_point">
                {item.image && <img src={item.image} className="App-sidebar__route_points_point_image"/>}
                <div className="App-sidebar__route_points_point_title">{item.title}</div>
            </div>
        );
    };

    return (
        <aside className="App-sidebar">
            <div className="App-sidebar__container">
                {!route && <div className="App-sidebar__build_container">
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

                </div> }
                {route && <div className="App-sidebar__route_container">

                    <div className="App-sidebar__route_header">
                        Route #{route.id}
                    </div>

                    <h1 className="App-sidebar__title">{route.name}</h1>
                    <div className="App-sidebar__route_statistic">
                        <div className="App-sidebar__route_statistic_part">{route.objects.length} <p className="App-sidebar__route_statistic_part_label">точек</p></div>
                        <div className="App-sidebar__route_statistic_part">{formatLength(route.length)}<p className="App-sidebar__route_statistic_part_label">км</p></div>
                        <div className="App-sidebar__route_statistic_part">{formatDurationTime(route.time)}<p className="App-sidebar__route_statistic_part_label">{formatDurationName(route.time)}</p></div>
                    </div>
                    <div className="App-sidebar__route_points">
                        <div className="App-sidebar__route_points_title">Точки в маршруте</div>
                        {renderObjects(route.objects)}
                    </div>
                </div>
                }
                <div className="App-sidebar__footer-block">
                    Download on <a href="https://play.google.com/store/apps/details?id=ru.travelpath">Google Play</a>
                </div>
            </div>
        </aside>
    )
};

export default Sidebar;