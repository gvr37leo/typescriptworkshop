function map(val1, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((val1 - start1) / (stop1 - start1));
}
function inRange(min, max, value) {
    if (min > max) {
        var temp = min;
        min = max;
        max = temp;
    }
    return value <= max && value >= min;
}
function min(a, b) {
    if (a < b)
        return a;
    return b;
}
function max(a, b) {
    if (a > b)
        return a;
    return b;
}
function clamp(val, min, max) {
    return this.max(this.min(val, max), min);
}
function rangeContain(a1, a2, b1, b2) {
    return max(a1, a2) >= max(b1, b2) && min(a1, a2) <= max(b1, b2);
}
function createNDimArray(dimensions, fill) {
    if (dimensions.length > 0) {
        function helper(dimensions) {
            var dim = dimensions[0];
            var rest = dimensions.slice(1);
            var newArray = new Array();
            for (var i = 0; i < dim; i++) {
                newArray[i] = helper(rest);
            }
            return newArray;
        }
        var array = helper(dimensions);
        var looper = new Vector(0, 0);
        looper.vals = dimensions;
        looper.loop((pos) => {
            setElement(array, pos.vals, fill(pos));
        });
        return array;
    }
    else {
        return undefined;
    }
}
function getElement(array, indices) {
    if (indices.length == 0) {
        return null;
    }
    else {
        return getElement(array[indices[0]], indices.slice(1));
    }
}
function setElement(array, pos, val) {
    if (pos.length == 1) {
        array[pos[0]] = val;
    }
    else {
        setElement(array[pos[0]], pos.slice(1), val);
    }
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top);
}
function createCanvas(x, y) {
    var canvas = document.createElement('canvas');
    canvas.width = x;
    canvas.height = y;
    document.body.appendChild(canvas);
    var ctxt = canvas.getContext('2d');
    return { ctxt: ctxt, canvas: canvas };
}
function random(min, max) {
    return Math.random() * (max - min) + min;
}
function randomSpread(center, spread) {
    var half = spread / 2;
    return random(center - half, center + half);
}
var lastUpdate = Date.now();
function loop(callback) {
    var now = Date.now();
    callback(now - lastUpdate);
    lastUpdate = now;
    requestAnimationFrame(() => {
        loop(callback);
    });
}
function mod(number, modulus) {
    return ((number % modulus) + modulus) % modulus;
}
function* iter(n) {
    var i = 0;
    while (i < n)
        yield i++;
}
var keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.keyCode] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.keyCode] = false;
});
function getMoveInput() {
    var dir = new Vector(0, 0);
    if (keys[37] || keys[65])
        dir.x--; //left
    if (keys[38] || keys[87])
        dir.y++; //up
    if (keys[39] || keys[68])
        dir.x++; //right
    if (keys[40] || keys[83])
        dir.y--; //down
    return dir;
}
function getMoveInputYFlipped() {
    var input = getMoveInput();
    input.y *= -1;
    return input;
}
function getFiles(strings) {
    var promises = [];
    for (var string of strings) {
        var promise = fetch(string)
            .then(resp => resp.text())
            .then(text => text);
        promises.push(promise);
    }
    return Promise.all(promises);
}
function findbestIndex(list, evaluator) {
    if (list.length < 1) {
        return -1;
    }
    var bestIndex = 0;
    var bestscore = evaluator(list[0]);
    for (var i = 1; i < list.length; i++) {
        var score = evaluator(list[i]);
        if (score > bestscore) {
            bestscore = score;
            bestIndex = i;
        }
    }
    return bestIndex;
}
function createAndAppend(element, html) {
    var result = string2html(html);
    element.appendChild(result);
    return result;
}
function string2html(string) {
    var div = document.createElement('div');
    div.innerHTML = string;
    return div.children[0];
}
function line(ctxt, a, b) {
    ctxt.beginPath();
    ctxt.moveTo(a.x, a.y);
    ctxt.lineTo(b.x, b.y);
    ctxt.stroke();
}
function lerp(a, b, r) {
    return a + to(a, b) * r;
}
function to(a, b) {
    return b - a;
}
function swap(arr, a = 0, b = 1) {
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}
class Vector {
    constructor(...vals) {
        this.vals = vals;
    }
    map(callback) {
        for (var i = 0; i < this.vals.length; i++) {
            callback(this.vals, i);
        }
        return this;
    }
    mul(v) {
        return this.map((arr, i) => arr[i] *= v.vals[i]);
    }
    add(v) {
        return this.map((arr, i) => arr[i] += v.vals[i]);
    }
    sub(v) {
        return this.map((arr, i) => arr[i] -= v.vals[i]);
    }
    scale(s) {
        return this.map((arr, i) => arr[i] *= s);
    }
    length() {
        var sum = 0;
        this.map((arr, i) => sum += arr[i] * arr[i]);
        return Math.pow(sum, 0.5);
    }
    normalize() {
        return this.scale(1 / this.length());
    }
    to(v) {
        return v.c().sub(this);
    }
    lerp(v, weight) {
        return this.c().add(this.to(v).scale(weight));
    }
    c() {
        return Vector.fromArray(this.vals.slice());
    }
    overwrite(v) {
        return this.map((arr, i) => arr[i] = v.vals[i]);
    }
    dot(v) {
        var sum = 0;
        this.map((arr, i) => sum += arr[i] * v.vals[i]);
        return sum;
    }
    loop(callback) {
        var counter = new Vector(this.vals.length);
        counter.vals.fill(0);
        while (counter.compare(this) == -1) {
            callback(counter);
            if (counter.incr(this)) {
                break;
            }
        }
    }
    compare(v) {
        for (var i = this.vals.length - 1; i >= 0; i--) {
            if (this.vals[i] < v.vals[i]) {
                continue;
            }
            else if (this.vals[i] == v.vals[i]) {
                return 0;
            }
            else {
                return 1;
            }
        }
        return -1;
    }
    incr(comparedTo) {
        for (var i = 0; i < this.vals.length; i++) {
            if ((this.vals[i] + 1) < comparedTo.vals[i]) {
                this.vals[i]++;
                return false;
            }
            else {
                this.vals[i] = 0;
            }
        }
        return true;
    }
    project(v) {
        return v.c().scale(this.dot(v) / v.dot(v));
    }
    get(i) {
        return this.vals[i];
    }
    set(i, val) {
        this.vals[i] = val;
    }
    get x() {
        return this.vals[0];
    }
    get y() {
        return this.vals[1];
    }
    get z() {
        return this.vals[2];
    }
    set x(val) {
        this.vals[0] = val;
    }
    set y(val) {
        this.vals[1] = val;
    }
    set z(val) {
        this.vals[2] = val;
    }
    draw(ctxt) {
        var width = 10;
        var halfwidth = width / 2;
        ctxt.fillRect(this.x - halfwidth, this.y - halfwidth, width, width);
    }
    cross(v) {
        var x = this.y * v.z - this.z * v.y;
        var y = this.z * v.x - this.x * v.z;
        var z = this.x * v.y - this.y * v.x;
        return new Vector(x, y, z);
    }
    static fromArray(vals) {
        var x = new Vector();
        x.vals = vals;
        return x;
    }
}
// (window as any).devtoolsFormatters = [
//     {
//         header: function(obj, config){
//             if(!(obj instanceof Vector)){
//                 return null
//             }
//             if((obj.vals.length == 2)){
//                 return ["div",{style:""}, `x:${obj.x} y:${obj.y}`]
//             }
//             if((obj.vals.length == 3)){
//                 return ["div",{style:""}, `x:${obj.x} y:${obj.y} z:${obj.z}`]
//             }
//         },
//         hasBody: function(obj){
//             return false
//         },
//     }
// ]
class Rect {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    collidePoint(point) {
        for (var i = 0; i < this.min.vals.length; i++) {
            if (!inRange(this.min.vals[i], this.max.vals[i], point.vals[i])) {
                return false;
            }
        }
        return true;
    }
    size() {
        return this.min.to(this.max);
    }
    collideBox(other) {
        for (var i = 0; i < 2; i++) {
            if (!rangeOverlap(this.min[i], this.max[i], other.min[i], other.max[i])) {
                return false;
            }
        }
        return true;
    }
    getPoint(relativePos) {
        return this.min.c().add(this.size().mul(relativePos));
    }
    draw(ctxt) {
        var tl = this.getPoint(new Vector(0, 0));
        var tr = this.getPoint(new Vector(0, 1));
        var br = this.getPoint(new Vector(1, 1));
        var bl = this.getPoint(new Vector(0, 1));
        ctxt.beginPath();
        ctxt.moveTo(tl.x, tl.y);
        ctxt.lineTo(tr.x, tr.y);
        ctxt.lineTo(br.x, br.y);
        ctxt.lineTo(bl.x, bl.y);
        ctxt.lineTo(tl.x, tl.y);
        ctxt.stroke();
    }
    loop(callback) {
        var temp = this.max.c();
        this.size().loop(v2 => {
            temp.overwrite(v2);
            temp.add(this.min);
            callback(temp);
        });
    }
}
function rangeOverlap(range1A, range1B, range2A, range2B) {
    return range1A <= range2B && range2A <= range1B;
}
class Bird {
    constructor(pos, vel, acc) {
        this.pos = pos;
        this.vel = vel;
        this.acc = acc;
    }
    update(dt) {
        this.vel.add(this.acc.c().scale(dt));
        this.vel.add(gravity.c().scale(dt));
        this.pos.add(this.vel.c().scale(dt));
        if (this.pos.y > screensize.y) {
            this.pos.y = screensize.y;
            this.vel.y = 0;
            this.acc.y = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y = 0;
            this.acc.y = 0;
        }
    }
    draw(ctxt) {
        ctxt.beginPath();
        ctxt.ellipse(this.pos.x, this.pos.y, 10, 10, 0, 0, Math.PI * 2);
        ctxt.fill();
    }
}
class Pipe {
    constructor(rect) {
        this.rect = rect;
        this.vel = new Vector(-100, 0);
    }
    update(dt) {
        var dtpos = this.vel.c().scale(dt);
        this.rect.min.add(dtpos);
        this.rect.max.add(dtpos);
    }
    draw(ctxt) {
        var size = this.rect.size();
        ctxt.fillRect(this.rect.min.x, this.rect.min.y, size.x, size.y);
    }
}
/// <reference path="src/utils.ts" />
/// <reference path="src/vector.ts" />
/// <reference path="src/rect.ts" />
/// <reference path="src/bird.ts" />
/// <reference path="src/pipe.ts" />
var screensize = new Vector(800, 500);
var crret = createCanvas(screensize.x, screensize.y);
var canvas = crret.canvas;
var ctxt = crret.ctxt;
var gravity = new Vector(0, 500);
var bird = new Bird(new Vector(50, 250), new Vector(0, 0), new Vector(0, 0));
var pipes = [];
var time = 0;
loop((dt) => {
    dt /= 1000;
    time += dt;
    ctxt.clearRect(0, 0, screensize.x, screensize.y);
    bird.update(dt);
    bird.draw(ctxt);
    for (var i = pipes.length - 1; i >= 0; i--) {
        var pipe = pipes[i];
        pipe.update(dt);
        if (pipe.rect.collidePoint(bird.pos)) {
            ctxt.fillStyle = 'red';
        }
        else {
            ctxt.fillStyle = 'black';
        }
        if (pipe.rect.max.x < 0) {
            pipes.splice(0, 2);
            i--;
        }
        else {
            pipe.draw(ctxt);
        }
    }
    ctxt.fillText(Math.round(time), 10, 10);
});
setInterval(() => {
    pipes.push(...generatePipePair());
}, 2000);
document.addEventListener('keydown', e => {
    // http://keycode.info/
    if (e.code == 'Space' && !e.repeat) {
        bird.vel.overwrite(new Vector(0, -200));
    }
});
function generatePipePair() {
    var pipewidth = 20;
    var gapsize = 80;
    var gapoffset = (Math.random() - 0.5) * 400;
    var centergap = screensize.y / 2 + gapoffset;
    var gaptop = centergap - gapsize / 2;
    var gapbottom = centergap + gapsize / 2;
    var spawnpointx = screensize.x;
    var pipewidthandoffset = pipewidth + spawnpointx;
    var topPipe = new Rect(new Vector(spawnpointx, 0), new Vector(pipewidthandoffset, gaptop));
    var bottomPipe = new Rect(new Vector(spawnpointx, gapbottom), new Vector(pipewidthandoffset, screensize.y));
    return [new Pipe(topPipe), new Pipe(bottomPipe)];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy91dGlscy50cyIsInNyYy92ZWN0b3IudHMiLCJzcmMvcmVjdC50cyIsInNyYy9iaXJkLnRzIiwic3JjL3BpcGUudHMiLCJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWEsSUFBWSxFQUFFLE1BQWMsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLEtBQWE7SUFDbkYsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDM0UsQ0FBQztBQUVELGlCQUFpQixHQUFXLEVBQUUsR0FBVyxFQUFFLEtBQWE7SUFDcEQsRUFBRSxDQUFBLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBLENBQUM7UUFDVixJQUFJLElBQUksR0FBRyxHQUFHLENBQUM7UUFDZixHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ1YsR0FBRyxHQUFHLElBQUksQ0FBQztJQUNmLENBQUM7SUFDRCxNQUFNLENBQUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxhQUFhLENBQVMsRUFBRSxDQUFTO0lBQzdCLEVBQUUsQ0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDO0FBRUQsYUFBYSxDQUFTLEVBQUUsQ0FBUztJQUM3QixFQUFFLENBQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNsQixNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQztBQUVELGVBQWUsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO0lBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzVDLENBQUM7QUFFRCxzQkFBc0IsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtJQUNoRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQseUJBQTRCLFVBQW9CLEVBQUUsSUFBc0I7SUFDcEUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLGdCQUFnQixVQUFVO1lBQ3RCLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDM0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDaEIsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUM7UUFDRixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDO0FBRUQsb0JBQXVCLEtBQVMsRUFBRSxPQUFnQjtJQUM5QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUM7UUFDRixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztBQUNMLENBQUM7QUFFRCxvQkFBdUIsS0FBUyxFQUFFLEdBQVksRUFBRSxHQUFLO0lBQ2pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLENBQUMsQ0FBQztRQUNGLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDO0FBQ0wsQ0FBQztBQUVELHFCQUFxQixNQUF3QixFQUFFLEdBQWM7SUFDekQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDMUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN0RSxDQUFDO0FBRUQsc0JBQXNCLENBQVMsRUFBRSxDQUFTO0lBQ3RDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDN0MsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDakIsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQyxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsZ0JBQWdCLEdBQVcsRUFBRSxHQUFXO0lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO0FBQzVDLENBQUM7QUFFRCxzQkFBc0IsTUFBYyxFQUFFLE1BQWM7SUFDaEQsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNyQixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFBO0FBQy9DLENBQUM7QUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUIsY0FBYyxRQUFRO0lBQ2xCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNwQixRQUFRLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFBO0lBQzFCLFVBQVUsR0FBRyxHQUFHLENBQUE7SUFDaEIscUJBQXFCLENBQUMsR0FBRyxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNsQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFFRCxhQUFhLE1BQWMsRUFBRSxPQUFlO0lBQ3hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLE9BQU8sQ0FBQyxHQUFDLE9BQU8sQ0FBQyxHQUFDLE9BQU8sQ0FBQztBQUM5QyxDQUFDO0FBRUQsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLE9BQU0sQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQzFCLENBQUM7QUFFRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7QUFFYixRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDdkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDMUIsQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDM0IsQ0FBQyxDQUFDLENBQUE7QUFFRjtJQUNJLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtJQUN6QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQUEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFBLENBQUEsTUFBTTtJQUNyQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQUEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFBLENBQUEsSUFBSTtJQUNuQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQUEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFBLENBQUEsT0FBTztJQUN0QyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQUEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFBLENBQUEsTUFBTTtJQUNyQyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUVEO0lBQ0ksSUFBSSxLQUFLLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDMUIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUE7QUFDaEIsQ0FBQztBQUVELGtCQUFrQixPQUFnQjtJQUM5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDakIsR0FBRyxDQUFBLENBQUMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUEsQ0FBQztRQUN2QixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBRUQsdUJBQTBCLElBQVEsRUFBRSxTQUF1QjtJQUN2RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUNELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkMsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFNBQVMsR0FBRyxLQUFLLENBQUE7WUFDakIsU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLENBQUE7QUFDcEIsQ0FBQztBQUVELHlCQUF5QixPQUFvQixFQUFFLElBQVk7SUFDdkQsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQscUJBQXFCLE1BQU07SUFDdkIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QyxHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztJQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQWdCLENBQUM7QUFDMUMsQ0FBQztBQUVELGNBQWMsSUFBNkIsRUFBQyxDQUFRLEVBQUMsQ0FBUTtJQUN6RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7SUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsY0FBYyxDQUFRLEVBQUMsQ0FBUSxFQUFDLENBQVE7SUFDcEMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMxQixDQUFDO0FBRUQsWUFBWSxDQUFRLEVBQUMsQ0FBUTtJQUN6QixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBRUQsY0FBaUIsR0FBTyxFQUFDLElBQVcsQ0FBQyxFQUFDLElBQVcsQ0FBQztJQUM5QyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLENBQUM7QUN0TUQ7SUFHSSxZQUFZLEdBQUcsSUFBYTtRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNwQixDQUFDO0lBRUQsR0FBRyxDQUFDLFFBQXdDO1FBQ3hDLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUTtRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVE7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFRO1FBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRCxLQUFLLENBQUMsQ0FBUTtRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzNDLENBQUM7SUFFRCxNQUFNO1FBQ0YsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFFRCxTQUFTO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3hDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBUTtRQUNQLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFFRCxJQUFJLENBQUMsQ0FBUSxFQUFDLE1BQWE7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0lBRUQsQ0FBQztRQUNHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsU0FBUyxDQUFDLENBQVE7UUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFRO1FBQ1IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLE1BQU0sQ0FBQyxHQUFHLENBQUE7SUFDZCxDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQWtDO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFcEIsT0FBTSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFDL0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2pCLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNuQixLQUFLLENBQUM7WUFDVixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMsQ0FBUTtRQUNaLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsUUFBUSxDQUFDO1lBQ1YsQ0FBQztZQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDTCxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsSUFBSSxDQUFDLFVBQWtCO1FBQ25CLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUMvQyxFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUFBLElBQUksQ0FBQSxDQUFDO2dCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUM7UUFDRixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNWLENBQUM7SUFFRCxPQUFPLENBQUMsQ0FBUTtRQUNiLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUTtRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUSxFQUFDLEdBQVU7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFDLEdBQUc7UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsR0FBRztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFB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QUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBO0FBQ3JCLElBQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUUvQixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLElBQUksS0FBSyxHQUFVLEVBQUUsQ0FBQTtBQUNyQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtJQUNSLEVBQUUsSUFBSSxJQUFJLENBQUE7SUFDVixJQUFJLElBQUksRUFBRSxDQUFDO0lBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBR2YsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDO1FBQ3ZDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUEsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUMxQixDQUFDO1FBQUEsSUFB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