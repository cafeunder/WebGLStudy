
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

onload = function(){
    // === initialize === //
    // initialize canvas
    var c = document.getElementById('mycanvas');
    c.width = 600;
    c.height = 600;

    // initialize WebGL
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);


    // create vertex/fragment shader
    var v_shader = create_shader(gl, 'vshader');
    var f_shader = create_shader(gl, 'fshader');
    var prg = create_program(gl, v_shader, f_shader);

    // initialize axis
    axis = new Axis(gl);

    // === model definition === //
    // torus
    var [position, normal, color, index] = torus(32, 48, 0.8, 2.0);


    // === create vbo === //
    // create VBO
    var vbo = new Array(3);
    vbo[0] = create_vbo(gl, position);
    vbo[1] = create_vbo(gl, color);
    vbo[2] = create_vbo(gl, normal)

    var attLocation = new Array(3);
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');
    attLocation[2] = gl.getAttribLocation(prg, 'normal');

    var attStride = new Array(3);
    attStride[0] = 3;
    attStride[1] = 4;
    attStride[2] = 3;


    // === create ibo === //
    // create IBO
    var ibo = create_ibo(gl, index)

    // bind ibo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // === transform === //
    // matIVオブジェクトを生成
    var m = new matIV();

    // 各種行列の生成と初期化
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var vpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    var invMatrix = m.identity(m.create());

    // uniformLocationの取得
    var uniLocation = new Array();
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
    uniLocation[2] = gl.getUniformLocation(prg, 'lightPosition');
    uniLocation[3] = gl.getUniformLocation(prg, 'ambientColor');
    uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection');
    uniLocation[5] = gl.getUniformLocation(prg, 'mMatrix');

    // view transform
    m.lookAt([3.0, 4.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // projection transform
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    // create projection&view transform matrix
    m.multiply(pMatrix, vMatrix, vpMatrix);


    // === lighting === //
    var lightPosition = [0, 0, 0];
    var ambientColor = [0.1, 0.1, 0.1, 0];
    var eyeDirection = [3.0, 4.0, 5.0];


    // メインループ
    var count = 0;
    (function(){
        // clear canvas
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // draw axis
        axis.draw(vpMatrix);


        //★☆★ 描画本体 ★☆★//
        gl.useProgram(prg);

        lightPosition[1] = 10 * Math.sin(Math.PI * count / 334);

        set_attribute(gl, vbo, attLocation, attStride);
        var rad = (count % 360) * Math.PI / 180;

        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.rotate(mMatrix, Math.PI / 6, [0, 0, 1], mMatrix);
        m.multiply(vpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
        gl.uniform3fv(uniLocation[2], lightPosition);
        gl.uniform4fv(uniLocation[3], ambientColor);
        gl.uniform3fv(uniLocation[4], eyeDirection);
        gl.uniformMatrix4fv(uniLocation[5], false, mMatrix);

        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        //★☆★ 描画本体 ★☆★//


        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
        count++;
    })();
};
