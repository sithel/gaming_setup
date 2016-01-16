function displayPlan() {

    var orbits = [];
    var colors = [0xff0000, 0xffbf00, 0x80ff00, 0x00ffbf, 0x0000ff, 0xff00ff];
    var SPEED_YUVATH = 10;  // Yuvath guardians
    var SPEED_YACHT = 7;  // Captain's yatch
    var SPEED_GAUNTLET = 4;  // Combat dropships
    var UNIT_PER_FRAME = 0.01;

    var colors = [0xff0000, 0xffbf00, 0x80ff00, 0x00ffbf, 0x0000ff, 0xff00ff];


    function generateOrbit(num, freq, offset, radius, approach, shipCount, scene) {
      var material = new THREE.MeshBasicMaterial({wireframe: true, color: colors[num-1], opacity: 0.3, transparent: true});
      window.rebMat = material;
      var circleGeometry = new THREE.RingGeometry( radius - 0.1, radius + 0.1, 60 );//new THREE.CircleGeometry( radius, 60);
      var orbit = new THREE.Mesh( circleGeometry, material );
      // var cylinderGeometry = new THREE.CylinderGeometry( radius, radius, 0.2, 32 );
      // var orbit = new THREE.Mesh( cylinderGeometry, material );
      scene.add(orbit);

      var circumference = 2 * Math.PI * radius;
      // arc length = center angle in radians * radius
      var shipRotationRadians = SPEED_YUVATH / radius;
      // TODO : solve for # of ships based on circumference and frequency
      // TODO : factor in offset into here somehow

      var spheres = [];
      var geometry = new THREE.SphereGeometry( 0.5, 10,10);
      var material = new THREE.MeshPhongMaterial({
        color: colors[num-1], specular: 0x555555, shininess: 30
      } );
      for (var i = 0; i < shipCount; ++i) {
        var sphere = new THREE.Mesh( geometry, material );
        scene.add(sphere);
        spheres.push(sphere);
      }

      orbits.push({
        orbit: orbit,
        spheres: spheres,
        shipRotationRadians: shipRotationRadians,
        radius: radius,
        orbitRotation: approach * Math.PI / 180,
        shipRotation: 0,
      });
    }

    var corvo = null;
    var pathLength = 40;
    function generatePath(scene) {
      var path = new THREE.Mesh( new THREE.CylinderGeometry( 0.05, 0.05, pathLength, 32 ), new THREE.MeshBasicMaterial( {color: 0xffffff} ) );
      scene.add( path );
      var approachRadius = 20;
      var dangerCone = new THREE.Mesh( new THREE.CylinderGeometry( 0.5, approachRadius, pathLength, 15 ), new THREE.MeshBasicMaterial( {wireframe: true, opacity: 0.1, transparent: true,color: 0xffffff} ) );
      scene.add( dangerCone );
      var shipMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x555555, shininess: 30} );
      var ship = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 10, 10 ), shipMaterial );
      scene.add( ship );
      corvo = {
        path: path,
        ship: ship,
        cone: dangerCone,
        position: -20,
        rate: SPEED_YACHT,
        rotation: 2,
        approachRadius: approachRadius,
        approach: new THREE.Vector3(1,0,1),
      }
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.z = 40;

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);

    var light = new THREE.AmbientLight( 0x222222 ); // soft white light
    scene.add( light );

    // Number of ships (n) determined by:
    // n = (circumference * frequency) / velocity

    generateOrbit(1, 3, 1, 1.5, 0, 9, scene);
    generateOrbit(2, 5, 3, 3.5, 90, 13, scene);
    generateOrbit(3, 6, 3, 6, 120, 18, scene);
    generateOrbit(4, 10, 0, 8, 270, 15, scene);
    generateOrbit(5, 12, 0, 10, 210, 15, scene);
    generateOrbit(6, 15, 0, 15, 60, 18, scene);

    generatePath(scene);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var raycaster = new THREE.Raycaster();
    var orbit_rotation_vector = new THREE.Vector3(0,1,0);
    var ship_rotation_vector = new THREE.Vector3(0,0,1);
    function detectHit() {
      return;
      // http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
      for (var vi = 0; vi < corvo.ship.geometry.vertices.length; ++vi){
        var localVertex = corvo.ship.geometry.vertices[vi].clone();
        var globalVertex = corvo.ship.matrix.multiplyVector3(localVertex);
        var directionVector = globalVertex.sub( corvo.ship.position );

        raycaster.set(corvo.ship.position, directionVector.clone().normalize());

        var ships = orbits.reduce(function(prev, cur){
          return prev.concat(cur.spheres)
        }, []);
        var collisionResults = raycaster.intersectObjects( ships );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
          console.log("collisionResults : ", collisionResults.length);
          console.log(">> ", collisionResults[0].distance," vs ",directionVector.length());
          return true;
        }
      }
      return false;
    }
    var reb = 0;
    function render() {
      if (true || view_state.running) {
        corvo.approach.x += view_state.mod_x;
        corvo.approach.y += view_state.mod_y;
        corvo.approach.z += view_state.mod_z;
        corvo.approach.normalize();
        corvo.rotation += view_state.mod_r;
        corvo.path.matrix.makeRotationAxis(corvo.approach, corvo.rotation);
        corvo.position += corvo.rate;
        if (corvo.position > 20) {
          corvo.position = -20;
        }
        var shipVector = new THREE.Vector3(0, corvo.position, 0);
        shipVector.applyAxisAngle(corvo.approach, corvo.rotation);
        corvo.ship.matrix.setPosition(shipVector);
        corvo.path.matrix.makeRotationAxis(corvo.approach, corvo.rotation);
        corvo.cone.matrix.makeRotationAxis(corvo.approach, corvo.rotation);

        var shipVector = new THREE.Vector3(0, -20, 0);
        shipVector.applyAxisAngle(corvo.approach, corvo.rotation);
        corvo.cone.matrix.setPosition(shipVector);
        corvo.ship.matrixAutoUpdate = false;
        corvo.path.matrixAutoUpdate = false;
        corvo.cone.matrixAutoUpdate = false;

        for(var i = 0; i < orbits.length; ++i) {
          var o = orbits[i];

          o.orbit.matrix.makeRotationAxis(orbit_rotation_vector, o.orbitRotation);
          o.orbit.matrixAutoUpdate = false;
          o.shipRotation += o.shipRotationRadians/100;
          for(var j = 0; j < o.spheres.length; ++j) {
            var s = o.spheres[j];
            var rotationOffset = j * Math.PI * 2 / o.spheres.length;
            // applyAxisAngle(normalized vector3, angle in radians)
            var shipVector = new THREE.Vector3(0, o.radius, 0).applyAxisAngle(ship_rotation_vector, o.shipRotation + rotationOffset);  // spin the ships around the ring
            shipVector.applyAxisAngle(orbit_rotation_vector, o.orbitRotation);  // twist the ring of ships to match the orbit
            s.matrix.setPosition(shipVector);
            s.matrixAutoUpdate = false;
          }
        }

        if (detectHit()) {
          console.log("OH SHIT! HIT!");
          // corvo.ship.material.color.setRGB(1,0,0);
          view_state.running = false;
        }
      }
      requestAnimationFrame( render );
      renderer.render( scene, camera );
    }
    controls = new THREE.OrbitControls( camera, renderer.domElement );


    var view_state = {
      running: true,
      orbits: 0,    // 0 = wireframe, 1 = disks, 2 = nothing
      mod_x: 0,
      mod_r: 0,
      mod_y: 0,
      mod_z: 0,
    }
    window.onkeydown = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;
      console.log(key);
      if (key == 87) {
        // cycle through wireframe-ness
        view_state.orbits = (view_state.orbits + 1) % 3
        console.log("orbits is now ",view_state.orbits)
        for(var i = 0; i < orbits.length; ++i){
          if (view_state.orbits == 0) {
            console.log("setting oribits to wireframe");
            // orbits[i].orbit.material.wireframeLinewidth = 2;
            orbits[i].orbit.material.wireframe = true;
            scene.add(orbits[i].orbit);
            orbits[i].orbit.material.side = THREE.FrontSide;
          } else if (view_state.orbits == 1) {
            console.log("setting oribits to flat disks");
            orbits[i].orbit.material.wireframe = false;
            orbits[i].orbit.material.side = THREE.DoubleSide;
          } else {
            console.log("setting oribits to none");
            scene.remove(orbits[i].orbit);

          }
        }
      } else if (key == 73) { // i
        view_state.mod_r = 0.01
      } else if (key == 75) { // k
        view_state.mod_r = 0.01
      } else if (key == 65) { // a
        view_state.mod_x = 0.01
      } else if (key == 90) { // z
        view_state.mod_x = -0.01
      } else if (key == 83) { // s
        view_state.mod_y = 0.01
      } else if (key == 88) { // x
        view_state.mod_y = -0.01
      } else if (key == 68) { // d
        view_state.mod_z = 0.01
      } else if (key == 67) { // c
        view_state.mod_z = -0.01
      } else if (key == 82) { // r
        corvo.approachRadius += 0.1;
        corvo.cone.geometry = new THREE.CylinderGeometry( 0.5, corvo.approachRadius, pathLength, 15 )
      } else if (key == 84) { // t
        corvo.approachRadius -= 0.1;
        corvo.cone.geometry = new THREE.CylinderGeometry( 0.5, corvo.approachRadius, pathLength, 15 )
      }
    }

    window.onkeyup = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;
      if (key == 65 || key == 90) {
        view_state.mod_x = 0;
      } else if(key == 73 || key == 75) {
        view_state.mod_r = 0;
      } else if(key == 83 || key == 88) {
        view_state.mod_y = 0;
      } else if(key == 67 || key == 68) {
        view_state.mod_z = 0;
      }
    }


    render();
}