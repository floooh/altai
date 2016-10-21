'use strict'

module altai {

export class Gfx {
    constructor(attrs: GfxAttrs) {
        this.attrs = {
            canvas: attrs.canvas ? attrs.canvas : "canvas",
            width: attrs.width ? attrs.width : 640,
            height: attrs.height ? attrs.height : 480,
            colorFormat: attrs.colorFormat ? attrs.colorFormat : PixelFormat.RGBA8,
            depthFormat: attrs.depthFormat ? attrs.depthFormat : PixelFormat.DEPTHSTENCIL,
            msaa: attrs.msaa ? attrs.msaa : false,
            highDPI: attrs.highDPI ? attrs.highDPI : false,
            defClearColor: attrs.defClearColor ? attrs.defClearColor : new Color(0.0, 0.0, 0.0, 1.0),
            defClearDepth: attrs.defClearDepth ? attrs.defClearDepth : 1.0,
            defClearStencil: attrs.defClearStencil ? attrs.defClearStencil : 0
        };

        let glContextAttrs = {
            alpha: false,
            depth: this.attrs.depthFormat == PixelFormat.NONE,
            stencil: this.attrs.depthFormat == PixelFormat.DEPTHSTENCIL,
            antialias: this.attrs.msaa,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,            
        }
        let canvas = document.getElementById(this.attrs.canvas) as HTMLCanvasElement;        
        canvas.width = this.attrs.width;
        canvas.height = this.attrs.height;
        this.gl = canvas.getContext("webgl", glContextAttrs) || canvas.getContext("experimental-webgl", glContextAttrs);
    }

    beginPass() {

    }
    endPass() {

    }
    applyViewPort(x: number, y: number, width: number, height: number) {

    }
    applyScissorRect(x: number, y: number, width: number, height: number) {

    }
    applyDrawState(drawState: DrawState) {

    }
    applyUniform(name: string, x: number) {

    }
    draw(baseElement: number, numElements: number, numInstances: number) {

    }
    commitFrame() {

    }

    attrs: GfxAttrs;
    private gl : any;
}

export interface GfxAttrs {
    canvas?: string;
    width?: number;
    height?: number;
    colorFormat?: PixelFormat;
    depthFormat?: PixelFormat;
    msaa?: boolean;
    highDPI?: boolean;
    defClearColor?: Color;
    defClearDepth?: number;
    defClearStencil?: number;
}

export class DrawState {
    pipeline: Pipeline;
    vertexBuffers: VertexBuffer[];
    indexBuffer: IndexBuffer;
    vsTextures: Texture[];
    fsTextures: Texture[];
}

export class Texture {
    attrs: TextureAttrs;
}

export class VertexBuffer {
    attrs: VertexBufferAttrs;

    constructor(attrs: VertexBufferAttrs) {
        this.attrs = attrs;
    }
}

export class IndexBuffer {
    attrs: IndexBufferAttrs;
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

export class Color {
    r: number = 0.0;
    g: number = 0.0;
    b: number = 0.0;
    a: number = 1.0;
    constructor(r:number=0.0, g:number=0.0, b:number=0.0, a:number=1.0) {
        this.r = this.g = this.b = 0.0;
        this.a = 1.0;
    }
}

export class WriteMask {
    r: boolean = true;
    g: boolean = true;
    b: boolean = true;
    a: boolean = true;
    depth: boolean = true;
    stencil: boolean = true;
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

export interface VertexBufferAttrs {
    layout: VertexLayout;
    numVertices?: number;
    usage?: Usage;
}

export interface IndexBufferAttrs {
    indexFormat?: IndexFormat;
    numIndices?: number;
    usage?: Usage;
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
    blendState?: BlendAttrs;
    depthStencilState?: DepthStencilAttrs;
    rasterizerState?: RasterizerAttrs;
    vertexLayouts?: VertexLayout[];
    primitiveType?: PrimitiveType;
    shader?: Shader;
}

export interface SamplerState {
    wrapU?: Wrap;
    wrapV?: Wrap;
    wrapW?: Wrap;
    magFilter?: Filter;
    minFilter?: Filter;
    mipFilter?: Filter;
}

export interface BlendAttrs {
    srcFactorRGB?: BlendFactor;
    dstFactorRGB?: BlendFactor;
    blendOpRgb?: BlendOp;
    srcFactorAlpha?: BlendFactor;
    dstFactorAlpha?: BlendFactor;
    blendOpAlpha?: BlendOp;  
    writeMask?: WriteMask;
    blendColor?: Color;
}

export interface StencilAttrs {
    failOp?: StencilOp;
    depthFailOp?: StencilOp;
    passOp?: StencilOp;
    cmpFunc?: CompareFunc;
}

export interface DepthStencilAttrs {
    stencilFront?: StencilAttrs;
    stencilBack?: StencilAttrs;
    depthCmpFunc?: CompareFunc;
    depthWriteEnabled?: boolean;
    stencilEnabled?: boolean;
    stencilReadMask?: number;
    stencilWriteMask?: number;
    stencilRef?: number;
}

export interface RasterizerAttrs {
    cullFaceEnabled?: boolean;
    cullFace?: Face;
    scissorTestEnabled?: boolean;
    ditherEnabled?: boolean;
    alphaCoverageEnabled?: boolean;
}

}