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
  let y = textSize()
  for( const word of words ) {
    if( x + textWidth(word) > width ) {
      y += textSize()
      x = padding
    }
    text(word,x,y);
    x += textWidth(word) + padding
  }
}
