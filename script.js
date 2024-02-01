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
  textAlign(CENTER,CENTER)
  rectMode(CENTER)
  layoutWords()  
  noLoop();
}

function layoutWords() {
  let x = Word.PADDING
  let dy = Word.h
  let y = dy  
  
  const nextPositionFor = (item) => {
    x += item.w/2
    // line break
    if( x  + item.w/2 > width ) {
      x = Container.INTER + item.w/2 
      y += dy + Container.INTER
    }
    const p = {x,y}
    x += item.w/2 + Container.INTER
    return p;
  }
  
  containers = words.map( word => new Container(word,nextPositionFor(word) ) )
  
  y += dy

  for( const instruction of instructions ) { 
    x = Word.PADDING
    
    y += dy
    const [first,...rest] = instruction.split(" ")
    const w = new Word(first)
    const c = new Container(w,nextPositionFor(w))
    rest.forEach( w => c.addText(w) )
    containers.push(c)
  }
  redraw()
}

function draw() {
  background('white')

  for( const container of containers ) {
    container.draw()  
  }
}

function mousePressed() {
  for( let i = 0; i < containers.length; i++ ) {
    if( containers[i].isMouseOver() ) {
      dragIndex = i
      containers[i].setDragBG()
      redraw()
      return
    }    
  }
}
  
function mouseDragged() { 
  if( dragIndex ) { 
    handleDrag()
    redraw()
  } 
}

function handleDrag() {
  containers[dragIndex].setDragBG()
  updateDragPosition()
  handleOverlap()
}

function updateDragPosition() {
  containers[dragIndex].position.x += movedX
  containers[dragIndex].position.y += movedY
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
      // which side do we add the dragged word onto ?
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

function doubleClicked() {
  for( let i = 0; i < containers.length; i++ ) {
    if( containers[i].isMouseOver() ) {
      if( containers[i].words.length > 1 ) {
        const c = containers[i]
        containers.splice(i,1)
        containers = [...containers, ...Container.separate(c)]
      }
      redraw()
      return;
    } 
  }
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
    this.text = text
    this.wiggle = random(-PI/100,PI/100)
  }
  
  // you need these for text resizing
  get tw() { return textWidth(this.text) } 
  get w() { return this.tw + Word.PADDING + Word.PADDING }
  get h() { return Word.h; }
  
  static get h() { return textSize() + 2 * Word.PADDING }
}

Word.PADDING = 2
  
class Container {
  constructor(word,position) {
    this.words = [word]
    this.position = position;
    this.bg = color('white')
  }
  
  get x() { return this.position.x }
  get y() { return this.position.y }
  get lx() { return this.x - this.words[0].w/2 }
  get uy() { return this.y-this.h/2 }
  get midx() { return this.lx + this.w/2 }
  
  get w() { 
    return this.words
      .reduce( (w, word) => w + word.w, 0) +
      Container.INTER * (this.words.length - 1)
  }
  
  get h() { return Word.h }  
  
  addText(text) { this.addWord(new Word(text)) }
  addWord(word) { this.words.push(word) }
  
  setDragBG() { this.bg = color(255,0,0,16) }
  setDefaultBG() { this.bg = color('white') } 
  setOverlapBG() { this.bg = color(0,0,255,16) }
  
  isMouseOver() { 
    // have to adjust for rectMode CORNER
    return collidePointRect(mouseX,mouseY,this.lx,this.uy,this.w,Word.h)
  }
  
  draw() {    
    push()
    translate(this.x, this.y)       
    this.drawWord(this.words[0]) 
    for( let i = 1; i < this.words.length; i++ ) {
      translate(this.words[i-1].w/2 + Container.INTER + this.words[i].w/2, 0)
      this.drawWord(this.words[i]);      
    } 
    pop()   
  }  
  
  drawWord(word) {    
    push()
    rotate(word.wiggle)
    fill(this.bg)
    rect(0,0,word.w,word.h)
    fill("black")
    text(word.text,0,0)
    pop()
  }
  
  add(otherContainer) {
    this.words = [...this.words, ...otherContainer.words]
  }
  
  overlapsWith(otherContainer) {
    return Container.overlap(this,otherContainer)
  }
  
  static overlap(a,b) { return collideRectRect(a.lx, a.uy, a.w, a.h, b.lx, b.uy, b.w, b.h) }
  
  static separate(c) {
    const newContainers = []
    let x = c.x
    for( let i = 0; i < c.words.length; i++ ) {
      newContainers.push( 
        new Container( 
          new Word( c.words[i].text ),
          {x,y: c.y}
        )
      );
      if( i < c.words.length - 1 ) { // no need to update x on the last one
        x += c.words[i].w/2 + Container.INTER + 1 + c.words[i+1].w/2  
      }      
    }
    return newContainers;
  }
}
  
Container.INTER = 2
