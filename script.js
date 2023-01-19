 let words;
let pos;
let blocks = [];
function preload() {
  words = loadStrings("magneticPoetryWordList.txt");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // let doc = nlp(words.join(' '))
  // console.log(doc.json())
  words = shuffle(words);
  let x = 0;
  let dy = textSize() + TextBlock.PADDING.BOTTOM + TextBlock.PADDING.TOP;
  let y = dy/2;
  for( let word of words ) {
    const hw = (textWidth(word)+TextBlock.PADDING.LEFT+TextBlock.PADDING.RIGHT)/2;
    x += hw;
    if( x + hw > width ) {
      y += (dy+TextBlock.PADDING.INTER);
      x = hw;
    }
    blocks.push(new TextBlock(word,createVector(x,y)));
    x += (hw+TextBlock.PADDING.INTER);
  }
  
  background(255);
  rectMode(CENTER);
  noLoop()
}

function draw() {
  // const playBlocks = [random(blocks),random(blocks),random(blocks)];
  // for( let b of playBlocks ) {
  //   b.draw();
  // }
  // let t = TextBlock.combine(playBlocks[0],playBlocks[1]);
  // t = TextBlock.combine(t,playBlocks[2])
  // t.draw();
  // let doc = nlp(t.fullText);
  // console.log(doc.fullSentences())
  for( let b of blocks ) {
    b.draw();
  }
}

class TextBlock {
  constructor(text,position) {
    this.text = text;
    this.position = position;
    this.blocks = [];
  }

  get allBlocks() {
    if( this.blocks.length === 0 ) {
      return [this];
    } else {
      return this.blocks;
    }
  }

  get w() {
    if( this.blocks.length === 0 ) {
      return textWidth(this.text) + TextBlock.PADDING.LEFT + TextBlock.PADDING.RIGHT;
    } else {
      return this.blocks.reduce( (sum,current) => sum += current.w, 0) + (this.blocks.length - 1)*TextBlock.PADDING.INTER;
    }
  }

  get fullText() {
    if( this.blocks.length === 0 ) {
      return this.text;
    } else {
      return this.blocks.map( b => b.text ).join(' ');
    }
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);
    let x = -this.w/2;
    const h = textSize()+TextBlock.PADDING.TOP+TextBlock.PADDING.BOTTOM;
    const blocks = this.allBlocks;
    for( let i = 0; i < blocks.length; i++ ) {
      if( i > 0 ) { x += TextBlock.PADDING.INTER }
      const w = blocks[i].w;
      x += w/2;
      stroke('black');
      fill('white');
      rect(x,0,w,h);
      noStroke();
      fill('black')
      text(blocks[i].text,x-w/2+TextBlock.PADDING.LEFT, h/2 - TextBlock.PADDING.TOP) 
      x += w/2;
    }
    pop();
  }

  static emptyBlock() {
    return new TextBlock("",createVector(0,0));
  }

  static combine(a,b) {
    const emptyBlock = TextBlock.emptyBlock();
    emptyBlock.blocks = [...a.allBlocks, ...b.allBlocks];
    console.log( emptyBlock.blocks )
    const sums = emptyBlock
      .blocks
      .reduce( (sums,block) => {
        sums.x += block.position.x;
        sums.y += block.position.y;
        return sums;
      }, {x:0,y:0}); 
    emptyBlock.position = createVector( sums.x/emptyBlock.blocks.length, sums.y/emptyBlock.blocks.length );
    return emptyBlock;
  }

  static canCombine(a,b) {
    
  }
}

TextBlock.PADDING = {INTER:2, LEFT:2, RIGHT:2, TOP:4, BOTTOM:2};