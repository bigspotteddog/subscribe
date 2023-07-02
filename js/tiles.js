const tiles = function (main) {
  if (main.tabIndex < 0) {
    main.tabIndex = 0;
  }
  main.addEventListener("click", function(event) {
    event.currentTarget.focus();
  });

  const getTileTemplate = function () {
    return '<div class="shape ${this.classes ? this.classes : ""} ${this.color}"\n' +
      '   style="top: ${this.top}; left: ${this.left}; width: ${this.width}; height: ${this.height}; border-radius: ${this.borderRadius}">\n' +
      '  <div class="content" style="font-size: ${this.fontSize};">\n' +
      '    ${this.content ? this.content : ""}\n' +
      '  </div>\n' +
      '</div>';
  }
  const getCursorTemplate = function () {
    return '<div\n' +
      ' class="cursor blink ${this.classes ? this.classes : ""}"\n' +
      ' style="top: ${this.top}; left: ${this.left}; width: ${this.width}; height: ${this.height};">\n' +
      '</div>';
  }

  let dim = {
    top: 0,
    left: 0,
    width: 100,
    height: 100
  }

  const clear = function () {
    main.innerHTML = "";
    dim.top = 0;
    dim.left = 0;
    dim.width = 100;
    dim.height = 100;
  }

  const fillTemplate = function (template, data) {
    const val = (new Function("return `" + template + "`;").call(data));
    return val;
  }

  const createCursor = function () {
    let data = {
      "left": dim.left + "px",
      "top": dim.top + "px",
      "width": "3px",
      "height": dim.height + "px"
    };

    const template = getCursorTemplate();
    const html = fillTemplate(template, data);
    const div = document.createElement('div');
    div.innerHTML = html;
    const child = div.children[0];
    main.appendChild(child);

    main.addEventListener("focus", function(event) {
      child.style.display = "initial";
    });

    main.addEventListener("blur", function(event) {
      child.style.display = "none";
    });
  
    return child;
  }

  const updateCursor = function () {
    const cursor = main.querySelector('.cursor');
    cursor.style.top = dim.top + "px";
    cursor.style.left = dim.left + "px";
    cursor.style.height = dim.height + "px";
  }

  createCursor();

  const calculateWidth = function (letters, width, height) {
    let longestLeft = 0;
    const lines = letters.split("\n");
    for (let j = 0; j < lines.length; j++) {
      let top = (height * 0.1) + (height * 1.1 * j);
      let line = lines[j];
      let left = 0;
      let words = line.split(" ");
      for (let k = 0; k < words.length; k++) {
        let word = words[k];
        for (let l = 0; l < word.length; l++) {
          let charAt = word.charAt(l);
          if (charAt === "[") {
            let c = "";
            charAt = "";
            while (c !== "]") {
              charAt += c;
              c = word.charAt(++l);
            }
          }
          left += width * 1.1;
        }
        left += width * 1.1;
      }
      if (left > longestLeft) {
        longestLeft = left;
      }
    }
    return longestLeft;
  }

  const areVowels = function (letters) {
    if (letters.length === 0) {
      return "blue";
    }

    if (letters === " ") {
      return "clear";
    }

    const vowels = "aeiouyAEIOUY";
    for (let i = 0; i < letters.length; i++) {
      if (!vowels.includes(letters[i])) {
        return "blue";
      }
    }
    return "orange";
  }

  const calculateMaxWidth = function (letters) {
    while (calculateWidth(letters, dim.width, dim.height) > window.innerWidth) {
      dim.width -= 10;
      dim.height -= 10;
    }
  }

  const loadLetters = function (letters) {
    removeTiles();
    removeAdded();

    const lines = letters.split("\n");
    for (let j = 0; j < lines.length; j++) {
      dim.top = (dim.height * 0.1) + (dim.height * 1.1 * j);
      dim.left = 0;
      let line = lines[j];
      let words = line.split(" ");
      for (let k = 0; k < words.length; k++) {
        if (k > 0) {
          dim.left += dim.width * 1.1;
        }

        let word = words[k];
        for (let l = 0; l < word.length; l++) {
          let charAt = word.charAt(l);
          if (charAt === "[") {
            let c = "";
            charAt = "";
            while (c !== "]") {
              charAt += c;
              c = word.charAt(++l);
            }
          }
          let tile = createTileAt(charAt, dim.left, dim.top, dim.width, dim.height);
          appendTile(tile);
        }
      }
    }

    updateCursor();

    const elements = document.getElementsByClassName('shape');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("mousedown", mousedown_handler);
    }
  }

  const createElement = function (data) {
    const template = getTileTemplate();
    const html = fillTemplate(template, data);
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.children[0];
  }

  const appendToTile = function (letters) {
    added[added.length - 1].children[0].innerText += letters;
  }

  const createTile = function (letters) {
    return createTileAt(letters, dim.left, dim.top, dim.width, dim.height);
  }

  const createTileAt = function (letters, left, top, width, height) {
    let color = areVowels(letters);
    let data = {
      "color": color,
      "content": letters,
      "left": left + "px",
      "top": top + "px",
      "width": width + "px",
      "height": height + "px",
      "fontSize": (width * 0.4) + "px",
      "borderRadius": (width * 0.08) + "px"
    };

    const child = createElement(data);
    child.isTemplate = true;
    child.addEventListener("mousedown", mousedown_handler);

    return child;
  }

  const added = [];

  const appendTile = function (tile) {
    main.appendChild(tile);
    tile.dim = JSON.parse(JSON.stringify(dim, null, 2));
    tile.index = added.length;
    added.push(tile);
    dim.left += dim.width * 1.1;
  }

  const removeTiles = function() {
    while (added.length > 0) {
      added.pop().remove();
    }
  }

  function mousedown_handler(event) {
    const target = event.currentTarget;

    if (target.isTemplate) {
      target.isTemplate = false;

      let newClone = target.cloneNode(true);
      newClone.dim = target.dim;
      newClone.addEventListener("mousedown", mousedown_handler);
      newClone.isTemplate = true;
      added[target.index] = newClone;

      target.dim = undefined;
      target.classList.add("added");
      main.appendChild(newClone);
    }

    let shiftX = event.clientX + main.getBoundingClientRect().left - target.getBoundingClientRect().left;
    let shiftY = event.clientY + main.getBoundingClientRect().top - target.getBoundingClientRect().top;

    target.style.position = 'absolute';
    target.style.zIndex = 1000;
    main.append(target);

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      target.style.left = pageX - shiftX + 'px';
      target.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
      let shiftX = event.clientX + main.getBoundingClientRect().left - target.getBoundingClientRect().left;
      let shiftY = event.clientY + main.getBoundingClientRect().top - target.getBoundingClientRect().top;
  
      if (event.pageX - shiftX <= 0 - (dim.width / 2) ||
        event.pageY - shiftY <= 0 - (dim.height / 2) ||
        event.pageX - shiftX >= main.offsetWidth - (dim.width / 2) ||
        event.pageY - shiftY >= main.offsetHeight - (dim.height / 2)) {
        main.removeEventListener('mousemove', onMouseMove);
        target.onmouseup = null;
        target.remove();
        return;
      }

      moveAt(event.pageX, event.pageY);
    }

    main.addEventListener('mousemove', onMouseMove);

    target.onmouseup = function (event) {
      console.log("mouseup");
      main.removeEventListener('mousemove', onMouseMove);
      target.onmouseup = null;

      const width = dim.width;
      const snap = width * 0.5;

      const left = (event.pageX - shiftX) - ((event.pageX - shiftX) % snap);
      const top = (event.pageY - shiftY) - ((event.pageY - shiftY) % snap);

      target.style.left = left + 'px';
      target.style.top = top + 'px';

      if (left < 0 ||
        top + target.offsetHeight > main.offsetHeight ||
        left + target.offsetWidth > main.offsetWidth
      ) {
        target.remove();
      }
    };
  };

  window.addEventListener('DOMContentLoaded', () => {
    const elements = document.getElementsByClassName('shape');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("mousedown", mousedown_handler);
    }
  });

  const isPrintable = function (event) {
    return event.charCode;
  }

  const keyup_handler = function (event) {
    if (event.keyCode === 8) {
      if (added.length === 0) {
        return;
      }
      let popped = added.pop();
      popped.remove();
      dim = popped.dim;
      updateCursor();
    }
  }

  let isAppendMode = false;

  const keypress_handler = function (event) {
    if (isPrintable(event)) {
      if (event.keyCode === 13) {
        dim.left = 0;
        dim.top += dim.height * 1.1;
        updateCursor();
        return;
      }

      let key = event.key;
      if (isAppendMode) {
        if (key === "]") {
          isAppendMode = false;
          updateCursor();
        } else {
          appendToTile(key);
        }
      } else {
        if (key === "[") {
          isAppendMode = true;
          appendTile(createTile(""));
        } else {
          appendTile(createTile(key));
          updateCursor();
        }
      }
    }
  }

  const reset_handler = function (event) {
    removeAdded();
  }

  const clear_handler = function (event) {
    removeTiles();
    removeAdded();
  }

  const removeAdded = function () {
    const added = document.getElementsByClassName("added");
    while (added.length > 0) {
      added[0].remove();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    main.addEventListener('keypress', keypress_handler);
    main.addEventListener('keyup', keyup_handler);

    main.focus();
  });

  return {
    setTileSize: function(size) {
      dim.width = size;
      dim.height = size;

      main.querySelector(".cursor").style.height = size + "px";
    },
    setLetters: function(letters) {
      loadLetters(letters);
    },
    reset: function() {
      removeAdded();
    },
    clear: function() {
      removeTiles();
      removeAdded();
    }
  }
};
