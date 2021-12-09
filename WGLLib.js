var wgllib = (_=>{
  //Core
  class Texture{
      /**
       * @param {WebGLRenderingContext} gl
       * @param {string} src
       */
      constructor(gl,src){
          const texture = gl.createTexture();
          this.texture = texture;
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
          const image = new Image();
          image.crossOrigin = "";
          image.src = src;
          image.addEventListener('load', function() {
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          });
      }
      bind(){
          gl.bindTexture(gl.TEXTURE_2D, this.texture);
      }
  }
  class Buffer{
      /**
       * @param {WebGLRenderingContext} gl
       */
      constructor(gl,data){
          this.gl = gl;
          this.buffer = gl.createBuffer();
          if(data) this.setData(data);
      }
      /**
       * @param {ArrayBufferView} data - data to load into buffer
       * @param {boolean} dynamic_data - whether the data in this buffer will be changed frequently
       */
      setData(data,dynamic_data = true) {
          const gl = this.gl;
          gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
          gl.bufferData(gl.ARRAY_BUFFER,data,dynamic_data ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
      }
      /**
       * @param {ArrayBufferView} data
       * @param {number} offset
       */
      subData(data,offset=0) {
          const gl = this.gl;
          gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
          gl.bufferSubData(gl.ARRAY_BUFFER,offset,data);
      }
  }
  class Program{
      /**
       * @param {WebGLRenderingContext} gl - The WebGLRenderingContext to use.
       * @param {string} vertSource - the source for the vertex shader
       * @param {string} fragSource - the source for the fragment shader
       */
      constructor(gl, vertSource, fragSource){
          this.gl = gl;
          this.program = wgllib.core.createProgramFromSources(gl,vertSource,fragSource);
      }
      /**
       * @param {string} name - the name of the attribute
       * @returns {number}
       */
      getAttribLoc(name){return this.gl.getAttribLocation(this.program,name)}
      /**
       * @param {string} name - the name of the uniform
       * @returns {number}
       */
      getUniformLoc(name){return this.gl.getUniformLocation(this.program,name)}

      use(){this.gl.useProgram(this.program)}

      /**
       * Tells OpenGL how to get data from the buffer
       * @param {Buffer} buf - buffer to read from
       * @param {string} name - name of attribute
       * @param {"BYTE"|"SHORT"|"FLOAT"|"UNSIGNED_BYTE"|"UNSIGNED_SHORT"} type - type of data to be read
       * @param {1|2|3|4} size - number of components to be read.
       * @param {number} stride - distance in bytes between the beginning of consecutive vertex attributes
       * @param {number} offset - offset in bytes from the start of the buffer
       * @param {boolean} normalize (optional)
       */
      vertexAttribPointer(buf,name,type,size,stride,offset,normalize = false){
          this.use();
          const gl = this.gl, loc = this.getAttribLoc(name);
          gl.enableVertexAttribArray(loc);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf.buffer);
          gl.vertexAttribPointer(loc, size, gl[type], normalize, stride, offset);
      }
      /**
       * Sets a uniform (may be scalar or vector)
       * @param {string} name - name of attribute
       * @param {"FLOAT"|"INT"} type - type of data to be used
       * @param {number[]} val - you must provide the values as seperate parameters
       */
      uniform(name,type,...val){
          this.use();
          const size = val.length,gl = this.gl, loc = this.getUniformLoc(name);
          if(type === "FLOAT")    gl["uniform" + size + "f"](loc,val);
          else if(type === "INT") gl["uniform" + size + "i"](loc,val);
      }
      /**
       * Sets a uniform float matrix
       * @param {string} name - name of attribute
       * @param {Float32Array} val - matrix to set
       */
      uniformMat4f(name,val){
          this.use();
          this.gl.uniformMatrix4fv(this.getUniformLoc(name),false,val);
      }
  }
  class Camera{
      /**
       * @param {WebGLRenderingContext} gl
       * @param {number[]} pos - position
       * @param {number[]} rot - rotation
       * @param {number} near - near clipping plane
       * @param {number} far - far clipping plane
       */
      constructor(gl,pos,rot,near,far){
          this.gl = gl;

          this.projection_matrix = m4.identity();
          this.near = near || 0.01;
          this.far = far || 100;
          this.aspect_ratio = undefined;
          this.fov = undefined;
          this.recompute_projection(wgllib.core.math.toRad(70));

          this.camera_matrix = m4.identity();
          this.isCamMatrixDirty = false;
          this.pos = pos || [0,0,0];
          this.rot = rot || [0,0];
          this.recompute_camera();

          this.matrix = m4.identity();
          this.isMatrixDirty = false;
          this.recompute_matrix();
      }
      rotate(a = 0,b = 0){
          if(a||b){
              this.rot[0] += a;
              this.rot[1] += b;
              this.rot[0] = Math.min(Math.max(this.rot[0],-Math.PI/2),Math.PI/2);
              this.isCamMatrixDirty = true;
          }
      }
      move(x = 0,y = 0,z = 0){
          if(x||y||z){
              this.pos[0] += Math.sin(this.rot[1]) * z - Math.cos(this.rot[1]) * x;
              this.pos[2] -= Math.sin(this.rot[1]) * x + Math.cos(this.rot[1]) * z;
              this.pos[1] += y;
              this.isCamMatrixDirty = true;
          }
      }
      recompute_camera(){
          m4.identity(this.camera_matrix);
          m4.xRotate(this.camera_matrix,this.rot[0],this.camera_matrix);
          m4.yRotate(this.camera_matrix,this.rot[1],this.camera_matrix);
          m4.translate(this.camera_matrix,this.pos[0],this.pos[1],this.pos[2],this.camera_matrix);
          this.isCamMatrixDirty = false;
          this.isMatrixDirty = true;
      }
      recompute_projection(fov){
          const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
          if(aspect !== this.aspect_ratio || fov !== this.fov){
              m4.perspective(fov,aspect,this.near,this.far,this.projection_matrix);
              this.aspect_ratio = aspect;this.fov = fov;
              this.isMatrixDirty = true;
          }
      }
      recompute_matrix(){
          m4.multiply(this.projection_matrix,this.camera_matrix,this.matrix);
          this.isMatrixDirty = false;
      }
      draw(program,matrix_uniform_name,mode,offset,length){
          if(this.isCamMatrixDirty) this.recompute_camera();
          if(this.isMatrixDirty) this.recompute_matrix();
          program.uniformMat4f(matrix_uniform_name,this.matrix);
          program.use();
          this.gl.drawArrays(mode,offset,length);
      }
  }
  class Camera2D{
      /**
       * @param {WebGLRenderingContext} gl
       * @param {number[]} pos - position
       * @param {number} scale
       */
      constructor(gl,pos,scale){
          this.gl = gl;
          this.matrix = m4.identity();
          this.pos = pos || [0,0];
          this.scale = scale || 1;
          this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
          this.isMatrixDirty = false;
          this.recompute_matrix();
      }
      move(x,y){
          if(x||y){
              this.pos[0] += x;
              this.pos[1] += y;
              this.isMatrixDirty = true;
          }
      }
      rescale(scale){
          if(scale != this.scale){
              this.scale = scale;
              this.isMatrixDirty = true;
          }
      }
      recompute_matrix(){
          m4.identity(this.matrix);
          m4.translate(this.matrix,this.pos[0],this.pos[1],0,this.matrix);
          m4.scale(this.matrix,this.scale/this.aspect,this.scale,1,this.matrix);
      }
      update_aspect_ratio(){
          const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
          if(aspect !== this.aspect){
              this.aspect = aspect;
              this.isMatrixDirty = true;
          }
      }
      draw(program,matrix_uniform_name,mode,offset,length){
          if(this.isMatrixDirty) this.recompute_matrix();
          program.uniformMat4f(matrix_uniform_name,this.matrix);
          program.use();
          this.gl.drawArrays(mode,offset,length);
      }
  }
  class FirstPersonController{
      constructor(camera,movementSpeed = 5,rotationSpeed = 2){
          this.camera = camera;
          this.movementSpeed = movementSpeed;
          this.rotationSpeed = rotationSpeed;
      }
      update(deltaTime){
          const mStep = this.movementSpeed * deltaTime,rStep = this.rotationSpeed * deltaTime;
          let x = 0, y = 0, z = 0, a = 0, b = 0;
          if(wgllib.core.events.keysDown['a'])         x += mStep;
          if(wgllib.core.events.keysDown['d'])         x -= mStep;
          if(wgllib.core.events.keysDown['w'])         z += mStep;
          if(wgllib.core.events.keysDown['s'])         z -= mStep;
          if(wgllib.core.events.keysDown[' '])         y += mStep;
          if(wgllib.core.events.keysDown['shift'])     y -= mStep;
          if(wgllib.core.events.keysDown['arrowup'])   a += rStep;
          if(wgllib.core.events.keysDown['arrowdown']) a -= rStep;
          if(wgllib.core.events.keysDown['arrowleft']) b += rStep;
          if(wgllib.core.events.keysDown['arrowright'])b -= rStep;
          camera.rotate(a,b);
          camera.move(x,y,z);
      }
  }
  //Utility
  class CubeMeshGenerator{
      constructor(atlasWidth = 16,atlasHeight = 16){
          this.atlasWidth = atlasWidth;
          this.atlasHeight = atlasHeight;
          this.facev = "276723|450105|426240|735153|674547|032301".split("|").map(i=>i.split("").map(j=>Number.parseInt(j,10)).map(j=>[(j>>2)&1,(j>>1)&1,j&1]));
          this.facet = "501054|125652|69596A|849594|D9EAE9|9C8C9D".split("|").map(i=>i.split("").map(j=>Number.parseInt(j,16)).map(j=>[((j>>2)&3)/atlasWidth,(j&3)/atlasHeight]));
      }
      getPos(face,vertex,position){return this.facev[face][vertex].map((s,i)=>s + position[i])}
      getTex(face,vertex,atlas_pos){return [
          this.facet[face][vertex][0] / 3 + atlas_pos[0] / this.atlasWidth,
          this.facet[face][vertex][1] / 2 + atlas_pos[1] / this.atlasHeight
      ]}
  }
  return {
      core:{
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
          Buffer: Buffer,
          Program: Program,
          Texture: Texture,
          Camera:Camera,
          Camera2D: Camera2D,
          events:{
              keysDown: {},
              init(){
                  window.addEventListener('keydown',e=>{wgllib.core.events.keysDown[e.key.toLowerCase()] = true});
                  window.addEventListener('keyup',e=>{wgllib.core.events.keysDown[e.key.toLowerCase()] = false});
                  window.addEventListener('blur', _=>(wgllib.core.events.keysDown = {}));
              },
          },
          math:{
              /**
               * @param {number} r - angle in radians
               * @returns {number}
               */
              toDeg(r){return r * 180 / Math.PI},
              /**
               * @param {number} d - angle in degrees
               * @returns {number}
               */
              toRad(d){return d * Math.PI / 180}
          },
      },
      gameUtil:{
          CubeMeshGenerator:CubeMeshGenerator,
          FirstPersonController: FirstPersonController,
      },
      /**
       * Calls f(current time, elapsed time in milliseconds) 60 times per second (or tries to...)
       * @param {Function} f - the function to be called
       */
      createAnimation(f){
          let then = 0;
          const f2 = t=>{
              if(f(0.001 * t, 0.001 * (then - t))) return;
              then = t;
              requestAnimationFrame(f2);
          };
          requestAnimationFrame(f2);
      },
      fullscreenCanvas(options){
          let c = document.createElement("canvas");
          let gl = c.getContext('webgl2',{antialias:options? options.antialias || true : true});
          if(!gl){
              console.log("WEBGL2 NOT SUPPORTED, TRYING WEBGL");
              gl = c.getContext('webgl',{antialias:options? options.antialias || true : true});
              if(!gl) throw Error("ERROR: WEBGL NOT SUPPORTED");
          }
          document.body.appendChild(c);
          c.width = c.clientWidth;
          c.height = c.clientHeight;
          gl.viewport(0, 0, c.width, c.height);
          if(options && !options.is2D){
              gl.enable(gl.CULL_FACE);
              gl.enable(gl.DEPTH_TEST);
          }
          window.addEventListener("resize",_=>{
              c.width = c.clientWidth;
              c.height = c.clientHeight;
              gl.viewport(0, 0, c.width, c.height);
          });
          return {canvas:c,gl:gl};
      }
  };
})();