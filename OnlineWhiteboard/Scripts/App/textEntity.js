var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TextEntity = (function (_super) {
    __extends(TextEntity, _super);
    function TextEntity(canvas, id, text, position) {
        var _this = this;
        var textElement = document.createElement("input");
        textElement.classList.add("entityText");
        _this = _super.call(this, canvas, $(textElement), id) || this;
        _this.text = text;
        _this.position = position;
        return _this;
    }
    TextEntity.prototype.serialize = function () {
        var ser = _super.prototype.serialize.call(this);
        ser.text = this.text;
        return ser;
    };
    TextEntity.prototype.addListeners = function () {
        var _this = this;
        _super.prototype.addListeners.call(this);
        this.$element.on("keyup", function (event) {
            _this.canvas.app.hub.server.textEntityUpdateText(_this.id, _this.text);
        });
    };
    Object.defineProperty(TextEntity.prototype, "text", {
        get: function () {
            return this.$element.val();
        },
        set: function (text) {
            this.$element.val(text);
        },
        enumerable: true,
        configurable: true
    });
    return TextEntity;
}(Entity));
//# sourceMappingURL=textEntity.js.map