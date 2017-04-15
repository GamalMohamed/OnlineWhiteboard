var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Tool = (function () {
    function Tool(userId, canvas) {
        this.isMouseDown = false;
        this.lastMouse = null;
        this.path = [];
        this.userId = userId;
        this.canvas = canvas;
        this.$finalCanvas = canvas.$finalCanvas;
        this.finalContext = this.$finalCanvas.get(0).getContext("2d");
        this.$bufferCanvas = this.createBuffer();
        this.bufferContext = this.$bufferCanvas.get(0).getContext("2d");
        this.setBehavior(new DrawBehavior(this));
    }
    Tool.prototype.dispose = function () {
        this.$bufferCanvas.remove();
    };
    Tool.prototype.createBuffer = function () {
        var bufferContainer = $("#bufferContainer");
        var buffer = document.createElement("canvas");
        buffer.classList.add("buffer");
        bufferContainer.append(buffer);
        buffer.width = buffer.clientWidth;
        buffer.height = buffer.clientHeight;
        return $(buffer);
    };
    Tool.prototype.onMouse = function (event) {
        this.setToolFromSnapshot(event.toolBehaviorName, event.color, event.thickness);
        switch (event.type) {
            case DrawEventType.MouseDown:
                this.mouseDownWrapper(event, false);
                break;
            case DrawEventType.MouseDrag:
                this.mouseMoveWrapper(event, false);
                break;
            case DrawEventType.MouseUp:
                this.mouseUpWrapper(event, false);
                break;
        }
    };
    Tool.prototype.setToolFromSnapshot = function (toolBehaviorName, color, thickness) {
        if (this.userId == this.canvas.app.user.id) {
            this.canvas.toolBox.setTool(toolBehaviorName, false);
            this.canvas.toolBox.setThicknessDisplay(thickness);
        }
        else {
            switch (toolBehaviorName) {
                case "erase":
                    this.setBehavior(new EraseBehavior(this));
                    break;
                case "draw":
                    this.setBehavior(new DrawBehavior(this));
                    break;
            }
        }
        this.behavior.color = color;
        this.behavior.thickness = thickness;
        this.applyStyles(this.bufferContext);
    };
    Tool.prototype.finalize = function (path) {
        this.applyStyles(this.finalContext);
        this.behavior.finalize(path);
        this.clearPath();
    };
    Tool.prototype.clearPath = function () {
        this.path = [];
    };
    Tool.prototype.onMouseDown = function (event) {
        this.path.push(event.point);
        this.behavior.onMouseDown(event);
    };
    Tool.prototype.onMouseUp = function (event) {
        this.behavior.onMouseUp(event);
        this.bufferContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.finalize(this.path);
    };
    Tool.prototype.onMouseDrag = function (event) {
        this.behavior.onMouseDrag(event);
    };
    Tool.prototype.mouseDownWrapper = function (event, sendToServer) {
        this.isMouseDown = true;
        this.lastMouse = new Point(event.point.x, event.point.y);
        var event = this.createEvent(DrawEventType.MouseDown, this.lastMouse, this.lastMouse);
        this.onMouseDown(event);
        if (sendToServer) {
            this.canvas.sendDrawEvent(event);
        }
    };
    Tool.prototype.mouseUpWrapper = function (event, sendToServer) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            var event = this.createEvent(DrawEventType.MouseUp, new Point(event.point.x, event.point.y), this.lastMouse);
            this.onMouseUp(event);
            if (sendToServer) {
                this.canvas.sendDrawEvent(event);
            }
        }
    };
    Tool.prototype.mouseMoveWrapper = function (event, sendToServer) {
        if (this.isMouseDown) {
            var event = this.createEvent(DrawEventType.MouseDrag, new Point(event.point.x, event.point.y), this.lastMouse);
            this.path.push(event.point);
            this.onMouseDrag(event);
            this.lastMouse = new Point(event.point.x, event.point.y);
            if (sendToServer) {
                this.canvas.sendDrawEvent(event);
            }
        }
    };
    Tool.prototype.applyStyles = function (context) {
        for (var style in this.behavior.styles) {
            context[style] = this.behavior.styles[style];
        }
        context.fillStyle = this.behavior.color;
        context.strokeStyle = this.behavior.color;
        context.lineWidth = this.behavior.thickness;
    };
    Tool.prototype.setBehavior = function (behavior) {
        this.behavior = behavior;
        this.applyStyles(this.finalContext);
        this.applyStyles(this.bufferContext);
    };
    Tool.prototype.createEvent = function (type, point, lastPoint) {
        return new DrawEvent(type, point, lastPoint, this.behavior.name, this.behavior.color, this.behavior.thickness);
    };
    Tool.prototype.release = function () {
        if (this.lastMouse != null) {
            this.onMouse(this.createEvent(DrawEventType.MouseUp, this.lastMouse, this.lastMouse));
        }
    };
    return Tool;
}());
var LocalTool = (function (_super) {
    __extends(LocalTool, _super);
    function LocalTool(userId, canvas) {
        var _this = _super.call(this, userId, canvas) || this;
        _this.addListeners();
        return _this;
    }
    LocalTool.prototype.handleUserClick = function (e) {
        var _this = this;
        requestAnimationFrame(function () {
            if (_this.canvas.localInputEnabled) {
                _this.lastMouse = new Point(e.clientX, e.clientY);
                var event = _this.createEvent(DrawEventType.MouseDown, new Point(e.offsetX, e.offsetY), _this.lastMouse);
                _this.mouseDownWrapper(event, true);
            }
        });
    };
    LocalTool.prototype.handleUserRelease = function (e) {
        var _this = this;
        requestAnimationFrame(function () {
            if (_this.canvas.localInputEnabled && _this.isMouseDown) {
                var canvasPosition = _this.$finalCanvas.offset();
                var mousePoint = new Point(e.clientX - canvasPosition.left, e.clientY - canvasPosition.top);
                var event = _this.createEvent(DrawEventType.MouseUp, mousePoint, _this.lastMouse);
                _this.mouseUpWrapper(event, true);
            }
        });
    };
    LocalTool.prototype.handleUserMove = function (e) {
        var _this = this;
        requestAnimationFrame(function () {
            if (_this.canvas.localInputEnabled && _this.isMouseDown) {
                var canvasPosition = _this.$finalCanvas.offset();
                var mousePoint = new Point(e.clientX - canvasPosition.left, e.clientY - canvasPosition.top);
                var event = _this.createEvent(DrawEventType.MouseDrag, mousePoint, _this.lastMouse);
                _this.mouseMoveWrapper(event, true);
            }
        });
    };
    LocalTool.prototype.addListeners = function () {
        var _this = this;
        $("#bufferContainer").mousedown(function (e) { return _this.handleUserClick(e); });
        $(document.body).mouseup(function (e) { return _this.handleUserRelease(e); });
        $(document.body).mousemove(function (e) { return _this.handleUserMove(e); });
    };
    LocalTool.prototype.clear = function () {
        this.release();
        this.bufferContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.finalContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return LocalTool;
}(Tool));
//# sourceMappingURL=tool.js.map