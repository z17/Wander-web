import React from "react";
import {useStore} from "effector-react";
import {$route} from "../../models/route/state";
import './Route.css'
import {removeRouteEvent} from "../../models/route";

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

const renderObjects = (objects) => {
    return objects.map((item) =>
        <div key={'object_' + item.id} className="App-sidebar__route_points_point">
            {item.image && <img src={item.image} className="App-sidebar__route_points_point_image"/>}
            <div className="App-sidebar__route_points_point_title">{item.title}</div>
        </div>
    );
};

const Route = () => {

    const {route} = useStore($route);

    return (
        <div className="App-sidebar__route_container">

            <div className="App-sidebar__route_header">
                Route #{route.id}
                <div className="App-sidebar__route_reset" onClick={removeRouteEvent}>Сбросить</div>
            </div>

            <h1 className="App-sidebar__title">{route.name}</h1>
            <div className="App-sidebar__route_statistic">
                <div className="App-sidebar__route_statistic_part">{route.objects.length} <p
                    className="App-sidebar__route_statistic_part_label">точек</p></div>
                <div className="App-sidebar__route_statistic_part">{formatLength(route.length)}<p
                    className="App-sidebar__route_statistic_part_label">км</p></div>
                <div className="App-sidebar__route_statistic_part">{formatDurationTime(route.time)}<p
                    className="App-sidebar__route_statistic_part_label">{formatDurationName(route.time)}</p></div>
            </div>
            <div className="App-sidebar__route_points">
                <div className="App-sidebar__route_points_title">Точки в маршруте</div>
                {renderObjects(route.objects)}
            </div>
        </div>
    )

};

export default Route