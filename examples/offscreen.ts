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
        ColorAttachments: [{ Texture: tex, ClearColor: [0.0, 0.0, 1.0, 1.0] }],
        DepthAttachment: { Texture: tex }
    });

    // default pass
    let pass = gfx.makePass({
        ColorAttachments: [{ ClearColor: [0.4, 0.6, 0.5, 1.0] }]
    });

    // a vertex buffer for a textured triangle
    let vertexBuffer = gfx.makeBuffer({
        Type: altai.BufferType.VertexBuffer,
        Data: new Float32Array([
            // positions        texcoords
            0.0, 0.5, 0.5,      0.0, 0.0,
            0.5, -0.5, 0.5,     1.0, 0.0,
            -0.5, -0.5, 0.5,    1.0, 1.0,
        ]),
    });

    // simple shader for rendering a textured triangle
    let shader = gfx.makeShader({
        VertexShader: `
            attribute vec4 position;
            attribute vec2 texcoord0;
            varying vec2 uv;
            void main(void) {
                gl_Position = position;
                uv = texcoord0;
            }`,
        FragmentShader: `
            precision mediump float; 
            uniform sampler2D texture;
            varying vec2 uv;
            void main(void) {
                gl_FragColor = texture2D(texture, uv); 
            }`
    });

    // the pipeline-state object 
    let pipeline = gfx.makePipeline({
        VertexLayouts: [{
            Components: [
                [ "position", altai.VertexFormat.Float3 ],
                [ "texcoord0", altai.VertexFormat.Float2 ],
            ]
        }],
        Shader: shader,
        DepthCmpFunc: altai.CompareFunc.Always,
        DepthWriteEnabled: false,
        CullFaceEnabled: false,
    });

    // DrawState object with the resource bindings
    let drawState = gfx.makeDrawState({
        Pipeline: pipeline,
        VertexBuffers: [ vertexBuffer ],
        Textures: {
            "texture": tex
        }
    });
    function draw() {
        // offscreen rendering
        gfx.beginPass(offPass);
        gfx.endPass();
        
        // render to default framebuffer
        gfx.beginPass(pass);
        gfx.applyDrawState(drawState);
        gfx.draw(0, 3);
        gfx.endPass();
        gfx.commitFrame(draw);
    }
    draw();
}
