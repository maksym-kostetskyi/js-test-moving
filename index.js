const form = document.querySelector(".form");
const input = document.querySelector(".input");
const submit = document.querySelector(".submit");
const selectionBox = document.getElementById("selectionBox");
const charsContainer = document.createElement("div");
charsContainer.classList.add("charsContainer");

function isOverlapping(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function handleCharElemDragging(dragChar) {
  let isDragging = false;
  let dragData = [];
  let mouseStartX, mouseStartY;

  function onMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    let deltaX = e.clientX - mouseStartX;
    let deltaY = e.clientY - mouseStartY;

    dragData.forEach((item) => {
      item.elem.style.left = item.startX + deltaX + "px";
      item.elem.style.top = item.startY + deltaY + "px";
    });
  }

  function onMouseUp() {
    if (isDragging && dragData.length === 1) {
      const dragItem = dragData[0];
      const dragRect = dragItem.elem.getBoundingClientRect();
      const allChars = document.querySelectorAll(".char");

      let foundTarget = null;

      for (const char of allChars) {
        if (char === dragItem.elem) continue;

        const targetRect = char.getBoundingClientRect();

        if (isOverlapping(dragRect, targetRect)) {
          foundTarget = char;
          break;
        }
      }

      if (foundTarget) {
        const targetPos = {
          left: foundTarget.offsetLeft,
          top: foundTarget.offsetTop,
        };

        const originalDragPos = {
          left: dragItem.startX,
          top: dragItem.startY,
        };

        dragItem.elem.style.left = targetPos.left + "px";
        dragItem.elem.style.top = targetPos.top + "px";
        foundTarget.style.left = originalDragPos.left + "px";
        foundTarget.style.top = originalDragPos.top + "px";
      }
    }

    isDragging = false;
    dragData = [];
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  dragChar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey) {
      dragChar.classList.toggle("selected");
      return;
    }

    const isSelected = dragChar.classList.contains("selected");

    if (!isSelected) {
      document.querySelectorAll(".char.selected").forEach((char) => {
        char.classList.remove("selected");
      });
      dragChar.classList.add("selected");
    }

    const allSelectedChars = document.querySelectorAll(".char.selected");

    isDragging = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;

    allSelectedChars.forEach((char) => {
      dragData.push({
        elem: char,
        startX: char.offsetLeft,
        startY: char.offsetTop,
      });
    });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

function handleSubmit(e) {
  e.preventDefault();
  charsContainer.innerHTML = "";
  form.after(charsContainer);
  let inputChars = input.value;
  let startPos = 0;

  for (const char of inputChars) {
    const charElem = document.createElement("div");
    charElem.classList.add("char");
    charElem.innerHTML = char;
    charElem.style.left = `${startPos}px`;
    charElem.style.top = "5px";
    startPos += 25;
    handleCharElemDragging(charElem);
    charsContainer.appendChild(charElem);
  }
  charsContainer.style.width = `${inputChars.length * 25 - 5}px`;
  charsContainer.style.height = "40px";
}

submit.addEventListener("click", (e) => handleSubmit(e));

let startX, startY;

function handleDocMouseMove(e) {
  e.preventDefault();

  let currentX = e.clientX;
  let currentY = e.clientY;

  let left = Math.min(startX, currentX);
  let top = Math.min(startY, currentY);
  let width = Math.abs(currentX - startX);
  let height = Math.abs(currentY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;

  const boxRect = selectionBox.getBoundingClientRect();
  const allChars = document.querySelectorAll(".char");
  allChars.forEach((char) => {
    const charRect = char.getBoundingClientRect();

    if (isOverlapping(boxRect, charRect)) {
      char.classList.add("selected");
    } else {
      char.classList.remove("selected");
    }
  });
}

function handleDocMouseUp() {
  selectionBox.style.display = "none";
  selectionBox.style.width = "0px";
  selectionBox.style.height = "0px";
  document.removeEventListener("mousemove", handleDocMouseMove);
  document.removeEventListener("mouseup", handleDocMouseUp);
}

function handleDocMouseDown(e) {
  if (e.target.closest(".char") || e.target.closest(".form")) {
    return;
  }

  e.preventDefault();
  startX = e.clientX;
  startY = e.clientY;

  if (!e.ctrlKey) {
    document.querySelectorAll(".char.selected").forEach((char) => {
      char.classList.remove("selected");
    });
  }

  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.width = "0px";
  selectionBox.style.height = "0px";
  selectionBox.style.display = "block";

  document.addEventListener("mousemove", handleDocMouseMove);
  document.addEventListener("mouseup", handleDocMouseUp);
}

document.addEventListener("mousedown", handleDocMouseDown);
