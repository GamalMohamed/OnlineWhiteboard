var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.deserialize = function (serialized) {
        return new Point(serialized.x, serialized.y);
    };
    Point.fromOffset = function (offset) {
        return new Point(offset.left, offset.top);
    };
    Point.prototype.round = function () {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    };
    Point.prototype.asOffset = function () {
        return {
            top: this.y,
            left: this.x
        };
    };
    return Point;
}());
//# sourceMappingURL=point.js.map