let words

function preload() {
  words = loadStrings("magneticPoetryWordList.txt")
}

function setup() {
  createCanvas(400, 400)
  words = shuffle(words)
  noLoop()
}

function draw() {
  background('white')
  const padding = 2
  let x = padding
  let dy = 2 + textSize()
  let y = dy

  for( const word of words ) {
    const tw  = textWidth(word)
    if( x + tw > width ) {
      y += dy
      x = padding
    }
    push()
    translate(x,y)
    rect( 0, 0 - textSize(), tw + 4, textSize() )
    text(word,0 + 2,0)
    pop()
    x += textWidth(word) + padding + 4
  }
}
