/// <reference path="../src/altai.ts"/>
/// <reference path="math.ts"/>

function cube() {
    let gfx = new altai.Gfx({ UseWebGL2: true, Width: 600, Height: 400, Canvas: "canvas", AntiAlias: true });

    let pass = gfx.makePass({ 
        ColorAttachments: [ { ClearColor: [ 0.3, 0.4, 0.5, 1.0 ] } ]
    })

    let vertexBuffer = gfx.makeBuffer({
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
    let indexBuffer = gfx.makeBuffer({
        Type: altai.BufferType.IndexBuffer,
        Data: new Uint16Array([
            0, 1, 2,  0, 2, 3,  4, 5, 6,  4,6,7,
            8, 9, 10,  8, 10, 11,  12, 13, 14,  12, 14, 15,
            16, 17, 18,  16, 18, 19,  20, 21, 22,  20,22,23            
        ])
    })

    let shader = gfx.makeShader({
        VertexShader: `
            attribute vec4 position;
            attribute vec4 color;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = position;
                vColor = color;
            }`,
        FragmentShader: `
            varying lowp vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
            }`
    });
    
    let pipeline = gfx.makePipeline({
        VertexLayouts: [{
            Components: [
                [ "position", altai.VertexFormat.Float3 ],
                [ "color", altai.VertexFormat.Float4 ],
            ]
        }],
        Shader: shader,
        DepthCmpFunc: altai.CompareFunc.Always,
        DepthWriteEnabled: false,
        CullFaceEnabled: false,
    });

    let drawState = gfx.makeDrawState({
        Pipeline: pipeline,
        IndexBuffer: indexBuffer,
        VertexBuffers: [ vertexBuffer ],
    });

    function draw() {
        gfx.beginPass(pass);
        gfx.endPass();
        gfx.commitFrame(draw);
    }
    draw();
}