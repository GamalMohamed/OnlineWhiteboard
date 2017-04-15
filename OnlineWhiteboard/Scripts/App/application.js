var Application = (function () {
    function Application() {
        var _this = this;
        this.hub = $.connection.boardHub;
        this.canvas = new Canvas(this);
        this.chat = new Chat(this);
        this.hub.client.handshake = function (user, snapshot) { _this.handshake(user, snapshot); };
        this.hub.client.connect = function (user) { _this.onConnect(user); };
        this.hub.client.disconnect = function (user) { _this.onDisconnect; };
        $("#loadingBlind").on("transitionend", function () {
            $("#loadingBlind").hide();
        });
        $.connection.hub.start().done(function () { _this.onConnectionStarted(); });
        $.connection.hub.reconnecting(function () { _this.onReconnecting(); });
    }
    Application.prototype.onConnect = function (user) {
        user = UserInfo.deserialize(user);
        this.canvas.onUserConnect(user);
        this.chat.onUserConnect(user);
    };
    Application.prototype.onDisconnect = function (user) {
        user = UserInfo.deserialize(user);
        this.canvas.onUserDisconnect(user);
        this.chat.onUserDisconnect(user);
    };
    Application.prototype.handshake = function (user, snapshot) {
        this.user = UserInfo.deserialize(user);
        this.canvas.initializeFromSnapshot(snapshot);
        this.chat.initializeFromSnapshot(snapshot);
        setTimeout(function () {
            $("#loadingBlind").addClass("fadeout");
        }, 500);
    };
    Application.prototype.onConnectionStarted = function () {
        this.hub.server.handshake(boardId);
    };
    Application.prototype.onReconnecting = function () {
        this.canvas.userTool.release();
        this.canvas.networkInputEnabled = false;
        this.canvas.localInputEnabled = false;
        this.chat.networkInputEnabled = false;
        this.chat.localInputEnabled = false;
        $("#disconnectedBlind").css("visibility", "initial");
    };
    return Application;
}());
var app;
onload = function () {
    ExtendJQuery();
    app = new Application();
};
//# sourceMappingURL=application.js.map