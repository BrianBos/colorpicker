import {ColorPicker} from "./model/colorpicker";
import {IOptions} from "./interface/options";
import {Color} from "./model/color";
import {TsDom} from "./model/tsdom";
const nearestColor = require('nearest-color');

class DefaultPicker extends ColorPicker {
    private dragObject: any;
    private currentColor: Color;
    private spectrumColor: Color;
    private hueColor: Color;
    private spectrumCursor: TsDom;
    private spectrumContainer: TsDom;
    private spectrumCanvas: TsDom;
    private hueCursor: TsDom;
    private hueContainer: TsDom;
    private hueCanvas: TsDom;
    private opacityCursor: TsDom;
    private opacityContainer: TsDom;
    private opacityCanvas: TsDom;
    private hexInput: TsDom; // hex input
    private rInput: TsDom; // red input
    private gInput: TsDom; // green input
    private bInput: TsDom; // blue input
    private aInput: TsDom; // alpha (opacity) input
    private history: TsDom;

    buildLayout(): void {
        if (this.options.hexOnly) {
            this.options.history.placeholdersAmount = 9;
            this.options.format = 'hex';
        }

        this.picker = TsDom.create('div')
            .addClass('colorpicker')
            .addClass('colorpicker-default')
            .attr('id', this.id)
        ;
        let body = TsDom.create('div').addClass('colorpicker-default__body'),
            footer = TsDom.create('div').addClass('colorpicker-default__info')
        ;

        if (this.options.hideInfo) {
            footer.addClass('colorpicker-default__info--hidden');
        }

        // build spectrum block
        this.spectrumContainer = TsDom.create('div').addClass('colorpicker-default__spectrum-container');
        this.spectrumCanvas = TsDom.create('canvas').addClass('colorpicker-default__spectrum-canvas');
        this.spectrumCursor = TsDom.create('div').addClass('colorpicker-default__spectrum-cursor');
        this.spectrumContainer.append(this.spectrumCanvas).append(this.spectrumCursor);

        // build hue block
        this.hueContainer = TsDom.create('div').addClass('colorpicker-default__hue-container');
        this.hueCanvas = TsDom.create('canvas').addClass('colorpicker-default__hue-canvas');
        this.hueCursor = TsDom.create('div').addClass('colorpicker-default__hue-cursor');
        this.hueContainer.append(this.hueCanvas).append(this.hueCursor);

        // build opacity block
        this.opacityContainer = TsDom.create('div').addClass('colorpicker-default__opacity-container');
        this.opacityCanvas = TsDom.create('canvas').addClass('colorpicker-default__opacity-canvas');
        this.opacityCursor = TsDom.create('div').addClass('colorpicker-default__opacity-cursor');

        // build hex input
        let hexInputContainer = TsDom.create('div').addClass('colorpicker-default__hex-input-container'),
            hexText = TsDom.create('div')
            .addClass('colorpicker-default__hex-text')
            .text('hex')
        ;
        this.hexInput = TsDom.create('input')
            .addClass('colorpicker-default__hex-input')
            .attr('maxlength', 7)
        ;
        hexInputContainer.append(this.hexInput).append(hexText);

        // build red input
        let rInputContainer = TsDom.create('div').addClass('colorpicker-default__r-input-container'),
            rText = TsDom.create('div').addClass('colorpicker-default__r-text').text('r')
        ;
        this.rInput = TsDom.create('input')
            .addClass('colorpicker-default__r-input')
            .attr('maxlength', 3)
        ;
        rInputContainer.append(this.rInput).append(rText);

        // build green input
        let gInputContainer = TsDom.create('div').addClass('colorpicker-default__g-input-container'),
            gText = TsDom.create('div').addClass('colorpicker-default__g-text').text('g')
        ;
        this.gInput = TsDom.create('input')
            .addClass('colorpicker-default__g-input')
            .attr('maxlength', 3)
        ;
        gInputContainer.append(this.gInput).append(gText);

        // build blue input
        let bInputContainer = TsDom.create('div').addClass('colorpicker-default__b-input-container'),
            bText = TsDom.create('div').addClass('colorpicker-default__b-text').text('b')
        ;
        this.bInput = TsDom.create('input')
                .addClass('colorpicker-default__b-input')
                .attr('maxlength', 3)
        ;
        bInputContainer.append(this.bInput).append(bText);

        // build opacity input
        let aInputContainer = TsDom.create('div').addClass('colorpicker-default__a-input-container');
        this.aInput = TsDom.create('input')
            .addClass('colorpicker-default__a-input')
            .attr('maxlength', 4)
        ;
        let aText = TsDom.create('div').addClass('colorpicker-default__a-text').text('a');
        aInputContainer.append(this.aInput).append(aText);

        this.history = TsDom.create('div').addClass('colorpicker-default__history');

        if (this.options.history.hidden) {
            this.history.addClass('is-hidden');
        }

        let addHistoryItem = TsDom.create('div')
            .addClass('colorpicker-default__history-item')
            .addClass('is-add-new')
        ;
        this.history.append(addHistoryItem);

        this.options.history.colors.forEach(color => {
            let historyItem = TsDom.create('div')
                .addClass('colorpicker-default__history-item')
                .addClass('has-color')
                .css('background', color)
                .attr('data-history-color', (new Color(color).rgba))
            ;
            this.history.append(historyItem);
        });

        for (let i = 0; i < this.options.history.placeholdersAmount - this.options.history.colors.length; i++) {
            let emptyHistoryItem = TsDom.create('div')
                .addClass('colorpicker-default__history-item')
                .addClass('is-empty')
                .attr('data-history-color', '')
            ;
            this.history.append(emptyHistoryItem);
        }

        this.opacityContainer
            .append(this.opacityCanvas)
            .append(this.opacityCursor)
        ;
        body.append(this.spectrumContainer)
            .append(this.hueContainer)
            .append(this.opacityContainer)
        ;
        footer
            .append(hexInputContainer)
            .append(rInputContainer)
            .append(gInputContainer)
            .append(bInputContainer)
            .append(aInputContainer)
        ;
        this.picker.append(body).append(footer).append(this.history);
    }

    bindEvents(): void {
        let self = this;

        this.spectrumCursor
            .on('dragstart', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
            })
        ;

        this.spectrumContainer
            .on('mousedown', (e: MouseEvent) => {
                if (e.which != 1) {
                    return;
                }

                this.initDragObject(e, self.spectrumCursor, self.spectrumCanvas);
                this.processCursorPosition(
                    this.spectrumCursor, this.spectrumCanvas, this.dragObject.shiftX, this.dragObject.shiftY
                );
                this.spectrumColor = this.setCursorColorFromCursorPosition(
                    this.spectrumCursor, this.spectrumCanvas, this.dragObject.shiftX, this.dragObject.shiftY
                );
                this.setOpacityGradientAndCursorColor();
                this.setColorValuesToInputs();
                this.dispatchColorChangedEvent();
            })
        ;

        this.hueContainer
            .on('mousedown', (e: MouseEvent) => {
                if (e.which != 1) {
                    return;
                }

                this.initDragObject(e, this.hueCursor, this.hueCanvas);
                this.dragObject.processShiftX = false;
                this.processCursorPosition(
                    self.hueCursor, self.hueCanvas, self.dragObject.shiftX, self.dragObject.shiftY, self.dragObject.processShiftX
                );
                this.hueColor = this.setCursorColorFromCursorPosition(
                    self.hueCursor, self.hueCanvas, self.dragObject.shiftX, self.dragObject.shiftY
                );
                this.fillSpectrumCanvas();
                let cursorCoords = this.getCursorCoords(this.spectrumCursor);
                this.spectrumColor = this.setCursorColorFromCursorPosition(
                    self.spectrumCursor,
                    self.spectrumCanvas,
                    cursorCoords.shiftX,
                    cursorCoords.shiftY
                );
                this.fillOpacityCanvas();
                this.setOpacityGradientAndCursorColor();
                this.setColorValuesToInputs();
                this.dispatchColorChangedEvent();
            })
        ;

        this.opacityContainer
            .on('mousedown', (e: MouseEvent) => {
                if (e.which != 1) {
                    return;
                }

                this.initDragObject(e, this.opacityCursor, this.opacityCanvas);
                this.dragObject.processShiftX = false;
                this.processCursorPosition(
                    self.opacityCursor, self.opacityCanvas, self.dragObject.shiftX, self.dragObject.shiftY, self.dragObject.processShiftX
                );
                this.changeAInputValue(self.dragObject.shiftY);
                this.setCursorColorFromCursorPosition(
                    self.opacityCursor, self.opacityCanvas, self.dragObject.shiftX, self.dragObject.shiftY, +this.aInput.val()
                );
                this.dispatchColorChangedEvent();
            })
        ;

        this.hexInput
            .on('keyup', (e: Event) => {
                let value = this.hexInput.val();
                let isValid  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);

                if (isValid) {
                    this.spectrumColor = Color.process(value);
                    this.setHueCursorPosition();
                    this.fillSpectrumCanvas();
                    this.fillOpacityCanvas();
                    this.setSpectrumCursorPositionByColor(this.spectrumColor);
                    this.setOpacityGradientAndCursorColor();
                    this.rInput.val(this.spectrumColor.source.rgba.r);
                    this.gInput.val(this.spectrumColor.source.rgba.g);
                    this.bInput.val(this.spectrumColor.source.rgba.b);
                    this.dispatchColorChangedEvent();
                }
            })
        ;

        this.rInput
            .on('keyup', (e: Event) => {
                this.onChangeInputValue(this.rInput);
            })
        ;

        this.gInput
            .on('keyup', (e: Event) => {
                this.onChangeInputValue(this.gInput);
            })
        ;

        this.bInput
            .on('keyup', (e: Event) => {
                this.onChangeInputValue(this.bInput);
            })
        ;

        this.aInput.on('keyup', (e: Event) => {
            let opacity = this.aInput.val();
            let isValid = opacity.match(/^\d*(\.\d+)?$/);

            if (isValid && (opacity >= 0 && opacity <= 1)) {
                this.setOpacityCursorPosition(opacity);
                this.dispatchColorChangedEvent();
            }
        });

        TsDom.select(document)
            .on('mousemove', (e: MouseEvent) => {
                if (!this.dragObject) {
                    return;
                }

                let shiftX = this.dragObject.shiftX;
                let shiftY = this.dragObject.shiftY;

                if (this.dragObject.processShiftX) {
                    let moveX = e.clientX - this.dragObject.downX;
                    shiftX = moveX + this.dragObject.shiftX;
                }

                if (this.dragObject.processShiftY) {
                    let moveY = e.clientY - this.dragObject.downY;
                    shiftY = moveY + this.dragObject.shiftY;
                }

                this.processCursorPosition(
                    this.dragObject.elements.cursor,
                    this.dragObject.elements.canvas,
                    shiftX,
                    shiftY,
                    this.dragObject.processShiftX,
                    this.dragObject.processShiftY
                );

                // If drag main cursor
                if (this.dragObject.elements.cursor.hasClass('colorpicker-default__spectrum-cursor')) {
                    this.spectrumColor = this.setCursorColorFromCursorPosition(
                        this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY
                    );
                    this.setOpacityGradientAndCursorColor();
                    this.setColorValuesToInputs();
                    this.dispatchColorChangedEvent();
                } else if (this.dragObject.elements.cursor.hasClass('colorpicker-default__hue-cursor')) {
                    this.hueColor = this.setCursorColorFromCursorPosition(
                        self.hueCursor, self.hueCanvas, shiftX, shiftY
                    );
                    this.fillSpectrumCanvas();
                    let cursorCoords = this.getCursorCoords(this.spectrumCursor);
                    this.spectrumColor = this.setCursorColorFromCursorPosition(
                        self.spectrumCursor,
                        self.spectrumCanvas,
                        cursorCoords.shiftX,
                        cursorCoords.shiftY
                    );
                    this.fillOpacityCanvas();
                    this.setOpacityGradientAndCursorColor();
                    this.setColorValuesToInputs();
                    this.dispatchColorChangedEvent();
                } else if (this.dragObject.elements.cursor.hasClass('colorpicker-default__opacity-cursor')) {
                    this.changeAInputValue(shiftY);
                    this.setCursorColorFromCursorPosition(
                        self.opacityCursor, self.opacityCanvas, shiftX, shiftY, +this.aInput.val()
                    );
                    this.dispatchColorChangedEvent();
                }
            })
            .on('mouseup', (e: MouseEvent) => {
                this.dragObject = null;
            })
        ;

        this.history.find('.is-add-new').on('click', (e: MouseEvent) => {
            let currentColor = this.getColorObject().rgba;
            let isAdded = false;

            if (this.history.find('.is-empty').length()) {
                this.history
                    .find('.is-empty')
                    .each((item: HTMLElement) => {
                        let element = TsDom.select(item);
                        let isColorAlreadyAdded = this.history.find('[data-history-color="' + currentColor + '"]').length();

                        if (isColorAlreadyAdded) {
                            isAdded = true;
                        }

                        if (!element.data('history-color') && !isAdded) {
                            isAdded = true;
                            element
                                .css('background', currentColor)
                                .attr('data-history-color', currentColor)
                                .removeClass('is-empty')
                                .addClass('has-color')
                            ;
                        }
                    })
                ;
            } else {
                let isColorAlreadyAdded = this.history.find('[data-history-color="' + currentColor + '"]').length();

                if (!isColorAlreadyAdded) {
                    let newHistoryItem = TsDom.create('div')
                        .addClass('colorpicker-default__history-item')
                        .addClass('has-color')
                        .css('background', currentColor)
                        .attr('data-history-color', currentColor)
                    ;
                    this.history.append(newHistoryItem);
                }
            }
        });

        this.history.on('click', (e: MouseEvent) => {
           let item = TsDom.select(e.target);

           if (item.hasClass('has-color')) {
               let color = item.data('history-color');
               this.setColor(color);
               this.dispatchColorChangedEvent();
           }
        });

        this.picker
            .on('contextmenu', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();

                return false;
            })
        ;
    }

    refresh() {

    }

    destroy() {
        this.unBindCommonEvents();
        this.picker.remove();
        this.anchor.off('focus');
        this.anchor.off('click');
    }

    /**
     * Change r,g,b input
     * @param {TsDom} input
     */
    protected onChangeInputValue(input: TsDom) {
        let value = +input.val();

        if (value >= 0 && value <= 255) {
            this.spectrumColor = Color.process(this.getColorFromInputs());
            this.setHueCursorPosition();
            this.fillSpectrumCanvas();
            this.fillOpacityCanvas();
            this.spectrumColor = this.setSpectrumCursorPositionByColor(this.spectrumColor);
            this.hexInput.val(this.spectrumColor.hex);
            this.setOpacityGradientAndCursorColor();
            this.dispatchColorChangedEvent();
        }
    }

    protected getColorFromInputs(): string {
        return 'rgba(' + this.rInput.val() +', ' + this.gInput.val() + ', ' + this.bInput.val() + ', ' + this.aInput.val() + ')';
    }

    protected getCursorCoords(cursor: TsDom) {
        return {
            shiftX: cursor.offset().left + Math.floor(cursor.width() / 2),
            shiftY: cursor.offset().top + Math.floor(cursor.height() / 2)
        };
    }

    protected setOpacityGradientAndCursorColor() {
        let opacity = +this.aInput.val();
        let shiftY = +(this.opacityCanvas.height() * opacity).toFixed(0) - (this.opacityCursor.height() / 2);
        let shiftX = (this.opacityCanvas.width() / 2) - (this.opacityCursor.width() / 2);
        this.fillOpacityCanvas();
        this.setCursorColorFromCursorPosition(this.opacityCursor, this.opacityCanvas, shiftX, shiftY, opacity);
    }

    protected initDragObject(e: MouseEvent, cursor: TsDom, canvas: TsDom) {
        e.stopPropagation();
        e.preventDefault();

        if (e.which != 1) {
            return;
        }

        let shiftX = e.clientX - canvas.position().left - Math.floor(cursor.width() / 2),
            shiftY = e.clientY - canvas.position().top - Math.floor(cursor.height() / 2)
        ;

        this.dragObject = {
            elements: {
                cursor: cursor,
                canvas: canvas
            },
            downX: e.clientX,
            downY: e.clientY,
            shiftX: shiftX,
            shiftY: shiftY,
            processShiftX: true,
            processShiftY: true
        };
    }

    protected update() {
        if (this.options.hexOnly) {
            this.picker.addClass('colorpicker-default--hex-only');
        }

        if (!this.options.color) {
            this.options.color = this.options.defaultColor;
        }

        if (Color.process(this.options.color).isValid()) {
            this.processUpdate();
        }
    }

    processUpdate() {
        this.spectrumColor = Color.process(this.options.color);
        this.currentColor = Color.process(this.options.color);
        this.aInput.val(this.spectrumColor.source.rgba.a);
        this.setColorValuesToInputs();

        // important, with and height from css properties don't match
        // you need to set width and height manually to attributes
        this.spectrumCanvas
            .attr('width', this.spectrumCanvas.width())
            .attr('height', this.spectrumCanvas.height())
        ;

        this.spectrumCanvas.get().getContext('2d').clearRect(0, 0, this.spectrumCanvas.width(), this.spectrumCanvas.height());
        this.hueCanvas
            .attr('width', this.hueCanvas.width())
            .attr('height', this.hueCanvas.height())
        ;
        this.opacityCanvas
            .attr('width', this.opacityCanvas.width())
            .attr('height', this.opacityCanvas.height())
        ;
        this.fillHueCanvas();
        this.setHueCursorPosition();
        this.fillSpectrumCanvas();
        this.fillOpacityCanvas();
        this.setSpectrumCursorPositionByColor(this.spectrumColor);
        this.setOpacityCursorPosition(this.spectrumColor.source.rgba.a);
    }

    getColor(): string|object {
        let color = this.spectrumColor ? Color.process(this.getColorFromInputs()) : Color.process(this.options.color);

        if (this.aInput.val()) {
            color.setOpacity(this.aInput.val());
        }

        return color.format(this.options.format);
    }

    getColorObject(): Color {
        return this.spectrumColor ? Color.process(this.getColorFromInputs()) : Color.process(this.options.color);
    }

    protected setSpectrumCursorPositionByColor(color: Color): Color {
        let canvasWidth = this.spectrumCanvas.width();
        let canvasHeight = this.spectrumCanvas.height();
        const hsvColors = color.format('source').hsv;
        let shiftX = Math.floor((canvasWidth / 100) * hsvColors.s);
        let shiftY = canvasHeight - Math.floor((canvasHeight / 100) * hsvColors.v);
        shiftX = shiftX - this.spectrumCursor.width() / 2;
        shiftY = shiftY - this.spectrumCursor.height() / 2;

        this.processCursorPosition(this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY);

        return this.setCursorColorFromCursorPosition(this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY);
    }

    protected setHueCursorPosition(): Color {
        let hueCanvas = this.picker.find('.colorpicker-default__hue-canvas');
        let canvasHeight = hueCanvas.height();
        let canvasContext = hueCanvas.get().getContext('2d');
        let colors: any = [];
        let heightOffsets: any = {};

        for (let i = 0; i < canvasHeight; i++) {
          let colorData = canvasContext.getImageData(0, i, 1, 1).data;
          let hexColor = Color.process(`rgb(${colorData[0]}, ${colorData[1]}, ${colorData[2]})`).format('hex');
          colors.push(hexColor);
          heightOffsets[hexColor] = i;
        }

        this.options.hueColors.forEach(hueColor => {
          colors.push(hueColor.color);
          heightOffsets[hueColor.color] = Math.ceil((canvasHeight / 100) * (hueColor.offset * 100));
        });

        let nearestColorInstance = nearestColor.from(colors);
        let nearestColorValue = nearestColorInstance(this.currentColor.hex);
        this.hueColor = Color.process(nearestColorValue);
        let shiftY = heightOffsets[nearestColorValue];
        let hueCursor = this.picker.find('.colorpicker-default__hue-cursor');
        let shiftX = Math.ceil(hueCanvas.width() / 2) - Math.ceil(hueCursor.width() / 2);
        this.processCursorPosition(hueCursor, hueCanvas, shiftX, shiftY);

        return this.setCursorColorFromCursorPosition(hueCursor, hueCanvas, shiftX, shiftY);
    }

    protected setOpacityCursorPosition(opacity: number): Color {
        let shiftY = +(this.opacityCanvas.height() * opacity).toFixed(0);
        shiftY = shiftY - (this.opacityCursor.height() / 2);
        let shiftX = Math.ceil(this.opacityCanvas.width() / 2) - Math.ceil(this.opacityCursor.width() / 2);
        this.processCursorPosition(this.opacityCursor, this.opacityCanvas, shiftX, shiftY);

        return this.setCursorColorFromCursorPosition(this.opacityCursor, this.opacityCanvas, shiftX, shiftY, +this.aInput.val());
    }

    protected fillSpectrumCanvas() {
        let canvasWidth = this.spectrumCanvas.width();
        let canvasHeight = this.spectrumCanvas.height();
        let canvasContext = this.spectrumCanvas.get().getContext('2d');
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        let whiteGradient = canvasContext.createLinearGradient(0, 0, canvasWidth, 0);
        whiteGradient.addColorStop(0, "#fff");
        whiteGradient.addColorStop(.01, "#fff");
        whiteGradient.addColorStop(.99, this.hueColor.rgb);
        whiteGradient.addColorStop(1, this.hueColor.rgb);
        canvasContext.fillStyle = whiteGradient;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

        let blackGradient = canvasContext.createLinearGradient(0, 0, 0, canvasHeight);
        blackGradient.addColorStop(.01, "transparent");
        blackGradient.addColorStop(.99, "#000");
        blackGradient.addColorStop(1, "#000");
        canvasContext.fillStyle = blackGradient;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    protected fillHueCanvas() {
        let canvasContext = this.hueCanvas.get().getContext('2d'),
            multipleGradient = canvasContext.createLinearGradient(0, 0, 0, this.hueCanvas.height())
        ;

        this.options.hueColors.forEach((node: any) => {
            multipleGradient.addColorStop(node.offset, node.color);
        });

        canvasContext.fillStyle = multipleGradient;
        canvasContext.fillRect(0, 0, this.hueCanvas.width(), this.hueCanvas.height());
    }

    protected fillOpacityCanvas() {
        let canvasContext = this.opacityCanvas.get().getContext('2d');
        canvasContext.clearRect(0, 0, this.opacityCanvas.width(), this.opacityCanvas.height());
        let opacityGradient = canvasContext.createLinearGradient(0, 0, 0, this.opacityCanvas.height());
        opacityGradient.addColorStop(0, "transparent");
        opacityGradient.addColorStop(1, this.spectrumColor.rgb);
        canvasContext.fillStyle = opacityGradient;
        canvasContext.fillRect(0, 0, this.opacityCanvas.width(), this.opacityCanvas.height());
    }

    protected setCursorColorFromCursorPosition(
        cursor: TsDom,
        canvas: TsDom,
        shiftX: number,
        shiftY: number,
        opacity: number = 1
    ): Color {
        let canvasContext = canvas.get().getContext('2d'),
            cursorOffsetLeft = Math.ceil(cursor.width() / 2) + shiftX,
            cursorOffsetTop = Math.ceil(cursor.height() / 2) + shiftY
        ;

        if (cursorOffsetLeft <= 0 || (shiftX === 0)) {
            cursorOffsetLeft = 0;
        }

        if (cursorOffsetTop <= 0 || (shiftY === 0)) {
            cursorOffsetTop = 0;
        }

        if (cursorOffsetLeft >= canvas.width()) {
            cursorOffsetLeft = canvas.width() - 1;
        }

        if (cursorOffsetTop >= canvas.height()) {
            cursorOffsetTop = canvas.height() - 1;
        }

        let colorData = canvasContext.getImageData(cursorOffsetLeft, cursorOffsetTop, 1, 1).data;
        let tmpColor = 'rgba(' + colorData[0] + ', ' + colorData[1] + ', ' + colorData[2] + ', ' + opacity + ')';
        let color = Color.process(tmpColor);

        cursor.css('background-color', color.rgba);

        return color;
    }

    public dispatchColorChangedEvent() {
        TsDom.select(this.cssId).trigger('colorpicker:color-change', {
            color: this.getColor().toString()
        });
    }

    protected processCursorPosition(
        cursor: TsDom,
        canvas: TsDom,
        shiftX: number,
        shiftY: number,
        processShiftX: boolean = true,
        processShiftY: boolean = true
    ) {
        if (processShiftX) {
            let divX = cursor.width() / 2;

            if ((shiftX + divX) < 0) {
                if (shiftX <= -divX) {
                    shiftX = -divX;
                }
            }

            if (shiftX > (canvas.width() - divX)) {
                shiftX = canvas.width() - divX;
            }
        } else {
            shiftX = Math.ceil(canvas.width() / 2) - Math.ceil(cursor.width() / 2);
        }

        if (processShiftY) {
            let divY = cursor.height() / 2;

            if ((shiftY + divY) < 0) {
                if (shiftY <= -divY) {
                    shiftY = -divY;
                }
            }

            if (shiftY > (canvas.height() - divY)) {
                shiftY = canvas.height() - divY;
            }
        } else {
            shiftY = Math.ceil(canvas.height() / 2) - Math.ceil(cursor.height() / 2);
        }

        cursor.css('left', shiftX + 'px');
        cursor.css('top',  shiftY + 'px');
    }

    protected changeAInputValue(shiftY: number) {
        let opacity = +((shiftY / this.opacityCanvas.height()).toFixed(2));

        if (opacity <= 0) {
            opacity = 0;
        } else if (opacity >= 1) {
            opacity = 1;
        }

        this.aInput.val(opacity);
    }

    protected setColorValuesToInputs() {
        let color = this.spectrumColor,
            hexColor = color.hex,
            rgbaColor = color.source.rgba
        ;
        this.hexInput.val(hexColor);
        this.rInput.val(rgbaColor.r);
        this.gInput.val(rgbaColor.g);
        this.bInput.val(rgbaColor.b);
    }

    protected getPickerCssClassName(): string {
        return 'colorpicker-default';
    }

    protected getDefaultOptions(): IOptions {
        return {
            defaultColor: '#f00',
            hueColors: [
                {offset: 0, color: '#ff0000'},
                {offset: .17, color: '#ff00ff'},
                {offset: .33, color: '#0000ff'},
                {offset: .5, color: '#00ffff'},
                {offset: .67, color: '#00ff00'},
                {offset: .83, color: '#ffff00'},
                {offset: 1, color: '#ff0000'}
            ]
        };
    }
}

export = DefaultPicker;
