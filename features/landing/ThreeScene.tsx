'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Mouse tracking
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // Particles
    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x8B2C4C,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Floating shapes
    const shapes: THREE.Object3D[] = []
    const shapeColors = [0x8B2C4C, 0x405C36, 0x223D19, 0xd4a574]

    const createShape = (type: 'torus' | 'icosahedron' | 'octahedron') => {
      let geo: THREE.BufferGeometry
      if (type === 'torus') geo = new THREE.TorusGeometry(0.5, 0.15, 8, 24)
      else if (type === 'icosahedron') geo = new THREE.IcosahedronGeometry(0.5, 0)
      else geo = new THREE.OctahedronGeometry(0.5, 0)

      const mat = new THREE.MeshStandardMaterial({
        color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      })
      return new THREE.Mesh(geo, mat)
    }

    const shapeTypes: ('torus' | 'icosahedron' | 'octahedron')[] = ['torus', 'icosahedron', 'octahedron']
    for (let i = 0; i < 6; i++) {
      const shape = createShape(shapeTypes[i % 3])
      shape.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3 - 1
      )
      shape.userData = {
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
      }
      scene.add(shape)
      shapes.push(shape)
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0x8B2C4C, 2, 20)
    pointLight.position.set(2, 2, 4)
    scene.add(pointLight)
    const greenLight = new THREE.PointLight(0x405C36, 1.5, 15)
    greenLight.position.set(-3, -1, 3)
    scene.add(greenLight)

    // Animation
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Camera parallax
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      // Animate shapes
      shapes.forEach((shape, i) => {
        shape.position.x += shape.userData.speedX * 0.01
        shape.position.y += Math.sin(elapsed * 0.5 + i) * 0.003
        shape.rotation.x += shape.userData.rotSpeedX
        shape.rotation.y += shape.userData.rotSpeedY

        // Bounce off edges
        if (Math.abs(shape.position.x) > 3) shape.userData.speedX *= -1
        if (Math.abs(shape.position.y) > 2) shape.userData.speedY *= -1
      })

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.05
      particles.rotation.x = elapsed * 0.02

      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg, #223D19 0%, #070B06 50%, #1a0a14 100%)' }}
    />
  )
}
