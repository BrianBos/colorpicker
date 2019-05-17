import {ColorPicker} from "./model/colorpicker";
import {_uniqueId} from "./model/helper";
import {TsDom} from "./model/tsdom";
import {IOptions} from "./interface/options";
import {Color} from "./model/color";

class TabPalettePicker extends ColorPicker {
    buildLayout(): void {
        this.picker = TsDom.create('div')
            .addClass('colorpicker')
            .addClass('colorpicker-tab-palette')
            .attr('id', this.id)
        ;
        let header = TsDom.create('div').addClass('colorpicker-tab-palette__header'),
            content = TsDom.create('div').addClass('colorpicker-tab-palette__content'),
            isColorExists = false
        ;

        for (let headerItemIndex in this.options.palette) {
            let tabId = 'colorpicker-tab-palette-tab-' + _uniqueId() + headerItemIndex,
                headerItemOption = this.options.palette[headerItemIndex],
                headerItem = TsDom.create('div')
            ;
            headerItem
                .addClass('colorpicker-tab-palette__header-item')
                .css('background-color', headerItemOption.color)
                .attr('data-picker-color', headerItemOption.color)
                .attr('data-target', tabId)
            ;
            header.append(headerItem);

            let contentTab = TsDom.create('div')
                .addClass('colorpicker-tab-palette__content-tab')
                .attr('id', tabId)
                .attr('data-index', headerItemIndex)
            ;

            headerItemOption.descendants.forEach((row) => {
                let contentRow = TsDom.create('div').addClass('colorpicker-tab-palette' + '__content-row');

                row.descendants.forEach((item) => {
                    let contentItem = TsDom.create('div')
                        .addClass('colorpicker-tab-palette' + '__content-item')
                        .css('background-color', item.color)
                        .attr('data-picker-color', item.color)
                    ;
                    contentRow.append(contentItem);

                    if (item.color.toLowerCase() === this.options.color.toLowerCase()) {
                        isColorExists = true;
                        contentTab.addClass('is-active');
                        contentItem.addClass('is-checked');
                        headerItem.addClass('is-checked');
                    }
                });

                contentTab.append(contentRow);
            });

            content.append(contentTab);
        }

        // If color didn't set in the options
        if (!isColorExists) {
            header.find('.colorpicker-tab-palette__header-item:first-child').addClass('is-checked');
            content.find('.colorpicker-tab-palette__content-tab:first-child').addClass('is-active');
        }

        this.picker.append(header).append(content);
    }

    bindEvents(): void {
        let self = this,
            checkedHeaderItem: TsDom,
            activeContentTab: TsDom,
            dataTargetId: string,
            checkedContentItem: TsDom,
            srcElement: TsDom
        ;

        this.picker.on('click', (e: Event) => {
            srcElement = TsDom.select(e.target);

            if (srcElement.hasClass('colorpicker-tab-palette__header-item')) {
                checkedHeaderItem = TsDom.select(self.cssId + ' .' + 'colorpicker-tab-palette__header-item.is-checked');
                checkedHeaderItem.removeClass('is-checked');
                activeContentTab = TsDom.select(self.cssId + ' .' + 'colorpicker-tab-palette__content-tab.is-active');
                activeContentTab.removeClass('is-active');
                dataTargetId = '#' + srcElement.data('target');
                srcElement.addClass('is-checked');
                TsDom.select(dataTargetId).addClass('is-active');
                self.dispatchRefreshPositionEvent();
            } else if (srcElement.hasClass('colorpicker-tab-palette__content-item')) {
                checkedContentItem = TsDom.select(self.cssId + ' .' + 'colorpicker-tab-palette__content-item.is-checked');
                checkedContentItem.removeClass('is-checked');
                srcElement.addClass('is-checked');
                self.options.color = srcElement.data('picker-color');
                self.dispatchColorChangedEvent();
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
        // Restore active tab
        let checkedContentItem = this.picker.find('.colorpicker-tab-palette__content-item.is-checked');

        if (checkedContentItem.length()) {
            let activeTab = this.picker
                .find('.colorpicker-tab-palette__content-item.is-checked')
                .closest('.colorpicker-tab-palette__content-tab')
            ;
            let tabId = activeTab.attr('id');
            this.picker.find('.colorpicker-tab-palette' + '__header-item').removeClass('is-checked');
            this.picker.find('[data-target="' + tabId + '"]').addClass('is-checked');
            this.picker.find('.colorpicker-tab-palette' + '__content-tab').removeClass('is-active');
            activeTab.addClass('is-active');
        }
    }

    refresh() { }

    destroy() {
        this.unBindCommonEvents();
        this.picker.remove();
        this.anchor.off('focus');
        this.anchor.off('click');
    }

    protected getPickerCssClassName(): string {
        return 'colorpicker-tab-palette';
    }

    protected getDefaultOptions(): IOptions {
        return {
            format: 'hex',
            palette: [
                {
                    color: '#e6315b',
                    descendants: [ //rows
                        {
                            descendants: [
                                { color: '#ffd8e1' },
                                { color: '#fcc4d1' },
                                { color: '#f7a7ba' },
                                { color: '#f287a0' },
                                { color: '#ee6988' },
                                { color: '#e9486e' },
                                { color: '#e5315b' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#e6325c' },
                                { color: '#dd3058' },
                                { color: '#d52e55' },
                                { color: '#c82b50' },
                                { color: '#bc284b' },
                                { color: '#b22648' },
                                { color: '#a92444' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#a92444' },
                                { color: '#a02241' },
                                { color: '#95203c' },
                                { color: '#891d37' },
                                { color: '#7d1b32' },
                                { color: '#71182d' },
                                { color: '#661629' }
                            ]
                        }
                    ]
                },
                {
                    color: '#793183',
                    descendants: [ // rows
                        {
                            descendants: [
                                { color: '#e7b3f1' },
                                { color: '#dca3e7' },
                                { color: '#cf90db' },
                                { color: '#be77cc' },
                                { color: '#ae60bd' },
                                { color: '#a14cb1' },
                                { color: '#a537ba' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#a537ba' },
                                { color: '#a035b4' },
                                { color: '#9933ac' },
                                { color: '#9131a3' },
                                { color: '#892f9a' },
                                { color: '#832d93' },
                                { color: '#7e2b8d' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#822c92' },
                                { color: '#7c288b' },
                                { color: '#712080' },
                                { color: '#681a76' },
                                { color: '#5e136c' },
                                { color: '#560e63' },
                                { color: '#4f095c' }
                            ]
                        }
                    ]
                },
                {
                    color: '#009de7',
                    descendants: [ // rows
                        {
                            descendants: [
                                { color: '#c3edff' },
                                { color: '#a9e6ff' },
                                { color: '#8bddff' },
                                { color: '#5fd0ff' },
                                { color: '#3bc6ff' },
                                { color: '#19bcff' },
                                { color: '#04b6ff' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#01b5ff' },
                                { color: '#01adf5' },
                                { color: '#01a2ea' },
                                { color: '#0198de' },
                                { color: '#008dd1' },
                                { color: '#0084c6' },
                                { color: '#007bbc' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#007bbc' },
                                { color: '#0074b1' },
                                { color: '#006ba3' },
                                { color: '#006295' },
                                { color: '#005987' },
                                { color: '#00517b' },
                                { color: '#00496f' }
                            ]
                        }
                    ]
                },
                {
                    color: '#00b59c',
                    descendants: [ // rows
                        {
                            descendants: [
                                { color: '#8dfeea' },
                                { color: '#7dfbe4' },
                                { color: '#63f4db' },
                                { color: '#4befd2' },
                                { color: '#2de7c6' },
                                { color: '#16e2be' },
                                { color: '#03deb7' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#01ddb6' },
                                { color: '#01d4ae' },
                                { color: '#01c7a4' },
                                { color: '#01b897' },
                                { color: '#01aa8b' },
                                { color: '#019b80' },
                                { color: '#019076' },
                            ]
                        },
                        {
                            descendants: [
                                { color: '#018c73' },
                                { color: '#01836c' },
                                { color: '#017763' },
                                { color: '#016857' },
                                { color: '#005c4e' },
                                { color: '#005044' },
                                { color: '#004239' }
                            ]
                        }
                    ]
                },
                {
                    color: '#ffce00',
                    descendants: [
                        {
                            descendants: [
                                { color: '#fff0b1' },
                                { color: '#ffec9e' },
                                { color: '#ffe782' },
                                { color: '#ffe05e' },
                                { color: '#ffda3b' },
                                { color: '#ffd41b' },
                                { color: '#ffd007' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#ffcf03' },
                                { color: '#ffc903' },
                                { color: '#ffc202' },
                                { color: '#ffb802' },
                                { color: '#ffae01' },
                                { color: '#ffa400' },
                                { color: '#ff9e00' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#ff9c00' },
                                { color: '#ff9500' },
                                { color: '#fe8b00' },
                                { color: '#fe7f00' },
                                { color: '#fe7100' },
                                { color: '#fd6500' },
                                { color: '#fd5900' }
                            ]
                        }
                    ]
                },
                {
                    color: '#ff4a21',
                    descendants: [ // rows
                        {
                            descendants: [
                                { color: '#ffd5ca' },
                                { color: '#ffc9bb' },
                                { color: '#ffb6a2' },
                                { color: '#ffa087' },
                                { color: '#ff8c6e' },
                                { color: '#ff7753' },
                                { color: '#ff6c45' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#ff6941' },
                                { color: '#fe6138' },
                                { color: '#fd582d' },
                                { color: '#fb4d21' },
                                { color: '#f94214' },
                                { color: '#f83a0b' },
                                { color: '#f73403' },
                            ]
                        },
                        {
                            descendants: [
                                { color: '#f73201' },
                                { color: '#e42e01' },
                                { color: '#ce2902' },
                                { color: '#b52402' },
                                { color: '#9d1f03' },
                                { color: '#861a04' },
                                { color: '#741604' }
                            ]
                        }
                    ]
                },
                {
                    color: '#d6d5d6',
                    descendants: [ // rows
                        {
                            descendants: [
                                { color: '#eeeeee' },
                                { color: '#ebebeb' },
                                { color: '#e8e7e8' },
                                { color: '#e3e3e3' },
                                { color: '#dfdedf' },
                                { color: '#dbdadb' },
                                { color: '#d8d7d8' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#d7d6d7' },
                                { color: '#cdcccd' },
                                { color: '#bebdbe' },
                                { color: '#adacae' },
                                { color: '#9c9b9c' },
                                { color: '#8c8b8d' },
                                { color: '#818082' }
                            ]
                        },
                        {
                            descendants: [
                                { color: '#818082' },
                                { color: '#787779' },
                                { color: '#6d6c6e' },
                                { color: '#626163' },
                                { color: '#545355' },
                                { color: '#484749' },
                                { color: '#3e3d3f' }
                            ]
                        }
                    ]
                }
            ],
            hideAfterColorChange: true
        };
    }
}

export = TabPalettePicker;
