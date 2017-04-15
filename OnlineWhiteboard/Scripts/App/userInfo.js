var UserInfo = (function () {
    function UserInfo(displayName, cid, boardId) {
        this.displayName = displayName,
            this.id = cid;
        this.boardId = boardId;
    }
    UserInfo.prototype.serialize = function () {
        return {
            displayName: this.displayName,
            id: this.id,
        };
    };
    UserInfo.deserialize = function (serialized) {
        return new UserInfo(serialized.displayName, serialized.id, serialized.boardId);
    };
    return UserInfo;
}());
//# sourceMappingURL=userInfo.js.map