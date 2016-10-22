'use strict'

module altai {

const MaxNumColorAttachments = 4;

function some<T>(opt: T, def: T): T {
    return opt != null ? opt : def;
}

export class Gfx {
    constructor(attrs: GfxAttrs) {
        this.state = new GfxState(attrs);

        let glContextAttrs = {
            alpha: false,
            depth: this.state.depthFormat != PixelFormat.NONE,
            stencil: this.state.depthFormat == PixelFormat.DEPTHSTENCIL,
            antialias: this.state.msaa,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,            
        }
        let canvas = document.getElementById(this.state.canvas) as HTMLCanvasElement;        
        canvas.width = this.state.width;
        canvas.height = this.state.height;
        this.gl = canvas.getContext("webgl", glContextAttrs) as WebGLRenderingContext || 
                  canvas.getContext("experimental-webgl", glContextAttrs) as WebGLRenderingContext;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
    }

    createVertexBuffer(usage: Usage): Buffer {
        return new Buffer(usage, this.gl.createBuffer());
    }

    createVertexBufferWithData(usage: Usage, data: number[]): Buffer {
        let glBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);
        let glUsage = GLTypes.usage(usage);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(data), glUsage);
        return new Buffer(usage, glBuffer);
    }

    beginPass(attrs: PassAttrs) {
        const pass = new Pass(attrs);
        const isDefaultPass: boolean = !pass.colorAttachments[0].texture;
        /*
        const width = isDefaultPass ? this.gl.canvas.width : pass.colorAttachment[0].texture.width;
        const height = isDefaultPass ? this.gl.canvas.height : pass.colorAttachment[0].texture.height;
        */
        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;

        // FIXME: bind offscreen framebuffer or default framebuffer

        // prepare clear operations
        // FIXME: use state cache!
        this.gl.viewport(0, 0, width, height);
        this.gl.disable(WebGLRenderingContext.SCISSOR_TEST);
        this.gl.colorMask(true, true, true, true);
        this.gl.depthMask(true);
        this.gl.stencilMask(0xFF);

        if (isDefaultPass) {
            let clearMask = 0;
            const col : ColorAttachment = pass.colorAttachments[0];
            const dep = pass.depthAttachment;
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
    endPass() {
        // FIXME: perform MSAA resolve
    }
    applyViewPort(x: number, y: number, width: number, height: number) {
        this.gl.viewport(x, y, width, height);
    }
    applyScissorRect(x: number, y: number, width: number, height: number) {
        this.gl.scissor(x, y, width, height);
    }
    applyDrawState(drawState: DrawState) {

    }
    applyUniform(name: string, x: number) {

    }
    draw(baseElement: number, numElements: number, numInstances: number) {

    }
    commitFrame(drawFunc: () => void)  {
        requestAnimationFrame(drawFunc);
    }

    state: GfxState;
    private gl : WebGLRenderingContext;
}

export interface GfxAttrs {
    canvas?: string;
    width?: number;
    height?: number;
    colorFormat?: PixelFormat;
    depthFormat?: PixelFormat;
    msaa?: boolean;
    highDPI?: boolean;
}

class GfxState {
    canvas: string;
    width: number;
    height: number;
    colorFormat: PixelFormat;
    depthFormat: PixelFormat;
    msaa: boolean;
    highDPI: boolean;
    constructor(attrs: GfxAttrs) {
        this.canvas = some(attrs.canvas, "canvas");
        this.width  = some(attrs.width, 640);
        this.height = some(attrs.height, 480);
        this.colorFormat = some(attrs.colorFormat, PixelFormat.RGBA8);
        this.depthFormat = some(attrs.depthFormat, PixelFormat.DEPTHSTENCIL);
        this.msaa = some(attrs.msaa, false);
        this.highDPI = some(attrs.highDPI, false);        
    }
}

export class DrawState {
    pipeline: Pipeline;
    vertexBuffers: Buffer[];
    indexBuffer: Buffer;
    vsTextures: Texture[];
    fsTextures: Texture[];
}

export class Texture {
    attrs: TextureAttrs;
}

export class Buffer {
    readonly usage: Usage;
    readonly glBuffer: WebGLBuffer;

    constructor(usage: Usage, glBuffer: WebGLBuffer) {
        this.usage = usage;
        this.glBuffer = glBuffer;
    }
}

export class Shader {
    attrs: ShaderAttrs;
}

export class Pipeline {
    attrs: PipelineAttrs;
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
    Int10_2N,
    UInt10_2N,
}

export enum IndexFormat {
    Index16,
    Index32,        
}

export enum PrimitiveType {
    Points,
    Lines,
    LineStrip,
    Triangles,
    TriangleStrip,
}

export enum Filter {
    Nearest,
    Linear,
}

export enum Wrap {
    ClampToEdge,
    Repeat,
    MirroredRepeat,
}

export enum TextureType {
    Texture2D,
    TextureCube,
    Texture3D,
    TextureArray,
}

export enum Usage {
    Immutable,
    Dynamic,
    Stream,
}

export enum Face {
    Front,
    Back,
    Both,
}

export enum CompareFunc {
    Never,
    Less,
    Equal,
    LessEqual,
    Greater,
    NotEqual,
    GreaterEqual,
    Always,
}

export enum StencilOp {
    Keep,
    Zero,
    Replace,
    IncrClamp,
    DecrClamp,
    Invert,
    IncrWrap,
    DecrWrap,
}

export enum BlendFactor {
    Zero,
    One,
    SrcColor,
    OneMinusSrcColor,
    SrcAlpha,
    OneMinusSrcAlpha,
    DstColor,
    OneMinusDstColor,
    DstAlpha,
    OneMinusDstAlpha,
    SrcAlphaSaturated,
    BlendColor,
    OneMinusBlendColor,
    BlendAlpha,
    OneMinusBlendAlpha,
}

export enum BlendOp {
    Add,
    Subtract,
    ReverseSubtract,
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

export enum WriteMask {
    Red = 1<<0,
    Green = 1<<1,
    Blue = 1<<2,
    Alpha = 1<<3,
    All = Red|Green|Blue|Alpha,
}

export class VertexComponent {
    name: string;
    format: VertexFormat;
}

export class VertexLayout {
    components: VertexComponent[];
    stepFunc: StepFunc = StepFunc.PerVertex;
    stepRate: number = 1;
}

export interface TextureAttrs {
    type?: TextureType;
    width?: number;
    height?: number;
    depth?: number;
    colorFormat?: PixelFormat;
    depthFormat?: PixelFormat;
    usage?: Usage;
    renderTarget?: boolean;
    generateMipMaps?: boolean;
    msaaSampleCount?: number;
    sampler?: SamplerState;
}

export interface ShaderAttrs {
    vs: string;
    fs: string;
}

export interface PipelineAttrs {
    blendState?: BlendState;
    depthStencilState?: DepthStencilState;
    rasterizerState?: RasterizerState;
    vertexLayouts: VertexLayout[];
    primitiveType?: PrimitiveType;
    shader: Shader;
}

export interface SamplerState {
    wrapU?: Wrap;
    wrapV?: Wrap;
    wrapW?: Wrap;
    magFilter?: Filter;
    minFilter?: Filter;
    mipFilter?: Filter;
}

export interface BlendState {
    srcFactorRGB?: BlendFactor;
    dstFactorRGB?: BlendFactor;
    blendOpRgb?: BlendOp;
    srcFactorAlpha?: BlendFactor;
    dstFactorAlpha?: BlendFactor;
    blendOpAlpha?: BlendOp;
    writeMask?: WriteMask;
    blendColorRed?: number;
    blendColorBlue?: number;
    blendColorGreen?: number;
    blendColorAlpha?: number;
}

export interface StencilState {
    failOp?: StencilOp;
    depthFailOp?: StencilOp;
    passOp?: StencilOp;
    cmpFunc?: CompareFunc;
}

export interface DepthStencilState {
    stencilFront?: StencilState;
    stencilBack?: StencilState;
    depthCmpFunc?: CompareFunc;
    depthWriteEnabled?: boolean;
    stencilEnabled?: boolean;
    stencilReadMask?: number;
    stencilWriteMask?: number;
    stencilRef?: number;
}

export interface RasterizerState {
    cullFaceEnabled?: boolean;
    cullFace?: Face;
    scissorTestEnabled?: boolean;
    ditherEnabled?: boolean;
    alphaCoverageEnabled?: boolean;
}

//------------------------------------------------------------------------------
export interface ColorAttachmentAttrs {
    texture?: Texture;
    mipLevel?: number;
    slice?: number;
    loadAction?: LoadAction;
    clearColor?: [number, number, number, number];
}

class ColorAttachment {
    texture: Texture;
    mipLevel: number;
    slice: number;
    loadAction: LoadAction;
    clearColor: [number, number, number, number];
    
    constructor(attrs: ColorAttachmentAttrs) {
        this.texture = some(attrs.texture, null);
        this.mipLevel = some(attrs.mipLevel, 0);
        this.slice = some(attrs.slice, 0);
        this.loadAction = some(attrs.loadAction, LoadAction.Clear);
        this.clearColor = some(attrs.clearColor, [0.0, 0.0, 0.0, 1.0] as [number, number, number, number]);
    }
}

//------------------------------------------------------------------------------
export interface DepthAttachmentAttrs {
    texture?: Texture,
    loadAction?: LoadAction,
    clearDepth?: number,
    clearStencil?: number,    
}

class DepthAttachment {
    texture: Texture;
    loadAction: LoadAction;
    clearDepth: number;
    clearStencil: number;

    constructor(attrs: DepthAttachmentAttrs) {
        this.texture = some(attrs.texture, null);
        this.loadAction = some(attrs.loadAction, LoadAction.Clear);
        this.clearDepth = some(attrs.clearDepth, 1.0);
        this.clearStencil = some(attrs.clearStencil, 0);
    }
}

//------------------------------------------------------------------------------
export interface PassAttrs {
    colorAttachments?: ColorAttachmentAttrs[];
    depthAttachment?: DepthAttachmentAttrs;
    storeAction?: StoreAction;
}

class Pass {
    colorAttachments: ColorAttachment[];
    depthAttachment: DepthAttachment;
    storeAction: StoreAction;

    constructor(attrs: PassAttrs) {
        this.colorAttachments = [];
        if (attrs.colorAttachments == null) {
            this.colorAttachments.push(new ColorAttachment({}));
        }
        else {
            for (let colAttrs of attrs.colorAttachments) {
                this.colorAttachments.push(new ColorAttachment(colAttrs))
            }
        }
        this.depthAttachment = new DepthAttachment(some(attrs.depthAttachment, {}));
        this.storeAction = some(attrs.storeAction, StoreAction.DontCare);
    }
}

//------------------------------------------------------------------------------
class GLTypes {
    static usage(usage: Usage): GLenum {
        switch (usage) {
            case Usage.Immutable: return WebGLRenderingContext.STATIC_DRAW;
            case Usage.Dynamic:   return WebGLRenderingContext.DYNAMIC_DRAW;
            case Usage.Stream:    return WebGLRenderingContext.STREAM_DRAW;
        }
    } 
}

}