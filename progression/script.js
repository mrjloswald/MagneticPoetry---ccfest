let words
let containers = [] 
let dragIndex 

function preload() {
  words = loadStrings("magneticPoetryWordList.txt")
}

function setup() {
  createCanvas(400, 400)
  words = shuffle(words)
  rectMode(CENTER)
  let x = Word.PADDING
  let dy = Word.PADDING + textSize()
  let y = dy;  
  for( const word of words ) {
    const w = new Word(word)
    if( x + w.tw > width ) {
      y += dy;
      x = Word.PADDING
    }
    w.position = createVector(x,y)
    containers.push( w )
    x += w.tw + Word.PADDING + Word.PADDING + Word.PADDING
  }  
}

function draw() {
  background('white')

  for( const word of containers ) {
    if( word.isMouseOver() ) {
      word.setHoverBG()
    } else {
      word.setDefaultBG()
    }
    word.draw()  
  }
}

function mousePressed() {
  for( let i = 0; i < containers.length; i++ ) {
    if( containers[i].isMouseOver() ) {
      dragIndex = i
      return
    }    
  }
}
  
function mouseDragged() {
  if( dragIndex ) {
    containers[dragIndex].position.x += movedX
    containers[dragIndex].position.y += movedY
  }
}
  
function mouseReleased() {
  if( dragIndex ) {
    containers[dragIndex].setDefaultBG()
    dragIndex = undefined
  }
}

class Word {
  constructor(text) {
    this.text = text
    this.wiggle = random(-PI/100,PI/100)
    this.position = createVector(0,0)
    this.bg = color('white')
  }
  
  get tw() { return textWidth(this.text) }
  get blockWidth() { return this.tw + Word.PADDING + Word.PADDING }
  
  draw() {
    push()
    translate(
      this.position.x + this.blockWidth/2,
      this.position.y + textSize()/2 
    ) 
    rotate( this.wiggle ) 
    fill(this.bg)
    rect( 0, 0, this.blockWidth, textSize() ) 
    fill("black")
    text(this.text,0 - this.tw/2, 0 + textSize()/2 - Word.PADDING)
    pop()   
  }
  
  isMouseOver() { 
    return mouseX > this.position.x && 
      mouseX < this.position.x + this.blockWidth &&
      mouseY > this.position.y &&
      mouseY < this.position.y + textSize()
  }
  
  setHoverBG() { this.bg = color(255,0,0,16) }
  setDefaultBG() { this.bg = color('white') }
}

Word.PADDING = 2
