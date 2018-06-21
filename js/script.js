
onload = function(){
    // === initialize === //
    // initialize canvas
    var c = document.getElementById('mycanvas');
    c.width = 600;
    c.height = 600;

    // initialize WebGL
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // create vertex/fragment shader
    var v_shader = create_shader('vshader');
    var f_shader = create_shader('fshader');
    var prg = create_program(v_shader, f_shader);


    // === model definition === //
    // vertex position
    var vertex_position = [
        // x y z
         0.0,  1.0,  0.0, // v1
         1.0,  0.0,  0.0, // v2
        -1.0,  0.0,  0.0, // v3
         0.0, -1.0,  0.0  // v4
    ];
    // vertex color
    var vertex_color = [
        // r g b a
        1.0, 1.0, 0.0, 1.0, // v1
        1.0, 1.0, 0.0, 1.0, // v2
        0.0, 1.0, 1.0, 1.0, // v3
        0.0, 1.0, 1.0, 1.0  // v4
    ];

    var index = [
        0, 1, 2,
        1, 2, 3
    ];


    // === create vbo === //
    // create VBO
    var vbo = new Array(2);
    vbo[0] = create_vbo(vertex_position);
    vbo[1] = create_vbo(vertex_color);

    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');

    var attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;

    // bind vbo and set attribute
    set_attribute(vbo, attLocation, attStride);


    // === create ibo === //
    // create IBO
    var ibo = create_ibo(index)

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

    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

    // view transform
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // projection transform
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    // create projection&view transform matrix
    m.multiply(pMatrix, vMatrix, vpMatrix);


    var count = 0;
    (function(){
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        count++;
        var rad = (count % 360) * Math.PI / 180;

        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(vpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        setTimeout(arguments.callee, 1000 / 30);
    })();

    function create_shader(id){
        var scriptElement = document.getElementById(id);
        if (!scriptElement) { return; }

        var shader;
        switch (scriptElement.type) {
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default :
                return;
        }

        gl.shaderSource(shader, scriptElement.text);
        gl.compileShader(shader);

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            alert(gl.getShaderInfoLog(shader));
        }
    }

    function create_program(vs, fs){
        var program = gl.createProgram();
    
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
    
        gl.linkProgram(program);
    
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);
            return program;
        } else {
            alert(gl.getProgramInfoLog(program));
        }
    }
    
    function create_vbo(data){
        var vbo = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vbo;
    }

    function create_ibo(data){
        var ibo = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    }

    function set_attribute(vbo, attL, attS){
        for(var i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
};
