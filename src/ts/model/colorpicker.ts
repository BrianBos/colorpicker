import {TsDom} from "./tsdom";
import * as deepmerge from "deepmerge";
import {IPicker} from "../interface/picker";
import {_uniqueId} from "./helper";
import {PickerPosition} from "./picker-position";
import {IOptions} from "../interface/options";
import {Color} from "./color";

export abstract class ColorPicker implements IPicker {
    protected id: string; // id of picker
    protected anchorId: string; // id of anchor
    protected cssId: string; // id of picker with prefix #
    protected cssAnchorId: string; // id of anchor with prefix #
    protected options: IOptions = {
        color: '',
        hexOnly: false,
        inline: false,
        placement: 'bottom',
        format: 'rgba',
        customClass: '',
        size: 'default',
        arrow: true,
        anchor: {
            hidden: false,
            cssProperty: 'color' // background-color, color
        },
        animation: 'slide-in',
        hideInfo: false,
        history: {
            hidden: false,
            placeholdersAmount: 10,
            colors: []
        }
    };
    protected picker: TsDom;
    protected anchor: TsDom;
    protected events: any = {
        change: (color: Color) => {}
    };
    public static globalOptions: IOptions = {};
    protected pickerPosition: PickerPosition;
    protected document: TsDom;

    constructor(anchor: string, options = {}) {
        const overwriteMerge = (destinationArray: any, sourceArray: any, options: any) => sourceArray;
        this.anchor = TsDom.select(anchor);
        this.id = 'colorpicker' + '-' + _uniqueId();
        this.anchorId = this.id + '-anchor';
        this.cssId = '#' + this.id;
        this.cssAnchorId = '#' + this.anchorId;
        this.options = deepmerge.all([this.options, this.getDefaultOptions(), ColorPicker.globalOptions, options], {
            arrayMerge: overwriteMerge
        });
        this.document = TsDom.select(document);
        this.initPicker();
        this.update();
        this.initAnchor();
    }

    setColor(color: string) {
        this.options.color = color;
        this.update();
    }

    show() {
        this.bindCommonEvents();
        this.picker
            .removeClass(this.options.animation)
            .addClass(this.options.animation)
            .addClass('is-opened')
            .addClass('colorpicker--position-' + this.options.placement)
        ;
        this.detectPickerPosition();
        this.afterShow();
    }

    hide() {
        if (!this.picker.hasClass('is-opened')) {
            return;
        }

        this.pickerPosition.destroy();
        this.unBindCommonEvents();
        this.picker.removeClass('is-opened');
        this.anchor.get(0).blur(); // unfocus input
    }

    protected unBindCommonEvents() {
        if (!this.options.inline) {
            this.document.off('mousedown');
        }
    }

    on(eventName: string, eventCallback: any): void {
        this.events[eventName] = eventCallback;
    }

    setAnchorCssProperty(cssProperty: string): void {
        this.options.anchor.cssProperty = cssProperty;
    }

    setPlacement(placement: string) {
        this.options.placement = placement;
    }

    public static setGlobalOptions(options: IOptions): void {
        ColorPicker.globalOptions = options;
    }

    protected initPicker(): void {
        this.buildLayout();
        this.picker.addClass(this.getPickerCssClassName() + '--size-' + this.options.size);

        // hide arrow on picker
        if (!this.options.arrow) {
            this.picker.addClass('colorpicker--no-arrow');
        }

        this.addCustomClass();

        if (this.options.inline) {
            if (this.anchor.parent().hasClass('colorpicker-input')) {
                this.anchor.parent().insertAfter(this.picker);
            } else {
                this.anchor.insertAfter(this.picker);
            }

            this.anchor.addClass('colorpicker-anchor--inline');
            this.picker.addClass('colorpicker--inline');
        } else {
            TsDom.select('body').append(this.picker);
        }

        this.bindEvents();
    }

    protected bindCommonEvents() {
        if (!this.options.inline) {
            this.document.on('mousedown', (e: Event) => {
                let picker = TsDom.select(e.target).closest('.colorpicker');

                if ((!picker.length() || picker.attr('id') !== this.picker.attr('id')) && (e.target !== this.anchor.get(0))) {
                    this.hide();
                }
            });
        }
    }

    protected initAnchor(): void {
        let self = this;
        let callback = (e: Event) => {
            self.hideAllActivePickers();
            self.show();
            e.stopPropagation();
        };

        this.anchor.addClass('colorpicker-anchor');

        if (this.options.anchor.hidden) {
            this.anchor.hide();
        }

        if (this.anchor.is('input')) {
            this.anchor
                .val(self.getColor().toString())
                .on('input', (e: Event) => {
                    this.setColor(this.anchor.val());
                    this.updateAnchorColor(e, false);
                })
            ;

            let anchorInInput = this.anchor.parent().find('[data-color]');

            if (anchorInInput.length()) {
                anchorInInput.css('background', self.getColor());
            }

            if (!this.options.inline) {
                this.anchor.on('focus', callback);
            }
        } else {
            if (this.anchor.find('[data-color]').length()) {
                this.anchor
                    .find('[data-color]')
                    .css('background', self.getColor())
                ;
            } else {
                this.anchor.css(self.options.anchor.cssProperty, self.getColor());
            }

            if (!this.options.inline) {
                this.anchor.on('click', callback);
            }
        }

        this.picker.on('colorpicker:color-change', (e: CustomEvent) => {
            this.updateAnchorColor(e);
        });

        this.picker.on('colorpicker:hide', (e: Event) => {
            this.hide();
        });
    }

    protected updateAnchorColor(e: any = null, updateValue = true) {
      let self = this;

      if (e.detail.enableHidePicker && self.options.hideAfterColorChange && !this.options.inline) {
        self.hide();
      }

      let dataColor = null;

      if (updateValue) {
        this.anchor.val(self.getColor().toString());
      }

      if (this.anchor.parent().hasClass('colorpicker-input')) {
        dataColor = this.anchor.parent().find('[data-color]');
      } else {
        dataColor = this.anchor.find('[data-color]');
      }

      if (dataColor.length()) {
        dataColor.css('background-color', self.getColor());
      } else {
        if (!this.anchor.is('input')) {
          this.anchor.css(self.options.anchor.cssProperty, self.getColor());
        }
      }

      this.events['change'].apply(self, [self.getColorObject()]);
    }

    protected hideAllActivePickers() {
        TsDom
            .select(`.colorpicker.is-opened:not(${this.cssId}):not(.colorpicker--inline)`)
            .trigger('colorpicker:hide')
        ;
    }

    protected addCustomClass() {
        this.picker.addClass(this.options.customClass);
    }

    protected detectPickerPosition() {
        this.pickerPosition = new PickerPosition(
            this.anchor,
            this.picker,
            this.options.placement,
            this.options.arrow
        );
        this.pickerPosition.process();

        this.picker.on('colorpicker:refresh-position', (e: Event) => {
            this.pickerPosition.process();
        });
    }

    protected dispatchColorChangedEvent(enableHidePicker: boolean = true) {
        this.picker.trigger('colorpicker:color-change', {
            color: this.getColor(),
            enableHidePicker: enableHidePicker
        });
    }

    protected dispatchRefreshPositionEvent() {
        this.picker.trigger('colorpicker:refresh-position');
    }

    abstract refresh(): void;
    abstract destroy(): void;

    abstract getColor(): string|object;

    protected abstract buildLayout(): void;

    protected abstract bindEvents(): void;

    protected abstract update(): void;

    protected abstract getPickerCssClassName(): string;

    protected abstract getDefaultOptions(): IOptions;

    protected abstract getColorObject(): Color;

    protected afterShow() {};
}
