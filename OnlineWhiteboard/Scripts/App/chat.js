var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["Error"] = 0] = "Error";
    NotificationType[NotificationType["Warning"] = 1] = "Warning";
    NotificationType[NotificationType["Info"] = 2] = "Info";
})(NotificationType || (NotificationType = {}));
var Chat = (function () {
    function Chat(app) {
        var _this = this;
        this.localInputEnabled = false;
        this.networkInputEnabled = true;
        this.wasPreviousANotification = false;
        this.hidden = false;
        this.newMessageNotSeen = false;
        this.messengerFlashLength = 500;
        this.app = app;
        this.$messengerTopBar = $("#messengerTopBar");
        this.$messageContainer = $("#messageContainer");
        this.$messageInput = $("#messageInput");
        this.$messengerVisibileToggle = $("#switchButton");
        this.$messenger = $("#messenger");
        this.$latexPreviewModal = $("#latexModal");
        this.$latexModalToggle = $("#latexInputButton");
        this.$latexInput = $("#latexInput");
        this.$latexOutput = $("#renderedText");
        this.$nameChangeModal = $("#nameChangeModal");
        this.$nameChangeInput = $("#nameChangeInput");
        this.$nameChangeToggle = $("#nameChangeToggle");
        this.$saveNameButton = $("#saveNameButton");
        this.defaultMessengerWidth = this.$messageContainer.width() + "px";
        this.previousMessage = null;
        this.$messageInput.keydown(function (e) { _this.onMessageKeyDown(e); });
        this.$messageInput.focus(function (e) { _this.onMessengerFocus(e); });
        this.$messenger.click(function (e) { _this.onMessengerClick(e); });
        this.$messengerTopBar.click(function (e) { _this.onTopBarClick(e); });
        this.$latexModalToggle.click(function (e) { _this.onLatexModalToggle(e); });
        this.$latexInput.keyup(function (e) { _this.onLatexModalKeyUp(e); });
        this.$nameChangeToggle.click(function (e) { _this.onNameChangeToggle(e); });
        this.$saveNameButton.click(function (e) { _this.onSaveNameClick(e); });
        $("#latexSave").click(function (e) { _this.onLatexSaveClick(e); });
        setInterval(function () { _this.onMessageFlash(); }, this.messengerFlashLength);
        this.app.hub.client.addMessage = function (message) { _this.onMessage(message); };
        this.app.hub.client.onNameChange = function (oldName, newName) { _this.onNameChange(oldName, newName); };
    }
    Chat.prototype.onMessageFlash = function () {
        if (this.newMessageNotSeen) {
            this.$messengerTopBar.toggleClass("flashing");
        }
        else {
            this.$messengerTopBar.removeClass("flashing");
        }
    };
    Chat.prototype.onMessage = function (message) {
        if (this.networkInputEnabled) {
            message = Message.deserialize(message);
            this.appendChatMessage(message);
        }
    };
    Chat.prototype.onNameChange = function (oldName, newName) {
        if (this.networkInputEnabled) {
            this.appendNotification(format("User %s changed their name to %s", oldName, newName), NotificationType.Info);
        }
    };
    Chat.prototype.scrollDown = function () {
        this.$messageContainer.prop("scrollTop", this.$messageContainer.prop("scrollHeight"));
    };
    Chat.prototype.onMessageKeyDown = function (e) {
        if (this.localInputEnabled && e.keyCode == 13) {
            var text = this.$messageInput.val();
            text = $("<p></p>").text(text).html(); // escape HTML to prevent injection
            if (text.length != 0) {
                this.$messageInput.val("");
                var newMessage = new Message(text, this.app.user.id, this.app.user.displayName, new Date().toString());
                this.appendChatMessage(newMessage);
                this.app.hub.server.addMessage(newMessage.serialize());
            }
        }
    };
    Chat.prototype.onMessengerFocus = function (e) {
        this.newMessageNotSeen = false;
    };
    Chat.prototype.onMessengerClick = function (e) {
        this.newMessageNotSeen = false;
    };
    Chat.prototype.onTopBarClick = function (e) {
        if (this.localInputEnabled) {
            if (this.hidden) {
                this.$messenger.removeClass("in");
                this.$messenger.addClass("out");
            }
            else {
                this.$messenger.removeClass("out");
                this.$messenger.addClass("in");
            }
            this.hidden = !this.hidden;
        }
    };
    Chat.prototype.onLatexModalToggle = function (e) {
        this.$latexInput.val(this.$messageInput.val());
        this.updateRenderedLatex();
        this.$latexPreviewModal.modal("show");
    };
    Chat.prototype.onLatexModalKeyUp = function (e) {
        this.updateRenderedLatex();
    };
    Chat.prototype.onLatexSaveClick = function (e) {
        this.$messageInput.val(this.$latexInput.val());
        this.$latexPreviewModal.modal("hide");
        this.$latexInput.val("");
        this.updateRenderedLatex();
    };
    Chat.prototype.onNameChangeToggle = function (e) {
        this.$nameChangeModal.modal("show");
        e.stopPropagation();
    };
    Chat.prototype.onSaveNameClick = function (e) {
        var newName = this.$nameChangeInput.val();
        this.app.user.displayName = newName;
        this.app.hub.server.changeName(newName);
        this.appendNotification(format("You changed your name to \"%s\"", newName), NotificationType.Info);
        this.$nameChangeModal.modal("hide");
    };
    Chat.prototype.formatDateForDisplay = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleTimeString();
    };
    Chat.prototype.appendChatMessage = function (message) {
        var element = document.createElement("div");
        var header = document.createElement("div");
        var footer = document.createElement("div");
        var content = document.createElement("div");
        header.classList.add("header");
        footer.classList.add("footer");
        content.classList.add("content");
        element.classList.add("message");
        content.innerHTML = this.convertStringToHtml(message.text);
        var sameSender = false;
        if (this.previousMessage != null && !this.wasPreviousANotification)
            if (message.sender == this.previousMessage.sender) {
                sameSender = true;
                header.innerText = "";
                header.classList.add("emptyHeader");
                element.classList.add("messageUserRepeat");
            }
        var name = document.createElement("div");
        var date = document.createElement("div");
        name.classList.add("name");
        date.classList.add("date");
        name.innerText = message.senderName;
        date.innerText = this.formatDateForDisplay(message.dateSent);
        header.appendChild(name);
        header.appendChild(date);
        element.appendChild(header);
        if (!sameSender) {
            element.appendChild(document.createElement("br"));
        }
        element.appendChild(content);
        element.appendChild(footer);
        this.$messageContainer.append(element);
        this.scrollDown();
        this.previousMessage = message;
        this.wasPreviousANotification = false;
        if (message.sender != this.app.user.id) {
            this.newMessageNotSeen = true;
        }
    };
    Chat.prototype.appendNotification = function (message, type) {
        var element = document.createElement("div");
        var content = document.createElement("div");
        content.classList.add("content");
        element.classList.add("notification");
        switch (type) {
            case NotificationType.Error:
                element.classList.add("error");
                break;
            case NotificationType.Warning:
                element.classList.add("warning");
                break;
            case NotificationType.Info:
                element.classList.add("info");
                break;
        }
        content.innerText = message;
        element.appendChild(content);
        this.$messageContainer.append(element);
        this.scrollDown();
        this.wasPreviousANotification = true;
    };
    Chat.prototype.findEquations = function (text) {
        var result = [];
        var first = -1;
        for (var i = 0; i < text.length; i++) {
            if (text[i] == "`") {
                if (first == -1) {
                    first = i;
                }
                else {
                    result.push({
                        first: first,
                        second: i
                    });
                    first = -1;
                }
            }
        }
        return result;
    };
    Chat.prototype.convertStringToHtml = function (text) {
        try {
            var equations = this.findEquations(text);
            var resultHtml = "";
            var endOfPreviousEquation = -1;
            for (var i = 0; i < equations.length; i++) {
                var currentEquation = equations[i];
                var html = katex.renderToString(text.substring(currentEquation.first + 1, currentEquation.second));
                resultHtml += text.substring(endOfPreviousEquation + 1, currentEquation.first);
                resultHtml += html;
                endOfPreviousEquation = currentEquation.second;
            }
            resultHtml += text.substring(endOfPreviousEquation + 1, text.length);
            if (equations.length == 0) {
                resultHtml = text;
            }
            return resultHtml;
        }
        catch (e) {
            return e.message;
        }
    };
    Chat.prototype.updateRenderedLatex = function () {
        var $input = this.$latexInput;
        var $output = this.$latexOutput;
        var text = $input.val();
        var html = this.convertStringToHtml(text);
        $output.html(html);
    };
    Chat.prototype.initializeFromSnapshot = function (snapshot) {
        var _this = this;
        this.localInputEnabled = true;
        snapshot.messages.forEach(function (message) {
            message = Message.deserialize(message);
            _this.appendChatMessage(message);
        });
        this.appendNotification(format("Welcome, %s!\n(you can click on chat icon to change ur name..)", app.user.displayName), NotificationType.Info);
    };
    Chat.prototype.onUserConnect = function (user) {
        this.appendNotification(format("User %s has connected.", user.displayName), NotificationType.Info);
    };
    Chat.prototype.onUserDisconnect = function (user) {
        this.appendNotification(format("User %s has disconnected.", user.displayName), NotificationType.Info);
    };
    return Chat;
}());
//# sourceMappingURL=chat.js.map