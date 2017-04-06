class vec3 {
    public x: number;
    public y: number;
    public z: number;

    public constructor(x: number, y: number, z: number) {
        this.x=x; this.y=y; this.z=z;
    }

    public copy(): vec3 {
        return new vec3(this.x, this.y, this.z);
    }

    public length(): number {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    }

    public normalize(): vec3 {
        const l = this.length();
        if (l > 0.0) {
            return new vec3(this.x/l, this.y/l, this.z/l);
        }
        else {
            return new vec3(0.0, 0.0, 0.0);
        }
    }
}

class mat4 {
    public m: number[];

    /** construct identity matrix */
    public constructor() {
        this.m[0]=1.0; this.m[1]=0.0; this.m[2]=0.0; this.m[3]=0.0;
        this.m[4]=0.0; this.m[5]=1.0; this.m[6]=0.0; this.m[7]=0.0;
        this.m[8]=0.0; this.m[9]=0.0; this.m[10]=1.0; this.m[11]=0.0;
        this.m[12]=0.0; this.m[13]=0.0; this.m[14]=0.0; this.m[15]=1.0;
    }

    /** new matrix from translation */
    public static translation(x: number, y: number, z: number): mat4 {
        let m = new mat4();
        m.m[12] = x; m.m[13] = y; m.m[14] = z;
        return m;
    }

    /** new matrix from rotation around axis */
    public static rotation(axis: vec3, angle: number): mat4 {
        let m = new mat4();
        const v = axis.normalize();
        const x = v.x, y = v.y, z = v.z;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const t = 1.0 - c;
        m.m[0]=(t*x*x)+c;       m.m[1]=(t*y*x)+(s*z);   m.m[2] =(t*z*x)-(s*y);
        m.m[4]=(t*x*y)-(s*z);   m.m[5]=(t*y*y)+c;       m.m[6] =(t*z*y)+(s*x);
        m.m[8]=(t*x*z)+(s*y);   m.m[9]=(t*y*z)-(s*x);   m.m[10]=(t*z*z)+c;
        return m;
    }

    /** new matrix from rotation around X axis */
    public static rot_x(a: number): mat4 {
        return mat4.rotation(new vec3(1.0, 0.0, 0.0), a);
    }

    /** new matrix from rotation around Y axis */
    public static rot_y(a: number): mat4 {
        return mat4.rotation(new vec3(0.0, 1.0, 0.0), a);
    }

    /** new matrix from rotation around Z axis */
    public static rot_z(a: number): mat4 {
        return mat4.rotation(new vec3(0.0, 0.0, 1.0), a);
    }

    /** new matrix from scaling */
    public static scaling(x: number, y: number, z: number): mat4 {
        let m = new mat4();
        m.m[0]=x; m.m[5]=y; m.m[10]=z;
        return m; 
    }

    /** matrix multiplication */
    public static multiply(m0: mat4, m1: mat4): mat4 {
        let m = new mat4();

        m.m[0] = m0.m[0]*m1.m[0] + m0.m[4]*m1.m[1] + m0.m[8] *m1.m[2] + m0.m[12]*m1.m[3];
        m.m[1] = m0.m[1]*m1.m[0] + m0.m[5]*m1.m[1] + m0.m[9] *m1.m[2] + m0.m[13]*m1.m[3];
        m.m[2] = m0.m[2]*m1.m[0] + m0.m[6]*m1.m[1] + m0.m[10]*m1.m[2] + m0.m[14]*m1.m[3];
        m.m[3] = m0.m[3]*m1.m[0] + m0.m[7]*m1.m[1] + m0.m[11]*m1.m[2] + m0.m[15]*m1.m[3];

        m.m[4] = m0.m[0]*m1.m[4] + m0.m[4]*m1.m[5] + m0.m[8] *m1.m[6] + m0.m[12]*m1.m[7];
        m.m[5] = m0.m[1]*m1.m[4] + m0.m[5]*m1.m[5] + m0.m[9] *m1.m[6] + m0.m[13]*m1.m[7];
        m.m[6] = m0.m[2]*m1.m[4] + m0.m[6]*m1.m[5] + m0.m[10]*m1.m[6] + m0.m[14]*m1.m[7];
        m.m[7] = m0.m[3]*m1.m[4] + m0.m[7]*m1.m[5] + m0.m[11]*m1.m[6] + m0.m[15]*m1.m[7];

        m.m[8]  = m0.m[0]*m1.m[8] + m0.m[4]*m1.m[9] + m0.m[8] *m1.m[10] + m0.m[12]*m1.m[11];
        m.m[9]  = m0.m[1]*m1.m[8] + m0.m[5]*m1.m[9] + m0.m[9] *m1.m[10] + m0.m[13]*m1.m[11];
        m.m[10] = m0.m[2]*m1.m[8] + m0.m[6]*m1.m[9] + m0.m[10]*m1.m[10] + m0.m[14]*m1.m[11];
        m.m[11] = m0.m[3]*m1.m[8] + m0.m[7]*m1.m[9] + m0.m[11]*m1.m[10] + m0.m[15]*m1.m[11];

        m.m[12] = m0.m[0]*m1.m[12] + m0.m[4]*m1.m[13] + m0.m[8] *m1.m[14] + m0.m[12]*m1.m[15];
        m.m[13] = m0.m[1]*m1.m[12] + m0.m[5]*m1.m[13] + m0.m[9] *m1.m[14] + m0.m[13]*m1.m[15];
        m.m[14] = m0.m[2]*m1.m[12] + m0.m[6]*m1.m[13] + m0.m[10]*m1.m[14] + m0.m[14]*m1.m[15];
        m.m[15] = m0.m[3]*m1.m[12] + m0.m[7]*m1.m[13] + m0.m[11]*m1.m[14] + m0.m[15]*m1.m[15];

        return m;
    }

    /** 
     * Return new perspective matrix
     *
     * @param {number} fovy     - vertical field-of-view angle in radians
     * @param {number} aspect   - aspect ration (width / height)
     * @param {number} zn       - near-plane distance
     * @param {number} zf       - far-plane distance
     */
    public static perspfovrh(fovy: number, aspect: number, zn: number, zf: number): mat4 {
        let m = new mat4();
        const y_scale = 1.0 / Math.tan(fovy / 2.0);
        const x_scale = y_scale / aspect;
        m.m[0] = x_scale; 
        m.m[5] = y_scale;
        m.m[10] = zf/(zn-zf); m.m[11] = -1.0;
        m.m[14] = zn*zf/(zn-zf);
        return m; 
    }
}