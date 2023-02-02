let words
let containers = [] 
// let drag.index 
let overlapIndex 
let drag = {}
const instructions = [
  "r to reset",
  "up and down to resize",
  "click or touch and drag",
  "hover to combine",
  "double click or tap to separate",
]

function preload() {
  words = loadStrings("magneticPoetryWordList.txt")
}

function setup() {
  createCanvas(windowWidth-20, windowHeight-20) 
  words = shuffle(words).map( word => new Word(word) )
  layoutWords()
  noLoop()
}

function layoutWords() {
  containers = []
  let x = Word.PADDING
  let y = Word.h
  let dy = Word.h
  const nextPositionFor = (item) => {
    if(x + item.w > width ) {
      x = Word.PADDING
      y += dy
    }
    position = {x,y}
    x += item.w + Container.INTER
    return position
  }
  
  containers = words.map( word => new Container(word,nextPositionFor(word)))
  
  y += dy
  
  containers = [...containers, 
    ...instructions.map( instruction => {
      x = Word.PADDING
      y += dy      
      const [first,...rest] = instruction
        .split(" ")
        .map( word => new Word(word) )
        .map( word => new Container(word,nextPositionFor(word)))   
      rest.forEach( c => first.add(c) )
      return first
    })]  

  redraw()
}

function draw() {
  background('white')
  for( const container of containers ) {
    container.draw()  
  }
}

function touchStarted() {
  if( touches.length === 1 ) {
    handleSingleSelection(touches[0].x, touches[0].y, "touch")
  }
}

function handleSingleSelection(x,y,type) {
  drag.index = selectIndex(x,y)
  drag.type = type
  drag.px = x
  drag.py = y
  redraw()
}

function mousePressed() {
  if( mouseButton === RIGHT ) {
    handleSplit(mouseX,mouseY)
  }
  handleSingleSelection(mouseX,mouseY,"mouse")
}

function handleSplit(x,y) {
  let index = selectIndex(x,y)
  if( index && containers[index].words.length > 1 ) {
    // determine which word in the container was clicked on
    const selectedContainer = containers[index]
    const xOffset = x - selectedContainer.x
    containers.splice(index,1)
    console.log( selectedContainer )
    containers = [...containers,...selectedContainer.seperateAtOffset(xOffset)]
  }
}
  
function mouseDragged() { // also touchMoved
  if( drag.index ) { 
    handleDrag()
    redraw()
  } 
}

function handleDrag() {
  let dx, dy
  if( drag.type === "mouse" ) {
    dx = mouseX - drag.px
    dy = mouseY - drag.py
    drag.px = mouseX
    drag.py = mouseY
  } else {
    dx = touches[0].x - drag.px
    dy = touches[0].y - drag.py
    drag.px = touches[0].x
    drag.py = touches[0].y
  }
    
  
  containers[drag.index].setDragBG()
  containers[drag.index].position.x += dx
  containers[drag.index].position.y += dy

  handleOverlap()
}

function handleOverlap() {
  overlapIndex = null;
  for( let i = 0; i < containers.length; i++ ) {
    if( drag.index !== i ) {
      if( !overlapIndex && containers[drag.index].overlapsWith( containers[i] ) ) {
        containers[i].setOverlapBG(); 
        overlapIndex = i;
      } else {
        containers[i].setDefaultBG();
      }
    }
  }  
}
  
function mouseReleased() { // and touchEnded
  if( drag.index ) {
    containers[drag.index].setDefaultBG()
    if( overlapIndex ) {
      containers[overlapIndex].setDefaultBG()   
      if( containers[drag.index].x < containers[overlapIndex].midx ) {
        containers[drag.index].add(containers[overlapIndex])
        containers.splice(overlapIndex,1);
      } else {
        containers[overlapIndex].add(containers[drag.index])  
        containers.splice(drag.index,1)
      }        
    }
  }
  drag = {};
  overlapIndex = null;
  redraw()
}

function selectIndex(x,y) {
  let i = containers.findIndex( container => container.isOver(x,y) )
  return i > -1 ? i : null
}

function doubleClicked() {
  const clickIndex = selectIndex(mouseX,mouseY)
  if( clickIndex && containers[clickIndex].words.length > 1 ) {
    const c = containers[clickIndex]
    containers.splice(clickIndex,1)
    containers = [...containers, ...Container.separate(c)]    
  }
  redraw()
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
  static PADDING = 2  
  
  constructor(text) {
    this.text = text
    this.wiggle = random(-PI/100,PI/100)
  }
  
  get tw() { return textWidth(this.text) }
  get w() { return this.tw + Word.PADDING + Word.PADDING }
  get h() { return Word.h }
  
  static get h() { return textSize() + textDescent() + 2 * Word.PADDING }
}
  
class Container {
  static INTER = 2
  
  constructor(words,position) { // a single, non-array word, or an array of words
    this.words = Array.isArray(words) ? words : [words]
    this.position = position;
    this.bg = color('white')
  }
  
  get x() { return this.position.x }
  get y() { return this.position.y }
  get midx() { return this.x + this.w/2 }
  get h() { return Word.h }
  
  get w() { 
    return this.words
      .reduce( (width, word) => width + word.w, 0) +
      Container.INTER * (this.words.length - 1)
  }  
  
  setDragBG() { this.bg = color(255,0,0,128) }
  setDefaultBG() { this.bg = color('white') } 
  setOverlapBG() { this.bg = color(0,0,255,128) }
  
  isOver(x,y) { return collidePointRect(x, y, this.x, this.y, this.w, this.h) }  
  
  draw() {
    push()
    translate(this.position.x, this.position.y) 
    let x = 0;
    for( let word of this.words ) {
      this.drawWord(word,x)
      x += word.w + Container.INTER
    }
    pop()   
  }  
  
  drawWord(word,x) {
    push()
    translate(x+word.w/2,word.h/2)
    rotate(word.wiggle)
    fill(this.bg)
    stroke(64)
    rect(-word.w/2,-word.h/2,word.w,word.h)
    fill("black")
    noStroke()
    text(word.text,-word.w/2 + Word.PADDING, textSize()/2 - textDescent()/2 - Word.PADDING)
    pop()
  }
  
  add(otherContainer) { this.words = [...this.words, ...otherContainer.words] }
  
  overlapsWith(otherContainer) {
    return Container.overlap(this,otherContainer)
  }

  wordIndexAtX(xTarget) {
    let x = 0;
    return this.words
    .map( word => {
      const valueToReturn = x;
      x += word.w + Container.INTER
      return valueToReturn
    })
    .findIndex( i => xTarget < i ) - 1
  }

  seperateAtOffset(xOffset) {
    const newContainers = []
    const i = this.wordIndexAtX(xOffset)
    if( i < this.words.length - 1 ) {
      const left = this.words.slice(0,i+1)
      const right = this.words.slice(i+1)
      return [
        new Container(left, {x:this.x, y:this.y}),
        new Container(right, {x:this.x + xOffset + left[left.length-1].w + Container.INTER, y: this.y})
      ]
    }
  }
  
  static overlap(a,b) { return collideRectRect(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h) }
  
  static separate(c) {
    const newContainers = []
    let x = c.x
    for( let i = 0; i < c.words.length; i++ ) {
      newContainers.push( 
        new Container( 
          new Word( c.words[i].text ),
          {x, y: c.y}
        )
      );
      x += Container.INTER + 1 + c.words[i].w
    }
    return newContainers;
  }
}