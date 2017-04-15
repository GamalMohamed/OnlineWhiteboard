var ToolBox = (function () {
    function ToolBox(app) {
        var _this = this;
        this.colors = [
            "#E35252",
            "#E352B5",
            "#D252E3",
            "#A252E3",
            "#7852E3",
            "#5752E3",
            "#5274E3",
            "#5291E3",
            "#52CBE3",
            "#52E3DC",
            "#52E3AE",
            "#52E36C",
            "#9DE352",
            "#C3E352",
            "#E3D252",
            "#E3A652",
            "#E36552",
            "#E83535",
            "#961E1E",
            "#961E7A",
            "#521E96",
            "#1E4296",
            "#FFFFFF",
            "#9C9C9C",
            "#000000",
        ];
        this.app = app;
        this.currentColor = "black";
        this.$optionsBlind = $("#optionsBlind");
        this.$toolBox = $("#toolbox");
        this.$eraser = $("#eraser");
        this.$drawer = $("#drawer");
        this.$colors = $("#colors");
        this.$thicknessToggle = $("#thickness");
        this.$clear = $("#clear");
        this.$thicknessValue = $("#thicknessValue");
        this.$thicknessSlider = $("#thicknessSlider");
        this.createColors();
        this.createSizeSlider();
        this.$eraser.click(function () { _this.setEraseTool(true); });
        this.$drawer.click(function () { _this.setDrawTool(true); });
        this.$colors.click(function () { _this.toggleColorPicker(); });
        this.$thicknessToggle.click(function () { _this.toggleThicknessPicker(); });
        this.$clear.click(function () { _this.clear(); });
        this.$optionsBlind.click(function () { _this.onBlindClick(); });
        this.$thicknessSlider.on("input", function (e) { _this.onThicknessChange(e); });
        // for internet explorer >.>
        this.$thicknessSlider[0].addEventListener("input", function (e) { _this.onThicknessChange(e); });
    }
    ToolBox.prototype.createColors = function () {
        var $colorPicker = $("#colorPicker");
        $colorPicker.offset({
            left: this.$colors.offset().left,
            top: this.$colors.offset().top + this.$colors.height() + 2
        });
        for (var i = 0; i < this.colors.length; i++) {
            var color = document.createElement("div");
            color.classList.add("color");
            color.style.backgroundColor = this.colors[i];
            $colorPicker.append(color);
            this.addColorPickerListener(color, this.colors[i]);
        }
    };
    ToolBox.prototype.hideAllOptionsWindows = function () {
        this.$colors.removeClass("selected");
        $("#colorPicker").addClass("hidden");
        this.$thicknessToggle.removeClass("selected");
        $("#thicknessPicker").addClass("hidden");
    };
    ToolBox.prototype.onBlindClick = function () {
        this.hideAllOptionsWindows();
        this.$optionsBlind.css("visibility", "hidden");
    };
    ToolBox.prototype.showOptionsBlind = function () {
        this.$optionsBlind.css("visibility", "visible");
    };
    ToolBox.prototype.createSizeSlider = function () {
        var $size = $("#thicknessPicker");
        $size.offset({
            left: this.$thicknessToggle.offset().left,
            top: this.$thicknessToggle.offset().top + this.$thicknessToggle.height() + 2
        });
    };
    ToolBox.prototype.onThicknessChange = function (e) {
        var value = e.target["valueAsNumber"];
        this.$thicknessValue.text(e.target["valueAsNumber"]);
        this.app.canvas.userTool.behavior.thickness = value;
        this.app.canvas.userTool.applyStyles(this.app.canvas.userTool.bufferContext);
    };
    ToolBox.prototype.setThicknessDisplay = function (value) {
        this.$thicknessValue.text(value);
        this.$thicknessSlider.val(value.toString());
    };
    ToolBox.prototype.addColorPickerListener = function (element, color) {
        var _this = this;
        $(element).click(function () {
            _this.currentColor = color;
            if (_this.app.canvas.userTool.behavior.name != "erase") {
                _this.app.canvas.userTool.behavior.color = color;
            }
            _this.app.canvas.userTool.applyStyles(_this.app.canvas.userTool.bufferContext);
        });
    };
    ToolBox.prototype.clear = function () {
        this.app.hub.server.onClear();
        this.app.canvas.clear();
    };
    ToolBox.prototype.toggleColorPicker = function () {
        this.$colors.toggleClass("selected");
        $("#colorPicker").toggleClass("hidden");
        this.showOptionsBlind();
    };
    ToolBox.prototype.toggleThicknessPicker = function () {
        this.$thicknessToggle.toggleClass("selected");
        $("#thicknessPicker").toggleClass("hidden");
        this.showOptionsBlind();
    };
    ToolBox.prototype.deselectAllTools = function () {
        var children = this.$toolBox.find("#tools").children();
        for (var i = 0; i < children.length; i++) {
            children[i].classList.remove("selected");
        }
    };
    ToolBox.prototype.setEraseTool = function (updateServer) {
        this.deselectAllTools();
        this.$eraser.addClass("selected");
        this.app.canvas.userTool.setBehavior(new EraseBehavior(this.app.canvas.userTool));
        if (updateServer) {
            this.app.hub.server.onToolChange("erase");
        }
        this.setThicknessDisplay(this.app.canvas.userTool.behavior.thickness);
    };
    ToolBox.prototype.setDrawTool = function (updateServer) {
        this.deselectAllTools();
        this.$drawer.addClass("selected");
        this.app.canvas.userTool.setBehavior(new DrawBehavior(this.app.canvas.userTool));
        if (updateServer) {
            this.app.hub.server.onToolChange("draw");
        }
        this.setThicknessDisplay(this.app.canvas.userTool.behavior.thickness);
    };
    ToolBox.prototype.setTool = function (toolName, updateServer) {
        switch (toolName) {
            case "erase":
                this.setEraseTool(updateServer);
                break;
            case "draw":
                this.setDrawTool(updateServer);
                break;
        }
    };
    return ToolBox;
}());
//# sourceMappingURL=toolbox.js.map