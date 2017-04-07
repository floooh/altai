function deg2rad(deg: number) {
    return (deg * Math.PI)/180.0;
}

function rad2deg(rad: number) {
    return (rad * 180.0) / Math.PI;
}

class vec4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    public constructor(x: number, y: number, z: number, w: number) {
        this.x=x; this.y=y; this.z=z; this.w=w;
    }

    public copy(): vec4 {
        return new vec4(this.x, this.y, this.z, this.w);
    }

    public values(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    public len(): number {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);
    }

    public static normalize(v: vec4): vec4 {
        const l = v.len();
        if (l > 0.0) {
            return new vec4(v.x/l, v.y/l, v.z/l, v.w/l);
        }
        else {
            return new vec4(0.0, 0.0, 0.0, 0.0);
        }
    }

    public static add(v0: vec4, v1: vec4): vec4 {
        return new vec4(v0.x+v1.x, v0.y+v1.y, v0.z+v1.z, v0.w+v1.w);
    }

    public static add3(v0: vec4, v1: vec4, v2: vec4): vec4 {
        return new vec4(v0.x+v1.x+v2.x, v0.y+v1.y+v2.y, v0.z+v1.z+v2.z, v0.w+v1.w+v2.w);
    }

    public static add4(v0: vec4, v1: vec4, v2: vec4, v3: vec4): vec4 {
        return new vec4(v0.x+v1.x+v2.x+v3.x, v0.y+v1.y+v2.y+v3.y, v0.z+v1.z+v2.z+v3.z, v0.w+v1.w+v2.w+v3.w);
    }
    public static muls(v0: vec4, s: number): vec4 {
        return new vec4(v0.x*s, v0.y*s, v0.z*s, v0.w*s);
    }
}

class mat4 {
    public v: vec4[];

    /** construct identity matrix */
    public constructor() {
        this.v = [
            new vec4(1.0, 0.0, 0.0, 0.0),
            new vec4(0.0, 1.0, 0.0, 0.0),
            new vec4(0.0, 0.0, 1.0, 0.0),
            new vec4(0.0, 0.0, 0.0, 1.0)
        ];
    }

    /** return content as array of numbers */
    public values(): number[] {
        return [
            this.v[0].x, this.v[0].y, this.v[0].z, this.v[0].w,
            this.v[1].x, this.v[1].y, this.v[1].z, this.v[1].w,
            this.v[2].x, this.v[2].y, this.v[2].z, this.v[2].w,
            this.v[3].x, this.v[3].y, this.v[3].z, this.v[3].w,
        ];
    }

    /** return a new identity matrix */
    public static identity(): mat4 {
        return new mat4();
    }

    /** create a new matrix by translating an existing one */
    public static translate(m: mat4, x: number, y: number, z: number): mat4 {
        let r = new mat4();
        let t0 = vec4.muls(m.v[0], x);
        let t1 = vec4.muls(m.v[1], y);
        let t2 = vec4.muls(m.v[2], z);
        let t3 = m.v[3];
        r.v[3] = vec4.add(t0, vec4.add(t1, vec4.add(t2, t3)));
        return r;
    }

    /** create a new matrix by rotating an existing one around an axis */
    public static rotate(m: mat4, a: number, x: number, y: number, z: number): mat4 {
        const c = Math.cos(a);
        const s = Math.sin(a);
        const axis = vec4.normalize(new vec4(x, y, z, 0.0));
        const t = vec4.muls(axis, (1.0 - c));

        let rot = new mat4();
        rot.v[0].x = c + t.x*axis.x;
        rot.v[0].y =     t.x*axis.y + s*axis.z;
        rot.v[0].z =     t.x*axis.z - s*axis.y;

        rot.v[1].x =     t.y*axis.x - s*axis.z;
        rot.v[1].y = c + t.y*axis.y;
        rot.v[1].z =     t.y*axis.z + s*axis.x;

        rot.v[2].x =     t.z*axis.x + s*axis.y;
        rot.v[2].y =     t.z*axis.y - s*axis.x;
        rot.v[2].z = c + t.z*axis.z;

        let res = new mat4();
        res.v[0] = vec4.add3(vec4.muls(m.v[0],rot.v[0].x), vec4.muls(m.v[1], rot.v[0].y), vec4.muls(m.v[2], rot.v[0].z));
        res.v[1] = vec4.add3(vec4.muls(m.v[0],rot.v[1].x), vec4.muls(m.v[1], rot.v[1].y), vec4.muls(m.v[2], rot.v[1].z));
        res.v[2] = vec4.add3(vec4.muls(m.v[0],rot.v[2].x), vec4.muls(m.v[1], rot.v[2].y), vec4.muls(m.v[2], rot.v[2].z));
        res.v[3] = m.v[3];
        return res;
    }


    /** matrix multiplication */
    public static mul(m1: mat4, m2: mat4): mat4 {
        const [a0,a1,a2,a3] = m1.v;
        const [b0,b1,b2,b3] = m2.v;
        let res = new mat4();
        res.v[0] = vec4.add4(vec4.muls(a0,b0.x), vec4.muls(a1,b0.y), vec4.muls(a2,b0.z), vec4.muls(a3,b0.w));
        res.v[1] = vec4.add4(vec4.muls(a0,b1.x), vec4.muls(a1,b1.y), vec4.muls(a2,b1.z), vec4.muls(a3,b1.w));
        res.v[2] = vec4.add4(vec4.muls(a0,b2.x), vec4.muls(a1,b2.y), vec4.muls(a2,b2.z), vec4.muls(a3,b2.w));
        res.v[3] = vec4.add4(vec4.muls(a0,b3.x), vec4.muls(a1,b3.y), vec4.muls(a2,b3.z), vec4.muls(a3,b3.w));
        return res;
    }

    /** 
     * Return new perspective matrix
     *
     * @param {number} fov      - field-of-view angle in radians
     * @param {number} width    - width (to compute aspect ratio)
     * @param {number} height   - height (to compute aspect ratio)
     * @param {number} znear    - near-plane distance
     * @param {number} zfar     - far-plane distance
     */
    public static perspective_fov(fov: number, width: number, height: number, znear: number, zfar: number): mat4 { 
        let m = new mat4();
        const rad = fov;
        const h = Math.cos(rad * 0.5) / Math.sin(rad * 0.5);
        const w = h * height / width;
        m.v[0].x = w;
        m.v[1].y = h;
        m.v[2].z = -(zfar + znear) / (zfar - znear);
        m.v[2].w = -1.0;
        m.v[3].z = -(2.0 * zfar * znear) / (zfar - znear);
        m.v[3].w = 0.0;
        return m; 
    }
}