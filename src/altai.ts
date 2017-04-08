/// <reference path="types.ts"/>

'use strict'

module altai {

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

let cubeFaceMap: [number] = [
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
    WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z
]

/**
 * Altai's main interface for resource creation and rendering.
 */
export class Gfx {
    private gl : WebGL2RenderingContext | WebGLRenderingContext;
    private webgl2 : boolean = false;
    private cache: PipelineState;
    private curProgram: WebGLProgram;
    private curIndexFormat: GLenum;
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
        if (some(options.UseWebGL2, false)) {
            this.gl = (canvas.getContext("webgl2", glContextAttrs) ||
                       canvas.getContext("webgl2-experimental", glContextAttrs)) as WebGL2RenderingContext;
            if (this.gl != null) {
                this.webgl2 = true;
                console.log("altai: using webgl2");
            } 
        }
        if (this.gl == null) {
            this.gl = (canvas.getContext("webgl", glContextAttrs) ||
                       canvas.getContext("experimental-webgl", glContextAttrs)) as WebGLRenderingContext;
            console.log("altai: using webgl1");
        }
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);

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
        // special handling for default pass
        if (null == options.ColorAttachments[0].Texture) {
            return new Pass(options, null, null);
        }

        // an offscreen pass, need to create a framebuffer with color- and depth attachments
        let gl = this.gl;
        let gl2 = this.gl as WebGL2RenderingContext;
        const isMSAA = options.ColorAttachments[0].Texture.sampleCount > 1;
        const glFb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, glFb);
        if (isMSAA) {
            // MSAA offscreen rendering, attach the MSAA renderbuffers from texture objects
            for (let i = 0; i < options.ColorAttachments.length; i++) {
                const glMsaaFb = options.ColorAttachments[i].Texture.glMSAARenderBuffer;
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, gl.RENDERBUFFER, glMsaaFb);
            }
        }
        else {
            // non-MSAA rendering, attach texture objects
            for (let i = 0; i < options.ColorAttachments.length; i++) {
                const att = options.ColorAttachments[i];
                const tex = att.Texture;
                switch (tex.type) {
                    case TextureType.Texture2D:
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, 
                            gl.TEXTURE_2D, tex.glTexture, att.MipLevel);
                        break;
                    case TextureType.TextureCube:
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, 
                            cubeFaceMap[att.Slice], tex.glTexture, att.MipLevel);
                        break;
                    default:
                        // 3D and 2D-array textures
                        gl2.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i,
                            tex.glTexture, att.MipLevel, att.Slice);
                        break;
                }
            }
        }
        // attach optional depth-stencil buffer to framebuffer
        if (options.DepthAttachment.Texture) {
            const glDSRenderBuffer = options.DepthAttachment.Texture.glDepthRenderBuffer;
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, glDSRenderBuffer);
            if (options.DepthAttachment.Texture.depthFormat == DepthStencilFormat.DEPTHSTENCIL) {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, glDSRenderBuffer);
            }
        }
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            console.warn('altai.makePass(): framebuffer completeness check failed!');
        } 

        // for MSAA, create resolve-framebuffers
        let glMsaaFbs = [];
        if (isMSAA) {
            for (let i = 0; i < options.ColorAttachments.length; i++) {
                glMsaaFbs[i] = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, glMsaaFbs[i]);
                const att = options.ColorAttachments[i];
                const glTex = att.Texture.glTexture;
                switch (att.Texture.type) {
                    case TextureType.Texture2D:
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTex, att.MipLevel);
                        break;
                    case TextureType.TextureCube:
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, cubeFaceMap[att.Slice], glTex, att.MipLevel);
                        break;
                    default:
                        gl2.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glTex, att.MipLevel, att.Slice);
                        break;
                }
                if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
                    console.warn('altai.makePass(): framebuffer completeness check failed (for MSAA resolve buffers)');
                }
            }
        }
        return new Pass(options, glFb, glMsaaFbs);
    }

    /**
     * Create a new Buffer object.
     * 
     * @param {BufferOptions} options - Buffer creation options 
     */
    makeBuffer(options: BufferOptions): Buffer {
        let gl = this.gl;
        let buf = new Buffer(options, gl.createBuffer());
        gl.bindBuffer(buf.type, buf.glBuffer);
        if (options.Data) {
            gl.bufferData(buf.type, options.Data, buf.usage);
        }
        else if (options.LengthInBytes) {
            gl.bufferData(buf.type, options.LengthInBytes, buf.usage);
        }
        return buf;
    }
    
    private asGLTexImgFormat(p: PixelFormat): number {
        const gl = this.gl;
        switch (p) {
            case PixelFormat.RGBA8:
            case PixelFormat.RGBA4:
            case PixelFormat.RGB5_A1:
            case PixelFormat.RGB10_A2:
            case PixelFormat.RGBA32F:
            case PixelFormat.RGBA16F:
                return gl.RGBA;
            case PixelFormat.RGB8:
            case PixelFormat.RGB565:
                return gl.RGB;
            case PixelFormat.R32F:
            case PixelFormat.R16F:
                return gl.LUMINANCE;
            default:
                return 0;
        }
    }

    private asGLDepthTexImgFormat(d: DepthStencilFormat): number {
        switch (d) {
            case DepthStencilFormat.DEPTH: return this.gl.DEPTH_COMPONENT16;
            case DepthStencilFormat.DEPTHSTENCIL: return this.gl.DEPTH_STENCIL;
            default: return 0;
        }
    }

    private asGLTexImgType(p: PixelFormat): number {
        const gl = this.gl;
        switch (p) {
            case PixelFormat.RGBA32F:
            case PixelFormat.R32F:
                return gl.FLOAT;
            case PixelFormat.RGBA16F:
            case PixelFormat.R16F:
                return WebGL2RenderingContext.HALF_FLOAT;
            case PixelFormat.RGBA8:
            case PixelFormat.RGB8:
                return gl.UNSIGNED_BYTE;
            case PixelFormat.RGB5_A1:
                return gl.UNSIGNED_SHORT_5_5_5_1;
            case PixelFormat.RGB565:
                return gl.UNSIGNED_SHORT_5_6_5;
            case PixelFormat.RGBA4:
                return gl.UNSIGNED_SHORT_4_4_4_4;
        }
    }

    /**
     * Create a new Texture object
     * 
     * @param {TextureOptions} options - Texture creation options
     */
    makeTexture(options: TextureOptions): Texture {
        let gl = this.gl;
        let tex = new Texture(options, gl);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(tex.type, tex.glTexture);
        gl.texParameteri(tex.type, gl.TEXTURE_MIN_FILTER, tex.minFilter);
        gl.texParameteri(tex.type, gl.TEXTURE_MAG_FILTER, tex.magFilter);
        gl.texParameteri(tex.type, gl.TEXTURE_WRAP_S, tex.wrapU);
        gl.texParameteri(tex.type, gl.TEXTURE_WRAP_T, tex.wrapV);
        if (tex.type == WebGL2RenderingContext.TEXTURE_3D) {
            gl.texParameteri(tex.type, WebGL2RenderingContext.TEXTURE_WRAP_R, tex.wrapW);
        }
        const numFaces = tex.type == TextureType.TextureCube ? 6 : 1;
        const imgFmt = this.asGLTexImgFormat(tex.colorFormat);
        const imgType = this.asGLTexImgType(tex.colorFormat);
        for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
            const imgTgt = tex.type == TextureType.TextureCube ? cubeFaceMap[faceIndex] : tex.type;
            for (let mipIndex = 0; mipIndex < tex.numMipMaps; mipIndex++) {
                // FIXME: data!
                let mipWidth = tex.width >> mipIndex;
                if (mipWidth == 0) {
                    mipWidth = 1;
                }
                let mipHeight = tex.height >> mipIndex;
                if (mipHeight == 0) {
                    mipHeight = 1;
                }
                if ((TextureType.Texture2D == tex.type) || (TextureType.TextureCube == tex.type)) {
                    // FIXME: compressed formats + data
                    gl.texImage2D(imgTgt, mipIndex, imgFmt, mipWidth, mipHeight, 0, imgFmt, imgType, null);
                }
            }
        }

        // MSAA render buffer?
        const isMSAA = tex.sampleCount > 1;
        if (isMSAA) {
            let gl2 = gl as WebGL2RenderingContext;
            gl2.bindRenderbuffer(gl.RENDERBUFFER, tex.glMSAARenderBuffer);
            gl2.renderbufferStorageMultisample(gl.RENDERBUFFER, tex.sampleCount, imgFmt, tex.width, tex.height);
        }
        // depth render buffer?
        if (tex.depthFormat != DepthStencilFormat.NONE) {
            const depthFmt = this.asGLDepthTexImgFormat(tex.depthFormat);
            gl.bindRenderbuffer(gl.RENDERBUFFER, tex.glDepthRenderBuffer);
            if (isMSAA) {
                let gl2 = gl as WebGL2RenderingContext;
                gl2.renderbufferStorageMultisample(gl.RENDERBUFFER, tex.sampleCount, depthFmt, tex.width, tex.height);
            }
            else {
                gl.renderbufferStorage(gl.RENDERBUFFER, depthFmt, tex.width, tex.height);
            }
        }
        return tex;
    }

    /**
     * Create a new Shader object.
     * 
     *  @param {ShaderOptions} options - Shader creation options
     */
    makeShader(options: ShaderOptions): Shader {
        let gl = this.gl;
        let vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, options.VertexShader);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            console.error("Failed to compile vertex shader:\n" + gl.getShaderInfoLog(vs));
        }

        let fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, options.FragmentShader);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error("Failed to compile fragment shader:\n" + gl.getShaderInfoLog(fs));
        }

        let prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Failed to link shader program!");
        }
        let shd = new Shader(prog); 
        gl.deleteShader(vs);
        gl.deleteShader(fs);

        return shd;
    }

    /**
     * Create a new Pipeline object.
     * 
     * @param {PipelineOptions} options - Pipeline creation options
     */
    makePipeline(options: PipelineOptions): Pipeline {
        let gl = this.gl;
        let pip = new Pipeline(options);

        // resolve vertex attributes
        for (let layoutIndex = 0; layoutIndex < pip.vertexLayouts.length; layoutIndex++) {
            const layout = pip.vertexLayouts[layoutIndex];
            const layoutByteSize = layout.byteSize();
            for (let compIndex = 0; compIndex < layout.components.length; compIndex++) {
                let comp = layout.components[compIndex];
                const attrName = comp[0];
                const attrFormat = comp[1];
                const attrIndex = gl.getAttribLocation(pip.shader.glProgram, attrName);
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
        let gl = this.gl;
        let gl2 = this.gl as WebGL2RenderingContext;
        const isDefaultPass: boolean = !pass.ColorAttachments[0].texture;
        const width = isDefaultPass ? gl.canvas.width : pass.ColorAttachments[0].texture.width;
        const height = isDefaultPass ? gl.canvas.height : pass.ColorAttachments[0].texture.height;
        if (isDefaultPass) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, pass.glFramebuffer);
            if (this.webgl2) {
                let drawBuffers : number[] = [];
                for (let i = 0; i < pass.ColorAttachments.length; i++) {
                    if (pass.ColorAttachments[i].texture) {
                        drawBuffers[i] = gl.COLOR_ATTACHMENT0 + i;
                    }
                }
                gl2.drawBuffers(drawBuffers);
            }
        }

        // prepare clear operations
        gl.viewport(0, 0, width, height);
        gl.disable(WebGLRenderingContext.SCISSOR_TEST);
        gl.colorMask(true, true, true, true);
        gl.depthMask(true);
        gl.stencilMask(0xFF);

        // update cache
        this.cache.scissorTestEnabled = false;
        this.cache.colorWriteMask[0] = true;
        this.cache.colorWriteMask[1] = true;
        this.cache.colorWriteMask[2] = true;
        this.cache.colorWriteMask[3] = true;
        this.cache.depthWriteEnabled = true;
        this.cache.frontStencilWriteMask = 0xFF;
        this.cache.backStencilWriteMask = 0xFF;

        if (isDefaultPass || !this.webgl2) {
            let clearMask = 0;
            const col = pass.ColorAttachments[0];
            const dep = pass.DepthAttachment;
            if (col.loadAction == LoadAction.Clear) {
                clearMask |= WebGLRenderingContext.COLOR_BUFFER_BIT;
                gl.clearColor(col.clearColor[0], col.clearColor[1], col.clearColor[2], col.clearColor[3]);
            }
            if (dep.loadAction == LoadAction.Clear) {
                clearMask |= WebGLRenderingContext.DEPTH_BUFFER_BIT|WebGLRenderingContext.STENCIL_BUFFER_BIT;
                gl.clearDepth(dep.clearDepth);
                gl.clearStencil(dep.clearStencil);
            }
            if (0 != clearMask) {
                gl.clear(clearMask);
            }
        }
        else {
            // offscreen WebGL2 (could be MRT)
            for (let i = 0; i < pass.ColorAttachments.length; i++) {
                const col = pass.ColorAttachments[i];
                if (col.texture && (LoadAction.Clear == col.loadAction)) {
                    gl2.clearBufferfv(gl2.COLOR, i, col.clearColor);
                }
            }
            const dep = pass.DepthAttachment;
            if (LoadAction.Clear == dep.loadAction) {
                gl2.clearBufferfi(gl2.DEPTH_STENCIL, 0, dep.clearDepth, dep.clearStencil);
            }
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
        let gl = this.gl;

        // some validity checks
        if ((drawState.IndexBuffer != null) && (drawState.Pipeline.indexFormat == IndexFormat.None)) {
            console.warn("altai.applyDrawState(): index buffer bound but pipeline.indexFormat is none!");
        }
        if ((drawState.IndexBuffer == null) && (drawState.Pipeline.indexFormat != IndexFormat.None)) {
            console.warn("altai.applyDrawState(): pipeline.indexFormat is not none, but no index buffer bound!");
        } 

        this.curPrimType = drawState.Pipeline.primitiveType;

        // update render state
        this.applyState(drawState.Pipeline.state, false);

        // apply shader program
        if (this.curProgram != drawState.Pipeline.shader.glProgram) {
            this.curProgram = drawState.Pipeline.shader.glProgram;
            gl.useProgram(this.curProgram);
        }

        // apply index and vertex data
        this.curIndexFormat = drawState.Pipeline.indexFormat;
        this.curIndexSize = drawState.Pipeline.indexSize;
        if (drawState.IndexBuffer != null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, drawState.IndexBuffer.glBuffer);
        }
        else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        let curVB: WebGLBuffer = null;
        for (let attrIndex = 0; attrIndex < MaxNumVertexAttribs; attrIndex++) {
            let attrib = drawState.Pipeline.glAttribs[attrIndex];
            // FIXME: implement a state cache for vertex attrib bindings
            if (attrib.enabled) {
                if (drawState.VertexBuffers[attrib.vbIndex].glBuffer != curVB) {
                    curVB = drawState.VertexBuffers[attrib.vbIndex].glBuffer;
                    gl.bindBuffer(gl.ARRAY_BUFFER, curVB);
                }
                gl.vertexAttribPointer(attrIndex, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
                gl.enableVertexAttribArray(attrIndex);
                // FIMXE: WebGL2 vertex attrib divisor!
            }
            else {
                gl.disableVertexAttribArray(attrIndex);
            }
        }
        
        // apply texture uniforms
        let texSlot = 0;
        for (let key in drawState.Textures) {
            const tex = drawState.Textures[key];
            const loc = gl.getUniformLocation(this.curProgram, key);
            gl.activeTexture(gl.TEXTURE0+texSlot);
            gl.bindTexture(tex.type, tex.glTexture);
            gl.uniform1i(loc, texSlot);
            texSlot++;
        }
    }

    /**
     * Apply shader uniforms by name and value. Only the following
     * types are allowed: float, vec2, vec3, vec4, mat4. Textures
     * are applied via applyDrawState.
     * 
     * @param uniforms  - uniform name/value pairs
     */
    applyUniforms(uniforms: {[key: string]: number[] | number}) {
        let gl = this.gl;
        for (let key in uniforms) {
            const val = uniforms[key];
            const loc = gl.getUniformLocation(this.curProgram, key);
            if (loc !== null) {
                if (typeof val === "number") {
                    gl.uniform1f(loc, val);
                }
                else {
                    switch (val.length) {
                        case 1: gl.uniform1fv(loc, val); break;
                        case 2: gl.uniform2fv(loc, val); break;
                        case 3: gl.uniform3fv(loc, val); break;
                        case 4: gl.uniform4fv(loc, val); break;
                        case 16: gl.uniformMatrix4fv(loc, false, val); break;
                        default: console.warn('altai.applyUniforms: invalid parameter type!');
                    }
                }
            }
        }
    }

    /**
     * Draw primitive range with current draw settings.
     * 
     * @param {number} baseElement  - index of first vertex or index
     * @param {number} numElements  - number of vertices or indices
     * @param {number} numInstances - number of instances (default: 1)
     */
    draw(baseElement: number, numElements: number, numInstances: number = 1) {
        if (IndexFormat.None == this.curIndexFormat) {
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
                this.gl.drawElements(this.curPrimType, numElements, this.curIndexFormat, indexOffset);
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
        let gl = this.gl;
        // apply depth-stencil state changes
        if (force || (this.cache.depthCmpFunc != state.depthCmpFunc)) {
            this.cache.depthCmpFunc = state.depthCmpFunc;
            gl.depthFunc(state.depthCmpFunc);
        }
        if (force || (this.cache.depthWriteEnabled != state.depthWriteEnabled)) {
            this.cache.depthWriteEnabled = state.depthWriteEnabled;
            gl.depthMask(state.depthWriteEnabled);
        }
        if (force || (this.cache.stencilEnabled != state.stencilEnabled)) {
            this.cache.stencilEnabled = state.stencilEnabled;
            if (state.stencilEnabled) gl.enable(gl.STENCIL_TEST);
            else gl.disable(gl.STENCIL_TEST);
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
            gl.stencilFuncSeparate(gl.FRONT, sCmpFunc, sRef, sReadMask);
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
            gl.stencilFuncSeparate(gl.BACK, sCmpFunc, sRef, sReadMask);
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
            gl.stencilOpSeparate(gl.FRONT, sFailOp, sDepthFailOp, sPassOp);
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
            gl.stencilOpSeparate(gl.BACK, sFailOp, sDepthFailOp, sPassOp);
        }
        if (force || (this.cache.frontStencilWriteMask != state.frontStencilWriteMask)) {
            this.cache.frontStencilWriteMask = state.frontStencilWriteMask;
            gl.stencilMaskSeparate(gl.FRONT, state.frontStencilWriteMask)
        }
        if (force || (this.cache.backStencilWriteMask != state.backStencilWriteMask)) {
            this.cache.backStencilWriteMask = state.backStencilWriteMask;
            gl.stencilMaskSeparate(gl.BACK, state.backStencilWriteMask);
        }

        // apply blend state changes
        if (force || (this.cache.blendEnabled != state.blendEnabled)) {
            this.cache.blendEnabled = state.blendEnabled;
            gl.enable(gl.BLEND);
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
            gl.blendFuncSeparate(state.blendSrcFactorRGB, 
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
            gl.blendEquationSeparate(state.blendOpRGB, state.blendOpAlpha);
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
            gl.colorMask(state.colorWriteMask[0], 
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
            gl.blendColor(state.blendColor[0],
                          state.blendColor[1],
                          state.blendColor[2],
                          state.blendColor[3]);
        }

        // apply rasterizer state
        if (force || (this.cache.cullFaceEnabled != state.cullFaceEnabled)) {
            this.cache.cullFaceEnabled = state.cullFaceEnabled;
            if (state.cullFaceEnabled) gl.enable(gl.CULL_FACE);
            else                       gl.disable(gl.CULL_FACE);            
        }
        if (force || (this.cache.cullFace != state.cullFace)) {
            this.cache.cullFace = state.cullFace;
            gl.cullFace(state.cullFace);
        }
        if (force || (this.cache.scissorTestEnabled != state.scissorTestEnabled)) {
            this.cache.scissorTestEnabled = state.scissorTestEnabled;
            if (state.scissorTestEnabled) gl.enable(gl.SCISSOR_TEST);
            else                          gl.disable(gl.SCISSOR_TEST);
        }
    }

}

}