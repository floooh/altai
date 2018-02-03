/// <reference path="../webgl2/WebGL2.d.ts"/>

export namespace altai {

export enum feature {
    instancing,
    texture_compression_dxt,
    texture_compression_pvrtc,
    texture_compression_atc,
    texture_compression_etc2,
    texture_float,
    texture_half_float,
    origin_bottom_left,
    origin_top_left,
    msaa_render_targets,
    packed_vertex_format_10_2,
    multiple_render_target,
    imagetype_3d,
    imagetype_array
}

export enum resource_state {
    initial,
    alloc,
    valid,
    failed,
    invalid
}

export enum usage {
    immutable,
    dynamic,
    stream
}

export enum buffer_type {
    vertex_buffer,
    index_buffer
}

export enum index_type {
    none,
    uint16,
    uint32
}

export enum image_type {
    image_2d,
    image_cube,
    image_3d,
    image_array
}

export enum cube_face {
    pos_x,
    neg_x,
    pos_y,
    neg_y,
    pos_z,
    neg_z
}

export enum shader_stage {
    vs,
    fs
}

export enum pixel_format {
    none,
    rgba8,
    rgb8,
    rgba4,
    r5g6b5,
    r5g5b5a1,
    r10g10b10a2,
    rgba32f,
    rgba16f,
    r32f,
    r16f,
    l8,
    dxt1,
    dxt3,
    dxt5,
    depth,
    depth_stencil,
    pvrtc2_rgb,
    pvrtc4_rgb,
    pvrct2_rgba,
    pvrtc4_rgba,
    etc2_rgb8,
    etc2_srgb8
}

export enum primitive_type {
    points,
    lines,
    line_strip,
    triangles,
    triangle_strip
}

export enum filter {
    nearest,
    linear,
    nearest_mipmap_nearest,
    nereast_mipmap_linear,
    linear_mipmap_nearest,
    linear_mipmap_linear,
}

export enum wrap {
    repeat,
    clamp_to_edge,
    mirrored_repeat
}

export enum vertex_format {
    float,
    float2,
    float3,
    float4,
    byte4,
    byte4n,
    ubyte4,
    ubyte4n,
    short2,
    short2n,
    short4,
    short4n,
    uint10_n2
}

export enum vertex_step {
    per_vertex,
    per_instance,
}

export enum uniform_type {
    float,
    float2,
    float3,
    float4,
    mat4
}

export enum cull_mode {
    none,
    front,
    back
}

export enum face_winding {
    ccw,
    cw
}

export enum compare_func {
    never,
    less,
    equal,
    less_equal,
    greater,
    not_equal,
    greater_equal,
    always
}

export enum stencil_op {
    keep,
    zero,
    replace,
    incr_clamp,
    decr_clamp,
    invert,
    incr_wrap,
    decr_wrap
}

export enum blend_factor {
    zero,
    one,
    src_color,
    one_minus_src_color,
    src_alpha,
    one_minus_src_alpha,
    dst_color,
    one_minus_dst_color,
    dst_alpha,
    one_minus_dst_alpha,
    src_alpha_saturated,
    blend_color,
    one_minus_blend_color,
    blend_alpha,
    one_minus_blend_alpha
}

export enum blend_op {
    add,
    subtract,
    reverse_subtract
}

export enum color_mask {
    none = 0,
    r = 1<<0,
    g = 1<<1,
    b = 1<<2,
    a = 1<<3,
    rgb = r|g|b,
    rgba = rgb|a
}

export enum action {
    clear,
    load,
    dont_care
}

export class color_attachment_action {
    action: action = action.clear;
    color: [number, number, number, number] = [ 0.5, 0.5, 0.5, 1.0 ];
}

export class depth_attachment_action {
    action: action = action.clear;
    val: number = 1.0;
}

export class stencil_attachment_action {
    action: action = action.clear;
    val: number = 0;
}

export class pass_action {
    colors: color_attachment_action[];
    depth: depth_attachment_action;
    stencil: stencil_attachment_action;
}

export class buffer {
    state: resource_state = resource_state.invalid;
    size: number;
    type: buffer_type;
    usage: usage;
    upd_frame_index: number;
    num_slots: number;
    active_slot: number;
    gl_buf: [WebGLBuffer, WebGLBuffer];
}

export class image {
    state: resource_state = resource_state.invalid;
    type: image_type;
    render_target: boolean;
    width: number;
    height: number;
    depth: number;
    num_mipmaps: number;
    usage: usage;
    format: pixel_format;
    sample_count: number;
    min_filter: filter;
    mag_filter: filter;
    wrap_u: wrap;
    wrap_v: wrap;
    wrap_w: wrap;
    max_anisotropy: number;
    gl_target: GLenum;
    gl_depth_render_buffer: WebGLRenderbuffer;
    gl_msaa_render_buffer: WebGLRenderbuffer;
    upd_frame_index: number;
    num_slots: number;
    active_slot: number;
    gl_tex: [WebGLTexture, WebGLTexture];
}

export class shader {
    state: resource_state = resource_state.invalid;
    gl_prog: WebGLProgram;
}

export class _gl_attr {
    vb_index: number = -1;
    divisor: number = -1;
    stride: number = 0;
    size: number = 0;
    normalized: boolean = false;
    offset: number = 0;
    type: GLenum = 0;
}

export class pipeline {
    state: resource_state = resource_state.invalid;
    primitive_type: primitive_type;
    index_type: index_type;
    vertex_layout_valid: [boolean, boolean, boolean, boolean];
    // depth-stencil-state
    stencil_front_fail_op: stencil_op;
    stencil_front_depth_fail_op: stencil_op;
    stencil_front_pass_op: stencil_op;
    stencil_front_compare_func: compare_func;
    stencil_back_fail_op: stencil_op;
    stencil_back_depth_fail_op: stencil_op;
    stencil_back_pass_op: stencil_op;
    stencil_back_compare_func: compare_func;
    depth_compare_func: compare_func;
    depth_write_enabled: boolean;
    stencil_enabled: boolean;
    stencil_read_mask: number;
    stencil_write_mask: number;
    stencil_ref: number;
    // blend state
    enabled: boolean;
    src_factor_rgb: blend_factor;
    dst_factor_rgb: blend_factor;
    op_rgb: blend_op;
    src_factor_alpha: blend_factor;
    dst_factor_alpha: blend_factor;
    op_alpha: blend_op;
    color_write_mask: number;
    color_attachment_count: number;
    color_format: pixel_format;
    depth_format: pixel_format;
    blend_color: [number, number, number, number];
    // rasterizer state
    alpha_to_coverage_enabled: boolean;
    cull_mode: cull_mode;
    face_winding: face_winding;
    sample_count: number;
    depth_bias: number;
    depth_bias_slope_scaled: number;
    depth_bias_clamp: number;
    // GL stuff
    gl_attrs: _gl_attr[];
    gl_prog: WebGLProgram;
}

export class attachment {
    image: image;
    mip_level: number;
    slice: number;
    gl_msaa_resolve_buffer: WebGLRenderbuffer;
}

export class pass {
    state: resource_state = resource_state.invalid;
    gl_fb: WebGLFramebuffer;
    color_attachments: attachment[];
    depth_stencil_attachment: attachment;
}

export class draw_state {
    pipeline: pipeline;
    vertex_buffers: buffer[]; 
    index_buffer?: buffer;
    images?: {[key: string]: image; };
}

export interface desc {
    use_webgl2?: boolean;
    canvas?: string;
    width?: number;
    height?: number;
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    anti_alias?: boolean;
    pre_multiplied_alpha?: boolean;
    preserve_drawing_buffer?: boolean;
    prefer_low_power_to_high_performance?: boolean;
    fail_if_major_performance_caveat?: boolean;
    high_dpi?: boolean;
}

export interface buffer_desc {
    size: number;
    type?: buffer_type;
    usage?: usage;
    content?: ArrayBufferView|ArrayBuffer;
}

export interface image_desc {
    type?: image_type;
    render_target?: boolean;
    width: number;
    height: number;
    depth?: number;
    layers?: number;
    num_mipmaps?: number;
    format?: pixel_format;
    sample_count?: number;
    min_filter?: filter;
    mag_filter?: filter;
    wrap_u?: wrap;
    wrap_v?: wrap;
    wrap_w?: wrap;
    max_anisotropy?: number;
    min_lod?: number;
    max_lod?: number;
    content?: (ArrayBufferView|ArrayBuffer)[][];
}

export interface shader_desc {
    vs: string;
    fs: string;
}

export interface buffer_layout_desc {
    stride?: number;
    step_func?: vertex_step;
    step_rate?: number;
}

export interface vertex_attr_desc {
    name: string;
    format: vertex_format;
    offset?: number;
    buffer_index?: number;
}

export interface layout_desc {
    buffers?: buffer_layout_desc[];
    attrs: vertex_attr_desc[];
}

export interface stencil_state_desc {
    fail_op?: stencil_op;
    depth_fail_op?: stencil_op;
    pass_op?: stencil_op;
    compare_func?: compare_func;
}

export interface depth_stencil_state_desc {
    stencil_front?: stencil_state_desc;
    stencil_back?: stencil_state_desc;
    depth_compare_func?: compare_func;
    depth_write_enabled?: boolean;
    stencil_enabled?: boolean;
    stencil_read_mask?: number;
    stencil_write_mask?: number;
    stencil_ref?: number;
}

export interface blend_state_desc {
    enabled?: boolean;
    src_factor_rgb?: blend_factor;
    dst_factor_rgb?: blend_factor;
    op_rgb?: blend_op;
    src_factor_alpha?: blend_factor;
    dst_factor_alpha?: blend_factor;
    op_alpha?: blend_op;
    color_write_mask?: number;
    color_attachment_count?: number;
    color_format?: pixel_format;
    depth_format?: pixel_format;
    blend_color?: [number, number, number, number];
}

export interface rasterizer_state_desc {
    alpha_to_coverage_enabled?: boolean;
    cull_mode?: cull_mode;
    face_winding?: face_winding;
    sample_count?: number;
    depth_bias?: number;
    depth_bias_slope_scaled?: number;
    depth_bias_clamp?: number;
}

export interface pipeline_desc {
    layout: layout_desc;
    shader: shader;
    primitive_type?: primitive_type;
    index_type?: index_type;
    depth_stencil?: depth_stencil_state_desc;
    blend?: blend_state_desc;
    rasterizer?: rasterizer_state_desc;
}

export interface attachment_desc {
    image: image;
    mip_level?: number;
    face?: number;
    layer?: number;
    slice?: number;
}

export interface pass_desc {
    color_attachments: attachment_desc[];
    depth_stencil_attachment: attachment_desc;
}

export function setup(desc?: desc) {
    // FIXME!
}

export function query_feature(feature: feature): boolean {
    // FIXME!
    return false;
}

export function reset_state_cache() {
    // FIXME
}

export function make_buffer(desc?: buffer_desc): buffer {
    // FIXME
    return new buffer();
}

export function make_image(desc?: image_desc): image {
    // FIXME
    return new image();
}

export function make_shader(desc?: shader_desc): shader {
    // FIXME
    return new shader();
}

export function make_pipeline(desc?: pipeline_desc): pipeline {
    // FIXME
    return new pipeline();
}

export function make_pass(desc?: pass_desc): pass {
    // FIXME
    return new pass();
}

export function destroy_buffer(buf: buffer) {
    // FIXME
}

export function destroy_image(img: image) {
    // FIXME
}

export function destroy_shader(shd: shader) {
    // FIXME
}

export function destroy_pipeline(pip: pipeline) {
    // FIXME
}

export function destroy_pass(pass: pass) {
    // FIXME
}

export function upate_buffer(buf: buffer, content: ArrayBufferView|ArrayBuffer) {
    // FIXME
}

export function update_image(img: image, content: (ArrayBufferView|ArrayBuffer)[][]) {
    // FIXME
}

export function query_buffer_state(buf: buffer): resource_state {
    // FIXME
    return resource_state.invalid;
}

export function query_image_state(img: image): resource_state {
    // FIXME
    return resource_state.invalid;
}

export function query_shader_state(shd: shader): resource_state {
    // FIXME
    return resource_state.invalid;
}

export function query_pipeline_state(pip: pipeline): resource_state {
    // FIXME
    return resource_state.invalid;
}

export function query_pass_state(pass: pass): resource_state {
    // FIXME
    return resource_state.invalid;
}

export function begin_pass(pass?: pass, action?: pass_action) {
    // FIXME
}

export function apply_viewport(x: number, y: number, w: number, h: number, origin_top_left?: boolean) {
    // FIXME
}

export function apply_scissor_rect(x: number, y: number, w: number, h: number, origin_top_left?: boolean) {
    // FIXME
}

export function apply_draw_state(ds: draw_state) {
    // FIXME
}

export function apply_uniforms(uniforms: {[key: string]: number[]|number}) {
    // FIXME
}

export function draw(base_element: number, num_elements: number, num_instances: number=1) {
    // FIXME
}

export function end_pass() {
    // FIXME
}

export function commit(draw_func: () => void) {
    requestAnimationFrame(draw_func);
}

export function alloc_buffer(): buffer {
    // FIXME
    return new buffer();
}

export function alloc_image(): image {
    // FIXME
    return new image();
}

export function alloc_shader(): shader {
    // FIXME
    return new shader();
}

export function alloc_pipeline(): pipeline {
    // FIXME
    return new pipeline();
}

export function alloc_pass(): pass {
    // FIXME
    return new pass();
}

export function init_buffer(buf: buffer, desc: buffer_desc) {
    // FIXME
}

export function init_image(img: image, desc: image_desc) {
    // FIXME
}

export function init_shader(shd: shader, desc: shader_desc) {
    // FIXME
}

export function init_pipeline(pip: pipeline, desc: pipeline_desc) {
    // FIXME
}

export function init_pass(pass: pass, desc: pass_desc) {
    // FIXME
}

export function fail_buffer(buf: buffer) {
    // FIXME
}

export function fail_image(img: image) {
    // FIMXE
}

export function fail_shader(shd: shader) {
    // FIXME
}

export function fail_pipeline(pip: pipeline) {
    // FIXME
}

export function fail_pass(pass: pass) {
    // FIXME
}

} // namespace altai