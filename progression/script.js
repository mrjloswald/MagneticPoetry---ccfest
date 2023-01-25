let words

function preload() {
  words = loadStrings("magneticPoetryWordList.txt")
}

function setup() {
  createCanvas(400, 400)
  words = shuffle(words)
  noLoop()
  rectMode(CENTER)
}

function draw() {
  background('white')
  const padding = 2
  let x = padding
  let dy = padding + textSize()
  let y = dy

  for( const word of words ) {
    const tw  = textWidth(word)
    const blockWidth = tw + padding + padding
    if( x + tw > width ) {
      y += dy
      x = padding
    }
    push();
    translate(x + blockWidth/2,y, textSize()/2)
    rotate(random(-PI/100,PI/100))
    rect( 0, 0, blockWidth, textSize() )
    text(word,0 - tw/2, 0 + textSize()/2)
    pop()
    x += tw + padding + padding + padding
  }
}
