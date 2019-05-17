declare let window: Window;

export class TsDom {
    // Nodes collection array
    readonly nodes: any[] = [];

    /**
     * Pseudo selector for current node
     *
     * @type {string}
     */
    readonly pseudoSelector: string = '';

    private callbacks: any = {};

    /**
     * Initialize selector
     *
     * @param {any | string} selector
     * @param {HTMLElement | Document} context
     */
    constructor(selector: any|string, context?: HTMLElement|Document) {
        if (!context) {
            context = document;
        }

        if (typeof selector === 'string') {
            if (selector[0] === '<' && selector[selector.length - 1] === ">") {
                this.nodes = [TsDom.createNode(selector)];
            } else {
                if (selector.search(/(:before|:after)$/gi) !== -1) {
                    let found = selector.match(/(:before|:after)$/gi);
                    selector = selector.split(found[0])[0];
                    this.pseudoSelector = found[0];
                }

                // Query DOM
                this.nodes = [].slice.call(context.querySelectorAll(selector));
            }
        } else if (selector instanceof NodeList) {
            this.nodes = selector.length > 1 ? [].slice.call(selector) : [selector];
        } else if (selector instanceof HTMLDocument || selector instanceof Window || selector instanceof HTMLElement) {
            this.nodes = [selector];
        }
    }

    public static select(selector: any, context?: HTMLElement|Document): TsDom {
        return new TsDom(selector, context);
    }

    public static create(nodeName: string): TsDom {
        return new TsDom(TsDom.createNode(nodeName));
    }

    attr(attrName: string, attrValue?: any) {
        if (attrValue != undefined) {
            this.each(this.nodes, (node: HTMLElement) => {
                node.setAttribute(attrName, attrValue);
            });

            return this;
        }

        return this.getLastNode().getAttribute(attrName);
    }

    /**
     * Append content to nodes
     *
     * @param {HTMLElement} content
     */
    append(content: HTMLElement|TsDom): TsDom {
        let element: HTMLElement;

        if (content instanceof TsDom) {
            element = content.get();
        } else {
            element = content;
        }

        this.each(this.nodes, (node: HTMLElement) => {
            node.appendChild(element);
        });

        return this;
    }

    parent(): TsDom {
        return new TsDom(this.getLastNode().parentNode);
    }

    /**
     * Iteration per elements
     *
     * @param {HTMLElement[]} nodes
     * @param {Function} callback
     * @returns {TsDom}
     */
    each(nodes?: any, callback?: Function): TsDom {
        if (nodes instanceof Function) {
            callback = nodes;
            nodes = this.nodes;
        }

        for (let i = 0; i < nodes.length; i++) {
            callback.call(this.nodes[i], this.nodes[i], i);
        }

        return this;
    }

    hasClass(className: string): boolean {
        return this.getLastNode().classList.contains(className);
    }

    /**
     * Add css classes to element
     *
     * @param {string} className
     * @returns {TsDom}
     */
    addClass(className: string): TsDom {
        if (className) {
            let cssClasses = className.split(' ');

            this.each(this.nodes, (node: HTMLElement) => {
                for (let classIndex in cssClasses) {
                    node.classList.add(cssClasses[classIndex]);
                }
            });
        }

        return this;
    }

    /**
     * Remove css classes from element
     *
     * @param {string} className
     * @returns {TsDom}
     */
    removeClass(className: string): TsDom {
        let cssClasses = className.split(' ');

        this.each(this.nodes,(node: HTMLElement) => {
            for (let classIndex in cssClasses) {
                node.classList.remove(cssClasses[classIndex]);
            }
        });

        return this;
    }

    html(content: string) {
        this.each(this.nodes,(node: HTMLElement) => {
            node.innerHTML = content;
        });
    }

    find(selector: any):TsDom {
        return new TsDom(selector, this.getLastNode());
    }

    trigger(eventName: string, detail?: object): TsDom {
        let event = new CustomEvent(eventName, {
            detail: detail
        });

        this.each(this.nodes,(node: HTMLElement) => {
            node.dispatchEvent(event);
        });

        return this;
    }

    text(text: string) {
        this.each(this.nodes,(node: HTMLElement) => {
            node.innerText = text;
        });

        return this;
    }

    /**
     * Set ot Get css property from element
     *
     * @param styleName
     * @param value
     * @returns {any}
     */
    css(styleName: any, value?: any): any|TsDom {
        if (typeof value == 'undefined') {
            let node = this.getLastNode();
            let result = null;

            styleName = TsDom.convertToJsProperty(styleName);

            if ((typeof node.getBoundingClientRect === "function") && !this.pseudoSelector) {
                result = node.getBoundingClientRect()[styleName];
            }

            if (!result) {
                let value = getComputedStyle(node, this.pseudoSelector)[styleName];

                if (value.search('px')) {
                    result = parseInt(value, 10);
                }
            }

            if (isNaN(result)) {
                throw 'Undefined css property: ' + styleName;
            }

            return result;
        } else {
            if (this.nodes.length > 1) {
                this.each(this.nodes, (node: HTMLElement) => {
                    node.style[styleName] = value
                });
            } else {
                this.nodes[0].style[styleName] = value;
            }
        }

        return this;
    }

    /**
     * Add event listener to element
     *
     * @param {string} eventName
     * @param {Function} callback
     * @returns {TsDom}
     */
    on(eventName: string, callback: Function): TsDom {
        this.each(this.nodes, (node: HTMLElement) => {
            let callbackFn = (e: any) => {
                callback.call(node, e);
            };
            this.callbacks[eventName] = callbackFn;
            node.addEventListener(eventName, callbackFn);
        });

        return this;
    }

    off(eventName: string): TsDom {
        let callbackFn = this.callbacks[eventName];
        this.each(this.nodes, (node: HTMLElement) => {
            node.removeEventListener(eventName, callbackFn, false);
        });

        return this;
    }

    val(value?: string|number) {
        if (typeof value === 'undefined') {
            return this.getLastNode().value;
        }

        this.each(this.nodes, (node: any) => {
            node.value = value;
        });

        return this;
    }

    /**
     * Check node type
     *
     * @param {string} tagName
     * @returns {boolean}
     */
    is(tagName: string): boolean {
        return this.getLastNode().tagName.toLowerCase() === tagName;
    }

    get(index: number = 0) {
        return this.nodes[index];
    }

    length(): number {
        return this.nodes.length;
    }

    hide(): TsDom {
        this.each(this.nodes, (node: HTMLElement) => {
            TsDom.select(node).css('display', 'none');
        });

        return this;
    }

    show(): TsDom {
        this.each(this.nodes, (node: HTMLElement) => {
            TsDom.select(node).css('display', '');
        });

        return this;
    }

    empty() {
        this.each(this.nodes, (node: HTMLElement) => {
            TsDom.select(node).get().innerHTML = '';
        });

        return this;
    }

    remove(): void {
        this.each(this.nodes, (node: HTMLElement) => {
            node.remove();
        });
    }

    insertBefore(data: any): TsDom {
        let element = this.resolveElement(data);

        this.each(this.nodes, (node: HTMLElement) => {
            node.parentNode.insertBefore(element, element.previousSibling);
        });

        return this;
    }

    insertAfter(contents: any): TsDom {
        let element = this.resolveElement(contents);

        this.each(this.nodes, (node: HTMLElement) => {
            node.parentNode.insertBefore(element, node.nextSibling);
        });

        return this;
    }

    protected resolveElement(contents: any): HTMLElement {
        let element: any;

        if (TsDom.isHtml(contents)) {
            element = TsDom.createNode(contents);
        } else if (contents instanceof HTMLElement) {
            element = contents;
        } else if (contents instanceof TsDom) {
            element = contents.get();
        }

        return element;
    }

    closest(selector: string): TsDom {
        return TsDom.select(this.getLastNode().closest(selector));
    }

    data(dataName: string): string {
        return this.attr('data-' + dataName);
    }

    width(value?: number|string): any {
        if (value !== undefined) {
            this.css('width', value);

            return this;
        }

        if (this.getLastNode() === window) {
            return parseInt(this.getLastNode().innerWidth, 10);
        }

        let width = this.css('width').toString();
        let result = null;

        if (width.search('px')) {
            result = parseInt(this.css('width'), 10);
        } else {
            result = width;
        }

        return result;
    }

    height(value?: number): any {
        if (value !== undefined) {
            this.css('height', value);

            return this;
        }

        if (this.getLastNode() === window) {
            return parseInt(this.getLastNode().innerHeight, 10);
        }

        return parseInt(this.css('height'), 10);
    }

    position() {
        return {
            top: Number(this.getLastNode().getBoundingClientRect().top),
            bottom: Number(this.getLastNode().getBoundingClientRect().bottom),
            left: Number(this.getLastNode().getBoundingClientRect().left),
            right: Number(this.getLastNode().getBoundingClientRect().right),
        };
    }

    offset() {
        return {
            top: Number(this.getLastNode().offsetTop),
            left: Number(this.getLastNode().offsetLeft)
        };
    }

    private static createNode(nodeName: string): Node {
        if (nodeName[0] === '<' && nodeName[nodeName.length - 1] === ">") {
            let element = document.createElement('div');
            element.innerHTML = nodeName;

            return element.firstChild;
        } else {
            return document.createElement(nodeName);
        }
    }

    private static isHtml(text: string) {
        return text[0] === '<' && text[text.length - 1] === ">";
    }

    /**
     * Make css property notation to javascript property notation
     *
     * @param {string} propertyName
     * @returns {string}
     */
    private static convertToJsProperty(propertyName: string): string {
        propertyName = propertyName.toLowerCase().replace('-', ' ');
        propertyName = propertyName.replace(/(^| )(\w)/g, (x) => {
            return x.toUpperCase();
        });
        propertyName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);

        return propertyName.replace(' ', '');
    }

    /**
     *
     * @returns {any}
     */
    private getLastNode(): any {
        return this.nodes[this.nodes.length - 1];
    }
}
