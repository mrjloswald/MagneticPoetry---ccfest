let words;

function preload() {
  words = loadStrings("magneticPoetryWordList.txt");
}

function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background('white');
  let x = 0;
  let y = textSize();
  for( const word of words ) {
    if( x + textWidth(word) > width ) {
      y += textSize();
      x = 0;
    }
    text(word,x,y);
    x += textWidth(word)
  }
}
