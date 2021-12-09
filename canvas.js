"use strict";
class Canvas {
    /**
     * @param width
     * Width of canvas in pixels. Defaults to window width.
     * @param height
     * Height of canvas in pixels. Defaults to window height.
     * @param parent
     * If parent is an HTML element,(like div or body),the created HTMLCanvasElement will be appended to it.
     * @param transparent
     * If true (default),the created canvas will be able to draw transparent/translucent colors or images.
     */
    constructor(width, height, parent, transparent = true) {
        this.canvas = document.createElement('canvas');
        this.w = this.canvas.width = width || window.innerWidth;
        this.h = this.canvas.height = height || window.innerHeight;
        if (parent && parent.appendChild)
            parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', {
            alpha: transparent
        }) || (_ => { throw Error("Unable to create canvas rendering context"); })();
        this.ctx.textAlign = "center";
        this.parent = parent;
        this.textOptions = {
            "font-style": "normal",
            "font-variant": "normal",
            "font-weight": "normal",
            "font-size": "12em",
            "line-height": "1",
            "font-family": "system-ui"
        };
    }
    set width(width) {
        this.resize(width, this.h);
    }
    get width() {
        return this.w;
    }
    set height(height) {
        this.resize(this.w, height);
    }
    get height() {
        return this.h;
    }
    /**
     * Resizes the canvas to the provided dimensions,or the size provided by the CSS attributes.
     * @param width
     * Width in pixels. If not truthy,will be the window width.
     * @param height
     * Height in pixels. If not truthy,will be the window height.
     */
    resize(width, height) {
        this.canvas.width = this.w = width || this.canvas.clientWidth;
        this.canvas.height = this.h = height || this.canvas.clientHeight;
    }
    /**
     * Resizes the canvas to the dimensions of the parent element (Will probably throw error if the parent provided in the constructor was not a HTMLElement)
     */
    resizeToParent() {
        if (!this.parent)
            return;
        this.resize(this.parent.clientWidth, this.parent.clientHeight);
    }
    /**
     * resizes the canvas to the dimensions of the window
     */
    resizeToWindow() {
        this.resize(window.innerWidth, window.innerHeight);
    }
    /**
     * Sets the stroke and fill color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setDrawColor(color) {
        this.ctx.strokeStyle = this.ctx.fillStyle = color;
    }
    /**
     * Sets the stroke color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setStrokeColor(color) {
        this.ctx.strokeStyle = color;
    }
    /**
     * Sets the fill color of subsequent operations
     * @param {string} color
     * Hex value of the color (like #d4c00b)
     */
    setFillColor(color) {
        this.ctx.fillStyle = color;
    }
    /**
     * Sets the stroke width of subsequent operations
     * @param {number} width
     * Stroke width in pixels
     */
    setStrokeWidth(width) {
        this.ctx.lineWidth = width;
    }
    /**
     * Wrapper for ctx.beginPath.
     */
    beginPath() {
        this.ctx.beginPath();
    }
    /**
     * Wrapper for ctx.moveTo.
     * Moves to (x,y). This starts a new line/fill
     */
    moveTo(x, y) {
        this.ctx.moveTo(x, y);
    }
    /**
     * Wrapper for ctx.lineTo
     * Makes a line to (x,y)
     */
    lineTo(x, y) {
        this.ctx.lineTo(x, y);
    }
    /**
     * Wrapper for ctx.arc
     * Draws an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    arc(x, y, r, a1, a2, counterclockwise = false) {
        this.ctx.arc(x, y, r, a1 * 2 * Math.PI, a2 * 2 * Math.PI, counterclockwise);
    }
    /**
     * Wrapper for ctx.stroke
     * Draws the path onto the canvas
     */
    stroke() {
        this.ctx.stroke();
    }
    /**
     * Wrapper for ctx.fill
     * Fills in the area outlined in the path
     */
    fill() {
        this.ctx.fill();
    }
    /**
     * Wrapper for ctx.closePath
     */
    closePath() {
        this.ctx.closePath();
    }
    /**
     * Clears canvas. If color is provided,fill canvas with color
     * @param color
     * Hex value of the color (like #d4c00b). If not provided,the resulting canvas is transparent if transparency is enabled or white otherwise.
     */
    clear(color) {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (color)
            this.setFillColor(color), this.ctx.fillRect(0, 0, this.w, this.h);
        else
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();
    }
    /**
     * Draws a line from x1 to y1.
     */
    line(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills a rectancle with color. (x1,y1) is the top left corner and (x2,y2) is the bottom right corner.
     */
    fillRect(x1, y1, x2, y2) {
        this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
    /**
     * Draws a rectancle. (x1,y1) is the top left corner and (x2,y2) is the bottom right corner.
     */
    drawRect(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills a square with top left corner at (x1,y1) and width
     */
    fillSquare(x, y, width) {
        this.ctx.fillRect(x, y, width, width);
    }
    /**
     * Draws a square with top left corner at (x,y) and width
     */
    square(x, y, width) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, width);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills a circle with center (x,y) and radius r
     */
    fillCircle(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Draws a circle with center (x,y) and radius r
     */
    circle(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r - this.ctx.lineWidth / 2, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    fillArc(x, y, r, a1, a2, counterclockwise = false) {
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, r, a1, a2);
        this.fill();
        this.closePath();
    }
    /**
     * Draws an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    drawArc(x, y, r, a1, a2, counterclockwise = false) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, r, a1 * 2 * Math.PI, a2 * 2 * Math.PI, counterclockwise);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills an double arc centered at (x,y) from a1 to a2 full turns clockwise with radii
     * r1 and r2. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    fillDoubleArc(x, y, r1, r2, a1, a2, counterclockwise = false) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r1, a1 * 2 * Math.PI, a2 * 2 * Math.PI);
        this.ctx.arc(x, y, r2, a2 * 2 * Math.PI, a1 * 2 * Math.PI, counterclockwise);
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Sets font style
     */
    setFont(family, italic, bold, line_height, small_caps) {
        if (family)
            this.textOptions["font-family"] = family;
        if (italic != undefined)
            this.textOptions["font-style"] = italic ? "italic" : "normal";
        if (bold != undefined)
            this.textOptions["font-weight"] = bold ? "bold" : "normal";
        if (line_height != undefined)
            this.textOptions["line-height"] = line_height.toString();
        if (small_caps != undefined)
            this.textOptions["font-variant"] = small_caps ? "small_caps" : "normal";
    }
    /**
     * Fill text with top left corner at (x,y)
     * @param txt
     * The text to display
     * @param size
     * The font size in pixels
     * @param  font
     * A string parsed like a CSS font property (like "italic bold 16px Times";)
     */
    fillText(txt, x, y, size) {
        this.ctx.beginPath();
        this.ctx.font = [this.textOptions["font-variant"], this.textOptions["font-weight"], size + "px", this.textOptions["font-family"]].join(" ");
        this.ctx.textAlign = "center";
        this.ctx.fillText(txt, x, y);
        this.ctx.closePath();
    }
    /**
     * Outline text with top left corner at (x,y)
     * @param txt
     * The text to display
     * @param size
     * The font size in pixels
     * @param font
     * A string parsed like a CSS font property (like "italic bold 16px Times";)
     */
    strokeText(txt, x, y, size) {
        this.ctx.beginPath();
        this.ctx.font = [this.textOptions["font-variant"], this.textOptions["font-weight"], size + "px", this.textOptions["font-family"]].join(" ");
        this.ctx.textAlign = "center";
        this.ctx.strokeText(txt, x, y);
        this.ctx.closePath();
    }
    /**
     * draws a polygon centered at center
     * @param center
     * center of polygon
     * @param points
     * verticies of polygon
     */
    polygon(center, points) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[points.length - 1][0] + center[0], points[points.length - 1][1] + center[1]);
        let t = this;
        points.forEach(s => t.ctx.lineTo(s[0] + center[0], s[1] + center[1]));
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * fills a polygon centered at center
     * @param center
     * center of polygon
     * @param points
     * verticies of polygon
     */
    fillPolygon(center, points) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[points.length - 1][0] + center[0], points[points.length - 1][1] + center[1]);
        let t = this;
        points.forEach(s => t.ctx.lineTo(s[0] + center[0], s[1] + center[1]));
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Draws a squircle
     * @param x
     * x-coordinate of the squircle center
     * @param y
     * y-coordinate of the squircle center
     * @param width
     * width of squircle
     * @param r
     * radius of rounded corners
     */
    squircle(x, y, width, r = 5) {
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2 - r, y - width / 2 + r, r, 3 * Math.PI / 2, 0 * Math.PI / 2);
        this.ctx.arc(x + width / 2 - r, y + width / 2 - r, r, 0 * Math.PI / 2, 1 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y + width / 2 - r, r, 1 * Math.PI / 2, 2 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y - width / 2 + r, r, 2 * Math.PI / 2, 3 * Math.PI / 2);
        this.ctx.lineTo(x + width / 2 - r, y - width / 2);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Fills a squircle
     * @param x
     * x-coordinate of the squircle center
     * @param y
     * y-coordinate of the squircle center
     * @param width
     * width of squircle
     * @param r
     * radius of rounded corners
     */
    fillSquircle(x, y, width, r = 5) {
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2 - r, y - width / 2 + r, r, 3 * Math.PI / 2, 0 * Math.PI / 2);
        this.ctx.arc(x + width / 2 - r, y + width / 2 - r, r, 0 * Math.PI / 2, 1 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y + width / 2 - r, r, 1 * Math.PI / 2, 2 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y - width / 2 + r, r, 2 * Math.PI / 2, 3 * Math.PI / 2);
        this.ctx.lineTo(x + width / 2 - r, y - width / 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Draws a curve through 2 or more points
     * @param points
     * points to draw the curve through
     */
    spline(points) {
        const f = 0.3, t = 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0][0], points[0][1]);
        let m = 0, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0;
        let preP = points[0], curP, nexP;
        for (let i = 1; i < points.length; i++) {
            curP = points[i];
            nexP = points[i + 1];
            if (nexP) {
                m = (preP[1] - curP[1]) / (preP[0] - curP[0]);
                dx2 = -(nexP[0] - curP[0]) * f;
                dy2 = dx2 * m * t;
            }
            this.ctx.bezierCurveTo(preP[0] - dx1, preP[1] - dy1, curP[0] + dx2, curP[1] + dy2, curP[0], curP[1]);
            dx1 = dx2;
            dy1 = dy2;
            preP = curP;
        }
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Draws a bezier curve with 3 control points
     * @param p1
     * first control point
     * @param p2
     * second control point
     * @param p3
     * third control point
     */
    bezier(p1, p2, p3) {
        this.ctx.beginPath();
        this.ctx.moveTo(...p1);
        this.ctx.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * Draws unscaled image with top left corner at (x,y)
     */
    drawImage(img, x, y) {
        if (img.width * img.height == 0) {
            console.log(img);
        }
        this.ctx.drawImage(img, x, y);
    }
    /**
     * Draws an image scaled by a factor with top left corner at (x,y)
     */
    drawScaledImage(img, x, y, factor = 1) {
        this.ctx.drawImage(img, x, y, factor * img.width, factor * img.height);
    }
    /**
     * Draws an image scaled to width (preserving the aspect ratio) with top left corner at (x,y)
     */
    drawImageWithWidth(img, x, y, destwidth) {
        let destheight = destwidth / img.width * img.height;
        this.ctx.drawImage(img, x, y, destwidth, destheight);
    }
    /**
     * Draws an image scaled to height (preserving the aspect ratio) with top left corner at (x,y)
     */
    drawImageWithHeight(img, x, y, destheight) {
        let destwidth = destheight / img.height * img.width;
        this.ctx.drawImage(img, x, y, destwidth, destheight);
    }
    /**
     * Draws an image on a rect with top left corner (x1,y1) and bottom right corner (x2,y2)
     */
    drawImageOnRect(img, x1, y1, x2, y2) {
        let destwidth = x2 - x1;
        let destheight = y2 - y1;
        this.ctx.drawImage(img, x1, y1, destwidth, destheight);
    }
    /**
     * Wrapper for CanvasRenderingContext2D.save()
     * Saves the current state to a stack
     */
    pushState() {
        this.ctx.save();
    }
    /**
     * Wrapper for CanvasRenderingContext2D.restore()
     * Restores the last state on the stack and pops it from the stack
     */
    restoreState() {
        this.ctx.restore();
    }
    /**
     * rotate context by angle around (x,y) or (0,0) if not present
     * @param angle
     * angle in radians
     * @param clockwise
     * whether to rotate clockwise
     */
    rotate(angle, clockwise = true, x = 0, y = 0) {
        this.ctx.translate(-x, -y);
        this.ctx.rotate(clockwise ? angle : -angle);
        this.ctx.translate(x, y);
    }
    /**
     * translates context x units left and y units down
     */
    translate(x, y) {
        this.ctx.translate(x, y);
    }
    /**
     * Calls f(current time,elapsed time in milliseconds) 60 times per second (or tries to...)
     * @param {Function} f-the function to be called
     */
    static createAnimation(f) {
        return new Promise(resolve => {
            let then = 0;
            const f2 = (t) => {
                if (f(0.001 * t, 0.001 * (then - t)))
                    resolve(undefined);
                then = t;
                requestAnimationFrame(f2);
            };
            requestAnimationFrame(f2);
        });
    }
}