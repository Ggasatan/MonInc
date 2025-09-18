import * as THREE from 'three';
import { useRef, useState, type ReactNode } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO, useGLTF, useScroll, Text, Image, Scroll, Preload, ScrollControls, MeshTransmissionMaterial } from '@react-three/drei';
import { easing } from 'maath';
import styles from './MainPageEffect.module.css'

// --- 타입 정의 (변경 없음) ---
type GLTFResult = { nodes: { Cylinder: THREE.Mesh; }; materials: {}; };
type LensProps = { children: ReactNode; damping?: number; };

// 💥💥💥 Lens 컴포넌트 최종 수정 💥💥💥
function Lens({ children, damping = 0.2, ...props }: LensProps) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF('/models/lens-transformed.glb') as unknown as GLTFResult;
  // 💥 바로 여기서 width, height를 직접 구조분해 할당!
  const { width, height } = useThree((state) => state.viewport);
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    if (ref.current) {
      const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 15]);
      easing.damp3(
        ref.current.position,
        [(state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2, 15],
        damping,
        delta
      );
    }
    state.gl.setRenderTarget(buffer);
    state.gl.setClearColor('#fff');
    state.gl.render(scene, state.camera);
    state.gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(children, scene)}
    
      <mesh scale={[width || 1, height || 1, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh scale={0.25} ref={ref} rotation-x={Math.PI / 2} geometry={nodes.Cylinder.geometry} {...props}>
        <MeshTransmissionMaterial 
          buffer={buffer.texture} 
          ior={1.2} 
          thickness={1.5} 
          anisotropy={0.1} 
          chromaticAberration={0.04} 
        />
      </mesh>
    </>
  );
}


// --- Images, Typography 컴포넌트 (이전 안전장치 그대로 유지) ---
function Images() {
  const group = useRef<THREE.Group>(null);
  const data = useScroll();
  const { width, height } = useThree((state) => state.viewport);
  if (!width || !height) return null;

  useFrame(() => {
    if (group.current) {
        (group.current.children[0] as any).material.zoom = 1 + data.range(0, 1 / 3) / 3;
        (group.current.children[1] as any).material.zoom = 1 + data.range(0, 1 / 3) / 3;
        (group.current.children[2] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
        (group.current.children[3] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
        (group.current.children[4] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
        (group.current.children[5] as any).material.grayscale = 1 - data.range(1.6 / 3, 1 / 3);
        (group.current.children[6] as any).material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3;
    }
  });

  return (
    <group ref={group}>
      {/* 💥 모든 scale 배열에서 마지막 숫자 '1'을 제거! 💥 */}
      <Image position={[-2, 0, 0]} scale={[4, height]} url="/images/mainpageimg_coco.jpg" />
      <mesh position={[-2, 0, 0-0.1]}> {/* 👈 원본 이미지 바로 뒤(z: 2.9)에 배치 */}
        <planeGeometry args={[4.1, height+0.1]} /> {/* 👈 원본 이미지 크기(3)보다 가로/세로 0.1씩 크게 */}
        <meshBasicMaterial color="#4F3A7D" />
      </mesh>
      <Image position={[2, 0, 3]} scale={[3, 3]} url="/images/mainpageimg_ghost.jpg" />
      <mesh position={[2, 0, 3-0.1]}> {/* 👈 원본 이미지 바로 뒤(z: 2.9)에 배치 */}
        <planeGeometry args={[3.1, 3.1]} /> {/* 👈 원본 이미지 크기(3)보다 가로/세로 0.1씩 크게 */}
        <meshBasicMaterial color="#ffc600" />
      </mesh>
      <Image position={[-2.35, -height, 6]} scale={[1.3, 3]} url="/images/mainpageimg_phanthom.jpg" />
      <mesh position={[-2.35, -height, 6-0.1]}> {/* 👈 원본 이미지 바로 뒤(z: 2.9)에 배치 */}
        <planeGeometry args={[1.4, 3.1]} /> {/* 👈 원본 이미지 크기(3)보다 가로/세로 0.1씩 크게 */}
        <meshBasicMaterial color="#4F3A7D" />
      </mesh>
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url="/images/mainpageimg_yoda.jpg" />
      <mesh position={[-0.6, -height, 9-0.1]}> {/* 👈 원본 이미지 바로 뒤(z: 2.9)에 배치 */}
        <planeGeometry args={[1.1, 2.1]} /> {/* 👈 원본 이미지 크기(3)보다 가로/세로 0.1씩 크게 */}
        <meshBasicMaterial color="#ffc600" />
      </mesh>
      <Image position={[0.9, -height, 12.5]} scale={[1.5, 1.5]} url="/images/mainpageomg_pasta.jpg" />
      <Image position={[0, -height * 1.5, 7.5]} scale={[2.7, 3]} url="/images/mainpageomg_toystory.jpg" />
      <Image position={[0, -height * 2 - height / 7, 0]} scale={[width, height / 1.3]} url="/images/mainpageimg_toystoryend.jpg" />
    </group>
  );
}
function Typography() {
  const state = useThree();
  const { width, height } = state.viewport.getCurrentViewport(state.camera, [0, 0, 12]);
  if (!width || !height) return null; // 안전장치 유지

  const shared = { font: '/fonts/Jua-Regular.ttf', letterSpacing: -0.1,  };
  return (
    <>
      <Text color='black' anchorX="center" position={[0, -height / 2, 12]} {...shared} fontSize={0.6}>상상을 현실로!</Text>
      <Text color='#ffc600' anchorX="center" position={[0, -height / 1.999, 11.8]} {...shared} fontSize={0.6}>상상을 현실로!</Text>
      <Text color='black' anchorX="center" position={[0, -height * 1.8, 12]} {...shared} fontSize={0.3}>나만의 케릭터를 구현하여</Text>
      <Text color='#ffc600' anchorX="center" position={[0, -height * 1.799, 11.8]} {...shared} fontSize={0.3}>나만의 케릭터를 구현하여</Text>
      <Text color='black' anchorX="center" position={[0, -height * 4.624, 12]} {...shared} fontSize={0.5}>집에서 만나보세요.</Text>
      <Text color='#ffc600' anchorX="center" position={[0, -height * 4.624-0.001, 11.8]} {...shared} fontSize={0.5}>집에서 만나보세요.</Text>
    </>
  );
}


// --- 메인 컴포넌트 (변경 없음) ---
export default function MainPageEffect() {
  return (
    <Canvas className={styles.fullScreenCanvas} camera={{ position: [0, 0, 20], fov: 15 }} >
      <ScrollControls damping={0.2} pages={3} distance={0.5}>
        <Lens>
          <Scroll>
            <Typography />
            <Images />
          </Scroll>
          {/* <Scroll html>
            <div style={{ transform: 'translate3d(65vw, 192vh, 0)', color: 'black' }}></div>
          </Scroll> */}
          <Preload />
        </Lens>
      </ScrollControls>
    </Canvas>
  );
}