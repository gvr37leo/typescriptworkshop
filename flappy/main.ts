/// <reference path="src/utils.ts" />
/// <reference path="src/vector.ts" />
/// <reference path="src/rect.ts" />

var screensize = new Vector(800,500)
var ccreturn = createCanvas(screensize.x,screensize.y)
var canvas = ccreturn.canvas
var ctxt = ccreturn.ctxt

loop((dt) => {
    dt /= 1000
    ctxt.clearRect(0,0,screensize.x,screensize.y)

    ctxt.fillRect(10,10,10,10)
})



document.addEventListener('keydown', e => {
    // http://keycode.info/
    if(e.code == 'Space' && !e.repeat){

    }
})



