import type { TopicCodeExamples } from '../types/topic';

export const TOPIC_CODE_EXAMPLES: Record<string, TopicCodeExamples> = {
  'object-pooling': {
    pureLogic: {
      title: 'Object Pool ด้วย Free-List Stack (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ การสร้าง/ลบ Object ใน Memory แบบไดนามิกทุกเฟรม (GC Churn)',
      badCode: `// ผิด: สร้าง instance ใหม่และปล่อยให้ GC ตามเก็บทุกรอบ
const activeBullets: Array<{ x: number; y: number; active: boolean }> = [];

function spawnBullet(x: number, y: number) {
  // สร้าง Heap Allocation ใหม่ทุกนัดที่ยิง!
  activeBullets.push({ x, y, active: true });
}

function updateBullets() {
  // กรองด้วย filter() สร้าง array ใหม่บน Heap ทุกเฟรม!
  activeBullets.filter(b => b.active);
}`,
      goodTitle: '✅ ใช้ Free-List Object Pool ดึง/คืนกลับแบบ O(1) ไร้ขยะ Heap',
      goodCode: `class ObjectPool<T> {
  private freeList: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;

  constructor(factory: () => T, reset: (item: T) => void, capacity: number) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < capacity; i++) {
      this.freeList.push(this.factory());
    }
  }

  public acquire(): T {
    return this.freeList.length > 0 ? this.freeList.pop()! : this.factory();
  }

  public release(item: T): void {
    this.reset(item);
    this.freeList.push(item);
  }
}`,
      explanation: 'การใช้ Free-List Stack ช่วยให้เวลาในการจองและคืนของเป็น O(1) คงที่ตลอดเวลา ขจัดปัญหาการหยุดโลกของ Garbage Collector',
    },
    unity: {
      title: 'Object Pooling ใน Unity (UnityEngine.Pool & C#)',
      language: 'csharp',
      badTitle: '❌ เรียก Instantiate และ Destroy ทุกเฟรม (GC Spike Stutter)',
      badCode: `// ผิด: สร้างและทำลาย GameObject บน Heap ซ้ำๆ
void FireBullet() {
    // จองหน่วยความจำบน Managed Heap ทุกนัด
    GameObject bullet = Instantiate(bulletPrefab, firePoint.position, firePoint.rotation);
    // สั่งทำลาย - ยิ่งยิงเร็ว GC ยิ่งสั่ง Freeze เกม
    Destroy(bullet, 3.0f);
}`,
      goodTitle: '✅ ใช้ UnityEngine.Pool.ObjectPool<T> ใน Unity 2021+',
      goodCode: `using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour {
    [SerializeField] private Bullet bulletPrefab;
    private IObjectPool<Bullet> bulletPool;

    void Awake() {
        bulletPool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: (b) => b.gameObject.SetActive(true),
            actionOnRelease: (b) => b.gameObject.SetActive(false),
            actionOnDestroy: (b) => Destroy(b.gameObject),
            defaultCapacity: 100,
            maxSize: 500
        );
    }

    void FireBullet() {
        Bullet b = bulletPool.Get();
        b.transform.SetPositionAndRotation(firePoint.position, firePoint.rotation);
        b.Init(bulletPool); // ส่ง pool ให้กระสุนเรียก Release() เมื่อหมดอายุ
    }
}`,
      explanation: 'UnityEngine.Pool มีมาให้ในตัวตั้งแต่ Unity 2021+ พร้อมระบบ Thread Safety และ Leak Tracking ใน Editor',
    },
    unreal: {
      title: 'Actor Component Pool ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ เรียก SpawnActor และ Destroy ทุกครั้งที่ยิงกระสุน',
      badCode: `// ผิด: SpawnActor มีค่าใช้จ่ายสูงมากจาก World Registration
void AWeapon::Fire() {
    FActorSpawnParameters SpawnParams;
    // จอง UObject และลงทะเบียน Tick/Subobjects ใหม่ทุกนัด
    ABullet* Bullet = GetWorld()->SpawnActor<ABullet>(BulletClass, MuzzleLocation, MuzzleRotation, SpawnParams);
    Bullet->SetLifeSpan(3.0f); // เรียก DestroyActor() ในเบื้องหลัง
}`,
      goodTitle: '✅ นำ Actor กลับมาใช้ซ้ำด้วย Hidden State & Collision Toggle',
      goodCode: `// เก็บ Pool ใน TArray และเปิด/ปิดการทำงานแทนการ Spawn ใหม่
ABullet* AWeaponPool::AcquireBullet() {
    for (ABullet* Bullet : BulletPool) {
        if (Bullet->IsHidden()) {
            Bullet->SetActorLocationAndRotation(MuzzleLocation, MuzzleRotation);
            Bullet->SetActorHiddenInGame(false);
            Bullet->SetActorEnableCollision(true);
            Bullet->SetActorTickEnabled(true);
            return Bullet;
        }
    }
    // หาก Pool เต็ม ให้สร้างเพิ่มและเก็บเข้าคลัง
    ABullet* NewBullet = GetWorld()->SpawnActor<ABullet>(BulletClass);
    BulletPool.Add(NewBullet);
    return NewBullet;
}

void AWeaponPool::ReleaseBullet(ABullet* Bullet) {
    Bullet->SetActorHiddenInGame(true);
    Bullet->SetActorEnableCollision(false);
    Bullet->SetActorTickEnabled(false);
}`,
      explanation: 'ใน Unreal Engine การหลีกเลี่ยง SpawnActor() ช่วยลดค่าใช้จ่ายในการลงทะเบียน World Actor Tick และ Subobject Initializations ได้อย่างมหาศาล',
    },
  },

  'spatial-partitioning': {
    pureLogic: {
      title: 'Spatial Hash Grid สำหรับตรวจจับการชน (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ ตรวจสอบการชนแบบจับคู่ทุกตัว O(N²) Brute-Force',
      badCode: `// ผิด: ตรวจสอบทุกคู่ O(N²) - หากมี 2,000 วัตถุ ต้องคำนวณถึง 2,000,000 ครั้ง!
function checkCollisionsBruteForce(entities: Entity[]) {
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const dx = entities[i].x - entities[j].x;
      const dy = entities[i].y - entities[j].y;
      if (Math.hypot(dx, dy) < entities[i].radius + entities[j].radius) {
        handleCollision(entities[i], entities[j]);
      }
    }
  }
}`,
      goodTitle: '✅ แบ่งช่องตาราง Spatial Hash Grid ตรวจสอบเฉพาะเพื่อนบ้าน O(N)',
      goodCode: `class SpatialHashGrid {
  private cellSize: number;
  private cells: Map<string, Entity[]> = new Map();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number): string {
    return \`\${Math.floor(x / this.cellSize)}:\${Math.floor(y / this.cellSize)}\`;
  }

  public insert(entity: Entity): void {
    const key = this.getKey(entity.x, entity.y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key)!.push(entity);
  }

  public queryNeighbors(entity: Entity): Entity[] {
    const cx = Math.floor(entity.x / this.cellSize);
    const cy = Math.floor(entity.y / this.cellSize);
    const neighbors: Entity[] = [];

    // ตรวจสอบเฉพาะ 9 ช่องรอบตัว (3x3 grid)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = this.cells.get(\`\${cx + dx}:\${cy + dy}\`);
        if (bucket) neighbors.push(...bucket);
      }
    }
    return neighbors;
  }
}`,
      explanation: 'Spatial Hash Grid ตัดการคำนวณที่ไม่เกี่ยวข้องทิ้งลง 99% ทำให้คำนวณการชนของวัตถุหลายพันชิ้นได้ที่ 60 FPS นิ่งสนิท',
    },
    unity: {
      title: 'Spatial Query & Non-Alloc Physics ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ วนลูป GameObject ทุกตัวหรือใช้ Physics.OverlapSphere (GC Alloc)',
      badCode: `// ผิด: OverlapSphere สร้าง Array ใหม่บน Heap ทุกครั้งที่เรียก!
void CheckEnemiesNearby() {
    // จอง Collider[] บน Managed Heap ทุกครั้งที่เรียก
    Collider[] hits = Physics.OverlapSphere(transform.position, 10f);
    foreach (var hit in hits) {
        // ประมวลผล
    }
}`,
      goodTitle: '✅ ใช้ Physics.OverlapSphereNonAlloc ร่วมกับ LayerMask',
      goodCode: `public class SpatialRadar : MonoBehaviour {
    private readonly Collider[] hitBuffer = new Collider[32]; // Pre-allocated Buffer
    [SerializeField] private LayerMask enemyLayer;

    void CheckEnemiesNearby() {
        // ไร้ GC Allocation: คืนค่าจำนวนตัวที่เจอ และเขียนลง hitBuffer เดิม
        int hitCount = Physics.OverlapSphereNonAlloc(
            transform.position, 
            10f, 
            hitBuffer, 
            enemyLayer
        );

        for (int i = 0; i < hitCount; i++) {
            Collider enemy = hitBuffer[i];
            // ทำงานกับศัตรูในระยะ
        }
    }
}`,
      explanation: 'OverlapSphereNonAlloc ร่วมกับ LayerMask บังคับให้การสืบค้นพื้นที่ทำงานในระดับ C++ PhysX BVH Tree โดยไม่มี Garbage Allocation เกิดขึ้นเลย',
    },
    unreal: {
      title: 'Spatial Bounds Query ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ วนลูป TActorIterator<AActor> ทั่วทั้งโลกทุกเฟรม',
      badCode: `// ผิด: วนลูป Actor ทั้งหมดในฉาก ซึ่งอาจมีเป็นหมื่นตัว
void AMyManager::FindNearbyEnemies(FVector Origin, float Radius) {
    for (TActorIterator<AEnemyCharacter> It(GetWorld()); It; ++It) {
        if (FVector::Dist(Origin, It->GetActorLocation()) < Radius) {
            // ทำงาน - ช้ามากเพราะเข้าถึง Actor ที่อยู่ห่างไกลออกไปด้วย
        }
    }
}`,
      goodTitle: '✅ ใช้ FCollisionShape & OverlapMultiByChannel (PhysX/Chaos BVH)',
      goodCode: `void AMyManager::FindNearbyEnemiesOptimized(const FVector& Origin, float Radius) {
    TArray<FOverlapResult> OverlapResults;
    FCollisionShape SphereShape = FCollisionShape::MakeSphere(Radius);
    FCollisionQueryParams QueryParams;
    QueryParams.AddIgnoredActor(this);

    // ใช้ Chaos / PhysX Spatial Acceleration Structure ค้นหาในเวลา O(log N)
    bool bHit = GetWorld()->OverlapMultiByChannel(
        OverlapResults,
        Origin,
        FQuat::Identity,
        ECC_Pawn,
        SphereShape,
        QueryParams
    );

    if (bHit) {
        for (const FOverlapResult& Res : OverlapResults) {
            AActor* HitActor = Res.GetActor();
            // จัดการศัตรูที่อยู่ในขอบเขต
        }
    }
}`,
      explanation: 'OverlapMultiByChannel ใช้ประโยชน์จากโครงสร้างข้อมูล BVH (Bounding Volume Hierarchy) ในเอนจิน Chaos Physics ค้นหาเฉพาะกิ่งไม้ที่อยู่ในระยะอย่างรวดเร็ว',
    },
  },

  'ecs-dod': {
    pureLogic: {
      title: 'Structure of Arrays (SoA) vs Array of Structures (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ Array of Structures (AoS): ข้อมูลกระจัดกระจายเกิด Cache Miss',
      badCode: `// ผิด: Object แตกเป็น Pointer Reference กระจายตัวทั่วหน่วยความจำ
class Particle {
  constructor(public x: number, public y: number, public vx: number, public vy: number) {}
}
const particles: Particle[] = [];
// ในลูปอัปเดต CPU ต้องกระโดดไปตาม Pointer ทั่ว RAM เพื่อหยิบข้อมูลแต่ละตัว`,
      goodTitle: '✅ Structure of Arrays (SoA): ข้อมูลเรียงชิดติดกันใน TypedArray',
      goodCode: `// ถูก: ข้อมูลตัวเลขเรียงต่อเนื่องในหน่วยความจำ (Continuous Memory Buffer)
class ParticleSystemSoA {
  public posX: Float32Array;
  public posY: Float32Array;
  public velX: Float32Array;
  public velY: Float32Array;

  constructor(count: number) {
    this.posX = new Float32Array(count);
    this.posY = new Float32Array(count);
    this.velX = new Float32Array(count);
    this.velY = new Float32Array(count);
  }

  public update(dt: number): void {
    // CPU ดึง L1/L2 Cache Line ได้ทีละ 16 floats พร้อมกัน และรองรับ SIMD
    for (let i = 0; i < this.posX.length; i++) {
      this.posX[i] += this.velX[i] * dt;
      this.posY[i] += this.velY[i] * dt;
    }
  }
}`,
      explanation: 'SoA จัดเก็บข้อมูลแบบ Linear Buffer ทำให้ CPU Prefetcher โหลดข้อมูลเข้า L1 Data Cache ได้ล่วงหน้า 100% ไร้การสะดุดจาก Cache Misses',
    },
    unity: {
      title: 'Unity DOTS / Entities (ECS) ใน C#',
      language: 'csharp',
      badTitle: '❌ หมื่น GameObject แต่ละตัวมี MonoBehaviour.Update() ของตัวเอง',
      badCode: `// ผิด: 10,000 GameObjects = 10,000 Virtual Function Calls ข้าม C++ Native
public class MonsterOOP : MonoBehaviour {
    public float speed;
    void Update() {
        transform.position += Vector3.forward * speed * Time.deltaTime;
    }
}`,
      goodTitle: '✅ ใช้ Unity ECS (IComponentData & ISystem) + Burst',
      goodCode: `using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using Unity.Burst;

public struct MonsterData : IComponentData {
    public float speed;
}

[BurstCompile]
public partial struct MonsterMovementSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;
        // วนลูปผ่าน Entity Chunks ที่เรียงต่อกันในหน่วยความจำ
        foreach (var (transform, monster) in 
                 SystemAPI.Query<RefRW<LocalTransform>, RefRO<MonsterData>>()) {
            transform.ValueRW.Position += new float3(0, 0, monster.ValueRO.speed * dt);
        }
    }
}`,
      explanation: 'Unity DOTS จัดเก็บ Components ลงใน Archetype Chunks ขนาด 16KB ทำให้ Burst Compiler แปลงโค้ดเป็นชุดคำสั่งเวกเตอร์ SIMD ทำงานได้เร็วกว่าเดิม 50 เท่า',
    },
    unreal: {
      title: 'Unreal Engine Mass Entity Framework (C++)',
      language: 'cpp',
      badTitle: '❌ แสนตัวละครสืบทอดจาก AActor พร้อม SceneComponent และ Tick',
      badCode: `// ผิด: AActor หนักมาก (กินแรมกว่า 1KB ต่อตัว) และมี Virtual Table ลึก
UCLASS()
class ACrowdActor : public AActor {
    GENERATED_BODY()
public:
    virtual void Tick(float DeltaTime) override {
        Super::Tick(DeltaTime);
        AddActorWorldOffset(FVector(100.0f * DeltaTime, 0, 0));
    }
};`,
      goodTitle: '✅ ใช้ Unreal Mass Entity (FMassFragment & UMassProcessor)',
      goodCode: `// ข้อมูล Fragment น้ำหนักเบา ไร้ Virtual Functions
USTRUCT()
struct FMovementFragment : public FMassFragment {
    GENERATED_BODY()
    FVector Velocity;
};

// Processor ประมวลผลข้อมูลก้อนใหญ่ทีละ Batch
void UMassMovementProcessor::Execute(FMassEntityManager& EntityManager, FMassExecutionContext& Context) {
    EntityQuery.ForEachEntityChunk(EntityManager, Context, [](FMassExecutionContext& Context) {
        const int32 NumEntities = Context.GetNumEntities();
        TArrayView<FTransformFragment> Transforms = Context.GetMutableFragmentView<FTransformFragment>();
        TConstArrayView<FMovementFragment> Movements = Context.GetFragmentView<FMovementFragment>();

        for (int32 i = 0; i < NumEntities; ++i) {
            Transforms[i].Transform.AddToTranslation(Movements[i].Velocity * Context.GetDeltaTimeSeconds());
        }
    });
}`,
      explanation: 'Unreal Mass Entity ทำงานกับ Struct ชนิด Fragment ล้วนๆ ช่วยให้รองรับฝูงชนในเมือง (เช่น The Matrix Awakens) ได้หลายหมื่นตัวที่ 60 FPS',
    },
  },

  'fixed-timestep': {
    pureLogic: {
      title: 'Accumulator Loop กับ Substepping (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ การเคลื่อนที่ตาม Variable Delta Time โดยตรง (กระสุนทะลุกำแพง)',
      badCode: `// ผิด: เมื่อเกิด Lag Spike (dt = 0.2s) กระสุนจะพุ่งไกลจนข้ามกำแพงไปเลย!
function updateMovement(bullet: { x: number; vx: number }, dt: number) {
  bullet.x += bullet.vx * dt; // Tunneling เกิดขึ้นทันทีเมื่อเครื่องกระตุก
}`,
      goodTitle: '✅ Accumulator Pattern รักษา Fixed Step คงที่ และ Substep ย่อย',
      goodCode: `class PhysicsEngine {
  private readonly FIXED_DT = 1 / 60; // 0.0166s คงที่เสมอ
  private accumulator = 0;

  public update(realDeltaTime: number): void {
    // ป้องกัน Spiral of Death เมื่อเครื่องค้างนาน
    const clampedDt = Math.min(realDeltaTime, 0.25);
    this.accumulator += clampedDt;

    // รันฟิสิกส์เป็นรอบย่อยๆ ที่มีช่วงเวลาแน่นอน (Deterministic)
    while (this.accumulator >= this.FIXED_DT) {
      this.stepPhysics(this.FIXED_DT);
      this.accumulator -= this.FIXED_DT;
    }

    // Alpha สำหรับการ Interpolate กราฟิกให้เนียนตา
    const alpha = this.accumulator / this.FIXED_DT;
    this.interpolateRender(alpha);
  }

  private stepPhysics(dt: number) { /* ฟิสิกส์คำนวณที่ dt คงที่ 100% */ }
  private interpolateRender(alpha: number) { /* แสดงผล */ }
}`,
      explanation: 'การใช้ Accumulator Loop ทำให้ฟิสิกส์มีความสม่ำเสมอและแก้ปัญหา Tunneling อย่างเด็ดขาด',
    },
    unity: {
      title: 'FixedUpdate & Continuous Collision ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ ขยับ Rigidbody ใน Update() และใช้ Discrete Collision Detection',
      badCode: `// ผิด: Rigidbody ขยับใน Update เกิดการคำนวณฟิสิกส์ผิดจังหวะ และกระสุนทะลุกำแพง
void Update() {
    rb.velocity = transform.forward * speed; // ขัดแย้งกับ Physics Step!
}`,
      goodTitle: '✅ ขยับใน FixedUpdate() และเปิด Continuous Dynamic Collision',
      goodCode: `public class HighSpeedProjectile : MonoBehaviour {
    [SerializeField] private Rigidbody rb;
    [SerializeField] private float speed = 100f;

    void Awake() {
        // ป้องกันการทะลุทะลวงของวัตถุความเร็วสูงผ่าน Ray-sweep
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
    }

    void FixedUpdate() {
        // สอดคล้องกับ PhysX Substep Timer เสมอ
        rb.linearVelocity = transform.forward * speed;
    }
}`,
      explanation: 'การใช้ FixedUpdate คู่กับ CollisionDetectionMode.ContinuousDynamic จะใช้ Continuous Ray-Sweep ตรวจจับตลอดเส้นทางการเคลื่อนที่',
    },
    unreal: {
      title: 'Physics Substepping & Sweep Offset ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ อัปเดตตำแหน่งด้วย AddActorWorldOffset โดยปิด Sweep Collision',
      badCode: `// ผิด: bSweep = false ทำให้ตัวละครเทเลพอร์ตข้ามกำแพงในเฟรมที่แล็ก
void ABullet::Tick(float DeltaTime) {
    Super::Tick(DeltaTime);
    AddActorWorldOffset(Velocity * DeltaTime, false); // ทะลุกำแพงได้!
}`,
      goodTitle: '✅ เปิด bSweep = true และใช้งาน Chaos Physics Substepping',
      goodCode: `void ABullet::Tick(float DeltaTime) {
    Super::Tick(DeltaTime);

    FHitResult HitResult;
    // bSweep = true: ตรวจสอบการชนตลอดเส้นทางระหว่างตำแหน่งเดิมถึงตำแหน่งใหม่
    AddActorWorldOffset(Velocity * DeltaTime, true, &HitResult);

    if (HitResult.bBlockingHit) {
        OnImpact(HitResult);
    }
}

// ใน Project Settings: เปิด bSubstepping = true
// MaxSubstepDeltaTime = 0.0166f, MaxSubsteps = 6`,
      explanation: 'Unreal Engine Substepping จะแบ่ง Tick ฟิสิกส์ออกเป็นช่วงย่อยๆ โดยอัตโนมัติหากเฟรมเรตตก',
    },
  },

  'draw-calls-batching': {
    pureLogic: {
      title: 'Hardware Instancing เทียบกับ Draw Calls เดี่ยว (Pure WebGL)',
      language: 'typescript',
      badTitle: '❌ เรียกคำสั่ง drawElements ทีละวัตถุในลูป (CPU Driver Choke)',
      badCode: `// ผิด: ส่งคำสั่งวาด 1,000 ครั้ง = CPU เสียเวลาคุยกับ Driver 1,000 รอบ!
for (let i = 0; i < objects.length; i++) {
  gl.uniformMatrix4fv(modelMatrixLoc, false, objects[i].matrix);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0); // 1,000 Draw Calls!
}`,
      goodTitle: '✅ ส่ง Attribute Matrix Buffer รวม แล้วสั่งวาดรอบเดียวด้วย Instanced Call',
      goodCode: `// ถูก: รวบรวมตำแหน่งลง Instance Buffer แล้วสั่งวาดเพียง 1 ครั้ง!
const instanceMatrixBuffer = new Float32Array(count * 16);
// ... เติม Matrix ข้อมูลทุกตัวลงใน Buffer ...

gl.bindBuffer(gl.ARRAY_BUFFER, matrixBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, instanceMatrixBuffer, gl.DYNAMIC_DRAW);

// 1 คำสั่งวาดสำหรับ 1,000 วัตถุพร้อมกัน!
gl.drawElementsInstanced(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0, count);`,
      explanation: 'Instanced Drawing ถ่ายโอนงานกระจายวัตถุไปให้ GPU Vertex Shader ทำงาน ลด CPU Driver Overhead เหลือศูนย์',
    },
    unity: {
      title: 'GPU Instancing & MaterialPropertyBlock ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ เปลี่ยน Material.color โดยตรง (ทำให้ Material Clone และหลุด Batch)',
      badCode: `void Start() {
    // ผิดมหันต์: renderer.material จะ Clone วัสดุใหม่ขึ้นมา ทำให้รวม Draw Call ไม่ได้!
    GetComponent<Renderer>().material.color = Color.red;
}`,
      goodTitle: '✅ ใช้ MaterialPropertyBlock ร่วมกับ Shader GPU Instancing',
      goodCode: `public class AsteroidBatch : MonoBehaviour {
    private static MaterialPropertyBlock propBlock;
    [SerializeField] private Renderer meshRenderer;

    void Start() {
        if (propBlock == null) propBlock = new MaterialPropertyBlock();

        // ส่งตัวแปรสีเฉพาะตัวโดยไม่ Clone Material
        propBlock.SetColor("_Color", Random.ColorHSV());
        meshRenderer.SetPropertyBlock(propBlock);
    }
}
// ใน Material: ติ๊กถูกที่ช่อง "Enable GPU Instancing"`,
      explanation: 'MaterialPropertyBlock ป้องกันการ Clone ของ Material ทำให้ Unity SRP สามารถผสาน Mesh เข้าเป็น Instanced Draw Call เดียวกันได้',
    },
    unreal: {
      title: 'Instanced Static Mesh Component ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ สร้าง StaticMeshComponent แยกชิ้นละ 1 ตัวต่อก้อนหินทุกก้อน',
      badCode: `// ผิด: สร้าง 2,000 Component = 2,000 Draw Calls บน GPU
for (int32 i = 0; i < 2000; i++) {
    UStaticMeshComponent* Mesh = NewObject<UStaticMeshComponent>(this);
    Mesh->SetStaticMesh(RockMesh);
    Mesh->RegisterComponent();
}`,
      goodTitle: '✅ ใช้ UHierarchicalInstancedStaticMeshComponent (HISM)',
      goodCode: `void AForestSpawner::SpawnTreesBatch() {
    // 1 Component สำหรับวาดต้นไม้ทั้งหมดใน Draw Call เดียว
    UHierarchicalInstancedStaticMeshComponent* HISM = 
        NewObject<UHierarchicalInstancedStaticMeshComponent>(this);
    HISM->SetStaticMesh(TreeMesh);
    HISM->RegisterComponent();

    for (int32 i = 0; i < 2000; i++) {
        FTransform InstanceTransform(Rotations[i], Positions[i], Scales[i]);
        // เพิ่ม Instance ลงในฮาร์ดแวร์บัฟเฟอร์
        HISM->AddInstance(InstanceTransform);
    }
}`,
      explanation: 'HISM Component ใน Unreal Engine ผสาน Mesh ทั้งหมดเข้าด้วยกัน และรองรับการทำ LOD และ Culling เป็นรายกลุ่มโดยอัตโนมัติ',
    },
  },

  'pathfinding-algorithms': {
    pureLogic: {
      title: 'A* Pathfinding Search ด้วย Priority Queue (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ การค้นหาแบบสำรวจรอบทิศทาง BFS / Dijkstra โดยไม่มี Heuristic',
      badCode: `// ผิด: Dijkstra สำรวจรอบตัวเป็นวงกลม เสียเวลาสำรวจโหนดในทิศตรงข้ามเป้าหมาย
function dijkstra(start: Node, goal: Node) {
  const openSet = [start];
  while (openSet.length > 0) {
    const current = openSet.shift()!; // O(N) shift ไม่มีทิศทาง
    if (current === goal) return reconstructPath(current);
    // สำรวจเพื่อนบ้านทุกทิศเท่าๆ กัน...
  }
}`,
      goodTitle: '✅ A* Search ชี้นำทิศทางด้วย Heuristic h(n) สู่เป้าหมาย',
      goodCode: `function aStar(start: Node, goal: Node): Node[] {
  const openSet = new MinBinaryHeap<Node>((a, b) => a.fScore - b.fScore);
  start.gScore = 0;
  start.fScore = heuristic(start, goal);
  openSet.insert(start);

  while (!openSet.isEmpty()) {
    const current = openSet.extractMin()!;
    if (current === goal) return reconstructPath(current);

    for (const neighbor of current.neighbors) {
      const tentativeG = current.gScore + distance(current, neighbor);
      if (tentativeG < neighbor.gScore) {
        neighbor.cameFrom = current;
        neighbor.gScore = tentativeG;
        // f(n) = g(n) + h(n): ให้ความสำคัญกับโหนดที่เข้าใกล้เป้าหมาย
        neighbor.fScore = tentativeG + heuristic(neighbor, goal);
        openSet.insert(neighbor);
      }
    }
  }
  return [];
}`,
      explanation: 'A* ใช้ค่าประมาณระยะทาง (Heuristic) ชี้นำการค้นหา ทำให้ลดจำนวนโหนดที่ต้องสำรวจลงได้กว่า 80%',
    },
    unity: {
      title: 'Unity NavMesh Agent & Async Pathfinding (C#)',
      language: 'csharp',
      badTitle: '❌ รันอัลกอริทึม A* บน Grid แบบแมนนวลบน Main Thread ทุกเฟรม',
      badCode: `void Update() {
    // ผิด: คำนวณเส้นทางใหม่ทุกเฟรม บล็อก Game Thread จนเกมกระตุก
    List<Vector3> path = CustomAStar.FindPath(transform.position, player.position);
}`,
      goodTitle: '✅ ใช้ Unity NavMeshQuery หรือ NavMeshAgent.SetDestination',
      goodCode: `public class EnemyMovement : MonoBehaviour {
    [SerializeField] private NavMeshAgent agent;
    private float nextRepathTime;

    void Update() {
        // จำกัดความถี่การคำนวณเส้นทางใหม่ (เช่น ทุก 0.2 วินาที)
        if (Time.time >= nextRepathTime) {
            nextRepathTime = Time.time + 0.2f;
            if (player != null && agent.isOnNavMesh) {
                // NavMesh คำนวณในระดับ C++ Multi-threaded Pipeline
                agent.SetDestination(player.position);
            }
        }
    }
}`,
      explanation: 'Unity NavMesh รันบน C++ Engine Core และใช้ Polygonal Mesh แทนตารางกริด ทำให้เคลื่อนที่ได้อย่างเป็นธรรมชาติและใช้หน่วยความจำน้อย',
    },
    unreal: {
      title: 'Unreal Engine Navigation System & Recast (C++)',
      language: 'cpp',
      badTitle: '❌ เขียน Raycast หาทางเดินเองใน C++ Tick Loop',
      badCode: `// ผิด: ยิง Raycast รอบทิศทางเพื่อคลำทางเดิน ช้าและติดมุมตึกง่าย
void AEnemyAI::Tick(float DeltaTime) {
    Super::Tick(DeltaTime);
    // Raycasting หาทางหลบสิ่งกีดขวางในทุกเฟรม...
}`,
      goodTitle: '✅ ใช้ UNavigationSystemV1 คำนวณผ่าน Recast NavMesh',
      goodCode: `void AEnemyAI::MoveToTargetAsync(const FVector& TargetLocation) {
    UNavigationSystemV1* NavSys = FNavigationSystem::GetCurrent<UNavigationSystemV1>(GetWorld());
    if (!NavSys) return;

    // ขอเส้นทางจาก Recast NavMesh แบบ Threaded
    FPathFindingQuery Query(this, *NavSys->GetDefaultNavDataInstance(), GetActorLocation(), TargetLocation);
    FPathFindingResult Result = NavSys->FindPathSync(Query);

    if (Result.IsSuccessful()) {
        FollowPath(Result.Path);
    }
}`,
      explanation: 'Recast NavMesh ใน Unreal Engine แปลง Geometry 3D ที่ซับซ้อนให้กลายเป็น Navigation Polygons ที่สืบค้นเส้นทางได้ในเวลาไม่ถึงมิลลิวินาที',
    },
  },

  'game-ai-fsm-bt': {
    pureLogic: {
      title: 'Behavior Tree Architecture กับ Blackboard (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ Finite State Machine แบบสวิตช์เถื่อน (Spaghetti Transition Hell)',
      badCode: `// ผิด: ยิ่งมีสถานะเยอะ โค้ด switch case ยิ่งซับซ้อนและแก้บั๊กยาก
function updateFSM(enemy: any) {
  switch (enemy.state) {
    case 'PATROL':
      if (enemy.seePlayer) enemy.state = 'CHASE';
      if (enemy.lowHp) enemy.state = 'FLEE';
      break;
    case 'CHASE':
      if (!enemy.seePlayer) enemy.state = 'PATROL';
      if (enemy.inRange) enemy.state = 'ATTACK';
      if (enemy.lowHp) enemy.state = 'FLEE'; // โค้ดซ้ำซ้อนทุกเคส
      break;
  }
}`,
      goodTitle: '✅ Behavior Tree แบบแยกส่วน (Selector ➔ Sequence ➔ Task) + Blackboard',
      goodCode: `type NodeStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

interface BTNode {
  tick(bb: Map<string, any>): NodeStatus;
}

// Selector: ลองทำทีละลูกจนกว่าจะมีตัวใดตัวหนึ่งสำเร็จ (Fallback)
class Selector implements BTNode {
  constructor(private children: BTNode[]) {}
  tick(bb: Map<string, any>): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(bb);
      if (status !== 'FAILURE') return status;
    }
    return 'FAILURE';
  }
}

// Sequence: ทำเรียงตามลำดับจนจบ ถ้าตัวใดพังถือว่าพังหมด (AND)
class Sequence implements BTNode {
  constructor(private children: BTNode[]) {}
  tick(bb: Map<string, any>): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(bb);
      if (status !== 'SUCCESS') return status;
    }
    return 'SUCCESS';
  }
}`,
      explanation: 'Behavior Tree แยกเงื่อนไขและการกระทำออกจากกันอย่างอิสระ สามารถนำโหนดกลับมาใช้ซ้ำ (Re-usable) ได้กับศัตรูทุกตัวในเกม',
    },
    unity: {
      title: 'State Pattern & Modular AI ใน Unity C#',
      language: 'csharp',
      badTitle: '❌ รวมโค้ด AI ทั้งหมดไว้ในคลาสเดียวด้วยเงื่อนไข if-else ขนาดยักษ์',
      badCode: `public class MonsterAI : MonoBehaviour {
    void Update() {
        if (state == 0) { /* เดินตรวจ */ }
        else if (state == 1) { /* วิ่งไล่ */ }
        else if (state == 2) { /* โจมตี */ }
        // ขยายเพิ่มไม่ได้ ควบคุมยาก เกิดบั๊กเงื่อนไขชนกัน
    }
}`,
      goodTitle: '✅ แยก State ด้วย Interface และควบคุมการสลับผ่าน Context',
      goodCode: `public interface IEnemyState {
    void Enter(EnemyController enemy);
    void Execute(EnemyController enemy);
    void Exit(EnemyController enemy);
}

public class EnemyController : MonoBehaviour {
    private IEnemyState currentState;

    public void ChangeState(IEnemyState newState) {
        currentState?.Exit(this);
        currentState = newState;
        currentState.Enter(this);
    }

    void Update() {
        currentState?.Execute(this);
    }
}

public class PatrolState : IEnemyState {
    public void Enter(EnemyController enemy) { /* เริ่มเดิน */ }
    public void Execute(EnemyController enemy) {
        if (enemy.CanSeePlayer()) enemy.ChangeState(new ChaseState());
    }
    public void Exit(EnemyController enemy) { /* ออก */ }
}`,
      explanation: 'การแยกสถานะออกเป็นคลาสย่อยๆ ทำให้โค้ดสะอาด เป็นไปตามหลัก Single Responsibility Principle และทดสอบได้ง่าย',
    },
    unreal: {
      title: 'Unreal Engine Behavior Tree & Blackboard (C++)',
      language: 'cpp',
      badTitle: '❌ เขียนโค้ด AI ขนาดยักษ์ใน Tick ของ AAIController',
      badCode: `// ผิด: ตรวจสอบสถานะ AI ทั้งหมดใน C++ Tick โดยไม่ใช้ระบบ Behavior Tree
void AEnemyAIController::Tick(float DeltaTime) {
    Super::Tick(DeltaTime);
    if (bIsPatrolling) { ... }
    else if (bIsChasing) { ... }
}`,
      goodTitle: '✅ สร้าง Custom Task Node ร่วมกับ UBehaviorTreeComponent',
      goodCode: `// สร้าง Task Node แยกเฉพาะหน้าที่
EBTNodeResult::Type UBTTask_AttackEnemy::ExecuteTask(
    UBehaviorTreeComponent& OwnerComp, 
    uint8* NodeMemory
) {
    UBlackboardComponent* Blackboard = OwnerComp.GetBlackboardComponent();
    if (!Blackboard) return EBTNodeResult::Failed;

    AActor* Target = Cast<AActor>(Blackboard->GetValueAsObject("TargetEnemy"));
    if (!Target) return EBTNodeResult::Failed;

    // ทำการโจมตี
    return EBTNodeResult::Succeeded;
}`,
      explanation: 'Behavior Tree ใน Unreal Engine มีระบบ Visual Debugger ส่องดูสถานะการตัดสินใจของ AI สดๆ ในฉาก และแชร์ Blackboard ร่วมกันได้',
    },
  },

  'frustum-culling': {
    pureLogic: {
      title: 'Frustum AABB Intersection Test (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ ส่งวัตถุทั้งหมดเข้า Render Queue โดยไม่ตรวจสอบมุมกล้อง',
      badCode: `// ผิด: วาดวัตถุทั้งหมด 5,000 ชิ้น ไม่ว่าจะอยู่ข้างหลังกล้องหรืออยู่นอกจอ
function renderScene(objects: RenderObject[]) {
  for (const obj of objects) {
    gpu.draw(obj); // 5,000 Draw Calls ส่งตรงเข้า GPU ทื่อๆ
  }
}`,
      goodTitle: '✅ ทดสอบ AABB P-Vertex กับ 6 Frustum Planes เพื่อตัดวัตถุนอกจอ',
      goodCode: `interface Vec3 { x: number; y: number; z: number; }
interface Plane { normal: Vec3; distance: number; }
interface AABB { min: Vec3; max: Vec3; }

function isBoxInFrustum(planes: Plane[], box: AABB): boolean {
  for (const plane of planes) {
    // หาจุด P-Vertex ที่พุ่งไปตาม Normal ของระนาบมากที่สุด
    const pVertex: Vec3 = {
      x: plane.normal.x >= 0 ? box.max.x : box.min.x,
      y: plane.normal.y >= 0 ? box.max.y : box.min.y,
      z: plane.normal.z >= 0 ? box.max.z : box.min.z,
    };

    // Signed Distance = Normal · P + Distance
    const dist = plane.normal.x * pVertex.x + 
                 plane.normal.y * pVertex.y + 
                 plane.normal.z * pVertex.z + plane.distance;

    if (dist < 0) return false; // อยู่นอกระนาบ = Culled ทันที
  }
  return true; // อยู่ในกรวยสายตากล้อง
}`,
      explanation: 'อัลกอริทึม P-Vertex กับระนาบ Frustum 6 ด้าน ใช้เวลาเพียงระดับนาโนวินาทีในการคัดกรองวัตถุนอกจอทิ้งก่อนส่งคำสั่งวาด',
    },
    unity: {
      title: 'Unity CullingGroup API เพื่อเปิด/ปิด Component (C#)',
      language: 'csharp',
      badTitle: '❌ ปล่อยให้ Animator และ AI ทำงานแม้จะอยู่นอกหน้าจอ',
      badCode: `void Update() {
    // โค้ดคำนวณโครงกระดูกแอนิเมชันรันตลอดเวลาแม้ผู้เล่นจะมองไม่เห็น
    animator.Update(Time.deltaTime);
}`,
      goodTitle: '✅ ใช้ Unity CullingGroup สั่งปิด Animator เมื่อหลุดขอบจอ',
      goodCode: `public class VisibilityOpt : MonoBehaviour {
    private CullingGroup cullingGroup;
    private BoundingSphere[] spheres;
    [SerializeField] private Animator anim;

    void Start() {
        cullingGroup = new CullingGroup();
        cullingGroup.targetCamera = Camera.main;
        cullingGroup.onStateChanged = OnVisibilityChanged;

        spheres = new BoundingSphere[1] { 
            new BoundingSphere(transform.position, 2.0f) 
        };
        cullingGroup.SetBoundingSpheres(spheres);
    }

    void OnVisibilityChanged(CullingGroupEvent evt) {
        // ปิดการประมวลผลกระดูกและเอฟเฟกต์เมื่อพ้นสายตากล้อง
        anim.enabled = evt.isVisible;
    }
}`,
      explanation: 'CullingGroup เป็น API ประสิทธิภาพสูงของ Unity ที่ใช้คำนวณ Bounding Spheres จำนวนมากพร้อมกันด้วย SIMD',
    },
    unreal: {
      title: 'ViewFrustum IntersectBox ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ บังคับให้ Mesh เรนเดอร์ตลอดเวลาโดยปิด Frustum Culling',
      badCode: `// ผิด: ปิดระบบ Culling ทำให้การ์ดจอต้องประมวลผลรูปสามเหลี่ยมทั้งหมด
MeshComponent->bNeverDistanceCull = true;
MeshComponent->bUseAttachParentBound = false;`,
      goodTitle: '✅ ตรวจสอบ Bounds กับ ViewFrustum ก่อนประมวลผล',
      goodCode: `bool CheckVisibilityInFrustum(const FSceneView* SceneView, const FBox& WorldBounds) {
    if (!SceneView) return false;

    FVector Center = WorldBounds.GetCenter();
    FVector Extent = WorldBounds.GetExtent();

    // ทดสอบการตัดกันระหว่างพีระมิดสายตาของกล้องกับกล่อง AABB
    return SceneView->ViewFrustum.IntersectBox(Center, Extent);
}`,
      explanation: 'ViewFrustum.IntersectBox ใน Unreal Engine คำนวณแบบเวกเตอร์รวดเร็ว ช่วยคัดกรองวัตถุก่อนเข้าสู่กระบวนการ Occlusion Culling',
    },
  },

  'multi-threading': {
    pureLogic: {
      title: 'การแบ่งช่วงงาน (Chunk Ranges) สำหรับ Worker Threads (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ รันงานคำนวณทั้งหมดบน Single Main Thread (UI ค้าง)',
      badCode: `// ผิด: ลูปประมวลผล 100,000 รายการบน UI Thread ทำให้หน้าเว็บ/เกมฟรีซ
function processEverything(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    heavyCompute(items[i]); // หน้าจอแช่แข็งจนกว่าจะเสร็จ!
  }
}`,
      goodTitle: '✅ คำนวณ Index Chunk เพื่อแบ่งงานให้ Worker Threads ประมวลผลคู่ขนาน',
      goodCode: `interface Chunk {
  startIndex: number;
  endIndex: number;
}

function getChunkRange(totalItems: number, threadIndex: number, totalThreads: number): Chunk {
  const baseChunkSize = Math.floor(totalItems / totalThreads);
  const startIndex = threadIndex * baseChunkSize;
  // Thread ตัวสุดท้ายรับผิดชอบเศษที่เหลือจนหมด
  const endIndex = (threadIndex === totalThreads - 1)
    ? totalItems
    : startIndex + baseChunkSize;

  return { startIndex, endIndex };
}`,
      explanation: 'การแบ่งช่วงแบบไม่ทับซ้อนกันช่วยให้ Worker Thread ทำงานได้อย่างอิสระบน Memory Block ของตัวเองโดยไม่ต้องพึ่งพา Mutex Lock',
    },
    unity: {
      title: 'Unity C# Job System & Burst Compiler (C#)',
      language: 'csharp',
      badTitle: '❌ รันงานฟิสิกส์อนุภาคหมื่นตัวบน Main Thread',
      badCode: `void Update() {
    for (int i = 0; i < count; i++) {
        positions[i] += velocities[i] * Time.deltaTime; // คอร์อื่นว่างงาน!
    }
}`,
      goodTitle: '✅ ใช้ IJobParallelFor พร้อมแอตทริบิวต์ [BurstCompile]',
      goodCode: `using Unity.Jobs;
using Unity.Collections;
using Unity.Burst;
using Unity.Mathematics;

[BurstCompile]
public struct ParticleParallelJob : IJobParallelFor {
    public NativeArray<float3> positions;
    [ReadOnly] public NativeArray<float3> velocities;
    public float deltaTime;

    public void Execute(int index) {
        positions[index] += velocities[index] * deltaTime;
    }
}

// ใน Update: Schedule ข้ามทุกคอร์ซีพียูด้วย Batch ละ 64
JobHandle handle = new ParticleParallelJob { ... }.Schedule(count, 64);
handle.Complete();`,
      explanation: 'IJobParallelFor กระจายงานลง CPU Worker Threads ทุกแกน และ Burst Compiler แปลงเป็นรหัสเครื่อง SIMD ความเร็วสูง',
    },
    unreal: {
      title: 'ParallelFor ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ วนลูปคำนวณข้อมูลศัตรูทั้งหมดใน Game Thread',
      badCode: `void Tick(float DeltaTime) {
    for (int32 i = 0; i < Enemies.Num(); i++) {
        ComputeComplexPhysics(Enemies[i]); // Game Thread ติดคอขวด
    }
}`,
      goodTitle: '✅ ใช้คำสั่ง ParallelFor กระจายลง TaskGraph Worker Threads',
      goodCode: `#include "Async/ParallelFor.h"

void UpdateEnemiesMultiThreaded(TArray<FEnemyData>& Enemies, float DeltaTime) {
    const int32 Total = Enemies.Num();

    // กระจายให้ CPU ทุกคอร์ประมวลผลคู่ขนาน
    ParallelFor(Total, [&](int32 Index) {
        Enemies[Index].Position += Enemies[Index].Velocity * DeltaTime;
    }, EParallelForFlags::None);
}`,
      explanation: 'ParallelFor ของ Unreal Engine จัดการแบ่งก้อนงานให้ Thread Pool อัตโนมัติ ป้องกัน Game Thread Hitching ได้อย่างมีประสิทธิภาพ',
    },
  },

  'shader-overdraw': {
    pureLogic: {
      title: 'Front-to-Back Mesh Sorting เพื่อใช้ประโยชน์จาก Early-Z (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ เรนเดอร์วัตถุทึบแสงจากหลังมาหน้า (Painter\'s Algorithm)',
      badCode: `// ผิด: วาดวัตถุไกลก่อน ทำให้พิกเซลหน้าจอเดิมถูกระบายสีทับซ้ำๆ
meshes.sort((a, b) => b.distanceToCamera - a.distanceToCamera);`,
      goodTitle: '✅ เรียงลำดับจากใกล้ไปไกล เพื่อให้ GPU Early-Z ปฏิเสธพิกเซลด้านหลัง',
      goodCode: `interface RenderMesh {
  id: string;
  distanceToCamera: number;
  isOpaque: boolean;
}

function sortMeshesForEarlyZ(meshes: RenderMesh[]): RenderMesh[] {
  // กรองเฉพาะวัตถุทึบแสง และเรียงลำดับจากใกล้ไปไกล (Ascending)
  return meshes
    .filter(m => m.isOpaque)
    .sort((a, b) => a.distanceToCamera - b.distanceToCamera);
}`,
      explanation: 'การวาดวัตถุทึบแสงจากหน้าไปหลังทำให้ Z-Buffer บันทึกค่าความลึกไว้ พิกเซลด้านหลังจึงถูก Discard ทิ้งทันทีก่อนรัน Shader',
    },
    unity: {
      title: 'การตั้งค่า RenderQueue และ ZWrite ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ ใช้วัสดุโปร่งแสง Transparent ในส่วนที่ควรทึบแสง (ZWrite ปิด)',
      badCode: `// ผิด: Transparent ปิดการเขียน Depth Buffer ทำให้เกิด Overdraw มหาศาล
mat.renderQueue = (int)RenderQueue.Transparent;
mat.SetInt("_ZWrite", 0);`,
      goodTitle: '✅ ตั้งค่า RenderQueue.Geometry และเปิด _ZWrite: 1',
      goodCode: `public class OpaqueOptimizer {
    public static void Optimize(Material mat) {
        // วัตถุทึบแสงต้องอยู่ใน Render Queue 2000 (Geometry) เสมอ
        mat.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Geometry;
        // เปิดการเขียน Depth Buffer เพื่อให้วัตถุด้านหลังถูก Reject ผ่าน Early-Z
        mat.SetInt("_ZWrite", 1);
        mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.One);
        mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.Zero);
    }
}`,
      explanation: 'RenderQueue.Geometry รับประกันว่าวัตถุจะถูกประมวลผลก่อนวัตถุโปร่งแสง และเติม Depth ให้ฮาร์ดแวร์ GPU ใช้อ้างอิง',
    },
    unreal: {
      title: 'Custom Depth Pre-Pass ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ ปล่อยให้ Mesh ซ้อนทับกันโดยไม่เขียน Depth Pre-Pass',
      badCode: `// ผิด: ไม่ได้เปิดให้ประมวลผลใน Depth Pass
MeshComp->SetRenderCustomDepth(false);`,
      goodTitle: '✅ เปิดใช้งาน Custom Depth Pre-Pass',
      goodCode: `void ConfigureDepthOptimization(UStaticMeshComponent* MeshComp) {
    if (!MeshComp) return;

    // บังคับให้เขียนค่าลง Depth Buffer ล่วงหน้า
    MeshComp->SetRenderCustomDepth(true);
    MeshComp->CustomDepthStencilValue = 250;
    // ป้องกันการจัดลำดับแบบโปร่งแสง
    MeshComp->SetTranslucentSortPriority(0);
}`,
      explanation: 'การบังคับให้วัตถุเข้าสู่ Depth Pass ช่วยให้ Unreal Engine สามารถ Discard พิกเซลที่ไม่จำเป็นในกระบวนการ Early-Z ได้ 100%',
    },
  },

  'netcode-prediction': {
    pureLogic: {
      title: 'Client Prediction Buffer & Server Reconciliation (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ รอผลยืนยันจากเซิร์ฟเวอร์ก่อนขยับตัวละคร (Input Latency สูง)',
      badCode: `// ผิด: ผู้เล่นกดเดินแล้วหน้าจอไม่ขยับ ต้องรอเน็ตเวิร์กวิ่งไปกลับก่อน 200ms
function onInput(dx: number) {
  sendPacketToServer(dx); // รอผลตอบกลับค่อยขยับ...
}`,
      goodTitle: '✅ ขยับทันทีบน Local และ Replay อินพุตที่ค้างอยู่เมื่อ Snapshot มาถึง',
      goodCode: `interface SavedMove { sequence: number; deltaX: number; }

class NetPredictor {
  public localX = 0;
  private history: SavedMove[] = [];

  // 1. ผู้เล่นกดเดิน: ขยับทันที 0ms Delay
  public predictMove(seq: number, delta: number): void {
    this.localX += delta;
    this.history.push({ sequence: seq, deltaX: delta });
    this.sendToServer(seq, delta);
  }

  // 2. เซิร์ฟเวอร์ตอบ Snapshot: ปรับตำแหน่งและ Replay อินพุตที่ค้างอยู่
  public onServerSnapshot(serverAckSeq: number, authoritativeX: number): void {
    let replayedX = authoritativeX;
    // ทิ้งอินพุตที่เซิร์ฟเวอร์ประมวลผลไปแล้ว
    this.history = this.history.filter(m => m.sequence > serverAckSeq);

    // จำลองอินพุตที่เหลือซ้ำอีกครั้งในเสี้ยววินาที
    for (const move of this.history) {
      replayedX += move.deltaX;
    }
    this.localX = replayedX;
  }
}`,
      explanation: 'Reconciliation Loop ทำให้ผู้เล่นรู้สึกว่าการควบคุมตอบสนองทันที (0ms Latency) ในขณะที่ Server ยังคงเป็น Authoritative',
    },
    unity: {
      title: 'Netcode for GameObjects (NGO) Predicted Movement (C#)',
      language: 'csharp',
      badTitle: '❌ รอรับ ClientRpc จากเซิร์ฟเวอร์ก่อนขยับ Transform',
      badCode: `// ผิด: ขยับเฉพาะเมื่อได้รับคำสั่ง ClientRpc จาก Server เท่านั้น
[ClientRpc]
void UpdatePositionClientRpc(Vector3 pos) {
    transform.position = pos; // หน่วงตามค่า Ping
}`,
      goodTitle: '✅ ตรวจสอบ IsOwner ขยับบนเครื่องทันที แล้วยิง ServerRpc',
      goodCode: `using Unity.Netcode;
using UnityEngine;

public class PredictedPlayer : NetworkBehaviour {
    private int moveSequence = 0;

    void Update() {
        if (!IsOwner) return; // ทำนายเฉพาะตัวละครของผู้เล่นเครื่องนี้

        Vector3 move = new Vector3(Input.GetAxis("Horizontal"), 0, 0);
        if (move.sqrMagnitude > 0.001f) {
            // 1. ทำนายบนเครื่อง Local ทันที (ไร้ความหน่วง)
            transform.position += move * 5f * Time.deltaTime;
            // 2. ส่งอินพุตไปให้ Server ตรวจสอบ
            SubmitMoveServerRpc(move, ++moveSequence);
        }
    }

    [ServerRpc]
    private void SubmitMoveServerRpc(Vector3 move, int seq) {
        // Server คำนวณและกระจาย Snapshot
    }
}`,
      explanation: 'การตรวจสอบ IsOwner และขยับบนเครื่องผู้เล่นทันทีก่อนส่ง ServerRpc คือหัวใจสำคัญของ Client-side Prediction',
    },
    unreal: {
      title: 'Unreal Engine FSavedMove_Character Prediction (C++)',
      language: 'cpp',
      badTitle: '❌ ยิง Custom RPC สั่งขยับตัวละครโดยไม่ใช้ CharacterMovementComponent',
      badCode: `// ผิด: ขยับตัวละครผ่าน NetMulticast RPC ทั่วไป ตัวละครจะกระตุกดึงกลับ
UFUNCTION(Server, Reliable)
void Server_Move(FVector NewPos);`,
      goodTitle: '✅ โอเวอร์ไรด์ FSavedMove_Character เพื่อให้เอนจิน Replay อัตโนมัติ',
      goodCode: `class FSavedMove_MyGame : public FSavedMove_Character {
public:
    virtual void PrepMoveFor(ACharacter* Character) override {
        Super::PrepMoveFor(Character);
        // บันทึกตัวแปรเสริม เช่น การวิ่งสปรินต์ ลงใน Snapshot ของ Move
        UCharacterMovementComponent* MoveComp = Character->GetCharacterMovement();
        if (MoveComp) {
            bSavedWantsToSprint = MoveComp->IsSprinting();
        }
    }
};`,
      explanation: 'Unreal Engine CharacterMovementComponent มีระบบ Client Prediction และ Saved Moves ที่ช่วยให้ตัวละครเคลื่อนไหวลื่นไหลแม้ Ping สูง',
    },
  },

  'texture-streaming': {
    pureLogic: {
      title: 'การคำนวณ Mipmap Level จาก UV Derivatives (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ โหลดรูปภาพ 4K เต็มขนาดสำหรับวัตถุที่อยู่ไกลลิบ',
      badCode: `// ผิด: วัตถุขนาด 10 พิกเซลบนจอ แต่โหลด Buffer 4096x4096 (16 ล้านพิกเซล)
const texture = loadFullResolutionRGBA4K();`,
      goodTitle: '✅ คำนวณระดับ Mipmap ที่เหมาะสมจากอัตราการเปลี่ยนแปลงของ UV',
      goodCode: `function calculateMipLevel(
  dudx: number,
  dvdy: number,
  texSize: number,
  maxMip: number
): number {
  // หาอนุพันธ์สูงสุดของการเปลี่ยนแปลง UV
  const maxDerivative = Math.max(Math.abs(dudx), Math.abs(dvdy));
  const texelsPerPixel = maxDerivative * texSize;
  
  // สูตร Log2: ทุกๆ การขยายระยะทาง 2 เท่า จะเพิ่ม Mip Level ขึ้น 1 ขั้น
  const mip = Math.log2(texelsPerPixel);
  return Math.max(0, Math.min(maxMip, Math.floor(mip)));
}`,
      explanation: 'สูตร Log2 Derivative ช่วยให้เลือกระดับ Mipmap ที่ตรงกับพิกเซลหน้าจอจริง ช่วยประหยัดทั้ง VRAM และ Texture Cache',
    },
    unity: {
      title: 'การตั้งค่า Streaming Mipmaps ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ ปิด Streaming Mipmaps และปล่อยให้ VRAM ล้นจนเกมแครช',
      badCode: `// ผิด: ปล่อยให้เอนจินโหลด Texture ทุกชิ้นเข้า VRAM โดยไม่จำกัดงบประมาณ
QualitySettings.streamingMipmapsActive = false;`,
      goodTitle: '✅ เปิดใช้งาน Streaming Mipmaps และกำหนด Memory Budget',
      goodCode: `public class TextureStreamManager {
    public static void Initialize(float budgetMB) {
        // เปิดระบบสตรีมชั้น Mipmap ตามระยะห่างของกล้อง
        QualitySettings.streamingMipmapsActive = true;
        // กำหนดเพดานงบประมาณ VRAM (เช่น 512 MB)
        QualitySettings.streamingMipmapsMemoryBudget = budgetMB;
        QualitySettings.streamingMipmapsMaxLevelReduction = 3;
    }
}`,
      explanation: 'Streaming Mipmaps ช่วยให้เกมรันบนอุปกรณ์ที่มี VRAM ต่ำอย่างโทรศัพท์มือถือหรือ Nintendo Switch ได้โดยไม่โดน OS สั่งปิด',
    },
    unreal: {
      title: 'การควบคุม Texture Streaming Pool ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ ตั้งค่า bForceMipsToBeResident ตลอดเวลาในทุก Texture',
      badCode: `// ผิด: บังคับให้โหลด Mip สูงสุดค้างไว้ใน VRAM ตลอดกาล ทำให้หน่วยความจำล้น
Texture->SetForceMipLevelsToBeResident(true);`,
      goodTitle: '✅ ควบคุมผ่าน Texture Streaming Manager และ UpdateResource',
      goodCode: `void ConfigureTextureStreaming(UTexture2D* Texture, bool bPrioritize) {
    if (!Texture) return;

    // บังคับให้โหลดความละเอียดสูงเฉพาะช่วงเวลาสั้นๆ เช่น คัตซีน
    Texture->SetForceMipLevelsToBeResident(bPrioritize);
    Texture->UpdateResource();
}`,
      explanation: 'Unreal Engine มี Texture Streaming Pool ที่คำนวณ Bounds ระยะทางอัตโนมัติ ช่วยลด VRAM Churn และป้องกันภาพกระตุก',
    },
  },

  'audio-concurrency': {
    pureLogic: {
      title: 'Audio Voice Stealing ด้วยนโยบาย Quietest First (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ สร้าง Audio Instance ใหม่ทุกครั้งที่เกิดเสียง (DSP Clipping)',
      badCode: `// ผิด: ยิงกระสุน 50 นัดพร้อมกัน = เปิด 50 Audio Streams ซ้อนทับกัน
function playSound(src: string) {
  new Audio(src).play(); // ลำโพงแตกพร่า และกิน Audio Thread
}`,
      goodTitle: '✅ จำกัดจำนวนช่องเสียงสูงสุด และขโมยช่องเสียงที่เบาที่สุดทิ้ง',
      goodCode: `interface Voice { id: number; name: string; volume: number; }

class SoundVoiceManager {
  private activeVoices: Voice[] = [];
  constructor(private maxVoices: number) {}

  public acquireVoice(newVoice: Voice): void {
    if (this.activeVoices.length >= this.maxVoices) {
      // ค้นหาเสียงที่มีระดับความดังต่ำที่สุด (Quietest First)
      let quietestIdx = 0;
      for (let i = 1; i < this.activeVoices.length; i++) {
        if (this.activeVoices[i].volume < this.activeVoices[quietestIdx].volume) {
          quietestIdx = i;
        }
      }
      this.activeVoices.splice(quietestIdx, 1); // ขโมยช่องเสียง
    }
    this.activeVoices.push(newVoice);
  }
}`,
      explanation: 'Voice Stealing แบบ Quietest First รับประกันว่าเสียงดังที่สำคัญจะไม่ถูกตัด และไม่เกิดปัญหาเสียงแตกพร่าจาก Clipping',
    },
    unity: {
      title: 'Sound Concurrency Pool ใน Unity (C#)',
      language: 'csharp',
      badTitle: '❌ เรียก AudioSource.PlayClipAtPoint ทุกครั้งที่ระเบิด',
      badCode: `// ผิด: PlayClipAtPoint สร้าง GameObject เปล่าขึ้นมาและไม่จำกัดจำนวนเสียง
void Explode() {
    AudioSource.PlayClipAtPoint(boomClip, transform.position);
}`,
      goodTitle: '✅ ใช้ Fixed AudioSource Pool และตัดเสียงที่เล่นอยู่ก่อนหน้า',
      goodCode: `public class AudioPoolManager : MonoBehaviour {
    [SerializeField] private AudioSource[] sources;
    private int nextIndex = 0;

    public void PlayConcurrently(AudioClip clip, float volume) {
        AudioSource src = sources[nextIndex];
        if (src.isPlaying) src.Stop(); // Voice Stealing ตัดเสียงเดิม

        src.clip = clip;
        src.volume = volume;
        src.Play();

        nextIndex = (nextIndex + 1) % sources.Length;
    }
}`,
      explanation: 'การใช้ Fixed Pool ช่วยให้ Unity Audio Engine ไม่เกิด Memory Spike และเสียงไม่ขาดตอนจากการขาดแคลนช่องสัญญาณ',
    },
    unreal: {
      title: 'Sound Concurrency Settings ใน Unreal Engine (C++)',
      language: 'cpp',
      badTitle: '❌ เล่นเสียงผ่าน UGameplayStatics โดยไม่กำหนด Concurrency Asset',
      badCode: `// ผิด: ปล่อยให้เสียงระเบิด 50 ลูกทำงานพร้อมกันโดยไม่มีการจำกัด Voice
UGameplayStatics::PlaySoundAtLocation(this, SoundWave, Location);`,
      goodTitle: '✅ กำหนด USoundConcurrency และตั้ง ResolutionRule: StopOldest',
      goodCode: `void ConfigureAudioConcurrency(USoundConcurrency* ConcurrencyAsset) {
    if (!ConcurrencyAsset) return;

    // จำกัดจำนวนเสียงที่เล่นพร้อมกันสูงสุด 4 ช่อง
    ConcurrencyAsset->Concurrency.MaxCount = 4;
    // กฎการแย่งช่องเสียง: ตัดเสียงที่เก่าที่สุดทิ้ง
    ConcurrencyAsset->Concurrency.ResolutionRule = 
        EMaxConcurrentResolutionRule::StopOldest;
}`,
      explanation: 'Sound Concurrency ใน Unreal Engine ช่วยลดภาระการผสมเสียงของ AudioMixer ทำให้เสียงยังคมชัดแม้ในฉากชุลมุน',
    },
  },

  'async-loading': {
    pureLogic: {
      title: 'Async Priority Queue Asset Loader (Pure TypeScript)',
      language: 'typescript',
      badTitle: '❌ โหลดไฟล์แบบ Synchronous บล็อกการทำงานของ Event Loop',
      badCode: `// ผิด: คำสั่ง Blocking I/O แช่แข็งการทำงานของทั้งโปรแกรม
const data = fs.readFileSync("huge_boss_model.bin"); // หน้าจอค้างทันที!`,
      goodTitle: '✅ จัดคิวโหลดแบบ Asynchronous ผ่าน Promise และ Priority Queue',
      goodCode: `interface Request<T> {
  id: string;
  priority: number;
  resolve: (data: T) => void;
}

class AsyncAssetQueue<T> {
  private queue: Request<T>[] = [];
  private isBusy = false;

  public load(id: string, priority: number): Promise<T> {
    return new Promise(resolve => {
      this.queue.push({ id, priority, resolve });
      // เรียงลำดับคำขอที่มีความสำคัญสูงสุดขึ้นก่อน
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isBusy || this.queue.length === 0) return;
    this.isBusy = true;
    const req = this.queue.shift()!;
    const asset = await this.readFromDiskAsync(req.id);
    req.resolve(asset);
    this.isBusy = false;
    this.processNext();
  }

  private readFromDiskAsync(id: string): Promise<T> {
    return new Promise(r => setTimeout(() => r({ id } as unknown as T), 10));
  }
}`,
      explanation: 'Asynchronous Queue ทำให้กระบวนการอ่านไฟล์แยกออกจาก Loop หลัก ช่วยขจัดปัญหาเฟรมเรตร่วงเหลือ 0 FPS อย่างสมบูรณ์',
    },
    unity: {
      title: 'Unity Addressables Async Loading (C#)',
      language: 'csharp',
      badTitle: '❌ ใช้ Resources.Load ในระหว่างที่ผู้เล่นกำลังเล่นเกม',
      badCode: `// ผิด: Resources.Load บล็อก Game Thread นาน 450ms หน้าจอค้างสนิท
void SpawnBoss() {
    GameObject prefab = Resources.Load<GameObject>("DragonBoss");
    Instantiate(prefab, pos, rot);
}`,
      goodTitle: '✅ สตรีมเบื้องหลังด้วย Addressables.LoadAssetAsync',
      goodCode: `using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class AsyncSpawner : MonoBehaviour {
    private AsyncOperationHandle<GameObject> handle;

    public void SpawnBossAsync(string addressableKey) {
        // สตรีมไฟล์ใน Background Thread โดยเฟรมเรตยังคงอยู่ที่ 60 FPS
        handle = Addressables.LoadAssetAsync<GameObject>(addressableKey);
        handle.Completed += (op) => {
            if (op.Status == AsyncOperationStatus.Succeeded) {
                Instantiate(op.Result, transform.position, Quaternion.identity);
            }
        };
    }

    void OnDestroy() {
        // ปลดปล่อยหน่วยความจำเมื่อเลิกใช้งาน
        if (handle.IsValid()) Addressables.Release(handle);
    }
}`,
      explanation: 'Unity Addressables แยกการจัดการ Asset และ Memory Management ออกจาก Scene ช่วยให้เกมโหลดฉากและมอนสเตอร์ได้ต่อเนื่องไร้อาการกระตุก',
    },
    unreal: {
      title: 'Unreal Engine FStreamableManager & TSoftObjectPtr (C++)',
      language: 'cpp',
      badTitle: '❌ เรียก StaticLoadObject กลางฉากการเล่นแบบ Synchronous',
      badCode: `// ผิด: บล็อก Game Thread เพื่ออ่านข้อมูลดิสก์
UStaticMesh* Mesh = Cast<UStaticMesh>(StaticLoadObject(UStaticMesh::StaticClass(), nullptr, TEXT("/Game/BossMesh")));`,
      goodTitle: '✅ ใช้ FStreamableManager สตรีมเบื้องหลังคู่กับ Soft Object Pointer',
      goodCode: `#include "Engine/StreamableManager.h"
#include "Engine/AssetManager.h"

class AAsyncSpawner : public AActor {
public:
    // Soft Reference ไม่ดึงไฟล์เข้าแรมจนกว่าจะสั่ง
    UPROPERTY(EditAnywhere)
    TSoftObjectPtr<UStaticMesh> MeshAsset;

    void StartAsyncLoad() {
        FStreamableManager& Streamable = UAssetManager::GetStreamableManager();
        // ขอโหลดแบบ Asynchronous ในเธรดเบื้องหลัง
        Streamable.RequestAsyncLoad(
            MeshAsset.ToSoftObjectPath(),
            FStreamableDelegate::CreateUObject(this, &AAsyncSpawner::OnLoaded)
        );
    }

    void OnLoaded() {
        UStaticMesh* LoadedMesh = MeshAsset.Get();
        // นำโมเดลที่โหลดเสร็จไปใช้งาน
    }
};`,
      explanation: 'TSoftObjectPtr และ FStreamableManager คือหัวใจของเกม Open World ใน Unreal Engine ช่วยให้สตรีมโมเดลขนาดใหญ่ได้โดยไร้ Hitches',
    },
  },
};
