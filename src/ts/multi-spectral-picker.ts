import {ColorPicker} from "./model/colorpicker";
import {IOptions} from "./interface/options";
import {Color} from "./model/color";
import {TsDom} from "./model/tsdom";

class MultiSpectralPicker extends ColorPicker {
    private dragObject: any;
    private spectrumColor: Color;
    private spectrumCursor: TsDom;
    private spectrumContainer: TsDom;
    private spectrumCanvas: TsDom;
    private opacityCursor: TsDom;
    private opacityContainer: TsDom;
    private opacityCanvas: TsDom;
    private history: TsDom;

    buildLayout(): void {
        if (this.options.hexOnly) {
            this.options.format = 'hex';
        }

        this.picker = TsDom.create('div')
            .addClass('colorpicker')
            .addClass('colorpicker-multi-spectral')
            .attr('id', this.id)
        ;
        let body = TsDom.create('div').addClass('colorpicker-multi-spectral__body');

        // build spectrum block
        this.spectrumContainer = TsDom.create('div').addClass('colorpicker-multi-spectral__spectrum-container');
        this.spectrumCanvas = TsDom.create('canvas').addClass('colorpicker-multi-spectral__spectrum-canvas');
        this.spectrumCursor = TsDom.create('div').addClass('colorpicker-multi-spectral__spectrum-cursor');
        this.spectrumContainer.append(this.spectrumCanvas).append(this.spectrumCursor);

        // build opacity block
        this.opacityContainer = TsDom.create('div').addClass('colorpicker-multi-spectral__opacity-container');
        this.opacityCanvas = TsDom.create('canvas').addClass('colorpicker-multi-spectral__opacity-canvas');
        this.opacityCursor = TsDom.create('div').addClass('colorpicker-multi-spectral__opacity-cursor');
        this.opacityContainer.append(this.opacityCanvas).append(this.opacityCursor);

        body.append(this.spectrumContainer).append(this.opacityContainer);

        this.history = TsDom.create('div').addClass('colorpicker-multi-spectral__history');

        if (this.options.history.hidden) {
            this.history.addClass('is-hidden');
        }

        let addHistoryItem = TsDom.create('div')
            .addClass('colorpicker-multi-spectral__history-item')
            .addClass('is-add-new')
        ;
        this.history.append(addHistoryItem);

        this.options.history.colors.forEach(color => {
            let historyItem = TsDom.create('div')
                .addClass('colorpicker-multi-spectral__history-item')
                .addClass('has-color')
                .css('background', color)
                .attr('data-history-color', (new Color(color).rgba))
            ;
            this.history.append(historyItem);
        });

        for (let i = 0; i < this.options.history.placeholdersAmount - this.options.history.colors.length; i++) {
            let emptyHistoryItem = TsDom.create('div')
                .addClass('colorpicker-multi-spectral__history-item')
                .addClass('is-empty')
                .attr('data-history-color', '')
            ;
            this.history.append(emptyHistoryItem);
        }

        this.picker.append(body).append(this.history);
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
                    this.spectrumCursor, this.spectrumCanvas, this.dragObject.shiftX, this.dragObject.shiftY, this.spectrumColor.source.rgba.a
                );
                this.spectrumCursor.css('background-color', this.spectrumColor.rgb);
                this.setOpacityGradientAndCursorColor();
                this.dispatchColorChangedEvent();
            })
        ;

        this.opacityContainer
            .on('mousedown', (e: MouseEvent) => {
                if (e.which != 1) {
                    return;
                }

                this.initDragObject(e, this.opacityCursor, this.opacityCanvas);
                this.dragObject.processShiftY = false;
                this.processCursorPosition(
                    self.opacityCursor, self.opacityCanvas, self.dragObject.shiftX,
                    self.dragObject.shiftY, self.dragObject.processShiftX, self.dragObject.processShiftY
                );
                this.changeOpacityValue(self.dragObject.shiftX);
                this.setCursorColorFromCursorPosition(
                    self.opacityCursor, self.opacityCanvas, self.dragObject.shiftX, self.dragObject.shiftY, this.spectrumColor.source.rgba.a
                );
                this.dispatchColorChangedEvent();
            })
        ;

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

                // If drag spectrum cursor
                if (this.dragObject.elements.cursor.hasClass('colorpicker-multi-spectral__spectrum-cursor')) {
                    this.spectrumColor = this.setCursorColorFromCursorPosition(
                        this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY
                    );
                    this.spectrumCursor.css('background-color', this.spectrumColor.rgb);
                    this.setOpacityGradientAndCursorColor();
                    this.dispatchColorChangedEvent();
                } else if (this.dragObject.elements.cursor.hasClass('colorpicker-multi-spectral__opacity-cursor')) {
                    this.changeOpacityValue(shiftX);
                    this.setCursorColorFromCursorPosition(
                        self.opacityCursor, self.opacityCanvas, shiftX, shiftY, this.spectrumColor.source.rgba.a
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
                        .addClass('colorpicker-multi-spectral__history-item')
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

    getColor(): string|object {
        if (!this.spectrumColor) {
            this.spectrumColor = Color.process(this.options.color);
        }

        return this.spectrumColor.format(this.options.format);
    }

    getColorObject(): Color {
        if (!this.spectrumColor) {
            this.spectrumColor = Color.process(this.options.color);
        }

        return this.spectrumColor;
    }

    refresh() { }

    destroy() {
        this.unBindCommonEvents();
        this.picker.remove();
        this.anchor.off('focus');
        this.anchor.off('click');
    }

    protected changeOpacityValue(shiftX: number) {
        let opacity = +((shiftX / this.opacityCanvas.width()).toFixed(2));

        if (opacity <= 0) {
            opacity = 0;
        } else if (opacity >= 1) {
            opacity = 1;
        }

        this.spectrumColor.setOpacity(opacity);
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

    protected setOpacityGradientAndCursorColor() {
        let opacity = this.spectrumColor.source.rgba.a,
            shiftY = +(this.opacityCanvas.height() * opacity).toFixed(0) - (this.opacityCursor.height() / 2),
            shiftX = (this.opacityCanvas.width() / 2) - (this.opacityCursor.width() / 2)
        ;
        this.fillOpacityCanvas();
        this.setCursorColorFromCursorPosition(this.opacityCursor, this.opacityCanvas, shiftX, shiftY, opacity);
    }

    protected getCursorCoords(cursor: TsDom) {
        return {
            shiftX: cursor.offset().left + Math.floor(cursor.width() / 2),
            shiftY: cursor.offset().top + Math.floor(cursor.height() / 2)
        };
    }

    protected update() {
        if (this.options.history.hidden) {
            this.picker.addClass('colorpicker-multi-spectral--history-hidden');
        }

        if (this.options.hexOnly) {
            this.picker.addClass('colorpicker-multi-spectral--hex-only');
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
        // important, with and height from css properties don't match
        // you need to set width and height manually to attributes
        this.spectrumCanvas
            .attr('width', this.spectrumCanvas.width())
            .attr('height', this.spectrumCanvas.height())
        ;
        this.spectrumCanvas.get().getContext('2d').clearRect(0, 0, this.spectrumCanvas.width(), this.spectrumCanvas.height());
        this.opacityCanvas
            .attr('width', this.opacityCanvas.width())
            .attr('height', this.opacityCanvas.height())
        ;
        this.fillSpectrumCanvas();
        this.fillOpacityCanvas();
        this.setSpectrumCursorPositionByColor(this.spectrumColor);
        this.setOpacityCursorPosition(this.spectrumColor.source.rgba.a);
    }

    protected fillSpectrumCanvas() {
        let canvasWidth = this.spectrumCanvas.width(),
            canvasHeight = this.spectrumCanvas.height(),
            canvasContext = this.spectrumCanvas.get().getContext('2d'),
            g = canvasContext.createLinearGradient(0, 0, canvasWidth, 0)
        ;

        g.addColorStop(0, "rgb(255, 0, 0)");
        g.addColorStop(0.15, "rgb(255, 0, 255)");
        g.addColorStop(0.33, "rgb(0, 0, 255)");
        g.addColorStop(0.49, "rgb(0, 255, 255)");
        g.addColorStop(0.67, "rgb(0, 255, 0)");
        g.addColorStop(0.84, "rgb(255, 255, 0)");
        g.addColorStop(1, "rgb(255, 0, 0)");
        canvasContext.fillStyle = g;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        g = canvasContext.createLinearGradient(0, 1, 0, canvasHeight);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        g.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        g.addColorStop(.99, "rgba(0, 0, 0, 1)");
        g.addColorStop(1, "rgba(0, 0, 0, 1)");

        canvasContext.fillStyle = g;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    protected fillOpacityCanvas() {
        let canvasContext = this.opacityCanvas.get().getContext('2d');
        canvasContext.clearRect(0, 0, this.opacityCanvas.width(), this.opacityCanvas.height());
        let opacityGradient = canvasContext.createLinearGradient(0, 0, this.opacityCanvas.width(), 0);
        opacityGradient.addColorStop(0, "transparent");
        opacityGradient.addColorStop(1, this.spectrumColor.rgb);
        canvasContext.fillStyle = opacityGradient;
        canvasContext.fillRect(0, 0, this.opacityCanvas.width(), this.opacityCanvas.height());
    }

    protected setSpectrumCursorPositionByColor(color: Color): Color {
        let canvasWidth = this.spectrumCanvas.width();
        let canvasHeight = this.spectrumCanvas.height();
        let canvasContext = this.spectrumCanvas.get().getContext('2d');
        let imgData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
        let colors = [];
        let shiftX = 0;
        let shiftY = 0;

        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                let n = (y * canvasWidth + x) * 4;
                colors.push({
                    r: imgData[n],
                    g: imgData[n+1],
                    b: imgData[n+2]
                });
            }
        }

        let minDistance = Number.MAX_SAFE_INTEGER;
        let closestColor;

        for (let i = 0; i < colors.length; i++) {
            let distance = Math.sqrt(
                Math.pow((color.source.rgba.r - colors[i].r), 2) +
                Math.pow((color.source.rgba.g - colors[i].g), 2) +
                Math.pow((color.source.rgba.b - colors[i].b), 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestColor = colors[i];
            }
        }

        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                let n = (y * canvasWidth + x) * 4;

                if ((closestColor.r === imgData[n]) && (closestColor.g === imgData[n+1]) && (closestColor.b === imgData[n+2])) {
                    shiftY = y;
                    shiftX = x;
                    break;
                }
            }
        }

        shiftX = shiftX - this.spectrumCursor.width() / 2;
        shiftY = shiftY - this.spectrumCursor.height() / 2;

        this.processCursorPosition(this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY);

        let newColor = this.setCursorColorFromCursorPosition(this.spectrumCursor, this.spectrumCanvas, shiftX, shiftY);

        this.spectrumCursor.css('background-color', newColor.rgb);

        return newColor;
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

        if (cursorOffsetLeft <= 0) {
            cursorOffsetLeft = 0;
        }

        if (cursorOffsetTop <= 0) {
            cursorOffsetTop = 0;
        }

        if (cursorOffsetLeft >= canvas.width()) {
            cursorOffsetLeft = canvas.width() - 1;
        }

        if (cursorOffsetTop >= canvas.height()) {
            cursorOffsetTop = canvas.height() - 1;
        }

        let colorData = canvasContext.getImageData(cursorOffsetLeft, cursorOffsetTop, 1, 1).data;
        let tmpColor = 'rgba(' + colorData[0] + ', ' + colorData[1] + ', ' + colorData[2] + ', ' + this.spectrumColor.source.rgba.a + ')';

        return Color.process(tmpColor);
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

    protected setOpacityCursorPosition(opacity: number): Color {
        let opacityCursor = this.picker.find('.colorpicker-multi-spectral__opacity-cursor');
        let opacityCanvas = this.picker.find('.colorpicker-multi-spectral__opacity-canvas');
        let shiftX = +(opacityCanvas.width() * opacity).toFixed(0);
        shiftX = shiftX - (opacityCursor.width() / 2);
        let shiftY = Math.ceil(opacityCanvas.height() / 2) - Math.ceil(opacityCursor.height() / 2);
        this.processCursorPosition(opacityCursor, opacityCanvas, shiftX, shiftY);

        return this.setCursorColorFromCursorPosition(opacityCursor, opacityCanvas, shiftX, shiftY, opacity);
    }

    protected getPickerCssClassName(): string {
        return 'colorpicker-multi-spectral';
    }

    protected getDefaultOptions(): IOptions {
        return {
            defaultColor: '#f00'
        };
    }
}

export = MultiSpectralPicker;
