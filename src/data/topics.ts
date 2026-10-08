import type { Topic } from '../types/topic';
import { TOPIC_CHALLENGES } from './challenges';
import { TOPIC_CODE_EXAMPLES } from './codeExamples';

export const TOPICS: Topic[] = [
  {
    id: 'object-pooling',
    title: 'Object Pooling (การนำออบเจกต์กลับมาใช้ซ้ำ)',
    titleEn: 'Object Pooling vs. Dynamic Allocation',
    category: 'performance',
    difficulty: 'Beginner',
    iconName: 'Boxes',
    hasInteractiveLab: true,
    labType: 'object-pool',
    summary: 'แก้ปัญหาเกมกระตุก (GC Frame Stutter) จากการสร้างและทำลายกระสุนหรือเอฟเฟกต์นับพันตัวต่อวินาที โดยการสร้างคลังเก็บไว้ล่วงหน้า',
    
    simpleExplanation: {
      analogy: 'เหมือน "จานชามในศูนย์อาหาร" 🍽️',
      keyConcept: 'แทนที่จะซื้อจานกระดาษใหม่ทุกครั้งที่ลูกค้าสั่งอาหารแล้วทิ้งลงถังขยะ (จนถังขยะล้นและพนักงานต้องหยุดงานมากวาด = เกมกระตุก) ให้เราซื้อจานกระเบื้องไว้ 100 ใบ พอลูกค้ากินเสร็จก็นำไปล้างเก็บเข้าตู้ แล้วหยิบมาใส่อาหารใหม่ได้ทันที',
      whyItMatters: 'ในเกมยิงปืน (Shooting/Bullet Hell) ถ้าทุกนัดที่ยิงมีการ `new Bullet()` และ `Destroy(bullet)` พอเล่นไปเรื่อยๆ หน่วยความจำขยะ (Garbage) จะพุ่งสูง จนระบบ Garbage Collector (GC) ต้องสั่ง Freeze การทำงานของเกมเพื่อเคลียร์ขยะ ทำให้ FPS ร่วงจาก 60 เหลือ 15 ชั่วขณะ ซึ่งผู้เล่นจะรู้สึกว่าเกมกระตุกและยิงไม่โดน',
      visualAnalogyDesc: 'ตู้เก็บจาน (Pool) -> ดึงออกมาใช้ (Acquire) -> เมื่อหมดอายุให้ปิดการแสดงผลและส่งคืนเข้าตู้ (Release) -> ไม่มีการทำลายทิ้งจริง',
      bulletPoints: [
        'สร้างของรอไว้ล่วงหน้าตอนโหลดฉาก (Warm-up / Pre-allocation)',
        'เมื่อใช้งานเสร็จ ไม่ทำลาย (Destroy/delete) แต่เปลี่ยนสถานะเป็น Inactive',
        'นำกลับมาใช้ใหม่โดยการ Reset ตำแหน่งและเปิด Active',
        'ทำให้ Memory คงที่ ไม่มี GC Spike ตลอดการเล่นเกม'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'การจัดสรรหน่วยความจำบน Managed Heap vs. Stack และพฤติกรรมของ Garbage Collection Engine (Unity Mono/IL2CPP หรือ JS V8)',
      lowLevelMechanics: 'ทุกครั้งที่มีการเรียกคำสั่งสร้าง Object ในภาษาประเภท Managed (เช่น C# ใน Unity หรือ Java/JS) รันไทม์จะจัดสรรพื้นที่บน Managed Heap และเพิ่ม Allocation Pointer เมื่อหน่วยความจำใน Gen 0 (หรือ Eden Space) เต็ม ตัว Garbage Collector จะทำการระงับเธรด (Stop-The-World pause) เพื่อทำการ Mark-and-Sweep ค้นหาวัตถุที่ไม่มีการอ้างอิงและ Defragment หน่วยความจำ การหยุดนี้ใช้เวลาตั้งแต่ 5ms ถึง 30ms+ ซึ่งเกินงบเวลาต่อเฟรมของ 60 FPS (16.6ms) อย่างมหาศาล ยิ่งไปกว่านั้น การจองพื้นที่ซ้ำๆ ก่อให้เกิด Memory Fragmentation จน Heap ขยายตัวและไม่สามารถคืนสู่ OS ได้',
      engineInternals: {
        unity: 'Unity 2021+ มี UnityEngine.Pool ให้ใช้งานในตัว (ObjectPool<T>, ListPool<T>) ช่วยจัดการทั้ง Thread-safety และ Check pool leaks ใน Editor',
        unreal: 'Unreal Engine ใช้ C++ ไม่ได้มี GC หยุดโลกแบบรวดเร็วเท่า C# แต่การเรียก NewObject<T>() หรือ SpawnActor() กิน Overhead สูงมากจาก Subobject Initialization และ UWorld tick registration จึงนิยมใช้ Custom Pool หรือ Niagara FX Particle Emitters',
        godot: 'Godot Engine แนะนำการเก็บ Node ไว้ใน Array/Stack หรือใช้ MultiMeshInstance2D/3D เพื่อไม่ต้อง add_child() / queue_free() บ่อยๆ'
      },
      complexity: {
        time: 'O(1) ในการดึงและคืน (ผ่าน Stack หรือ Free List) เทียบกับ O(N) ของ GC Sweep',
        space: 'จองพื้นที่คงที่ (Pre-allocated Capacity) แลกกับ Peak Memory ที่คาดเดาได้แน่นอน',
        explanation: 'Stack-based Pool มีค่าใช้จ่าย amortized O(1) Push/Pop โดยตรงจาก L1/L2 Cache line โดยไม่มีการแตะต้อง OS Memory Allocator'
      },
      mathOrTheory: 'Budget per Frame ที่ 60 FPS คือ 16.66 ms (1000ms / 60). หาก GC Pause กินเวลา 18 ms เฟรมนั้นจะดรอปทันที (Frametime Spike = 18 + 16.66 = 34.66ms ≈ 28 FPS)',
      pitfalls: [
        'Pool Leaks: ดึงวัตถุออกมาใช้งานแล้วลืมคืนเข้า Pool ทำให้ Pool ต้องขยายขนาดเรื่อยๆ',
        'Dirty State: คืนวัตถุเข้า Pool โดยไม่รีเซ็ตค่าสถานะ (เช่น เลือด, ความเร็ว, ทิศทาง) ทำให้รอบถัดไปเกิดบั๊กประหลาด',
        'Prewarm มากเกินไป: ตั้งค่าความจุเริ่มต้นสูงเกินความจำเป็น ทำให้กิน RAM โดยเปล่าประโยชน์และโหลดเกมนานขึ้น'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ การสร้าง/ทำลายแบบไดนามิก (ทำให้ GC Spike)',
      badCode: `// ยิงกระสุนแบบดั้งเดิม - ทุกนัดเกิด Garbage Allocation บน Heap!
void FireBullet() {
    // 1. สร้าง Instance ใหม่บน Heap (ทำให้เกิด Alloc Churn)
    GameObject bullet = Instantiate(bulletPrefab, firePoint.position, firePoint.rotation);
    
    // 2. ตั้งเวลาทำลาย - ยิ่งยิงเร็ว GC ยิ่งทำงานหนักจนเฟรมกระตุก
    Destroy(bullet, 3.0f);
}`,
      goodTitle: '✅ การใช้ Unity ObjectPool<T> (Zero GC Churn)',
      goodCode: `using UnityEngine.Pool;

public class BulletManager : MonoBehaviour {
    [SerializeField] private Bullet bulletPrefab;
    private IObjectPool<Bullet> pool;

    void Awake() {
        // สร้าง Pool ล่วงหน้า จองพื้นที่คงที่
        pool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: b => { b.gameObject.SetActive(true); b.ResetState(); },
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            collectionCheck: false, // ปิดใน Release build เพื่อความเร็ว
            defaultCapacity: 200,
            maxSize: 1000
        );
    }

    public void FireBullet() {
        Bullet bullet = pool.Get(); // O(1) หยิบจาก Pool ทันที
        bullet.transform.position = firePoint.position;
        bullet.Initialize(pool); // ส่ง pool เพื่อให้กระสุนคืนตัวเองได้
    }
}`,
      explanation: 'การใช้ ObjectPool ช่วยรักษาอัตราการใช้หน่วยความจำให้คงที่ตลอดเกม และขจัดปัญหา Frame Drop จาก Garbage Collection ในช่วงเวลาที่มีแอ็กชันเข้มข้น'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการยิง 2,000 นัดพร้อมกันใน 1 วินาที',
      metrics: [
        {
          metric: 'Garbage Collection (GC Alloc)',
          unoptimized: '1,840 KB / วินาที',
          optimized: '0 B (Zero GC)',
          improvement: 'ลดขยะได้ 100%',
          explanation: 'ไม่มีการจองพื้นที่ Heap ใหม่เลยหลังจาก Pool รันครบความจุ'
        },
        {
          metric: 'Frame Time Spikes (อาการกระตุก)',
          unoptimized: '24.5 ms (เกิด Micro-stutters บ่อยครั้ง)',
          optimized: '1.2 ms (เสถียรมาก)',
          improvement: 'นิ่งขึ้น 20 เท่า',
          explanation: 'ตัดรอบ Stop-The-World GC Pauses ออกอย่างถาวร'
        },
        {
          metric: 'Average Frame Rate',
          unoptimized: '32 - 45 FPS (แกว่ง)',
          optimized: '60 FPS (ล็อกนิ่ง)',
          improvement: '+65% FPS เฉลี่ย',
          explanation: 'เกมตอบสนองต่อการคลิกหรือจังหวะการเล็งได้อย่างแม่นยำ'
        }
      ],
      verdict: 'เป็น Best Practice ระดับจำเป็นสำหรับเกมที่มี Projectiles, Particle Emitters, Enemies Spawning หรือ Damage Numbers'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['object-pooling'],
    challenges: TOPIC_CHALLENGES['object-pooling'],
  },

  {
    id: 'spatial-partitioning',
    title: 'Spatial Partitioning (การแบ่งมิติพื้นที่เพื่อตรวจการชน)',
    titleEn: 'Spatial Partitioning (Grid / Quadtree) vs. Brute-Force O(N²)',
    category: 'physics',
    difficulty: 'Intermediate',
    iconName: 'Grid',
    hasInteractiveLab: true,
    labType: 'spatial-grid',
    summary: 'ลดการคำนวณการชนกันของวัตถุจาก O(N²) เป็น O(N log N) หรือ O(N) ด้วยการแบ่งฉากออกเป็นช่องตารางหรือต้นไม้ 4 กิ่ง (Quadtree)',

    simpleExplanation: {
      analogy: 'เหมือน "การส่งจดหมายตามรหัสไปรษณีย์" 📮',
      keyConcept: 'ถ้าในห้องมีคน 1,000 คน แล้วเราอยากรู้ว่าใครเดินชนกันบ้าง การเดินถามทีละคู่ (Brute-force) จะต้องถามเกือบ 500,000 ครั้ง! แต่ถ้าเราแบ่งห้องเป็น 4 โซน แล้วให้คนในโซนเดียวกันเช็คกันเอง เราจะเช็คแค่ไม่กี่สิบครั้งเท่านั้น',
      whyItMatters: 'ในเกมแนว Survivor (เช่น Vampire Survivors), RTS (เช่น StarCraft), หรือเกมที่มีมอนสเตอร์ 3,000 ตัวบนจอ ถ้าคำนวณแบบตรวจทุกคู่ ชนกับทุกคน CPU จะตายและรันได้แค่ 2 FPS ทันทีที่มอนสเตอร์เกิน 1,000 ตัว',
      visualAnalogyDesc: 'แบ่งแผนที่โลกออกเป็นตารางสี่เหลี่ยม (Cells) หรือต้นไม้แตกแขนง 4 กิ่ง (Quadtree) แต่ละตัวจะลงทะเบียนเฉพาะในช่องที่ตนอยู่เท่านั้น เวลาตรวจชนก็ค้นหาเฉพาะช่องตัวเองและช่องข้างเคียง 8 ช่อง',
      bulletPoints: [
        'Brute-Force: ตรวจสอบ $N \\times (N-1) / 2$ ครั้ง (มอนสเตอร์ 2,000 ตัว = เช็ค 1,999,000 ครั้ง/เฟรม!)',
        'Spatial Hashing / Grid: นำพิกัด $(x, y)$ มาหารด้วยขนาด Cell แล้วหยิบเฉพาะเพื่อนบ้านมาเช็ค',
        'ลดภาระการคำนวณลง 95% - 99% ในพริบตา',
        'ทำให้สามารถสร้างเกมที่มีศัตรูหลักพันตัวบนมือถือได้อย่างลื่นไหล 60 FPS'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'การแบ่งแยก Broad-Phase Collision และ Narrow-Phase Collision ใน Physics Engine Architecture',
      lowLevelMechanics: 'ระบบฟิสิกส์สมัยใหม่แบ่งการตรวจชนเป็น 2 ขั้น: 1) Broad-phase: กรองคู่วัตถุที่มีโอกาสชนกันอย่างรวดเร็วโดยใช้ Bounding Volume Hierarchy (BVH), Dynamic AABB Tree, Quadtree (2D), Octree (3D), หรือ Spatial Hash Grid. 2) Narrow-phase: คำนวณคณิตศาสตร์เชิงลึกเฉพาะคู่ที่ผ่าน Broad-phase เช่น GJK (Gilbert-Johnson-Keerthi) หรือ SAT (Separating Axis Theorem). หากไม่มี Broad-phase ที่ดี Narrow-phase จะต้องรับภาระคำนวณจุดตัดรูปทรงเรขาคณิตถึง $O(N^2)$ ครั้งต่อเฟรม',
      engineInternals: {
        unity: 'Unity PhysX ใช้ Multi-Box Pruning (MBP) หรือ Sweep-and-Prune (SAP) ในการจำแนก Broadphase และรองรับ Physics2D.queriesHitTriggers',
        unreal: 'Unreal Chaos Physics Engine ใช้วิธี Spatial Hash Grid คู่กับ Bounding Volume Hierarchies (BVH) เพื่อเร่งความเร็วในการทำ Raycast และ Shape Overlap',
        godot: 'Godot Physics Server ใช้ Dynamic BVH Tree ในการจัดโครงสร้างพื้นที่แบบไดนามิก รองรับทั้งวัตถุที่อยู่นิ่ง (Static) และเคลื่อนไหว (Kinematic/Rigid)'
      },
      complexity: {
        time: 'Brute Force: O(N²) | Spatial Grid: O(N) เฉลี่ยเมื่อวัตถุกระจายตัวสม่ำเสมอ | Quadtree: O(N log N)',
        space: 'O(N + C) โดย C คือจำนวน Cells ในตาราง',
        explanation: 'ใน 2D Spatial Hash Grid แต่ละ Entity จะถูก Hash ไปยัง Bucket `hash = floor(x / cellSize) + floor(y / cellSize) * PRIME` ทำให้เวลาค้นหาเพื่อนบ้านคงที่ O(1) ต่อ Entity'
      },
      mathOrTheory: 'จำนวนคู่คำนวณแบบ Brute Force: $\\frac{N(N - 1)}{2}$. เมื่อ $N = 2000$: $\\frac{2000 \\times 1999}{2} = 1,999,000$ คู่! แต่เมื่อใช้ Grid ขนาด $30 \\times 30$ ความหนาแน่นเฉลี่ยประมาณ 2-3 ตัวต่อช่อง จำนวนคู่จะเหลือเพียงไม่กี่พันคู่เท่านั้น',
      pitfalls: [
        'Cell Size เล็กเกินไป: วัตถุขนาดใหญ่จะคร่อมหลาย Cell ต้องอัปเดตหลายช่องจน Overhead ของ Hash สูงขึ้น',
        'Cell Size ใหญ่เกินไป: วัตถุกองรวมกันใน Cell เดียว กลายเป็น Brute Force ย่อยๆ (Clustering Degeneration)',
        'Dynamic Allocation ใน Grid: สร้าง List ใหม่ในแต่ละ Cell ทุกเฟรมจนเกิด GC Churn (ควรใช้ Flat Array หรือ Linked List Pointer)'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ การตรวจการชนแบบ Brute Force O(N²)',
      badCode: `// ตรวจทุกตัวชนกับทุกตัว - หายนะเมื่อมอนสเตอร์เกิน 500 ตัว
void CheckCollisionsNaive(List<Enemy> enemies) {
    int count = enemies.Count;
    for (int i = 0; i < count; i++) {
        for (int j = i + 1; j < count; j++) {
            // คำนวณระยะห่างทุกคู่ = O(N^2)
            if (Vector2.Distance(enemies[i].pos, enemies[j].pos) < COLLIDE_RADIUS) {
                enemies[i].OnCollide(enemies[j]);
            }
        }
    }
}`,
      goodTitle: '✅ การใช้ Spatial Hash Grid O(N)',
      goodCode: `public class SpatialHashGrid {
    private readonly float cellSize;
    private readonly Dictionary<int, List<Enemy>> grid = new();

    public SpatialHashGrid(float cellSize) => this.cellSize = cellSize;

    private int GetKey(Vector2 pos) {
        int gx = Mathf.FloorToInt(pos.x / cellSize);
        int gy = Mathf.FloorToInt(pos.y / cellSize);
        return (gx * 73856093) ^ (gy * 19349663); // Fast Spatial Hash
    }

    public void Insert(Enemy e) {
        int key = GetKey(e.pos);
        if (!grid.TryGetValue(key, out var list)) {
            list = new List<Enemy>();
            grid[key] = list;
        }
        list.Add(e);
    }

    // ตรวจเฉพาะ 9 ช่องรอบตัว (เซลล์ปัจจุบัน + 8 เซลล์รอบข้าง)
    public void QueryNeighbors(Enemy e, List<Enemy> results) {
        int gx = Mathf.FloorToInt(e.pos.x / cellSize);
        int gy = Mathf.FloorToInt(e.pos.y / cellSize);
        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                int key = ((gx + x) * 73856093) ^ ((gy + y) * 19349663);
                if (grid.TryGetValue(key, out var list)) results.AddRange(list);
            }
        }
    }
}`,
      explanation: 'Spatial Hash Grid ช่วยจำกัดขอบเขตการคำนวณเฉพาะวัตถุที่อยู่ในบริเวณเดียวกัน ทำให้สเกลจำนวนมอนสเตอร์ได้นับพันตัวโดยที่เฟรมเรตไม่ตก'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการคำนวณการชนของวัตถุ 2,500 ชิ้น',
      metrics: [
        {
          metric: 'Collision Checks ต่อเฟรม',
          unoptimized: '3,123,750 ครั้ง / เฟรม',
          optimized: '14,200 ครั้ง / เฟรม',
          improvement: 'ลดการคำนวณลง 99.5%',
          explanation: 'ตัดการตรวจสอบคู่ที่อยู่คนละมุมฉากออกไปทั้งหมดตั้งแต่ขั้นตอนแรก'
        },
        {
          metric: 'Physics Calculation Time',
          unoptimized: '118.4 ms (เกมค้าง)',
          optimized: '1.8 ms (เหลือเฟือสำหรับ 60 FPS)',
          improvement: 'เร็วขึ้นกว่า 65 เท่า',
          explanation: 'CPU สามารถใช้เวลาที่เหลือไปกับการเรนเดอร์และประมวลผล AI'
        },
        {
          metric: 'Max Entities at 60 FPS',
          unoptimized: 'ประมาณ 400 ตัว',
          optimized: '5,000+ ตัว',
          improvement: 'สเกลได้มากขึ้น 12 เท่า',
          explanation: 'สร้างเกมสเกลยูนิตมหาศาลแบบ Vampire Survivors หรือ RTS ได้จริง'
        }
      ],
      verdict: 'หัวใจสำคัญของการสร้างเกมที่มียูนิตจำนวนมาก หากเลือกใช้อัลกอริทึมถูกต้อง เกมจะเร็วขึ้นอย่างมหาศาลโดยไม่ต้องอัปเกรดการ์ดจอ'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['spatial-partitioning'],
    challenges: TOPIC_CHALLENGES['spatial-partitioning'],
  },

  {
    id: 'ecs-dod',
    title: 'Data-Oriented Design & ECS (โครงสร้างข้อมูลเชิงสถาปัตยกรรม)',
    titleEn: 'Data-Oriented Design (ECS) vs. Object-Oriented (OOP)',
    category: 'architecture',
    difficulty: 'Advanced',
    iconName: 'Cpu',
    hasInteractiveLab: true,
    labType: 'ecs-dod',
    summary: 'เพิ่มประสิทธิภาพความเร็วระดับ CPU Hardware Cache (L1/L2) ด้วยการจัดเรียงข้อมูลแบบเรียงติดกันในหน่วยความจำ (Contiguous Arrays) แทนการใช้ Pointer Chasing ใน OOP',

    simpleExplanation: {
      analogy: 'เหมือน "การจัดเรียงสินค้าในโกดัง" 📦',
      keyConcept: 'OOP แบบเดิมเหมือนเอาของทุกชนิดของลูกค้าคนหนึ่ง (ชื่อ, รถ, บ้าน, หมา) ใส่ลังเดียว แล้วเอาลังไปวางกระจัดกระจายทั่วโกดัง เวลาเราอยากรู้น้ำหนักตัวของทุกคน เราต้องวิ่งไปเปิดลังทั่วโกดัง (Cache Miss). แต่ ECS เหมือนนำน้ำหนักตัวของทุกคนมาเขียนใส่กระดาษแผ่นเดียวยาวๆ CPU มองกวาดตาเดียว (Cache Hit) รู้ผลทันที!',
      whyItMatters: 'CPU ปัจจุบันคำนวณได้เร็วระดับนาโนวินาที แต่การดึงข้อมูลจาก RAM ช้ากว่า CPU Cache ถึง 200 เท่า! ถ้าโปรแกรมเมอร์เขียนโค้ดที่ทำให้ CPU ต้องรอ RAM เรื่อยๆ เครื่องจะช้าลงอย่างมาก แม้คอมพิวเตอร์จะมี CPU 16 Core ก็ตาม',
      visualAnalogyDesc: 'AoS (Array of Structures - OOP): [Pos|Vel|Mesh|AI] -> [Pos|Vel|Mesh|AI] ... ปะปนกัน กระจัดกระจายใน Heap | SoA (Structure of Arrays - ECS): Positions [X,Y,X,Y...] เรียงติดกัน, Velocities [VX,VY,VX,VY...] เรียงติดกัน เข้า Cache Line 64 Bytes แบบ 100% ประสิทธิภาพ',
      bulletPoints: [
        'CPU L1 Cache ดึงข้อมูลทีละ Cache Line (64 Bytes) มาเก็บไว้',
        'หากข้อมูลตัวถัดไปอยู่ติดกัน CPU จะหยิบมาคำนวณได้ทันที (Cache Hit = 1 นาโนวินาที)',
        'หากข้อมูลอยู่คนละที่บน Heap เพราะ Pointer Chasing ใน OOP (Cache Miss = 100-200 นาโนวินาที)',
        'Entity Component System (ECS) แยกข้อมูล (Data) ออกจากฟังก์ชันคำนวณ (System) เพื่อความเร็วสูงสุด'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Hardware Cache Hierarchy (L1, L2, L3 vs Main Memory RAM), Memory Access Latency, และ SIMD Vectorization',
      lowLevelMechanics: 'เมื่อ CPU แกนประมวลผลต้องการข้อมูลจาก RAM จะมีการส่งคำขอผ่าน Memory Controller หากข้อมูลไม่อยู่ใน L1/L2/L3 จะเกิด Last Level Cache (LLC) Miss ซึ่งทำให้ CPU Pipeline ต้อง Stall รอเป็นเวลา 100-300 CPU cycles. ใน OOP ทั่วไป เช่น `class Unit { Vector3 pos; Vector3 vel; string name; AudioSource audio; }` การวนลูปอัปเดตตำแหน่ง `unit.pos += unit.vel * dt` จะโหลด AudioSource และ name เข้า Cache Line 64 bytes โดยไม่ได้ใช้งานเลย (Spatial Locality ต่ำมาก). ในทางตรงกันข้าม ECS ใช้ Structure of Arrays (SoA) โดยเก็บ Position ไว้ใน `NativeArray<Vector3>` หรือ Float32Array แบบ contiguous ล้วนๆ ทำให้ 1 Cache line บรรจุ Vector3 ได้ถึง 5 ตัวเต็มประสิทธิภาพ และ Hardware Prefetcher สามารถเดาข้อมูลถัดไปได้ล่วงหน้า 100%',
      engineInternals: {
        unity: 'Unity DOTS (Data-Oriented Technology Stack) ประกอบด้วย Entity Component System (Entities), C# Job System (Multi-core Worker Threads), และ Burst Compiler (แปลง C# IL เป็น Optimized LLVM Machine Code ที่ใช้ SIMD AVX-512)',
        unreal: 'Unreal Engine 5 นำเสนอ Mass Entity Framework (ใช้ใน The Matrix Awakens เพื่อจำลองคนเดินถนนและรถยนต์นับหมื่นคันบนจอพร้อมกัน) บนสถาปัตยกรรม Archetype-based ECS',
        godot: 'Godot ในเวอร์ชัน 4 มีการออกแบบ Server Architecture (RenderingServer, PhysicsServer) แบบ Data-oriented ภายใน C++ core เพื่อความเร็ว'
      },
      complexity: {
        time: 'O(N) ทั้งคู่ในทางทฤษฎี แต่ Constants factor (c) ของ DOD ต่ำกว่า OOP 10 ถึง 50 เท่าบนเครื่องจริง',
        space: 'SoA ประหยัด Memory Overhead จาก Object Headers, VTable Pointers, และ Pointer Alignment',
        explanation: 'ความเร็วไม่ได้มาจาก Big-O Algorithm เสมอไป แต่อยู่ที่ Mechanical Sympathy กับฮาร์ดแวร์จริงของคอมพิวเตอร์'
      },
      mathOrTheory: 'ความเร็ว Memory Latency: L1 Cache ≈ 1 ns (4 cycles) | L2 Cache ≈ 4 ns (14 cycles) | L3 Cache ≈ 10 ns (40 cycles) | DDR4/DDR5 Main RAM ≈ 60-100 ns (200-300 cycles!). ทุก Cache Miss ทำให้ CPU ว่างงานนั่งรอเกือบ 200 รอบ!',
      pitfalls: [
        'Premature Optimization: นำ ECS ไปใช้กับระบบ UI หรือระบบที่มีโค้ดไม่กี่ชิ้น จะเพิ่มความซับซ้อนโดยไม่เห็นผลกำไรความเร็ว',
        'Structural Changes ในระหว่าง Iteration: การเพิ่ม/ลบ Component ขณะวนลูปทำให้เกิด Archetype Migration และ Memory copy ก้อนใหญ่',
        'การเชื่อมต่อกับ Classic Game Engine APIs: ต้องแปลงระหว่าง ECS Entity และ Classic GameObject/Actor อย่างระมัดระวัง'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ OOP แบบดั้งเดิม (Pointer Chasing & Cache Misses)',
      badCode: `// คลาสขนาดใหญ่ กระจัดกระจายอยู่บน Heap
public class Unit : MonoBehaviour {
    public Vector3 position;
    public Vector3 velocity;
    public string unitName;       // ไม่ได้ใช้ตอนอัปเดตฟิสิกส์
    public AudioSource voice;     // เปลือง Cache Line
    public Animator anim;

    void Update() {
        // แต่ละตัวอยู่คนละ Address ใน RAM
        // CPU ต้องกระโดดไปตาม Pointer เกิด Cache Miss ทุกตัว!
        position += velocity * Time.deltaTime;
        transform.position = position;
    }
}`,
      goodTitle: '✅ Unity DOTS / ECS + Burst Compiler (SoA & SIMD)',
      goodCode: `using Unity.Entities;
using Unity.Mathematics;
using Unity.Burst;

// 1. Data ล้วนๆ (Pure Blittable Struct)
public struct Position : IComponentData { public float3 Value; }
public struct Velocity : IComponentData { public float3 Value; }

// 2. System คำนวณแบบขนานบน CPU Cache ด้วย Burst
[BurstCompile]
public partial struct MovementSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;
        
        // รันแบบ Contiguous memory กวาดเข้า CPU Cache เต็มแถว
        // สามารถใช้ SIMD เวกเตอร์คำนวณทีละ 4-8 ตัวพร้อมกันใน 1 Instruction!
        foreach (var (pos, vel) in SystemAPI.Query<RefRW<Position>, RefRO<Velocity>>()) {
            pos.ValueRW.Value += vel.ValueRO.Value * dt;
        }
    }
}`,
      explanation: 'การแยก Data ให้เป็น Struct ล้วนๆ ที่เก็บติดกัน ช่วยให้ CPU Cache ดึงข้อมูลได้อย่างต่อเนื่อง 100% พร้อมเปิดโอกาสให้ Burst Compiler แปลงเป็นคำสั่ง SIMD AVX ได้ทันที'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการอัปเดตตำแหน่งยูนิต 20,000 ตัวบนหน้าจอ',
      metrics: [
        {
          metric: 'CPU Frame Time (Update Loop)',
          unoptimized: '48.2 ms (กระตุกรุนแรง ≈ 20 FPS)',
          optimized: '0.9 ms (ลื่นไหลระดับ 1,000 FPS capability)',
          improvement: 'เร็วขึ้นกว่า 50 เท่า!',
          explanation: 'Cache Hit Rate พุ่งจาก 42% ใน OOP เป็น 98% ใน DOD + Burst Compiler'
        },
        {
          metric: 'Memory Overhead รวม',
          unoptimized: '14.8 MB (มี Object Headers & References)',
          optimized: '0.48 MB (เฉพาะ Raw Float Data)',
          improvement: 'ประหยัดแรมลง 96%',
          explanation: 'ไม่มี Header Overhead และ Metadata ของแต่ละ Class Instance'
        },
        {
          metric: 'CPU Multi-threading Capability',
          unoptimized: 'ติดล็อก Main Thread ของ MonoBehaviour',
          optimized: 'กระจายงานข้าม 8-16 CPU Cores อัตโนมัติ',
          improvement: 'ใช้พลังของ Hardware ทุก Core เต็ม 100%',
          explanation: 'Jobs ปราศจาก Data Race เพราะแยก Component อ่าน/เขียน ชัดเจน'
        }
      ],
      verdict: 'หัวใจของเทคโนโลยีเกมยุคใหม่สำหรับเกมฝูงซอมบี้ (Days Gone / World War Z) หรือเกมจำลองการรบขนาดใหญ่ (Total War)'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['ecs-dod'],
    challenges: TOPIC_CHALLENGES['ecs-dod'],
  },

  {
    id: 'fixed-timestep',
    title: 'Game Loop & Physics (Fixed Timestep vs Variable Delta Time)',
    titleEn: 'Fixed Timestep (Accumulator Pattern) vs. Variable Delta Time',
    category: 'physics',
    difficulty: 'Intermediate',
    iconName: 'Timer',
    hasInteractiveLab: true,
    labType: 'fixed-timestep',
    summary: 'ป้องกันบั๊กวัตถุลอยทะลุกำแพง (Tunneling) และฟิสิกส์ระเบิดเมื่อเครื่องแล็ก ด้วยการแยก Frame Rate ของการเรนเดอร์ออกจาก Timestep ของฟิสิกส์',

    simpleExplanation: {
      analogy: 'เหมือน "การบันทึกบัญชีการเงินที่ต้องนับทุกวันตรงเวลา" ⏱️',
      keyConcept: 'ถ้าเครื่องของคุณเกิดอาการกระตุกไป 0.5 วินาที แล้วเกมเอาเวลาที่ผ่านไป 0.5 วินาทีมาคูณกับความเร็วของลูกปืน ลูกปืนจะก้าวกระโดดข้ามกำแพงไปอีกฝั่งทันที (Tunneling)! แต่ถ้าเราซอยเวลาที่ค้างอยู่นั้นเป็นก้าวเล็กๆ ที่คงที่ทีละ 0.016 วินาทีเสมอ ลูกปืนจะชนกำแพงอย่างถูกต้องเสมอไม่ว่าเครื่องจะแล็กแค่ไหน',
      whyItMatters: 'ในเกมแข่งรถ เกมยิงปืน หรือเกมฟิสิกส์ หากไม่ใช้ Fixed Timestep ผู้เล่นที่เครื่องแล็กจะได้เปรียบ/เสียเปรียบอย่างไม่เป็นธรรม เช่น บินทะลุแมพได้ หรือโดดได้สูงไม่เท่ากับคนที่เครื่องลื่น (Non-deterministic physics)',
      visualAnalogyDesc: 'Variable dt: เฟรมยาว -> วัตถุกระโดดก้าวยักษ์ (ทะลุกำแพง) | Fixed Timestep Accumulator: เก็บเวลาไว้ในถัง (Accumulator) แล้วเทออกทีละช้อนเท่าๆ กันเสมอ (ก้าวเล็กเท่าเดิมเสมอ)',
      bulletPoints: [
        'Render Loop ทำงานตาม Refresh Rate ของหน้าจอ (60Hz, 144Hz, 240Hz)',
        'Physics Loop ต้องรันด้วย Timestep คงที่ (เช่น 50Hz หรือ 60Hz คงที่เสมอ)',
        'Accumulator Pattern: สะสม Delta Time แล้ววนลูปคำนวณ Physics ในสเต็ปที่เท่ากัน',
        'ขจัดบั๊กลูกกระสุนทะลุกำแพงและป้องกันอาการ Physics Explosion เมื่อเกิด Lag Spike'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Glenn Fiedler\'s "Fix Your Timestep!" Pattern, Numerical Integration (Explicit Euler vs Verlet vs RK4), และ Spiral of Death Mitigation',
      lowLevelMechanics: 'สมการการเคลื่อนที่เชิงตัวเลข Euler Integration: $x_{t+dt} = x_t + v_t \\cdot dt$. หาก $dt$ มีค่าแปรปรวน (เช่น จาก 0.016s พุ่งเป็น 0.2s ระหว่าง Garbage Collection หรือโหลดฉาก) ความผิดพลาดของการรวมเชิงตัวเลข (Truncation Error) จะขยายตัวทวีคูณ ส่งผลให้แรง Spring พุ่งสูงจนระบบระเบิด หรือวัตถุที่มีความเร็ว $v$ เดินทางระยะทาง $v \\cdot dt$ กว้างกว่าความหนาของ Collider (เรียกว่า Tunneling). เทคนิค Accumulator สะสมเวลาจริงที่ไหลผ่าน $accumulator += frameTime$ และทำการ Integrate ฟิสิกส์ด้วย $dt$ คงที่ตราบใดที่ $accumulator \\ge dt$ พร้อมจำกัดขอบเขตการคำนวณสูงสุด (Max Sub-steps) เพื่อป้องกัน Spiral of Death (ภาวะที่ฟิสิกส์คำนวณช้าจนทำให้เฟรมถัดไปสะสมเวลามากขึ้นเรื่อยๆ จนเกมค้าง)',
      engineInternals: {
        unity: 'Unity แยกอย่างชัดเจนระหว่าง Update() (Variable dt ตาม Render Frame) และ FixedUpdate() (รันตาม Time.fixedDeltaTime ซึ่งค่าเริ่มต้นคือ 0.02s = 50Hz)',
        unreal: 'Unreal Engine 4/5 ใช้ Substepping ใน PhysX/Chaos เพื่อแบ่งเฟรมใหญ่ให้ฟิสิกส์คำนวณย่อยหลายรอบ (MaxSubstepDeltaTime)',
        godot: '_process(delta) สำหรับ Render และ _physics_process(delta) ซึ่งล็อก Timestep คงที่ (ค่าเริ่มต้น 60 Ticks/sec)'
      },
      complexity: {
        time: 'O(k) โดย k คือจำนวน Sub-steps ที่ถูกสะสมใน Accumulator (ปกติ 1-2 สเต็ปต่อเฟรม)',
        space: 'O(1) ใช้ State ก่อนหน้าและปัจจุบันเพื่อทำ Hermite/Linear Interpolation ในการเรนเดอร์',
        explanation: 'เพิ่มความเสถียรและ Determinism ให้กับระบบฟิสิกส์และการเล่นผ่านเครือข่าย (Lockstep / Rollback Netcode)'
      },
      mathOrTheory: 'เงื่อนไขการเกิด Tunneling: หาก $|v| \\cdot dt > W_{wall}$ โดยที่ $W_{wall}$ คือความหนาของกำแพง วัตถุจะเทเลพอร์ตข้ามกำแพงไปโดยที่ Raycast หรือ AABB Overlap ตรวจไม่พบ',
      pitfalls: [
        'Spiral of Death: ลืมใส่ Clamp ให้ Accumulator ทำให้เมื่อเครื่องหน่วง ฟิสิกส์พยายามคำนวณชดเชยจนเครื่องยิ่งหน่วงกว่าเดิมจน Freeze',
        'Jittering / Stuttering ตอนเรนเดอร์: ไม่ได้ทำ Visual Transform Interpolation ระหว่างสถานะฟิสิกส์ก่อนหน้าและปัจจุบัน ทำให้ภาพดูกระตุกเมื่อ Refresh rate จอไม่ตรงกับ Physics tick rate',
        'การเรียก Input ใน FixedUpdate: Input อาจตกหล่นหากผู้เล่นกดปุ่มในเฟรมที่ไม่มี Fixed tick (ควรอ่าน Input ใน Update แล้วส่ง Event ไปยัง FixedUpdate)'
      ]
    },

    codeExample: {
      language: 'cpp',
      badTitle: '❌ การคำนวณฟิสิกส์โดยใช้ Variable dt ตรงๆ',
      badCode: `// คำนวณฟิสิกส์ใน Render Loop โดยตรง
void Update(float variableDt) {
    // หากเกิด Lag Spike (dt = 0.2 วินาที)
    // ลูกบอลความเร็วสูงจะขยับก้าวกระโดด 20 เมตรในเฟรมเดียว ทะลุกำแพงทันที!
    ball.velocity += gravity * variableDt;
    ball.position += ball.velocity * variableDt;
    
    // ตรวจชนหลังขยับ - ตรวจไม่เจอเพราะข้ามกำแพงไปแล้ว!
    CheckCollision(ball);
}`,
      goodTitle: '✅ สถาปัตยกรรม Fix Your Timestep (Accumulator Pattern)',
      goodCode: `// สถาปัตยกรรม Game Loop มาตรฐานระดับ AAA
class GameLoop {
    const float FIXED_DT = 1.0f / 60.0f; // 60 Hz คงที่เสมอ
    float accumulator = 0.0f;

    void MainLoop(float frameTime) {
        // ป้องกัน Spiral of Death หากเครื่องค้างไปชั่วขณะ
        if (frameTime > 0.25f) frameTime = 0.25f;
        accumulator += frameTime;

        // ซอยเวลาที่สะสมเป็นก้าวที่มั่นคงเท่าๆ กัน
        while (accumulator >= FIXED_DT) {
            PreviousState = CurrentState;
            IntegratePhysics(CurrentState, FIXED_DT); // ไม่มีทาง Tunneling
            accumulator -= FIXED_DT;
        }

        // Interpolate สำหรับการเรนเดอร์ให้เนียนตา
        float alpha = accumulator / FIXED_DT;
        RenderState = Lerp(PreviousState, CurrentState, alpha);
        Draw(RenderState);
    }
};`,
      explanation: 'การใช้ Accumulator ช่วยให้มั่นใจได้ว่าระบบฟิสิกส์จะคำนวณด้วยแรงและความเร่งที่ถูกต้องเท่าเดิมเสมอ ไม่ว่าจะรันบนคอมพิวเตอร์สเปกต่ำหรือจอ 240Hz'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบความเสถียรเมื่อเกิดอาการ Lag Spike (Drop Frame)',
      metrics: [
        {
          metric: 'Collision Tunneling Rate',
          unoptimized: 'เกิดบั๊กทะลุกำแพง 35% - 70% ของลูกกระสุนความเร็วสูง',
          optimized: '0% (ไม่มีการทะลุกำแพงแม้แต่ครั้งเดียว)',
          improvement: 'ความถูกต้อง 100%',
          explanation: 'ระยะก้าวต่อสเต็ปของฟิสิกส์ถูกควบคุมให้สั้นกว่าความหนาของกำแพงเสมอ'
        },
        {
          metric: 'Physics Determinism',
          unoptimized: 'ผลลัพธ์การกระดอนเปลี่ยนไปตาม FPS ของเครื่องผู้เล่น',
          optimized: 'เหมือนกันทุกเครื่อง 100% (Bit-exact reproducibility)',
          improvement: 'รองรับ Replay & Netcode',
          explanation: 'จำเป็นอย่างยิ่งสำหรับเกม E-Sports และเกมจำลอง Multiplayer'
        },
        {
          metric: 'Frame Pacing Stability',
          unoptimized: 'แรงสปริงและแรงเสียดทานระเบิดเมื่อ FPS แกว่ง',
          optimized: 'ระบบฟิสิกส์นิ่งสงบ ไม่เกิด Simulation Explode',
          improvement: 'ตัดปัญหาเกมพังจากบั๊กฟิสิกส์',
          explanation: 'การจำกัด Max Sub-steps ช่วยป้องกันเกมค้างจาก Spiral of Death'
        }
      ],
      verdict: 'กฎเหล็กข้อที่หนึ่งของโปรแกรมเมอร์เกม: อย่าคำนวณฟิสิกส์บนตัวแปร Delta Time ที่แกว่งไปมาโดยเด็ดขาด'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['fixed-timestep'],
    challenges: TOPIC_CHALLENGES['fixed-timestep'],
  },

  {
    id: 'draw-calls-batching',
    title: 'Draw Call Batching & GPU Instancing (การเรนเดอร์ประสิทธิภาพสูง)',
    titleEn: 'Draw Calls: Static/Dynamic Batching & GPU Instancing',
    category: 'rendering',
    difficulty: 'Intermediate',
    iconName: 'Layers',
    hasInteractiveLab: true,
    labType: 'draw-calls',
    summary: 'ลดคอขวดที่ CPU ส่งคำสั่งวาดภาพสู่ GPU โดยการรวบรวมวัตถุที่ใช้ Material เดียวกันส่งไปเรนเดอร์ในคำสั่งเดียว (GPU Instancing)',

    simpleExplanation: {
      analogy: 'เหมือน "การขนส่งสินค้าด้วยรถบรรทุก" 🚚',
      keyConcept: 'ถ้าคุณต้องการส่งกล่องพัสดุ 1,000 กล่องไปยังอีกเมืองหนึ่ง (GPU) การขับรถมอเตอร์ไซค์ไปส่งทีละกล่อง 1,000 รอบ (1,000 Draw Calls) จะเสียเวลาขับรถไปกลับมหาศาล! แต่ถ้าเราเอากล่องทั้งหมดใส่ขึ้นรถบรรทุกคันเดียวแล้ววิ่งไปส่งรอบเดียว (1 Instanced Draw Call) จะเร็วกว่าหลายร้อยเท่า',
      whyItMatters: 'GPU ปัจจุบันมีพลังประมวลผลสูงมาก สามารถวาดสามเหลี่ยมนับล้านชิ้นได้สบาย แต่สิ่งที่ทำให้เกมกระตุกมักเกิดจาก CPU ส่งคำสั่งวาด (Draw Call) ไม่ทัน จน GPU ต้องนั่งรอเฉยๆ (CPU Bottleneck)',
      visualAnalogyDesc: 'Individual Draw Call: CPU -> "วาดต้นไม้ต้นที่ 1", GPU ทำงาน -> CPU -> "วาดต้นไม้ต้นที่ 2" ... เกิด Driver Overhead นับพันครั้ง | GPU Instancing: CPU -> "นี่คือโมเดลต้นไม้ 1 อัน และนี่คือพิกัดของทั้ง 5,000 ต้น วาดทั้งหมดนี้เลย!" -> GPU วาดรวดเดียวใน 1 คำสั่ง',
      bulletPoints: [
        'Draw Call คือคำสั่งจาก CPU ผ่าน Graphics API (DirectX, Vulkan, Metal) เพื่อสั่ง GPU ให้วาด Mesh',
        'การเปลี่ยน State (เปลี่ยน Material, Texture, Shader) กินพลัง CPU สูงมาก',
        'GPU Instancing อนุญาตให้วาด Mesh เดียวกันในพิกัด/สี/สเกลที่ต่างกันนับหมื่นชิ้นใน 1 Draw Call',
        'Static Batching รวมโมเดลที่ไม่ขยับเข้าด้วยกันตั้งแต่ต้นฉาก'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Graphics Driver Overhead, Command Buffers, Uniform Buffer Objects (UBO), Shader Storage Buffers (SSBO), และ glDrawElementsInstanced / vkCmdDrawIndexed',
      lowLevelMechanics: 'ทุกครั้งที่เกมเรียกคำสั่งวาด (เช่น `glDrawElements` หรือ `DrawIndexed`) CPU Graphics Driver จะต้องทำการตรวจสอบ Pipeline State Object (PSO), Binding Vertex Buffers, Index Buffers, และ Uniform Descriptors ลงสู่ Command Buffer. หากฉากมีต้นไม้หรือก้อนหิน 5,000 ต้นแยกเป็น 5,000 Draw Calls CPU จะต้องเสียเวลา Context Switching และ API Validation สูงถึง 10-15ms ต่อเฟรม ส่งผลให้ CPU ติดคอขวด (CPU Bound) แม้ GPU จะทำงานเพียง 20% เท่านั้น. เมื่อใช้ GPU Instancing เราจะส่ง Instance Buffer ที่บรรจุ Matrix ตำแหน่ง ขนาด และสี (`StructuredBuffer<InstanceData>`) ไปเก็บไว้ใน VRAM แล้วเรียกคำสั่ง Instanced Draw เพียงคำสั่งเดียว GPU Vertex Shader จะอ่าน `SV_InstanceID` หรือ `gl_InstanceID` เพื่อดึงข้อมูลแปลงพิกัดของแต่ละชิ้นได้เองโดยตรงบนการ์ดจอ',
      engineInternals: {
        unity: 'Unity มี SRP Batcher (ใน URP/HDRP) ที่แคช Constant Buffers และลดค่าใช้จ่ายการเปลี่ยน Material State ควบคู่กับ Graphics.RenderMeshInstanced',
        unreal: 'Unreal Engine 5 ใช้ Hierarchical Instanced Static Mesh (HISM) และ Nanite ซึ่งเป็น Virtualized Geometry Pipeline ที่จัดการ Batching และ Micro-polygon Culling ในระดับ Compute Shader',
        godot: 'Godot 4 ใช้ MultiMeshInstance2D/3D สำหรับเรนเดอร์วัตถุซ้ำๆ นับแสนชิ้นผ่าน Instanced Rendering'
      },
      complexity: {
        time: 'O(1) ในมุมของ CPU Draw Command Dispatch สำหรับวัตถุนับหมื่นชิ้น',
        space: 'เพิ่มขนาด Instance Buffer บน VRAM เล็กน้อย (ประมาณ 64 Bytes ต่อยูนิตสำหรับ Transform Matrix 4x4)',
        explanation: 'เปลี่ยนจาก CPU Driver Overhead $O(N)$ ให้เหลือ $O(1)$ โดยให้หน่วยประมวลผล Parallel Cores นับพันของ GPU ทำงานแทน'
      },
      mathOrTheory: 'Draw Call Budget สำหรับเกม 60 FPS: แพลตฟอร์มมือถือควรมี Draw Calls ไม่เกิน 100-200 Calls/เฟรม, เครื่องคอนโซลและ PC ควรพยายามคุมให้อยู่ในช่วง 1,000-3,000 Calls/เฟรม',
      pitfalls: [
        'ใช้วัสดุ (Material) คนละชิ้น: วัตถุที่ใช้ Shader หรือ Texture ต่างกันจะไม่สามารถรวม Draw Call เดียวกันได้ (ต้องใช้ Texture Atlas หรือ Texture Array)',
        'Skinned Mesh Animating: การทำ Instancing กับตัวละครที่มีโครงกระดูกเคลื่อนไหวซับซ้อนทำได้ยากกว่า Static Mesh (ต้องอบแอนิเมชันลงใน Vertex Texture หรือใช้ Compute Shader skinning)',
        'Dynamic Batching CPU Overhead: การให้ CPU เอารูปทรงมารวม Vertex เข้าด้วยกันในแต่ละเฟรมอาจกิน CPU มากกว่าผลดีที่ได้'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ การเรนเดอร์แยกชิ้นเดี่ยวๆ (1,000 วัตถุ = 1,000 Draw Calls)',
      badCode: `// สั่งวาดแยกชิ้นเดี่ยวๆ ในแต่ละเฟรม - Driver Overhead บานปลาย!
void RenderAsteroids(List<Asteroid> asteroids) {
    foreach (var ast in asteroids) {
        // ทุกคำสั่งทำให้ CPU ต้องส่ง State change สู่ GPU Driver
        Graphics.DrawMesh(mesh, ast.matrix, material, 0); 
    }
    // ผลลัพธ์: 1,000 Draw Calls ทำให้ CPU ค้างและ FPS ตกเหลือ 25!
}`,
      goodTitle: '✅ การใช้ GPU Instancing (1,000 วัตถุ = 1 Draw Call)',
      goodCode: `// เรนเดอร์อุกกาบาตนับพันในคำสั่งเดียวผ่าน GPU Instancing
void RenderAsteroidsInstanced(Matrix4x4[] matrices, MaterialPropertyBlock props) {
    // ส่งทั้ง 1,000 ก้อนไปให้ GPU วาดในครั้งเดียว!
    Graphics.RenderMeshInstanced(
        new RenderParams(material) { matProps = props },
        mesh,
        0,
        matrices,
        matrices.Length
    );
    // ผลลัพธ์: เหลือเพียง 1 Draw Call ลื่นไหล 120+ FPS!
}`,
      explanation: 'GPU Instancing ส่งข้อมูลเมทริกซ์การแปลงตำแหน่งและสีทั้งหมดไปให้ GPU เรนเดอร์ขนานกันในคำสั่งเดียว ปลดปล่อย CPU ให้มีเวลาว่างไปคำนวณเกมเพลย์'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการเรนเดอร์ป่าไม้หรือเศษหินอุกกาบาต 5,000 ชิ้น',
      metrics: [
        {
          metric: 'Draw Calls Count',
          unoptimized: '5,000 Calls / เฟรม',
          optimized: '5 Calls / เฟรม (แบ่งเป็น Batches ละ 1,000)',
          improvement: 'ลดคำสั่งวาดลง 99.9%',
          explanation: 'ลดภาระการสื่อสารระหว่าง CPU Driver และ GPU ลงเกือบทั้งหมด'
        },
        {
          metric: 'CPU Render Submission Time',
          unoptimized: '22.4 ms (ติดคอขวด CPU Bound อย่างหนัก)',
          optimized: '0.4 ms (CPU แทบไม่ใช้เวลาเลย)',
          improvement: 'เร็วขึ้นกว่า 50 เท่า',
          explanation: 'CPU สามารถไปประมวลผล AI, Physics หรือ Logic อื่นได้เต็มที่'
        },
        {
          metric: 'FPS บนฮาร์ดแวร์ระดับกลาง',
          unoptimized: '28 FPS (ภาพกระตุก)',
          optimized: '60+ FPS (ลื่นไหลเต็มพิกัด)',
          improvement: '+114% Frame Rate',
          explanation: 'GPU ได้รับคำสั่งอย่างต่อเนื่องโดยไม่ต้องหยุดรองานจาก CPU'
        }
      ],
      verdict: 'หนึ่งในเทคนิคการ Optimize กราฟิกที่เห็นผลชัดเจนที่สุดใน Game Development ทั้งในเกม 2D และ 3D'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['draw-calls-batching'],
    challenges: TOPIC_CHALLENGES['draw-calls-batching'],
  },

  {
    id: 'pathfinding-algorithms',
    title: 'Pathfinding (การค้นหาเส้นทางเดิน: A* vs Dijkstra vs BFS)',
    titleEn: 'Pathfinding: A* Search vs. Dijkstra vs. Breadth-First Search',
    category: 'ai',
    difficulty: 'Intermediate',
    iconName: 'Compass',
    hasInteractiveLab: true,
    labType: 'pathfinding',
    summary: 'เปรียบเทียบวิธีหาทางเดินของ NPC ในเกม ว่าเหตุใดการใส่ Heuristic Function ใน A* จึงทำให้ศัตรูเดินหาผู้เล่นได้เร็วกว่า Dijkstra นับสิบเท่า',

    simpleExplanation: {
      analogy: 'เหมือน "การเดินในเขาวงกตโดยมีเข็มทิศชี้บอกเป้าหมาย" 🧭',
      keyConcept: 'Dijkstra หรือ BFS เหมือนคนตาบอดที่ค่อยๆ เอามือคลำกำแพงขยายวงกลมออกไปทุกทิศทางอย่างเท่าเทียมกัน (เสียเวลาสำรวจทางที่ห่างจากเป้าหมาย). แต่ A* เหมือนคนที่ถือเข็มทิศที่คอยบอกว่า "จุดหมายปลายทางอยู่ทางทิศตะวันออกเฉียงเหนือนะ" จึงมุ่งหน้าเดินไปทางนั้นก่อนทันที',
      whyItMatters: 'ในเกมวางแผนการรบ (RTS) หรือเกมแนว Tower Defense ถ้ามียูนิต 200 ตัวสั่งเดินพร้อมกัน หากใช้อัลกอริทึมที่ค้นหาแบบสุ่มสี่สุ่มห้า เกมจะค้างไปหลายร้อยมิลลิวินาทีในเฟรมที่สั่งเดินทัพ',
      visualAnalogyDesc: 'BFS: แผ่วงกลมเท่ากันทุกทิศทาง | Dijkstra: พิจารณาค่าน้ำหนักเส้นทาง (Weight) แต่ยังคงแผ่ออกรอบทิศ | A*: ใช้สูตร f(n) = g(n) + h(n) พุ่งตรงไปยังเป้าหมายอย่างชาญฉลาดโดยตรวจพื้นที่ที่ไม่เกี่ยวข้องน้อยที่สุด',
      bulletPoints: [
        'Breadth-First Search (BFS): เหมาะกับกริดที่ไม่มีค่าน้ำหนัก (Unweighted Grid)',
        'Dijkstra: รองรับภูมิประเทศที่เดินยากง่ายต่างกัน (โคลน, ถนน, ทางชัน)',
        'A* (A-Star): ดีที่สุดสำหรับการหาทางจากจุด A ไปจุด B เดี่ยวๆ โดยใช้ Heuristic (Manhattan / Euclidean Distance)',
        'Jump Point Search (JPS) และ NavMesh: เทคนิคขั้นสูงสำหรับสเกลแผนที่ขนาดใหญ่'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Graph Traversal, Priority Queues (Min-Heap), Admissible Heuristics, และ Navigation Mesh (NavMesh) Dual Graph',
      lowLevelMechanics: 'หัวใจของ A* คือสมการฟังก์ชันประเมิน $f(n) = g(n) + h(n)$ โดยที่ $g(n)$ คือต้นทุนจริงจากจุดเริ่มต้นถึงโหนด $n$ และ $h(n)$ คือการคาดเดาต้นทุนจากโหนด $n$ ถึงเป้าหมาย (Heuristic). หาก Heuristic มีคุณสมบัติ Admissible (ไม่ประเมินค่าเกินจริง $h(n) \\le h^*(n)$) A* จะการันตีว่าจะได้เส้นทางที่สั้นที่สุดเสมอ (Optimal Path). การเก็บโหนดใน Open Set ต้องใช้โครงสร้างข้อมูลแบบ Min-Heap (Binary Heap) เพื่อให้การดึงโหนดที่มีค่า $f$ ต่ำสุดทำได้ใน $O(1)$ และการ Insert/Update ใน $O(\\log N)$. หากใช้ Array ธรรมดา การหาค่าต่ำสุดจะกลายเป็น $O(N)$ ทำให้ประสิทธิภาพตกฮวบ',
      engineInternals: {
        unity: 'Unity ใช้ NavMesh บนพื้นฐานของ Recast Navigation ซึ่งแปลงโมเดล 3D เป็น Convex Polygons และใช้ A* ในการค้นหาเส้นทางข้ามโพลิกอน',
        unreal: 'Unreal Engine Navigation System มี RecastNavMesh รองรับ Hierarchical Graph และ Dynamic NavMesh Obstacles Carving แบบเรียลไทม์',
        godot: 'Godot 4 ใช้ NavigationServer3D/2D รองรับการคำนวณหลบหลีกแบบ RVO (Reciprocal Velocity Obstacles) คู่กับ AStar2D/AStar3D class'
      },
      complexity: {
        time: 'Worst-case: O(b^d) แต่ในทางปฏิบัติ A* ตรวจสอบโหนดน้อยกว่า Dijkstra 70-90% | Open set operations: O(log N)',
        space: 'O(V) ในการเก็บ Closed set และ Parent pointers ในหน่วยความจำ',
        explanation: 'Heuristic ที่แม่นยำช่วยตัดแต่งกิ่งก้าน (Pruning) ของพื้นที่ค้นหาออกไปได้อย่างมหาศาล'
      },
      mathOrTheory: 'ระยะทาง Manhattan สำหรับ Grid 4 ทิศทาง: $h(n) = |x_n - x_{target}| + |y_n - y_{target}|$ | ระยะทาง Euclidean สำหรับพื้นที่อิสระ: $h(n) = \\sqrt{(x_n - x_t)^2 + (y_n - y_t)^2}$',
      pitfalls: [
        'Heuristic Overestimation: หากประมาณค่า $h(n)$ สูงกว่าความเป็นจริง อัลกอริทึมจะทำงานเร็วขึ้นแต่จะได้เส้นทางที่ไม่ใช่เส้นทางสั้นที่สุด',
        'การคำนวณ Path ซ้ำทุกเฟรม: ควรทำ Path Request Queue และให้ยูนิตคำนวณเส้นทางใหม่เฉพาะเมื่อเป้าหมายขยับเกินเกณฑ์ หรือทางถูกปิดกั้น',
        'Memory Allocation ในลูป A*: การ `new Node()` ในระหว่างการค้นหาก่อให้เกิด GC Spikes (ควร Re-use Flat Array หรือ Pre-allocated Node Pool)'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ การค้นหาเส้นทางแบบคำนวณใหม่ทุกเฟรม (Frame-Rate Killer)',
      badCode: `// คำนวณเส้นทางทุกตัวในทุกเฟรม - ถ้ามียูนิต 100 ตัว เกมพังทันที!
void Update() {
    // 100 ยูนิต x วิ่งหาเส้นทาง A* ทุกเฟรม = 6,000 ครั้งต่อวินาที!
    List<Vector3> path = Pathfinding.FindPath(transform.position, player.position);
    FollowPath(path);
}`,
      goodTitle: '✅ สถาปัตยกรรม Pathfinding Request Manager แบบกระจายคิว',
      goodCode: `public class PathRequestManager : MonoBehaviour {
    private Queue<PathRequest> requestQueue = new();
    private const int MAX_PATHS_PER_FRAME = 3; // จำกัดโควตาต่อเฟรม

    public static void RequestPath(Vector3 start, Vector3 target, Action<List<Vector3>> callback) {
        Instance.requestQueue.Enqueue(new PathRequest(start, target, callback));
    }

    void Update() {
        int processed = 0;
        // กระจายงานข้ามหลายๆ เฟรม ไม่เกิด Spike กะทันหัน
        while (requestQueue.Count > 0 && processed < MAX_PATHS_PER_FRAME) {
            var req = requestQueue.Dequeue();
            var path = AStar.Calculate(req.start, req.target);
            req.callback?.Invoke(path);
            processed++;
        }
    }
}`,
      explanation: 'การใช้ Time-slicing Request Queue ช่วยให้ระบบเฉลี่ยภาระการคำนวณออกไปหลายๆ เฟรม ป้องกันไม่ให้เกมกระตุกเมื่อผู้เล่นสั่งยูนิตเดินพร้อมกัน'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการหาเส้นทางบนตาราง 50x50 ช่องที่มีสิ่งกีดขวาง',
      metrics: [
        {
          metric: 'จำนวน Cells ที่ต้องตรวจสำรวจ (Explored Nodes)',
          unoptimized: 'Dijkstra: 1,840 ช่อง (สำรวจแทบทั้งแผนที่)',
          optimized: 'A*: 210 ช่อง (พุ่งตรงสู่เป้าหมาย)',
          improvement: 'ลดการสำรวจลง 88.5%',
          explanation: 'Heuristic Function ช่วยดึงทิศทางการสำรวจมุ่งหน้าไปหาเป้าหมายโดยตรง'
        },
        {
          metric: 'Execution Time ต่อคำขอ',
          unoptimized: 'Dijkstra: 4.8 ms',
          optimized: 'A*: 0.5 ms',
          improvement: 'เร็วขึ้นเกือบ 10 เท่า',
          explanation: 'ใช้ CPU cycles น้อยลงมากในการค้นหาเส้นทางที่ดีที่สุด'
        },
        {
          metric: 'ความถูกต้องของความยาวเส้นทาง',
          unoptimized: 'เส้นทางสั้นที่สุด (Optimal)',
          optimized: 'เส้นทางสั้นที่สุดเท่ากัน 100%',
          improvement: 'ได้ผลลัพธ์เพอร์เฟกต์เหมือนกัน',
          explanation: 'เพราะ Manhattan Heuristic มีคุณสมบัติ Admissible'
        }
      ],
      verdict: 'A* คือมาตรฐานอุตสาหกรรมสำหรับการหาเส้นทางแบบจุดต่อจุดในเกม 2D และ 3D'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['pathfinding-algorithms'],
    challenges: TOPIC_CHALLENGES['pathfinding-algorithms'],
  },

  {
    id: 'game-ai-fsm-bt',
    title: 'Game AI Architecture (Finite State Machine vs Behavior Trees)',
    titleEn: 'Game AI: Finite State Machine (FSM) vs. Behavior Trees',
    category: 'ai',
    difficulty: 'Intermediate',
    iconName: 'Brain',
    hasInteractiveLab: true,
    labType: 'ai-fsm',
    summary: 'เปรียบเทียบการออกแบบสติปัญญาของศัตรู: เมื่อไหร่ที่ State Machine จะกลายเป็นโค้ดสปาเกตตี และเหตุใดเกมใหญ่ระดับ Halo จึงใช้ Behavior Trees',

    simpleExplanation: {
      analogy: 'เหมือน "ไฟจราจร" (FSM) เทียบกับ "ผังการตัดสินใจของหัวหน้างวดงาน" (Behavior Tree) 🚦',
      keyConcept: 'State Machine เหมือนไฟจราจร—ในหนึ่งช่วงเวลามันเป็นได้แค่สถานะเดียว (เช่น เดินลาดตระเวน, ไล่ล่า, หรือโจมตี). เมื่อระบบเริ่มซับซ้อนขึ้น เส้นทางเปลี่ยนสถานะ (Transitions) จะพันกันยุ่งเหยิงเหมือนสายไฟ! แต่ Behavior Tree เหมือนลำดับความคิดของมนุษย์: "ถ้าเห็นผู้เล่น -> ลองยิงดู ถ้าไม่มีกระสุน -> ลองหลบหลังกำแพง"',
      whyItMatters: 'ในเกมง่ายๆ FSM เขียนเร็วและเข้าใจง่ายมาก แต่ถ้าตัวละครมี 15 สถานะ (นอน, กิน, ตกใจ, เรียกเพื่อน, ปีน, หมอบ, ยิง...) โค้ด FSM จะพังเพราะมีลูกศรเปลี่ยนไปมาร่วม 100 เส้น ในขณะที่ Behavior Tree สามารถเสียบพฤติกรรมใหม่เพิ่มได้โดยไม่ต้องแก้โค้ดเก่า',
      visualAnalogyDesc: 'FSM: กราฟที่มีเส้นเชื่อมโยงไปมาทุกทิศทาง (State Explosion) | Behavior Tree: ต้นไม้ลำดับชั้นจากบนลงล่าง มีโหนด Selector (ลองทำอันแรกก่อน), Sequence (ทำเรียงตามลำดับ), และ Action (เดิน, ยิง, หลบ)',
      bulletPoints: [
        'FSM (Finite State Machine): เข้าใจง่าย เหมาะกับศัตรูง่ายๆ หรือตัวละครผู้เล่น (Player Controller)',
        'State Explosion: ปัญหาคลาสสิกของ FSM เมื่อจำนวนสถานะเพิ่มขึ้น ค่าใช้จ่ายในการดูแลจะเพิ่มขึ้นแบบ $O(S^2)$',
        'Behavior Trees (BT): โมดูลาร์สูง Reusable นำพฤติกรรมเดิมไปใช้กับศัตรูประเภทอื่นได้ทันที',
        'Halo 2 เป็นเกมแรกที่จุดประกายให้ Behavior Trees กลายเป็นมาตรฐานของวงการเกมระดับโลก'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'State Pattern, Hierarchical State Machines (HSM), Behavior Tree Tick Architecture, Blackboard Pattern, และ Flow Control Nodes',
      lowLevelMechanics: 'Behavior Tree ทำงานผ่านวงจรการประเมินผลที่เรียกว่า "Tick" จากโหนดราก (Root) วิ่งลงสู่กิ่งก้านสาขา แต่ละโหนดจะคืนค่าสถานะ 1 ใน 3 แบบ: SUCCESS, FAILURE, หรือ RUNNING (สำหรับพฤติกรรมที่ใช้เวลา เช่น เดินไปที่จุดหมาย). โหนดควบคุมมี 2 ประเภทหลัก: 1) Sequence (เทียบเท่า AND ทางตรรกศาสตร์): จะรันโหนดลูกไปเรื่อยๆ ตราบใดที่ยังได้ SUCCESS หากตัวใด FAIL จะหยุดทันที. 2) Selector / Fallback (เทียบเท่า OR ทางตรรกศาสตร์): จะลองรันโหนดลูกทีละตัวจนกว่าจะเจอตัวที่ SUCCESS หาก FAIL จะลองตัวถัดไป. ข้อมูลส่วนกลาง (เช่น ตำแหน่งผู้เล่น, จำนวนกระสุนที่เหลือ) จะถูกเก็บไว้ในโครงสร้างที่เรียกว่า "Blackboard" เพื่อตัดการผูกติดระหว่างโหนด (Decoupling)',
      engineInternals: {
        unity: 'Unity มักใช้ Asset Store เช่น Behavior Designer, NodeCanvas หรือเขียน GraphView tool เองสำหรับ Behavior Trees',
        unreal: 'Unreal Engine มี Behavior Tree System และ Blackboard Editor ที่ทรงพลังที่สุดในวงการเกม พร้อมระบบ Perception Component (การมองเห็น, เสียง)',
        godot: 'Godot สามารถใช้งานผ่าน State Machine Node หรือคอมมูนิตี้ปลั๊กอิน Beehave สำหรับ Behavior Tree'
      },
      complexity: {
        time: 'FSM: O(1) State update | BT: O(D) โดย D คือความลึกของแผนภูมิต้นไม้ (เฉลี่ยเพียงไม่กี่สิบ iterations)',
        space: 'Memory footprint ต่ำมากทั้งคู่เมื่อใช้ Static Tree Definitions และ Instance Memory / Blackboard แยกกัน',
        explanation: 'Behavior Tree แลกประสิทธิภาพ CPU เพียงเล็กน้อยเพื่อการบำรุงรักษาโค้ดและการขยายสเกลที่เหนือกว่า FSM อย่างมหาศาล'
      },
      mathOrTheory: 'ความซับซ้อนของ Transition ใน FSM: จำนวนเส้นทางเปลี่ยนสถานะที่เป็นไปได้คือ $S(S - 1)$. เมื่อมี 10 สถานะ จะมีมากถึง 90 Transitions ที่ต้องดูแลรักษาและทดสอบบั๊ก!',
      pitfalls: [
        'BT Tick Rate ถี่เกินไป: การ Tick ต้นไม้ขนาดใหญ่ที่มีหลายร้อยโหนดทุกเฟรมอาจเปลือง CPU (ควรใช้ Event-driven Abort หรือปรับลด Tick Rate)',
        'ลืมจัดการสถานะ RUNNING: ไม่ได้ทำ Cleanup เมื่อ Task ถูกยกเลิกกะทันหัน (Abort) ทำให้ตัวละครแอนิเมชันค้าง',
        'Blackboard บวม: ใส่ข้อมูลทุกอย่างลงใน Blackboard จนกลายเป็น Global Variable ที่ควบคุมยาก'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ FSM ที่เต็มไปด้วย Switch-Case และ If-Else ซ้อนทับ (Spaghetti Code)',
      badCode: `// เมื่อระบบซับซ้อนขึ้น โค้ดจะพังเพราะเงื่อนไขพันกัน
void UpdateEnemyState() {
    switch (currentState) {
        case State.Patrol:
            if (CanSeePlayer()) {
                if (health < 20) currentState = State.Flee;
                else if (HasAmmo()) currentState = State.Chase;
                else currentState = State.Reload;
            }
            break;
        case State.Chase:
            if (!CanSeePlayer()) currentState = State.Search;
            else if (health < 20) currentState = State.Flee;
            else if (InAttackRange()) currentState = State.Attack;
            break;
        // ยิ่งมีสถานะเยอะ ยิ่งมีโอกาสเกิดบั๊กสถานะค้าง!
    }
}`,
      goodTitle: '✅ สถาปัตยกรรม Behavior Tree ที่ยืดหยุ่นและขยายได้ง่าย',
      goodCode: `// Behavior Tree ประกอบขึ้นจากโหนดที่ชัดเจนและนำกลับมาใช้ซ้ำได้
public class EnemyAI : MonoBehaviour {
    private Node rootNode;

    void Start() {
        // สร้างลำดับการตัดสินใจ:
        // ถ้าเลือดต่ำ -> หนี (Selector กิ่งแรก)
        // ถ้าเห็นศัตรู -> เข้าใกล้แล้วยิง (Sequence)
        // ถ้าไม่มีอะไร -> เดินลาดตระเวน (Fallback สุดท้าย)
        rootNode = new Selector(new List<Node> {
            new Sequence(new List<Node> {
                new IsLowHealthCondition(blackboard, 25f),
                new FleeAction(blackboard)
            }),
            new Sequence(new List<Node> {
                new CanSeeTargetCondition(blackboard),
                new ChaseTargetAction(blackboard),
                new AttackAction(blackboard)
            }),
            new PatrolAction(blackboard)
        });
    }

    void Update() => rootNode.Tick();
}`,
      explanation: 'Behavior Tree ช่วยให้ Game Designer สามารถลากต่อพฤติกรรมใหม่ๆ เช่น "ถ้าได้ยินเสียงระเบิดให้ตื่นตระหนก" ได้ทันทีโดยไม่ต้องแก้ตรรกะเดิม'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบความยากในการบำรุงรักษาและสเกลระบบ AI',
      metrics: [
        {
          metric: 'ความซับซ้อนในการเพิ่มสถานะใหม่ (Scalability)',
          unoptimized: 'FSM: ต้องแก้ Transition ทุกจุดเดิม เสี่ยงต่อการเกิดบั๊ก',
          optimized: 'BT: เสียบโหนดใหม่เข้าต้นไม้ได้ทันทีแบบ Plug & Play',
          improvement: 'ทำงานร่วมกันในทีมง่ายขึ้น 10 เท่า',
          explanation: 'Game Designers สามารถปรับแต่งพฤติกรรมได้โดยไม่ต้องแตะโค้ด C#'
        },
        {
          metric: 'ความสามารถในการ Re-use พฤติกรรม',
          unoptimized: 'FSM: ผูกติดกับคลาสศัตรูเดิม แยกออกมาใช้ซ้ำยาก',
          optimized: 'BT: โหนดอย่าง "Patrol" หรือ "Shoot" ใช้ซ้ำกับศัตรูทุกตัวได้ทันที',
          improvement: 'ประหยัดเวลาพัฒนาลงอย่างมาก',
          explanation: 'ลดการเขียนโค้ดซ้ำซ้อนในโปรเจกต์เกมขนาดใหญ่'
        },
        {
          metric: 'CPU Runtime Execution Overhead',
          unoptimized: 'FSM: เร็วกว่าเล็กน้อย (แทบจะ O(1))',
          optimized: 'BT: มี Overhead เพิ่มขึ้น 0.05ms ต่อตัว (แทบไม่มีผลกระทบ)',
          improvement: 'คุ้มค่ากับประโยชน์ด้านโครงสร้างอย่างยิ่ง',
          explanation: 'ในเกมระดับ AAA สถาปัตยกรรมที่แก้บั๊กง่ายมีความสำคัญกว่า 0.05ms'
        }
      ],
      verdict: 'ใช้ FSM สำหรับระบบเล็กๆ หรือ Animation Controller; ใช้ Behavior Trees สำหรับ AI ศัตรูที่มีมิติการตัดสินใจซับซ้อน'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['game-ai-fsm-bt'],
    challenges: TOPIC_CHALLENGES['game-ai-fsm-bt'],
  },
  {
    id: 'frustum-culling',
    title: 'Frustum & Occlusion Culling (การตัดสิ่งที่ไม่เห็นออกจากจอ)',
    titleEn: 'Frustum & Occlusion Culling vs. Drawing Everything',
    category: 'rendering',
    difficulty: 'Beginner',
    iconName: 'Eye',
    hasInteractiveLab: true,
    labType: 'frustum-culling',
    summary: 'ไม่วาดสิ่งที่ไม่เห็น: ตัดวัตถุนอกมุมมองกล้อง (Frustum) และวัตถุที่โดนกำแพงบัง (Occlusion) ออกก่อนส่งเข้า GPU Pipeline',
    
    simpleExplanation: {
      analogy: 'เหมือน "เปิดไฟฉายในห้องมืด" 🔦',
      keyConcept: 'สายตามนุษย์มองเห็นได้เฉพาะสิ่งที่อยู่ในกรวยสายตาข้างหน้า (FOV 60-90 องศา) เราไม่ต้องเสียเวลาจ้างจิตรกรมาวาดสิ่งของที่อยู่ข้างหลังศีรษะหรืออยู่หลังกำแพงตึกทึบ',
      whyItMatters: 'หากเกมสั่งเรนเดอร์ทุกอย่างในแมพพร้อมกัน แม้แต่วัตถุที่อยู่หลังหลังกล้องหรืออยู่นอกสายตา GPU Driver จะต้องส่งคำสั่ง Draw Call หลายพันคำสั่งต่อเฟรม จนการ์ดจอสำลักและเฟรมเรตร่วงเหลือ 15-20 FPS',
      visualAnalogyDesc: 'กรวยสายตากล้อง (6 Frustum Planes) + กำแพงบังสายตา (Occluder) -> ส่งเฉพาะวัตถุที่ผ่านการทดสอบเข้าสู่ GPU Pipeline',
      bulletPoints: [
        'Frustum Culling: เช็คว่าวัตถุอยู่ในพีระมิดสายตากล้อง 6 ระนาบหรือไม่',
        'Occlusion Culling: เช็คว่าวัตถุโดนโมเดลขนาดใหญ่ (เช่น ภูเขา, ตึก) บังมิดหรือไม่',
        'ทดสอบในระดับ Bounding Box (AABB) ไม่ต้องเช็คทีละรูปสามเหลี่ยม',
        'ประหยัด Draw Calls และ Vertex Shader ได้ 70-90%'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'การทดสอบ Intersection ระหว่าง 6 Frustum Planes (Near, Far, Left, Right, Top, Bottom) กับ Axis-Aligned Bounding Box (AABB) หรือ Bounding Sphere และการใช้งาน Hierarchical Z-Buffer (HZB)',
      lowLevelMechanics: 'Frustum Culling ทำงานบน CPU ในช่วงต้นของ Frame Render Pipeline โดยดึง Projection Matrix และ View Matrix มารวมกันเป็น 6 ระนาบ สำหรับแต่ละ Mesh จะนำ AABB มาหามุมที่พุ่งไปตาม Normal ของระนาบมากที่สุด (P-Vertex) หาก dot product ให้ผลเป็นลบ แสดงว่าวัตถุอยู่นอก Frustum ทั้งก้อน และจะไม่ถูกเพิ่มเข้าใน Render Queue ของเฟรมนั้น ส่วน Occlusion Culling ในฮาร์ดแวร์ยุคใหม่นิยมใช้ GPU-Driven Rendering โดยเรนเดอร์ Depth สเกลเล็ก (HZB Mipmap) แล้วรัน Compute Shader เพื่อ Culling ก่อนสั่งคำสั่ง Draw Call Indirect',
      engineInternals: {
        unity: 'Unity ทำ Frustum Culling อัตโนมัติทุก Camera และมี Umbra Occlusion Culling สำหรับฉาก Static (ต้องกด Bake Occlusion) หรือใช้ CullingGroup API สำหรับ Dynamic Logic',
        unreal: 'Unreal Engine 5 ทำ Frustum Culling, Distance Culling และใช้ GPU Hierarchical Z-Buffer (HZB) สำหรับ Occlusion Culling ควบคู่กับ Nanite Hardware Cluster Culling',
        godot: 'Godot 4 ใช้ Room and Portal System หรือ Grid-based Occlusion Culling และ Frustum Check ผ่าน RenderingServer'
      },
      complexity: {
        time: 'O(N) สำหรับ CPU Brute-force หรือ O(log N) เมื่อใช้ Bounding Volume Hierarchy (BVH) / Octree',
        space: 'O(1) ต่อวัตถุ (เก็บเพียง AABB Vector Min/Max หรือ Sphere Center/Radius)',
        explanation: 'การตัดวัตถุด้วย Frustum ประหยัดเวลากว่าการส่ง Geometry เข้า Vertex Pipeline นับร้อยเท่า'
      },
      mathOrTheory: 'ระนาบ Frustum แทนด้วยเวกเตอร์ Ax + By + Cz + D = 0. ระยะทาง d = N · P + D. ถ้า d < 0 สำหรับระนาบใดระนาบหนึ่ง แสดงว่าอยู่นอกระนาบนั้น',
      pitfalls: [
        'Shadow Casters หาย: ถ้า Culling วัตถุนอกจอแบบผิดวิธี วัตถุที่อยู่นอกจอแต่ทอดเงาเข้ามาในจอจะทำให้เงากระพริบหายไป ต้องขยาย Frustum สำหรับ Shadow Pass',
        'Bounding Box ขนาดเล็กเกินไป: ถ้า AABB คำนวณไม่ครอบคลุม Mesh หรือ Bone Animation ปลายดาบหรือชายเสื้อจะวูบหายเมื่อชิดขอบจอ',
        'Cost ของ Occlusion Bake: การอบ Occlusion ล่วงหน้าในฉากที่มีการทำลายสิ่งก่อสร้างแบบไดนามิกจะใช้ไม่ได้ผล'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ ปล่อยให้ทุกวัตถุรัน Update Loop และเรนเดอร์แม้จะอยู่นอกจอ',
      badCode: `void Update() {
    // โค้ดนี้รันทุกเฟรมกับศัตรูทั้ง 1,000 ตัวในฉาก แม้จะอยู่ข้างหลังผู้เล่น 500 เมตร!
    AnimateBones();
    UpdateAIPathfinding();
    UpdateParticleEffects();
}`,
      goodTitle: '✅ ใช้ Unity CullingGroup ปิดการคำนวณของสิ่งที่อยู่นอกจออัตโนมัติ',
      goodCode: `void OnCullingStateChanged(CullingGroupEvent evt) {
    if (evt.hasBecomeVisible) {
        animator.enabled = true;
        particleSystem.Play();
    } else if (evt.hasBecomeInvisible) {
        animator.enabled = false; // ปิดการคำนวณกระดูกเมื่อพ้นสายตา
        particleSystem.Pause();
    }
}`,
      explanation: 'การใช้ CullingGroup ช่วยตัดภาระของ CPU ในการคำนวณแอนิเมชันและเอฟเฟกต์ของวัตถุที่ผู้เล่นมองไม่เห็น'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการเรนเดอร์เมืองเปิด (Open World City 2,500 Objects)',
      metrics: [
        {
          metric: 'Draw Calls ส่งเข้า GPU',
          unoptimized: '2,500 คำสั่งวาด (Driver Choke)',
          optimized: '180 คำสั่งวาด (เฉพาะที่มองเห็น)',
          improvement: 'ลด Draw Calls ลง 92.8%',
          explanation: 'ตัดวัตถุที่อยู่หลังกล้องและหลังกำแพงออกจากการเรนเดอร์'
        },
        {
          metric: 'Frame Rate (FPS)',
          unoptimized: '18 - 22 FPS (หน่วงกระตุก)',
          optimized: '60 FPS (ลื่นไหล)',
          improvement: '+200% FPS Boost',
          explanation: 'GPU ไม่ต้องเสียเวลาตัดสามเหลี่ยม (Primitive Clipping)'
        },
        {
          metric: 'CPU Frame Time',
          unoptimized: '48.2 ms',
          optimized: '5.2 ms',
          improvement: 'เร็วขึ้นกว่า 9 เท่า',
          explanation: 'ลดเวลาเตรียม Render Queue และคำสั่ง DirectX/Vulkan'
        }
      ],
      verdict: 'Frustum Culling เป็นหัวใจสำคัญอันดับหนึ่งของการเรนเดอร์ 3D ทุกเอนจินเกม'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['frustum-culling'],
    challenges: TOPIC_CHALLENGES['frustum-culling'],
  },

  {
    id: 'multi-threading',
    title: 'Job System & Multi-Threading (การแบ่งงานข้ามแกนซีพียู)',
    titleEn: 'Job System & Worker Threads vs. Main Thread Choking',
    category: 'performance',
    difficulty: 'Intermediate',
    iconName: 'Cpu',
    hasInteractiveLab: true,
    labType: 'multi-threading',
    summary: 'กระจายงานหนัก (ฟิสิกส์อนุภาค, แอนิเมชัน, ระบบคำนวณ Pathfinding) ออกจาก Game Thread สู่ Worker Thread Pool ทุกคอร์',
    
    simpleExplanation: {
      analogy: 'เหมือน "การกระจายงานให้พนักงานทั้งแผนก" 🧑‍💼👨‍💼👩‍💼',
      keyConcept: 'แทนที่จะให้ผู้จัดการคนเดียว (Main Thread) เป็นคนตรวจเอกสารทั้ง 10,000 แผ่นจนหน้ามืด ให้แบ่งเอกสารออกเป็น 8 กอง แล้วส่งให้พนักงานอีก 7 คน (Worker Threads) ช่วยกันตรวจพร้อมกัน',
      whyItMatters: 'CPU ในมือถือและคอมพิวเตอร์ปัจจุบันมี 6-16 คอร์ แต่เกมส่วนใหญ่เขียนแบบดั้งเดิมทำให้รันแค่คอร์เดียว (Core 0 วิ่ง 100% จนเกมกระตุก ส่วนอีก 7 คอร์ว่างเปล่า) การใช้ Multi-Threading ปลดล็อกพลังที่แท้จริงของฮาร์ดแวร์',
      visualAnalogyDesc: 'Main Game Thread (ควบคุมลูป) -> Dispatch Jobs เข้าสู่ Job Queue -> Worker Threads บนคอร์ 1-7 รับไปคำนวณคู่ขนาน',
      bulletPoints: [
        'Main Thread รับผิดชอบเฉพาะ Game Loop และ Input',
        'งานคำนวณหนักๆ (ฟิสิกส์, อนุภาค, AI) แตกเป็น Job ย่อยๆ',
        'รันพร้อมกันบน CPU Cores ทั้งหมดแบบเต็มประสิทธิภาพ',
        'ไร้ปัญหา Race Condition ด้วย Data Immortality / Native Collections'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Task-Based Parallelism, Work-Stealing Job Scheduler, Lock-Free Ring Buffers และการประมวลผลเวกเตอร์ด้วย SIMD (Burst Compiler)',
      lowLevelMechanics: 'การสร้างเธรดแบบดั้งเดิม (OS Thread Creation) มีค่าใช้จ่าย Context Switching และ Memory Overhead สูง ในเอนจินเกมสมัยใหม่จึงใช้ Worker Thread Pool ที่ถูกสร้างไว้ล่วงหน้าตามจำนวน Logical Cores ของซีพียู งานจะถูกส่งเข้าคิวในรูปแบบ Job Struct ที่ประกอบด้วย Data Pointer และฟังก์ชันการทำงาน เมื่อเธรดใดว่างจะทำ Work-Stealing ไปดึง Job จากคิวอื่นมาประมวลผลทันที โดยไม่มีการใช้ Mutex Lock ที่ทำให้เธรดต้องหยุดรอ (Blocking Sleep)',
      engineInternals: {
        unity: 'Unity C# Job System ทำงานร่วมกับ Burst Compiler แปลง C# เป็น Native LLVM SIMD Code ปลอดภัยด้วย Safety System เช็ค Race Condition ในโหมด Editor',
        unreal: 'Unreal Engine ใช้ TaskGraph System และคำสั่ง ParallelFor ในการกระจายงานให้ Task Workers',
        godot: 'Godot ใช้ WorkerThreadPool ในการประมวลผลพื้นหลัง เช่น การสร้าง Mesh ไดนามิกและการคำนวณ NavMesh'
      },
      complexity: {
        time: 'O(N / K) โดย N คือขนาดงาน และ K คือจำนวน CPU Cores (Ideal Speedup ตาม Amdahl\'s Law)',
        space: 'O(K) สำหรับ Worker Thread Context และ Job Queue Buffer',
        explanation: 'ประสิทธิภาพขึ้นอยู่กับสัดส่วนงานที่สามารถทำแบบขนานได้ (Parallelizable Fraction)'
      },
      mathOrTheory: 'Amdahl\'s Law: Speedup = 1 / ((1 - P) + P/S) โดย P คือสัดส่วนของโค้ดที่รันแบบขนานได้ และ S คือจำนวนคอร์',
      pitfalls: [
        'Race Condition: เมื่อสองเธรดพยายามเขียนข้อมูลลงตำแหน่งเดียวกันในเวลาเดียวกัน ทำให้ค่าเสียหาย',
        'Over-synchronization: สั่ง JobHandle.Complete() เร็วเกินไปจน Main Thread ต้องยืนรอ กลายเป็นเหมือน Single-Thread',
        'Garbage Collection บน Worker: ห้ามสร้าง Managed Heap Allocations (new Class()) บน Worker Threads เด็ดขาด'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ คำนวณฟิสิกส์บน Main Thread เธรดเดียว (เกมกระตุกและคอร์อื่นว่าง)',
      badCode: `void Update() {
    // ลูปคำนวณ 10,000 ครั้งบน Game Thread ทำให้เฟรมเรตร่วงทันที
    for (int i = 0; i < boids.Length; i++) {
        boids[i].velocity += CalculateFlockingForce(boids[i]);
        boids[i].position += boids[i].velocity * Time.deltaTime;
    }
}`,
      goodTitle: '✅ กระจายงานผ่าน Unity IJobParallelFor และรันผ่าน Burst Compiler',
      goodCode: `[BurstCompile]
public struct FlockingJob : IJobParallelFor {
    public NativeArray<float3> positions;
    public NativeArray<float3> velocities;
    public float deltaTime;

    public void Execute(int index) {
        velocities[index] += ComputeForce(positions[index]);
        positions[index] += velocities[index] * deltaTime;
    }
}

// ใน Update: สั่ง Schedule ข้ามทุกคอร์
JobHandle handle = new FlockingJob { ... }.Schedule(boids.Length, 64);
handle.Complete();`,
      explanation: 'งานถูกแบ่งออกเป็น Batch ละ 64 ตัว และกระจายให้คอร์ซีพียูทุกแกนประมวลผลพร้อมกันด้วยรหัส SIMD'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบคำนวณฟิสิกส์อนุภาค 10,000 ชิ้น (8 CPU Cores)',
      metrics: [
        {
          metric: 'Compute Time ต่อเฟรม',
          unoptimized: '42.5 ms (ร่วงเหลือ 23 FPS)',
          optimized: '2.4 ms (นิ่งสนิทที่ 60 FPS)',
          improvement: 'เร็วขึ้นกว่า 17 เท่า',
          explanation: 'กระจายโหลดครบ 8 คอร์ และประมวลผลด้วยเวกเตอร์ SIMD'
        },
        {
          metric: 'CPU Utilization Balance',
          unoptimized: 'Core 0: 100%, Core 1-7: 0%',
          optimized: 'ทุกคอร์แบ่งเบาภาระที่ 25-30%',
          improvement: 'ใช้งานฮาร์ดแวร์เต็มประสิทธิภาพ',
          explanation: 'ไม่มีการ Choke บนเธรดเกมหลัก'
        },
        {
          metric: 'Input Responsiveness',
          unoptimized: 'หน่วงและเมาส์ขยับสะดุด',
          optimized: 'ตอบสนองทันที 0ms Stutter',
          improvement: 'เกมลื่นไหลสูงสุด',
          explanation: 'Main Thread มีเวลาเหลือเฟือสำหรับประมวลผลอินพุต'
        }
      ],
      verdict: 'เกมยุคใหม่ที่ต้องการ NPC หรือเอฟเฟกต์จำนวนมากจำเป็นต้องสร้างสถาปัตยกรรมแบบ Job-based เสมอ'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['multi-threading'],
    challenges: TOPIC_CHALLENGES['multi-threading'],
  },

  {
    id: 'shader-overdraw',
    title: 'Shader Overdraw & Early-Z (การลดภาระคำนวณพิกเซลซ้ำซ้อน)',
    titleEn: 'Shader Overdraw & Early-Z vs. Pixel Fill-Rate Nightmare',
    category: 'rendering',
    difficulty: 'Intermediate',
    iconName: 'Flame',
    hasInteractiveLab: true,
    labType: 'shader-overdraw',
    summary: 'แก้ปัญหา GPU ร้อนและเฟรมร่วงจากพิกเซลที่ถูกทาสีทับซ้ำๆ (Overdraw) ด้วย Front-to-Back Sorting, Early-Z Depth Test และการจัดระเบียบ Alpha UI',
    
    simpleExplanation: {
      analogy: 'เหมือน "การทาสีทับกำแพงเดิม 10 รอบ" 🎨🖌️',
      keyConcept: 'ถ้าคุณทาสีแดงลงบนกำแพง แล้วทาทับด้วยสีเขียว แล้วทาทับด้วยสีน้ำเงิน สุดท้ายคนดูก็เห็นแค่สีน้ำเงิน แต่คุณเสียทั้งค่าสีและเวลาไป 3 เท่า! ในเกม พิกเซลที่ถูกวาดทับซ้ำๆ เรียกว่า Overdraw',
      whyItMatters: 'ในเกมมือถือหรือฉากที่มีควันระเบิดโปร่งใส (Alpha Blending) ซ้อนกันหลายชั้น GPU ต้องรัน Fragment Shader หลายรอบต่อ 1 พิกเซลหน้าจอ จนเกิดอาการ GPU Fill-Rate ขาดแคลน เครื่องร้อนจัด แบตหมดไว และเฟรมเรตร่วง',
      visualAnalogyDesc: 'เรียง Mesh จากหน้าไปหลัง (Front-to-Back) -> Early-Z ตรวจสอบ Depth ก่อน -> ตัดพิกเซลที่โดนบังทิ้งโดยไม่ต้องรัน Shader',
      bulletPoints: [
        'Overdraw: พิกเซลหน้าจอเดียวถูกเรนเดอร์ซ้ำมากกว่า 1 ครั้ง',
        'Front-to-Back Sorting: วาดของใกล้ก่อน เพื่อให้ Depth Buffer สกัดของไกล',
        'Early-Z Rejection: ฮาร์ดแวร์ GPU เช็คความลึกก่อนคำนวณแสงและเงา',
        'UI & Particle Atlas: ตัดพื้นที่ว่างของรูปโปร่งแสงทิ้งด้วย Mesh แนบรูป'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'GPU Early Depth/Stencil Test (Early-Z), Depth Pre-Pass (Z-Prepass), Rasterizer Operations (ROP) และ Forward vs. Deferred Fill-rate Economics',
      lowLevelMechanics: 'ตามมาตรฐานดั้งเดิม (Late-Z) Fragment Shader จะถูกประมวลผลก่อน แล้วจึงนำค่า Depth ไปทดสอบกับ Z-Buffer เพื่อเขียนลง Color Buffer แต่หากเปิดใช้งาน Early-Z ฮาร์ดแวร์ GPU จะนำ Depth จาก Rasterizer มาทดสอบกับ Depth Buffer ก่อนทันที หากพิกเซลนั้นมีความลึกมากกว่าพิกเซลที่วาดไว้แล้ว GPU จะ Discard Fragment นั้นทิ้งทันทีโดยไม่เสียเวลาคำนวณ Shader ที่ซับซ้อน แต่ Early-Z จะล้มเหลว (Fallback เป็น Late-Z) ทันทีหาก Shader มีการใช้คำสั่ง clip(), discard หรือเขียนค่า depth ออกมาเอง',
      engineInternals: {
        unity: 'Unity มี Overdraw View Mode ใน Scene View สำหรับตรวจเช็คระดับความร้อนของพิกเซล และใน URP/HDRP สามารถเปิด Depth Priming Mode เพื่อบังคับ Early-Z',
        unreal: 'Unreal Engine 5 มีโหมด Shader Complexity / Quad Overdraw View Mode และทำ Pre-pass Depth อัตโนมัติใน Forward Shading',
        godot: 'Godot Engine จัดเรียง Opaque Objects แบบ Front-to-Back เป็นค่าเริ่มต้น และจัดเรียง Transparent Objects แบบ Back-to-Front'
      },
      complexity: {
        time: 'ลด Fragment Shader Invocations จาก O(K · Pixels) เหลือใกล้เคียง O(Pixels) โดย K คือจำนวนเลเยอร์ซ้อนทับ',
        space: 'ใช้หน่วยความจำ Depth Buffer 24-bit หรือ 32-bit (คงที่)',
        explanation: 'ประหยัดแบนด์วิดท์หน่วยความจำ VRAM และรอบการประมวลผลคอร์ของ GPU'
      },
      mathOrTheory: 'Pixel Fill Rate Budget = Screen Resolution × Target FPS × Allowed Overdraw Factor. ตัวอย่างเช่น 4K ที่ 60 FPS ต้องใช้ 8.3M × 60 = 500 Mpixels/s',
      pitfalls: [
        'ใช้คำสั่ง Discard / Clip ใน Shader: ทำให้ GPU ปิดระบบ Early-Z ทันทีและต้องใช้ Late-Z แทน',
        'ป้าย UI โปร่งแสงขนาดใหญ่ (Full-screen Transparent Quads): เกิด Overdraw ทับซ้อนทั้งหน้าจอโดยไม่รู้ตัว',
        'ควันอนุภาค Particle ที่ซ้อนกันเกินไป: ต้องใช้ Soft Particles หรือลดขนาด Particle Bounds'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ วาด UI และวัตถุโปร่งแสงซ้อนทับกันเต็มจอ (Overdraw สูงลิบ)',
      badCode: `// UI Image ที่ใช้สไปรท์โปร่งใสขนาดใหญ่ที่มีพื้นที่ว่าง 80%
// GPU ต้องคำนวณพิกเซลโปร่งใสนั้นซ้ำๆ ทั้งที่ไม่มีเนื้อภาพ!
Image invisibleRaycastPanel; 
invisibleRaycastPanel.color = new Color(0, 0, 0, 0); // ผิดมหันต์!`,
      goodTitle: '✅ ปิดการวาดพื้นที่ว่าง และเปิดใช้งาน Front-to-Back Opaque Rendering',
      goodCode: `// ใช้ CanvasRenderer.cullTransparentMesh หรือสร้าง Custom Mesh
// สำหรับ Invisible Button ให้ใช้ Custom Empty Graphic ที่ไม่มีการวาดพิกเซล
public class NonDrawingGraphic : Graphic {
    public override void SetMaterialDirty() {}
    public override void SetVerticesDirty() {}
    protected override void OnPopulateMesh(VertexHelper vh) {
        vh.Clear(); // ไม่ส่ง Vertices ใดๆ เข้า GPU เลย!
    }
}`,
      explanation: 'การลบพิกเซลว่างเปล่าออกจาก Render Pipeline ช่วยลด Overdraw ของ UI ลงจนเป็นศูนย์'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบฉากควันและ UI ซ้อนทับกัน (12 Layers Alpha)',
      metrics: [
        {
          metric: 'Fragment Shader Invocations',
          unoptimized: '14.2 ล้านครั้งต่อเฟรม',
          optimized: '1.4 ล้านครั้งต่อเฟรม',
          improvement: 'ลดภาระลง 90.1%',
          explanation: 'Early-Z สกัดพิกเซลที่อยู่ด้านหลังทิ้งก่อนรัน Shader'
        },
        {
          metric: 'GPU Clock & Power Draw',
          unoptimized: 'GPU วิ่ง 100% (ความร้อนพุ่งสูง)',
          optimized: 'GPU โหลด 32% (เครื่องเย็นสบาย)',
          improvement: 'ประหยัดแบตเตอรี่มือถือ 3 เท่า',
          explanation: 'ลด Pixel Memory Bandwidth ที่ไหลผ่าน ROP'
        },
        {
          metric: 'Frame Rate',
          unoptimized: '22 FPS (หน่วงเมื่อเกิดควันระเบิด)',
          optimized: '60 FPS นิ่งสนิท',
          improvement: '+172% ความเสถียร',
          explanation: 'ขจัดปัญหา Frame Drop ขณะเกิดฉากชุลมุน'
        }
      ],
      verdict: 'การคุม Overdraw ใน UI และเอฟเฟกต์ควันมีความสำคัญอย่างยิ่งต่อความลื่นไหลของเกมมือถือ'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['shader-overdraw'],
    challenges: TOPIC_CHALLENGES['shader-overdraw'],
  },

  {
    id: 'netcode-prediction',
    title: 'Client-Side Prediction & Reconciliation (แก้ปัญหาความหน่วงของเน็ตเวิร์ก)',
    titleEn: 'Client-Side Prediction & Reconciliation vs. High Input Latency',
    category: 'networking',
    difficulty: 'Intermediate',
    iconName: 'Wifi',
    hasInteractiveLab: true,
    labType: 'netcode-prediction',
    summary: 'ขยับตัวละครบนเครื่องผู้เล่นทันทีโดยไม่ต้องรอเซิร์ฟเวอร์ตอบกลับ (0ms Perceived Lag) พร้อมระบบ Rollback & Reconciliation เมื่อข้อมูลคลาดเคลื่อน',
    
    simpleExplanation: {
      analogy: 'เหมือน "การก้าวเท้าเดินทันทีโดยไม่ต้องรอจดหมายตอบกลับ" 🏃‍♂️✉️',
      keyConcept: 'ถ้าคุณกดปุ่มเดิน แล้วต้องรอส่งข้อมูลไปเซิร์ฟเวอร์ต่างประเทศแล้วรอตอบกลับมา (Ping 200ms) คุณจะรู้สึกว่าตัวละครหน่วงมากเหมือนขยับในโคลน! วิธีแก้คือ ให้เครื่องเราเดินไปข้างหน้าทันที แล้วเซิร์ฟเวอร์ค่อยตรวจสอบความถูกต้องทีหลัง',
      whyItMatters: 'ในเกมออนไลน์ยิงปืน (Valorant, CS2) หรือต่อสู้ หากไม่มีระบบ Prediction ผู้เล่นจะรู้สึกถึง Input Delay ตลอดเวลา การทำ Prediction ทำให้ผู้เล่นรู้สึกว่าเกมตอบสนองทันทีเสมือนเล่นแบบ Offline',
      visualAnalogyDesc: 'ผู้เล่นกดปุ่ม -> Local Client ทำนายตำแหน่งทันที -> ส่ง Input Sequence ไป Server -> Server ตอบ Snapshot กลับมา -> Reconcile หากคลาดเคลื่อน',
      bulletPoints: [
        'Client-Side Prediction: ขยับและแสดงผลทันทีบนเครื่องตัวเอง',
        'Authoritative Server: เซิร์ฟเวอร์ยังคงเป็นผู้ตัดสินความจริงหนึ่งเดียว',
        'Input History Buffer: บันทึกประวัติคำสั่งของผู้เล่นไว้ตรวจสอบ',
        'Server Reconciliation: ปรับจูนตำแหน่งและย้อนจำลองคำสั่งใหม่หากข้อมูลไม่ตรง'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Deterministic Physics Simulation, Input Sequence Acknowledgment, State Snapshot Interpolation, Dead Reckoning และ Lag Compensation (Rewind Hitbox)',
      lowLevelMechanics: 'เครื่อง Client จะเก็บอินพุตของผู้เล่นลงใน Circular Buffer พร้อมแนบ Sequence ID (เช่น Tick 1042) และเคลื่อนย้ายตัวละครในเครื่องตัวเองทันทีโดยใช้สมการฟิสิกส์ที่กำหนดแน่นอน (Deterministic Physics) ในขณะเดียวกันจะส่ง Packet ไปยัง Server เมื่อ Server ได้รับและจำลองการเคลื่อนที่เสร็จ จะส่ง Snapshot กลับมาพร้อมระบุ Sequence ID ล่าสุดที่ประมวลผลแล้ว (Ack ID) เมื่อเครื่อง Client ได้รับ Snapshot มันจะตรวจสอบว่าตำแหน่งในอดีตตรงกับที่ Server บันทึกหรือไม่ หากไม่ตรง (เกิด Misprediction จากการชนหรือ Packet Loss) Client จะนำตำแหน่งของ Server มาตั้งต้นใหม่ และทำ Replay คำสั่งที่ค้างอยู่ใน Buffer ซ้ำทั้งหมดภายใน 1 เฟรม',
      engineInternals: {
        unity: 'Unity Netcode for GameObjects (NGO) และ Netcode for Entities (DOTS) มีระบบ Client-Side Prediction และ NetworkTransform ในตัว',
        unreal: 'Unreal Engine CharacterMovementComponent มีระบบ Client Prediction, Saved Moves (FSavedMove_Character) และ Server Reconciliation ที่สมบูรณ์แบบในตัว',
        godot: 'Godot 4 ใช้ MultiplayerSynchronizer ร่วมกับ Custom Input History Buffer สำหรับระบบทำนาย'
      },
      complexity: {
        time: 'O(M) ในเฟรมที่เกิด Replay โดย M คือจำนวนอินพุตที่ค้างอยู่ใน Buffer (ปกติไม่เกิน 5-15 ทิก)',
        space: 'O(B) สำหรับ Input History Buffer (บันทึกข้อมูลเพียงไม่กี่กิโลไบต์)',
        explanation: 'ค่าใช้จ่ายของ CPU เพิ่มขึ้นเล็กน้อยเฉพาะเมื่อเกิดการ Reconcile แลกกับประสบการณ์ไร้ดีเลย์'
      },
      mathOrTheory: 'Round Trip Time (RTT) = 2 × Latency. หาก RTT = 200ms และ Tick Rate = 60Hz จะมีอินพุตค้างรอ Reconcile ประมาณ 12 เฟรม',
      pitfalls: [
        'Physics Non-determinism: ฟิสิกส์ระหว่าง Client กับ Server คำนวณไม่ตรงกัน ทำให้ตัวละครกระตุกดึงกลับ (Rubberbanding) ตลอดเวลา',
        'Flooding Network Packets: ส่งอินพุตถี่เกินไปจนแบนด์วิดท์เต็ม ต้องรวมกลุ่มอินพุต (Packet Batching)',
        'Rubberbanding เมื่อโดนบล็อก: เมื่อชนกำแพงที่ Client ยังไม่เห็น Server จะดีดตัวละครกลับอย่างรุนแรง'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ รอคำตอบจากเซิร์ฟเวอร์ก่อนขยับตัวละคร (Input Lag หนักหน่วง)',
      badCode: `void Update() {
    if (Input.GetKeyDown(KeyCode.W)) {
        // ส่งคำขอไป Server และไม่ขยับอะไรเลยบนหน้าจอจนกว่า Server จะสั่งกลับมา!
        SendMoveRequestToServer(Vector3.forward);
        // ผู้เล่นต้องรอนาน 200ms ตัวละครถึงจะก้าวขาเดินก้าวแรก!
    }
}`,
      goodTitle: '✅ ทำนายการเคลื่อนที่บนเครื่องทันที และเก็บประวัติรอตรวจสอบ',
      goodCode: `void Update() {
    Vector3 input = GetMovementInput();
    if (input != Vector3.zero) {
        // 1. ทำนายทันทีบนเครื่องผู้เล่น (0ms Delay)
        transform.position += input * speed * Time.deltaTime;
        
        // 2. บันทึกอินพุตและส่งไปเซิร์ฟเวอร์
        pendingInputs.Add(new SavedMove { tick = currentTick, delta = input });
        SendInputToServerRpc(input, currentTick++);
    }
}`,
      explanation: 'ผู้เล่นรู้สึกว่าการควบคุมตอบสนองทันใจ ไร้ความหน่วง แม้จะเล่นข้ามทวีปด้วยค่า Ping สูง'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบประสบการณ์ผู้เล่นที่ค่า Ping 180ms (RTT 360ms)',
      metrics: [
        {
          metric: 'Perceived Input Latency',
          unoptimized: '180 - 360 ms (หน่วงจนควบคุมไม่ได้)',
          optimized: '0 ms (ตอบสนองฉับไวเสมือนออฟไลน์)',
          improvement: 'กำจัดความรู้สึกหน่วง 100%',
          explanation: 'แสดงผลการเดินทันทีที่กดปุ่ม'
        },
        {
          metric: 'ความแม่นยำของตำแหน่งเซิร์ฟเวอร์',
          unoptimized: 'แม่นยำ 100% (แต่เล่นไม่สนุก)',
          optimized: 'แม่นยำ 100% (ผ่านการ Reconcile)',
          improvement: 'ปลอดภัยจากการโกงตำแหน่ง',
          explanation: 'เซิร์ฟเวอร์ยังคงเป็น Authoritative ตัดสินตำแหน่งจริง'
        },
        {
          metric: 'อาการกระตุกดีดกลับ (Rubberbanding)',
          unoptimized: 'ไม่มี (เพราะรอคำสั่งตลอด)',
          optimized: 'น้อยมาก (< 0.5% เมื่อแพ็กเก็ตหลุด)',
          improvement: 'เนียนตาและเป็นธรรมชาติ',
          explanation: 'ชดเชยการคำนวณคลาดเคลื่อนแบบนุ่มนวล'
        }
      ],
      verdict: 'เกม Multiplayer แนว Action, FPS, Fighting หรือ Racing ขาดระบบ Client Prediction ไม่ได้เป็นอันขาด'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['netcode-prediction'],
    challenges: TOPIC_CHALLENGES['netcode-prediction'],
  },

  {
    id: 'texture-streaming',
    title: 'Texture Streaming & Mipmapping (การจัดการหน่วยความจำ VRAM)',
    titleEn: 'Texture Streaming & Mipmapping vs. VRAM Allocation Spikes',
    category: 'rendering',
    difficulty: 'Beginner',
    iconName: 'Layers',
    hasInteractiveLab: true,
    labType: 'texture-streaming',
    summary: 'ป้องกันเกมแครชและภาพระยิบระยับด้วยการย่อขนาด Texture (Mipmaps) และโหลดเฉพาะชั้นความละเอียดที่กล้องต้องการเข้าสู่ VRAM',
    
    simpleExplanation: {
      analogy: 'เหมือน "รูปโปรไฟล์ขนาดเล็ก vs รูปโปสเตอร์ 4K" 🖼️',
      keyConcept: 'ถ้าคุณมองป้ายโฆษณาที่อยู่ห่างออกไป 500 เมตร คุณไม่จำเป็นต้องถือแว่นขยายส่องดูรายละเอียดระดับ 4K! การใช้รูปย่อขนาด (Mipmap) เล็กๆ พอดีกับสายตา ช่วยประหยัดทั้งแรมและการ์ดจอ',
      whyItMatters: 'หากทุกพื้นผิวในเกมใช้รูปภาพขนาด 4K เต็มความละเอียดตลอดเวลา VRAM ของการ์ดจอจะเต็มอย่างรวดเร็วจนเกมแครช ยิ่งไปกว่านั้น วัตถุที่อยู่ไกลจะเกิดภาพระยิบระยับแตกตา (Texture Shimmering Aliasing) เพราะพิกเซลหน้าจอเล็กกว่าจุดสีในรูป',
      visualAnalogyDesc: 'Texture ต้นฉบับ 4K -> ย่อเป็น Mip 1 (2K), Mip 2 (1K), Mip 3 (512px) -> กล้องอยู่ไกลใช้ Mip เล็ก กล้องซูมใกล้สตรีม Mip 4K เข้า VRAM',
      bulletPoints: [
        'Mipmapping: สร้างชุดรูปย่อยขนาด 50%, 25%, 12.5% รอไว้ล่วงหน้า',
        'Texture Streaming: โหลดเฉพาะชั้น Mip ที่กำลังมองเห็นเข้าสู่ VRAM',
        'ประหยัดพื้นที่ VRAM ของการ์ดจอได้ 70-90%',
        'ขจัดภาพสั่นไหวและเส้นคลื่น (Moiré Aliasing) ในระยะไกล'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Texel-to-Pixel Ratio, Screen-Space UV Derivatives, Hardware Trilinear / Anisotropic Filtering, Texture Memory Pool และ Virtual Texturing',
      lowLevelMechanics: 'GPU คำนวณอัตราส่วนการเปลี่ยนแปลงของพิกัด Texture Coordinate เทียบกับพิกเซลหน้าจอโดยใช้อนุพันธ์ย่อย (ddx, ddy) ใน Fragment Shader หากค่าความเปลี่ยนแปลงสูง (วัตถุอยู่ไกลหรือมองในมุมเฉียง) ฮาร์ดแวร์ Texture Sampler จะเลือกอ่านข้อมูลจากชั้น Mipmap ที่ย่อขนาดลงมาแทน Mipmap จะเพิ่มขนาดไฟล์บนดิสก์เพียง 33% (อนุกรมเรขาคณิต 1/4 + 1/16 + 1/64...) แต่ช่วยให้การเข้าถึงหน่วยความจำอยู่ใน Cache Line (L1/L2 Texture Cache) ลด Texture Thrashing ลงอย่างมาก ระบบ Texture Streaming จะคำนวณระยะทางจากกล้องแล้วส่งสัญญาณไปยัง I/O Thread เพื่อโหลดเฉพาะ Mip Level ที่ต้องการเข้าสู่ VRAM ตามงบประมาณ (Budget)',
      engineInternals: {
        unity: 'Unity มีระบบ Streaming Mipmaps ใน QualitySettings กำหนด Memory Budget ได้ และรองรับ Virtual Texturing ใน HDRP',
        unreal: 'Unreal Engine มี Texture Streaming Pool (r.Streaming.PoolSize) และ Nanite Virtual Texturing ที่สตรีมระดับ Mip อัตโนมัติ',
        godot: 'Godot 4 รองรับการสร้าง Mipmap อัตโนมัติใน Texture Import Settings และใช้ VRAM Compression (Basis Universal / BC7)'
      },
      complexity: {
        time: 'O(1) ในการสุ่มตัวอย่างสีจาก Mipmap ในฮาร์ดแวร์ Texture Unit',
        space: 'เพิ่มขนาดไฟล์บนดิสก์ +33% แลกกับการลดการใช้ VRAM ขณะรันได้มากถึง 80%',
        explanation: 'แลกพื้นที่ดิสก์เล็กน้อยกับการเข้าถึงหน่วยความจำที่เร็วขึ้นและการประหยัด VRAM มหาศาล'
      },
      mathOrTheory: 'Mip Level = log2(max(du/dx, dv/dy) × TextureSize). กรองแบบ Trilinear จะเฉลี่ยสีระหว่าง 2 ชั้น Mip ที่ใกล้เคียงที่สุด',
      pitfalls: [
        'ลืมเปิด Generate Mipmaps บน 3D Texture: ทำให้ภาพระยะไกลระยิบระยับแตกตาและกิน Cache',
        'เปิด Mipmap บน 2D Pixel Art หรือ UI: ทำให้ภาพไอคอนและฟอนต์เบลอไม่คมชัด (UI ต้องปิด Mipmaps เสมอ)',
        'ตั้งค่า Streaming Budget ต่ำเกินไป: พื้นผิวจะเบลอนานผิดปกติก่อนจะค่อยๆ คมชัดขึ้น (Texture Pop-in)'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ ปิด Mipmaps และโหลด Texture 4K ทุกแผ่นเข้า VRAM ตรงๆ',
      badCode: `// โหลด Texture คุณภาพสูงสุดเข้า RAM ทันทีโดยไม่จำกัด Pool
Texture2D tex = Resources.Load<Texture2D>("Huge4KTexture");
// ผลลัพธ์: กิน VRAM 64MB ต่อแผ่น หากมี 100 แผ่น แรมการ์ดจอเต็ม 6GB ทันที!`,
      goodTitle: '✅ เปิดใช้งาน Streaming Mipmaps และจำกัดขนาด VRAM Budget',
      goodCode: `void ConfigureTextureStreaming() {
    // 1. เปิดระบบ Streaming Mipmaps
    QualitySettings.streamingMipmapsActive = true;
    
    // 2. กำหนดเพดานงบประมาณ VRAM ไม่ให้เกิน 512 MB
    QualitySettings.streamingMipmapsMemoryBudget = 512.0f;
    
    // 3. กำหนดการตัดทอนระดับ Mip สูงสุดเมื่อ VRAM เริ่มแน่น
    QualitySettings.streamingMipmapsMaxLevelReduction = 3;
}`,
      explanation: 'เอนจินจะสตรีมเฉพาะระดับความละเอียดที่สายตามองเห็น ทำให้เล่นเกมได้อย่างราบรื่นโดย VRAM ไม่ล้น'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการโหลดฉากป่าไม้ (Forest Environment 500 Textures)',
      metrics: [
        {
          metric: 'VRAM Usage',
          unoptimized: '4,200 MB (เสี่ยงต่อเกมแครช)',
          optimized: '480 MB (เบาสบาย)',
          improvement: 'ประหยัดแรมการ์ดจอลง 88.5%',
          explanation: 'สตรีมเฉพาะ Mip Level ที่อยู่ในระยะสายตา'
        },
        {
          metric: 'GPU Texture Cache Miss Rate',
          unoptimized: '48.5% (Cache Thrashing)',
          optimized: '2.1% (L1/L2 Cache Hits แน่นอน)',
          improvement: 'ดึงข้อมูลไวกว่า 20 เท่า',
          explanation: 'ข้อมูล Texels เรียงชิดกันพอดีกับ Pixel บนหน้าจอ'
        },
        {
          metric: 'Texture Aliasing (ภาพสั่นไหว)',
          unoptimized: 'ระยิบระยับแตกตาที่เส้นขอบฟ้า',
          optimized: 'เนียนตา นุ่มนวล ไร้รอยคลื่น',
          improvement: 'คุณภาพของภาพสูงขึ้นชัดเจน',
          explanation: 'Trilinear & Anisotropic Filtering ทำงานเต็มประสิทธิภาพ'
        }
      ],
      verdict: 'Texture Mipmapping และ Streaming เป็นข้อบังคับสำหรับโมเดล 3D ทุกชิ้นในเกมระดับโปรดักชัน'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['texture-streaming'],
    challenges: TOPIC_CHALLENGES['texture-streaming'],
  },

  {
    id: 'audio-concurrency',
    title: 'Audio Concurrency & Voice Management (การบริหารระบบเสียง)',
    titleEn: 'Audio Concurrency & Voice Stealing vs. DSP Clipping',
    category: 'audio',
    difficulty: 'Beginner',
    iconName: 'Volume2',
    hasInteractiveLab: true,
    labType: 'audio-concurrency',
    summary: 'ป้องกันเสียงแตกพร่า (Clipping) และ CPU แฮงก์เมื่อเกิดเสียงระเบิด 50 ลูกพร้อมกัน ด้วยการจำกัดโควตาเสียงและตัดเสียงที่เบาที่สุดทิ้ง (Voice Stealing)',
    
    simpleExplanation: {
      analogy: 'เหมือน "คน 100 คนตะโกนพร้อมกันในห้องแคบๆ" 📢🗣️',
      keyConcept: 'ถ้าทุกคนในห้องตะโกนพร้อมกัน ผลลัพธ์คือไม่มีใครฟังใครรู้เรื่อง มีแต่เสียงอึกทึกหนวกหูและลำโพงจะพัง! ผู้คุมเวทีต้องอนุญาตให้เฉพาะคนที่สำคัญที่สุด 4-5 คนพูดพร้อมกันได้เท่านั้น',
      whyItMatters: 'ในฉากยิงปืนกลหรือทิ้งระเบิดปูพรม หากมีเสียงระเบิดเกิดขึ้นพร้อมกัน 60 ครั้ง เอนจินจะพยายามผสมคลื่นเสียงทั้งหมดจนเกิดเสียงแตกซ่า (Audio Clipping Distortion) และแย่งเวลา CPU หลักจนเกมกระตุก',
      visualAnalogyDesc: 'มีคำขอเล่นเสียง 50 เสียง -> Audio Concurrency ตรวจสอบโควตา (จำกัด 6 เสียง) -> ตัดเสียงที่เบาที่สุดทิ้ง (Voice Stealing) -> เล่นเสียงที่สำคัญคมชัด',
      bulletPoints: [
        'Max Voice Concurrency: จำกัดจำนวนเสียงพร้อมกันในแต่ละประเภท',
        'Voice Stealing: ตัดเสียงเก่าหรือเสียงเบาที่สุดทิ้งเมื่อช่องเสียงเต็ม',
        'Priority Channels: เสียงพากย์และเสียงผู้เล่นมีความสำคัญสูงสุด ห้ามถูกตัด',
        'ป้องกัน Audio Buffer Underrun และรักษาความคมชัดของมิกซ์'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Digital Signal Processing (DSP) Mixing Thread, Audio Hardware Channels, Dynamic Voice Stealing Policies (Oldest, Quietest, Lowest Priority), และ Decibel Summation Dynamics',
      lowLevelMechanics: 'ซอฟต์แวร์ผสมเสียงในเกม (เช่น FMOD, Wwise, หรือ Unity Audio Mixer) จะรันแยกบน Audio Processing Thread โดยมีบัฟเฟอร์ขนาดคงที่ (เช่น 512 หรือ 1024 samples) ในแต่ละรอบ DSP Cycle ทุก Audio Voice ที่กำลังเล่นอยู่จะต้องถูกดึงข้อมูลเสียง นำมาคูณ Gain ตาม 3D Spatial Distance นำมาผ่าน Filter และนำมารวมกัน (Sample Summation) การรวมคลื่นเสียงจำนวนมากจะทำให้ Amplitude เกินขีดจำกัด 0 dBFS เกิดเป็น Digital Clipping (คลื่นเสียงถูกตัดยอดกลายเป็น Square Wave ซึ่งให้เสียงแตกที่แสบหู) การใช้ Audio Concurrency จะจำกัดจำนวน Active Voices และหากเกินโควตา จะใช้คำสั่ง Fade Out 5-10ms อย่างรวดเร็ว เพื่อขโมยช่องเสียง (Voice Stealing) โดยไม่ให้เกิดเสียงกึก (Pop/Click Artifact)',
      engineInternals: {
        unity: 'Unity AudioSource มีตัวเลือก Priority (0-256) และตั้งค่า Max Real Voices ได้ใน Project Settings > Audio',
        unreal: 'Unreal Engine มี Sound Concurrency Asset (USoundConcurrency) กำหนด Max Count และ Resolution Rule (Stop Oldest, Stop Quietest, Stop Lowest Priority)',
        godot: 'Godot 4 ใช้ AudioServer Polyphony Bus ควบคุมจำนวนโพลีโฟนีใน AudioStreamPlayer'
      },
      complexity: {
        time: 'O(V) โดย V คือจำนวน Concurrency Voices ที่จำกัดไว้ (คงที่ ไม่แปรผันตามจำนวนศัตรู)',
        space: 'O(V) สำหรับช่องเสียงใน Audio Mixer Buffer',
        explanation: 'คุมภาระของ DSP Thread ให้อยู่ในงบเวลาคงที่เสมอ ป้องกัน Audio Dropout'
      },
      mathOrTheory: 'Decibel Rule: เสียงที่มีระดับความดังเท่ากันสองเสียงรวมกัน จะเพิ่มความดังขึ้น +3 dB. เสียง 64 เสียงรวมกันจะเพิ่มขึ้น +18 dB ซึ่งล้นขอบเขตไดนามิกแน่นอน',
      pitfalls: [
        'ใช้ AudioSource.PlayClipAtPoint บ่อยเกินไป: จะสร้าง GameObject เปล่าขึ้นมาและไม่จำกัด Concurrency ทำให้เกิด Garbage Collection',
        'ตัดเสียงกะทันหันโดยไม่ Fade: จะเกิดเสียงดีดกึก (Click/Pop Artifact) ในลำโพง ต้อง Fade Out สั้นๆ เสมอ',
        'ไม่ตั้ง Priority: เสียงฝีเท้าของศัตรูที่อยู่ไกลอาจจะไปแย่งช่องเสียงของเสียงพากย์เควสต์หลัก'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ สร้างและเล่นเสียงทุกครั้งโดยไม่จำกัดโควตา (เสียงแตกและกระตุก)',
      badCode: `void OnBulletHit(Vector3 hitPoint) {
    // ผิดมหันต์! ยิงรัว 50 นัดพร้อมกัน = เกิด 50 AudioSources ซ้อนทับกัน
    // เสียงแตกพร่า ลำโพงลำลัก และกินแรม Heap
    AudioSource.PlayClipAtPoint(explosionClip, hitPoint);
}`,
      goodTitle: '✅ ใช้ Sound Concurrency Manager จำกัดจำนวนเสียงและแย่งช่องเสียงที่เบาสุด',
      goodCode: `public class SoundConcurrencyManager : MonoBehaviour {
    [SerializeField] private int maxExplosionVoices = 4;
    private List<AudioSource> activeExplosions = new List<AudioSource>();

    public void PlayExplosion(AudioClip clip, float volume) {
        if (activeExplosions.Count >= maxExplosionVoices) {
            // Voice Stealing: ตัดเสียงที่เล่นก่อนหน้าทิ้งอย่างนุ่มนวล
            AudioSource oldest = activeExplosions[0];
            oldest.Stop();
            activeExplosions.RemoveAt(0);
        }
        
        AudioSource source = GetPooledSource();
        source.PlayOneShot(clip, volume);
        activeExplosions.Add(source);
    }
}`,
      explanation: 'เสียงระเบิดถูกคุมไม่ให้เกิน 4 เสียงพร้อมกัน มิกซ์เสียงยังคงชัดเจน หนักแน่น และไม่กินซีพียู'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการระเบิด Cluster 40 ลูกพร้อมกันในฉากสงคราม',
      metrics: [
        {
          metric: 'Audio Thread CPU Load',
          unoptimized: '48.2% (Audio Buffer Underrun กระตุก)',
          optimized: '4.5% (เบาสบาย ไร้สะดุด)',
          improvement: 'ลดการใช้ CPU เสียงลง 90%',
          explanation: 'ผสมเสียงเฉพาะช่องที่จำเป็นตามขีดจำกัด Concurrency'
        },
        {
          metric: 'คุณภาพเสียง (Audio Fidelity)',
          unoptimized: 'แตกซ่า พร่ามัว (Severe Clipping)',
          optimized: 'คมชัด แน่น หนัก มีมิติ',
          improvement: 'คุณภาพเสียงระดับเกมคอนโซล',
          explanation: 'ไม่เกิดการล้นของสัญญาณใน Digital Summation'
        },
        {
          metric: 'จำนวน Audio Sources บนหน่วยความจำ',
          unoptimized: '40 ตัว (และสร้างใหม่เรื่อยๆ)',
          optimized: '6 ตัวคงที่ใน Memory Pool',
          improvement: 'ไร้ปัญหา Memory Leaks',
          explanation: 'หมุนเวียนช่องเสียงที่มีอยู่กลับมาใช้ซ้ำ'
        }
      ],
      verdict: 'Sound Concurrency เป็นความรู้พื้นฐานที่เกมระดับจริงจังต้องมี เพื่อให้เสียงฟังดูเป็นมืออาชีพ'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['audio-concurrency'],
    challenges: TOPIC_CHALLENGES['audio-concurrency'],
  },

  {
    id: 'async-loading',
    title: 'Async Asset Loading & Addressables (การโหลดไฟล์โดยไม่แช่แข็งหน้าจอ)',
    titleEn: 'Async Addressables vs. Synchronous Blocking Load Freeze',
    category: 'architecture',
    difficulty: 'Beginner',
    iconName: 'DownloadCloud',
    hasInteractiveLab: true,
    labType: 'async-loading',
    summary: 'ขจัดอาการเกมหยุดชะงัก (Hard Freeze Hitch) ขณะข้ามแมพหรือโหลดบอส ด้วยการสตรีมไฟล์ผ่าน Background I/O Thread แทนการใช้ Resources.Load',
    
    simpleExplanation: {
      analogy: 'เหมือน "การสั่งซื้อของออนไลน์รอส่งถึงบ้าน vs การต้องขับรถไปซื้อเองแล้วร้านปิด" 📦🚚',
      keyConcept: 'ถ้าคุณกำลังทำกับข้าวแล้วขาดน้ำปลา หากคุณทิ้งเตาแล้ววิ่งไปซื้อเอง กับข้าวบนเตาจะไหม้หมด (เกมค้าง)! วิธีที่ถูกต้องคือ ให้คนส่งของเอามาส่งให้ที่ประตูในพื้นหลัง โดยที่คุณยังทำกับข้าวต่อไปได้ไม่สะดุด',
      whyItMatters: 'คำสั่งโหลดไฟล์แบบดั้งเดิมอย่าง Resources.Load() เป็นคำสั่งแบบ Synchronous ซึ่งจะสั่งให้เกมหยุดนิ่ง (Hard Freeze) 300ms - 1000ms เพื่อรอฮาร์ดดิสก์อ่านไฟล์ ทำให้ผู้เล่นรู้สึกว่าเกมพังหรือค้าง',
      visualAnalogyDesc: 'Game Thread ทำงานต่อที่ 60 FPS -> ส่งคำสั่งโหลดเข้า Background I/O Thread -> เมื่ออ่านไฟล์เสร็จ Callback แจ้งเตือน -> นำ Asset เข้าสู่ฉากอย่างราบรื่น',
      bulletPoints: [
        'ห้ามใช้ Resources.Load ในระหว่างที่ผู้เล่นกำลังเล่นเกมอยู่เด็ดขาด',
        'ใช้ Addressables (Unity) หรือ StreamableManager (Unreal)',
        'โหลดไฟล์ใน Background Thread โดยเฟรมเรตยังคงอยู่ที่ 60 FPS',
        'ใช้ Soft Object References เพื่อไม่ให้เมโมรีบวมตั้งแต่เริ่มเกม'
      ]
    },

    deepExplanation: {
      architecturalDetail: 'Asynchronous I/O (AIO), Background Thread File Decompression, Addressables AssetBundle Serialization, Soft Object Pointers (TSoftObjectPtr), และ Reference Counting Life-Cycle',
      lowLevelMechanics: 'เมื่อเรียกคำสั่งโหลดแบบ Synchronous เธรดหลัก (Game Thread) จะส่ง Syscall ไปยังระบบปฏิบัติการและเข้าสู่สถานะ Blocked I/O Wait ซีพียูจะไม่สามารถประมวลผลอินพุตหรือส่งคำสั่งเรนเดอร์เฟรมถัดไปได้จนกว่าข้อมูลทั้งหมดจะถูกอ่านและ Decompress ลงแรม ในทางตรงกันข้าม ระบบ Asynchronous Loading จะส่งคำขอเข้าคิวของ Background I/O Thread ซึ่งจะอ่านไฟล์และ Unpack ข้อมูลแบบ Non-blocking เมื่อข้อมูลพร้อมในหน่วยความจำ จะส่งสัญญาณ (Callback / Task Completion) กลับมายัง Main Thread เพื่อทำการ Instantiate เข้าสู่ฉากในจังหวะที่เหมาะสม และเมื่อเลิกใช้งาน ระบบ Reference Counting จะปลดปล่อยหน่วยความจำทันทีเพื่อป้องกัน Memory Leaks',
      engineInternals: {
        unity: 'Unity ยกเลิกการสนับสนุน Resources โฟลเดอร์ในโปรเจกต์ขนาดใหญ่ และแนะนำให้ใช้ Addressable Asset System (LoadAssetAsync) แทน',
        unreal: 'Unreal Engine ใช้ FStreamableManager ร่วมกับ TSoftObjectPtr / FSoftObjectPath ในการสตรีมโมเดลและแอนิเมชันแบบ Asynchronous',
        godot: 'Godot 4 ใช้ ResourceLoader.load_threaded_request() และ check status ในแต่ละเฟรม'
      },
      complexity: {
        time: 'O(1) ในการเรียกคำขอโหลดบน Main Thread (เวลาอ่านจริงขึ้นอยู่กับความเร็ว SSD/Network ในเธรดเบื้องหลัง)',
        space: 'ใช้หน่วยความจำเฉพาะ Asset ที่กำลังใช้งานจริงผ่าน Reference Counting',
        explanation: 'ไม่เกิด Frametime Spike บนเธรดเกมหลักเลยแม้แต่มิลลิวินาทีเดียว'
      },
      mathOrTheory: 'Disk I/O Latency: อ่านไฟล์ 50MB จาก NVMe SSD ใช้เวลา ~20ms, จาก SATA SSD ใช้เวลา ~100ms, จาก eMMC มือถือใช้เวลา ~350ms. การรันบน Main Thread จึงทำให้เฟรมหลุดแน่นอน',
      pitfalls: [
        'ใช้ Resources.Load ในช่วงต่อสู้: ทำให้เกมหยุดนิ่งชั่วขณะเมื่อบอสหรือเอฟเฟกต์พิเศษปรากฏตัว',
        'ลืม Release Handle ใน Addressables: เกิด Memory Leaks ทรัพยากรค้างอยู่ในแรมไม่ยอมคืน',
        'Hard Reference ทุกอย่างใน Prefab เดียว: ทำให้แค่โหลดตัวละครตัวเดียว เกมกลับดึง Texture ของอาวุธทั้งเกมเข้ามาด้วย'
      ]
    },

    codeExample: {
      language: 'csharp',
      badTitle: '❌ ใช้ Resources.Load บล็อกเธรดหลักขณะเล่นเกม (เกม Freeze หยุดนิ่ง)',
      badCode: `void SpawnBoss() {
    // ผิดมหันต์! คำสั่งนี้บล็อก Game Thread นาน 450ms เพื่ออ่านดิสก์
    // จอภาพจะค้าง แอนิเมชันหยุดนิ่ง และผู้เล่นจะรู้สึกว่าเกมกระตุกรุนแรง
    GameObject bossPrefab = Resources.Load<GameObject>("BossDragon");
    Instantiate(bossPrefab, transform.position, Quaternion.identity);
}`,
      goodTitle: '✅ สตรีมไฟล์เบื้องหลังด้วย Addressables Async API (เฟรมเรตไม่ตก)',
      goodCode: `using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

void SpawnBossAsync() {
    // โหลดในเบื้องหลังโดยไม่บล็อก Main Thread แม้แต่มิลลิวินาทีเดียว
    Addressables.LoadAssetAsync<GameObject>("BossDragon").Completed += handle => {
        if (handle.Status == AsyncOperationStatus.Succeeded) {
            Instantiate(handle.Result, transform.position, Quaternion.identity);
        }
    };
}`,
      explanation: 'ผู้เล่นยังคงควบคุมตัวละครและวิ่งต่อได้อย่างราบรื่น 60 FPS ในขณะที่โมเดลบอสกำลังสตรีมเข้ามา'
    },

    performanceComparison: {
      benchmarkTitle: 'เปรียบเทียบการโหลดโมเดลบอสขนาด 80 MB กลางฉากการเล่น',
      metrics: [
        {
          metric: 'Peak Frame Time Hitch',
          unoptimized: '480 ms (หน้าจอค้างเกือบครึ่งวินาที!)',
          optimized: '16.6 ms (นิ่งสนิท ไร้อาการสะดุด)',
          improvement: 'ลดการกระตุกของเฟรมลง 100%',
          explanation: 'แยกการอ่านข้อมูลออกจาก Game Thread ไปยัง I/O Worker'
        },
        {
          metric: 'Frame Rate ขณะโหลด',
          unoptimized: '0 FPS (Hard Freeze หยุดนิ่ง)',
          optimized: '60 FPS ต่อเนื่องตลอดเวลา',
          improvement: 'เกมลื่นไหลไม่สะดุด',
          explanation: 'ผู้เล่นไม่รู้สึกเลยว่ามีการโหลดไฟล์ขนาดใหญ่เกิดขึ้น'
        },
        {
          metric: 'ขนาดหน่วยความจำเมื่อเริ่มเกม',
          unoptimized: 'กินแรม 2.8 GB (เพราะ Hard Reference ทุกอย่าง)',
          optimized: 'กินแรม 650 MB (โหลดเฉพาะที่ใช้จริง)',
          improvement: 'ประหยัดแรมเริ่มต้นลง 76%',
          explanation: 'ใช้ Soft References ในการตัดวงจรการพึ่งพาข้าม Asset'
        }
      ],
      verdict: 'Addressables และ Async Loading เป็นกฎเหล็กในการสร้างเกมขนาดใหญ่ที่ต้องการความลื่นไหลแบบ Seamless'
    },
    codeExamples: TOPIC_CODE_EXAMPLES['async-loading'],
    challenges: TOPIC_CHALLENGES['async-loading'],
  }
];
