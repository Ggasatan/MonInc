import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ProductModelViewerProps {
  modelUrl: string;
}

// ✅ 이 컴포넌트는 이제 '렌더링'과 '애니메이션'만 담당합니다.
const Model = ({ scene }: { scene: THREE.Group }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // 애니메이션은 이제 y축을 기준으로만 살짝 움직입니다. 초기 위치는 부모가 결정합니다.
      groupRef.current.position.y = Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};

const ProductModelViewer = ({ modelUrl }: ProductModelViewerProps) => {
  const { scene } = useGLTF(modelUrl);
  
  // ✅ [핵심] useMemo를 사용해, 모델이 로드될 때 '크기'와 '위치' 계산을 딱 한 번만 수행합니다.
  const { scale, position } = useMemo(() => {
    // 1. scene을 직접 측정하여 정확한 박스를 계산합니다.
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // 2. 크기를 계산합니다.
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 2.5;
    const scale = desiredSize / maxDim;

    // 3. 위치를 계산합니다.
    const verticalOffset = 0.3; // 아래로 내릴 값
    const position = new THREE.Vector3(
      -center.x * scale,
      (-center.y * scale) - verticalOffset,
      -center.z * scale
    );
    
    return { scale, position };
  }, [scene]); // scene이 바뀔 때만 이 계산을 다시 합니다.

  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 50 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />

        {/* ✅ [핵심] 계산된 scale과 position을 모델을 감싸는 group에 직접 적용합니다. */}
        <group scale={scale} position={position}>
          <Model scene={scene} />
        </group>
        
        <ContactShadows
          position={[0, -1.4, 0]} // y 위치를 살짝 조정
          opacity={0.7}
          scale={10}
          blur={1.5}
        />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  );
};

export default ProductModelViewer;