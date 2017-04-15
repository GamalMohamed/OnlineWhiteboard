var DrawBehavior = (function () {
    function DrawBehavior(tool) {
        this.name = "draw";
        this.color = "black";
        this.thickness = 5;
        this.styles = {
            "lineCap": "round",
            "lineJoin": "round",
            "lineWidth": 2
        };
        this.bufferContext = tool.bufferContext;
        this.finalContext = tool.finalContext;
        this.color = tool.canvas.toolBox.currentColor;
    }
    DrawBehavior.prototype.onMouseDrag = function (event) {
        this.bufferContext.beginPath();
        this.bufferContext.moveTo(event.point.x, event.point.y);
        this.bufferContext.lineTo(event.lastPoint.x, event.lastPoint.y);
        this.bufferContext.stroke();
        this.bufferContext.closePath();
    };
    DrawBehavior.prototype.onMouseDown = function (event) {
        this.bufferContext.beginPath();
        this.bufferContext.arc(event.point.x, event.point.y, this.thickness / 2, 0, 2 * Math.PI, false);
        this.bufferContext.fill();
    };
    DrawBehavior.prototype.onMouseUp = function (event) {
    };
    DrawBehavior.prototype.finalize = function (path) {
        this.finalContext.beginPath();
        this.finalContext.arc(path[0].x, path[0].y, this.thickness / 2, 0, 2 * Math.PI, false);
        this.finalContext.fill();
        this.finalContext.closePath();
        this.finalContext.beginPath();
        for (var i = 0; i < path.length - 1; i++) {
            this.finalContext.moveTo(path[i].x, path[i].y);
            this.finalContext.lineTo(path[i + 1].x, path[i + 1].y);
        }
        this.finalContext.stroke();
        this.finalContext.closePath();
    };
    return DrawBehavior;
}());
//# sourceMappingURL=drawBehavior.js.map