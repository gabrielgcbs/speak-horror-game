/*
SPEAK - is your english good enough to save a life?

@Gabriel Caldas - gabrielgcbs97@gmail.com

PPGTI - Digital game development

What is not fully implement yet: rooms. They're not working properly in this version. 

*/

var current_screen = 1;

// set timer to 15s of duration
var monster_timer;
var max_time = 15;

var font;
var allowRooms = false;
var empty_positions;
var x, y;
var player;
var UI;
var gamerOverUI;
var got_flashlight;
var is_moving = false;
var is_recording;
var moving_speed = 3;
var key_sprite;
var has_key = false;
var flashlight;

var key_message_time = 0;
var flashlight_message_time = 0;
var time_to_show = 1;
var stop_item_message = false;
var possible_responses = [];
var is_on_main_room = true;
var is_out = false;
var is_dead = false;
var game_over_sound;
var sucess_sound;
var key_pickup;
var is_playing_sound;

var ghost_sound;
var ghost_voice;
var ghost_playing_sound = false;

var speechRec;
var speech = null;
var no_speech = false;
var got_to_next_point = false;
var first_move = true;

var path_raw;
var path_points;
var current_point;
var next_point;
var last_point;
var origin_point;
var light_radius;

var tilemaps;
var room_information;
var current_room;

// tilesets
var glass;
var floor_tiles;
var key_img;
var flashlight_img;
var wall_left;
var wall_right;
var wall_top;
var wall_top_corner;
var wall_top_with_door;
var wall_front_bottom;
var wall_front_bottom_middle;
var wall_front_top;
var wall_side_door_1;
var wall_side_door_2;
var wall_side_door_3;
var door_top;
var door_bottom;

var rooms = {};
var bedrooms = []
var entered_reception = false;
var entered_kitchen = false;
var entered_bedroom = false;
var entered_operations_room = false;

var is_on_kitchen_door = false;
var is_on_reception_door = false;
var is_on_operations_room_door = false;
var is_on_bedroom_door = false;
var is_on_exit = false;

var opened_door = false;

var room_position = -1;
var tilemap_visible = true;

// tilemaps
var floors;
var walls_entrance;
var walls_top;
var walls_top_left_corner;
var walls_top_left_bottom_corner;
var walls_top_right_corner;
var walls_top_right_bottom_corner;
var walls_front_top;
var walls_front_bottom_middle;
var room_side_door_1;
var room_side_door_2;
var room_side_door_3;
var room_doors_top;
var room_doors_bottom;
var kitchen_entrance;
var recepction_entrance;
var operations_room_entrance;
var bedroom_entrance;
var entrance;

var room_name;

var tilemaps_list;

var glasses;
var test_mode = false;

var bedroom_option_strings = [
  "Look below the bed",
  "skeleton",
  "wheelchair",
  "nightstand"
]

const player_responses = {
  "go straight ahead": "Going ahead...",
  "turn left": "Ok, turning left",
  "turn right": "Fine, going right",
  "go back": "Going right back"
}

var lightArea_1;
var lightArea_2;

// constants
const KITCHEN = "kitchen";
const RECEPCTION = "repection";
const OPERATIONS_ROOM = "operations_room";
const BEDROOM = "bedroom";
const MAIN_ROOM = "main_room";
const MAIN_ROOM_DOOR = "main_room_door";

class Point {
  constructor(point, origin) {
    this.coord = point.coord;
    this.x = point.coord[0];
    this.y = point.coord[1];
    this.up = point.up;
    this.down = point.down;
    this.right = point.right;
    this.left = point.left;
    
    this.is_locked = point.is_locked;
    this.has_item = false;
    // True if the point has the property and it is set to true
    this.has_wheelchair = point.wheelchair === true
    this.has_bed = point.bed === true
    this.has_skeleton = point.skeleton === true
    this.has_nightstand = point.nightstand === true

    this.abs_x = origin.x + this.x*32;
    this.abs_y = origin.y - this.y*32;
    // points connected next to this point
    this.up_path = null;
    this.down_path = null;
    this.right_path = null;
    this.left_path = null;
  }
  
  setRelatedPath(points) {
    for (const point of points) {
      if (this.coord.join() != point.coord.join()) {
        // Check if there is a point to move vertically
        if (this.x == point.x) {
          if (this.up) {
            // In case the point is closer to the current one, set it as the next path
            // Since on p5, the (0, 0) coordinate is set at the top left of the screen,
            // a greater y means a value closer to the botton
            if (this.up_path != null) {
              this.up_path = (point.y > this.y && point.y < this.up_path.y) ? point : this.up_path;
            }
            // In case there is no point on path yet
            else{
              this.up_path = (point.y > this.y) ? point : null;
            }
          }
          if (this.down) {
            // In case the point is closer to the current one, set it as the next path
            if (this.down_path != null) {
              this.down_path = (point.y < this.y && point.y > this.down_path.y) ? point : this.down_path;
            }
            // In case there is no point on path yet
            else{
              this.down_path = (point.y < this.y) ? point : null;
            }
          }
        }
        // Check if there is a point to move horizontally
        if (this.y == point.y) {
          if (this.left) {
            // In case the point is closer to the current one, set it as the next path
            if (this.left_path != null) {
              this.left_path = (point.x < this.x && point.x > this.left_path.x) ? point : this.left_path;
            }
            // In case there is no point on path yet
            else{
              this.left_path = (point.x < this.x) ? point : null;
            }
          }
  
          if (this.right) {
            // In case the point is closer to the current one, set it as the next path
            if (this.right_path != null) {
              this.right_path = (point.x > this.x && point.x < this.right_path.x) ? point : this.right_path;
            }
            // In case there is no point on path yet
            else{
              this.right_path = (point.x > this.x) ? point : null;
            }
          }
        }        
      }
    }
  }
}

class Timer {
  constructor(duration) {
    this.duration = duration;
    this.current_time = 0;
  }
  count() {
    if (frameCount % 60 == 0 && this.current_time < this.duration) { 
      this.current_time++;
    }
  }
  restart() {
    this.current_time = 0;
  }
  changeDuration(newDuration) {
    this.duration = newDuration;
  }
  isOver() {
    if(this.current_time >= this.duration) {
      this.restart();
      return true;
    }
  }
}

class BedroomPoint extends Point {
  constructor(point, origin) {
    super(point, origin);
    this.on_wheelchair = point.on_wheelchair;
    this.on_bed = point.on_bed;
    this.on_nightstand = point.on_nightstand;
    this.on_skeleton = point.on_skeleton;
    this.on_door = point.on_door;
  }
}

class Bedroom {
  constructor(sprite, items, path, origin) {
    this.sprite = sprite;
    this.has_bed = items.bed;
    this.has_nightstand = items.nightstand;
    this.has_wheelchair = items.wheelchair;
    this.has_skeleton = items.skeleton;
    this.setPoints(path, origin);
  }

  setPoints(path, origin) {
    this.points = []
    for(let path_point of path) {
      const point = new BedroomPoint(path_point, origin)
      point.setRelatedPath(path)
      this.points.push(point);

      if (point.x == 0 && point.y == 0) {
        this.entrance = point;
      }
    }
  }
}

function preload() {
  game_over_sound = loadSound("assets/sounds/scream_horror1.mp3");
  sucess_sound = loadSound("assets/sounds/Lost.m4a");
  key_pickup = loadSound("assets/sounds/key2 pickup.mp3");
  floor_tiles = loadImage('assets/tilesets/floor_tile.png');
  path_raw = loadJson('path.json').points;
  tilemaps = loadJson('tilemap.json').tilemaps;
  room_information = loadJson('rooms.json').bedrooms;
  setOriginPoint();
  loadTilesets();
  loadRooms();
  key_img = loadImage("assets/tilesets/key.png");
  flashlight_img = loadImage("assets/tilesets/torch.png");
  glass = loadImage("assets/tilesets/glass_1.png")
  font = loadFont("assets/fonts/penakut.ttf");
  credits = loadJson("assets/credits/credits.json");
}

function setup() {

  frameRate(60);
  new Canvas();

  monster_timer = new Timer(max_time)

  player = new Sprite(
    x,
    y,
    16,
    16,
  );
  player.addAni('front_idle', "assets/player/front_idle000.png", 1);
  player.addAni('back_idle', "assets/player/back_idle000.png", 1);
  player.addAni('walk_side', "assets/player/walk_side000.png", 3);
  player.addAni('walk_front', "assets/player/walk_front000.png", 3);
  player.addAni('walk_back', "assets/player/walk_back000.png", 3);
  player.frameDelay = 100;
  player.rotationLock = true;
  player.layer = 10;
  player.visible = false;

  got_flashlight = false;
  
  path_points = createPathObjs();
  for (const point in path_points) {
    path_points[point].setRelatedPath(path_points);
  }

  current_point = path_points[0];
  next_point = path_points[0];

  if (!test_mode) {
    speechRec = new p5.SpeechRec('en-US', movePlayer);
    speechRec.continuous = true;
  }

  generateKey();
  generateFlashLight();
  createGroups();
  createTileMap();
  
  walls_top_left_bottom_corner.mirror.y = true;
  walls_top_right_corner.mirror.x = true;
  walls_top_right_bottom_corner.mirror.y = true;
  walls_top_right_bottom_corner.mirror.x = true; 

  toggleVisibility(false);

  player.overlaps(bedroom_entrance, getRoomPosition);

  UI = createGraphics(width, height/4);
  lightArea_1 = createGraphics(width, height);
  lightArea_2 = createGraphics(width, height);
  sucessUI = createGraphics(width, height);
  gamerOverUI = createGraphics(width, height);

  light_radius = lightArea_1.width*0.85;

}

function draw() {
  clear();
  if(current_screen == 1) {
    showMenu();
  }
  else if (current_screen == 2) {
    startGame();
  }
  else if (current_screen == 3) {
    showCredits();
  }
}

function setOriginPoint() {
  x = 12*32;
  y = tilemaps.main_room_walls.length*32-64;

  origin_point = {
    x: x,
    y: y
  }
}

function showMenu() {

  clear();
  background(20);
  let font_size = 80;

  fill(color("rgb(153, 0, 51)"));
  noStroke();
  textFont(font);
  textSize(font_size*2);
  text("SPEAK", width*0.4, height*0.2);
  textSize(font_size*0.7);
  text("Is your english good enough to save a life? ", width*0.25, height*0.3);

  let x_pos1 = 0.4*width;
  let y_pos1 = 0.5*height;
  

  let bbox1 = font.textBounds("Play", x_pos1, y_pos1, font_size);
  if(mouseX > bbox1.x && mouseX < bbox1.x+bbox1.w && mouseY > bbox1.y && mouseY < bbox1.y+bbox1.h) {
    fill(255);
    stroke(0);
    rect(bbox1.x-10, bbox1.y-10, bbox1.w+20, bbox1.h+20);
    fill(0);
    noStroke();
    textFont(font);
    textSize(font_size);
    text("Play", x_pos1, y_pos1);
    if(mouseIsPressed) {
      current_screen = 2;
    }
  }
  else{
    fill(200);
    noStroke();
    textFont(font);
    textSize(font_size);
    text("Play", x_pos1, y_pos1);
  }

  let x_pos2 = 0.4*width;
  let y_pos2 = y_pos1 + bbox1.h+50;
  
  let bbox2 = font.textBounds("Credits", x_pos2, y_pos2, font_size);
  if(mouseX > bbox2.x && mouseX < bbox2.x+bbox2.w && mouseY > bbox2.y && mouseY < bbox2.y+bbox2.h) {
    fill(255);
    stroke(0);
    rect(bbox2.x-10, bbox2.y-10, bbox2.w+20, bbox2.h+20);
    fill(0);
    noStroke();
    textFont(font);
    textSize(font_size);
    text("Credits", x_pos2, y_pos2);
    if(mouseIsPressed) {
      current_screen = 3;
    }
  }
  else {
    fill(200);
    noStroke();
    textFont(font);
    textSize(font_size);
    text("Credits", x_pos2, y_pos2);
  }
}

function startGame() {

  clear();
  background(0);

  monster_timer.count();
  if(monster_timer.isOver() && !is_moving){
    is_dead = true;
  }
  else if(is_moving) {
    monster_timer.restart();
  }

  if(is_out) {
    toggleVisibility(false);
    sucessMessage();
  }
  else if(is_dead) {
    toggleVisibility(false);
    gameOver();
  }
  else {
    player.visible = true;
    player.ani = 'back_idle';
    
    camera.on();

    drawTilemap();
    toggleVisibility(true)

    camera.x = player.x;
    camera.y = player.y;

    camera.zoom = 2.5;

    // JUST FOR TESTING
    if (test_mode) {
      player.speed = moving_speed;
      is_moving = true;
      if (kb.pressing('shift')) {
        player.speed *= 5;
      }
      if (kb.pressing('up')) {
        player.ani = 'walk_back';
        player.direction = -90;
        // player.move('up');
      } else if (kb.pressing('down')) {
        player.ani = 'walk_front';
        player.direction = 90;
        // player.move('down');
      } else if (kb.pressing('left')) {
        player.ani = 'walk_side';
        player.direction = 180;
        // player.move('left');
        player.mirror.x = true;
      } else if (kb.pressing('right')) {
        player.ani = 'walk_side';
        player.direction = 0;
        // player.move('right');
        player.mirror.x = false;
      } else {
        player.speed = 0;
        is_moving = false;
      }
    }
    else {
      if((got_to_next_point || first_move) && !is_recording) {
        speechRec.start();
        is_recording = true;
      }
      // player.draw();
      updatePlayerPosition();
    }

    if (player.speed < 1) {
      player.speed = 0;
    }
  
    if(allowRooms) {
      if(is_on_main_room) {
        renderMainRoom();
        is_on_exit = false;
        room_name = "main_room";
        tilemap_visible = true;
        entered_kitchen = false;
        entered_reception = false;
        entered_operations_room = false;
        entered_bedroom = false;
        opened_door = false;
        mainRoomPossibilities();
      }
      // Inside the bedroom
      if(opened_door) {
        is_on_main_room = false;
        hideMainRoomTilemap();
        enterRoom(room_name, current_room);
      }
    }
    else {
      if(is_on_main_room) {
        renderMainRoom();
        is_on_exit = false;
        room_name = "main_room";
        tilemap_visible = true;
        entered_kitchen = false;
        entered_reception = false;
        entered_operations_room = false;
        entered_bedroom = false;
        opened_door = false;
        // mainRoomPossibilities();
        showOptions(MAIN_ROOM);
      }
    }
    
    if(is_moving) {
      showResponse();
    }
    // KEY
    if(player.overlaps(key_sprite)) {
      key_pickup.play();
      key_sprite.remove();
      has_key = true;
    }
    if(has_key & !stop_item_message) {
      showItemMessage("I found a key!");
      key_message_time += 1;
    }
    if(key_message_time/60 > time_to_show) {
      stop_item_message = true;
    }
    else if(!has_key){
      key_sprite.visible = true;
      key_sprite.draw();
      key_message_time = 0;
    }
  
    // FLASHLIGHT
    if(player.overlaps(flashlight)) {
      key_pickup.play();
      flashlight.remove();
      got_flashlight = true;
      light_radius *= 0.85;
    }
    if(got_flashlight & flashlight_message_time/60 < time_to_show) {
      showItemMessage("I got a better flashlight!");
      flashlight_message_time += 1;
    }
    else if(!got_flashlight){
      flashlight.visible = true;
      flashlight.draw();
      flashlight_message_time = 0;
    }
    
    player.draw();

    camera.off();
    if(got_flashlight) {
      lightArea_1.strokeWeight(light_radius);
      lightArea_1.stroke(20);
      lightArea_1.noFill();
      lightArea_1.circle(lightArea_1.width / 2, lightArea_1.height / 2, lightArea_1.width);
      image(lightArea_1, 0, 0);
    }
    else {
      lightArea_2.strokeWeight(light_radius);
      lightArea_2.stroke(20);
      lightArea_2.noFill();
      lightArea_2.circle(lightArea_2.width / 2, lightArea_2.height / 2, lightArea_2.width);
      image(lightArea_2, 0, 0);
    }
    if(!is_moving) {
      image(UI, 0, 0.75*height);
    }

  }
}

function showCredits() {
  clear();
  background(20);
  textSize(40);
  textWrap(WORD);
  textAlign(CENTER);

  let credits_str = []

  credits_str = fillCredits(credits_str, credits.info);
  credits_str = fillCredits(credits_str, credits.arts);
  credits_str = fillCredits(credits_str, credits.sounds);
  credits_str = fillCredits(credits_str, credits.fonts);

  fill(200);
  text(credits_str, width*0.2, height*0.2, width/2);
}

function returnToMainMenu() {
  current_screen = 1;
}

function fillCredits(credits_str, message_list) {
  for(let txt of message_list) {
    credits_str.push(txt);
    credits_str.push("\n");
  }
  credits_str.push("\n");
  return credits_str;
}

function showItemMessage(msg) {
  let text_string = msg;
  let font_size = 20;
  let bbox = font.textBounds(text_string, player.x-32, player.y-32, font_size);
  fill(255);
  stroke(0);
  rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
  textFont(font);
  textSize(font_size);
  text(text_string, player.x-32, player.y-32);
}

/* ACESSIBLE AREAS */

function getResponse() {
  movePlayer();
}

function unlockRoom() {
  return has_key;
}

function goToLastPoint() {
  next_point = last_point;
  player.moveTo(next_point.abs_x, next_point.abs_y, moving_speed);
}

function sucessMessage() {

  sucessUI.background(50);
  let font_size = 80;

  let x_pos = 0.3*sucessUI.width;
  let y_pos = 0.5*sucessUI.height;
  let sucess_string = "Yeah! You got out safely!"

  let bbox = font.textBounds(sucess_string, x_pos, y_pos, font_size);
  sucessUI.fill(150);
  sucessUI.noStroke();
  sucessUI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
  sucessUI.fill(50);
  sucessUI.noStroke();
  sucessUI.textFont(font);
  sucessUI.textSize(font_size);
  sucessUI.text(sucess_string, x_pos, y_pos);

  image(sucessUI, 0, 0);
  if(!is_playing_sound) {
    playEndingSound(sucess_sound);
    is_playing_sound = true;
  }
}

function gameOver() {
  gamerOverUI.background(25);
  let font_size = 80;

  let x_pos = 0.35*gamerOverUI.width;
  let y_pos = 0.5*gamerOverUI.height;

  let game_over_string = "Oh no... I was too late"

  let bbox = font.textBounds(game_over_string, x_pos, y_pos, font_size);
  gamerOverUI.fill(25);
  gamerOverUI.noStroke();
  gamerOverUI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
  gamerOverUI.fill('red');
  gamerOverUI.noStroke();
  gamerOverUI.textFont(font);
  gamerOverUI.textSize(font_size);
  gamerOverUI.text(game_over_string, x_pos, y_pos);

  image(gamerOverUI, 0, 0);

  if(!is_playing_sound) {
    playEndingSound(game_over_sound);
    is_playing_sound = true;
  }
}

function playEndingSound(song) {
  song.play();
}

function showOptions(room) {
  const options_type = {
    [MAIN_ROOM]: mainRoomOptions,
    [MAIN_ROOM_DOOR]: mainRoomDoorOptions,
    [BEDROOM]: showBedroomOptions,
    [KITCHEN]: showKitchenOptions,
    [RECEPCTION]: showReceptionOptions,
    [OPERATIONS_ROOM]: showOperationsOptions
  }
  options_type[room]();
  return;
}

function questionText() {

  let font_size = 50;
  let x_pos = 0.4*UI.width;
  let y_pos = 0.3*UI.height;

  let question_strings = [
    "What should I do now?",
    "What am I supposed to do now?",
    "Please, tell me where I should head now",
    "Please hurry, I don't know what to do"
  ]
  let bbox = font.textBounds(question_strings[0], x_pos, y_pos, font_size);
  UI.fill(255);
  UI.stroke(0);
  UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
  UI.fill(0);
  UI.noStroke();
  UI.textFont(font);
  UI.textSize(font_size);
  UI.text(question_strings[0], x_pos, y_pos);
}

function mainRoomOptions() {
  UI.background(100);
  let font_size = 30;

  let x_pos = 0.1*UI.width;
  let y_pos = 0.7*UI.height;

  questionText();

  possible_responses = [];

  if(current_point.up) possible_responses.push("go straight ahead");
  if(current_point.left) possible_responses.push("turn left");
  if(current_point.right) possible_responses.push("turn right");
  if(current_point.down) possible_responses.push("go back");
  if(current_point.is_locked) possible_responses.push("unlock the door");

  for(let option of possible_responses) {
    let bbox = font.textBounds(option, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(option, x_pos, y_pos);
    x_pos += bbox.w+50;
  }
}

function mainRoomDoorOptions() {
  UI.background(100);
  let font_size = 30;

  let x_pos = 0.1*UI.width;
  let y_pos = 0.7*UI.height;

  questionText();

  possible_responses = [];

  possible_responses.push("go back");
  possible_responses.push("unlock the door");

  for(let option of possible_responses) {
    let bbox = font.textBounds(option, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(option, x_pos, y_pos);
    x_pos += bbox.w+50;
  }
}

function showBedroomOptions() {
  UI.background(100);
  let font_size = 30;

  let bed_string = bedroom_option_strings[0];
  let skeleton_string = bedroom_option_strings[1];
  let wheelchair_string = bedroom_option_strings[2];
  let nightstand_string = bedroom_option_strings[3];

  let x_pos = 0.1*UI.width;
  let y_pos = 0.7*UI.height;

  questionText();

  if(current_room.has_bed) {
    let bbox = font.textBounds(bed_string, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(bed_string, x_pos, y_pos);

    x_pos += bbox.w+50;

  }
  if(current_room.has_skeleton) {
    let bbox = font.textBounds(skeleton_string, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(skeleton_string, x_pos, y_pos);
    
    x_pos += bbox.w+50;
  }
  if(current_room.has_wheelchair) {
    let bbox = font.textBounds(wheelchair_string, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(wheelchair_string, x_pos, y_pos);

    x_pos += bbox.w+50;
  }
  if(current_room.has_nightstand) {
    let bbox = font.textBounds(nightstand_string, x_pos, y_pos, font_size);
    UI.fill(255);
    UI.stroke(0);
    UI.rect(bbox.x-10, bbox.y-10, bbox.w+20, bbox.h+20);
    UI.fill(0);
    UI.noStroke();
    UI.textFont(font);
    UI.textSize(font_size);
    UI.text(nightstand_string, x_pos, y_pos);

    x_pos += bbox.w+50;
  }
}

function showKitchenOptions() {

}

function showReceptionOptions() {

}

function showOperationsOptions() {

}

function toggleVisibility(visible) {
  if (tilemap_visible) {
    for(let tilemap of tilemaps_list) {
      tilemap.visible = visible;
    }
  }
  return;
}

// TESTANDO PARA SABER A POSIÇÃO DA ENTRADA E EXIBIR O QUARTO

function getRoomPosition(player, entrance) {
  for(i in bedroom_entrance) {
    if(bedroom_entrance[i].idNum == entrance.idNum) {
      room_position = parseInt(i);
      break;
    }
  }
}

function selectBedroom(room_position) {
  if(bedrooms[room_position] == -1) {
    let random_room = 0; 
    do {
      // get a random bedroom image
      random_room = Math.round(random(0, bedrooms.length-1));
    } while(bedrooms.includes(random_room));

    // place the new room in the respective position
    // so each time the game is run, a random order
    // of bedrooms is loaded, but the order doesn't
    // change on a single play.
    bedrooms[room_position] = rooms["bedrooms"][random_room];
  }
  return bedrooms[room_position];
}

function renderMainRoom() {
  if(!tilemap_visible) {
    player.x = last_point.abs_x;
    player.y = last_point.abs_y;
    createTileMap();
  }

  return;
}

function mainRoomPossibilities() {
  if(player.overlapping(kitchen_entrance) !=0) {
    last_point = current_point;
    isOnRoom(KITCHEN);
    showOptions(KITCHEN);
  }
  else if(player.overlapping(recepction_entrance) !=0) {
    last_point = current_point;
    isOnRoom(RECEPCTION);
    showOptions(RECEPCTION);
  }
  else if(player.overlapping(operations_room_entrance) !=0) {
    last_point = current_point;
    isOnRoom(OPERATIONS_ROOM);
    showOptions(OPERATIONS_ROOM);
  }
  else if(player.overlapping(bedroom_entrance) !=0) {
    is_moving = false;
    last_point = current_point;
    current_room = selectBedroom(room_position);
    room_name = BEDROOM;
    isOnRoom(BEDROOM);
    showOptions(MAIN_ROOM_DOOR);
  }
  else if(!is_moving)  {
    showOptions(MAIN_ROOM);
  }
}

function isOnRoom(room_name) {
  let rooms = {
    [KITCHEN]: onKitchenDoor,
    [RECEPCTION]: onRecepctionDoor,
    [OPERATIONS_ROOM]: onOperationsRoom,
    [BEDROOM]: onBedroomDoor
  }
  rooms[room_name]();
}

function onKitchenDoor() {
  is_on_kitchen_door = true;
  is_on_bedroom_door = false;
  is_on_operations_room_door = false;
  is_on_reception_door = false;
}

function onRecepctionDoor() {
  is_on_kitchen_door = false;
  is_on_bedroom_door = false;
  is_on_operations_room_door = false;
  is_on_reception_door = true;
}

function onOperationsRoom() {
  is_on_kitchen_door = false;
  is_on_bedroom_door = false;
  is_on_operations_room_door = true;
  is_on_reception_door = false;
}

function onBedroomDoor() {
  is_on_kitchen_door = false;
  is_on_bedroom_door = true;
  is_on_operations_room_door = false;
  is_on_reception_door = false;
}

function enterRoom(room, bedroom_to_load) {
  if(room == "bedroom") {
    let room = drawBedroom(bedroom_to_load);
    entered_bedroom = true;
    return room;
  }

  drawRoom(room);
  return;
}

function getRoomCoordinates() {
  let x_image = 8*30;
  let y_image = 7*30;
  return [x_image, y_image];
}

function getNewPlayerPosition(x_pos, y_pos, room) {
  let player_x = x_pos + room.width-64;
  let player_y = y_pos + room.height/1.7;
  return [player_x, player_y];
}

function drawBedroom(room) {
  let [x_image, y_image] = getRoomCoordinates();
  image(room.sprite, x_image, y_image);
  if(!entered_bedroom) {
    let [player_x, player_y] = getNewPlayerPosition(x_image, y_image, room.sprite);
    player.x = player_x;
    player.y = player_y;
    current_point = current_room.entrance;
    next_point = current_point;
  }
  return room;
}

function drawRoom(room_name) {
  let [x_image, y_image] = getRoomCoordinates();
  let room = rooms[room_name];
  image(room, x_image, y_image);
  // if player is not on any room yet
  if(!(entered_kitchen || entered_operations_room || entered_reception)) {
    let [player_x, player_y] = getNewPlayerPosition(x_image, y_image, room);
    player.x = player_x;
    player.y = player_y;
  }

  entered_kitchen = is_on_kitchen_door;
  entered_operations_room = is_on_operations_room_door;
  entered_reception = is_on_reception_door;

  return;
}

/* FUNCTIONS */

function loadJson(path) {
  /**
   * Load the JSON file containing the path points 
   */
  var request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send(null);
  return JSON.parse(request.responseText);
}

function drawTilemap() {
  for(let tilemap of tilemaps_list) {
    tilemap.draw();
  }
  return;
}

function createPathObjs(){
  /**
   * Create a Point object for every point data in path
   */
  let obj_array = []
  for (const point in path_raw) {
    let p = new Point(path_raw[point], origin_point);
    obj_array.push(p);
  }
  return obj_array;
}

function updatePlayerPosition() {
  /**
   *  Set the player position as the current point it is at
   */
  if ((player.x == next_point.abs_x && player.y == next_point.abs_y && !first_move) || entered_bedroom) {
    current_point = next_point;
    is_moving = false;
    got_to_next_point = true;
    showOptions(MAIN_ROOM);

  }
  return;
}

function generateKey() {
  let item_position = 0
  do{
    item_position = Math.round(random(path_points.length/2, path_points.length-1))
  } while(path_points[item_position].has_item == true);
  
  path_points[item_position].has_item = true;
  key_sprite = new Sprite(key_img, path_points[item_position].abs_x, path_points[item_position].abs_y);
  player.overlaps(key_sprite);
  key_sprite.visible = false;
  return;
}

function generateFlashLight() {
  let item_position = 0
  do{
    item_position = Math.round(random(path_points.length/4, path_points.length/2))
  } while(path_points[item_position].has_item == true);
  
  path_points[item_position].has_item = true;
  flashlight = new Sprite(flashlight_img, path_points[item_position].abs_x, path_points[item_position].abs_y);
  player.overlaps(flashlight);
  flashlight.visible = false;
  return;
}


function loadTilesets() {
  wall_front_top = loadImage("assets/tilesets/wall_front_1.png");
  wall_front_bottom = loadImage("assets/tilesets/wall_front_2.png");
  wall_front_bottom_middle = loadImage("assets/tilesets/wall_front_2_middle.png");
  wall_top = loadImage("assets/tilesets/wall_top.png");
  wall_top_corner = loadImage("assets/tilesets/wall_top_corner.png");
  wall_top_with_door = loadImage("assets/tilesets/wall_top_door.png");
  wall_side_door_1 = loadImage("assets/tilesets/door_top_1.png");
  wall_side_door_2 = loadImage("assets/tilesets/door_top_2.png");
  wall_side_door_3 = loadImage("assets/tilesets/door_top_3.png");
  door_top = loadImage("assets/tilesets/door_1.png");
  door_bottom = loadImage("assets/tilesets/door_2.png");
  return;
}


function loadRooms() {
  rooms['bedrooms'] = [];
  for (let i=1; i<=8; i++) {
    const room_img = loadImage("assets/rooms/room_"+i+".png");
    const room_items = room_information[i-1].items;
    const room_path = room_information[i-1].path;
    const room = new Bedroom(room_img, room_items, room_path, origin_point);
    rooms['bedrooms'].push(room);
    // Fill array with 0s with length equals to the number of bedrooms
    bedrooms.push(-1);
  }
  rooms["kitchen"] = loadImage("assets/rooms/kitchen.png");
  rooms["reception"] = loadImage("assets/rooms/reception.png");
  rooms["operations_room"] = loadImage("assets/rooms/operations_room.png");
  return;
}

function startRecording() {
  speechRec.start();
  is_recording = true;
  return;
}

function stopRecording() {
  speechRec.stop();
  is_recording = false;
  return;
}

function movePlayer() {

  got_to_next_point = false;
  speech = speechRec.resultString;
  // speech comes with a period after the sentence, so we can remove it
  // also, remove uppercase from speech
  speech = speech.replace('.', '').toLowerCase();
  is_moving = true;
  console.log(speech);

  if (possible_responses.includes(speech)) {
    no_speech = true;
    // NOT BEING USED
    if(speech == 'unlock the door') {
      if(room_name == "main_room") {
        is_out = true;
      }
      else {
        opened_door = true;
        is_on_main_room = false;
        got_to_next_point = true;
      }
      is_moving = false;
      speechRec.stop();
      return;
    }
    // BEING USED
    else if(speech == 'go straight ahead' && current_point.up) {
      player.ani = 'walk_back';
      player.direction = -90;
      next_point = current_point.up_path;
    }
    else if(speech == 'go back' && current_point.down) {
      player.ani = 'walk_front';
      player.direction = 90;
      next_point = current_point.down_path;
    }
    else if(speech == 'turn left' && current_point.left) {
      player.ani = 'walk_side';
      player.direction = 180;
      player.mirror.x = true;
      next_point = current_point.left_path;
    }
    else if(speech == 'turn right' && current_point.right) {
      player.ani = 'walk_side';
      player.direction = 0;
      player.mirror.x = false;
      next_point = current_point.right_path;
    }
  }
  else {
    player.speed = 0;
    console.log("sorry, can't move");
    no_speech = true;
    is_moving = false;
  }
  if (is_moving) {
    player.moveTo(next_point.abs_x, next_point.abs_y, moving_speed);
    first_move = false;
    stopRecording();
    showResponse();
  }  

  return;
}

function showResponse() {
  let font_size = 10;
  let x_pos = player.x - 16;
  let y_pos = player.y - 16;

  const response = player_responses[speech];

  let bbox = font.textBounds(response, x_pos, y_pos, font_size);
  fill(255);
  stroke(0);
  rect(bbox.x-5, bbox.y-5, bbox.w+5, bbox.h+5);
  fill(0);
  noStroke();
  textFont(font);
  textSize(font_size);
  text(response, x_pos, y_pos);
}

function configTileGroup(tileset, img, tile, layer=0, static=true) {
  tileset.h = img.height;
  tileset.w = img.width;
  tileset.addImg(img);
  tileset.tile = tile;
  tileset.layer = layer;
  if(static) {
    tileset.static = true;
  }
  return tileset
}

function createEntrance(tile) {
  let entrance = new Group();
  entrance.w = 32;
  entrance.h = 32;
  entrance.visible = false;
  entrance.tile = tile;
  entrance.layer = 0;
  player.overlaps(entrance);
  return entrance;
}

function createGroups() {
  floors = new Group();
  glasses = new Group();
  walls_top = new Group();
  walls_entrance = new Group();
  walls_front_top = new Group();
  walls_front_bottom_middle = new Group();
  walls_top_left_corner = new Group();
  walls_top_right_corner = new Group();
  walls_top_left_bottom_corner = new Group();
  walls_top_right_bottom_corner = new Group();
  room_side_door_1 = new Group();
  room_side_door_2 = new Group();
  room_side_door_3 = new Group();
  room_doors_top = new Group();
  room_doors_bottom = new Group();
}

function createTileMap() {
  floors = configTileGroup(floors, floor_tiles, "H", 0, static=false);
  floors.collider = 'none';

  glasses = configTileGroup(glasses, glass, "o")

  walls_top = configTileGroup(walls_top, wall_top, "|", player.layer+1);
  
  walls_entrance = configTileGroup(walls_entrance, wall_top_with_door, "E", player.layer+1);

  walls_front_top = configTileGroup(walls_front_top, wall_front_top, "n");

  walls_front_bottom_middle = configTileGroup(walls_front_bottom_middle, wall_front_bottom_middle, "m", 0, static=false);
  walls_front_bottom_middle.collider = 'none';
  // corner walls
  walls_top_left_corner = configTileGroup(walls_top_left_corner, wall_top_corner, "(", player.layer+1);

  walls_top_right_corner = configTileGroup(walls_top_right_corner, wall_top_corner, ")", player.layer+1);
  
  walls_top_left_bottom_corner = configTileGroup(walls_top_left_bottom_corner, wall_top_corner, "[", player.layer+1);

  walls_top_right_bottom_corner = configTileGroup(walls_top_right_bottom_corner, wall_top_corner, "]", player.layer+1);

  room_side_door_1 = configTileGroup(room_side_door_1, wall_side_door_1, "^");

  room_side_door_2 = configTileGroup(room_side_door_2, wall_side_door_2, "=");

  room_side_door_3 = configTileGroup(room_side_door_3, wall_side_door_3, ";", player.layer+1);

  room_doors_top = configTileGroup(room_doors_top, door_top, "d");

  room_doors_bottom = configTileGroup(room_doors_bottom, door_bottom, "D", 0, static=false);
  room_doors_bottom.collider = 'none';

  entrance = createEntrance("e");
  kitchen_entrance = createEntrance("+");
  recepction_entrance = createEntrance("?");
  operations_room_entrance = createEntrance("O");
  bedroom_entrance = createEntrance("r");


  tilemaps_list = [
    floors, glasses, walls_top, walls_entrance, walls_front_top, walls_front_bottom_middle, walls_top_left_corner, walls_top_right_corner, walls_top_left_bottom_corner, walls_top_right_bottom_corner, room_side_door_1, room_side_door_2, room_side_door_3, room_doors_top, room_doors_bottom
  ]

	new Tiles(
    tilemaps.main_room_floor,
    0,
    0,
    32,
    32
  );
  new Tiles(
		tilemaps.main_room_walls,
		0,
		0,
		32,
		32
	);

  return;
}

function hideMainRoomTilemap() {
  for(let tilemap of tilemaps_list) {
    tilemap.remove();
  }
}