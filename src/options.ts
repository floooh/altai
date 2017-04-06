/// <reference path="types.ts"/>
'use strict'

module altai {

/**
 * WebGL and canvas initialization options.
 */
export interface GfxOptions {
    /** use WebGL2? (default: false) */
    UseWebGL2?: boolean;
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

/**
 * Options for creating a Pipeline object.
 */
export interface PipelineOptions {

    /** described the structure of input vertex data */
    VertexLayouts: VertexLayoutOptions[];
    /** the shader object, with matching vertex inputs */
    Shader: Shader;
    /** rendering primitive type (triangle, triangle strip, lines, ..)*/
    PrimitiveType?: PrimitiveType;
    /** index data format (none, 16- or 32-bit) */
    IndexFormat?: IndexFormat;
    
    /** is alpha-blending enabled? (default: false) */
    BlendEnabled?: boolean;
    /** the blend source factor (both RGB and Alpha, default: One) */
    BlendSrcFactor?: BlendFactor;
    /** the blend destination factor (both RGB and Alpha, default: Zero) */
    BlendDstFactor?: BlendFactor;
    /** the blend operation (both RGB and Alpha, default: Add) */
    BlendOp?: BlendOp;
    /** what color-channels to write (default: all true) */
    ColorWriteMask?: [boolean, boolean, boolean, boolean];
    /** blend-constant color (default: all 1.0) */
    BlendColor?: [number, number, number, number];

    /** separate RGB blend source factor (default: One) */
    BlendSrcFactorRGB?: BlendFactor;
    /** separate RGB blend destination factor (default: Zero) */
    BlendDstFactorRGB?: BlendFactor;
    /** separate RGB blend operation (default: Add) */
    BlendOpRGB?: BlendOp;

    /** separate Alpha blend source factor (default: One) */
    BlendSrcFactorAlpha?: BlendFactor;
    /** separate Alpha blend destination factor (default: Zero) */
    BlendDstFactorAlpha?: BlendFactor;
    /** separate Alpha blend operation (default: Add) */
    BlendOpAlpha?: BlendOp;

    /** stencil operations enabled? (default: false) */
    StencilEnabled?: boolean;
    /** common front/back stencil-fail operation (default: Keep) */
    StencilFailOp?: StencilOp;
    /** common front/back stencil-depth-fail operation (default: Keep) */
    StencilDepthFailOp?: StencilOp;
    /** common front/back stencil-pass operation (default: Keep) */
    StencilPassOp?: StencilOp;
    /** common front/back stencil-compare function (default: Always) */
    StencilCmpFunc?: CompareFunc;
    /** common front/back stencil read mask (default: 0xFF) */
    StencilReadMask?: number;
    /** common front/back stencil write mask (default: 0xFF) */
    StencilWriteMask?: number;
    /** common front/back stencil ref value (default: 0) */
    StencilRef?: number;

    /** separate front stencil-fail operation (default: Keep) */
    FrontStencilFailOp?: StencilOp;
    /** separate front stencil-depth-fail operation (default: Keep) */
    FrontStencilDepthFailOp?: StencilOp;
    /** separate front stencil-pass operation (default: Keep) */
    FrontStencilPassOp?: StencilOp;
    /** separate front stencil-compare function (default: Always) */
    FrontStencilCmpFunc?: CompareFunc;
    /** separate front stencil read mask (default: 0xFF) */
    FrontStencilReadMask?: number;
    /** separate front stencil write mask (default: 0xFF) */
    FrontStencilWriteMask?: number;
    /** separate front stencil ref value (default: 0) */
    FrontStencilRef?: number;

    /** separate back stencil-fail operation (default: Keep) */
    BackStencilFailOp?: StencilOp;
    /** separate back stencil-depth-fail operation (default: Keep) */
    BackStencilDepthFailOp?: StencilOp;
    /** separate back stencil-pass operation (default: Keep) */
    BackStencilPassOp?: StencilOp;
    /** separate back stencil-compare function (default: Always) */
    BackStencilCmpFunc?: CompareFunc;
    /** separate back stencil read mask (default: 0xFF) */
    BackStencilReadMask?: number;
    /** separate back stencil write mask (default: 0xFF) */
    BackStencilWriteMask?: number;
    /** separate back stencil ref value (default: 0) */
    BackStencilRef?: number;

    /** depth-compare function (default: Always) */
    DepthCmpFunc?: CompareFunc;
    /** depth-writes enabled? (default: false) */
    DepthWriteEnabled?: boolean;

    /** face-culling enabled? (default: false) */
    CullFaceEnabled?: boolean;
    /** face side to be culled (default: Back) */
    CullFace?: Face;
    /** scissor test enabled? (default: false) */
    ScissorTestEnabled?: boolean;
}

/**
 *  Options for creating a Shader object. 
 */
export interface ShaderOptions {
    /** GLSL vertex shader source code */
    VertexShader: string,
    /** GLSL fragment shader source code */
    FragmentShader: string,
}

/**
 * Options for creating a DrawState object.
 */
export interface DrawStateOptions {
    /** a Pipeline object */
    Pipeline: Pipeline;
    /** one or multiple VertexBuffer objects */
    VertexBuffers: Buffer[];
    /** an optional index buffer object */
    IndexBuffer?: Buffer;
    /** optional texture objects */
    Textures?: Texture[];
}

/**
 * Options for initializing pass color-attachments
 */
export interface ColorAttachmentOptions {
    /** the backing texture of the color attachment */
    Texture?: Texture;
    /** optional rendering mip level (default: 0) */
    MipLevel?: number;
    /** optional rendering texture slice (default: 0) */
    Slice?: number;
    LoadAction?: LoadAction;
    ClearColor?: [number, number, number, number];
}

export interface DepthAttachmentOptions {
    Texture?: Texture,
    LoadAction?: LoadAction,
    ClearDepth?: number,
    ClearStencil?: number,    
}

export interface PassOptions {
    ColorAttachments?: ColorAttachmentOptions[];
    DepthAttachment?: DepthAttachmentOptions;
}
    
}