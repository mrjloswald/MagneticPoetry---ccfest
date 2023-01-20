let words;
let pos;
let blocks = [];
let beingDragged; 
let overlapBlock;

function preload() {
  words = loadStrings("magneticPoetryWordList.txt");
}

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
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
  // noLoop()
}

function draw() {
  background('white')
  for( let b of blocks ) {
    b.draw();
  }
}

function mousePressed() {
  for( let b of blocks ) {
    if( b.isMouseInside() ) {
      beingDragged = b;
      return
    }
  }
}

function mouseDragged() {
  beingDragged.position.x = mouseX;
  beingDragged.position.y = mouseY;
  overlapBlock = null;
  for( let b of blocks ) {
    if( !beingDragged.isSameAs(b) ) {
      if( !overlapBlock && beingDragged.overlapsWith(b) ) {
        b.bg = color(255,0,0,16);
        overlapBlock = b;
      } else {
        b.resetBG()
      }
    }
  }
}

function mouseReleased() {
  if( beingDragged && overlapBlock ) {
    beingDragged = TextBlock.combine( beingDragged, overlapBlock )
  }
  beingDragged = null;
  overlapBlock = null;
}

class TextBlock {
  constructor(text,position) {
    this.text = text;
    this.position = position;
    this.blocks = [];
    this.bg = 'white'
  }

  resetBG() {
    this.bg = 'white'
  }

  isMouseInside() {
    return mouseX > this.l.x &&
      mouseX < this.r.x &&
      mouseY > this.l.y &&
      mouseY < this.r.y 
  }

  get allBlocks() {
    if( this.blocks.length === 0 ) {
      return [this];
    } else {
      return this.blocks;
    }
  }

  get l() { return {x:this.position.x-this.w/2, y:this.position.y-this.h/2 } }
  get r() { return {x:this.position.x+this.w/2, y:this.position.y+this.h/2 } }

  get x() { return this.position.x }
  get y() { return this.position.y }
  
  get w() {
    if( this.blocks.length === 0 ) {
      return textWidth(this.text) + TextBlock.PADDING.LEFT + TextBlock.PADDING.RIGHT;
    } else {
      return this.blocks.reduce( (sum,current) => sum += current.w, 0) + (this.blocks.length - 1)*TextBlock.PADDING.INTER;
    }
  }

  get h() {
    return textSize()+TextBlock.PADDING.TOP+TextBlock.PADDING.BOTTOM;
  }

  get fullText() {
    if( this.blocks.length === 0 ) {
      return this.text;
    } else {
      return this.blocks.map( b => b.text ).join(' ');
    }
  }

  isSameAs(otherBlock) {
    return this.text === otherBlock.text &&
      this.position.x === otherBlock.position.x &&
      this.position.y === otherBlock.position.y 
  }

  overlapsWith(otherBlock) {
    return TextBlock.overlap(this,otherBlock)
  }
  
  draw() {
    push();
    translate(this.position.x, this.position.y);
    let x = -this.w/2;
    const h = this.h
    const blocks = this.allBlocks;
    for( let i = 0; i < blocks.length; i++ ) {
      if( i > 0 ) { x += TextBlock.PADDING.INTER }
      const w = blocks[i].w;
      x += w/2;
      stroke('black');
      fill(this.bg);
      rect(x,0,w,h);
      noStroke();
      fill('black')
      text(blocks[i].text,x-w/2+TextBlock.PADDING.LEFT, h/2 - TextBlock.PADDING.TOP) 
      x += w/2;
    }
    pop();
  }

  static overlap(a,b) {
    // If one rectangle is on left side of other
    if (a.l.x > b.r.x || b.l.x > a.r.x) {
        return false;
    }

    // If one rectangle is above other
    if (a.r.y < b.l.y || b.r.y < a.l.y) {
        return false;
    }

    return true;
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
}

TextBlock.PADDING = {INTER:2, LEFT:2, RIGHT:2, TOP:4, BOTTOM:2};

// class TextBlockContainer {
//   constructor( blocks ) {
//     this.blocks = blocks;
//   }

//   addBlocksFrom(otherContainer) {
//     this.blocks = [...this.blocks, ...otherContainer.blocks];
//     this.updatePositions();
//     otherContainer = null;
//   }

//   updatePositions() {
//     let x = this.blocks[0].r.x;
//     const y = this.blocks[0].y;
//     for( let i = 1; i < this.blocks.length; i++ ) {
//       this.blocks[i].y = y;
//       this.blocks[i].x = x + TextBlock.PADDING.RIGHT + //...
//     }
//   }

//   draw() {
    
//   }
// }