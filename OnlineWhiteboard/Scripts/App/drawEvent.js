var DrawEvent = (function () {
    function DrawEvent(type, point, lastPoint, toolBehaviorName, color, thickness) {
        this.type = type;
        this.point = point.round();
        this.lastPoint = lastPoint.round();
        this.id = "";
        this.toolBehaviorName = toolBehaviorName;
        this.color = color;
        this.thickness = thickness;
    }
    return DrawEvent;
}());
//# sourceMappingURL=drawEvent.js.map