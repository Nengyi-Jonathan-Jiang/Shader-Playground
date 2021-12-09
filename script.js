var canvas_container = document.getElementById("canvas-container");
var canvas = document.createElement("canvas");

var gl = canvas.getContext("webgl", {antialias:false});
if(!gl) throw Error("ERROR: WEBGL NOT SUPPORTED");

boilerplate.events.init();

var program = boilerplate.createProgramFromSources(gl, `
attribute vec2 a_position;
varying vec2 fragCoord;

uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0, 1.0);
    fragCoord = a_position;
}
`,`
precision mediump float;
varying vec2 fragCoord;

void main(){
    gl_FragColor = vec4(0.5 + 0.5 * cos(fragCoord.xyx + vec3(0,2,4)), 1.0);
}`)

var _uniform_locs = new Map();
/**
 * 
 * @param {string} name 
 * @param {"float"|"vec2"|"vec3"|"vec4"|"mat2"|"mat3"|"mat4"|"sampler2D"} type 
 * @param {number|number[]|WebGLTexture} data 
 * @returns {void}
 */
function setUniform(name, type, data){
    const loc = _uniform_locs.get(name);
    if(!loc) _uniform_locs.set(name, loc = gl.getUniformLocation(program, name));

    switch(type){
        case "float": return gl.uniform1f(loc, data);
        case "vec2":  return gl.uniform2f(loc, ...data);
        case "vec3":  return gl.uniform2f(loc, ...data);
        case "vec4":  return gl.uniform2f(loc, ...data);
        case "mat2":  return gl.uniform2f(loc, ...data);
        case "mat3":  return gl.uniform2f(loc, ...data);
        case "mat4":  return gl.uniform2f(loc, ...data);

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
        gl.useProgram(program);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_matrix"), false, [height / width,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    })).observe(canvas_container);
}

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-8,-2,-8,2,8,-2,-8,2,8,-2,8,2]), gl.STATIC_DRAW);

function animate(){
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);