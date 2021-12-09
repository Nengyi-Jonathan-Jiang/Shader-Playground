var boilerplate = {
    /**
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @returns {WebGLShader} The created shader.
     */
    createShader(gl, shaderSource, shaderType) {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(
                "*** Error compiling shader '" + shader + "':" +
                gl.getShaderInfoLog(shader) + `\n` +
                shaderSource.split('\n').map((l, i) => (i + 1) + ':' + l).join('\n')
            );
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    },

    /**
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {WebGLShader[]} shaders The shaders to attach
     * @returns {WebGLProgram} The created program.
     */
    createProgram(gl, ...shaders) {
        const program = gl.createProgram();
        for (let shader of shaders) gl.attachShader(program, shader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Error in program linking:' + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    },

    /**
     * @param {WebGLRenderingContext} gl - The WebGLRenderingContext to use.
     * @param {string} vertSource the - source for the vertex shader
     * @param {string} fragSource the - source for the fragment shader
     * @returns {WebGLProgram}
     */
    createProgramFromSources(gl, vertSource, fragSource) {
        return this.createProgram(gl,
            this.createShader(gl, vertSource, gl.VERTEX_SHADER),
            this.createShader(gl, fragSource, gl.FRAGMENT_SHADER)
        );
    },
    events:{
        keysDown: {},
        init(){
            window.addEventListener('keydown',e=>{boilerplate.events.keysDown[e.key.toLowerCase()] = true});
            window.addEventListener('keyup',e=>{boilerplate.events.keysDown[e.key.toLowerCase()] = false});
            window.addEventListener('blur', _=>(boilerplate.events.keysDown = {}));
        },
    }
}