export interface IPicker {
    setColor(color: string): void;
    getColor(): string|object;
    show(): void;
    hide(): void;
    refresh(): void;
    destroy(): void;
    on(eventName: string, eventCallback: any): void;
    setAnchorCssProperty(cssProperty: string): void;
    destroy(): void;
}
