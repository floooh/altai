//
// Copyright (c) 2017 Max Shaydo aka MaxGraey (https://github.com/MaxGraey)
//

declare type GLint64     = number;
declare type GLuint64EXT = GLint64;

/*
interface SharedArrayBuffer {
    slice(begin?: number, end?: number): SharedArrayBuffer;
    readonly length: number;
    readonly byteLength: number;
}

declare var SharedArrayBuffer: {
    prototype: SharedArrayBuffer;
    new(length: number): SharedArrayBuffer;
    readonly length: number;
    readonly byteLength: number;
}

interface ImageBitmap {
    close(): void;
    readonly width: number;
    readonly height: number;
}

declare var ImageBitmap: {
    prototype: ImageBitmap;
    new(): ImageBitmap;
    readonly width: number;
    readonly height: number;
}*/

interface WebGLQuery extends WebGLObject {
}

declare var WebGLQuery: {
    prototype: WebGLQuery;
    new(): WebGLQuery;
}

interface WebGLSampler extends WebGLObject {
}

declare var WebGLSampler: {
    prototype: WebGLSampler;
    new(): WebGLSampler;
}

interface WebGLSync extends WebGLObject {
}

declare var WebGLSync: {
    prototype: WebGLSync;
    new(): WebGLSync;
}

interface WebGLTransformFeedback extends WebGLObject {
}

declare var WebGLTransformFeedback: {
    prototype: WebGLTransformFeedback;
    new(): WebGLTransformFeedback;
}

interface WebGLVertexArrayObject extends WebGLObject {
}

declare var WebGLVertexArrayObject: {
    prototype: WebGLVertexArrayObject;
    new(): WebGLVertexArrayObject;
}

interface WebGL2RenderingContext extends WebGLRenderingContext {
    getIndexedParameter(target: number, index: number): WebGLBuffer | number | null;
    copyBufferSubData(readTarget: number, writeTarget: number, readOffset: number, writeOffset: number, size: number): void;
    getBufferSubData(target: number, srcByteOffset: number, dstData: ArrayBufferView, dstOffset?: number, length?: number): void;
    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;
    framebufferTextureLayer(target: number, attachment: number, texture: WebGLTexture, level: number, layer: number): void;
    invalidateFramebuffer(target: number, attachments: number[]): void;
    invalidateSubFramebuffer(target: number, attachments: number[], x: number, y: number, width: number, height: number): void;
    bufferData(target: number, srcDataOrSize: number | ArrayBufferView | ArrayBuffer, usage: number, srcOffset?: number, length?: number): void;
    bufferSubData(target: number, dstByteOffset: number, srcData: ArrayBufferView | ArrayBuffer, srcOffset?: number, length?: number): void;
    readBuffer(src: number): void;
    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, offset?: number): void;
    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, dstData: ArrayBufferView | ArrayBuffer, dstOffset?: number): void;
    getInternalformatParameter(target: number, internalformat: number, pname: number): Int32Array | number | null;
    renderbufferStorageMultisample(target: number, samples: number, internalFormat: number, width: number, height: number): void;
    texStorage2D(target: number, levels: number, internalformat: number, width: number, height: number): void;
    texStorage3D(target: number, levels: number, internalformat: number, width: number, height: number, depth: number): void;

    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, offset: number): void;
    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, source: ImageData | ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset?: number): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, offset: number): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, source: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData?: ArrayBufferView): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;
    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, offset: number): void;
    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;
    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, srcData?: ArrayBufferView, srcOffset?: number): void;
    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, pixels?: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, offset: number): void;
    copyTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, x: number, y: number, width: number, height: number): void;
    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, offset: number): void;
    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;
    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, offset: number): void;
    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;
    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, offset: number): void;
    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;
    compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, offset: number): void;
    compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;
    getFragDataLocation(program: WebGLProgram | null, name: string): number;
    uniform1ui(location: WebGLUniformLocation | null, x: number): void;
    uniform2ui(location: WebGLUniformLocation | null, x: number, y: number): void;
    uniform3ui(location: WebGLUniformLocation | null, x: number, y: number, z: number): void;
    uniform4ui(location: WebGLUniformLocation | null, x: number, y: number, z: number, w: number): void;
    uniform1fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform2fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform3fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform4fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform1iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform2iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform3iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform4iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform1uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform2uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform3uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniform4uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix2fv(location: WebGLUniformLocation | null,   transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix3x2fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix4x2fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix2x3fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix3fv(location: WebGLUniformLocation | null,   transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix4x3fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix2x4fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix3x4fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    uniformMatrix4fv(location: WebGLUniformLocation | null,   transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
    vertexAttribI4i(index: number, x: number, y: number, z: number, w: number): void;
    vertexAttribI4ui(index: number, x: number, y: number, z: number, w: number): void;
    vertexAttribI4iv(index: number, value: Int32Array | number[]): void;
    vertexAttribI4uiv(index: number, value: Uint32Array | number[]): void;
    vertexAttribIPointer(index: number, size: number, type: number, stride: number, offset: number): void;
    vertexAttribDivisor(index: number, divisor: number): void;
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
    drawRangeElements(mode: number, start: number, end: number, count: number, type: number, offset: number): void;
    drawBuffers(buffers: number[]): void;
    clearBufferfv(buffer: number, drawbuffer: number, values: Float32Array | number[], srcOffset?: number): void;
    clearBufferiv(buffer: number, drawbuffer: number, values: Int32Array | number[], srcOffset?: number): void;
    clearBufferuiv(buffer: number, drawbuffer: number, values: Uint32Array | number[], srcOffset?: number): void;
    clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;
    createQuery(): WebGLQuery | null;
    deleteQuery(query: WebGLQuery | null): void;
    isQuery(query: WebGLQuery | null): boolean;
    beginQuery(target: number, query: WebGLQuery | null): void;
    endQuery(target: number): void;
    getQuery(target: number, pname: number): WebGLQuery | null;
    getQueryParameter(query: WebGLQuery | null, pname: number): number | boolean | null;
    createSampler(): WebGLSampler | null;
    deleteSampler(sampler: WebGLSampler | null): void;
    bindSampler(unit: number, sampler: WebGLSampler | null): void;
    isSampler(sampler: WebGLSampler | null): boolean;
    samplerParameteri(sampler: WebGLSampler | null, pname: number, param: number): void;
    samplerParameterf(sampler: WebGLSampler | null, pname: number, param: number): void;
    getSamplerParameter(sampler: WebGLSampler | null, pname: number): number | null;
    fenceSync(condition: number, flags: number): WebGLSync | null;
    isSync(sync: WebGLSync | null): boolean;
    deleteSync(sync: WebGLSync | null): void;
    clientWaitSync(sync: WebGLSync | null, flags: number, timeout: number): number;
    waitSync(sync: WebGLSync | null, flags: number, timeout: number): void;
    getSyncParameter(sync: WebGLSync | null, pname: number): number | null;
    createTransformFeedback(): WebGLTransformFeedback | null;
    deleteTransformFeedback(transformFeedback: WebGLTransformFeedback | null): void;
    isTransformFeedback(transformFeedback: WebGLTransformFeedback | null): void;
    bindTransformFeedback(target: number, transformFeedback: WebGLTransformFeedback | null): void;
    beginTransformFeedback(primitiveMode: number): void;
    endTransformFeedback(): void;
    transformFeedbackVaryins(program: WebGLProgram | null, varyings: string[], bufferMode: number): void;
    getTransformFeedbackVarying(program: WebGLProgram | null, index: number): WebGLActiveInfo;
    pauseTransformFeedback(): void;
    resumeTransformFeedback(): void;
    bindBufferBase(target: number, index: number, buffer: WebGLBuffer | null): void;
    bindBufferRange(target: number, index: number, buffer: WebGLBuffer | null, offset: number, size: number): void;
    getUniformIndices(program: WebGLProgram | null, uniformNames: string[]): number[] | null;
    getActiveUniforms(program: WebGLProgram | null, uniformIndices: number[], pname: number): number[] | boolean[] | null;
    getUniformBlockIndex(program: WebGLProgram | null, uniformBlockName: string): number[];
    getActiveUniformBlockParameter(program: WebGLProgram | null, uniformBlockIndex: number, pname: number): Uint32Array | number | boolean | null;
    getActiveUniformBlockName(program: WebGLProgram | null, uniformBlockIndex: number): string | null;
    uniformBlockBinding(program: WebGLProgram | null, uniformBlockIndex: number, uniformBlockBinding: number): void;
    createVertexArray(): WebGLVertexArrayObject | null;
    deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): void;
    isVertexArray(vertexArray: WebGLVertexArrayObject | null): boolean;
    bindVertexArray(vertexArray: WebGLVertexArrayObject | null): void;

    // Getting GL parameter information
    readonly READ_BUFFER: number;
    readonly UNPACK_ROW_LENGTH: number;
    readonly UNPACK_SKIP_ROWS: number;
    readonly UNPACK_SKIP_PIXELS: number;
    readonly PACK_ROW_LENGTH: number;
    readonly PACK_SKIP_ROWS: number;
    readonly PACK_SKIP_PIXELS: number;
    readonly TEXTURE_BINDING_3D: number;
    readonly UNPACK_SKIP_IMAGES: number;
    readonly UNPACK_IMAGE_HEIGHT: number;
    readonly MAX_3D_TEXTURE_SIZE: number;
    readonly MAX_ELEMENTS_VERTICES: number;
    readonly MAX_ELEMENTS_INDICES: number;
    readonly MAX_TEXTURE_LOD_BIAS: number;
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_ARRAY_TEXTURE_LAYERS: number;
    readonly MIN_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_VARYING_COMPONENTS: number;
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
    readonly RASTERIZER_DISCARD: number;
    readonly VERTEX_ARRAY_BINDING: number;
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: number;
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: number;
    readonly MAX_SERVER_WAIT_TIMEOUT: number;
    readonly MAX_ELEMENT_INDEX: number;

    // Textures
    readonly RED: number;
    readonly RGB8: number;
    readonly RGBA8: number;
    readonly RGB10_A2: number;
    readonly TEXTURE_3D: number;
    readonly TEXTURE_WRAP_R: number;
    readonly TEXTURE_MIN_LOD: number;
    readonly TEXTURE_MAX_LOD: number;
    readonly TEXTURE_BASE_LEVEL: number;
    readonly TEXTURE_MAX_LEVEL: number;
    readonly TEXTURE_COMPARE_MODE: number;
    readonly TEXTURE_COMPARE_FUNC: number;
    readonly SRGB: number;
    readonly SRGB8: number;
    readonly SRGB8_ALPHA8: number;
    readonly COMPARE_REF_TO_TEXTURE: number;
    readonly RGBA32F: number;
    readonly RGB32F: number;
    readonly RGBA16F: number;
    readonly RGB16F: number;
    readonly TEXTURE_2D_ARRAY: number;
    readonly TEXTURE_BINDING_2D_ARRAY: number;
    readonly R11F_G11F_B10F: number;
    readonly RGB9_E5: number;
    readonly RGBA32UI: number;
    readonly RGB32UI: number;
    readonly RGBA16UI: number;
    readonly RGB16UI: number;
    readonly RGBA8UI: number;
    readonly RGB8UI: number;
    readonly RGBA32I: number;
    readonly RGB32I: number;
    readonly RGBA16I: number;
    readonly RGB16I: number;
    readonly RGBA8I: number;
    readonly RGB8I: number;
    readonly RED_INTEGER: number;
    readonly RGB_INTEGER: number;
    readonly RGBA_INTEGER: number;
    readonly R8: number;
    readonly RG8: number;
    readonly R16F: number;
    readonly R32F: number;
    readonly RG16F: number;
    readonly RG32F: number;
    readonly R8I: number;
    readonly R8UI: number;
    readonly R16I: number;
    readonly R16UI: number;
    readonly R32I: number;
    readonly R32UI: number;
    readonly RG8I: number;
    readonly RG8UI: number;
    readonly RG16I: number;
    readonly RG16UI: number;
    readonly RG32I: number;
    readonly RG32UI: number;
    readonly R8_SNORM: number;
    readonly RG8_SNORM: number;
    readonly RGB8_SNORM: number;
    readonly RGBA8_SNORM: number;
    readonly RGB10_A2UI: number;
    readonly TEXTURE_IMMUTABLE_FORMAT: number;
    readonly TEXTURE_IMMUTABLE_LEVELS: number;

    // Compressed textures
    readonly COMPRESSED_R11_EAC: number;
    readonly COMPRESSED_SIGNED_R11_EAC: number;
    readonly COMPRESSED_RG11_EAC: number;
    readonly COMPRESSED_SIGNED_RG11_EAC: number;
    readonly COMPRESSED_RGB8_ETC2: number;
    readonly COMPRESSED_SRGB8_ETC2: number;
    readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: number;

    // Pixel types
    readonly UNSIGNED_INT_2_10_10_10_REV: number;
    readonly UNSIGNED_INT_10F_11F_11F_REV: number;
    readonly UNSIGNED_INT_5_9_9_9_REV: number;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
    readonly UNSIGNED_INT_24_8: number;
    readonly HALF_FLOAT: number;
    readonly RG: number;
    readonly RG_INTEGER: number;
    readonly INT_2_10_10_10_REV: number;

    // Queries
    readonly CURRENT_QUERY: number;
    readonly QUERY_RESULT: number;
    readonly QUERY_RESULT_AVAILABLE: number;
    readonly ANY_SAMPLES_PASSED: number;
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: number;

    // Draw buffers
    readonly MAX_DRAW_BUFFERS: number;
    readonly DRAW_BUFFER0: number;
    readonly DRAW_BUFFER1: number;
    readonly DRAW_BUFFER2: number;
    readonly DRAW_BUFFER3: number;
    readonly DRAW_BUFFER4: number;
    readonly DRAW_BUFFER5: number;
    readonly DRAW_BUFFER6: number;
    readonly DRAW_BUFFER7: number;
    readonly DRAW_BUFFER8: number;
    readonly DRAW_BUFFER9: number;
    readonly DRAW_BUFFER10: number;
    readonly DRAW_BUFFER11: number;
    readonly DRAW_BUFFER12: number;
    readonly DRAW_BUFFER13: number;
    readonly DRAW_BUFFER14: number;
    readonly DRAW_BUFFER15: number;
    readonly MAX_COLOR_ATTACHMENTS: number;
    readonly COLOR_ATTACHMENT1: number;
    readonly COLOR_ATTACHMENT2: number;
    readonly COLOR_ATTACHMENT3: number;
    readonly COLOR_ATTACHMENT4: number;
    readonly COLOR_ATTACHMENT5: number;
    readonly COLOR_ATTACHMENT6: number;
    readonly COLOR_ATTACHMENT7: number;
    readonly COLOR_ATTACHMENT8: number;
    readonly COLOR_ATTACHMENT9: number;
    readonly COLOR_ATTACHMENT10: number;
    readonly COLOR_ATTACHMENT11: number;
    readonly COLOR_ATTACHMENT12: number;
    readonly COLOR_ATTACHMENT13: number;
    readonly COLOR_ATTACHMENT14: number;
    readonly COLOR_ATTACHMENT15: number;

    // Samplers
    readonly SAMPLER_3D: number;
    readonly SAMPLER_2D_SHADOW: number;
    readonly SAMPLER_2D_ARRAY: number;
    readonly SAMPLER_2D_ARRAY_SHADOW: number;
    readonly SAMPLER_CUBE_SHADOW: number;
    readonly INT_SAMPLER_2D: number;
    readonly INT_SAMPLER_3D: number;
    readonly INT_SAMPLER_CUBE: number;
    readonly INT_SAMPLER_2D_ARRAY: number;
    readonly UNSIGNED_INT_SAMPLER_2D: number;
    readonly UNSIGNED_INT_SAMPLER_3D: number;
    readonly UNSIGNED_INT_SAMPLER_CUBE: number;
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: number;
    readonly MAX_SAMPLES: number;
    readonly SAMPLER_BINDING: number;

    // Buffers
    readonly PIXEL_PACK_BUFFER: number;
    readonly PIXEL_UNPACK_BUFFER: number;
    readonly PIXEL_PACK_BUFFER_BINDING: number;
    readonly PIXEL_UNPACK_BUFFER_BINDING: number;
    readonly COPY_READ_BUFFER: number;
    readonly COPY_WRITE_BUFFER: number;
    readonly COPY_READ_BUFFER_BINDING: number;
    readonly COPY_WRITE_BUFFER_BINDING: number;

    // Data types
    readonly FLOAT_MAT2x3: number;
    readonly FLOAT_MAT2x4: number;
    readonly FLOAT_MAT3x2: number;
    readonly FLOAT_MAT3x4: number;
    readonly FLOAT_MAT4x2: number;
    readonly FLOAT_MAT4x3: number;
    readonly UNSIGNED_INT_VEC2: number;
    readonly UNSIGNED_INT_VEC3: number;
    readonly UNSIGNED_INT_VEC4: number;
    readonly UNSIGNED_NORMALIZED: number;
    readonly SIGNED_NORMALIZED: number;

    // Vertex attributes
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: number;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;

    // Transform feedback
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: number;
    readonly TRANSFORM_FEEDBACK_VARYINGS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_START: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: number;
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: number;
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: number;
    readonly INTERLEAVED_ATTRIBS: number;
    readonly SEPARATE_ATTRIBS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: number;
    readonly TRANSFORM_FEEDBACK: number;
    readonly TRANSFORM_FEEDBACK_PAUSED: number;
    readonly TRANSFORM_FEEDBACK_ACTIVE: number;
    readonly TRANSFORM_FEEDBACK_BINDING: number;

    // Framebuffers and renderbuffers
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: number;
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: number;
    readonly FRAMEBUFFER_DEFAULT: number;
    readonly DEPTH_STENCIL_ATTACHMENT: number;
    readonly DEPTH_STENCIL: number;
    readonly DEPTH24_STENCIL8: number;
    readonly DRAW_FRAMEBUFFER_BINDING: number;
    readonly READ_FRAMEBUFFER: number;
    readonly DRAW_FRAMEBUFFER: number;
    readonly READ_FRAMEBUFFER_BINDING: number;
    readonly RENDERBUFFER_SAMPLES: number;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: number;
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: number;

    // Uniforms
    readonly UNIFORM_BUFFER: number;
    readonly UNIFORM_BUFFER_BINDING: number;
    readonly UNIFORM_BUFFER_START: number;
    readonly UNIFORM_BUFFER_SIZE: number;
    readonly MAX_VERTEX_UNIFORM_BLOCKS: number;
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: number;
    readonly MAX_COMBINED_UNIFORM_BLOCKS: number;
    readonly MAX_UNIFORM_BUFFER_BINDINGS: number;
    readonly MAX_UNIFORM_BLOCK_SIZE: number;
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: number;
    readonly ACTIVE_UNIFORM_BLOCKS: number;
    readonly UNIFORM_TYPE: number;
    readonly UNIFORM_SIZE: number;
    readonly UNIFORM_BLOCK_INDEX: number;
    readonly UNIFORM_OFFSET: number;
    readonly UNIFORM_ARRAY_STRIDE: number;
    readonly UNIFORM_MATRIX_STRIDE: number;
    readonly UNIFORM_IS_ROW_MAJOR: number;
    readonly UNIFORM_BLOCK_BINDING: number;
    readonly UNIFORM_BLOCK_DATA_SIZE: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: number;

    // Sync objects
    readonly OBJECT_TYPE: number;
    readonly SYNC_CONDITION: number;
    readonly SYNC_STATUS: number;
    readonly SYNC_FLAGS: number;
    readonly SYNC_FENCE: number;
    readonly SYNC_GPU_COMMANDS_COMPLETE: number;
    readonly UNSIGNALED: number;
    readonly SIGNALED: number;
    readonly ALREADY_SIGNALED: number;
    readonly TIMEOUT_EXPIRED: number;
    readonly CONDITION_SATISFIED: number;
    readonly WAIT_FAILED: number;
    readonly SYNC_FLUSH_COMMANDS_BIT: number;

    // Misc
    readonly COLOR: number;
    readonly DEPTH: number;
    readonly STENCIL: number;
    readonly MIN: number;
    readonly MAX: number;
    readonly DEPTH_COMPONENT24: number;
    readonly STREAM_READ: number;
    readonly STREAM_COPY: number;
    readonly STATIC_READ: number;
    readonly STATIC_COPY: number;
    readonly DYNAMIC_READ: number;
    readonly DYNAMIC_COPY: number;
    readonly DEPTH_COMPONENT32F: number;
    readonly DEPTH32F_STENCIL8: number;
    readonly INVALID_INDEX: number;
    readonly TIMEOUT_IGNORED: number;
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: number;
}


declare var WebGL2RenderingContext: {
    prototype: WebGL2RenderingContext;
    new(): WebGL2RenderingContext;

    // Getting GL parameter information
    readonly READ_BUFFER: number;
    readonly UNPACK_ROW_LENGTH: number;
    readonly UNPACK_SKIP_ROWS: number;
    readonly UNPACK_SKIP_PIXELS: number;
    readonly PACK_ROW_LENGTH: number;
    readonly PACK_SKIP_ROWS: number;
    readonly PACK_SKIP_PIXELS: number;
    readonly TEXTURE_BINDING_3D: number;
    readonly UNPACK_SKIP_IMAGES: number;
    readonly UNPACK_IMAGE_HEIGHT: number;
    readonly MAX_3D_TEXTURE_SIZE: number;
    readonly MAX_ELEMENTS_VERTICES: number;
    readonly MAX_ELEMENTS_INDICES: number;
    readonly MAX_TEXTURE_LOD_BIAS: number;
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_ARRAY_TEXTURE_LAYERS: number;
    readonly MIN_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_VARYING_COMPONENTS: number;
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
    readonly RASTERIZER_DISCARD: number;
    readonly VERTEX_ARRAY_BINDING: number;
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: number;
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: number;
    readonly MAX_SERVER_WAIT_TIMEOUT: number;
    readonly MAX_ELEMENT_INDEX: number;

    // Textures
    readonly RED: number;
    readonly RGB8: number;
    readonly RGBA8: number;
    readonly RGB10_A2: number;
    readonly TEXTURE_3D: number;
    readonly TEXTURE_WRAP_R: number;
    readonly TEXTURE_MIN_LOD: number;
    readonly TEXTURE_MAX_LOD: number;
    readonly TEXTURE_BASE_LEVEL: number;
    readonly TEXTURE_MAX_LEVEL: number;
    readonly TEXTURE_COMPARE_MODE: number;
    readonly TEXTURE_COMPARE_FUNC: number;
    readonly SRGB: number;
    readonly SRGB8: number;
    readonly SRGB8_ALPHA8: number;
    readonly COMPARE_REF_TO_TEXTURE: number;
    readonly RGBA32F: number;
    readonly RGB32F: number;
    readonly RGBA16F: number;
    readonly RGB16F: number;
    readonly TEXTURE_2D_ARRAY: number;
    readonly TEXTURE_BINDING_2D_ARRAY: number;
    readonly R11F_G11F_B10F: number;
    readonly RGB9_E5: number;
    readonly RGBA32UI: number;
    readonly RGB32UI: number;
    readonly RGBA16UI: number;
    readonly RGB16UI: number;
    readonly RGBA8UI: number;
    readonly RGB8UI: number;
    readonly RGBA32I: number;
    readonly RGB32I: number;
    readonly RGBA16I: number;
    readonly RGB16I: number;
    readonly RGBA8I: number;
    readonly RGB8I: number;
    readonly RED_INTEGER: number;
    readonly RGB_INTEGER: number;
    readonly RGBA_INTEGER: number;
    readonly R8: number;
    readonly RG8: number;
    readonly R16F: number;
    readonly R32F: number;
    readonly RG16F: number;
    readonly RG32F: number;
    readonly R8I: number;
    readonly R8UI: number;
    readonly R16I: number;
    readonly R16UI: number;
    readonly R32I: number;
    readonly R32UI: number;
    readonly RG8I: number;
    readonly RG8UI: number;
    readonly RG16I: number;
    readonly RG16UI: number;
    readonly RG32I: number;
    readonly RG32UI: number;
    readonly R8_SNORM: number;
    readonly RG8_SNORM: number;
    readonly RGB8_SNORM: number;
    readonly RGBA8_SNORM: number;
    readonly RGB10_A2UI: number;
    readonly TEXTURE_IMMUTABLE_FORMAT: number;
    readonly TEXTURE_IMMUTABLE_LEVELS: number;

    // Compressed textures
    readonly COMPRESSED_R11_EAC: number;
    readonly COMPRESSED_SIGNED_R11_EAC: number;
    readonly COMPRESSED_RG11_EAC: number;
    readonly COMPRESSED_SIGNED_RG11_EAC: number;
    readonly COMPRESSED_RGB8_ETC2: number;
    readonly COMPRESSED_SRGB8_ETC2: number;
    readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: number;

    // Pixel types
    readonly UNSIGNED_INT_2_10_10_10_REV: number;
    readonly UNSIGNED_INT_10F_11F_11F_REV: number;
    readonly UNSIGNED_INT_5_9_9_9_REV: number;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
    readonly UNSIGNED_INT_24_8: number;
    readonly HALF_FLOAT: number;
    readonly RG: number;
    readonly RG_INTEGER: number;
    readonly INT_2_10_10_10_REV: number;

    // Queries
    readonly CURRENT_QUERY: number;
    readonly QUERY_RESULT: number;
    readonly QUERY_RESULT_AVAILABLE: number;
    readonly ANY_SAMPLES_PASSED: number;
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: number;

    // Draw buffers
    readonly MAX_DRAW_BUFFERS: number;
    readonly DRAW_BUFFER0: number;
    readonly DRAW_BUFFER1: number;
    readonly DRAW_BUFFER2: number;
    readonly DRAW_BUFFER3: number;
    readonly DRAW_BUFFER4: number;
    readonly DRAW_BUFFER5: number;
    readonly DRAW_BUFFER6: number;
    readonly DRAW_BUFFER7: number;
    readonly DRAW_BUFFER8: number;
    readonly DRAW_BUFFER9: number;
    readonly DRAW_BUFFER10: number;
    readonly DRAW_BUFFER11: number;
    readonly DRAW_BUFFER12: number;
    readonly DRAW_BUFFER13: number;
    readonly DRAW_BUFFER14: number;
    readonly DRAW_BUFFER15: number;
    readonly MAX_COLOR_ATTACHMENTS: number;
    readonly COLOR_ATTACHMENT1: number;
    readonly COLOR_ATTACHMENT2: number;
    readonly COLOR_ATTACHMENT3: number;
    readonly COLOR_ATTACHMENT4: number;
    readonly COLOR_ATTACHMENT5: number;
    readonly COLOR_ATTACHMENT6: number;
    readonly COLOR_ATTACHMENT7: number;
    readonly COLOR_ATTACHMENT8: number;
    readonly COLOR_ATTACHMENT9: number;
    readonly COLOR_ATTACHMENT10: number;
    readonly COLOR_ATTACHMENT11: number;
    readonly COLOR_ATTACHMENT12: number;
    readonly COLOR_ATTACHMENT13: number;
    readonly COLOR_ATTACHMENT14: number;
    readonly COLOR_ATTACHMENT15: number;

    // Samplers
    readonly SAMPLER_3D: number;
    readonly SAMPLER_2D_SHADOW: number;
    readonly SAMPLER_2D_ARRAY: number;
    readonly SAMPLER_2D_ARRAY_SHADOW: number;
    readonly SAMPLER_CUBE_SHADOW: number;
    readonly INT_SAMPLER_2D: number;
    readonly INT_SAMPLER_3D: number;
    readonly INT_SAMPLER_CUBE: number;
    readonly INT_SAMPLER_2D_ARRAY: number;
    readonly UNSIGNED_INT_SAMPLER_2D: number;
    readonly UNSIGNED_INT_SAMPLER_3D: number;
    readonly UNSIGNED_INT_SAMPLER_CUBE: number;
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: number;
    readonly MAX_SAMPLES: number;
    readonly SAMPLER_BINDING: number;

    // Buffers
    readonly PIXEL_PACK_BUFFER: number;
    readonly PIXEL_UNPACK_BUFFER: number;
    readonly PIXEL_PACK_BUFFER_BINDING: number;
    readonly PIXEL_UNPACK_BUFFER_BINDING: number;
    readonly COPY_READ_BUFFER: number;
    readonly COPY_WRITE_BUFFER: number;
    readonly COPY_READ_BUFFER_BINDING: number;
    readonly COPY_WRITE_BUFFER_BINDING: number;

    // Data types
    readonly FLOAT_MAT2x3: number;
    readonly FLOAT_MAT2x4: number;
    readonly FLOAT_MAT3x2: number;
    readonly FLOAT_MAT3x4: number;
    readonly FLOAT_MAT4x2: number;
    readonly FLOAT_MAT4x3: number;
    readonly UNSIGNED_INT_VEC2: number;
    readonly UNSIGNED_INT_VEC3: number;
    readonly UNSIGNED_INT_VEC4: number;
    readonly UNSIGNED_NORMALIZED: number;
    readonly SIGNED_NORMALIZED: number;

    // Vertex attributes
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: number;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;

    // Transform feedback
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: number;
    readonly TRANSFORM_FEEDBACK_VARYINGS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_START: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: number;
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: number;
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: number;
    readonly INTERLEAVED_ATTRIBS: number;
    readonly SEPARATE_ATTRIBS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: number;
    readonly TRANSFORM_FEEDBACK: number;
    readonly TRANSFORM_FEEDBACK_PAUSED: number;
    readonly TRANSFORM_FEEDBACK_ACTIVE: number;
    readonly TRANSFORM_FEEDBACK_BINDING: number;

    // Framebuffers and renderbuffers
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: number;
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: number;
    readonly FRAMEBUFFER_DEFAULT: number;
    readonly DEPTH_STENCIL_ATTACHMENT: number;
    readonly DEPTH_STENCIL: number;
    readonly DEPTH24_STENCIL8: number;
    readonly DRAW_FRAMEBUFFER_BINDING: number;
    readonly READ_FRAMEBUFFER: number;
    readonly DRAW_FRAMEBUFFER: number;
    readonly READ_FRAMEBUFFER_BINDING: number;
    readonly RENDERBUFFER_SAMPLES: number;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: number;
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: number;

    // Uniforms
    readonly UNIFORM_BUFFER: number;
    readonly UNIFORM_BUFFER_BINDING: number;
    readonly UNIFORM_BUFFER_START: number;
    readonly UNIFORM_BUFFER_SIZE: number;
    readonly MAX_VERTEX_UNIFORM_BLOCKS: number;
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: number;
    readonly MAX_COMBINED_UNIFORM_BLOCKS: number;
    readonly MAX_UNIFORM_BUFFER_BINDINGS: number;
    readonly MAX_UNIFORM_BLOCK_SIZE: number;
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: number;
    readonly ACTIVE_UNIFORM_BLOCKS: number;
    readonly UNIFORM_TYPE: number;
    readonly UNIFORM_SIZE: number;
    readonly UNIFORM_BLOCK_INDEX: number;
    readonly UNIFORM_OFFSET: number;
    readonly UNIFORM_ARRAY_STRIDE: number;
    readonly UNIFORM_MATRIX_STRIDE: number;
    readonly UNIFORM_IS_ROW_MAJOR: number;
    readonly UNIFORM_BLOCK_BINDING: number;
    readonly UNIFORM_BLOCK_DATA_SIZE: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: number;

    // Sync objects
    readonly OBJECT_TYPE: number;
    readonly SYNC_CONDITION: number;
    readonly SYNC_STATUS: number;
    readonly SYNC_FLAGS: number;
    readonly SYNC_FENCE: number;
    readonly SYNC_GPU_COMMANDS_COMPLETE: number;
    readonly UNSIGNALED: number;
    readonly SIGNALED: number;
    readonly ALREADY_SIGNALED: number;
    readonly TIMEOUT_EXPIRED: number;
    readonly CONDITION_SATISFIED: number;
    readonly WAIT_FAILED: number;
    readonly SYNC_FLUSH_COMMANDS_BIT: number;

    // Misc
    readonly COLOR: number;
    readonly DEPTH: number;
    readonly STENCIL: number;
    readonly MIN: number;
    readonly MAX: number;
    readonly DEPTH_COMPONENT24: number;
    readonly STREAM_READ: number;
    readonly STREAM_COPY: number;
    readonly STATIC_READ: number;
    readonly STATIC_COPY: number;
    readonly DYNAMIC_READ: number;
    readonly DYNAMIC_COPY: number;
    readonly DEPTH_COMPONENT32F: number;
    readonly DEPTH32F_STENCIL8: number;
    readonly INVALID_INDEX: number;
    readonly TIMEOUT_IGNORED: number;
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: number;
}


interface WebGLTimerQueryEXT extends WebGLQuery {
}

declare var WebGLTimerQueryEXT: {
    prototype: WebGLTimerQueryEXT;
    new(): WebGLTimerQueryEXT;
}


interface EXT_disjoint_timer_query {
    createQueryEXT(): WebGLTimerQueryEXT | null;
    deleteQueryEXT(query: WebGLTimerQueryEXT | null): void;
    isQueryEXT(query: WebGLTimerQueryEXT | null): boolean;
    beginQueryEXT(target: number, query: WebGLTimerQueryEXT | null): void;
    endQueryEXT(target: number): void;
    queryCounterEXT(query: WebGLTimerQueryEXT | null, target: number): number;
    getQueryEXT(target: number, pname: number): WebGLTimerQueryEXT | number | null;
    getQueryObjectEXT(query: WebGLTimerQueryEXT | null, pname: number): number | boolean;

    readonly QUERY_COUNTER_BITS_EXT: number;
    readonly CURRENT_QUERY_EXT: number;
    readonly QUERY_RESULT_EXT: number;
    readonly QUERY_RESULT_AVAILABLE_EXT: number;
    readonly TIME_ELAPSED_EXT: number;
    readonly TIMESTAMP_EXT: number;
    readonly GPU_DISJOINT_EXT: number;
}

declare var EXT_disjoint_timer_query: {
    prototype: EXT_disjoint_timer_query;
    new(): EXT_disjoint_timer_query;

    readonly QUERY_COUNTER_BITS_EXT: number;
    readonly CURRENT_QUERY_EXT: number;
    readonly QUERY_RESULT_EXT: number;
    readonly QUERY_RESULT_AVAILABLE_EXT: number;
    readonly TIME_ELAPSED_EXT: number;
    readonly TIMESTAMP_EXT: number;
    readonly GPU_DISJOINT_EXT: number;
}


interface HTMLCanvasElement {
    getContext(contextId: "webgl2" | "experimental-webgl2", contextAttributes?: WebGLContextAttributes): WebGL2RenderingContext | null;
}
