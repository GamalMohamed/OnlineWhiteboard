var Entity = (function () {
    function Entity(canvas, $element, id) {
        var _this = this;
        this._id = id;
        this._canvas = canvas;
        this.$container = $(document.createElement("div"));
        this._$element = $element;
        this._$element.addClass("entity");
        this.$container.addClass("entityContainer");
        this.$container.attr("id", this._id);
        this.$container.append(this._$element);
        $(document.body).append(this.$container);
        this.$container.draggable({
            containment: "#container",
            drag: function (event, ui) {
                _this.onDrag(event, ui);
            }
        });
        this.addListeners();
    }
    Entity.prototype.addListeners = function () {
    };
    Object.defineProperty(Entity.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.serialize = function () {
        return {
            id: this._id,
            position: this.position,
        };
    };
    Object.defineProperty(Entity.prototype, "position", {
        get: function () {
            var offset = this.$container.offset();
            return new Point(offset.left, offset.top);
        },
        set: function (position) {
            this.$container.offset(position.asOffset());
        },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.onDrag = function (event, ui) {
        this._canvas.app.hub.server.entityMove(this.id, Point.fromOffset(ui.offset));
    };
    Object.defineProperty(Entity.prototype, "$element", {
        get: function () {
            return this._$element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    return Entity;
}());
//# sourceMappingURL=entity.js.map