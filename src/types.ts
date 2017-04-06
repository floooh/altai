/// <reference path="../webgl2/WebGL2.d.ts"/>

'use strict'

module altai {

/** 
 * Buffer types (vertex or index buffers).
 */
export enum BufferType {
    VertexBuffer = WebGLRenderingContext.ARRAY_BUFFER,
    IndexBuffer = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}

    
/**
 * Vertex index formats.
 */
export enum IndexFormat {
    /** no vertex indices */
    None = WebGLRenderingContext.NONE,
    /** 16-bit indices */ 
    UShort = WebGLRenderingContext.UNSIGNED_SHORT,
    /** 32-bit indices */
    UInt = WebGLRenderingContext.UNSIGNED_INT,
}

/**
 * Texture pixel formats.
 */
export enum PixelFormat {
    /** undefined/none/unused */
    NONE,
    /** RGBA with 8 bits per channel */
    RGBA8,
    /** RGB with 8 bits per channel */
    RGB8,
    /** RGBA with 4 bits per channel */
    RGBA4,
    /** RGB with 5/6/5 bits per channel */
    RGB565,
    /** RGBA with 5-bit color channels, and 1-bit alpha */
    RGB5_A1,
    /** RGBA with 10-bits color channels and 1-bit alpha */
    RGB10_A2,
    /** RGBA with 32-bit floating point channels */
    RGBA32F,
    /** RGBA with 16-bit floating point channels */
    RGBA16F,
    /** R component only, 32-bit floating point */
    R32F,
    /** R component only, 16-bit floating point */
    R16F,
}

/**
 * Depth/stencil surface formats.
 */
export enum DepthStencilFormat {
    /** depth-only */
    DEPTH,
    /** combined depth-stencil */
    DEPTHSTENCIL,
}

/**
 * Vertex component formats.
 */
export enum VertexFormat {
    /** 32-bit float, single component in X */
    Float,
    /** 32-bit floats, 2 components in XY */
    Float2,
    /** 32-bit floats, 3 components in XYZ */
    Float3,
    /** 32-bit floats, 4 components in XYZW */
    Float4,
    /** 4 packed bytes, signed (-128 .. 127) */
    Byte4,
    /** 4 packed bytes, signed, normalized (-1.0 .. +1.0) */
    Byte4N,
    /** 4 packed bytes, unsigned (0 .. 255) */
    UByte4,
    /** 4 packed bytes, unsigned, normalized (0.0 .. 1.0) */
    UByte4N,
    /** 2 packed 16-bit shorts, signed (-32767 .. +32768) */
    Short2,
    /** 2 packed 16-bit shorts, signed (-1.0 .. +1.0) */
    Short2N,
    /** 4 packed 16-bit shorts, signed (-32767 .. +32768) */
    Short4,
    /** 4 packed 16-bit shorts, signed (-1.0 .. +1.0) */
    Short4N,
}

/**
 * 3D primitive types.
 */
export enum PrimitiveType {
    /** point list */
    Points = WebGLRenderingContext.POINTS,
    /** line list */
    Lines = WebGLRenderingContext.LINES,
    /** line strip */
    LineStrip = WebGLRenderingContext.LINE_STRIP,
    /** triangle list */
    Triangles = WebGLRenderingContext.TRIANGLES,
    /** triangle strip */
    TriangleStrip = WebGLRenderingContext.TRIANGLE_STRIP,
}

/**
 * texture sampling filters (minification/magnification and mipmapping)
 */
export enum Filter {
    /** use nearest-filtering (aka point-filtering) */
    Nearest,    
    /** use linear filtering */
    Linear,
}

/**
 * texture addressing wrap mode (aka UV wrap)
 */
export enum Wrap {
    /** clamp texture coords to (0.0 .. 1.0) */
    ClampToEdge = WebGLRenderingContext.CLAMP_TO_EDGE,
    /** repeat texture coords within (0.0 .. 1.0) */
    Repeat = WebGLRenderingContext.REPEAT,
    /** mirror-repeat texture coords (0.0 .. 1.0 .. 0.0) */
    MirroredRepeat = WebGLRenderingContext.MIRRORED_REPEAT,
}

/**
 * texture object types
 */
export enum TextureType {
    /** 2D texture */
    Texture2D = WebGLRenderingContext.TEXTURE_2D,
    /** cubemap texture */
    TextureCube = WebGLRenderingContext.TEXTURE_CUBE_MAP,
}

/**
 * buffer and texture data usage hint
 */
export enum Usage {
    /** data is immutable, cannot be modified after creation */
    Immutable = WebGLRenderingContext.STATIC_DRAW,
    /** data is updated infrequently */
    Dynamic = WebGLRenderingContext.DYNAMIC_DRAW,
    /** data is overwritten each frame */
    Stream = WebGLRenderingContext.STREAM_DRAW,
}

/**
 * identify front/back sides for face culling.
 */
export enum Face {
    /** cull front side */
    Front = WebGLRenderingContext.FRONT,
    /** cull back side */
    Back = WebGLRenderingContext.BACK,
    /** cull both sides */
    Both = WebGLRenderingContext.FRONT_AND_BACK,
}

/**
 * Comparision functions for depth and stencil checks.
 */
export enum CompareFunc {
    /** new value never passes comparion test */
    Never = WebGLRenderingContext.NEVER,
    /** new value passses if it is less than the existing value */
    Less = WebGLRenderingContext.LESS,
    /** new value passes if it is equal to existing value */
    Equal = WebGLRenderingContext.EQUAL,
    /** new value passes if it is less than or equal to existing value */
    LessEqual = WebGLRenderingContext.LEQUAL,
    /** new value passes if it is greater than existing value */
    Greater = WebGLRenderingContext.GREATER,
    /** new value passes if it is not equal to existing value */
    NotEqual = WebGLRenderingContext.NOTEQUAL,
    /** new value passes if it is greater than or equal to existing value */
    GreaterEqual = WebGLRenderingContext.GEQUAL,
    /** new value always passes */
    Always = WebGLRenderingContext.ALWAYS,
}

/**
 * Stencil-buffer operations.
 */
export enum StencilOp {
    /** keep the current stencil value */
    Keep = WebGLRenderingContext.KEEP,
    /** set the stencil value to zero */
    Zero = WebGLRenderingContext.ZERO,
    /** replace the stencil value with stencil reference value */
    Replace = WebGLRenderingContext.REPLACE,
    /** increment the current stencil value, clamp to max */
    IncrClamp = WebGLRenderingContext.INCR,
    /** decrement the current stencil value, clamp to zero */
    DecrClamp = WebGLRenderingContext.DECR,
    /** perform a logical bitwise invert operation on the stencil value */
    Invert = WebGLRenderingContext.INVERT,
    /** increment the current stencil value, with wrap-around */
    IncrWrap = WebGLRenderingContext.INCR_WRAP,
    /** decrement the current stencil value, with wrap-around */
    DecrWrap = WebGLRenderingContext.DECR_WRAP,
}

/**
 * Alpha-blending factors.
 */
export enum BlendFactor {
    /** blend factor of zero */
    Zero = WebGLRenderingContext.ZERO,
    /** blend factor of one */
    One = WebGLRenderingContext.ONE,
    /** blend factor of source color */
    SrcColor = WebGLRenderingContext.SRC_COLOR,
    /** blend factor of one minus source color */
    OneMinusSrcColor = WebGLRenderingContext.ONE_MINUS_SRC_COLOR,
    /** blend factor of source alpha */
    SrcAlpha = WebGLRenderingContext.SRC_ALPHA,
    /** blend factor of one minus source alpha */
    OneMinusSrcAlpha = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    /** blend factor of destination color */
    DstColor = WebGLRenderingContext.DST_COLOR,
    /** blend factor of one minus destination alpha */
    OneMinusDstColor = WebGLRenderingContext.ONE_MINUS_DST_COLOR,
    /** blend factor of destination alpha */
    DstAlpha = WebGLRenderingContext.DST_ALPHA,
    /** blend factor of one minus destination alpha */
    OneMinusDstAlpha = WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
    /** blend factor of the minimum of either source alpha or one minus destination alpha */
    SrcAlphaSaturated = WebGLRenderingContext.SRC_ALPHA_SATURATE,
    /** blend factor of constant color */
    BlendColor = WebGLRenderingContext.CONSTANT_COLOR,
    /** blend factor of one minus constant color */
    OneMinusBlendColor = WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR,
    /** blend factor of constant alpha */
    BlendAlpha = WebGLRenderingContext.CONSTANT_ALPHA,
    /** blend factor of one minus destination alpha */
    OneMinusBlendAlpha = WebGLRenderingContext.ONE_MINUS_CONSTANT_ALPHA,
}

export enum BlendOp {
    /** add source and destination pixel values */
    Add = WebGLRenderingContext.FUNC_ADD,
    /** subtract destination from source pixel values
    Subtract = WebGLRenderingContext.FUNC_SUBTRACT,
    /** subtract source from destination pixel values */
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

export interface SamplerState {
    WrapU?: Wrap;
    WrapV?: Wrap;
    WrapW?: Wrap;
    MagFilter?: Filter;
    MinFilter?: Filter;
    MipFilter?: Filter;
}

export interface TextureAttrs {
    Type?: TextureType;
    Width?: number;
    Height?: number;
    Depth?: number;
    ColorFormat?: PixelFormat;
    DepthStencilFormat?: DepthStencilFormat;
    Usage?: Usage;
    RenderTarget?: boolean;
    GenerateMipMaps?: boolean;
    SampleCount?: number;
    Sampler?: SamplerState;
}

}