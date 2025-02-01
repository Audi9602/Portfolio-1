import kaboom from "kaboom"; //importing framework

export const k = kaboom({ //create & exp instance
    global: false, //prev adding all funcs to global scope
    touchToMouse: true, //touch events -> mouse events
    canvas: document.getElementById("game"), //HTML Canvas -> game:render
});
