let words
let containers = [] 
let dragIndex 
let overlapIndex 

const instructions = [
  "r to reset",
  "click and drag",
  "hover to combine",
  "double click to separate",
  "up and down to resize"
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

function mousePressed() {
  dragIndex = mouseoverIndex()
  redraw()
}
  
function mouseDragged() { 
  if( dragIndex ) { 
    handleDrag()
    redraw()
  } 
}

function handleDrag() {
  containers[dragIndex].setDragBG()
  containers[dragIndex].position.x += movedX
  containers[dragIndex].position.y += movedY
  handleOverlap()
}

function handleOverlap() {
  overlapIndex = null;
  for( let i = 0; i < containers.length; i++ ) {
    if( dragIndex !== i ) {
      if( !overlapIndex && containers[dragIndex].overlapsWith( containers[i] ) ) {
        containers[i].setOverlapBG(); 
        overlapIndex = i;
      } else {
        containers[i].setDefaultBG();
      }
    }
  }  
}
  
function mouseReleased() {
  if( dragIndex ) {
    containers[dragIndex].setDefaultBG()
    if( overlapIndex ) {
      containers[overlapIndex].setDefaultBG()   
      if( containers[dragIndex].x < containers[overlapIndex].midx ) {
        containers[dragIndex].add(containers[overlapIndex])
        containers.splice(overlapIndex,1);
      } else {
        containers[overlapIndex].add(containers[dragIndex])  
        containers.splice(dragIndex,1)
      }        
    }
  }
  dragIndex = null;
  overlapIndex = null;
  redraw()
}

function mouseoverIndex() {
  let i = containers.findIndex( container => container.isMouseOver() )
  return i > -1 ? i : null
}

function doubleClicked() {
  const clickIndex = mouseoverIndex()
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
  
  constructor(word,position) {
    this.words = [word]
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
  
  isMouseOver() { return collidePointRect(mouseX, mouseY, this.x, this.y, this.w, this.h) }  
  
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
  
  static overlap(a,b) { return collideRectRect(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h) }
  
  static separate(c) {
    const newContainers = []
    let x = c.x
    for( let i = 0; i < c.words.length; i++ ) {
      newContainers.push( 
        new Container( 
          new Word( c.words[i].text ),
          createVector( x, c.y )
        )
      );
      x += Container.INTER + 1 + c.words[i].w
    }
    return newContainers;
  }
}