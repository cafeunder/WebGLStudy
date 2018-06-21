
onload = function(){
    // === initialize === //
    // initialize canvas
    var c = document.getElementById('mycanvas');
    c.width = 300;
    c.height = 300;

    // initialize WebGL
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0); // clearColorでクリアされる深度を設定
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // create vertex/fragment shader
    var v_shader = create_shader('vshader');
    var f_shader = create_shader('fshader');
    var prg = create_program(v_shader, f_shader);


    // === model definition === //
    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');

    var attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;

    // 頂点データ
    var vertex_position = [
        // x y z
        0.0, 1.0, 0.0, // v1
        1.0, 0.0, 0.0, // v2
        -1.0, 0.0, 0.0  // v3
    ];
    
    var vertex_color = [
        // r g b a
        1.0, 0.0, 0.0, 1.0, // v1
        0.0, 1.0, 0.0, 1.0, // v2
        0.0, 0.0, 1.0, 1.0, // v3
    ];

    // position VBOの生成
    var position_vbo = create_vbo(vertex_position);
    // 操作を行うためにVBOを再バインド
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
    // attribute属性を有効にする
    gl.enableVertexAttribArray(attLocation[0]);
    // attribute属性を登録
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);

    // color VBOの生成
    var color_vbo = create_vbo(vertex_color);
    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
    gl.enableVertexAttribArray(attLocation[1]);
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);

    // === transform === //
    // matIVオブジェクトを生成
    var m = new matIV();
    
    // 各種行列の生成と初期化
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    
    // view transform
    m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // projection transform
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

    // create transform matrix
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);

    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);


    // === drawing === //
    // モデルの描画
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // コンテキストの再描画
    gl.flush();


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
};
