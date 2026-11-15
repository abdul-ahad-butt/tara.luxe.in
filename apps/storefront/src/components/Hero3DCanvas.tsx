import React, { useState, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Droplets, Sparkles as SparklesIcon, ShieldCheck, RotateCcw } from 'lucide-react';

// Error Boundary to prevent any WebGL crash from affecting the UI
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[WebGL Fallback Triggered]:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------
// 3D SCULPTED 18K GOLD & DIAMOND CLOVER JEWELLERY CENTERPIECE
// -------------------------------------------------------------
interface JewelleryAssemblyProps {
  isWaterproofTestActive: boolean;
}

const GoldJewelleryAssembly: React.FC<JewelleryAssemblyProps> = ({ isWaterproofTestActive }) => {
  const masterGroupRef = useRef<THREE.Group>(null);
  const primaryHaloRef = useRef<THREE.Group>(null);
  const interlockingBandRef = useRef<THREE.Group>(null);
  const cloverMedallionRef = useRef<THREE.Group>(null);
  const dropletsGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Gentle floating master sway
    if (masterGroupRef.current) {
      masterGroupRef.current.rotation.y = Math.sin(elapsed * 0.25) * 0.15;
    }

    // Primary 18k Gold Halo Ring Rotation
    if (primaryHaloRef.current) {
      primaryHaloRef.current.rotation.y += delta * 0.35;
      primaryHaloRef.current.rotation.x = Math.sin(elapsed * 0.4) * 0.12;
    }

    // Secondary Interlocking 38° Band Counter-Rotation
    if (interlockingBandRef.current) {
      interlockingBandRef.current.rotation.y -= delta * 0.28;
      interlockingBandRef.current.rotation.z += delta * 0.15;
    }

    // Suspended Centerpiece Clover Medallion Floating & Gentle Spin
    if (cloverMedallionRef.current) {
      cloverMedallionRef.current.position.y = Math.sin(elapsed * 1.6) * 0.08;
      cloverMedallionRef.current.rotation.y += delta * 0.45;
    }

    // Orbiting 316L Waterproof Droplets
    if (dropletsGroupRef.current && isWaterproofTestActive) {
      dropletsGroupRef.current.rotation.y += delta * 0.75;
      dropletsGroupRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={masterGroupRef} position={[0, 0, 0]}>
      {/* ------------------------------------------------------------- */}
      {/* 1. PRIMARY 18K GOLD HALO RING WITH MICRO-PAVÉ RADIAL STUDS     */}
      {/* ------------------------------------------------------------- */}
      <group ref={primaryHaloRef}>
        {/* Main Solid 18k Gold Sculpted Ring */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.32, 0.15, 36, 120]} />
          <meshPhysicalMaterial
            color="#E6CA65"
            metalness={0.98}
            roughness={isWaterproofTestActive ? 0.05 : 0.12}
            clearcoat={1.0}
            clearcoatRoughness={isWaterproofTestActive ? 0.02 : 0.06}
            reflectivity={1.0}
            envMapIntensity={2.8}
          />
        </mesh>

        {/* 24 Micro-Pavé Radial Diamond Studs Orbiting Halo Rim */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const radius = 1.32;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0.095]}
              scale={0.042}
            >
              <octahedronGeometry args={[1, 1]} />
              <meshPhysicalMaterial
                color="#FFFFFF"
                transmission={0.92}
                ior={2.42} // Genuine diamond refractive index
                roughness={0.04}
                metalness={0.06}
                clearcoat={1.0}
                reflectivity={1.0}
              />
            </mesh>
          );
        })}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECONDARY INTERLOCKING 18K GOLD BAND TILTED AT 38°         */}
      {/* ------------------------------------------------------------- */}
      <group
        ref={interlockingBandRef}
        rotation={[THREE.MathUtils.degToRad(38), THREE.MathUtils.degToRad(18), THREE.MathUtils.degToRad(12)]}
      >
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.16, 0.12, 32, 100]} />
          <meshPhysicalMaterial
            color="#F3DB83"
            metalness={0.96}
            roughness={isWaterproofTestActive ? 0.06 : 0.14}
            clearcoat={1.0}
            clearcoatRoughness={isWaterproofTestActive ? 0.03 : 0.08}
            reflectivity={1.0}
            envMapIntensity={2.4}
          />
        </mesh>

        {/* Accent Diamond Solitaire setting on the interlocking band */}
        <mesh position={[0, 1.16, 0.08]} scale={0.07}>
          <octahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.94}
            ior={2.42}
            roughness={0.02}
            clearcoat={1.0}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUSPENDED CENTERPIECE DIAMOND / 4-LEAF CLOVER MEDALLION   */}
      {/* ------------------------------------------------------------- */}
      <group ref={cloverMedallionRef} position={[0, 0, 0]}>
        {/* 4 Sculpted Diamond Clover Leaves */}
        {[
          [0.22, 0.22, 0],
          [-0.22, 0.22, 0],
          [0.22, -0.22, 0],
          [-0.22, -0.22, 0]
        ].map((pos, idx) => (
          <mesh
            key={idx}
            position={pos as [number, number, number]}
            scale={[0.22, 0.22, 0.08]}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial
              color="#FFFDF5"
              transmission={0.92}
              ior={2.42} // Diamond brilliance
              roughness={0.04}
              metalness={0.06}
              clearcoat={1.0}
              reflectivity={1.0}
            />
          </mesh>
        ))}

        {/* 18k Gold Bezel Rim Framing Clover */}
        <mesh scale={[0.56, 0.56, 0.09]}>
          <torusGeometry args={[0.54, 0.045, 24, 64]} />
          <meshPhysicalMaterial
            color="#E6CA65"
            metalness={0.98}
            roughness={0.12}
            clearcoat={1.0}
          />
        </mesh>

        {/* Center Solitaire Brilliant Gemstone */}
        <mesh position={[0, 0, 0.04]} scale={0.16}>
          <octahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.95}
            ior={2.42}
            roughness={0.02}
            clearcoat={1.0}
            reflectivity={1.0}
          />
        </mesh>

        {/* Suspension Gold Bale / Jump Ring */}
        <mesh position={[0, 0.58, 0]} rotation={[0, 0, 0]} scale={[0.1, 0.14, 0.04]}>
          <torusGeometry args={[1, 0.25, 16, 32]} />
          <meshPhysicalMaterial
            color="#E6CA65"
            metalness={0.98}
            roughness={0.12}
            clearcoat={1.0}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. 316L WATERPROOF WATER DROPLETS (ACTIVE ON TEST TOGGLE)     */}
      {/* ------------------------------------------------------------- */}
      {isWaterproofTestActive && (
        <group ref={dropletsGroupRef}>
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const r = 1.75 + (i % 4) * 0.2;
            const y = Math.sin(i * 1.8) * 1.1;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
                scale={0.075 + (i % 3) * 0.035}
              >
                <sphereGeometry args={[1, 20, 20]} />
                <meshPhysicalMaterial
                  color="#A7E8FF"
                  transmission={0.96}
                  opacity={1}
                  transparent
                  roughness={0.02}
                  ior={1.33} // Water refractive index
                  thickness={0.6}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// CSS 3D LUXURY FALLBACK (IN CASE OF WEBGL HARDWARE RESTRICTION)
// -------------------------------------------------------------
const LuxuryCSS3DFallback: React.FC<{ isWaterproofTestActive: boolean }> = ({ isWaterproofTestActive }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-espresso/40 via-obsidian to-espresso/60 rounded-3xl border border-gold/20 shadow-luxury">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Shimmering Gold Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gold-brushed/80 animate-spin [animation-duration:18s] shadow-gold-glow" />
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-gold/60 animate-spin [animation-duration:12s] [animation-direction:reverse]" />

        {/* Center 18k Medallion */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-gold-brushed via-gold-light to-gold p-1 shadow-2xl flex items-center justify-center animate-pulse">
          <div className="w-full h-full rounded-full bg-obsidian flex flex-col items-center justify-center p-4 text-center border border-gold/40">
            <span className="text-gold text-2xl font-serif font-bold">18k PVD</span>
            <span className="text-[10px] tracking-widest text-ivory/80 uppercase mt-1">316L Steel</span>
            {isWaterproofTestActive && (
              <span className="text-[9px] text-emerald-stock font-mono mt-1 font-bold">100% WATERPROOF</span>
            )}
          </div>
        </div>

        {/* Ambient floating sparkles */}
        <div className="absolute top-2 left-6 text-gold animate-bounce">✦</div>
        <div className="absolute bottom-4 right-8 text-gold-light animate-ping text-sm">✦</div>
        <div className="absolute top-1/2 -left-2 text-gold-brushed text-xs">✦</div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-gold font-mono">
          Handcrafted Anti-Tarnish Finish
        </span>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// HERO 3D CANVAS COMPONENT
// -------------------------------------------------------------
export const Hero3DCanvas: React.FC = () => {
  const [isWaterproofTestActive, setIsWaterproofTestActive] = useState(false);
  const [controlsKey, setControlsKey] = useState(0);

  return (
    <div className="relative w-full h-[clamp(420px,52vw,560px)] min-h-[420px] max-h-[560px] rounded-3xl overflow-hidden glass-panel border border-gold/25 p-2 sm:p-4">
      {/* Inspector HUD Top Floating Bar (Positioned safely above 3D scene) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-espresso/90 border border-gold/40 text-[11px] font-mono text-ivory backdrop-blur-md shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span>316L Surgical Steel + 18k PVD Gold</span>
        </div>

        <button
          onClick={() => setIsWaterproofTestActive(!isWaterproofTestActive)}
          className={`pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-md ${
            isWaterproofTestActive
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-500/30 ring-2 ring-cyan-400'
              : 'bg-espresso/90 hover:bg-gold/20 text-gold-light border border-gold/40'
          }`}
          title="Toggle 316L Waterproof & Anti-Tarnish Test"
        >
          <Droplets className={`w-3.5 h-3.5 ${isWaterproofTestActive ? 'animate-bounce text-white' : 'text-cyan-400'}`} />
          <span>{isWaterproofTestActive ? 'Waterproof Test: ACTIVE' : 'Test Waterproof 316L'}</span>
        </button>
      </div>

      {/* 3D Canvas Stage */}
      <div className="w-full h-full">
        <WebGLErrorBoundary fallback={<LuxuryCSS3DFallback isWaterproofTestActive={isWaterproofTestActive} />}>
          <Canvas
            camera={{ position: [0, 0.2, 5.6], fov: 36 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMappingExposure: 1.35
            }}
          >
            {/* Rich Studio Lighting Setup for Brilliant 18k Gold Warmth */}
            <ambientLight intensity={1.5} color="#FFF8E7" />
            <directionalLight position={[8, 12, 6]} intensity={3.0} color="#FFF8E7" castShadow />
            <directionalLight position={[-8, -6, -4]} intensity={1.5} color="#E6CA65" />
            <pointLight position={[0, 3, 3]} intensity={2.5} color="#F5E6BE" />
            <pointLight position={[0, -3, -2]} intensity={1.5} color="#D4AF37" />
            <spotLight position={[0, 6, 4]} intensity={2.0} angle={0.5} penumbra={0.7} color="#FFFFFF" />

            {/* Floating 18k Sculpture */}
            <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.6}>
              <GoldJewelleryAssembly isWaterproofTestActive={isWaterproofTestActive} />
            </Float>

            {/* Warm Golden Sparkles */}
            <Sparkles
              count={45}
              scale={5}
              size={2.5}
              speed={0.5}
              color="#D4AF37"
              opacity={0.85}
            />

            <OrbitControls
              key={controlsKey}
              enableZoom={false}
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={1.0}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </WebGLErrorBoundary>
      </div>

      {/* Bottom Canvas Overlay Controls (Positioned safely below 3D scene) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian/85 border border-gold/20 text-[11px] text-ivory/70 backdrop-blur-sm">
          <SparklesIcon className="w-3 h-3 text-gold" />
          <span>Drag or swipe to rotate 3D piece</span>
        </div>

        <button
          onClick={() => setControlsKey(k => k + 1)}
          className="pointer-events-auto p-1.5 rounded-full bg-espresso/80 border border-gold/30 text-gold hover:text-ivory transition-colors shadow"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
