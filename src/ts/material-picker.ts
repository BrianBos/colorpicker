import {ColorPicker} from "./model/colorpicker";
import {TsDom} from "./model/tsdom";
import {IOptions} from "./interface/options";
import {Color} from "./model/color";
import materialPalette from "./palette/material";

class MaterialPicker extends ColorPicker {
    private dragObject: any;
    private shades: any[] = [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 'a700', 'a400', 'a200', 'a100'
    ];
    private shadeContainer: TsDom;
    private shadeCursor: TsDom;
    private shadeValue: TsDom;

    constructor(anchor: string, options = {}) {
        super(anchor, options);
        this.afterShow(); // if inline
    }

    buildLayout(): void {
        this.picker = TsDom.create('div')
            .addClass('colorpicker')
            .addClass('colorpicker-material')
            .attr('id', this.id)
        ;
        let rows = 1;
        materialPalette.forEach((palette: any) => {
            let colors = TsDom.create('div').addClass('colorpicker-material__colors'); // colors row

            for (let colorAlias in palette) {
                let shades = palette[colorAlias];

                for (let shade in shades) {
                    if (this.options.shade == shade) {
                        let shadeColor = shades[shade];
                        let color = TsDom.create('div')
                            .addClass('colorpicker-material__color')
                            .css('background-color', shadeColor)
                            .attr('data-picker-color', shadeColor.toLowerCase())
                            .attr('data-color-alias', colorAlias)
                        ;

                        if (shadeColor.toLowerCase() === '#ffffff' || shadeColor.toLowerCase() === '#fff') {
                            color.addClass('colorpicker-material__color--white');
                        }

                        if (shadeColor.toLowerCase() === this.options.color.toLowerCase()) {
                            color.addClass('is-checked');
                        }

                        colors.append(color);
                    }
                }
            }

            if (materialPalette.length === rows) {
                colors.addClass('is-last');
            }

            this.picker.append(colors);

            rows++;
        });

        let shadeContainer = TsDom.create('div').addClass('colorpicker-material__shade-container'),
            shadeCursor = TsDom.create('div').addClass('colorpicker-material__shade-cursor')
        ;
        shadeContainer.append(shadeCursor);

        let descContainer = TsDom.create('div').addClass('colorpicker-material__desc-container'),
            shadeText = TsDom.create('span').addClass('colorpicker-material__desc-text').text('Shade'),
            shadeValue = TsDom.create('span').addClass('colorpicker-material__desc-value').text(this.options.shade)
        ;
        descContainer.append(shadeText).append(shadeValue);

        this.shadeCursor = shadeCursor;
        this.shadeContainer = shadeContainer;
        this.shadeValue = shadeValue;
        this.picker.append(shadeContainer).append(descContainer);
    }

    bindEvents(): void {
        let self = this;

        this.shadeCursor
            .on('dragstart', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
            })
        ;

        this.shadeContainer
            .on('mousedown', (e: MouseEvent) => {
                if (e.which != 1) {
                    return;
                }

                this.initDragObject(e, self.shadeCursor, self.shadeContainer);
                this.processCursorPosition(this.shadeCursor, this.shadeContainer, this.dragObject.shiftX);
            })
        ;

        this.picker.on('click', (e: Event) => {
            let srcElement = TsDom.select(e.target);

            if (srcElement.hasClass('colorpicker-material__color')) {
                this.picker.find('.colorpicker-material__color').removeClass('is-checked');
                srcElement.addClass('is-checked');
                this.options.color = srcElement.data('picker-color');
                this.dispatchColorChangedEvent();
            }
        });

        TsDom.select(document)
            .on('mousemove', (e: MouseEvent) => {
                if (!this.dragObject) {
                    return;
                }

                let shiftX = this.dragObject.shiftX;
                let moveX = e.clientX - this.dragObject.downX;
                shiftX = moveX + shiftX;

                this.processCursorPosition(this.shadeCursor, this.shadeContainer, shiftX);
            })
            .on('mouseup', (e: MouseEvent) => {
                this.dragObject = null;
            })
        ;
    }

    getColor(): string|object {
        return Color.process(this.options.color).format(this.options.format);
    }

    getColorObject(): Color {
        return Color.process(this.options.color);
    }

    update() {

    }

    refresh() {
        this.afterShow();
    }

    destroy() {
        this.unBindCommonEvents();
        this.picker.remove();
        this.anchor.off('focus');
        this.anchor.off('click');
    }

    protected updateColorsByShade() {
        materialPalette.forEach((palette: any) => {
            for (let colorAlias in palette) {
                let shades = palette[colorAlias];

                for (let shade in shades) {
                    if (this.options.shade == shade) {
                        let shadeColor = shades[shade];
                        this.picker
                            .find('[data-color-alias="' + colorAlias + '"]')
                            .css('background-color', shadeColor)
                            .attr('data-picker-color', shadeColor)
                        ;
                    }
                }
            }
        });

        let checkedColor = this.picker.find('.colorpicker-material__color.is-checked');

        if (checkedColor.length()) {
            this.options.color = this.picker
                .find('.colorpicker-material__color.is-checked')
                .data('picker-color')
            ;
            this.dispatchColorChangedEvent(false);
        }
    }

    protected afterShow() {
        let shadesMap = this.generateShadesMap(this.shadeContainer.width(), true);
        this.processCursorPosition(this.shadeCursor, this.shadeContainer, shadesMap.map[this.options.shade]);
    };

    protected initDragObject(e: MouseEvent, cursor: TsDom, container: TsDom) {
        e.stopPropagation();
        e.preventDefault();

        if (e.which != 1) {
            return;
        }

        let shiftX = e.clientX - container.position().left - Math.floor(cursor.width() / 2);

        this.dragObject = {
            elements: {
                cursor: cursor,
                container: container
            },
            downX: e.clientX,
            shiftX: shiftX
        };
    }

    protected processCursorPosition(cursor: TsDom, container: TsDom, shiftX: number) {
        let divX = cursor.width() / 2;

        if ((shiftX + divX) < 0) {
            if (shiftX <= -divX) {
                shiftX = -divX;
            }
        }

        if (shiftX > (container.width() - divX)) {
            shiftX = container.width() - divX;
        }

        let shadesMap = this.generateShadesMap(container.width()),
            closestWidth = this.closestNumber(shiftX, shadesMap.positions)
        ;

        cursor.css('left', closestWidth + 'px');

        let newShade = shadesMap.map[closestWidth];

        if (newShade != this.options.shade) {
            this.options.shade = newShade;
            this.shadeValue.text(newShade);
            this.updateColorsByShade();
        }
    }

    protected generateShadesMap(containerWidth: number, inverse = false) {
        let positions = [];
        let map = [];
        let partWidth = Math.ceil(containerWidth / this.shades.length);

        for (let i = 0; i < this.shades.length; i++) {
            let positionWidth = i * partWidth;
            positions.push(positionWidth);

            if (inverse) {
                map[this.shades[i]] = positionWidth;
            } else {
                map[positionWidth] = this.shades[i];
            }
        }

        return {
            positions: positions,
            map: map
        };
    }

    protected closestNumber(num: number, arr: any[]): number {
        let curr = arr[0];
        let diff = Math.abs (num - curr);

        for (let val = 0; val < arr.length; val++) {
            let newDiff = Math.abs (num - arr[val]);

            if (newDiff < diff) {
                diff = newDiff;
                curr = arr[val];
            }
        }

        return curr;
    }

    protected getPickerCssClassName(): string {
        return 'colorpicker-material';
    }

    protected getDefaultOptions(): IOptions {
        return {
            format: 'hex',
            shade: 500,
            color: '#f44336',
            hideAfterColorChange: true
        };
    }
}

export = MaterialPicker;
