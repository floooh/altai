/// <reference path="../src/altai.ts"/>

function offscreen() {
    const WIDTH = 600;
    const HEIGHT = 400;

    let gfx = new altai.Gfx({ 
        UseWebGL2: true, 
        Width: WIDTH, 
        Height: HEIGHT, 
        Depth: true,
        Canvas: "canvas", 
    });

    // create texture and render-pass for offscreen-rendering
    let tex = gfx.makeTexture({
        Type: altai.TextureType.Texture2D,
        Width: 128,
        Height: 128,
        ColorFormat: altai.PixelFormat.RGBA8,
        DepthFormat: altai.DepthStencilFormat.DEPTH,
        WrapU: altai.Wrap.Repeat,
        WrapV: altai.Wrap.Repeat,
        MinFilter: altai.Filter.Linear,
        MagFilter: altai.Filter.Linear, 
    });
    let offPass = gfx.makePass({
        ColorAttachments: [{
            Texture: tex,
            ClearColor: [0.25, 0.25, 0.25, 1.0]
        }],
        DepthAttachment: {
            Texture: tex,
        }
    });

    // default pass
    let pass = gfx.makePass({
        ColorAttachments: [{ ClearColor: [0.4, 0.6, 0.5, 1.0] }]
    });

    function draw() {
        // offscreen rendering
        gfx.beginPass(offPass);
        gfx.endPass();
        
        // render to default framebuffer
        gfx.beginPass(pass);
        gfx.endPass();
        gfx.commitFrame(draw);
    }
    draw();
}
