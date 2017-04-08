/// <reference path="options.ts"/>

'use strict'

module altai {

export const MaxNumColorAttachments = 4;
export const MaxNumVertexAttribs = 16;

export function some<T>(opt0: T, opt1: T): T {
    return opt0 != null ? opt0 : opt1;
}
export function some3<T>(opt0: T, opt1: T, opt2: T): T {
    return opt0 != null ? opt0 : (opt1 != null ? opt1 : opt2); 
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
 * A Texture object.
 */
export class Texture {
    readonly type: TextureType;
    readonly usage: Usage;
    readonly width: number;
    readonly height: number;
    readonly depth: number;
    readonly numMipMaps: number;
    readonly colorFormat: PixelFormat;
    readonly depthFormat: DepthStencilFormat;
    readonly sampleCount: number;
    readonly wrapU: Wrap;
    readonly wrapV: Wrap;
    readonly wrapW: Wrap;
    readonly minFilter: Filter;
    readonly magFilter: Filter;  
    readonly glTexture: WebGLTexture;
    readonly glMSAARenderBuffer: WebGLRenderbuffer;
    readonly glDepthRenderBuffer: WebGLRenderbuffer;

    constructor(o: TextureOptions, gl: WebGLRenderingContext|WebGL2RenderingContext) {
        this.type = o.Type;
        this.usage = some(o.Usage, Usage.Immutable);
        this.width = o.Width;
        this.height = o.Height;
        this.depth = some(o.Depth, 1);
        this.numMipMaps = some(o.NumMipMaps, 1);
        this.colorFormat = o.ColorFormat;
        this.depthFormat = some(o.DepthFormat, DepthStencilFormat.NONE);
        this.sampleCount = some(o.SampleCount, 1);
        this.wrapU = some(o.WrapU, Wrap.ClampToEdge);
        this.wrapV = some(o.WrapV, Wrap.ClampToEdge);
        this.wrapW = some(o.WrapW, Wrap.ClampToEdge);
        this.minFilter = some(o.MinFilter, Filter.Nearest);
        this.magFilter = some(o.MagFilter, Filter.Nearest);
        this.glTexture = gl.createTexture();
        if (this.sampleCount > 1) {
            this.glMSAARenderBuffer = gl.createRenderbuffer();
        }
        else {
            this.glMSAARenderBuffer = null;
        }
        if (this.depthFormat != DepthStencilFormat.NONE) {
            this.glDepthRenderBuffer = gl.createRenderbuffer();
        }
        else {
            this.glDepthRenderBuffer = null;
        }
    }
}

export class VertexLayout {
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

export class PipelineState {
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

/**
 * Opaque pipeline-state-object.
 */
export class Pipeline {
    readonly vertexLayouts: VertexLayout[];
    readonly shader: Shader;
    readonly primitiveType: PrimitiveType;
    readonly state: PipelineState;
    readonly glAttribs: glAttrib[];
    readonly indexFormat: IndexFormat;
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
        this.indexFormat = some(o.IndexFormat, IndexFormat.None);
        switch (this.indexFormat) {
            case IndexFormat.UInt16: this.indexSize = 2; break;
            case IndexFormat.UInt32: this.indexSize = 4; break;
            default: this.indexSize = 0; break; 
        }
    }
}

/**
 * Opaque shader object.
 */
export class Shader {
    readonly glProgram: WebGLProgram;

    constructor(glProgram: WebGLProgram) {
        this.glProgram = glProgram;
    }  
}

/**
 * A DrawState object is a bundle of resource binding slots,
 * create with Gfx.makePass(). DrawState objects area
 * mutable, the resource binding slots can be
 * reconfigured on existing DrawState objects. 
 */
export class DrawState {
    Pipeline: Pipeline;
    VertexBuffers: Buffer[];
    IndexBuffer: Buffer;
    Textures: {[key: string]: Texture; };

    constructor(o: DrawStateOptions) {
        this.Pipeline = o.Pipeline;
        this.VertexBuffers = o.VertexBuffers;
        this.IndexBuffer = some(o.IndexBuffer, null);
        this.Textures = some(o.Textures, null);
    }
}

export class ColorAttachment {
    texture: Texture;
    mipLevel: number;
    slice: number;
    loadAction: LoadAction;
    clearColor: [number, number, number, number];
    readonly glMSAAResolveFramebuffer: WebGLFramebuffer;
    
    constructor(o: ColorAttachmentOptions, glMsaaFb: WebGLFramebuffer) {
        this.texture = some(o.Texture, null);
        this.mipLevel = some(o.MipLevel, 0);
        this.slice = some(o.Slice, 0);
        this.loadAction = some(o.LoadAction, LoadAction.Clear);
        this.clearColor = some(o.ClearColor, [0.0, 0.0, 0.0, 1.0] as [number, number, number, number]);
        this.glMSAAResolveFramebuffer = glMsaaFb;
    }
}

export class DepthAttachment {
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

export class Pass {
    ColorAttachments: ColorAttachment[];
    DepthAttachment: DepthAttachment;
    readonly glFramebuffer: WebGLFramebuffer;

    constructor(o: PassOptions, glFb: WebGLFramebuffer, glMsaaFbs: WebGLFramebuffer[]) {
        this.glFramebuffer = glFb;
        this.ColorAttachments = [];
        if (o.ColorAttachments == null) {
            this.ColorAttachments.push(new ColorAttachment({}, null));
        }
        else {
            for (let i = 0; i < o.ColorAttachments.length; i++) {
                const glMsaaFb = (glMsaaFbs && glMsaaFbs[i]) ? glMsaaFbs[i]:null;
                this.ColorAttachments.push(new ColorAttachment(o.ColorAttachments[i], glMsaaFb))
            }
        }
        this.DepthAttachment = new DepthAttachment(some(o.DepthAttachment, {}));
    }
}

}