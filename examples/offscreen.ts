/// <reference path="../src/altai.ts"/>
/// <reference path="math.ts"/>

function offscreen() {
    // setup the GL canvas
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
    let offTex = gfx.makeTexture({
        Type: altai.TextureType.Texture2D,
        Width: 256,
        Height: 256,
        ColorFormat: altai.PixelFormat.RGBA8,
        DepthFormat: altai.DepthStencilFormat.DEPTH,
        WrapU: altai.Wrap.Repeat,
        WrapV: altai.Wrap.Repeat,
        MinFilter: altai.Filter.Linear,
        MagFilter: altai.Filter.Linear, 
    });
    let offPass = gfx.makePass({
        ColorAttachments: [{ Texture: offTex, ClearColor: [0.25, 0.25, 0.25, 1.0] }],
        DepthAttachment: { Texture: offTex }
    });

    // a vertex and index buffer for a cube
    let cubeVB = gfx.makeBuffer({
        Type: altai.BufferType.VertexBuffer,
        Data: new Float32Array([
            -1.0, -1.0, -1.0,   1.0, 0.0, 0.0, 1.0, 
             1.0, -1.0, -1.0,   1.0, 0.0, 0.0, 1.0,
             1.0,  1.0, -1.0,   1.0, 0.0, 0.0, 1.0,
            -1.0,  1.0, -1.0,   1.0, 0.0, 0.0, 1.0,

            -1.0, -1.0,  1.0,   0.0, 1.0, 0.0, 1.0,      
             1.0, -1.0,  1.0,   0.0, 1.0, 0.0, 1.0, 
             1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,
            -1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,

            -1.0, -1.0, -1.0,   0.0, 0.0, 1.0, 1.0, 
            -1.0,  1.0, -1.0,   0.0, 0.0, 1.0, 1.0, 
            -1.0,  1.0,  1.0,   0.0, 0.0, 1.0, 1.0, 
            -1.0, -1.0,  1.0,   0.0, 0.0, 1.0, 1.0,

             1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0, 
             1.0,  1.0, -1.0,   1.0, 1.0, 0.0, 1.0, 
             1.0,  1.0,  1.0,   1.0, 1.0, 0.0, 1.0, 
             1.0, -1.0,  1.0,   1.0, 1.0, 0.0, 1.0,

            -1.0, -1.0, -1.0,   0.0, 1.0, 1.0, 1.0, 
            -1.0, -1.0,  1.0,   0.0, 1.0, 1.0, 1.0, 
             1.0, -1.0,  1.0,   0.0, 1.0, 1.0, 1.0, 
             1.0, -1.0, -1.0,   0.0, 1.0, 1.0, 1.0,

            -1.0,  1.0, -1.0,   1.0, 0.0, 1.0, 1.0, 
            -1.0,  1.0,  1.0,   1.0, 0.0, 1.0, 1.0, 
             1.0,  1.0,  1.0,   1.0, 0.0, 1.0, 1.0, 
             1.0,  1.0, -1.0,   1.0, 0.0, 1.0, 1.0             
        ])
    })
    let cubeIB = gfx.makeBuffer({
        Type: altai.BufferType.IndexBuffer,
        Data: new Uint16Array([
            0, 1, 2,  0, 2, 3,  
            4, 5, 6,  4, 6, 7,
            8, 9, 10,  8, 10, 11,  
            12, 13, 14,  12, 14, 15,
            16, 17, 18,  16, 18, 19,  
            20, 21, 22,  20, 22, 23            
        ])
    })

    // a shader to render a vertex-colored cube
    let cubeShader = gfx.makeShader({
        VertexShader: `
            uniform mat4 mvp;
            attribute vec4 position;
            attribute vec4 color;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = mvp * position;
                vColor = color;
            }`,
        FragmentShader: `
            varying lowp vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
            }`
    });

    // a pipeline object to render the cube
    let cubePipeline = gfx.makePipeline({
        Shader: cubeShader,
        VertexLayouts: [{
            Components: [
                [ "position", altai.VertexFormat.Float3 ],
                [ "color", altai.VertexFormat.Float4 ],
            ]
        }],
        IndexFormat: altai.IndexFormat.UInt16,
        DepthCmpFunc: altai.CompareFunc.LessEqual,
        DepthWriteEnabled: true,
        CullFaceEnabled: false
    });

    // draw state with resource bindings for the cube
    let cubeDrawState = gfx.makeDrawState({
        Pipeline: cubePipeline,
        IndexBuffer: cubeIB,
        VertexBuffers: [ cubeVB ],
    });

    // default render pass
    let pass = gfx.makePass({
        ColorAttachments: [{ ClearColor: [0.75, 0.75, 0.75, 1.0] }]
    });

    // a vertex buffer for a textured quad
    let quadVB = gfx.makeBuffer({
        Type: altai.BufferType.VertexBuffer,
        Data: new Float32Array([
            // positions        texcoords
            -0.5, -0.5, 0.5,    0.0, 0.0,   // first triangle
            +0.5, -0.5, 0.5,    2.0, 0.0,
            +0.5, +0.5, 0.5,    2.0, 2.0,

            -0.5, -0.5, 0.5,    0.0, 0.0,   // second triangle
            +0.5, +0.5, 0.5,    2.0, 2.0,
            -0.5, +0.5, 0.5,    0.0, 2.0,
        ]),
    });

    // shader to render a textured quad into the default framebuffer
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

    // the pipeline-state object for the textured quad
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

    // DrawState object for the texture quad
    let drawState = gfx.makeDrawState({
        Pipeline: pipeline,
        VertexBuffers: [ quadVB ],
        Textures: {
            "texture": offTex,
        }
    });
    
    // rotation angles and projection matrix
    let angleX = 0.0;
    let angleY = 0.0;
    const proj = mat4.perspective_fov(deg2rad(45.0), WIDTH, HEIGHT, 0.01, 100.0);
    function draw() {
        
        // model-view-projection matrix for rotating cube
        angleX += 0.01;
        angleY += 0.02;
        let model = mat4.translate(mat4.identity(), 0.0, 0.0, -6.0);
        model = mat4.rotate(model, angleX, 1.0, 0.0, 0.0);
        model = mat4.rotate(model, angleY, 0.0, 1.0, 0.0);
        let mvp = mat4.mul(proj, model);

        // render rotating cube to offscreen render target
        gfx.beginPass(offPass);
        gfx.applyDrawState(cubeDrawState);
        gfx.applyUniforms({
            "mvp": mvp.values()
        });
        gfx.draw(0, 36);
        gfx.endPass();
        
        // render to default framebuffer
        gfx.beginPass(pass);
        gfx.applyDrawState(drawState);
        gfx.draw(0, 6);
        gfx.endPass();
        gfx.commitFrame(draw);
    }
    draw();
}
