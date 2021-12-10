var canvas_container = document.getElementById("canvas-container");
var canvas = document.createElement("canvas");

var resizer = document.querySelector("div.horizontal-resizer");
{let _resizer_mouse_down = false;resizer.addEventListener("mousedown",_=>_resizer_mouse_down = true);window.addEventListener("mousemove",e=>{if(_resizer_mouse_down) resizer.previousElementSibling.style.setProperty("width", e.clientX + "px")});window.addEventListener("mouseup",_=>_resizer_mouse_down = false)}

/**@type {HTMLTextAreaElement}*/
var input = document.getElementById("code-input");
input.onchange = input.oninput = input.onkeypress = (f=>(f(),f))(_=>{
    input.previousElementSibling.innerHTML = input.value
        .replace(/\n/g,"<br>").replace(/ /g,"&nbsp").replace(/<br>$/g,"<br><br>");
});

var gl = canvas.getContext("webgl", {antialias:false});
if(!gl) throw Error("ERROR: WEBGL NOT SUPPORTED");
gl.clearColor(0,0,0,1);



boilerplate.events.init();

const vertCode = "attribute vec2 a_position;varying vec2 fragCoord;uniform mat4 u_matrix;void main(){gl_Position=u_matrix*vec4(a_position,1.0,1.0);fragCoord=a_position;}"
var fragCode = "void main(){\n\tgl_FragColor = vec4(0.5 + 0.5 * cos(fragCoord.xyx + vec3(0,2,4)), 1.0);\n}";
var inputHeader = "precision mediump float;\nvarying vec2 fragCoord;\n";
var program = boilerplate.createProgramFromSources(gl, vertCode, inputHeader + fragCode);

var _locs = new Map();
function getLoc(name){
    let loc = _locs.get(name);
    if(!loc) _locs.set(name, loc = gl.getUniformLocation(program, name));
    return loc;
}


let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-8, -2, -8, 2, 8, -2, -8, 2, 8, -2, 8, 2]), gl.STATIC_DRAW);
function vertexAttribPointer(buf,name,type,size,stride,offset,normalize = false){
    this.use();
    const gl = this.gl, loc = this.getAttribLoc(name);
    gl.enableVertexAttribArray(loc);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.buffer);
    gl.vertexAttribPointer(loc, size, gl[type], normalize, stride, offset);
}
gl.enableVertexAttribArray(getLoc("a_position"));
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(getLoc("a_position"), 2, gl.FLOAT, false, 0, 0);

/**
 * 
 * @param {string} name 
 * @param {"float"|"vec2"|"vec3"|"vec4"|"mat2"|"mat3"|"mat4"|"sampler2D"} type 
 * @param {number|number[]|WebGLTexture} data 
 * @returns {void}
 */
function setUniform(name, type, data){
    let loc = _locs.get(name);
    if(!loc) _locs.set(name, loc = gl.getUniformLocation(program, name));

    switch(type){
        case "float": return gl.uniform1f(loc, data);
        case "vec2":  return gl.uniform2f(loc, ...data);
        case "vec3":  return gl.uniform3f(loc, ...data);
        case "vec4":  return gl.uniform4f(loc, ...data);
        case "mat2":  return gl.uniformMatrix2fv(loc, false, data);
        case "mat3":  return gl.uniformMatrix3fv(loc, false, data);
        case "mat4":  return gl.uniformMatrix4fv(loc, false, data);

        case "sampler2D":
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, data);
            return gl.uniform1i(gl.getUniformLocation(program, name), 0);
        
        default: throw new TypeError(`WEBGL ERROR: Cannot set uniform of type ${type}`);
    }
}

var width,height;
{   //Init canvas
    canvas_container.appendChild(canvas);
    new ResizeObserver((f=>(f(),f))(_=>{
        const {clientWidth, clientHeight} = canvas_container;
        gl.viewport(0, 0, canvas.width = width = clientWidth, canvas.height = height = clientHeight);

    })).observe(canvas_container);
}

/**@type {Map<string, {type:string, name:string}>} */
const options = new Map([
    ["time", {
        type: "float",
        name: null,
    }],
])
function isInputEnabled(input){
    return options.get(input).name !== null;
}
function enableInput(input, name){
    options.get(input).name = name;
    reCompileProgram();
}
function disableInput(input){
    options.get(input).name = null;
    reCompileProgram();
}
function reCompileProgram(){
    inputHeader = "precision mediump float;\nvarying vec2 fragCoord;\n";
    for(let [_,{type,name}] of options.entries()) if(name) inputHeader += `uniform ${type} ${name};\n`;
    program = boilerplate.createProgramFromSources(gl, vertCode,inputHeader + fragCode);
    _locs.clear();
}
function setFragCode(code){
    fragCode = code;
}

let start_time = 0;
let should_reset_time = false;
function resetTime(){
    should_reset_time = true;
}

/**@type {FrameRequestCallback}*/
function animate(time){
    if(should_reset_time) start_time = time, should_reset_time = false;
    time -= start_time;

    gl.useProgram(program);
    setUniform("u_matrix", "mat4", [height / width,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);

    for(let [inputName,{type, name}] of options.entries()){
        if(!name) continue;
        let data;
        switch(inputName){
            case "time":
                data = time / 1000;
                break;
            default: break;
        }
        if(data) setUniform(name, type, data);
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);