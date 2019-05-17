import {TsDom} from './tsdom';

declare let window: Window;

export class PickerPosition {
    protected scrollParent: TsDom;
    protected window: TsDom;
    protected processHandler: any;

    constructor(
        private selector: TsDom,
        private picker: TsDom,
        private defaultPlacement: string,
        private arrow: boolean
    ) {
        let self = this;
        let scrollParent = this.getScrollParent(this.selector.get());

        this.processHandler = (e: Event) => self.process();
        this.scrollParent = TsDom.select(scrollParent);
        this.scrollParent.on('scroll', this.processHandler);
        this.window = TsDom.select(window);
        this.window.on('scroll', this.processHandler);
    }

    process() {
        let pickerId = this.picker.attr('id'),
            arrow = TsDom.select('#' + pickerId + ':after'),
            arrowWidth = arrow.width(),
            arrowHeight = arrow.height(),
            selectorWidth = this.selector.width(),
            selectorHeight = this.selector.height(),
            selectorPositionTop = this.selector.position().top,
            selectorPositionLeft = this.selector.position().left,
            pickerWidth = this.picker.width(),
            pickerHeight = this.picker.height(),
            defaultPlacement = 'bottom',
            result = this.defaultPlacement.split('-'),
            arrowBorderWidth = arrowWidth / 2
        ;

        if (result.length > 1) {
            defaultPlacement = result[0];
        } else {
            defaultPlacement = this.defaultPlacement;
        }

        if (defaultPlacement === 'bottom') {
            let pickerPositionTop = selectorPositionTop + selectorHeight + arrowHeight;
            let pickerPositionLeft = 0;

            if ((selectorPositionLeft + pickerWidth) < TsDom.select(window).width()) { // arrow left position
                pickerPositionLeft = selectorPositionLeft;
                this.picker
                    .removeClass('is-arrow-right')
                    .addClass('is-arrow-left')
                ;
                let arrowLeftPosition = arrow.css('left');
                let arrowAreaWidth = arrowLeftPosition + arrow.width() + Math.ceil(arrowLeftPosition / 2);

                if (selectorWidth < arrowAreaWidth) { // centering left arrow
                    pickerPositionLeft = pickerPositionLeft - Math.ceil((arrowLeftPosition + (arrowBorderWidth / 2)) - (selectorWidth / 2));
                }
            } else { // arrow right position
                pickerPositionLeft = (selectorPositionLeft + selectorWidth) - pickerWidth;
                this.picker
                    .removeClass('is-arrow-left')
                    .addClass('is-arrow-right')
                ;
                let arrowRightPosition = arrow.css('right');
                let arrowAreaWidth = arrowRightPosition + arrow.width() + Math.ceil(arrowRightPosition / 2);

                if (selectorWidth < arrowAreaWidth) {
                    // 2px is hack fix for arrow with right position
                    pickerPositionLeft = pickerPositionLeft + 3 + ((arrowRightPosition + (arrowBorderWidth / 2)) - (selectorWidth / 2));
                }
            }

            this.picker.css('top', pickerPositionTop + 'px');
            this.picker.css('left', pickerPositionLeft + 'px');
        } else if (defaultPlacement === 'top') {
            let pickerPositionTop = selectorPositionTop - pickerHeight - arrowHeight;
            let pickerPositionLeft = 0;

            if ((selectorPositionLeft + pickerWidth) < TsDom.select(window).width()) { // arrow left position
                pickerPositionLeft = selectorPositionLeft;
                this.picker.css('left', pickerPositionLeft + 'px');
                this.picker
                    .removeClass('is-arrow-right')
                    .addClass('is-arrow-left')
                ;
                let arrowLeftPosition = arrow.css('left');
                let arrowAreaWidth = arrowLeftPosition + arrow.width() + Math.ceil(arrowLeftPosition / 2);

                if (selectorWidth < arrowAreaWidth) { // centering left arrow
                    pickerPositionLeft = pickerPositionLeft - Math.ceil((arrowLeftPosition + (arrowBorderWidth / 2)) - (selectorWidth / 2));
                }
            } else { // arrow right position
                pickerPositionLeft = (selectorPositionLeft + selectorWidth) - pickerWidth;
                this.picker
                    .removeClass('is-arrow-left')
                    .addClass('is-arrow-right')
                ;
                let arrowRightPosition = arrow.css('right');
                let arrowAreaWidth = arrowRightPosition + arrow.width() + Math.ceil(arrowRightPosition / 2);

                if (selectorWidth < arrowAreaWidth) {
                    // 2px is hack fix for arrow with right position
                    pickerPositionLeft = pickerPositionLeft + 3 + ((arrowRightPosition + (arrowBorderWidth / 2)) - (selectorWidth / 2));
                }
            }

            this.picker.css('top', pickerPositionTop + 'px');
            this.picker.css('left', pickerPositionLeft + 'px');
        } else if (defaultPlacement === 'left') {
            let pickerPositionTop = selectorPositionTop;
            let pickerPositionLeft = selectorPositionLeft - pickerWidth - arrowWidth;

            if ((selectorPositionTop + pickerHeight) < TsDom.select(window).height()) { // arrow top position
                this.picker
                    .removeClass('is-arrow-bottom')
                    .addClass('is-arrow-top')
                ;

                let arrowTopPosition = arrow.css('top');
                let arrowAreaHeight = arrowTopPosition + arrowHeight + Math.ceil(arrowTopPosition / 2);

                if (selectorHeight < arrowAreaHeight) { // centering left arrow
                    pickerPositionTop = pickerPositionTop - Math.ceil((arrowTopPosition + (arrowBorderWidth / 2)) - (selectorHeight / 2));
                }
            } else { // arrow bottom position
                pickerPositionTop = (selectorPositionTop + selectorHeight) - pickerHeight;
                this.picker
                    .removeClass('is-arrow-top')
                    .addClass('is-arrow-bottom')
                ;
                let arrowBottomPosition = arrow.css('bottom');
                let arrowAreaHeight = arrowBottomPosition + arrow.height() + Math.ceil(arrowBottomPosition / 2);

                if (selectorHeight < arrowAreaHeight) {
                    // 4px is hack fix for arrow with bottom position
                    pickerPositionTop = pickerPositionTop + 4 + ((arrowBottomPosition + (arrowBorderWidth / 2)) - (selectorHeight / 2));
                }
            }

            this.picker.css('top', pickerPositionTop + 'px');
            this.picker.css('left', pickerPositionLeft + 'px');
        } else if (defaultPlacement === 'right') {
            let pickerPositionTop = selectorPositionTop;
            let pickerPositionLeft = selectorPositionLeft + selectorWidth + arrowWidth;

            if ((selectorPositionTop + pickerHeight) < TsDom.select(window).height()) { // arrow top position
                this.picker
                    .removeClass('is-arrow-bottom')
                    .addClass('is-arrow-top')
                ;

                let arrowTopPosition = arrow.css('top');
                let arrowAreaHeight = arrowTopPosition + arrowHeight + Math.ceil(arrowTopPosition / 2);

                if (selectorHeight < arrowAreaHeight) { // centering left arrow
                    pickerPositionTop = pickerPositionTop - Math.ceil((arrowTopPosition + (arrowBorderWidth / 2)) - (selectorHeight / 2));
                }
            } else { // arrow bottom position
                pickerPositionTop = (selectorPositionTop + selectorHeight) - pickerHeight;
                this.picker
                    .removeClass('is-arrow-top')
                    .addClass('is-arrow-bottom')
                ;
                let arrowBottomPosition = arrow.css('bottom');
                let arrowAreaHeight = arrowBottomPosition + arrow.height() + Math.ceil(arrowBottomPosition / 2);

                if (selectorHeight < arrowAreaHeight) {
                    // 4px is hack fix for arrow with bottom position
                    pickerPositionTop = pickerPositionTop + 4 + ((arrowBottomPosition + (arrowBorderWidth / 2)) - (selectorHeight / 2));
                }
            }

            this.picker.css('top', pickerPositionTop + 'px');
            this.picker.css('left', pickerPositionLeft + 'px');
        }
    }

    destroy() {
        this.scrollParent.off('scroll');
        this.window.off('scroll');
    }

    protected getScrollParent(node: any) {
        const regex = /(auto|scroll)/;
        const parents = (_node: any, ps: any): any => {
            if (_node.parentNode === null) { return ps; }

            return parents(_node.parentNode, ps.concat([_node]));
        };

        const style = (_node: any, prop: any) => getComputedStyle(_node, null).getPropertyValue(prop);
        const overflow = (_node: any) => style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x');
        const scroll = (_node: any) => regex.test(overflow(_node));

        /* eslint-disable consistent-return */
        const scrollParent = (_node: any) => {
            if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
                return;
            }

            const ps = parents(_node.parentNode, []);

            for (let i = 0; i < ps.length; i += 1) {
                if (scroll(ps[i])) {
                    return ps[i];
                }
            }

            return document.scrollingElement || document.documentElement;
        };

        return scrollParent(node);
    }
}
