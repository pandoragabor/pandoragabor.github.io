var PARTICLE_IMG = THREE.ImageUtils.loadTexture("img/p3.png");

EFFECTS = {
    muzzle_fire: {
        color: 0xff8822,
        count: 500,
        size: 10,
        texture: PARTICLE_IMG,
        opacity: 0.6,
        init_vertex: function(vertex) {
            vertex.x = Math.random() * 4 - 0.5;
            vertex.y = Math.random() * 4 - 2;
        },
        move_vertex: function(vertex, dt) {
            var d = dt * 0.1;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            if(vertex.length() > 25 * Math.random() + 10) {
                this.init_vertex(vertex);
            }
        }
    },
    enemy_hit: {
        color: 0x113388,
        count: 1000,
        size: 20,
        texture: PARTICLE_IMG,
        opacity: 0.6,
        ttl: 300,
        init_vertex: function(vertex) {
            vertex.x = Math.random() * 10 - 5;
            vertex.y = Math.random() * 10 - 5;
        },
        move_vertex: function(vertex, dt) {
            var d = dt * 0.25;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            if(vertex.length() > 50 * Math.random() + 20) {
                this.init_vertex(vertex);
            }
        }
    },
    explosion: {
        color: 0xffcc22,
        count: 2000,
        size: 40,
        texture: PARTICLE_IMG,
        opacity: 0.75,
        ttl: 400,
        init_vertex: function(vertex) {
            vertex.x = Math.random() * 20 - 10;
            vertex.y = Math.random() * 20 - 10;
        },
        move_vertex: function(vertex, dt) {
            var d = dt * 0.5;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            if(vertex.length() > 100 * Math.random() + 40) {
                this.init_vertex(vertex);
            }
        }
    },
    shield_damage: {
        color: 0x11aa33,
        count: 2000,
        size: 40,
        texture: PARTICLE_IMG,
        opacity: 0.6,
        ttl: 300,
        init_vertex: function(vertex) {
            vertex.x = Math.random() * 20 - 10;
            vertex.y = Math.random() * 20 - 10;
        },
        move_vertex: function(vertex, dt) {
            var d = dt * 0.5;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            if(vertex.length() > 150 * Math.random() + 50) {
                this.init_vertex(vertex);
            }
        }
    },
    debris: {
        color: 0xffffff,
        count: 30,
        size: 10,
        texture: null,
        opacity: 0.25,
        ttl: 0, // live forever
        init_vertex: function(vertex) {
            if(window.bounce["debris"] == null) {
                vertex.x = window.innerWidth * (Math.random() - 0.5);
            } else {
                vertex.x = window.innerWidth / 2 + window.innerWidth * Math.random();
            }
            vertex.y = window.innerHeight * (Math.random() - 0.5);
            vertex.z = 60;
            vertex["speed"] = Math.random() * 5 + 100;
        },
        move_vertex: function(vertex, dt) {
            vertex.x -= dt * 0.01 * vertex["speed"];
            if(vertex.x <= -window.innerWidth/2) {
                this.init_vertex(vertex);
            }
        }
    },
    jets: {
        color: 0x2211cc,
        count: 1000,
        size: 40,
        texture: PARTICLE_IMG,
        opacity: 0.25,
        ttl: 0, // live forever
        init_vertex: function(vertex) {
            vertex.x = Math.random() * -20;
            vertex.y = Math.random() * 5 - 2.5;
        },
        move_vertex: function(vertex, dt) {
            var d = dt * 0.5;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            if(vertex.length() > 70 * Math.random() + 20) {
                this.init_vertex(vertex);
            }
        }
    },
    booster: {
        color: 0xeeff88,
        count: 400,
        size: 40,
        texture: PARTICLE_IMG,
        opacity: 0.25,
        ttl: 500, // live forever
        init_vertex: function(vertex) {
            vertex.x = Math.random() * 20 - 10;
            vertex.y = Math.random() * 20 - 10;
            vertex["speed"] = Math.random() * 10 + 5;
        },
        move_vertex: function(vertex, dt) {
            var y = vertex.y;
            var d = dt * 0.5;
            var delta = (Math.random() * d/2 + d/2);
            Effect.grow_vector(vertex, delta);
            vertex.y = y - dt * 0.01 * vertex["speed"];
        }
    }

};

function Effect(effect_def) {
    this.start_time = Date.now();
    this.effect_def = effect_def;
    this.geometry = new THREE.Geometry();

    for(var i = 0; i < effect_def.count; i++) this.geometry.vertices.push(new THREE.Vector3());

    this.material = new THREE.PointCloudMaterial({
        size: effect_def.size,
        map: effect_def.texture,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        fog: false
    });

    this.particles = new THREE.PointCloud(this.geometry, this.material);

    for(var i = 0; i < effect_def.count; i++) {
        var vertex = this.geometry.vertices[i];
        this.effect_def.init_vertex(vertex);
    }

    // re-init the spell casting particles
    this.material.color.setHex(effect_def.color);
    this.material.opacity = effect_def.opacity;
    this.geometry.colorsNeedUpdate = true;
    this.geometry.verticesNeedUpdate = true;
}

Effect.create_effect = function(fx_name) {
    return new Effect(EFFECTS[fx_name]);
};

Effect.prototype.is_done = function(now) {
    return this.effect_def.ttl > 0 && now - this.start_time > this.effect_def.ttl;
};

Effect.prototype.move = function(dt) {
    for(var i = 0; i < this.effect_def.count; i++) {
        var vertex = this.geometry.vertices[i];
        this.effect_def.move_vertex(vertex, dt);
    }
    this.geometry.colorsNeedUpdate = true;
    this.geometry.verticesNeedUpdate = true;
};

Effect.get_angle = function(x, y) {
    var angle = rad2deg(Math.atan(y / x));
    // the "arctan problem"
    if(x < 0) angle += 180;
    else if (y < 0) angle += 360;
    angle = deg2rad(angle);
    return angle;
};

Effect.grow_vector = function(vertex, delta) {
    var angle = Effect.get_angle(vertex.x, vertex.y);
    var h = vertex.y / Math.sin(angle);
    h += delta;
    vertex.x = h * Math.cos(angle);
    vertex.y = h * Math.sin(angle);
};
