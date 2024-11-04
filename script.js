import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import TWEEN from 'https://unpkg.com/@tweenjs/tween.js@20.0.0/dist/tween.esm.js';

// Creates the scene
const scene = new THREE.Scene();

//constants
const jackpotColor = new THREE.Color('rgb(178,145,70)');
const jackpotColor2 = new THREE.Color('rgb(255, 191, 0)');
const normalFrameColor = new THREE.Color("rgb(135,86,59)");
let frameMaterial;
const frameThickness = 0.3;
const artworks = [];
const numArtworks = 24; // Total number of artworks
const radius = 25; // Radius of the cylinder
const artworkWidth = 5;
const artworkHeight = 6;
const wallColor = new THREE.Color('dimgray')

// Sets the background color
scene.background = new THREE.Color('darkslateblue');

// Creates the camera
const camera = new THREE.PerspectiveCamera(
  93.7, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
camera.position.set(0, 2.79, 0); // Set initial camera position at the center of the cylinder

// Creates the renderer and adds it to the document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handles window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Green cube for reference :3
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.6, 0);
scene.add(cube);

// Lighting
const ambientLight = new THREE.AmbientLight('darkgray');
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(1, 2, -1);
directionalLight2.position.set(-1, 1.5, 1);
scene.add(directionalLight);
scene.add(directionalLight2);

// Loads Textures
const loader = new THREE.TextureLoader();

// f l o o r
const floorColor = new THREE.Color('rgb(18,35,35)')
//const floorTexture = loader.load('resimler/floor.jpg');
const floorGeometry = new THREE.PlaneGeometry(70, 70);
const floorMaterial = new THREE.MeshStandardMaterial({ color:floorColor, side: THREE.FrontSide});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Loops to create artworks arranged in a cylinder *with borders*
for (let i = 1; i <= numArtworks; i++) {
  const angle = (i / numArtworks) * Math.PI * 2; // Angle in radians
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);

  // Loads the artwork texture
  const texture = loader.load(
    `resimler/gorsel${i}.jpg`,
    function (texture) {
      // Mirroring
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.x = - 1;
    }
  );

  const artGroup = new THREE.Group();
  // Artwork mesh (plane)
  const artGeometry = new THREE.PlaneGeometry(artworkWidth, artworkHeight);
  const artMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const artMesh = new THREE.Mesh(artGeometry, artMaterial);
  artMesh.position.set(0, 0, -0.1); // Slightly in front of the frame

 // Artwork Borderss
 const frameGeometry = new THREE.BoxGeometry(
   artworkWidth + frameThickness,
   artworkHeight + frameThickness,
   0.1
 );

 if (i === 1) {
   //make the frame glow gold (special request)
   frameMaterial = new THREE.MeshStandardMaterial({
     color: jackpotColor2, // Gold color
     emissive: jackpotColor,
     emissiveIntensity: 1.94,
     metalness: 1.9,
     roughness: 0.5
   });
 } else {
   // Other images = default frame material
   frameMaterial = new THREE.MeshStandardMaterial({ color: normalFrameColor });
 }

 const wallGeometry = new THREE.PlaneGeometry(
  artworkWidth + frameThickness + 10,
  artworkHeight + frameThickness + 10
 );

 /*const wallTexture = loader.load(
  `resimler/wall.jpg`,
  function (texture) {
    // Mirroring
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = - 1;
  }
 );
 */
 const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, side: THREE.DoubleSide}); 
 const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
 wallMesh.position.set(0, -2.8, 0.15); 

 const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
 frameMesh.position.set(0, 0, 0);

 artGroup.add(wallMesh);
 artGroup.add(frameMesh);
 artGroup.add(artMesh);

 artGroup.position.set(x, artworkHeight / 2 + 1, z);
 artGroup.rotation.y = -angle + Math.PI / 2;

 scene.add(artGroup);
 artworks.push(artMesh);
}


// Navigation Controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let turnLeft = false;
let turnRight = false;

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
    case 'ArrowLeft':
      turnLeft = true;
      break;
    case 'ArrowRight':
      turnRight = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
    case 'ArrowLeft':
      turnLeft = false;
      break;
    case 'ArrowRight':
      turnRight = false;
      break;
  }
});

// Boundaries for camera movement
const boundaryRadius = radius - 2; // Slightly less than the artwork radius to prevent clipping

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Update movement
  const moveSpeed = 0.129;
  const turnSpeed = 0.02;

  // Rotate camera
  if (turnLeft) camera.rotation.y += turnSpeed;
  if (turnRight) camera.rotation.y -= turnSpeed;

  // Move camera
  const direction = new THREE.Vector3();
  if (moveForward) direction.z -= moveSpeed;
  if (moveBackward) direction.z += moveSpeed;
  if (moveLeft) direction.x -= moveSpeed;
  if (moveRight) direction.x += moveSpeed;

  // Apply rotation to the movement direction
  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);

  camera.position.add(direction);

  // Keep the camera within the boundaries of the cylinder
  const distanceFromCenter = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
  if (distanceFromCenter > boundaryRadius) {
    const angle = Math.atan2(camera.position.z, camera.position.x);
    camera.position.x = boundaryRadius * Math.cos(angle);
    camera.position.z = boundaryRadius * Math.sin(angle);
  }

  // Update TWEEN animations
  TWEEN.update();

  renderer.render(scene, camera);
}

animate();

// Animations with TWEEN.js
function animateCamera(targetPosition) {
  new TWEEN.Tween(camera.position)
    .to(targetPosition, 1000) // Duration in milliseconds
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
}

// Interactivity: Click on Artworks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 ;
  mouse.y = -(event.clientY / window.innerHeight) * 2 ;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersected by the ray
  const intersects = raycaster.intersectObjects(artworks);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    // Move camera closer to the artwork
    const dx = intersectedObject.position.x;
    const dz = intersectedObject.position.z;
    const angle = Math.atan2(dz, dx);

    animateCamera({
      x: (boundaryRadius - 1) * Math.cos(angle),
      y: intersectedObject.position.y,
      z: (boundaryRadius - 1) * Math.sin(angle),
    });
  }
}

window.addEventListener('click', onMouseClick);
