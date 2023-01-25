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
    rect( x, y - textSize(), tw + 4, textSize() );
    text(word,x + 2,y)
    x += textWidth(word) + padding + 4
  }
}
