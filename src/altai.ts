'use strict'

module altai {

const MaxNumColorAttachments = 4;
const MaxNumVertexAttribs = 16;

function some<T>(opt0: T, opt1: T): T {
    return opt0 != null ? opt0 : opt1;
}
function some3<T>(opt0: T, opt1: T, opt2: T): T {
    return opt0 != null ? opt0 : (opt1 != null ? opt1 : opt2); 
}

let vertexFormatMap: [number, GLenum, boolean][] = [
    [ 1, WebGLRenderingContext.FLOAT, false ],
    [ 2, WebGLRenderingContext.FLOAT, false ],
    [ 3, WebGLRenderingContext.FLOAT, false ],
    [ 4, WebGLRenderingContext.FLOAT, false ],
    [ 4, WebGLRenderingContext.BYTE, false ],
    [ 4, WebGLRenderingContext.BYTE, true ],
    [ 4, WebGLRenderingContext.UNSIGNED_BYTE, false ],
    [ 4, WebGLRenderingContext.UNSIGNED_BYTE, true ],
    [ 2, WebGLRenderingContext.SHORT, false ],
    [ 2, WebGLRenderingContext.SHORT, true ],
    [ 4, WebGLRenderingContext.SHORT, false ],
    [ 4, WebGLRenderingContext.SHORT, true ]
]

/**
 * Altai's main interface for resource creation and rendering.
 */
export class Gfx {
    private gl : WebGLRenderingContext;
    private cache: PipelineState;
    private curProgram: WebGLProgram;
    private curIndexType: GLenum;
    private curIndexSize: number = 0;
    private curPrimType: PrimitiveType;

    /**
     *  Create the Altai interface object. 
     * 
     *  @param {GfxOptions} options - WebGL context and HTML canvas intialization options 
     */    
    constructor(options: GfxOptions) {
        let glContextAttrs = {
            alpha: some(options.Alpha, true),
            depth: some(options.Depth, true),
            stencil: some(options.Stencil, false),
            antialias: some(options.AntiAlias, true),
            premultipliedAlpha: some(options.PreMultipliedAlpha, true),
            preserveDrawingBuffer: some(options.PreserveDrawingBuffer, false),
            preferLowPowerToHighPerformance: some(options.PreferLowPowerToHighPerformance, false),
            failIfMajorPerformanceCaveat: some(options.FailIfMajorPerformanceCaveat, false)
        };        
        let canvas = document.getElementById(some(options.Canvas, "canvas")) as HTMLCanvasElement;
        if (options.Width != null) {        
            canvas.width = options.Width;
        }
        if (options.Height != null) {
            canvas.height = options.Height;
        }
        this.gl = (canvas.getContext("webgl", glContextAttrs) ||
                   canvas.getContext("experimental-webgl", glContextAttrs)) as WebGLRenderingContext;
        this.gl.viewport(0, 0, canvas.width, canvas.height);

        // FIXME: HighDPI handling

        // apply default state
        this.cache = new PipelineState({ VertexLayouts: [], Shader: null });
        this.applyState(this.cache, true);
    }

    /**
     * Create a new Pass object.
     * 
     * @param {PassOptions} options - Pass creation options
     */
    makePass(options: PassOptions): Pass {
        return new Pass(options);
    }

    /**
     * Create a new Buffer object.
     * 
     * @param {BufferOptions} options - Buffer creation options 
     */
    makeBuffer(options: BufferOptions): Buffer {
        let buf = new Buffer(options, this.gl.createBuffer());
        this.gl.bindBuffer(buf.type, buf.glBuffer);
        if (options.Data) {
            this.gl.bufferData(buf.type, options.Data, buf.usage);
        }
        else if (options.LengthInBytes) {
            this.gl.bufferData(buf.type, options.LengthInBytes, buf.usage);
        }
        return buf;
    }

    /**
     * Create a new Shader object.
     * 
     *  @param {ShaderOptions} options - Shader creation options
     */
    makeShader(options: ShaderOptions): Shader {
        let vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vs, options.VertexShader);
        this.gl.compileShader(vs);
        if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
            console.error("Failed to compile fragment shader:\n" + this.gl.getShaderInfoLog(vs));
        }

        let fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fs, options.FragmentShader);
        this.gl.compileShader(fs);
        if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
            console.error("Failed to compile fragment shader:\n" + this.gl.getShaderInfoLog(fs));
        }

        let prog = this.gl.createProgram();
        this.gl.attachShader(prog, vs);
        this.gl.attachShader(prog, fs);
        this.gl.linkProgram(prog);
        if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
            console.error("Failed to link shader program!");
        }
        let shd = new Shader(prog); 
        this.gl.deleteShader(vs);
        this.gl.deleteShader(fs);

        return shd;
    }

    /**
     * Create a new Pipeline object.
     * 
     * @param {PipelineOptions} options - Pipeline creation options
     */
    makePipeline(options: PipelineOptions): Pipeline {
        let pip = new Pipeline(options);

        // resolve vertex attributes
        for (let layoutIndex = 0; layoutIndex < pip.vertexLayouts.length; layoutIndex++) {
            const layout = pip.vertexLayouts[layoutIndex];
            const layoutByteSize = layout.byteSize();
            for (let compIndex = 0; compIndex < layout.components.length; compIndex++) {
                let comp = layout.components[compIndex];
                const attrName = comp[0];
                const attrFormat = comp[1];
                const attrIndex = this.gl.getAttribLocation(pip.shader.glProgram, attrName);
                if (attrIndex != -1) {
                    let attrib = pip.glAttribs[attrIndex];
                    attrib.enabled = true;
                    attrib.vbIndex = layoutIndex;
                    attrib.divisor = layout.stepFunc == StepFunc.PerVertex ? 0 : layout.stepRate;
                    attrib.stride = layoutByteSize;
                    attrib.offset = layout.componentByteOffset(compIndex);
                    attrib.size   = vertexFormatMap[attrFormat][0];
                    attrib.type   = vertexFormatMap[attrFormat][1];
                    attrib.normalized = vertexFormatMap[attrFormat][2];
                }
                else {
                    console.warn("Attribute '", attrName, "' not found in shader!");
                }
            }
        }
        return pip;
    }

    /**
     * Create a new DrawState object.
     * 
     * @param {DrawStateOptions} options - DrawState creation options
     */
    makeDrawState(options: DrawStateOptions): DrawState {
        return new DrawState(options);
    }

    /**
     * Begin a render-pass.
     * 
     * @param {Pass} pass - a Pass object which describes what happens at the start and end of the render pass
     */
    beginPass(pass: Pass) {
        const isDefaultPass: boolean = !pass.ColorAttachments[0].texture;
        /*
        const width = isDefaultPass ? this.gl.canvas.width : pass.colorAttachment[0].texture.width;
        const height = isDefaultPass ? this.gl.canvas.height : pass.colorAttachment[0].texture.height;
        */
        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;

        // FIXME: bind offscreen framebuffer or default framebuffer

        // prepare clear operations
        this.gl.viewport(0, 0, width, height);
        this.gl.disable(WebGLRenderingContext.SCISSOR_TEST);
        this.gl.colorMask(true, true, true, true);
        this.gl.depthMask(true);
        this.gl.stencilMask(0xFF);

        // update cache
        this.cache.scissorTestEnabled = false;
        this.cache.colorWriteMask[0] = true;
        this.cache.colorWriteMask[1] = true;
        this.cache.colorWriteMask[2] = true;
        this.cache.colorWriteMask[3] = true;
        this.cache.depthWriteEnabled = true;
        this.cache.frontStencilWriteMask = 0xFF;
        this.cache.backStencilWriteMask = 0xFF;

        if (isDefaultPass) {
            let clearMask = 0;
            const col : ColorAttachment = pass.ColorAttachments[0];
            const dep = pass.DepthAttachment;
            if (col.loadAction == LoadAction.Clear) {
                clearMask |= WebGLRenderingContext.COLOR_BUFFER_BIT;
                this.gl.clearColor(col.clearColor[0], col.clearColor[1], col.clearColor[2], col.clearColor[3]);
            }
            if (dep.loadAction == LoadAction.Clear) {
                clearMask |= WebGLRenderingContext.DEPTH_BUFFER_BIT|WebGLRenderingContext.STENCIL_BUFFER_BIT;
                this.gl.clearDepth(dep.clearDepth);
                this.gl.clearStencil(dep.clearStencil);
            }
            if (0 != clearMask) {
                this.gl.clear(clearMask);
            }
        }
        else {
            // FIXME: handle offscreen rendering 
        }
    }
    /**
     * Finish current render-pass.
     */
    endPass() {
        // FIXME: perform MSAA resolve
    }
    /**
     * Apply a new viewport area.
     * 
     * @param {number} x        - horizontal pixel position of viewport area
     * @param {number} y        - vertical pixel position of viewport area
     * @param {number} width    - width in pixels of viewport area
     * @param {number} height   - height in pixels of viewport area
     */
    applyViewPort(x: number, y: number, width: number, height: number) {
        this.gl.viewport(x, y, width, height);
    }
    /**
     * Apply new scissor rectangle.
     * 
     * @param {number} x        - horizontal pixel position of scissor rect
     * @param {number} y        - vertical pixel position of scissor rect
     * @param {number} width    - width in pixels of viewport area
     * @param {number} height   - height in pixels of viewport area 
     */
    applyScissorRect(x: number, y: number, width: number, height: number) {
        this.gl.scissor(x, y, width, height);
    }
    /**
     * Apply new resource bindings.
     * 
     * @param {DrawState} drawState - a DrawState object with the new resource bindings
     */
    applyDrawState(drawState: DrawState) {

        this.curPrimType = drawState.pipeline.primitiveType;

        // update render state
        this.applyState(drawState.pipeline.state, false);

        // apply shader program
        if (this.curProgram != drawState.pipeline.shader.glProgram) {
            this.curProgram = drawState.pipeline.shader.glProgram;
            this.gl.useProgram(this.curProgram);
        }

        // apply index and vertex data
        this.curIndexType = drawState.pipeline.indexType;
        this.curIndexSize = drawState.pipeline.indexSize;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, drawState.indexBuffer);
        let curVB: WebGLBuffer = null;
        for (let attrIndex = 0; attrIndex < MaxNumVertexAttribs; attrIndex++) {
            let attrib = drawState.pipeline.glAttribs[attrIndex];
            // FIXME: implement a state cache for vertex attrib bindings
            if (attrib.enabled) {
                if (drawState.vertexBuffers[attrib.vbIndex] != curVB) {
                    curVB = drawState.vertexBuffers[attrib.vbIndex].glBuffer;
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, curVB);
                }
                this.gl.vertexAttribPointer(attrIndex, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
                this.gl.enableVertexAttribArray(attrIndex);
                // FIMXE: WebGL2 vertex attrib divisor!
            }
            else {
                this.gl.disableVertexAttribArray(attrIndex);
            }
        }
    }
    applyUniform(name: string, x: number) {

    }
    /**
     * Draw primitive range with current draw settings.
     * 
     * @param {number} baseElement  - index of first vertex or index
     * @param {number} numElements  - number of vertices or indices
     * @param {number} numInstances - number of instances (default: 1)
     */
    draw(baseElement: number, numElements: number, numInstances: number = 1) {
        if (IndexType.None == this.curIndexType) {
            // non-indexed rendering
            if (1 == numInstances) {
                this.gl.drawArrays(this.curPrimType, baseElement, numElements);
            }
            else {
                // FIXME: instanced rendering!
            }
        }
        else {
            // indexed rendering
            let indexOffset = baseElement * this.curIndexSize;
            if (1 == numInstances) {
                this.gl.drawElements(this.curPrimType, numElements, this.curIndexType, indexOffset);
            }
            else {
                // FIXME: instanced rendering!
            }
        }
    }
    /**
     * Finish current frame, pass function pointer of next frame's draw function.
     * 
     * @param {() => void} drawFunc - the next frame's draw function
     */
    commitFrame(drawFunc: () => void)  {
        requestAnimationFrame(drawFunc);
    }

    private applyState(state: PipelineState, force: boolean) {
        // apply depth-stencil state changes
        if (force || (this.cache.depthCmpFunc != state.depthCmpFunc)) {
            this.cache.depthCmpFunc = state.depthCmpFunc;
            this.gl.depthFunc(state.depthCmpFunc);
        }
        if (force || (this.cache.depthWriteEnabled != state.depthWriteEnabled)) {
            this.cache.depthWriteEnabled = state.depthWriteEnabled;
            this.gl.depthMask(state.depthWriteEnabled);
        }
        if (force || (this.cache.stencilEnabled != state.stencilEnabled)) {
            this.cache.stencilEnabled = state.stencilEnabled;
            if (state.stencilEnabled) this.gl.enable(this.gl.STENCIL_TEST);
            else this.gl.disable(this.gl.STENCIL_TEST);
        }
        let sCmpFunc = state.frontStencilCmpFunc;
        let sReadMask = state.frontStencilReadMask;
        let sRef = state.frontStencilRef;
        if (force || 
            (this.cache.frontStencilCmpFunc != sCmpFunc) ||
            (this.cache.frontStencilReadMask != sReadMask) ||
            (this.cache.frontStencilRef != sRef)) 
        {                
            this.cache.frontStencilCmpFunc = sCmpFunc;
            this.cache.frontStencilReadMask = sReadMask;
            this.cache.frontStencilRef = sRef;
            this.gl.stencilFuncSeparate(this.gl.FRONT, sCmpFunc, sRef, sReadMask);
        }
        sCmpFunc = state.backStencilCmpFunc;
        sReadMask = state.backStencilReadMask;
        sRef = state.backStencilRef;
        if (force || 
            (this.cache.backStencilCmpFunc != sCmpFunc) ||
            (this.cache.backStencilReadMask != sReadMask) ||
            (this.cache.backStencilRef != sRef)) 
        {                
            this.cache.backStencilCmpFunc = sCmpFunc;
            this.cache.backStencilReadMask = sReadMask;
            this.cache.backStencilRef = sRef;
            this.gl.stencilFuncSeparate(this.gl.BACK, sCmpFunc, sRef, sReadMask);
        }
        let sFailOp = state.frontStencilFailOp;
        let sDepthFailOp = state.frontStencilDepthFailOp;
        let sPassOp = state.frontStencilPassOp;
        if (force ||
            (this.cache.frontStencilFailOp != sFailOp) ||
            (this.cache.frontStencilDepthFailOp != sDepthFailOp) ||
            (this.cache.frontStencilPassOp != sPassOp)) 
        {    
            this.cache.frontStencilFailOp = sFailOp;
            this.cache.frontStencilDepthFailOp = sDepthFailOp;
            this.cache.frontStencilPassOp = sPassOp;
            this.gl.stencilOpSeparate(this.gl.FRONT, sFailOp, sDepthFailOp, sPassOp);
        }
        sFailOp = state.backStencilFailOp;
        sDepthFailOp = state.backStencilDepthFailOp;
        sPassOp = state.backStencilPassOp;
        if (force ||
            (this.cache.backStencilFailOp != sFailOp) ||
            (this.cache.backStencilDepthFailOp != sDepthFailOp) ||
            (this.cache.backStencilPassOp != sPassOp)) 
        {    
            this.cache.backStencilFailOp = sFailOp;
            this.cache.backStencilDepthFailOp = sDepthFailOp;
            this.cache.backStencilPassOp = sPassOp;
            this.gl.stencilOpSeparate(this.gl.BACK, sFailOp, sDepthFailOp, sPassOp);
        }
        if (force || (this.cache.frontStencilWriteMask != state.frontStencilWriteMask)) {
            this.cache.frontStencilWriteMask = state.frontStencilWriteMask;
            this.gl.stencilMaskSeparate(this.gl.FRONT, state.frontStencilWriteMask)
        }
        if (force || (this.cache.backStencilWriteMask != state.backStencilWriteMask)) {
            this.cache.backStencilWriteMask = state.backStencilWriteMask;
            this.gl.stencilMaskSeparate(this.gl.BACK, state.backStencilWriteMask);
        }

        // apply blend state changes
        if (force || (this.cache.blendEnabled != state.blendEnabled)) {
            this.cache.blendEnabled = state.blendEnabled;
            this.gl.enable(this.gl.BLEND);
        }
        if (force ||
            (this.cache.blendSrcFactorRGB != state.blendSrcFactorRGB) ||
            (this.cache.blendDstFactorRGB != state.blendDstFactorRGB) ||
            (this.cache.blendSrcFactorAlpha != state.blendSrcFactorAlpha) ||
            (this.cache.blendDstFactorAlpha != state.blendDstFactorAlpha)) 
        {
            this.cache.blendSrcFactorRGB = state.blendSrcFactorRGB;
            this.cache.blendDstFactorRGB = state.blendDstFactorRGB;
            this.cache.blendSrcFactorAlpha = state.blendSrcFactorAlpha;
            this.cache.blendDstFactorAlpha = state.blendDstFactorAlpha;
            this.gl.blendFuncSeparate(state.blendSrcFactorRGB, 
                                      state.blendDstFactorRGB, 
                                      state.blendSrcFactorAlpha, 
                                      state.blendDstFactorAlpha);
        } 
        if (force ||
            (this.cache.blendOpRGB != state.blendOpRGB) ||
            (this.cache.blendOpAlpha != state.blendOpAlpha))
        {
            this.cache.blendOpRGB = state.blendOpRGB;
            this.cache.blendOpAlpha = state.blendOpAlpha;
            this.gl.blendEquationSeparate(state.blendOpRGB, state.blendOpAlpha);
        }
        if (force || 
            (this.cache.colorWriteMask[0] != state.colorWriteMask[0]) ||
            (this.cache.colorWriteMask[1] != state.colorWriteMask[1]) ||
            (this.cache.colorWriteMask[2] != state.colorWriteMask[2]) ||
            (this.cache.colorWriteMask[3] != state.colorWriteMask[3])) 
        {
            this.cache.colorWriteMask[0] = state.colorWriteMask[0];
            this.cache.colorWriteMask[1] = state.colorWriteMask[1];
            this.cache.colorWriteMask[2] = state.colorWriteMask[2];
            this.cache.colorWriteMask[3] = state.colorWriteMask[3];
            this.gl.colorMask(state.colorWriteMask[0], 
                              state.colorWriteMask[1], 
                              state.colorWriteMask[2],
                              state.colorWriteMask[3]);
        }
        if (force || 
            (this.cache.blendColor[0] != state.blendColor[0]) ||
            (this.cache.blendColor[1] != state.blendColor[1]) ||
            (this.cache.blendColor[2] != state.blendColor[2]) ||
            (this.cache.blendColor[3] != state.blendColor[3]))
        {
            this.cache.blendColor[0] = state.blendColor[0];
            this.cache.blendColor[1] = state.blendColor[1];
            this.cache.blendColor[2] = state.blendColor[2];
            this.cache.blendColor[3] = state.blendColor[3];
            this.gl.blendColor(state.blendColor[0],
                               state.blendColor[1],
                               state.blendColor[2],
                               state.blendColor[3]);
        }

        // apply rasterizer state
        if (force || (this.cache.cullFaceEnabled != state.cullFaceEnabled)) {
            this.cache.cullFaceEnabled = state.cullFaceEnabled;
            if (state.cullFaceEnabled) this.gl.enable(this.gl.CULL_FACE);
            else                       this.gl.disable(this.gl.CULL_FACE);            
        }
        if (force || (this.cache.cullFace != state.cullFace)) {
            this.cache.cullFace = state.cullFace;
            this.gl.cullFace(state.cullFace);
        }
        if (force || (this.cache.scissorTestEnabled != state.scissorTestEnabled)) {
            this.cache.scissorTestEnabled = state.scissorTestEnabled;
            if (state.scissorTestEnabled) this.gl.enable(this.gl.SCISSOR_TEST);
            else                          this.gl.disable(this.gl.SCISSOR_TEST);
        }
    }
}

/**
 * WebGL and canvas initialization options.
 */
export interface GfxOptions {
    /** name of existing HTML canvas (default: 'canvas') */
    Canvas?: string;       
    /** new width of canvas (default: don't change canvas width) */ 
    Width?: number;
    /** new  height of canvas (default: don't change canvas height) */
    Height?: number;
    /** whether drawing buffer should have alpha channel (default: true) */
    Alpha?: boolean;
    /** whether drawing buffer should have a depth buffer (default: true) */
    Depth?: boolean;
    /** whether drawing buffer should have a stencil buffer (default: false) */
    Stencil?: boolean;
    /** whether drawing buffer should be anti-aliased (default: true) */
    AntiAlias?: boolean;
    /** whether drawing buffer contains pre-multiplied-alpha colors (default: true) */
    PreMultipliedAlpha?: boolean;
    /** whether content of drawing buffer should be preserved (default: false) */
    PreserveDrawingBuffer?: boolean;
    /** whether to create a context for low-power-consumption (default: false) */
    PreferLowPowerToHighPerformance?: boolean;
    /** whether context creation fails if performance would be low (default: false) */
    FailIfMajorPerformanceCaveat?: boolean;
    /** whether to create a high-resolution context on Retina-type displays (default: false) */
    HighDPI?: boolean;
}

/**
 * Buffer creation options.
 */
export interface BufferOptions {
    /** whether the buffer contains vertex- or index-data */
    Type: BufferType;
    /** whether the buffer is immutable or can be updated after creation */
    Usage?: Usage;
    /** optional content initialization data */
    Data?: ArrayBufferView | ArrayBuffer;
    /** buffer size in bytes if no init data provided */
    LengthInBytes?: number; 
}

/**
 * A Buffer object for vertex- or index-data.
 */
export class Buffer {
    readonly type: BufferType;
    readonly usage: Usage;
    readonly glBuffer: WebGLBuffer;

    constructor(o: BufferOptions, glBuffer: WebGLBuffer) {
        this.type = o.Type;
        this.usage = some(o.Usage, Usage.Immutable);
        this.glBuffer = glBuffer;
    }
}

/**
 * Vertex input layout description.
 */
export interface VertexLayoutOptions {
    /** vertex component names and formats */
    Components: [ string, VertexFormat ][];
    /** advance per-vertex or per-instance */ 
    StepFunc?: StepFunc;
    /** the vertex step-rate (divisor) for instancing */
    StepRate?: number;
}

class VertexLayout {
    components: [string, VertexFormat][];
    stepFunc?: StepFunc;
    stepRate?: number;

    constructor(o: VertexLayoutOptions) {
        this.components = o.Components;
        this.stepFunc = some(o.StepFunc, StepFunc.PerVertex);
        this.stepRate = some(o.StepRate, 1);
    }

    static vertexFormatByteSize(fmt: VertexFormat): number {
        switch (fmt) {
            case VertexFormat.Float:
            case VertexFormat.Byte4:
            case VertexFormat.Byte4N:
            case VertexFormat.UByte4:
            case VertexFormat.UByte4N:
            case VertexFormat.Short2:
            case VertexFormat.Short2N:
                return 4;
            case VertexFormat.Float2:
            case VertexFormat.Short4:
            case VertexFormat.Short4N:
                return 8;
            case VertexFormat.Float3:
                return 12;
            case VertexFormat.Float4:
                return 16;
        }
    }

    byteSize(): number {
        let size = 0;
        for (let comp of this.components) {
            size += VertexLayout.vertexFormatByteSize(comp[1]);
        }
        return size;
    }

    componentByteOffset(compIndex: number): number {
        let offset = 0;
        for (let i = 0; i < compIndex; i++) {
            offset += VertexLayout.vertexFormatByteSize(this.components[i][1]);
        }
        return offset;
    }
}

export interface PipelineOptions {

    VertexLayouts: VertexLayoutOptions[];
    Shader: Shader;
    PrimitiveType?: PrimitiveType;
    IndexType?: IndexType;
    
    // common RGB and Alpha blend state options
    ColorWriteMask?: [boolean, boolean, boolean, boolean];
    BlendEnabled?: boolean;
    BlendColor?: [number, number, number, number];
    BlendSrcFactor?: BlendFactor;
    BlendDstFactor?: BlendFactor;
    BlendOp?: BlendOp;

    // separate RGB blend state options
    BlendSrcFactorRGB?: BlendFactor;
    BlendDstFactorRGB?: BlendFactor;
    BlendOpRGB?: BlendOp;

    // separate alpha blend state options
    BlendSrcFactorAlpha?: BlendFactor;
    BlendDstFactorAlpha?: BlendFactor;
    BlendOpAlpha?: BlendOp;

    // common front and back stencil options
    StencilEnabled?: boolean;
    StencilFailOp?: StencilOp;
    StencilDepthFailOp?: StencilOp;
    StencilPassOp?: StencilOp;
    StencilCmpFunc?: CompareFunc;
    StencilRef?: number;
    StencilReadMask?: number;
    StencilWriteMask?: number;

    // separate front stencil options
    FrontStencilFailOp?: StencilOp;
    FrontStencilDepthFailOp?: StencilOp;
    FrontStencilPassOp?: StencilOp;
    FrontStencilCmpFunc?: CompareFunc;
    FrontStencilRef?: number;
    FrontStencilReadMask?: number;
    FrontStencilWriteMask?: number;

    // separate back stencil options
    BackStencilFailOp?: StencilOp;
    BackStencilDepthFailOp?: StencilOp;
    BackStencilPassOp?: StencilOp;
    BackStencilCmpFunc?: CompareFunc;
    BackStencilRef?: number;
    BackStencilReadMask?: number;
    BackStencilWriteMask?: number;

    // depth-state options
    DepthCmpFunc?: CompareFunc;
    DepthWriteEnabled?: boolean;

    // rasterizer-state options
    CullFaceEnabled?: boolean;
    CullFace?: Face;
    ScissorTestEnabled?: boolean;
}

class PipelineState {
    blendEnabled: boolean;
    blendSrcFactorRGB: BlendFactor;
    blendDstFactorRGB: BlendFactor;
    blendOpRGB: BlendOp;
    blendSrcFactorAlpha: BlendFactor;
    blendDstFactorAlpha: BlendFactor;
    blendOpAlpha: BlendOp;
    colorWriteMask: [boolean, boolean, boolean, boolean];
    blendColor: [number, number, number, number];

    stencilEnabled: boolean;

    frontStencilFailOp: StencilOp;
    frontStencilDepthFailOp: StencilOp;
    frontStencilPassOp: StencilOp;
    frontStencilCmpFunc: CompareFunc;
    frontStencilReadMask: number;
    frontStencilWriteMask: number;
    frontStencilRef: number;

    backStencilFailOp: StencilOp;
    backStencilDepthFailOp: StencilOp;
    backStencilPassOp: StencilOp;
    backStencilCmpFunc: CompareFunc;
    backStencilReadMask: number;
    backStencilWriteMask: number;
    backStencilRef: number;

    depthCmpFunc: CompareFunc;
    depthWriteEnabled: boolean;

    cullFaceEnabled: boolean;
    cullFace: Face;
    scissorTestEnabled: boolean;

    constructor(o: PipelineOptions) {
        this.blendEnabled = some(o.BlendEnabled, false);
        this.blendSrcFactorRGB = some3(o.BlendSrcFactorRGB, o.BlendSrcFactor, BlendFactor.One);
        this.blendDstFactorRGB = some3(o.BlendDstFactorRGB, o.BlendDstFactor, BlendFactor.Zero);
        this.blendOpRGB = some3(o.BlendOpRGB, o.BlendOp, BlendOp.Add);
        this.blendSrcFactorAlpha = some3(o.BlendSrcFactorAlpha, o.BlendSrcFactor, BlendFactor.One);
        this.blendDstFactorAlpha = some3(o.BlendDstFactorAlpha, o.BlendDstFactor, BlendFactor.Zero);
        this.blendOpAlpha = some3(o.BlendOpAlpha, o.BlendOp, BlendOp.Add);
        this.colorWriteMask = some(o.ColorWriteMask, [true, true, true, true] as [boolean, boolean, boolean, boolean]);
        this.blendColor = some(o.BlendColor, [1.0, 1.0, 1.0, 1.0] as [number, number, number, number]);

        this.stencilEnabled = some(o.StencilEnabled, false);

        this.frontStencilFailOp = some3(o.FrontStencilFailOp, o.StencilFailOp, StencilOp.Keep);
        this.frontStencilDepthFailOp = some3(o.FrontStencilDepthFailOp, o.StencilDepthFailOp, StencilOp.Keep);
        this.frontStencilPassOp = some3(o.FrontStencilPassOp, o.StencilPassOp, StencilOp.Keep);
        this.frontStencilCmpFunc = some3(o.FrontStencilCmpFunc, o.StencilCmpFunc, CompareFunc.Always);
        this.frontStencilReadMask = some3(o.FrontStencilReadMask, o.StencilReadMask, 0xFF);
        this.frontStencilWriteMask = some3(o.FrontStencilWriteMask, o.StencilWriteMask, 0xFF);
        this.frontStencilRef = some3(o.FrontStencilRef, o.StencilRef, 0);

        this.backStencilFailOp = some3(o.BackStencilFailOp, o.StencilFailOp, StencilOp.Keep);
        this.backStencilDepthFailOp = some3(o.BackStencilDepthFailOp, o.StencilDepthFailOp, StencilOp.Keep);
        this.backStencilPassOp = some3(o.BackStencilPassOp, o.StencilPassOp, StencilOp.Keep);
        this.backStencilCmpFunc = some3(o.BackStencilCmpFunc, o.StencilCmpFunc, CompareFunc.Always);
        this.backStencilReadMask = some3(o.BackStencilReadMask, o.StencilReadMask, 0xFF);
        this.backStencilWriteMask = some3(o.BackStencilWriteMask, o.StencilWriteMask, 0xFF);
        this.backStencilRef = some3(o.BackStencilRef, o.StencilRef, 0);

        this.depthCmpFunc = some(o.DepthCmpFunc, CompareFunc.Always);
        this.depthWriteEnabled = some(o.DepthWriteEnabled, false);

        this.cullFaceEnabled = some(o.CullFaceEnabled, false);
        this.cullFace = some(o.CullFace, Face.Back);
        this.scissorTestEnabled = some(o.ScissorTestEnabled, false);
    }
}

class glAttrib {
    enabled: boolean = false;
    vbIndex: number = 0;
    divisor: number = 0;
    stride: number = 0;
    size: number = 0;
    normalized: boolean = false;
    offset: number = 0;
    type: GLenum = 0;    
}

export class Pipeline {
    readonly vertexLayouts: VertexLayout[];
    readonly shader: Shader;
    readonly primitiveType: PrimitiveType;
    readonly state: PipelineState;
    readonly glAttribs: glAttrib[];
    readonly indexType: IndexType;
    readonly indexSize: number;

    constructor(o: PipelineOptions) {
        this.vertexLayouts = [];
        for (let vlOpt of o.VertexLayouts) {
            this.vertexLayouts.push(new VertexLayout(vlOpt));
        }
        this.shader = o.Shader;
        this.primitiveType = some(o.PrimitiveType, PrimitiveType.Triangles);
        this.state = new PipelineState(o);
        this.glAttribs = [];
        for (let i = 0; i < MaxNumVertexAttribs; i++) {
            this.glAttribs.push(new glAttrib());
        }
        this.indexType = some(o.IndexType, IndexType.None);
        switch (this.indexType) {
            case IndexType.UShort: this.indexSize = 2; break;
            case IndexType.UInt: this.indexSize = 4; break;
            default: this.indexSize = 0; break; 
        }
    }
}

export interface ShaderOptions {
    VertexShader: string,
    FragmentShader: string,
}

export class Shader {
    readonly glProgram: WebGLProgram;

    constructor(glProgram: WebGLProgram) {
        this.glProgram = glProgram;
    }  
}

export interface DrawStateOptions {
    Pipeline: Pipeline;
    VertexBuffers: Buffer[];
    IndexBuffer?: Buffer;
    VSTextures?: Texture[];
    FSTextures?: Texture[];
}

export class DrawState {
    pipeline: Pipeline;
    vertexBuffers: Buffer[];
    indexBuffer: Buffer;
    vsTextures: Texture[];
    fsTextures: Texture[];

    constructor(o: DrawStateOptions) {
        this.pipeline = o.Pipeline;
        this.vertexBuffers = o.VertexBuffers;
        this.indexBuffer = some(o.IndexBuffer, null);
        this.vsTextures = some(o.VSTextures, []);
        this.fsTextures = some(o.FSTextures, []);
    }
}

export class Texture {
    attrs: TextureAttrs;
}

export enum BufferType {
    VertexBuffer = WebGLRenderingContext.ARRAY_BUFFER,
    IndexBuffer = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}

export enum IndexType {
    None = WebGLRenderingContext.NONE, 
    UShort = WebGLRenderingContext.UNSIGNED_SHORT,
    UInt = WebGLRenderingContext.UNSIGNED_INT,
}

export enum PixelFormat {
    NONE,
    RGBA8,
    RGB8,
    RGBA4,
    RGB565,
    RGB5_A1,
    RGB10_A2,
    RGBA32F,
    RGBA16F,
    R32F,
    R16F,
    DEPTH,
    DEPTHSTENCIL,
}

export enum VertexFormat {
    Float,
    Float2,
    Float3,
    Float4,
    Byte4,
    Byte4N,
    UByte4,
    UByte4N,
    Short2,
    Short2N,
    Short4,
    Short4N,
}

export enum PrimitiveType {
    Points = WebGLRenderingContext.POINTS,
    Lines = WebGLRenderingContext.LINES,
    LineStrip = WebGLRenderingContext.LINE_STRIP,
    Triangles = WebGLRenderingContext.TRIANGLES,
    TriangleStrip = WebGLRenderingContext.TRIANGLE_STRIP,
}

export enum Filter {
    Nearest,
    Linear,
}

export enum Wrap {
    ClampToEdge = WebGLRenderingContext.CLAMP_TO_EDGE,
    Repeat = WebGLRenderingContext.REPEAT,
    MirroredRepeat = WebGLRenderingContext.MIRRORED_REPEAT,
}

export enum TextureType {
    Texture2D = WebGLRenderingContext.TEXTURE_2D,
    TextureCube = WebGLRenderingContext.TEXTURE_CUBE_MAP,
}

export enum Usage {
    Immutable = WebGLRenderingContext.STATIC_DRAW,
    Dynamic = WebGLRenderingContext.DYNAMIC_DRAW,
    Stream = WebGLRenderingContext.STREAM_DRAW,
}

export enum Face {
    Front = WebGLRenderingContext.FRONT,
    Back = WebGLRenderingContext.BACK,
    Both = WebGLRenderingContext.FRONT_AND_BACK,
}

export enum CompareFunc {
    Never = WebGLRenderingContext.NEVER,
    Less = WebGLRenderingContext.LESS,
    Equal = WebGLRenderingContext.EQUAL,
    LessEqual = WebGLRenderingContext.LEQUAL,
    Greater = WebGLRenderingContext.GREATER,
    NotEqual = WebGLRenderingContext.NOTEQUAL,
    GreaterEqual = WebGLRenderingContext.GEQUAL,
    Always = WebGLRenderingContext.ALWAYS,
}

export enum StencilOp {
    Keep = WebGLRenderingContext.KEEP,
    Zero = WebGLRenderingContext.ZERO,
    Replace = WebGLRenderingContext.REPLACE,
    IncrClamp = WebGLRenderingContext.INCR,
    DecrClamp = WebGLRenderingContext.DECR,
    Invert = WebGLRenderingContext.INVERT,
    IncrWrap = WebGLRenderingContext.INCR_WRAP,
    DecrWrap = WebGLRenderingContext.DECR_WRAP,
}

export enum BlendFactor {
    Zero = WebGLRenderingContext.ZERO,
    One = WebGLRenderingContext.ONE,
    SrcColor = WebGLRenderingContext.SRC_COLOR,
    OneMinusSrcColor = WebGLRenderingContext.ONE_MINUS_SRC_COLOR,
    SrcAlpha = WebGLRenderingContext.SRC_ALPHA,
    OneMinusSrcAlpha = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    DstColor = WebGLRenderingContext.DST_COLOR,
    OneMinusDstColor = WebGLRenderingContext.ONE_MINUS_DST_COLOR,
    DstAlpha = WebGLRenderingContext.DST_ALPHA,
    OneMinusDstAlpha = WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
    SrcAlphaSaturated = WebGLRenderingContext.SRC_ALPHA_SATURATE,
    BlendColor = WebGLRenderingContext.CONSTANT_COLOR,
    OneMinusBlendColor = WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR,
    BlendAlpha = WebGLRenderingContext.CONSTANT_ALPHA,
    OneMinusBlendAlpha = WebGLRenderingContext.ONE_MINUS_CONSTANT_ALPHA,
}

export enum BlendOp {
    Add = WebGLRenderingContext.FUNC_ADD,
    Subtract = WebGLRenderingContext.FUNC_SUBTRACT,
    ReverseSubtract = WebGLRenderingContext.FUNC_REVERSE_SUBTRACT,
}

export enum StepFunc {
    PerVertex,
    PerInstance,
}

export enum LoadAction {
    DontCare,
    Load,
    Clear,
}

export enum StoreAction {
    DontCare,
    Store,
    Resolve,
    StoreAndResolve,
}

export interface TextureAttrs {
    Type?: TextureType;
    Width?: number;
    Height?: number;
    Depth?: number;
    ColorFormat?: PixelFormat;
    DepthFormat?: PixelFormat;
    Usage?: Usage;
    RenderTarget?: boolean;
    GenerateMipMaps?: boolean;
    SampleCount?: number;
    Sampler?: SamplerState;
}

export interface SamplerState {
    WrapU?: Wrap;
    WrapV?: Wrap;
    WrapW?: Wrap;
    MagFilter?: Filter;
    MinFilter?: Filter;
    MipFilter?: Filter;
}

export interface ColorAttachmentOptions {
    Texture?: Texture;
    MipLevel?: number;
    Slice?: number;
    LoadAction?: LoadAction;
    ClearColor?: [number, number, number, number];
}

class ColorAttachment {
    texture: Texture;
    mipLevel: number;
    slice: number;
    loadAction: LoadAction;
    clearColor: [number, number, number, number];
    
    constructor(o: ColorAttachmentOptions) {
        this.texture = some(o.Texture, null);
        this.mipLevel = some(o.MipLevel, 0);
        this.slice = some(o.Slice, 0);
        this.loadAction = some(o.LoadAction, LoadAction.Clear);
        this.clearColor = some(o.ClearColor, [0.0, 0.0, 0.0, 1.0] as [number, number, number, number]);
    }
}

export interface DepthAttachmentOptions {
    Texture?: Texture,
    LoadAction?: LoadAction,
    ClearDepth?: number,
    ClearStencil?: number,    
}

class DepthAttachment {
    texture: Texture;
    loadAction: LoadAction;
    clearDepth: number;
    clearStencil: number;

    constructor(o: DepthAttachmentOptions) {
        this.texture = some(o.Texture, null);
        this.loadAction = some(o.LoadAction, LoadAction.Clear);
        this.clearDepth = some(o.ClearDepth, 1.0);
        this.clearStencil = some(o.ClearStencil, 0);
    }
}

export interface PassOptions {
    ColorAttachments?: ColorAttachmentOptions[];
    DepthAttachment?: DepthAttachmentOptions;
    StoreAction?: StoreAction;
}

class Pass {
    ColorAttachments: ColorAttachment[];
    DepthAttachment: DepthAttachment;
    StoreAction: StoreAction;

    constructor(o: PassOptions) {
        this.ColorAttachments = [];
        if (o.ColorAttachments == null) {
            this.ColorAttachments.push(new ColorAttachment({}));
        }
        else {
            for (let colAttrs of o.ColorAttachments) {
                this.ColorAttachments.push(new ColorAttachment(colAttrs))
            }
        }
        this.DepthAttachment = new DepthAttachment(some(o.DepthAttachment, {}));
        this.StoreAction = some(o.StoreAction, StoreAction.DontCare);
    }
}

}