import {Ellipse} from "mafs";
import * as React from "react";

import {
    lockedEllipseFillStyles,
    lockedFigureColors,
    type LockedEllipseType,
} from "../../perseus-types";

const LockedEllipse = (props: LockedEllipseType) => {
    const {center, radius, angle, color, fillStyle, strokeStyle} = props;

    return (
        <Ellipse
            center={center}
            radius={radius}
            angle={angle}
            fillOpacity={lockedEllipseFillStyles[fillStyle]}
            strokeStyle={strokeStyle}
            color={lockedFigureColors[color]}
        />
    );
};

export default LockedEllipse;
