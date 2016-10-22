/// <reference path="../src/altai.ts" />

class App {

    gfx: altai.Gfx;
    pass: altai.PassAttrs;

    constructor() {
        this.gfx = new altai.Gfx({ width: 400, height: 300 });
        this.pass = { colorAttachments: [{ clearColor: [0.0, 0.0, 0.0, 1.0] }] };
    };

    draw() {
        let c = this.pass.colorAttachments[0].clearColor;
        c[0] = (c[0] + 0.001) % 1.0;
        c[1] = (c[1] + 0.005) % 1.0;
        c[2] = (c[2] + 0.0025) % 1.0;

        this.gfx.beginPass(this.pass);
        this.gfx.endPass();
        this.gfx.commitFrame(() => this.draw());
    };
}

let app = new App()
app.draw();
