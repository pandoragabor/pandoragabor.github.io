var NW = 0;
var NE = 1;
var SW = 2;
var SE = 3;

function Enemy(group_def, leader) {
    this.leader = leader;
    this.dir = new THREE.Vector3(0, 0, 0);
    this.tmp = new THREE.Vector3(0, 0, 0);
    this.group_def = group_def;
    this.hits = group_def.hits;

    this.path = null;
    this.path_index = 0;
    this.diag_dir = NW;

    this.obj = new THREE.Object3D();
    var material = new THREE.MeshBasicMaterial({ color: group_def.color });
    this.obj.add(new THREE.Mesh(new THREE.BoxGeometry(group_def.size * 2, group_def.size / 6, 10), material));
    var b = new THREE.Mesh(new THREE.BoxGeometry(group_def.size, group_def.size, 10), material);
    b.rotation.z = deg2rad(45);
    this.obj.add(b);
    this.obj.position.x = this.leader == null ? window.innerWidth/2 : this.leader.obj.position.x + group_def.size * 2;
}

Enemy.prototype.move_to = function(dt, point, min_dist) {
    if(point.distanceTo(this.obj.position) > min_dist) {
        this.dir.copy(point).sub(this.obj.position).normalize().multiplyScalar(dt * this.group_def.speed);
        this.obj.position.add(this.dir);
        return false;
    } else {
        return true;
    }
};

Enemy.prototype.move = function(now, dt, player_obj) {
    if(this.leader == null) {
        if (this.group_def.movement == "elliptical") {
            if (this.path == null || this.path_index >= this.path.length) {
                var end_point;
                if (this.obj.position.x < player_obj.position.x) {
                    end_point = new THREE.Vector3(player_obj.position.x + 400, player_obj.position.y, 0);
                } else {
                    end_point = new THREE.Vector3(player_obj.position.x - 400, player_obj.position.y, 0);
                }
                var curve = new THREE.CubicBezierCurve3(
                    new THREE.Vector3(this.obj.position.x, this.obj.position.y, 0),
                    new THREE.Vector3(player_obj.position.x, player_obj.position.y - 400, 0),
                    new THREE.Vector3(player_obj.position.x, player_obj.position.y + 400, 0),
                    end_point);
                this.path = curve.getPoints(50);
                this.path_index = 0;
            }
            if (this.path_index < this.path.length) {
                if (this.move_to(dt, this.path[this.path_index], 5)) {
                    this.path_index++;
                }
            }
        } else if(this.group_def.movement == "diagonal") {
            var d = dt * this.group_def.speed;
            if(Math.random() * 50 <= 1) this.diag_dir = (Math.random() * 4)|0;
            if(this.diag_dir == NW) {
                this.obj.position.x -= d;
                this.obj.position.y += d;
                if(this.obj.position.x <= -window.innerWidth/2) this.diag_dir = NE;
                if(this.obj.position.y > window.innerHeight/2) this.diag_dir = SW;
            } else if(this.diag_dir == NE) {
                this.obj.position.x += d;
                this.obj.position.y += d;
                if(this.obj.position.x >= window.innerWidth/2) this.diag_dir = NW;
                if(this.obj.position.y > window.innerHeight/2) this.diag_dir = SE;
            } else if(this.diag_dir == SW) {
                this.obj.position.x -= d;
                this.obj.position.y -= d;
                if(this.obj.position.x <= -window.innerWidth/2) this.diag_dir = SE;
                if(this.obj.position.y <= -window.innerHeight/2) this.diag_dir = NW;
            } else if(this.diag_dir == SE) {
                this.obj.position.x += d;
                this.obj.position.y -= d;
                if(this.obj.position.x >= window.innerWidth/2) this.diag_dir = SW;
                if(this.obj.position.y <= -window.innerHeight/2) this.diag_dir = NE;
            }
        } else {
            // aim for the player
            this.move_to(dt, player_obj.position, 5);
        }
    } else {
        this.move_to(dt, this.leader.obj.position, this.group_def.size * 2);
    }
};

Enemy.prototype.overlaps = function(x, y, x2, y2) {
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

Enemy.prototype.intersects = function(v3) {
    return v3.x >= this.obj.position.x - this.group_def.size &&
        v3.x < this.obj.position.x + this.group_def.size &&
        v3.y >= this.obj.position.y - this.group_def.size &&
        v3.y < this.obj.position.y + this.group_def.size;
};
