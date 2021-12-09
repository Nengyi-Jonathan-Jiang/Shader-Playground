var canvas_container = document.getElementById("canvas-container");
var canvas = document.createElement("canvas");


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


var width,height;
{   //Init canvas
    var gl = canvas.getContext("webgl", {antialias:false});
    if(!gl) throw Error("ERROR: WEBGL NOT SUPPORTED");

    canvas_container.appendChild(canvas);
    new ResizeObserver((f=>(f(),f))(_=>{
        const {clientWidth, clientHeight} = canvas_container;
        gl.viewport(0, 0, canvas.width = width = clientWidth, canvas.height = height = clientHeight);

        this.matrix = m4.identity()
        m4.identity(this.matrix);
          m4.translate(this.matrix,this.pos[0],this.pos[1],0,this.matrix);
          m4.scale(this.matrix,this.scale/this.aspect,this.scale,1,this.matrix);
        program.use();
        gl.uniformMatrix4fv(this.getUniformLoc("u_matrix"), false, );
        m4.multiply(this.projection_matrix,this.camera_matrix,this.matrix);
        program.uniformMat4f(matrix_uniform_name,this.matrix);

    })).observe(canvas_container);
}

function animate(){
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    //program.uniform("iTime","FLOAT",now - last_start);
    const aspectRatio = width / height;
    t !== this.aspect && (this.aspect = t, this.isMatrixDirty = !0)
    camera.update_aspect_ratio();
    camera.draw(program,"u_matrix",gl.TRIANGLES,0,6)
}