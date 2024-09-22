import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from "cannon-es"

/**
 * Debug
 */
const gui = new GUI()
const debugObjects = {}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Counter
const counter = document.querySelector('.counter')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
// const cubeTextureLoader = new THREE.CubeTextureLoader()

// const environmentMapTexture = cubeTextureLoader.load([
//     '/textures/environmentMaps/0/px.png',
//     '/textures/environmentMaps/0/nx.png',
//     '/textures/environmentMaps/0/py.png',
//     '/textures/environmentMaps/0/ny.png',
//     '/textures/environmentMaps/0/pz.png',
//     '/textures/environmentMaps/0/nz.png'
// ])

// Floor texture

const floorTextureARM = textureLoader.load("/textures/rock-brick/textures/volcanic_rock_tiles_arm_1k.jpg")
const floorTextureDiffuse = textureLoader.load("/textures/rock-brick/textures/volcanic_rock_tiles_diff_1k.jpg")
const floorTextureNormal = textureLoader.load("/textures/rock-brick/textures/volcanic_rock_tiles_nor_gl_1k.jpg")

const floorTextureStretch = 0.5

floorTextureARM.repeat.set(floorTextureStretch, floorTextureStretch)
floorTextureDiffuse.repeat.set(floorTextureStretch, floorTextureStretch)
floorTextureNormal.repeat.set(floorTextureStretch, floorTextureStretch)

floorTextureARM.wrapS = THREE.RepeatWrapping
floorTextureDiffuse.wrapS = THREE.RepeatWrapping
floorTextureNormal.wrapS = THREE.RepeatWrapping

floorTextureARM.wrapT = THREE.RepeatWrapping
floorTextureDiffuse.wrapT = THREE.RepeatWrapping
floorTextureNormal.wrapT = THREE.RepeatWrapping

floorTextureDiffuse.colorSpace = THREE.SRGBColorSpace

// Metal Texture

const metalDiffuseTexture = textureLoader.load("/textures/metal/textures/metal_plate_02_diff_1k.jpg")
const metalARMTexture = textureLoader.load("/textures/metal/textures/metal_plate_02_arm_1k.jpg")
const metalNormalTexture = textureLoader.load("/textures/metal/textures/metal_plate_02_nor_gl_1k.jpg")
metalDiffuseTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Sounds
 */

const hitSound = new Audio("/sounds/hit.mp3")

const playHitSound = (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if(impactStrength > 1.5){
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/**
 * Physics
 */

// World
const world = new CANNON.World()

// collision optimisation
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

world.gravity.set(0, -9.82, 0)

// Materials
const defaultMaterial = new CANNON.Material("default")

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.4,
        restitution: 0.4,
    }
)

world.addContactMaterial(defaultContactMaterial)

// // Sphere
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
//     material: defaultMaterial,
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(100, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

// Floor

const floorShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5))
const floorBody = new CANNON.Body({
    shape: floorShape,
    material: defaultMaterial,
    mass: 0,
    position: new CANNON.Vec3(0, -5, 0),
})
// floorBody.quaternion.setFromAxisAngle(
//     new CANNON.Vec3(-1, 0, 0),
//     Math.PI * 0.5
// )
world.addBody(floorBody)

/**
 * Floor
 */
const floorSize = 10
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(floorSize, floorSize, floorSize),
    new THREE.MeshStandardMaterial({
        normalMap: floorTextureNormal,
        normalScale: new THREE.Vector2(10, 10),
        roughnessMap: floorTextureARM,
        aoMap: floorTextureARM,
        metalnessMap: floorTextureARM,
        map: floorTextureDiffuse
    })
)
floor.position.y = - floorSize * 0.5
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

const floor2 = new THREE.Mesh(
    new THREE.BoxGeometry(floorSize, floorSize, floorSize),
    new THREE.MeshStandardMaterial({
        map: floorTextureDiffuse
    })
)

floor2.position.y = - (0.1 + floorSize + (floorSize * 0.5))
floor2.receiveShadow = true
floor2.rotation.x = - Math.PI * 0.5
scene.add(floor2)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
// directionalLight.castShadow = true 

// directionalLight.position.set(5, 5, 5)
// scene.add(directionalLight)

const pointLight1 = new THREE.PointLight(0xffffff, 150)
pointLight1.castShadow = true
pointLight1.shadow.radius = 4
pointLight1.shadow.mapSize.set(1024, 1024)
pointLight1.shadow.type = THREE.PCFSoftShadowMap
pointLight1.shadow.camera.far = 10
pointLight1.shadow.camera.left = - 6
pointLight1.shadow.camera.top = 6
pointLight1.shadow.camera.right = 6
pointLight1.position.y = 4
scene.add(pointLight1)

// const pointLight1Helper = new THREE.CameraHelper(pointLight1.shadow.camera, 0.2)
// scene.add(pointLight1Helper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */

const objectsToUpdate = []

/**
 * Sphere Generator
 */

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    color: "#948772",
    map: metalDiffuseTexture,
    normalMap: metalNormalTexture,
    roughnessMap: metalARMTexture,
    aoMap: metalARMTexture,
    metalnessMap: metalARMTexture
})

const createSphere = (radius, position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial,
    )
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)
    // Physics
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener("collide", playHitSound)
    world.addBody(body)

    // save in objects to update
    objectsToUpdate.push({
        mesh,
        body,
    })
}

// for(let i=0; i<10; ++i){
//     const x = (Math.random() - 0.5) * 10
//     const y = 3 + (Math.random() * 5)
//     const z = (Math.random() - 0.5) * 10
//     createSphere(0.5, {x: x, y: y, z: z})
// }

debugObjects.DeploySphere = () => {
    createSphere(
        0.05 + Math.random() * 0.5,
        {
            x: (Math.random() - 0.5) * 8, 
            y: 10, 
            z: (Math.random() - 0.5) * 8,
        }
    )
}

/**
 * Cube Generator
 */

// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
// const cubeMaterial = new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
// })

// const createCube = (width, height, depth, position) => {
//     const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
//     mesh.scale.set(width, height, depth)
//     mesh.position.copy(position)
//     mesh.castShadow = true
//     scene.add(mesh)
//     // physics
//     const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2))
//     const body = new CANNON.Body({
//         shape: shape,
//         material: defaultMaterial,
//         mass: 1,
//         position: new CANNON.Vec3(0, 3, 0),
//     })
//     body.position.copy(position)
//     body.addEventListener("collide", playHitSound)
//     world.addBody(body)
//     objectsToUpdate.push({
//         mesh,
//         body,
//     })
// }

// debugObjects.DeployCube = () => {
//     createCube(
//         Math.random(),
//         Math.random(),
//         Math.random(),
//         {
//             x: (Math.random() - 0.5) * 3, 
//             y: 3, 
//             z: (Math.random() - 0.5) * 3,
//         }
//     )
// }

debugObjects.PurgeObjects = () => {
    for(let object of objectsToUpdate){
        // remover mesh
        scene.remove(object.mesh)
        // remove body
        object.body.removeEventListener("collide", playHitSound)
        world.removeBody(object.body)
        object.body = null
    }
    objectsToUpdate.length = 0;
}

gui.add(debugObjects, "DeploySphere").name("Deploy Ball")
// gui.add(debugObjects, "DeployCube").name("Deploy Box")
gui.add(debugObjects, "PurgeObjects").name("Purge")

/*
 * Fog
 */

scene.fog = new THREE.FogExp2( "#000", 0.05)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //update counter
    counter.innerHTML = objectsToUpdate.length

    // Update physics world
    world.step(1 / 60, deltaTime , 3)

    for(let i=objectsToUpdate.length-1; i>=0; --i){
        const object = objectsToUpdate[i]
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)

        // remove objects that fall off
        
        if(object.body.position.y < -10){
            // remover mesh
            scene.remove(object.mesh)
            // remove body
            object.body.removeEventListener("collide", playHitSound)
            world.removeBody(object.body)
            objectsToUpdate.splice(i, 1);
        }
    }
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()