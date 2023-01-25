let words
let containers = [] 
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
      y += dy
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
    const hw = this.blockWidth/2
    const hh = textSize()/2

    return mouseX > this.position.x - hw && 
      mouseX < this.position.x + hw &&
      mouseY > this.position.y - hh &&
      mouseY < this.position.y + hh
  }
  
  setHoverBG() { this.bg = color(255,0,0,16) }
  setDefaultBG() { this.bg = color('white') }
}

Word.PADDING = 2
