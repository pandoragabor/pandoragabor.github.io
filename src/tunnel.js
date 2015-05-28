function Tunnel(scene, level) {
    this.level = level;
    this.tunnel_obj = null;
    this.tunnel_material = new THREE.MeshBasicMaterial({ color: TUNNEL_COLOR[level] });
    this.tunnel_res = window.innerWidth / (LAND_RESOLUTION - 3);
    this.tunnel_dx = 0;
    this.geo_top = this.geo_bottom = null;
    this.reset(scene);
}

Tunnel.prototype.reset = function(scene) {
    this.tunnel = [];
    for (var i = 0; i < LAND_RESOLUTION; i++) {
        this.tunnel.push(this.next_tunnel_point());
    }
    this.render_tunnel(scene);
};

Tunnel.prototype.next_tunnel_point = function() {
    var dir;
    var y = this.tunnel.length == 0 ? 0 : this.tunnel[this.tunnel.length - 1];
    if (y > 0) {
        dir = Math.random() < y ? -1 : 1;
    } else {
        dir = Math.random() < Math.abs(y) ? 1 : -1;
    }
    y += (Math.random() * 0.2) * dir;
    // y is now -1 to 1, convert to 0.2 to 0.7
//    if(this.level == 0) return y * 0.5 + 0.2;
//    else return y * 0.5 + 0.2;
    if(this.level == 0) return y * 0.15 + 0.05;
    else return y * 0.25 + 0.45;

};

Tunnel.prototype.render_tunnel = function(scene) {
    if(this.geo_top) {
        this.geo_top.dispose();
        this.geo_bottom.dispose();
    }
    this.geo_top = new THREE.Geometry();
    this.geo_bottom = new THREE.Geometry();
    for(var i = 0; i < this.tunnel.length - 1; i++) {
        var x = i * this.tunnel_res - window.innerWidth / 2;
        var n = this.tunnel_res / 2;
        var ya = window.innerHeight/2.0 * (1.0 - this.tunnel[i]);
        var yb = window.innerHeight/2.0 * (1.0 - this.tunnel[i + 1]);
        var y2 = window.innerHeight/2.0;

        var c = this.geo_top.vertices.length;
        this.geo_top.vertices.push( new THREE.Vector3( x-n, y2, 100 ) );
        this.geo_top.vertices.push( new THREE.Vector3( x-n, ya, 100 ) );
        this.geo_top.vertices.push( new THREE.Vector3( x+n, yb, 100 ) );
        this.geo_top.vertices.push( new THREE.Vector3( x+n, y2, 100 ) );

        // counter-clockwise winding order
        this.geo_top.faces.push( new THREE.Face3( c, c+1, c+2 ) );
        this.geo_top.faces.push( new THREE.Face3( c, c+2, c+3 ) );

        ya = -window.innerHeight/2.0 * (1 - this.tunnel[i]);
        yb = -window.innerHeight/2.0 * (1 - this.tunnel[i + 1]);
        y2 = -window.innerHeight/2.0;

        c = this.geo_bottom.vertices.length;
        this.geo_bottom.vertices.push( new THREE.Vector3( x-n, ya, 100 ) );
        this.geo_bottom.vertices.push( new THREE.Vector3( x-n, y2, 100 ) );
        this.geo_bottom.vertices.push( new THREE.Vector3( x+n, y2, 100 ) );
        this.geo_bottom.vertices.push( new THREE.Vector3( x+n, yb, 100 ) );

        // counter-clockwise winding order
        this.geo_bottom.faces.push( new THREE.Face3( c, c+1, c+2 ) );
        this.geo_bottom.faces.push( new THREE.Face3( c, c+2, c+3 ) );

    }

    // geometry.computeCentroids();
    this.geo_top.computeFaceNormals();
    this.geo_top.computeVertexNormals();
    this.geo_bottom.computeFaceNormals();
    this.geo_bottom.computeVertexNormals();

    if(this.tunnel_obj != null) {
        scene.remove(this.tunnel_obj);
    }
    this.tunnel_obj = new THREE.Object3D();
    this.tunnel_obj.add(new THREE.Mesh(this.geo_top, this.tunnel_material));
    this.tunnel_obj.add(new THREE.Mesh(this.geo_bottom, this.tunnel_material));
    this.tunnel_obj.position.z = -500 - (this.level + 1) * 10;
    scene.add(this.tunnel_obj);
};

Tunnel.prototype.move = function(dt, scene) {
    this.tunnel_dx -= dt * (SPEED / (1 + this.level * 1.25));
    if(this.tunnel_dx < -this.tunnel_res) {
        var new_point_count = (Math.abs(this.tunnel_dx) / this.tunnel_res)|0;
        for(var i = 0; i < new_point_count; i++) {
            this.tunnel.splice(0, 1);
            this.tunnel.push(this.next_tunnel_point());
        }
        this.render_tunnel(scene);
        this.tunnel_dx = 0;

    }
    this.tunnel_obj.position.x = this.tunnel_dx;
};
