var EntityType;
(function (EntityType) {
    EntityType[EntityType["Text"] = 0] = "Text";
})(EntityType || (EntityType = {}));
var EntityCollection = (function () {
    function EntityCollection(canvas) {
        this.canvas = canvas;
        this.entityTexts = [];
        this.initializeNetwork();
    }
    EntityCollection.prototype.initializeNetwork = function () {
        var _this = this;
        this.canvas.app.hub.client.addTextEntity = function (entity) {
            _this.addTextEntityWithoutSync(entity.id, entity.text, Point.deserialize(entity.position));
        };
        this.canvas.app.hub.client.entityMove = function (id, to) {
            _this.getEntity(id).position = Point.deserialize(to);
        };
        this.canvas.app.hub.client.textEntityUpdateText = function (id, text) {
            _this.getEntity(id).text = text;
        };
    };
    EntityCollection.prototype.getEntity = function (id) {
        return (this.entityTexts.filter(function (val, index) {
            return val.id == id;
        })[0]);
    };
    EntityCollection.prototype.generateId = function (type) {
        return this.canvas.app.user.id.replace(/\-/g, "_") + "__" + (EntityCollection.entityCount++) + "__" + type.toString();
    };
    EntityCollection.prototype.addTextEntityWithoutSync = function (id, text, position) {
        var newEntity = new TextEntity(this.canvas, id, text, position);
        this.entityTexts.push(newEntity);
        return newEntity;
    };
    EntityCollection.prototype.addTextEntity = function (id, text, position) {
        if (id === void 0) { id = this.generateId(EntityType.Text); }
        if (text === void 0) { text = ""; }
        if (position === void 0) { position = new Point(0, 0); }
        var entity = this.addTextEntityWithoutSync(id, text, position);
        this.canvas.app.hub.server.addTextEntity(entity.serialize());
    };
    return EntityCollection;
}());
EntityCollection.entityCount = 0;
//# sourceMappingURL=entityCollection.js.map