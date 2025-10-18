'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Stage } from '@react-three/drei'

interface ARViewerProps {
  modelUrl: string
  onClose: () => void
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export function ARViewer({ modelUrl, onClose }: ARViewerProps) {
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white"
      >
        ✕
      </button>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-white z-10">
        <p className="text-sm bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
          Drag to rotate • Pinch to zoom
        </p>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={0.5}
            environment="city"
            shadows={{
              type: 'accumulative',
              color: '#d9afd9',
              colorBlend: 2,
              opacity: 2,
            }}
            adjustCamera={1.5}
          >
            <Model url={modelUrl} />
          </Stage>
          
          <Environment preset="sunset" />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

