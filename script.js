/*
0: nothin
1: i (cyan)
2: o (yellow)
3: t (purple)
4: s (green)
5: z (red)
6: j (blue)
7: l (orange)
*/


const w = 10
const h = 22
const scl = 25

const piece_colors = [
  [0, 0, 0, 255],
  [50, 230, 230, 255],
  [230, 230, 50, 255],
  [230, 50, 230, 255],
  [50, 230, 50, 255],
  [230, 50, 50, 255],
  [50, 50, 230, 255],
  [230, 125, 50, 255],
]

let dropping_piece = {
  x: 0,
  y: 0,
  type: 1,
  rotation: 0,
}


let grid = []
let queue = []



function setup() {
  createCanvas((w + 6) * scl, (h + 0) * scl);
  colorMode(RGB, 255)

  for (let y = 0; y < h; y++) {
    grid[y] = []
    for (let x = 0; x < w; x++) {
      grid[y][x] = 0
    }
  }

  spawn_piece(floor(random(1, 8)))
  queue.push(floor(random(1, 8)))
  while (queue[0] == dropping_piece.type) {
    queue[0] = floor(random(1, 8))
  }
}

function draw() {

  if (queue.length <= 1) {
    new_bag = []
    while (new_bag.length < 7) {
      new_piece = floor(random(1, 8))

      for (let i = 0; i < new_bag.length; i++) {
        if (new_bag[i] == new_piece) {
          new_piece = 0
        }
      }
      if (new_piece != 0) {
        new_bag.push(new_piece)
      }
    }
    queue = queue.concat(new_bag)
  }
  print(queue)


  validate_dropping_piece()


  // drawing
  background(50);
  
  // grid based stuffs
  push();
  translate(scl, -scl);

  noStroke();
  fill(70);
  rect(0, 0, w * scl, h * scl);

  /*stroke(65);
  strokeWeight(1);
  for (let y = 0; y < h; y++) {
    line(0, y * scl, w * scl, y * scl)
  }
  for (let x = 0; x < w; x++) {
    line(x * scl, 0, x * scl, h * scl)
  }*/
  
  noStroke();
  for (let y = 0; y < h; y++) {

    for (let x = 0; x < w; x++) {
      let c = grid[y][x] 
      if (c >= 1) {
        
        fill(piece_colors[c])
        rect(x * scl, y * scl, scl, scl)
      } else if (c > 0) {

        fill(piece_colors[c * 10])
        rect(x * scl, y * scl, scl, scl)
      }
    }
  }

  fill(255);
  ellipse(dropping_piece.x * scl, dropping_piece.y * scl, scl / 2, scl / 2)

  pop();
}




function spawn_piece(piece) {

  dropping_piece.type = piece;
  dropping_piece.rotation = 0;
  switch (piece) {
    case 1:   
      dropping_piece.x = 5;
      dropping_piece.y = 2;
      break;
    case 2:   
        dropping_piece.x = 5;
        dropping_piece.y = 1;
        break;
    default:
      dropping_piece.x = 4.5;
      dropping_piece.y = 1.5;
      break;
  }
  return;
}

function rotate_piece(direction="right") {

  if (direction == "right") {

    dropping_piece.rotation += 1;
    dropping_piece.rotation = dropping_piece.rotation % 4;
    if (!validate_dropping_piece()) {
      dropping_piece.x += 1;
      if (!validate_dropping_piece()) {
        dropping_piece.x -= 2;
        if (!validate_dropping_piece()) {
          //rotation failed
          dropping_piece.x += 1;
          dropping_piece.rotation -= 1;
        }
      }
    }
  } else {

    dropping_piece.rotation -= 1;
    dropping_piece.rotation = dropping_piece.rotation % 4;
    if (!validate_dropping_piece()) {
      dropping_piece.x += 1;
      if (!validate_dropping_piece()) {
        dropping_piece.x -= 2;
        if (!validate_dropping_piece()) {
          //rotation failed
          dropping_piece.x += 1;
          dropping_piece.rotation += 1;
        }
      }
    }
  }
  return;
}

function shift_piece(direction) {

  if (direction == "right") {
    dropping_piece.x += 1;
    // checking if valid and undoing
    if (!validate_dropping_piece()) {
      dropping_piece.x -= 1;
    }
  } else {
    dropping_piece.x -= 1;
    // checking if valid and undoing
    if (!validate_dropping_piece()) {
      dropping_piece.x += 1;
    }
  }
}

function drop_piece() {
  dropping_piece.y += 1;
  validate_dropping_piece();
  return;
}

function validate_dropping_piece () {
  cells_to_change = []
  switch (dropping_piece.type) {
    case 1:
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([-2, -1]);
          cells_to_change.push([-1, -1]);
          cells_to_change.push([0, -1]);
          cells_to_change.push([1, -1]);
          break;
        case 1:
          cells_to_change.push([0, -2]);
          cells_to_change.push([0, -1]);
          cells_to_change.push([0, 0]);
          cells_to_change.push([0, 1]);
          break;
        case 2:
          cells_to_change.push([-2, 0]);
          cells_to_change.push([-1, 0]);
          cells_to_change.push([0, 0]);
          cells_to_change.push([1, 0]);
          break;
        case 3:
          cells_to_change.push([-1, -2]);
          cells_to_change.push([-1, -1]);
          cells_to_change.push([-1, 0]);
          cells_to_change.push([-1, 1]);
          break;
        default:
          break;
      }
      break;
    case 2:
      
      cells_to_change.push([-1, -1]);
      cells_to_change.push([-1, 0]);
      cells_to_change.push([0, -1]);
      cells_to_change.push([0, 0]);
      break;
    case 3:
      cells_to_change.push([-0.5, -0.5]);
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -0.5]);
          break;
        case 1:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -0.5]);
          break;
        case 2:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([0.5, -0.5]);
          break;
        case 3:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([-1.5, -0.5]);
          break;
        default:
          break;
      }
      break;
    case 4:
      cells_to_change.push([-0.5, -0.5]);
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -1.5]);
          break;
        case 1:
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([0.5, 0.5]);
          break;
        case 2:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-1.5, 0.5]);
          break;
        case 3:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-1.5, -1.5]);
          break;
        default:
          break;
      }
      break;
    case 5:
      cells_to_change.push([-0.5, -0.5]);
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-1.5, -1.5]);
          break;
        case 1:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([0.5, -1.5]);
          break;
        case 2:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([0.5, 0.5]);
          break;
        case 3:
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([-1.5, 0.5]);
          break;
        default:
          break;
      }
      break;
    case 6:
      cells_to_change.push([-0.5, -0.5]);
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-1.5, -1.5]);
          break;
        case 1:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, -1.5]);
          break;
        case 2:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([0.5, 0.5]);
          break;
        case 3:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([-1.5, 0.5]);
          break;
        default:
          break;
      }
      break;
    case 7:
      cells_to_change.push([-0.5, -0.5]);
      switch (dropping_piece.rotation) {
        case 0:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([0.5, -1.5]);
          break;
        case 1:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([0.5, 0.5]);
          break;
        case 2:
          cells_to_change.push([0.5, -0.5]);
          cells_to_change.push([-1.5, -0.5]);
          cells_to_change.push([-1.5, 0.5]);
          break;
        case 3:
          cells_to_change.push([-0.5, 0.5]);
          cells_to_change.push([-0.5, -1.5]);
          cells_to_change.push([-1.5, -1.5]);
          break;
        default:
          break;
      }
      break;
    
    default:
      break;
  }

  // checking if spots are empty
  for (let i = 0; i < cells_to_change.length; i++) {
    if (grid[dropping_piece.y + cells_to_change[i][1]][dropping_piece.x + cells_to_change[i][0]] >= 1) {
      return false;
    }
    if (dropping_piece.x + cells_to_change[i][0] >= 10 || dropping_piece.x + cells_to_change[i][0] < 0) {
      return false;
    }
  }
  

  // writing dropping piece to grid
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] > 0 && grid[y][x] < 1) {
        grid[y][x] = 0;
      }
    }
  }
  for (let i = 0; i < cells_to_change.length; i++) {
    grid[dropping_piece.y + cells_to_change[i][1]][dropping_piece.x + cells_to_change[i][0]] = dropping_piece.type / 10;
  }
  return true
}


function keyPressed () {
  print (keyCode)
  switch (keyCode) {
    case 37:
      shift_piece("left");
      break;
    case 38:
      rotate_piece("right");
      break;
    case 39:
      shift_piece("right");
      break;
    case 40:
      drop_piece();
      break;
    default:
      break;
  }
}