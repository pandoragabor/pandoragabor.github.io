window.bind = function(callerObj, method) {
	if (callerObj == null || method == null)
		console.error("neither caller nor method may be null");

	var f = function() {
		return method.apply(callerObj, arguments);
	};
	// Store the caller as a property on the function so that we can retrieve it later if needed
	f['_caller'] = callerObj;
	return f;
};

var PI = 3.14159;

function deg2rad(degrees) {
    return degrees * (PI / 180.0);
}

function rad2deg(radians) {
    return radians * (180.0 / PI)
}

var SHIP_COLOR = 0xB02B2C;
var BULLET_COLOR = 0xD15600;
var TUNNEL_COLOR = [0xa77810, 0x261500];
var RATE_OF_FIRE = 50;
var BULLET_SPEED = 1.5;
var LAND_RESOLUTION = 50.0;
var SPEED = 0.5;
// 0-1
var GAME_VOLUME = 0.3;
var GAME_FX_VOLUME = 0.65;
if(document.location.hostname == "localhost") {
    GAME_VOLUME = 0;
    GAME_FX_VOLUME = 0.25;
}


function Bounce() {
    this.fps_counter = 0;
	this.fps_start = Date.now();
    this.last_bullet = 0;
    this.bullets = [];
    this.last_now = 0;
    this.level = -1;
    this.level_start = null;
    this.level_state = 0;
    this.wave = 0;
    this.group_indexes = null;
    this.wave_start = null;
    this.enemies = [];
    this.score = 0;
    this.shields = 100;
    this.fxs = [];
    this.last_collision = 0;
}

Bounce.start = function() {
    window.bounce = new Bounce();
    window.bounce.init();
    window.bounce.animate();
};

Bounce.prototype.init = function() {
    this.renderer = new THREE.WebGLRenderer();
//    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    //
    this.camera = new THREE.OrthographicCamera(
            window.innerWidth / - 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerHeight / - 2,
        - 500,
        1000 );
    this.camera.position.z = 400;

    this.scene = new THREE.Scene();
    this.ship = this.create_ship();
    this.tunnel = new Tunnel(this.scene, 0);
    this.tunnel2 = new Tunnel(this.scene, 1);

    // debris field
    this.debris = Effect.create_effect("debris");
    this.fxs.push(this.debris);
    this.scene.add(this.debris.particles);

    this.scene.add(this.ship);
    this.jets = Effect.create_effect("jets");
    this.fxs.push(this.jets);
    this.jets.particles.position.x = -40;
    this.ship.add(this.jets.particles);


    // init audio
    this.explode = $("#explode")[0];
    this.explode2 = $("#explode2")[0];
    this.gun_audio2 = $("#gun_audio2")[0];
    this.gun_audio = $("#gun_audio")[0];
    this.gun_audio.playbackRate = 4.0;
    this.explode.volume = GAME_FX_VOLUME;
    this.explode2.volume = GAME_FX_VOLUME;
    this.gun_audio.volume = GAME_FX_VOLUME;
    this.gun_audio2.volume = GAME_FX_VOLUME;

    // init effects
    this.muzzle_fx = Effect.create_effect("muzzle_fire");
    this.muzzle_fx.particles.position.x = 25;

    //

    window.addEventListener('resize', bind(this, this.onWindowResize), false);
    document.addEventListener('mousemove', bind(this, this.onMouseMove), true);
    document.addEventListener('mousedown', bind(this, this.onMouseDown), true);
    document.addEventListener('mouseup', bind(this, this.onMouseUp), true);
};

Bounce.prototype.onMouseMove = function(event) {
    this.ship.position.set(event.pageX - window.innerWidth/2, -event.pageY + window.innerHeight/2, 0);
    return false;
};

Bounce.prototype.onMouseDown = function(event) {
    if(this.ship.parent) {
        this.ship.add(this.muzzle_fx.particles);
        this.gun_audio.play();
        this.gun_audio2.play();
        this.shooting = true;
    }
    return false;
};

Bounce.prototype.onMouseUp = function(event) {
    this.ship.remove(this.muzzle_fx.particles);
    this.gun_audio.pause();
    this.gun_audio2.pause();
    this.shooting = false;
    if(!this.ship.parent) {
        this.start_explosion(this.ship.position);
    }
    return false;
};

Bounce.prototype.create_ship = function() {
    var ship = new THREE.Object3D();
    var material = new THREE.MeshBasicMaterial({ color: SHIP_COLOR });
    ship.add(new THREE.Mesh(new THREE.BoxGeometry(50, 5, 10), material));
    var b = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 10), material);
    b.position.x -= 20;
    ship.add(b);
    var b = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 10), material);
    b.position.x -= 30;
    ship.add(b);
    return ship;
};

Bounce.prototype.onWindowResize = function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.tunnel.reset(this.scene);
    this.tunnel2.reset(this.scene);
};

Bounce.prototype.move_bullets = function(now, dt) {
    if(this.shooting && now - this.last_bullet > RATE_OF_FIRE) {
        this.last_bullet = now;
        var b = new Bullet(this.ship.position.x, this.ship.position.y);
        this.bullets.push(b);
        this.scene.add(b.obj);
    }
    for(var i = 0; i < this.bullets.length; i++) {
        if(this.bullets[i].move(dt, this.enemies)) {
            this.scene.remove(this.bullets[i].obj);
            this.bullets.splice(i, 1);
            i--;
        }
    }
};

Bounce.prototype.start_explosion = function(point) {
    var fx = Effect.create_effect("explosion");
    fx.particles.position.copy(point);
    this.fxs.push(fx);
    this.scene.add(fx.particles);
    if(Math.random() < 0.5) this.explode.play();
    else this.explode2.play();
};

Bounce.prototype.enemy_hit = function(enemy_index, point) {
    var e = this.enemies[enemy_index];
    e.hits--;
    if(e.hits <= 0) {
        // explosion fx
        this.start_explosion(point);

        // remove enemy
        this.enemies.splice(enemy_index, 1);
        this.scene.remove(e.obj);

        // re-align leaders (ie. remove from linked-list)
        var leader = e.leader;
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].leader == e) {
                this.enemies[i].leader = leader;
                break;
            }
        }

        // add score
        this.score += e.group_def.value;
        $("#score_value").empty().append(this.score);
    } else {
        // add impact fx
        var fx = Effect.create_effect("enemy_hit");
        fx.particles.position.copy(point);
        this.fxs.push(fx);
        this.scene.add(fx.particles);
    }
};

Bounce.prototype.play_level = function(now, dt) {
    if(this.level_state == 0) {
        // level intro
        $("#music").animate({volume: 0}, 1500);
        this.level += 1;
        if(this.level >= LEVELS.length) {
            this.level_state = 3;
            this.scene.remove(this.ship);
            if(!$("#looser").is(":visible")) $("#winner").fadeIn();
            return;
        }
        console.log("Starting Level=" + this.level);
        this.level_start = now;
        this.level_state = 1;
        $("#dashboard").fadeOut();
        $("#level_value").empty().append(this.level + 1);
        $("#level_name").empty().append(LEVELS[this.level].name);
        $("#level_intro").fadeIn();
    } else if(this.level_state == 1 && now - this.level_start > 5000) {
        // start level
        $("#level_intro").fadeOut();
        $("#dashboard").fadeIn();
        this.level_state = 2;
        this.level_start = now;
        $("#music").attr("volume", 0);
        $("#music")[0].play();
        $("#music").animate({volume: GAME_VOLUME}, 1500);
    } else if(this.level_state == 2) {
        if(this.group_indexes == null) {
            console.log("Starting Wave=" + this.wave);
            this.group_indexes = [];
            for(var i = 0; i < LEVELS[this.level].waves[this.wave].groups.length; i++) {
                this.group_indexes.push(i);
            }
            this.wave_start = now;
        }
        for(var i = 0; i < this.group_indexes.length; i++) {
            var g = LEVELS[this.level].waves[this.wave].groups[this.group_indexes[i]];
            if(now - this.wave_start >= g.delay || this.enemies.length == 0) {
                // start group
                var last_enemy = null;
                for(var t = 0; t < g.enemies; t++) {
                    var enemy = new Enemy(g, last_enemy);
                    this.enemies.push(enemy);
                    this.scene.add(enemy.obj);
                    last_enemy = enemy;
                }
                this.group_indexes.splice(i, 1);
                i--;
            }
        }
        // move enemy ships
        for(var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].move(now, dt, this.ship);
        }

        // all enemies dead?
        if(this.enemies.length == 0 && this.group_indexes.length == 0) {
            this.wave++;
            if(this.wave >= LEVELS[this.level].waves.length) {
                this.wave = 0;
                this.level_state=0;
            } else {
                this.group_indexes = null;
            }
        }
    }
};

Bounce.prototype.check_collisions = function(now, dt) {
    if(now - this.last_collision >= 1000) {
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].overlaps(this.ship.position.x - 30, this.ship.position.y - 20,
                    this.ship.position.x + 30, this.ship.position.y + 20)) {
                this.shields -= this.enemies[i].group_def.damage;
                $("#shields_value").empty().append(this.shields);
                if(this.shields <= 0) {
                    if(!$("#winner").is(":visible")) {
                        this.start_explosion(this.ship.position);
                        this.scene.remove(this.ship);
                        $("#looser").fadeIn();
                    }
                } else {
                    // damage effect
                    var fx = Effect.create_effect("shield_damage");
                    fx.particles.position.copy(this.ship.position);
                    this.fxs.push(fx);
                    this.scene.add(fx.particles);
                }
                this.last_collision = now;
                break;
            }
        }
    }
};

Bounce.prototype.play_fxs = function(now, dt) {
    if(this.muzzle_fx.particles.parent) {
        this.muzzle_fx.move(dt);
    }
    for(var i = 0; i < this.fxs.length; i++) {
        var fx = this.fxs[i];
        if(fx.is_done(now)) {
            this.scene.remove(fx.particles);
            this.fxs.splice(i, 1);
            i--;
        } else {
            fx.move(dt);
        }
    }
};

Bounce.prototype.animate = function() {
    var now = Date.now();
    var dt = this.last_now == 0 ? 0 : now - this.last_now;
    this.last_now = now;

    this.fps_counter++;
    if(this.fps_counter >= 25) {
        var fps = this.fps_counter / (now - this.fps_start) * 1000;
        document.title = "B o u n c e - " + fps.toFixed(2);
        this.fps_counter = 0;
        this.fps_start = now;
    }

    this.move_bullets(now, dt);
    this.tunnel.move(dt, this.scene);
    this.tunnel2.move(dt, this.scene);
    this.play_level(now, dt);
    this.play_fxs(now, dt);
    this.check_collisions(now, dt);

    requestAnimationFrame(bind(this, this.animate));

    this.renderer.render(this.scene, this.camera);
};

