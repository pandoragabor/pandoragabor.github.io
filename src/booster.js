var BOOSTERS = [
    {
        color: 0x2233cc,
        speed: 0.75,
        action: function(now) {
            window.bounce.shields += 15;
            if(window.bounce.shields > 100) window.bounce.shields = 100;
            $("#shields_value").empty().append(window.bounce.shields);
        }
    },
    {
        color: 0xcc3322,
        speed: 0.5,
        action: function(now) {
            window.bounce.power++;
            window.bounce.power_timer = now;
            $("#power_value").empty().append(window.bounce.power);
        }
    },
    {
        color: 0xccaa22,
        speed: 0.6,
        action: function(now) {
            window.bounce.score += 500;
            $("#score_value").empty().append(window.bounce.score);
        }
    }

];

function Booster(booster_def) {
    this.tmp = new THREE.Vector3();
    this.booster_def = booster_def;
    var x = window.innerWidth/2 + 100;
    var y = Math.random() * window.innerHeight - window.innerHeight/2;
    var material = new THREE.MeshBasicMaterial({ color: booster_def.color });
    this.obj = new THREE.Mesh(new THREE.TorusGeometry(15, 5), material);
    this.obj.position.set(x, y, 0);
}

Booster.prototype.move = function(dt) {
    this.obj.position.x -= dt * this.booster_def.speed;
    this.obj.rotation.x += dt * 0.01;
    return this.obj.position.x <= -window.innerWidth / 2;
};

Booster.prototype.overlaps = function(x, y, x2, y2) {
    this.tmp.set(x, y, this.obj.position.z);
    if(this.intersects(this.tmp)) return true;
    this.tmp.set(x2, y, this.obj.position.z);
    if(this.intersects(this.tmp)) return true;
    this.tmp.set(x, y2, this.obj.position.z);
    if(this.intersects(this.tmp)) return true;
    this.tmp.set(x2, y2, this.obj.position.z);
    if(this.intersects(this.tmp)) return true;
    return false;
};

Booster.prototype.intersects = function(v3) {
    return v3.x >= this.obj.position.x - 30 &&
        v3.x < this.obj.position.x + 30 &&
        v3.y >= this.obj.position.y - 15 &&
        v3.y < this.obj.position.y + 15;
};
