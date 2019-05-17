import {ColorPicker} from "./model/colorpicker";
import {TsDom} from "./model/tsdom";
import {IOptions} from "./interface/options";
import {Color} from "./model/color";

class PalettePicker extends ColorPicker {
    buildLayout(): void {
        this.picker = TsDom.create('div')
            .addClass('colorpicker')
            .addClass('colorpicker-palette')
            .attr('id', this.id)
        ;

        if (this.options.palette.length === 1) {
            this.picker.addClass('colorpicker-palette--plain');
        }

        this.options.palette.forEach((palette) => {
            let colors = TsDom.create('div').addClass('colorpicker-palette__colors'); // colors row

            palette.descendants.forEach((child) => {
                let color = TsDom.create('div')
                    .addClass('colorpicker-palette__color')
                    .css('background-color', child.color)
                    .attr('data-picker-color', child.color.toLowerCase())
                ;

                if (child.color.toLowerCase() === '#ffffff') {
                    color.addClass('colorpicker-palette__color--white');
                }

                if (child.color.toLowerCase() === this.options.color.toLowerCase()) {
                    color.addClass('is-checked');
                }

                colors.append(color);
            });

            this.picker.append(colors);
        });
    }

    bindEvents(): void {
        this.picker.on('click', (e: Event) => {
            let srcElement = TsDom.select(e.target);

            if (srcElement.hasClass('colorpicker-palette__color')) {
                this.picker.find('.colorpicker-palette__color').removeClass('is-checked');
                srcElement.addClass('is-checked');
                this.options.color = srcElement.data('picker-color');
                this.dispatchColorChangedEvent();
            }
        });
    }

    getColor(): string|object {
        return Color.process(this.options.color).format(this.options.format);
    }

    getColorObject(): Color {
        return Color.process(this.options.color);
    }

    update() {
        this.picker.find('.colorpicker-palette__color').removeClass('is-checked');
        this.picker.find('[data-picker-color="' + this.options.color.toLowerCase() + '"]').addClass('is-checked');
    }

    refresh() { }

    destroy() {
        this.unBindCommonEvents();
        this.picker.remove();
        this.anchor.off('focus');
        this.anchor.off('click');
    }

    protected getPickerCssClassName(): string {
        return 'colorpicker-palette';
    }

    protected getDefaultOptions(): IOptions {
        return {
            color: '#000000',
            format: 'hex',
            palette: [
                { // first row
                    descendants: [ // row colors
                        {
                            color: '#000000'
                        },
                        {
                            color: '#454545'
                        },
                        {
                            color: '#666666'
                        },
                        {
                            color: '#989898'
                        },
                        {
                            color: '#B6B6B6'
                        },
                        {
                            color: '#CBCBCB'
                        },
                        {
                            color: '#D8D8D8'
                        },
                        {
                            color: '#EEEEEF'
                        },
                        {
                            color: '#F3F3F3'
                        },
                        {
                            color: '#ffffff'
                        }
                    ]
                },
                { // second row
                    descendants: [ // row colors
                        {
                            color: '#970205'
                        },
                        {
                            color: '#FF0309'
                        },
                        {
                            color: '#FF980C'
                        },
                        {
                            color: '#FFFF11'
                        },
                        {
                            color: '#00ff00'
                        },
                        {
                            color: '#1EFFFF'
                        },
                        {
                            color: '#4985E7'
                        },
                        {
                            color: '#150AFF'
                        },
                        {
                            color: '#970AFF'
                        },
                        {
                            color: '#FF0AFF'
                        }
                    ]
                },
                { // third row
                    descendants: [ // row colors
                        {
                            color: '#E6B7AE'
                        },
                        {
                            color: '#F4CBCB'
                        },
                        {
                            color: '#FCE4CC'
                        },
                        {
                            color: '#FFF2CB'
                        },
                        {
                            color: '#D8E9D2'
                        },
                        {
                            color: '#CFDFE2'
                        },
                        {
                            color: '#C7D9F8'
                        },
                        {
                            color: '#CDE1F3'
                        },
                        {
                            color: '#D8D1E8'
                        },
                        {
                            color: '#EAD0DB'
                        },
                    ]
                },
                {
                    descendants: [
                        {
                            color: '#DD7D6B'
                        },
                        {
                            color: '#EA9898'
                        },
                        {
                            color: '#F9CA9B'
                        },
                        {
                            color: '#FFE498'
                        },
                        {
                            color: '#B4D6A7'
                        },
                        {
                            color: '#A0C3C8'
                        },
                        {
                            color: '#A2C1F4'
                        },
                        {
                            color: '#9DC4E7'
                        },
                        {
                            color: '#B2A6D5'
                        },
                        {
                            color: '#D4A5BC'
                        }
                    ]
                },
                {
                    descendants: [
                        {
                            color: '#CC432A'
                        },
                        {
                            color: '#E06666'
                        },
                        {
                            color: '#F6B06B'
                        },
                        {
                            color: '#FFD866'
                        },
                        {
                            color: '#91C37C'
                        },
                        {
                            color: '#75A4AD'
                        },
                        {
                            color: '#6B9DEA'
                        },
                        {
                            color: '#6DA7DB'
                        },
                        {
                            color: '#8D7BC2'
                        },
                        {
                            color: '#C17A9F'
                        }
                    ]
                },
                {
                    descendants: [
                        {
                            color: '#A52206'
                        },
                        {
                            color: '#CC0207'
                        },
                        {
                            color: '#E6903B'
                        },
                        {
                            color: '#F1C136'
                        },
                        {
                            color: '#69A650'
                        },
                        {
                            color: '#46808D'
                        },
                        {
                            color: '#3C77D7'
                        },
                        {
                            color: '#3D84C5'
                        },
                        {
                            color: '#674FA5'
                        },
                        {
                            color: '#A54E78'
                        }
                    ]
                },
                {
                    descendants: [
                        {
                            color: '#842514'
                        },
                        {
                            color: '#980205'
                        },
                        {
                            color: '#B35F10'
                        },
                        {
                            color: '#BE8F0B'
                        },
                        {
                            color: '#3A7523'
                        },
                        {
                            color: '#18505C'
                        },
                        {
                            color: '#1156CB'
                        },
                        {
                            color: '#0E5493'
                        },
                        {
                            color: '#382274'
                        },
                        {
                            color: '#733855'
                        }
                    ]
                },
                {
                    descendants: [
                        {
                            color: '#5C1603'
                        },
                        {
                            color: '#660104'
                        },
                        {
                            color: '#78410D'
                        },
                        {
                            color: '#7E6007'
                        },
                        {
                            color: '#2B4F1A'
                        },
                        {
                            color: '#13373F'
                        },
                        {
                            color: '#204786'
                        },
                        {
                            color: '#0D3A63'
                        },
                        {
                            color: '#25194E'
                        },
                        {
                            color: '#4E1833'
                        }
                    ]
                }
            ],
            hideAfterColorChange: true
        };
    }
}

export = PalettePicker;
