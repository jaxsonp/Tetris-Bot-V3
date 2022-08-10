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


const w = 10;
const h = 22;
const scl = 30;
const autodrop_piece = true;
const player_control = false;

//temp
const drop_speed = 20;

const piece_colors = [
  [0, 0, 0, 255],
  [50, 230, 230, 255],
  [230, 230, 50, 255],
  [230, 50, 230, 255],
  [50, 230, 50, 255],
  [230, 50, 60, 255],
  [50, 70, 230, 255],
  [230, 125, 50, 255],
];

const piece_letters = [
  "",
  "I",
  "O",
  "T",
  "S",
  "Z",
  "J",
  "L"
];

let dropping_piece = {
  x: 0,
  y: 0,
  type: 1,
  rotation: 0,
};


let grid = [];
let queue = [];
let t = 0;
let held_piece = 0;
let game_over = false;
let lines_cleared = 0;
let score = 0;


// ai stuff
let input_sequences = [];



function setup() {
  createCanvas((w + 6) * scl, (h + 0) * scl);
  colorMode(RGB, 255)
  frameRate(60);

  for (let y = 0; y < h; y++) {
    grid[y] = []
    for (let x = 0; x < w; x++) {
      grid[y][x] = 0
    }
  }

  // initializing queue
  while (queue.length < 7) {
    new_piece = floor(random(1, 8))

    for (let i = 0; i < queue.length; i++) {
      if (queue[i] == new_piece) {
        new_piece = 0
      }
    }
    if (new_piece != 0) {
      queue.push(new_piece)
    }
  }


  // spawning first piece
  spawn_piece(queue.pop());



  //generating input sequences

  let spin_combos = [];
  for (let i = 0; i < 4; i++) {
    let seq = [];
    for (let j = 0; j < i; j++) {
      seq.push('spin');
    }
    spin_combos.push(seq);
  }

  let shift_combos = [[]];
  for (let i = 1; i <= 5; i++) {
    let seq = [];
    for (let j = 0; j < i; j++) {
      seq.push('left');
    }
    shift_combos.push(seq);
    seq = [];
    for (let j = 0; j < i; j++) {
      seq.push('right');
    }
    shift_combos.push(seq);
  }

  for (let i = 0; i < spin_combos.length; i++) {
    for (let j = 0; j < shift_combos.length; j++) {

      if (spin_combos[i].length % 2 == 0 && j == 4) {// optimizing
        continue;
      }
      input_sequences.push(spin_combos[i].concat(shift_combos[j]));
      input_sequences.push(["hold"].concat(spin_combos[i], shift_combos[j]));
    } 
  }
  print(input_sequences)
  
}

function draw() {

  if (queue.length <= 6) {
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
    queue = new_bag.concat(queue)
  }


  // autodropping
  if (t % drop_speed == 0 && autodrop_piece && !game_over) {
    drop_piece();
  }


  validate_dropping_piece()

  // ai stuff
  if ()
    inputs = analyze_inputs();
    


  // drawing
  background(50);
  
  // grid based stuffs
  push();
  translate(scl, -scl);

  noStroke();
  fill(70);
  rect(0, 0, w * scl, h * scl);

  // gridlines
  /*stroke(50);
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
        
        fill(piece_colors[c]);
        rect(x * scl, y * scl, scl, scl);
      } else if (c > 0) {

        fill(piece_colors[c * 10])
        rect(x * scl, y * scl, scl, scl);
      }
    }
  }
  
  //draw piece center point
  /*fill(255);
  ellipse(dropping_piece.x * scl, dropping_piece.y * scl, scl / 2, scl / 2);*/

  pop();

  noStroke();
  fill(50);
  rect(scl, 0, scl * w, scl);// top bar

  //hold
  fill(100);
  rect(scl * (w + 2.5), scl * 1.5, scl * 2, scl * 2, scl / 3);

  fill(piece_colors[held_piece]);
  stroke(piece_colors[held_piece]);
  strokeWeight(3);
  textSize(scl * 1.5);
  textAlign(CENTER, CENTER);
  text(piece_letters[held_piece], scl * (w + 3.5), scl * 2.625);
  fill(240);
  noStroke();
  textAlign(CENTER, BOTTOM);
  textSize(scl * 0.75);
  text("Held:", scl * (w + 3.5), scl * 1.5)

  // queue
  textSize(scl * 0.6);
  text("Next:", scl * (w + 3.5), scl * 5)
  for (let i = 0; i < 6; i++) {
    fill(100);
    noStroke();
    rect(scl * (w + 2.75), scl * (5.1 + i * 1.75), scl * 1.5, scl * 1.5, scl / 4);
    fill(piece_colors[queue[queue.length - 1 - i]]);
    stroke(piece_colors[queue[queue.length - 1 - i]]);
    strokeWeight(scl / 15);
    textSize(scl * 1.25);
    textAlign(CENTER, CENTER);
    text(piece_letters[queue[queue.length - 1 - i]], scl * (w + 3.5), scl * (5.9 + i * 1.75) );
  }

  // scores
  fill(100);
  noStroke();
  rect(scl * (w + 1.5), scl * 17, scl * 4, scl, scl / 4);
  rect(scl * (w + 1.5), scl * 18.5, scl * 4, scl, scl / 4);
  textSize(scl * 0.7);
  fill(240);
  text("Lines: " + String(lines_cleared), scl * (w + 3.5), scl * 17.55)
  text("Score: " + String(score), scl * (w + 3.5), scl * 19.05)

  // gameover text
  if (game_over) {
    fill(240);
    stroke(240, 50, 60);
    strokeWeight((height + width) / 200)
    rect(width / 4, (height / 2) - (height / 16), width / 2, height / 8, (width + height) / 20);
    fill(240, 50, 60);
    noStroke();
    textSize((width + height) / 30)
    text("Game over", width / 2, height / 2);
  }

  t += 1;
}










function analyze_inputs () {
  // copying game state
  let og_grid = [];
  for (let y = 0; y < grid.length; y++) {
    og_grid[y] = [];
    for (let x = 0; x < grid[y].length; x++) {
      og_grid[y][x] = grid[y][x];
    }
  }
  let og_dropping_piece = dropping_piece;
  let og_queue = [];
  for (i = 0; i < queue.length; i++) {
    og_queue[i] = queue[i];
  }

  for (let i = 1; i < input_sequences.length; i++) {

    let seq = input_sequences[i];
    print("Executing seq #" + i + ": " + String(seq))
    for (let j = 0; j < seq.length; j++) {
      //print("instruction " + String(j))
      switch (seq[j]) {
        case "left":
          //print("shifting left");
          shift_piece('left');
          break;
        case "right":
          //print("shifting right");
          shift_piece('right');
          break;
        case "spin":
          //print("rotating");
          rotate_piece();
          break;
        case "hold":
          //print("holding");
          hold();
          break;
        default:
          print("!!! Unrecognized instruction");
          break;
      }
    }
    //print("harddropping");
    harddrop_piece();
    print("Done executing")

    // score grid here <<<<<<<<<<<<
  
    //print(queue);
    // restoring og game state
    grid = [];
    for (let y = 0; y < og_grid.length; y++) {
      grid[y] = [];
      for (let x = 0; x < og_grid[y].length; x++) {
        grid[y][x] = og_grid[y][x];
      }
    }
    dropping_piece = og_dropping_piece;
    queue = []
    for (let j = 0; j < og_queue.length; j++) {
      queue[j] = og_queue[j];
    }
    
  }
}













function spawn_piece(piece) {
  //print('Spawning: ' + String(piece));
  piece = 
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
  return true;
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

function harddrop_piece () {
  while(!drop_piece()){ }
  return true;
}

function drop_piece() {
  
  dropping_piece.y += 1;
  let consecutive_lines_cleared = 0;
  
  if (!validate_dropping_piece()) {
    dropping_piece.y -= 1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        
        // placing dropped piece
        if (grid[y][x] < 1 && grid[y][x] > 0) {
          grid[y][x] = grid[y][x] * 10;
        }

      }
    }
    
    // checking for full rows
    old_grid = grid;
    grid = [];
    new_rows = [];
    
    for (let y = 0; y < h; y++) {

      full = true;
      for (let x = 0; x < w; x++) {
        if (old_grid[y][x] == 0) {
          full = false;
          break;
        }
      }
      if (full) {
        
        new_rows.push([]);
        for (let x = 0; x < w; x++) {
          new_rows[new_rows.length - 1][x] = 0;
        }
        lines_cleared += 1;
        consecutive_lines_cleared += 1;
      } else {

        grid.push(old_grid[y]);
      }

    }
    grid = new_rows.concat(grid);

    switch (consecutive_lines_cleared) {
      case 1:
        score += 1;
        break;
      case 2:
        score += 3;
        break;
      case 3:
        score += 5;
        break;
      case 4:
        score += 8;
        break;
      default:
        break;
    }
    spawn_piece(queue.pop());

    let above_ceiling = false;
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x] >= 1) {
          above_ceiling = true;
          break;
        }
      }
      if (above_ceiling) break;
    }
    if (above_ceiling) {
      game_over = true;
      print("Game over")
    }
    return true;
  }
  return false;
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


  for (let i = 0; i < cells_to_change.length; i++) {
    // checkin for wall collision
    if (dropping_piece.x + cells_to_change[i][0] >= 10 || dropping_piece.x + cells_to_change[i][0] < 0) {
      return false;
    }
    // checkin for floor collision
    if (dropping_piece.y + cells_to_change[i][1] > 21) {
      return false;
    }
    // checking if spots are empty
    if (grid[dropping_piece.y + cells_to_change[i][1]][dropping_piece.x + cells_to_change[i][0]] >= 1) {
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

function hold () {

  piece = held_piece;
  held_piece = dropping_piece.type;
  if (piece > 0) {
    spawn_piece(piece);
  } else {
    spawn_piece(queue.pop());
  }
  return true;
}


function keyPressed () {
  print (keyCode)
  if (!game_over && player_control) {
    switch (keyCode) {
      case 16:// shift
        hold();
        break;
      case 27:
        game_over = true;
      case 32:// space
        harddrop_piece();
        break;
      case 37:// <-
        shift_piece("left");
        break;
      case 38:// ^
        rotate_piece("right");
        break;
      case 39: // ->
        shift_piece("right");
        break;
      case 40:// v
        drop_piece();
        break;
      default:
        break;
    }
  }
}