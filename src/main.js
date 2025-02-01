//Imports
import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";
k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39, //no.of horizontal frames
    sliceY: 31, //no.of vertical frames
    anims: { //define animations
        "idle-down": 964, //player faces user
        "walk-down": { from: 964, to: 967, loop: true, speed: 8}, //player moves down
        "idle-side": 1003, //player faces sidewise
        "walk-side": { from: 1003, to: 1006, loop: true, speed: 8}, //moves sideways
        "idle-up": 1042, //player faces upwards
        "walk-up": { from: 1042, to: 1045, loop: true, speed: 8}, //moves up
    },
});

k.loadSprite("map", "./map.png"); //loading main map
k.setBackground(k.Color.fromHex("311047")); //bg color
k.scene("main", async () => {  //main game scene
    //fetch call for map.json
    const mapData = await (await fetch("./map.json")).json() //def browser API
    const layers = mapData.layers; //extracts layers from map data
    const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]); //adds map to scene
//player
    const player = k.make([
        k.sprite("spritesheet", {anim: "idle-down"}), //def anim
        k.area({shape: new k.Rect(k.vec2(0, 3), 10, 10),}), //def coll area
        k.body(),k.anchor("center"),k.pos(),k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player", //entity type
    ]);
//map layers 
    for (const layer of layers) {
        if (layer.name === "boundaries") { //handles boundary coll
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name) { //palyer interaction with bounds
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
                    });
                }
            }
            continue;
        }

        if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
                if (entity.name === "player") { //sets player pos based on spawnpoint
                    player.pos = k.vec2( (map.pos.x + entity.x) * scaleFactor, (map.pos.y + entity.y) * scaleFactor);
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
      setCamScale(k);
    });
  //cam follows player
    k.onUpdate(() => {
      k.camPos(player.worldPos().x, player.worldPos().y - 100);
    });
  //mov on mouse click
    k.onMouseDown((mouseBtn) => {
      if (mouseBtn !== "left" || player.isInDialogue) return; //respond to left clicks if not dialog
  
      const worldMousePos = k.toWorld(k.mousePos()); //mouse pos -> world pos
      player.moveTo(worldMousePos, player.speed);
  
      const mouseAngle = player.pos.angle(worldMousePos);
  
      const lowerBound = 50;
      const upperBound = 125;
  //mov on mouse angle(cursor pt)
      if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
      ) {
        player.play("walk-up");
        player.direction = "up";
        return;
      }
  
      if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
      ) {
        player.play("walk-down");
        player.direction = "down";
        return;
      }
  
      if (Math.abs(mouseAngle) > upperBound) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        return;
      }
  
      if (Math.abs(mouseAngle) < lowerBound) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        return;
      }
    });
  //stops anims if buttons rel
    function stopAnims() {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }
      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }
  
      player.play("idle-side");
    }
  
    k.onMouseRelease(stopAnims);
  
    k.onKeyRelease(() => {
      stopAnims();
    });

//adding keyboard ctrls
    k.onKeyDown((key) => {
      const keyMap = [
        k.isKeyDown("right"),
        k.isKeyDown("left"),
        k.isKeyDown("up"),
        k.isKeyDown("down"),
      ];
  
      let nbOfKeyPressed = 0;
      for (const key of keyMap) {
        if (key) {
          nbOfKeyPressed++;
        }
      }
  
      if (nbOfKeyPressed > 1) return; //prevents diagonal
  
      if (player.isInDialogue) return;
      if (keyMap[0]) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        player.move(player.speed, 0);
        return;
      }
  
      if (keyMap[1]) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        player.move(-player.speed, 0);
        return;
      }
  
      if (keyMap[2]) {
        if (player.curAnim() !== "walk-up") player.play("walk-up");
        player.direction = "up";
        player.move(0, -player.speed);
        return;
      }
  
      if (keyMap[3]) {
        if (player.curAnim() !== "walk-down") player.play("walk-down");
        player.direction = "down";
        player.move(0, player.speed);
      }
    });
  });
  
  k.go("main");//starts game
