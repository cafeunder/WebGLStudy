
class Axis {
    constructor(gl) {
        this.gl = gl;

        var v_shader = create_shader(gl, 'axis_vshader');
        var f_shader = create_shader(gl, 'axis_fshader');
        this.prg = create_program(gl, v_shader, f_shader);

        var axis_line_pos = create_vbo(gl,
        [
            -100.0, 0.0, 0.0,
            100.0, 0.0, 0.0,
            0.0, -100.0, 0.0,
            0.0, 100.0, 0.0,
            0.0, 0.0, -100.0,
            0.0, 0.0, 100.0
        ]);
        var axis_line_col = create_vbo(gl,
        [
            1.0, 0.0, 0.0, 0.5,
            1.0, 0.0, 0.0, 0.5,
            0.0, 1.0, 0.0, 0.5,
            0.0, 1.0, 0.0, 0.5,
            0.2, 0.3, 1.0, 0.5,
            0.2, 0.3, 1.0, 0.5
        ]);
        this.vbo = [axis_line_pos, axis_line_col];

        this.attLocation = new Array(2);
        this.attLocation[0] = gl.getAttribLocation(this.prg, 'position');
        this.attLocation[1] = gl.getAttribLocation(this.prg, 'color');

        this.attStride = new Array(2);
        this.attStride[0] = 3;
        this.attStride[1] = 4;

        this.uniLocation = gl.getUniformLocation(this.prg, 'mvpMatrix');
    }

    draw(vpMatrix) {
        this.gl.useProgram(this.prg);

        set_attribute(this.gl, this.vbo, this.attLocation, this.attStride);
        this.gl.uniformMatrix4fv(this.uniLocation, false, vpMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, 6);
    }
}
