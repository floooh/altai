/// <reference path="../src/altai.ts"/>
/// <reference path="math.ts"/>

function cube() {
    const WIDTH = 600;
    const HEIGHT = 400;

    let gfx = new altai.Gfx({ 
        UseWebGL2: true, 
        Width: WIDTH, 
        Height: HEIGHT, 
        Depth: true,
        Canvas: "canvas", 
        AntiAlias: true 
    });

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
            0, 1, 2,  0, 2, 3,  
            4, 5, 6,  4, 6, 7,
            8, 9, 10,  8, 10, 11,  
            12, 13, 14,  12, 14, 15,
            16, 17, 18,  16, 18, 19,  
            20, 21, 22,  20, 22, 23            
        ])
    })

    let shader = gfx.makeShader({
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
    
    let pipeline = gfx.makePipeline({
        Shader: shader,
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

    let drawState = gfx.makeDrawState({
        Pipeline: pipeline,
        IndexBuffer: indexBuffer,
        VertexBuffers: [ vertexBuffer ],
    });

    let angleX = 0.0;
    let angleY = 0.0;
    const proj = mat4.perspective_fov(deg2rad(45.0), WIDTH, HEIGHT, 0.01, 100.0);
    const view = mat4.identity();

    function draw() {
        angleX += 0.01;
        angleY += 0.02;
        let model = mat4.translate(mat4.identity(), 0.0, 0.0, -6.0);
        model = mat4.rotate(model, angleX, 1.0, 0.0, 0.0);
        model = mat4.rotate(model, angleY, 0.0, 1.0, 0.0);
        let mvp = mat4.mul(proj, mat4.mul(view, model));
        gfx.beginPass(pass);
        gfx.applyDrawState(drawState);
        gfx.applyUniforms({
            "mvp": mvp.values(),
        })
        gfx.draw(0, 36);
        gfx.endPass();
        gfx.commitFrame(draw);
    }
    draw();
}