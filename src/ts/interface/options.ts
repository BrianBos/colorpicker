export interface IOptions {
    color?: string, // initial color
    format?: string; // hex, rgb, rgba, hsl
    inline?: boolean; // inline mode
    placement?: string; // top, right, bottom, left, top-center, right-center, bottom-center, left-center
    arrow?: boolean; // show arrow
    customClass?: string; // add custom class to picker
    hexOnly?: boolean; // show hex only controls
    // chooseText: 'Choose'
    // cancelText: 'Cancel'
    //showChooseButton?: boolean,
    size?: string;
    anchor?: {
        hidden: false, // replace default anchor with custom
        cssProperty: string // background-color, color, border-color
    };
    animation?: string;
    hideAfterColorChange?: boolean;
    hideInfo?: boolean;
    defaultColor?: string;
    hueColors?: Array<{
        offset: number,
        color: string
    }>;
    palette?: Array<{
        color?: string,
        descendants?: Array<{
            color?: string,
            descendants?: Array<{
                color: string
            }>
        }>
    }>;
    history?: {
        hidden?: boolean,
        colors?: Array<string>,
        placeholdersAmount?: number
    };
    shade?: any;
}
