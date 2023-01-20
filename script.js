let words;
let containers = [];

let dragIndex; 
let overlapIndex;

function preload() {
  words = loadStrings("magneticPoetryWordList.txt");
}

function loadInstructionBlocks(y) {
  let instructions = [
    "r to reset",
    "drag and drop",
    "hover to combine",
    "double click to separate",
    "up and down to change size",
  ];
  for( let line of instructions ) {
    let x = 0;
    let container;
    for( const text of line.split(' ') ) {
      const word = new Word(text);
      const wc = Container.createWithWordAt(word,createVector(x,y));
      if( !container ) {
        container = wc;
      } else {
        container.add(wc);
      }
      x += word.w + Container.PADDING.INTER;
    }
    containers.push(container);
    y += Word.h;
  }
}

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
  words = shuffle(words).map( word => new Word(word) );
  layoutWords();
  background(255);
}

function layoutWords() {
  containers = [];
  let x = Container.PADDING.INTER;
  let dy = Word.h;
  let y = Container.PADDING.INTER;
  for( let word of words ) {
    if( x + word.w > width ) {
      y += (dy+Container.PADDING.INTER);
      x = Container.PADDING.INTER;
    }
    containers.push(Container.createWithWordAt(word,createVector(x,y)));
    x += word.w+Container.PADDING.INTER;
  }
  loadInstructionBlocks(y + 2 * dy );  
}

function draw() {
  background('white')
  for( let b of containers ) {
    b.draw();
  }
}

function doubleClicked() {
  dragIndex = null;
  overlapIndex = null;
  for( let i = 0; i < containers.length; i++ ) {
    if( containers[i].isMouseInside() && containers[i].words.length > 1 ) {
      const b = containers[i];
      containers.splice(i,1);
      containers = [...containers, ...b.breakApart()]
      return;
    }
  }
}


function mousePressed() {
  for( let i = 0; i < containers.length; i++ ) {
    if( containers[i].isMouseInside() ) {
      dragIndex = i;
      return
    }
  }
}

function mouseDragged() {
  if( dragIndex ) {
    containers[dragIndex].dragging()
    containers[dragIndex].position.x += movedX;
    containers[dragIndex].position.y += movedY;
    overlapIndex = null;
    for( let i = 0; i < containers.length; i++ ) {
      if( dragIndex !== i ) {
        if( !overlapIndex && containers[dragIndex].overlapsWith( containers[i] ) ) {
          containers[i].hoveredOver(); 
          overlapIndex = i;
        } else {
          containers[i].resetBG();
        }
      }
    }
  }
}

function mouseReleased() {
  if( dragIndex && overlapIndex ) {
    containers[overlapIndex].resetBG()
    containers[dragIndex].resetBG()
    if( containers[dragIndex].x < containers[overlapIndex].mid.x ) {
      containers[dragIndex].add(containers[overlapIndex])
      containers.splice(overlapIndex,1);
    } else {
      containers[overlapIndex].add(containers[dragIndex])  
      containers.splice(dragIndex,1)
    }    
  }
  dragIndex = null;
  overlapIndex = null;
}

function keyPressed() {
  if( keyCode === UP_ARROW ) {
    textSize( textSize() + 1 );
    layoutWords();
  }
  if( keyCode === DOWN_ARROW ) {
    textSize( textSize() - 1);
    layoutWords();
  }
  if( key === 'r' ) {
    layoutWords();
  }
}

class Word {
  constructor(text) {
    this.text = text;
    this.wiggle = random(-PI/64,PI/64);
  }

  get w() { return textWidth(this.text) + Word.PADDING.LEFT + Word.PADDING.RIGHT; }
  get h() { return Word.h; }

  static get h() { return textSize()+Word.PADDING.TOP+Word.PADDING.BOTTOM; }
}

Word.PADDING = {LEFT:2, RIGHT:2, TOP:2, BOTTOM:4}

class Container {
  constructor(word, position) {
    this.words = [word];
    this.position = position;    
    this.bg = Container.defaultBG;
    this.stroke = Container.stroke;
  }

  // quick aliases
  get x() { return this.position.x } 
  get y() { return this.position.y }
  get lx() { return this.corners.topLeft.x }
  get ly() { return this.corners.topLeft.y }
  get rx() { return this.corners.bottomRight.x }
  get ry() { return this.corners.bottomRight.y }
  
  get w() { 
    return this.words
      .reduce( (width, word) => width + word.w, 0) 
      + Container.PADDING.INTER * (this.words.length - 1)
  }
  get h() { return textSize()+Word.PADDING.TOP+Word.PADDING.BOTTOM; }

  get mid() {
    return {
      x: this.x + this.w/2,
      y: this.h + this.h/2
    }
  }
  
  get corners() {
    return {
      topLeft: {x: this.x, y: this.y},
      bottomRight: {x: this.x + this.w, y: this.y + this.h }
    }
  }

  isMouseInside() {
    return mouseX > this.lx &&
      mouseX < this.rx &&
      mouseY > this.ly &&
      mouseY < this.ry 
  } 

  hoveredOver() { this.bg = Container.overlapBG;}
  resetBG() { this.bg = Container.defaultBG } 
  dragging() { this.bg = Container.dragBG }

  overlapsWith( otherContainer ) {
    return Container.overlap( this, otherContainer );
  }

  add( otherContainer ) {
    this.words = [...this.words, ...otherContainer.words ];
  }

  draw() {
    push();
    translate(this.x,this.y);
    let x = 0;
    for( let word of this.words ) {
      this.drawWord(word,x,0);
      x += word.w + Container.PADDING.INTER;
    }
    pop();
  }

  drawWord( word, x, y ) {
    fill(this.bg);
    stroke(Container.stroke)
    // rect(x,y,word.w,word.h)
    // noStroke();
    // fill(Container.stroke)
    // text(word.text,x+Word.PADDING.LEFT,y+word.h-Word.PADDING.BOTTOM)    
    push();
    translate(x+word.w/2, y+word.h/2);
    rotate(word.wiggle);
    rect(-word.w/2,-word.h/2,word.w,word.h)
    noStroke();
    fill(Container.stroke)
    text(word.text,-word.w/2+Word.PADDING.LEFT,Word.PADDING.BOTTOM)    
    pop();
  } 

  breakApart() {    
    if( this.words.length > 1 ) {
      const newWords = [];
      let x = this.x;
      for( let i = 0; i < this.words.length; i++ ) {
        newWords.push( Container.createWithWordAt( new Word(this.words[i].text), createVector(x,this.y)));
        x += Container.PADDING.INTER + 1 + this.words[i].w;
      }
      return newWords;
    }
    
  }
  
  // https://www.geeksforgeeks.org/find-two-rectangles-overlap/
  static overlap(a,b) {
    // If one rectangle is on left side of other or above other
    if (a.lx > b.rx || b.lx > a.rx || a.ry < b.ly || b.ry < a.ly) { return false; }
    else { return true }
  }

  static createWithWordAt( word, position ) {
    return new Container( word, position );
  }
}

Container.defaultBG = "white";
Container.overlapBG = "#ff000010";
Container.dragBG = "#0000ff10";
Container.stroke = "black";
Container.textColor = "black";
Container.PADDING = {INTER:3, LEFT:2, RIGHT:2, TOP:4, BOTTOM:2};