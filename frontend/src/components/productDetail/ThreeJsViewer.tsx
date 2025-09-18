// src/components/productDetail/ThreeJsViewer.tsx

import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds  } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { type ProductDetail } from '../../types/product';
// ✅ [수정] 필요한 타입만 가져옵니다.
import { type CustomizablePart, type MaterialOverrides } from '../../types/productDetail';

interface ModelProps {
  productInfo: ProductDetail | null;
  materialOverrides: MaterialOverrides;
  onPartsDiscovered: (parts: CustomizablePart[]) => void;
}

interface GLTFResult extends GLTF {
  nodes: Record<string, THREE.SkinnedMesh>;
  materials: Record<string, THREE.MeshStandardMaterial>;
}

const Model = ({ productInfo, materialOverrides, onPartsDiscovered }: ModelProps) => {
  const { modelUrl} = productInfo || {};
  if (!modelUrl) return null;

  const { scene } = useGLTF(modelUrl) as unknown as GLTFResult;
  // ✅ [개선] useMemo를 사용해 scene을 복제하고, 이 복제본만 사용해서 원본을 보호한다.
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // ✅ [추가] 모델이 처음 로드될 때, 커스텀 가능한 파츠를 찾아 부모에게 알리는 로직
  useEffect(() => {
    const parts: CustomizablePart[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.isCustomizable === true && object.userData.displayName) {
        parts.push({ meshName: object.name, displayName: object.userData.displayName });
      }
    });

    console.log("모델에서 찾은 커스텀 가능 파츠:", parts); 

    const uniqueParts = Array.from(new Map(parts.map(p => [p.displayName, p])).values());
    onPartsDiscovered(uniqueParts);
  }, [scene, onPartsDiscovered]);

  useEffect(() => {
    if (!clonedScene || Object.keys(materialOverrides).length === 0) return;

    // displayName을 키로, 재질 속성을 값으로 가지는 Map을 만들어 빠른 조회를 돕습니다.
    const overridesMap = new Map(Object.entries(materialOverrides));

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.userData.displayName) {
        const partOverrides = overridesMap.get(node.userData.displayName);

        if (partOverrides) {
          // 재질이 복제되지 않았다면, 원본을 보존하기 위해 복제합니다.
          if (!(node.material as any).isCloned) {
            node.material = (node.material as THREE.Material).clone();
            (node.material as any).isCloned = true;
          }
          
          const material = node.material as THREE.MeshStandardMaterial;
          // 새로운 값으로 재질 속성을 업데이트합니다.
          material.color.set(partOverrides.color);
          material.metalness = partOverrides.metalness;
          material.roughness = partOverrides.roughness;
        }
      }
    });
  }, [materialOverrides, clonedScene]); // materialOverrides가 바뀔 때마다 이 효과가 실행됩니다!

  // ✅ [최종 전략] 재조립하지 않고, 복제된 scene을 통째로 렌더링한다!
  return <primitive object={clonedScene}/>;
};


// ✅ [수정] ThreeJsViewer 컴포넌트의 props 타입 및 전달 로직
interface ThreeJsViewerProps {
  productInfo: ProductDetail | null;
  onPartsDiscovered: (parts: CustomizablePart[]) => void; // props 타입에 추가
  materialOverrides: MaterialOverrides;
}

const ThreeJsViewer: React.FC<ThreeJsViewerProps> = ({ 
  productInfo, onPartsDiscovered, materialOverrides
 }) => {
  return (
    <Canvas style={{ background: '#282c34' }} camera={{ position: [0, 1, 8], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, 0, -5]} intensity={1} />
      
      <React.Suspense fallback={null}>
        <group position={[0, -2, 0]}> 
          <Bounds fit clip observe margin={1.8}>
            <Model 
              productInfo={productInfo}
              materialOverrides={materialOverrides}
              onPartsDiscovered={onPartsDiscovered}
            />
          </Bounds>
        </group>
      </React.Suspense>
      
      <OrbitControls  enableZoom={true} />
    </Canvas>
  );
};

export default ThreeJsViewer;