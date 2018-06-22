
onload = function(){
    // === initialize === //
    // initialize canvas
    var c = document.getElementById('mycanvas');
    c.width = 600;
    c.height = 600;

    // initialize WebGL
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // create vertex/fragment shader
    var v_shader = create_shader('vshader');
    var f_shader = create_shader('fshader');
    var prg = create_program(v_shader, f_shader);

    // create axis vbo
    var axis_line_pos = create_vbo([
        -100.0, 0.0,  0.0,
        100.0, 0.0,  0.0,
        0.0,  -100.0,  0.0,
        0.0,  100.0,  0.0,
        0.0,  0.0,  -100.0,
        0.0,  0.0,  100.0
    ]);
    var axis_line_col = create_vbo([
        1.0, 0.0, 0.0, 0.8,
        1.0, 0.0, 0.0, 0.8,
        0.0, 1.0, 0.0, 0.8,
        0.0, 1.0, 0.0, 0.8,
        0.2, 0.3, 1.0, 0.8,
        0.2, 0.3, 1.0, 0.8
    ]);
    var axis_line_vbo = [axis_line_pos, axis_line_col];


    // === model definition === //
    // torus
    var [position, color, index] = torus(32, 32, 0.8, 2.0);


    // === create vbo === //
    // create VBO
    var vbo = new Array(2);
    vbo[0] = create_vbo(position);
    vbo[1] = create_vbo(color);

    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');

    var attStride = new Array(2);
    attStride[0] = 3;
    attStride[1] = 4;


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
    m.lookAt([3.0, 6.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // projection transform
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    // create projection&view transform matrix
    m.multiply(pMatrix, vMatrix, vpMatrix);


    // メインループ
    var count = 0;
    (function(){
        // clear canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // draw axis
        set_attribute(axis_line_vbo, attLocation, attStride);
        m.identity(mMatrix);
        m.multiply(vpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
        gl.drawArrays(gl.LINES, 0, 6);


        //★☆★ 描画本体 ★☆★//

        set_attribute(vbo, attLocation, attStride);
        var rad = (count % 360) * Math.PI / 180;

        m.identity(mMatrix);
        // m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        // m.rotate(mMatrix, Math.PI / 6, [0, 0, 1], mMatrix);
        m.multiply(vpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        //★☆★ 描画本体 ★☆★//


        gl.flush();
        setTimeout(arguments.callee, 1000 / 30);
        count++;
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

    function torus(row, column, irad, orad){
        var pos = new Array(), col = new Array(), idx = new Array();

        //　円の繰り返し
        for(var i = 0; i <= row; i++){
            // 2πをrow等分したi番目
            var r = Math.PI * 2 / row * i;
            // xy平面上で円軌道（y座標はこの時点で確定している）
            var rr = irad * Math.cos(r);
            var ry = irad * Math.sin(r);

            // チューブの繰り返し
            for(var j = 0; j <= column; j++){
                // 2πをcolumn等分した1番目
                var tr = Math.PI * 2 / column * j;
                // 座標を決定
                var tx = (rr + orad) * Math.cos(tr);
                var ty = ry;
                var tz = (rr + orad) * Math.sin(tr);
                pos.push(tx, ty, tz);
                // 色を決定
                var tc = hsva(360 / column * j, 1, 1, 1);
                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
        }

        // わかんね
        for(var i = 0; i < row; i++){
            for(var j = 0; j < column; j++){
                var r = (column + 1) * i + j;
                idx.push(r, r + column + 1, r + 1);
                idx.push(r + column + 1, r + column + 2, r + 1);
            }
        }
        return [pos, col, idx];
    }

    function hsva(h, s, v, a){
        if(s > 1 || v > 1 || a > 1){return;}
        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();
        if(!s > 0 && !s < 0){
            color.push(v, v, v, a); 
        } else {
            var r = new Array(v, n, m, m, k, v);
            var g = new Array(k, v, v, n, m, m);
            var b = new Array(m, m, k, v, v, n);
            color.push(r[i], g[i], b[i], a);
        }
        return color;
    }
};
