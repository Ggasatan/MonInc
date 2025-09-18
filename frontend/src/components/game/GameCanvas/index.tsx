import React, { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider  } from '@react-three/rapier';
import { useGLTF, Gltf, Environment, KeyboardControls } from '@react-three/drei';
import Controller from 'ecctrl';
import * as THREE from 'three';

interface GameCanvasProps {
  modelUrl: string; // 어떤 모델을 렌더링할지 prop으로 받습니다.
  materialOverrides: string | null;
}

interface MaterialProperties {
  color: string;
  metalness: number;
  roughness: number;
}

type MaterialOverridesObject = Record<string, MaterialProperties>;

const Character = ({ modelUrl, materialOverrides }: GameCanvasProps) => {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    // 재질 정보가 없거나, 유효하지 않은 JSON이면 아무것도 하지 않음
    if (!materialOverrides) return;

    try {
      const overrides: MaterialOverridesObject = JSON.parse(materialOverrides);
      
      clonedScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const partDisplayName = object.userData.displayName;
          if (partDisplayName && overrides[partDisplayName]) {
            const partOverrides = overrides[partDisplayName];
            // ... (ProductDetailPage의 ThreeJsViewer에서 복사해 온 재질 적용 로직)
            if (!(object.material as any).isCloned) {
              object.material = object.material.clone();
              (object.material as any).isCloned = true;
            }
            const material = object.material as THREE.MeshStandardMaterial;
            material.color.set(partOverrides.color);
            material.metalness = partOverrides.metalness;
            material.roughness = partOverrides.roughness;
            material.needsUpdate = true;
          }
        }
      });
    } catch (e) {
      console.error("재질 정보를 파싱하는데 실패했습니다:", e);
    }
  }, [modelUrl, materialOverrides, clonedScene]); // modelUrl이나 재질이 바뀔 때마다 실행

  return <primitive castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} object={clonedScene} />;
}

const GameCanvas = ({ modelUrl, materialOverrides }: GameCanvasProps) => {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ];

  return (
    <Canvas shadows onPointerDown={(e) => (e.target as HTMLElement).requestPointerLock()}>
      <Environment files="/night.hdr" ground={{ scale: 100 }} />
      <directionalLight intensity={0.7} castShadow position={[-20, 20, 20]} />
      <ambientLight intensity={0.2} />
      <Physics timeStep="vary">
        <KeyboardControls map={keyboardMap}>
          <Controller maxVelLimit={5}>
            {/* ✅ [핵심] prop으로 받은 modelUrl을 사용해 캐릭터를 렌더링합니다. */}
               <Character modelUrl={modelUrl} materialOverrides={materialOverrides} />
          </Controller>
        </KeyboardControls>
        <RigidBody type="fixed" colliders="trimesh">
          <Gltf 
            castShadow 
            receiveShadow 
            rotation={[-Math.PI / 2, 0, 0]} 
            scale={0.11} 
            src="/models/fantasy_game_inn2-transformed.glb" // public 폴더 기준 경로
          />
        </RigidBody>
        <RigidBody type="fixed">
          {/* 
            CuboidCollider의 args는 [가로 절반, 세로 절반, 깊이 절반] 크기입니다.
            맵의 크기를 대략 가로 50, 세로 50이라고 가정하고 벽을 세웁니다.
          */}

          {/* 뒷 벽 */}
          <CuboidCollider args={[37, 5, 1]} position={[0, 3, -9]} />
          {/* 앞 벽 */}
            <CuboidCollider args={[37, 13, 1]} position={[0, 5, 8]} />
          {/* 왼쪽 벽 */}
            <CuboidCollider args={[1, 13, 37]} position={[-4, 5, 0]} />
          {/* 오른쪽 벽 */}
          <CuboidCollider args={[1, 5, 37]} position={[6, 5, 0]} />
        </RigidBody>        
     </Physics>
    </Canvas>
  );
};

export default GameCanvas;