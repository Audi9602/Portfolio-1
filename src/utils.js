export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueUI.style.display = "block";

    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => { //text animation
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;
            return;
        }
        clearInterval(intervalRef);
    }, 5); //each letter appears every 5 ms

    const closeBtn = document.getElementById("close");

    function onCloseBtnClick(){ //handles closing dialog box's button
        onDisplayEnd();
        dialogueUI.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
        }
    closeBtn.addEventListener("click", onCloseBtnClick);

}

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height(); //calc aspect ratio
    if (resizeFactor < 1) { //cam zoom based on aspect ratio
      k.camScale(k.vec2(1)); //def portrait screen
    } else {
      k.camScale(k.vec2(1.5)); //zoom out for wider screen
    }
  }
