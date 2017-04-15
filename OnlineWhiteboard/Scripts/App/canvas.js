var DrawEventType;
(function (DrawEventType) {
    DrawEventType[DrawEventType["MouseDown"] = 0] = "MouseDown";
    DrawEventType[DrawEventType["MouseDrag"] = 1] = "MouseDrag";
    DrawEventType[DrawEventType["MouseUp"] = 2] = "MouseUp";
})(DrawEventType || (DrawEventType = {}));
var Canvas = (function () {
    function Canvas(manager) {
        var _this = this;
        this.toolCollection = {};
        this.localInputEnabled = false;
        this.networkInputEnabled = true;
        this.draggingMode = false;
        this.dragStarted = false;
        this.boundsPadding = 300;
        this.mouseOffset = { x: 0, y: 0 };
        this.canvasOffset = { x: 0, y: 0 };
        this.$finalCanvas = $("#finalDrawCanvas");
        this.$container = this.$finalCanvas.parent();
        var elem = this.$finalCanvas.get(0);
        elem.width = this.$finalCanvas.width();
        elem.height = this.$finalCanvas.height();
        this.app = manager;
        this.toolBox = new ToolBox(this.app);
        this.entitites = new EntityCollection(this);
        this.width = this.$container.width();
        this.height = this.$container.height();
        this.$container.mousedown(function (e) { _this.onMouseDown(e); });
        $(document.body).keydown(function (e) { _this.onKeyDown(e); });
        $(document.body).keyup(function (e) { _this.onKeyUp(e); });
        $(document.body).mousemove(function (e) { _this.onMouseMove(e); });
        $(document.body).mouseup(function (e) { _this.onMouseUp(e); });
        $(document.body).resize(function (e) { _this.onResize(); });
        $(document.body).keydown(function (e) { _this.onKeyDown(e); });
        this.app.hub.client.onClear = function (id) { _this.onClear(id); };
        this.app.hub.client.onDrawEvent = function (event) { _this.onDrawEvent(event); };
        this.app.hub.client.onToolChange = function (userId, toolName) { _this.onToolChange(userId, toolName); };
    }
    Canvas.prototype.onKeyDown = function (e) {
        if (!this.draggingMode && e.keyCode == 18 /* alt */) {
            this.setPossibleDraggingCursor();
            this.userTool.release();
            this.draggingMode = true;
            this.localInputEnabled = false;
        }
        if (!this.dragStarted && e.keyCode == 82 /* r */) {
            this.resetPosition();
        }
    };
    Canvas.prototype.onKeyUp = function (e) {
        if (e.keyCode == 18 /* alt */) {
            this.setDefaultCursor();
            this.draggingMode = false;
            this.dragStarted = false;
            this.localInputEnabled = true;
        }
    };
    Canvas.prototype.onMouseDown = function (e) {
        if (this.draggingMode) {
            this.setDefinitelyDraggingCursor();
            this.dragStarted = true;
            this.mouseOffset = {
                x: e.clientX,
                y: e.clientY
            };
            this.canvasOffset = {
                x: this.$container.offset().left,
                y: this.$container.offset().top,
            };
        }
    };
    Canvas.prototype.onMouseMove = function (e) {
        if (this.dragStarted) {
            var newPosition = {
                left: this.canvasOffset.x + e.clientX - this.mouseOffset.x,
                top: this.canvasOffset.y + e.clientY - this.mouseOffset.y
            };
            this.$container.offset(newPosition);
            if (this.isOutOfBounds(newPosition)) {
                this.moveIntoBounds();
            }
        }
    };
    Canvas.prototype.onMouseUp = function (e) {
        if (this.dragStarted) {
            this.setPossibleDraggingCursor();
            this.dragStarted = false;
        }
    };
    Canvas.prototype.onResize = function () {
        this.moveIntoBounds();
    };
    Canvas.prototype.isOutOfBounds = function (pos) {
        return pos.left + this.boundsPadding > window.innerWidth ||
            pos.top + this.boundsPadding > window.innerHeight ||
            pos.top + this.height - this.boundsPadding < 0 ||
            pos.left + this.width - this.boundsPadding < 0;
    };
    Canvas.prototype.moveIntoBounds = function () {
        this.$container.offset({
            left: Math.max(this.boundsPadding - this.width, Math.min(window.innerWidth - this.boundsPadding, this.$container.offset().left)),
            top: Math.max(this.boundsPadding - this.height, Math.min(window.innerHeight - this.boundsPadding, this.$container.offset().top))
        });
    };
    Canvas.prototype.resetPosition = function () {
        this.$container.css({
            top: "",
            left: ""
        });
    };
    Canvas.prototype.setPossibleDraggingCursor = function () {
        this.$container.css("cursor", "-webkit-grab");
    };
    Canvas.prototype.setDefinitelyDraggingCursor = function () {
        this.$container.css("cursor", "-webkit-grabbing");
    };
    Canvas.prototype.setDefaultCursor = function () {
        this.$container.css("cursor", "pointer");
    };
    Canvas.prototype.onClear = function (id) {
        if (this.networkInputEnabled) {
            this.clear();
        }
    };
    Canvas.prototype.onDrawEvent = function (event) {
        if (this.networkInputEnabled) {
            this.addUserToolIfDoesNotExist(event.id);
            this.toolCollection[event.id].onMouse(event);
        }
    };
    Canvas.prototype.onToolChange = function (userId, toolName) {
        if (this.networkInputEnabled) {
            if (this.app.user.id == userId) {
                this.toolBox.setTool(toolName, false);
            }
        }
    };
    Canvas.prototype.sendDrawEvent = function (event) {
        this.app.hub.server.onDrawEvent(event);
    };
    Canvas.prototype.processLoadEvents = function (events) {
        for (var i = 0; i < events.length; i++) {
            this.addUserToolIfDoesNotExist(events[i].id);
            this.toolCollection[events[i].id].onMouse(events[i]);
        }
    };
    Canvas.prototype.processLoadEntities = function (snapshot) {
        for (var i = 0; i < snapshot.textEntities.length; i++) {
            var entity = snapshot.textEntities[i];
            entity.position = Point.deserialize(entity.position);
            this.entitites.addTextEntity(entity.id, entity.text, entity.position);
        }
        this.userTool.release();
    };
    Canvas.prototype.initializeFromSnapshot = function (snapshot) {
        this.addLocalUser();
        this.localInputEnabled = true;
        this.processLoadEvents(snapshot.events);
        this.processLoadEntities(snapshot);
    };
    Canvas.prototype.addLocalUser = function () {
        this.toolCollection[this.app.user.id] = new LocalTool(this.app.user.id, this);
    };
    Canvas.prototype.onUserConnect = function (user) {
        console.log(format("user %s connected", user.id));
        this.addUserToolIfDoesNotExist(user.id);
    };
    Canvas.prototype.onUserDisconnect = function (user) {
        console.log(format("user %s disconnected", user.id));
        this.toolCollection[user.id].dispose();
        delete this.toolCollection[user.id];
    };
    Canvas.prototype.addUserToolIfDoesNotExist = function (userId) {
        if (!this.toolCollection[userId]) {
            this.toolCollection[userId] = new Tool(userId, this);
        }
    };
    Object.defineProperty(Canvas.prototype, "userTool", {
        get: function () {
            return this.toolCollection[this.app.user.id];
        },
        enumerable: true,
        configurable: true
    });
    Canvas.prototype.clear = function () {
        this.userTool.clear();
    };
    return Canvas;
}());
//# sourceMappingURL=canvas.js.map