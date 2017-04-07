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
        let vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vs, options.VertexShader);
        this.gl.compileShader(vs);
        if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
            console.error("Failed to compile vertex shader:\n" + this.gl.getShaderInfoLog(vs));
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
        let gl = this.gl;
        let gl2 = this.gl as WebGL2RenderingContext;
        const isDefaultPass: boolean = !pass.ColorAttachments[0].texture;
        const width = isDefaultPass ? this.gl.canvas.width : pass.ColorAttachments[0].texture.width;
        const height = isDefaultPass ? this.gl.canvas.height : pass.ColorAttachments[0].texture.height;
        if (isDefaultPass) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, pass.glFrameBuffer);
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

        if (isDefaultPass || !this.webgl2) {
            let clearMask = 0;
            const col = pass.ColorAttachments[0];
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

        // some validity checks
        if ((drawState.indexBuffer != null) && (drawState.pipeline.indexFormat == IndexFormat.None)) {
            console.warn("altai.applyDrawState(): index buffer bound but pipeline.indexFormat is none!");
        }
        if ((drawState.indexBuffer == null) && (drawState.pipeline.indexFormat != IndexFormat.None)) {
            console.warn("altai.applyDrawState(): pipeline.indexFormat is not none, but no index buffer bound!");
        } 

        this.curPrimType = drawState.pipeline.primitiveType;

        // update render state
        this.applyState(drawState.pipeline.state, false);

        // apply shader program
        if (this.curProgram != drawState.pipeline.shader.glProgram) {
            this.curProgram = drawState.pipeline.shader.glProgram;
            this.gl.useProgram(this.curProgram);
        }

        // apply index and vertex data
        this.curIndexFormat = drawState.pipeline.indexFormat;
        this.curIndexSize = drawState.pipeline.indexSize;
        if (drawState.indexBuffer != null) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, drawState.indexBuffer.glBuffer);
        }
        else {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
        let curVB: WebGLBuffer = null;
        for (let attrIndex = 0; attrIndex < MaxNumVertexAttribs; attrIndex++) {
            let attrib = drawState.pipeline.glAttribs[attrIndex];
            // FIXME: implement a state cache for vertex attrib bindings
            if (attrib.enabled) {
                if (drawState.vertexBuffers[attrib.vbIndex].glBuffer != curVB) {
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
    applyUniforms(uniforms: {[key: string]: number[] | number}) {
        for (let key in uniforms) {
            const val = uniforms[key];
            const loc = this.gl.getUniformLocation(this.curProgram, key);
            if (loc !== null) {
                if (typeof val === "number") {
                    this.gl.uniform1f(loc, val);
                }
                else {
                    switch (val.length) {
                        case 1: this.gl.uniform1fv(loc, val); break;
                        case 2: this.gl.uniform2fv(loc, val); break;
                        case 3: this.gl.uniform3fv(loc, val); break;
                        case 4: this.gl.uniform4fv(loc, val); break;
                        case 16: this.gl.uniformMatrix4fv(loc, false, val); break;
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

}