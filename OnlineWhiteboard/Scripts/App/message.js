var Message = (function () {
    function Message(text, sender, senderName, dateSent) {
        this.text = text;
        this.sender = sender;
        this.senderName = senderName;
        this.dateSent = dateSent;
    }
    Message.prototype.serialize = function () {
        return {
            text: this.text,
            sender: this.sender,
            senderName: this.senderName
        };
    };
    Message.deserialize = function (serialized) {
        return new Message(serialized.text, serialized.sender, serialized.senderName, serialized.dateSent);
    };
    return Message;
}());
//# sourceMappingURL=message.js.map