/// <reference path="../src/altai.ts" />

let gfx = new altai.Gfx({ width: 400, height: 300 });
let pass: altai.PassAttrs = { colorAttachments: [{ clearColor: [0.0, 0.0, 0.0, 1.0 ] }] };

function draw() {
    let c = pass.colorAttachments[0].clearColor;
    c[0] = (c[0] + 0.001) % 1.0;
    c[1] = (c[1] + 0.005) % 1.0;
    c[2] = (c[2] + 0.0025) % 1.0;

    gfx.beginPass(pass);
    gfx.endPass();
    gfx.commitFrame(draw);
}
draw();
