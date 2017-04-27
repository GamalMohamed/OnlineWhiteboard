interface JQuery {
    modal(...args);
}

declare var katex;

enum NotificationType {
    Error,
    Warning,
    Info
}

class Chat {
    public localInputEnabled: boolean = false;
    public networkInputEnabled: boolean = true;

    private $messengerTopBar: JQuery; // the element which rests in the top part of the messenger. used to toggled visibility of the messenger
    private $messageContainer: JQuery; // element into which all messages are placed
    private $messageInput: JQuery; // input element where the user types in messages
    private $messengerVisibileToggle: JQuery; // element which when clicked toggles the visiblity of the chat messenger
    private $messenger: JQuery; // the parent element which contains all messenger elements
    private $nameChangeModal: JQuery;
    private $nameChangeInput: JQuery;
    private $nameChangeToggle: JQuery;
    private $saveNameButton: JQuery;

    private previousMessage: Message;
    private wasPreviousANotification: boolean = false;

    private app: Application;

    private defaultMessengerWidth: string;
    private hidden: boolean = false;
    private newMessageNotSeen = false;
    private messengerFlashLength = 500;

    constructor(app: Application) {
        this.app = app;

        this.$messengerTopBar = $("#messengerTopBar");
        this.$messageContainer = $("#messageContainer");
        this.$messageInput = $("#messageInput");
        this.$messengerVisibileToggle = $("#switchButton");
        this.$messenger = $("#messenger");
        this.$nameChangeModal = $("#nameChangeModal");
        this.$nameChangeInput = $("#nameChangeInput");
        this.$nameChangeToggle = $("#nameChangeToggle");
        this.$saveNameButton = $("#saveNameButton");

        this.defaultMessengerWidth = this.$messageContainer.width() + "px";

        this.previousMessage = null;

        this.$messageInput.keydown(e => { this.onMessageKeyDown(e); });
        this.$messageInput.focus(e => { this.onMessengerFocus(e); });
        this.$messenger.click(e => { this.onMessengerClick(e); });
        this.$messengerTopBar.click(e => { this.onTopBarClick(e); });
        this.$nameChangeToggle.click(e => { this.onNameChangeToggle(e); });
        this.$saveNameButton.click(e => { this.onSaveNameClick(e); });
        setInterval(() => { this.onMessageFlash(); }, this.messengerFlashLength);
        this.app.hub.client.addMessage = (message: Message) => { this.onMessage(message); };
        this.app.hub.client.onNameChange = (oldName: string, newName: string) => { this.onNameChange(oldName, newName); };
    }

    private onMessageFlash() {
        if (this.newMessageNotSeen) {
            this.$messengerTopBar.toggleClass("flashing");
        }
        else {
            this.$messengerTopBar.removeClass("flashing");
        }
    }

    private onMessage(message: Message) {
        if (this.networkInputEnabled) {
            message = Message.deserialize(message);

            this.appendChatMessage(message);
        }
    }

    private onNameChange(oldName: string, newName: string) {
        if (this.networkInputEnabled) {
            this.appendNotification(format("User %s changed their name to %s", oldName, newName), NotificationType.Info);
        }
    }

    private scrollDown(): void {
        this.$messageContainer.prop("scrollTop", this.$messageContainer.prop("scrollHeight"));
    }

    private onMessageKeyDown(e: JQueryKeyEventObject): void {
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
    }

    private onMessengerFocus(e: JQueryEventObject) {
        this.newMessageNotSeen = false;
    }

    private onMessengerClick(e: JQueryMouseEventObject) {
        this.newMessageNotSeen = false;
    }

    private onTopBarClick(e: JQueryMouseEventObject) {
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
    }

    private onNameChangeToggle(e: JQueryMouseEventObject) {
        this.$nameChangeModal.modal("show");

        e.stopPropagation();
    }

    private onSaveNameClick(e: JQueryMouseEventObject) {
        var newName = this.$nameChangeInput.val();

        this.app.user.displayName = newName;
        this.app.hub.server.changeName(newName);

        this.appendNotification(format("You changed your name to \"%s\"", newName), NotificationType.Info);

        this.$nameChangeModal.modal("hide");
    }

    private formatDateForDisplay(dateString: string): string {
        var date = new Date(dateString);

        return date.toLocaleTimeString();
    }

    private appendChatMessage(message: Message): void {
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
    }

    private appendNotification(message: string, type: NotificationType): void {
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
    }

    private findEquations(text): Array<{ first: number; second: number }> {
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
    }

    private convertStringToHtml(text): string {
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
    }

    public initializeFromSnapshot(snapshot: BoardSnapshot): void {
        this.localInputEnabled = true;

        snapshot.messages.forEach(message => {
            message = Message.deserialize(message);

            this.appendChatMessage(message);
        });

        this.appendNotification(format("Welcome, %s!\n(you can click on chat icon to change ur name..)", app.user.displayName), NotificationType.Info);
    }

    public onUserConnect(user: UserInfo): void {
        this.appendNotification(format("User %s has connected.", user.displayName), NotificationType.Info);
    }

    public onUserDisconnect(user: UserInfo): void {
        this.appendNotification(format("User %s has disconnected.", user.displayName), NotificationType.Info);
    }
} 