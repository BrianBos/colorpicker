import {TsDom} from "./tsdom";
var tinycolor = require("tinycolor2");

export class Color {
    color: string;
    rgb: string;
    rgba: string;
    hex: string;
    hsl: string;
    hsla: string;
    hsv: string;
    hsva: string;
    source: {
        rgba: {
            r: number,
            g: number,
            b: number,
            a: number
        },
        hsla: {
            h: number,
            s: number,
            l: number,
            a: number
        },
        hsv: {
          h: number,
          s: number,
          v: number,
          a: number
        }
    };

    constructor(color: string) {
        this.color = color;
        this.normalize();
    }

    normalize() {
        let color = tinycolor(this.color);
        let opacity = color.getAlpha();
        let rawRgb = color.toRgb();
        let rawHsl = color.toHsl();
        let rawHsv = color.toHsv();

        color.setAlpha(1);
        this.rgb = color.toRgbString();
        this.rgba = `rgba(${rawRgb.r}, ${rawRgb.g}, ${rawRgb.b}, ${opacity})`;
        this.hex = color.toHexString();
        this.hsl = color.toHslString();
        this.hsla = `hsla(${Math.floor(rawHsl.h)}, ${Math.floor(rawHsl.s * 100)}%, ${Math.floor(rawHsl.l * 100)}%, ${opacity})`;
        this.hsv = color.toHsvString();
        this.hsva = '';
        this.source = {
            rgba: {
                r: rawRgb.r,
                g: rawRgb.g,
                b: rawRgb.b,
                a: opacity,
            },
            hsla: {
                h: Math.floor(rawHsl.h),
                s: Math.floor(rawHsl.s * 100),
                l: Math.floor(rawHsl.l * 100),
                a: opacity
            },
            hsv: {
                h: Math.floor(rawHsv.h),
                s: Math.floor(rawHsv.s * 100),
                v: Math.floor(rawHsv.v * 100),
                a: opacity
            }
        };

          /*console.log(this.rgb);
          console.log(this.rgba);
          console.log(this.hex);
          console.log(this.hsl);
          console.log(this.hsla);
          console.log(this.hsv);
          console.log(this.source);*/
    }

    format(format: string): any {
        if (format === 'rgb') {
            return this.rgb;
        } else if (format === 'rgba') {
            return this.rgba;
        } else if (format === 'hex') {
            return this.hex;
        } else if (format === 'hsl') {
            return this.hsl;
        } else if (format === 'hsla') {
            return this.hsla;
        } else if (format === 'source') {
            return this.source;
        }

        return this.hex;
    }

    setOpacity(opacity: number) {
        this.rgba = 'rgba(' + this.source.rgba.r + ', ' + this.source.rgba.g + ', ' + this.source.rgba.b + ', ' + opacity + ')';
        this.hsla = 'hsla(' + this.source.hsla.h + ', ' + this.source.hsla.s + '%, ' + this.source.hsla.l + '%, ' + opacity + ')';
        this.source.rgba.a = opacity;
        this.source.hsla.a = opacity;
    }

    isValid(): boolean {
        return tinycolor(this.color).isValid();
    }

    static process(color: string) {
        return new Color(color);
    }
}
