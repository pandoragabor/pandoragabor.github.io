function Bullet(x, y, power) {
    this.power = power;
    var material = new THREE.MeshBasicMaterial({ color: BULLET_COLOR });
    this.obj = new THREE.Mesh(new THREE.BoxGeometry(power * 5, power * 5, 10), material);
    this.obj.position.set(x, y, 0);
}

// return true when past edge of screen
Bullet.prototype.move = function(dt, enemies) {
    this.obj.position.x += dt * BULLET_SPEED;
    for(var i = 0; i < enemies.length; i++) {
        if(enemies[i].intersects(this.obj.position)) {
            window.bounce.enemy_hit(i, this.obj.position, this.power);
            return true;
        }
    }
    return this.obj.position.x >= window.innerWidth / 2;
};
