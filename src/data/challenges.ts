import type { TopicChallenges } from '../types/topic';

export const TOPIC_CHALLENGES: Record<string, TopicChallenges> = {
  'object-pooling': {
    pureLogic: {
      id: 'pool-pure',
      type: 'pure',
      title: 'สร้าง Free-List Object Pool ด้วย Pure Logic (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Easy',
      description:
        'เติมโค้ดเมธอด `acquire()` และ `release()` ให้กับคลาส `ObjectPool<T>` เพื่อนำวัตถุกลับมาใช้ซ้ำแบบ O(1) โดยไม่สร้าง Garbage Collection Churn บน Heap',
      conceptNotes:
        'ใช้ Stack / Free-List array ในการเก็บออบเจกต์ที่ว่างอยู่ เมื่อมีคำขอ acquire() ให้ pop() ออกมา ถ้าหมดให้เรียก factory() สร้างใหม่ และเมื่อ release() ให้ resetState() แล้ว push() กลับเข้า free list',
      starterCode: `class ObjectPool<T> {
  private freeList: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;

  constructor(factory: () => T, reset: (item: T) => void, initialCapacity: number) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialCapacity; i++) {
      this.freeList.push(this.factory());
    }
  }

  // 1. ดึงวัตถุจาก Pool มาใช้งาน
  public acquire(): T {
    if (this.freeList.length > 0) {
      return ___BLANK_1___; // นำวัตถุที่ว่างออกจาก freeList
    }
    return this.factory(); // ขยายขนาดถ้าไม่มีของว่าง
  }

  // 2. คืนวัตถุกลับเข้า Pool
  public release(item: T): void {
    ___BLANK_2___; // รีเซ็ตสถานะของ item ให้สะอาดก่อนเก็บ
    ___BLANK_3___; // เก็บ item กลับคืนสู่ freeList
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึงวัตถุจาก Free List)',
          expected: 'this.freeList.pop()!',
          acceptedAlternatives: ['this.freeList.pop()', 'this.freeList.pop()!', 'freeList.pop()'],
          hint: 'ใช้เมธอด array pop() เพื่อหยิบวัตถุตัวสุดท้ายออกมาในเวลา O(1)',
          options: ['this.freeList.pop()!', 'this.freeList.shift()!', 'new this.factory()', 'this.freeList[0]']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ล้างค่าสถานะก่อนเก็บ)',
          expected: 'this.reset(item)',
          acceptedAlternatives: ['this.reset(item)', 'reset(item)'],
          hint: 'เรียกฟังก์ชัน reset ที่ส่งเข้ามาใน constructor กับตัวแปร item เพื่อล้าง dirty state',
          options: ['this.reset(item)', 'item.destroy()', 'this.factory()', 'delete item']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (คืนเข้า List)',
          expected: 'this.freeList.push(item)',
          acceptedAlternatives: ['this.freeList.push(item)', 'freeList.push(item)'],
          hint: 'ใส่ item กลับเข้าไปใน this.freeList array',
          options: ['this.freeList.push(item)', 'this.freeList.unshift(item)', 'this.freeList = [item]', 'item = null']
        }
      ],
      fullSolution: `class ObjectPool<T> {
  private freeList: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;

  constructor(factory: () => T, reset: (item: T) => void, initialCapacity: number) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialCapacity; i++) {
      this.freeList.push(this.factory());
    }
  }

  public acquire(): T {
    if (this.freeList.length > 0) {
      return this.freeList.pop()!;
    }
    return this.factory();
  }

  public release(item: T): void {
    this.reset(item);
    this.freeList.push(item);
  }
}`,
      explanation:
        'การใช้ LIFO Stack (pop/push) เป็นวิธีที่เร็วที่สุดในการทำ Object Pool เพราะข้อมูลตัวล่าสุดมักจะยังคงอยู่ใน CPU Cache (Temporal Locality) และการทำ resetState() ป้องกันไม่ให้ออบเจกต์จำสถานะเก่า เช่น เลือด หรือตำแหน่งเดิม',
      testCaseDescription: 'ทดสอบ acquire 3 ครั้ง -> Pool ลดเหลือ 0 -> release คืน 1 ชิ้น -> acquire อีกครั้งได้ชิ้นเดิมที่ถูก Reset'
    },

    unity: {
      id: 'pool-unity',
      type: 'unity',
      title: 'การใช้งาน UnityEngine.Pool ใน Unity 2021+ (C#)',
      language: 'csharp',
      difficulty: 'Easy',
      description:
        'เติมโค้ดสร้างและใช้งาน `ObjectPool<Bullet>` ของ Unity API มาตรฐาน เพื่อควบคุมวงจรชีวิตของกระสุนปืนโดยไม่เกิด GC Allocations',
      conceptNotes:
        'Unity 2021+ แนะนำให้ใช้ UnityEngine.Pool.ObjectPool<T> โดยกำหนด actionOnGet (เปิดใช้งาน SetActive(true)) และ actionOnRelease (ปิดใช้งาน SetActive(false))',
      starterCode: `using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour {
    [SerializeField] private Bullet bulletPrefab;
    private IObjectPool<Bullet> bulletPool;

    void Awake() {
        bulletPool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: bullet => ___BLANK_1___, // เปิดใช้งานกระสุนเมื่อหยิบจาก Pool
            actionOnRelease: bullet => ___BLANK_2___, // ปิดใช้งานกระสุนเมื่อคืนเข้า Pool
            actionOnDestroy: bullet => Destroy(bullet.gameObject),
            defaultCapacity: 100,
            maxSize: 500
        );
    }

    public void Fire(Vector3 spawnPos, Quaternion spawnRot) {
        // หยิบกระสุนออกจาก Pool
        Bullet bullet = ___BLANK_3___;
        bullet.transform.SetPositionAndRotation(spawnPos, spawnRot);
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เปิดใช้งาน GameObject)',
          expected: 'bullet.gameObject.SetActive(true)',
          acceptedAlternatives: ['bullet.gameObject.SetActive(true);', 'bullet.gameObject.SetActive(true)'],
          hint: 'สั่งให้ GameObject ของ bullet ปรากฏบนฉากด้วย SetActive(true)',
          options: ['bullet.gameObject.SetActive(true)', 'bullet.enabled = true', 'bullet.Init()', 'Destroy(bullet)']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ปิดการแสดงผลเมื่อคืนเข้า Pool)',
          expected: 'bullet.gameObject.SetActive(false)',
          acceptedAlternatives: ['bullet.gameObject.SetActive(false);', 'bullet.gameObject.SetActive(false)'],
          hint: 'สั่งซ่อน GameObject ด้วย SetActive(false) เพื่อหยุดการเรนเดอร์และฟิสิกส์',
          options: ['bullet.gameObject.SetActive(false)', 'Destroy(bullet.gameObject)', 'bullet.enabled = false', 'bullet = null']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (คำสั่งหยิบจาก Unity Pool)',
          expected: 'bulletPool.Get()',
          acceptedAlternatives: ['bulletPool.Get()', 'this.bulletPool.Get()'],
          hint: 'เมธอดมาตรฐานของ IObjectPool ในการดึงวัตถุคือ .Get()',
          options: ['bulletPool.Get()', 'bulletPool.Pop()', 'bulletPool.Acquire()', 'Instantiate(bulletPrefab)']
        }
      ],
      fullSolution: `using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour {
    [SerializeField] private Bullet bulletPrefab;
    private IObjectPool<Bullet> bulletPool;

    void Awake() {
        bulletPool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: bullet => bullet.gameObject.SetActive(true),
            actionOnRelease: bullet => bullet.gameObject.SetActive(false),
            actionOnDestroy: bullet => Destroy(bullet.gameObject),
            defaultCapacity: 100,
            maxSize: 500
        );
    }

    public void Fire(Vector3 spawnPos, Quaternion spawnRot) {
        Bullet bullet = bulletPool.Get();
        bullet.transform.SetPositionAndRotation(spawnPos, spawnRot);
    }
}`,
      explanation:
        'UnityEngine.Pool ถูกออกแบบมาให้ Thread-safe และมี Collection Check ในโหมด Debug เพื่อเตือนหากเผลอคืนวัตถุเดิมซ้ำสองครั้ง',
      testCaseDescription: 'ทดสอบการยิงกระสุน 50 นัด -> GC Alloc = 0 Bytes -> คืนเข้า pool ปิดการมองเห็นทันที'
    },

    unreal: {
      id: 'pool-unreal',
      type: 'unreal',
      title: 'การสร้าง Custom Actor Pooling ใน Unreal Engine 5 (C++)',
      language: 'cpp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดระบบ Actor Pool ใน Unreal Engine 5 โดยใช้ `TArray<ABulletActor*>` เพื่อนำ Actor กลับมาใช้ซ้ำโดยไม่ต้องเรียก `SpawnActor()` ทุกนัด',
      conceptNotes:
        'ใน UE5 การ SpawnActor มี Overhead สูงมากจาก UWorld registration การทำ Pool ทำได้โดยการ SetActorHiddenInGame และ SetActorTickEnabled',
      starterCode: `#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "BulletPool.h"

ABulletActor* UBulletPoolSubsystem::GetBullet(const FVector& SpawnLocation, const FRotator& SpawnRotation) {
    ABulletActor* Bullet = nullptr;

    if (InactivePool.Num() > 0) {
        // 1. ดึงกระสุนตัวสุดท้ายออกจาก InactivePool
        Bullet = InactivePool.___BLANK_1___();
    } else {
        // 2. ถ้า Pool ว่าง ให้ Spawn ตัวใหม่ผ่าน UWorld
        FActorSpawnParameters SpawnParams;
        Bullet = GetWorld()->SpawnActor<ABulletActor>(BulletClass, SpawnLocation, SpawnRotation, SpawnParams);
    }

    if (Bullet) {
        // 3. เปิดการแสดงผลและการ Tick ของ Actor ในโลก
        Bullet->SetActorLocationAndRotation(SpawnLocation, SpawnRotation);
        Bullet->___BLANK_2___(false); // เลิกซ่อนตัว (แสดงผล)
        Bullet->___BLANK_3___(true);  // เปิดการทำงาน Tick ฟิสิกส์
    }

    return Bullet;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึงและลบตัวท้ายของ TArray)',
          expected: 'Pop',
          acceptedAlternatives: ['Pop()', 'Pop'],
          hint: 'TArray ใน UE C++ มีเมธอด Pop() สำหรับดึงตัวท้ายสุดออกใน O(1)',
          options: ['Pop', 'RemoveAt(0)', 'Last', 'Top']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ยกเลิกการซ่อนในเกม)',
          expected: 'SetActorHiddenInGame',
          acceptedAlternatives: ['SetActorHiddenInGame', 'SetActorHiddenInGame(false)'],
          hint: 'ฟังก์ชันใน AActor ที่ใช้เปิด/ปิดการเรนเดอร์ในเกมคือ SetActorHiddenInGame',
          options: ['SetActorHiddenInGame', 'SetVisibility', 'SetActorEnableCollision', 'SetActive']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (เปิดการ Tick ของ Actor)',
          expected: 'SetActorTickEnabled',
          acceptedAlternatives: ['SetActorTickEnabled', 'SetActorTickEnabled(true)'],
          hint: 'ฟังก์ชันที่ใช้เปิดหรือหยุดการเรียก Tick() ของ Actor คือ SetActorTickEnabled',
          options: ['SetActorTickEnabled', 'SetComponentTickEnabled', 'StartTick', 'EnableInput']
        }
      ],
      fullSolution: `#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "BulletPool.h"

ABulletActor* UBulletPoolSubsystem::GetBullet(const FVector& SpawnLocation, const FRotator& SpawnRotation) {
    ABulletActor* Bullet = nullptr;

    if (InactivePool.Num() > 0) {
        Bullet = InactivePool.Pop();
    } else {
        FActorSpawnParameters SpawnParams;
        Bullet = GetWorld()->SpawnActor<ABulletActor>(BulletClass, SpawnLocation, SpawnRotation, SpawnParams);
    }

    if (Bullet) {
        Bullet->SetActorLocationAndRotation(SpawnLocation, SpawnRotation);
        Bullet->SetActorHiddenInGame(false);
        Bullet->SetActorTickEnabled(true);
    }

    return Bullet;
}`,
      explanation:
        'ใน Unreal Engine การหยุด Tick และซ่อน Actor ช่วยตัดค่าใช้จ่ายในการเรนเดอร์และฟิสิกส์โดยที่ตัว Actor ยังคงอยู่ในหน่วยความจำพร้อมใช้งานทันที',
      testCaseDescription: 'ทดสอบ GetBullet ดึงจาก InactivePool ขนาด 10 ตัว -> เหลือ 9 ตัว -> Actor Visible และ Tick Active'
    }
  },

  'spatial-partitioning': {
    pureLogic: {
      id: 'spatial-pure',
      type: 'pure',
      title: 'ฟังก์ชัน Spatial Hash Grid 2D (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Medium',
      description:
        'เติมฟังก์ชันคำนวณ Hash Key ของตำแหน่งพิกัด 2D ลงใน Cell เพื่อใช้ค้นหาเพื่อนบ้านในตาราง Spatial Grid จาก O(N²) ให้เหลือ O(1)',
      conceptNotes:
        'การคำนวณ Cell Grid ทำได้โดยการหารพิกัด x, y ด้วย cellSize แล้วปัดเศษลง (Math.floor) จากนั้นนำมาผสมด้วยค่าคงที่จำนวนเฉพาะ (Prime Hash)',
      starterCode: `function getSpatialCellKey(x: number, y: number, cellSize: number): string {
  // 1. แปลงพิกัดโลก (World Space) เป็น พิกัดช่องตาราง (Grid Space)
  const cellX = ___BLANK_1___;
  const cellY = ___BLANK_2___;

  // 2. คืนค่า Key รูปแบบ "cellX,cellY" เพื่อนำไปใช้เป็น Map Bucket
  return ___BLANK_3___;
}

// ค้นหาเฉพาะ 9 ช่องรอบตัว (เซลล์ตัวเอง + 8 เซลล์ข้างเคียง)
function getNeighborKeys(cellX: number, cellY: number): string[] {
  const keys: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      keys.push(\`\${cellX + dx},\${cellY + dy}\`);
    }
  }
  return keys;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (หาดัชนีคอลัมน์ในกริด)',
          expected: 'Math.floor(x / cellSize)',
          acceptedAlternatives: ['Math.floor(x / cellSize)', 'Math.floor(x/cellSize)'],
          hint: 'นำพิกัด x หารด้วย cellSize แล้วใช้ Math.floor() เพื่อให้ได้ดัชนีช่องที่แน่นอนแม้ค่าพิกัดจะติดลบ',
          options: ['Math.floor(x / cellSize)', 'Math.round(x * cellSize)', 'x % cellSize', 'Math.ceil(x)']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (หาดัชนีแถวในกริด)',
          expected: 'Math.floor(y / cellSize)',
          acceptedAlternatives: ['Math.floor(y / cellSize)', 'Math.floor(y/cellSize)'],
          hint: 'เช่นเดียวกับ x นำ y มาหารด้วย cellSize แล้วปัดเศษลงด้วย Math.floor()',
          options: ['Math.floor(y / cellSize)', 'Math.round(y * cellSize)', 'y % cellSize', 'Math.ceil(y)']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (รูปแบบ String Key)',
          expected: '`${cellX},${cellY}`',
          acceptedAlternatives: ['`${cellX},${cellY}`', 'cellX + "," + cellY', '`${cellX}_${cellY}`'],
          hint: 'สร้างสตริงรวมพิกัดช่อง เช่น "${cellX},${cellY}"',
          options: ['`${cellX},${cellY}`', 'cellX * cellY', '`${x},${y}`', 'cellX.toString()']
        }
      ],
      fullSolution: `function getSpatialCellKey(x: number, y: number, cellSize: number): string {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  return \`\${cellX},\${cellY}\`;
}

function getNeighborKeys(cellX: number, cellY: number): string[] {
  const keys: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      keys.push(\`\${cellX + dx},\${cellY + dy}\`);
    }
  }
  return keys;
}`,
      explanation:
        'การแบ่งพื้นที่ด้วยวิธีนี้ทำให้วัตถุที่อยู่ห่างกันเกินขนาด 1 Cell ไม่มีโอกาสถูกนำมาคำนวณระยะห่างให้เสียเวลา CPU',
      testCaseDescription: 'ทดสอบพิกัด (125, 80) บน Cell ขนาด 50 -> Cell Key คือ "2,1"'
    },

    unity: {
      id: 'spatial-unity',
      type: 'unity',
      title: 'การใช้ NonAlloc Physics Query ใน Unity 2D (C#)',
      language: 'csharp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดการค้นหาศัตรูในระยะรอบตัวโดยใช้ `Physics2D.OverlapCircleNonAlloc` เพื่อไม่ให้เกิด Garbage Collection Allocation ต่อเฟรม',
      conceptNotes:
        'OverlapCircleAll ก่อให้เกิด Collider2D[] Array ใหม่ทุกครั้งบน Heap! ควรเปลี่ยนเป็น OverlapCircleNonAlloc พร้อม Reuse Collider buffer',
      starterCode: `using UnityEngine;

public class EnemyRadar : MonoBehaviour {
    [SerializeField] private float scanRadius = 5.0f;
    [SerializeField] private ContactFilter2D enemyFilter;
    
    // บัฟเฟอร์คงที่ ไม่เกิด GC Alloc ทุกครั้งที่ตรวจ
    private readonly Collider2D[] hitResults = new Collider2D[32];

    public int ScanNearbyEnemies() {
        // 1. เรียกคำสั่งตรวจจับการชนแบบ NonAlloc
        int count = ___BLANK_1___(
            transform.position,
            scanRadius,
            enemyFilter,
            ___BLANK_2___ // อาร์เรย์บัฟเฟอร์สำหรับรับผลลัพธ์
        );

        // 2. วนลูปเฉพาะจำนวนผลลัพธ์ที่ตรวจพบจริง
        for (int i = 0; i < count; i++) {
            Collider2D enemyCollider = hitResults[i];
            // ทำการคำนวณกับศัตรูที่พบ
        }

        return count;
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เมธอด Physics2D แบบประหยัด RAM)',
          expected: 'Physics2D.OverlapCircleNonAlloc',
          acceptedAlternatives: ['Physics2D.OverlapCircleNonAlloc', 'Physics2D.OverlapCircleNonAlloc;'],
          hint: 'ใช้เมธอดที่มีคำลงท้ายว่า NonAlloc เพื่อป้องกันการสร้าง Array ก้อนใหม่',
          options: ['Physics2D.OverlapCircleNonAlloc', 'Physics2D.OverlapCircleAll', 'Physics2D.OverlapCircle', 'Physics2D.Raycast']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ส่งอาร์เรย์บัฟเฟอร์ผลลัพธ์)',
          expected: 'hitResults',
          acceptedAlternatives: ['hitResults', 'this.hitResults'],
          hint: 'ส่งตัวแปร hitResults ที่เป็นฟิลด์อาร์เรย์ที่เตรียมไว้ล่วงหน้า',
          options: ['hitResults', 'new Collider2D[32]', 'null', 'enemyFilter']
        }
      ],
      fullSolution: `using UnityEngine;

public class EnemyRadar : MonoBehaviour {
    [SerializeField] private float scanRadius = 5.0f;
    [SerializeField] private ContactFilter2D enemyFilter;
    
    private readonly Collider2D[] hitResults = new Collider2D[32];

    public int ScanNearbyEnemies() {
        int count = Physics2D.OverlapCircleNonAlloc(
            transform.position,
            scanRadius,
            enemyFilter,
            hitResults
        );

        for (int i = 0; i < count; i++) {
            Collider2D enemyCollider = hitResults[i];
        }

        return count;
    }
}`,
      explanation:
        'Physics2D.OverlapCircleNonAlloc ใช้ PhysX BVH ในการคัดกรอง Broadphase และเขียนผลลัพธ์ลงในบัฟเฟอร์เดิมทันที ส่งผลให้ GC Alloc ต่อเฟรมเป็น 0 Bytes 100%',
      testCaseDescription: 'ทดสอบสแกนรอบตัว 1,000 ครั้ง -> GC Alloc = 0 Bytes, คืนค่าจำนวนศัตรูถูกต้อง'
    },

    unreal: {
      id: 'spatial-unreal',
      type: 'unreal',
      title: 'การค้นหาวัตถุในขอบเขต AABB ใน Unreal Engine 5 (C++)',
      language: 'cpp',
      difficulty: 'Hard',
      description:
        'เติมโค้ดการค้นหา Actors ภายในกล่อง Bounding Box (AABB) ใน Chaos Physics / UWorld โดยใช้ `OverlapMultiByChannel`',
      conceptNotes:
        'Unreal Chaos Physics รองรับการค้นหารูปทรงเรขาคณิตผ่าน FCollisionShape และเก็บผลลงใน TArray<FOverlapResult>',
      starterCode: `#include "CoreMinimal.h"
#include "Engine/World.h"
#include "CollisionQueryParams.h"

int32 AEnemyManager::FindNearbyEntities(const FVector& Center, float Radius, TArray<FOverlapResult>& OutOverlaps) {
    UWorld* World = GetWorld();
    if (!World) return 0;

    // 1. กำหนดรูปทรงเรขาคณิตทรงกลม (Bounding Sphere)
    FCollisionShape SphereShape = ___BLANK_1___(Radius);

    FCollisionQueryParams QueryParams;
    QueryParams.AddIgnoredActor(this);

    // 2. เรียกคำสั่ง Overlap ค้นหาวัตถุที่อยู่ในขอบเขต
    bool bHit = World->___BLANK_2___(
        OutOverlaps,
        Center,
        FQuat::Identity,
        ECC_Pawn, // Channel การชนของมอนสเตอร์
        SphereShape,
        QueryParams
    );

    return OutOverlaps.Num();
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (สร้าง FCollisionShape ทรงกลม)',
          expected: 'FCollisionShape::MakeSphere',
          acceptedAlternatives: ['FCollisionShape::MakeSphere', 'FCollisionShape::MakeSphere(Radius)'],
          hint: 'ใช้ static function ของ FCollisionShape สำหรับสร้าง Sphere',
          options: ['FCollisionShape::MakeSphere', 'FCollisionShape::MakeBox', 'FCollisionShape::MakeCapsule', 'new FCollisionShape()']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ฟังก์ชันค้นหา Overlap หลายตัว)',
          expected: 'OverlapMultiByChannel',
          acceptedAlternatives: ['OverlapMultiByChannel', 'OverlapMultiByChannel;'],
          hint: 'เมธอดใน UWorld สำหรับตรวจหา Overlap หลายชิ้นผ่าน Collision Channel คือ OverlapMultiByChannel',
          options: ['OverlapMultiByChannel', 'SweepMultiByChannel', 'LineTraceSingleByChannel', 'OverlapBlockingTestByChannel']
        }
      ],
      fullSolution: `#include "CoreMinimal.h"
#include "Engine/World.h"
#include "CollisionQueryParams.h"

int32 AEnemyManager::FindNearbyEntities(const FVector& Center, float Radius, TArray<FOverlapResult>& OutOverlaps) {
    UWorld* World = GetWorld();
    if (!World) return 0;

    FCollisionShape SphereShape = FCollisionShape::MakeSphere(Radius);

    FCollisionQueryParams QueryParams;
    QueryParams.AddIgnoredActor(this);

    bool bHit = World->OverlapMultiByChannel(
        OutOverlaps,
        Center,
        FQuat::Identity,
        ECC_Pawn,
        SphereShape,
        QueryParams
    );

    return OutOverlaps.Num();
}`,
      explanation:
        'Chaos Broadphase จะใช้ Spatial Hash / BVH กรองยูนิตที่ไม่อยู่ในระยะออกอย่างรวดเร็วก่อนนำผลลัพธ์ใส่ใน OutOverlaps',
      testCaseDescription: 'ทดสอบ Query ในรัศมี 500 units -> คืนค่าจำนวน Pawns ในพื้นที่โดยไม่หน่วงเฟรม'
    }
  },

  'ecs-dod': {
    pureLogic: {
      id: 'ecs-pure',
      type: 'pure',
      title: 'Structure of Arrays (SoA) Contiguous Buffer Update (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Medium',
      description:
        'เติมโค้ดลูปอัปเดตฟิสิกส์บน TypedArray `Float32Array` เพื่อให้ CPU ดึงข้อมูลเข้า L1 Cache Line 64 Bytes ได้เต็มประสิทธิภาพ 100%',
      conceptNotes:
        'ใน SoA พิกัด x และ y จะถูกเก็บเรียงติดกันใน Array ผืนเดียว การเข้าถึงอนุภาคตัวที่ i คือดัชนี i * 2 (สำหรับ x) และ i * 2 + 1 (สำหรับ y)',
      starterCode: `function updatePositionsSoA(
  positions: Float32Array, // [x0, y0, x1, y1, x2, y2, ...]
  velocities: Float32Array, // [vx0, vy0, vx1, vy1, ...]
  count: number,
  dt: number
): void {
  for (let i = 0; i < count; i++) {
    // 1. คำนวณดัชนีเริ่มต้นของอนุภาคตัวที่ i ในแถวข้อมูล
    const idx = ___BLANK_1___;

    // 2. อัปเดตพิกัดแกน X
    positions[idx] += ___BLANK_2___;

    // 3. อัปเดตพิกัดแกน Y
    positions[idx + 1] += ___BLANK_3___;
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดัชนีเริ่มต้น 2D)',
          expected: 'i * 2',
          acceptedAlternatives: ['i * 2', 'i*2', 'i << 1'],
          hint: 'เพราะ 1 อนุภาคมีทั้งแกน x และ y จึงใช้พื้นที่ 2 ช่องใน Array (i * 2)',
          options: ['i * 2', 'i', 'i + 2', 'i * 4']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (คำนวณการเคลื่อนที่แกน X)',
          expected: 'velocities[idx] * dt',
          acceptedAlternatives: ['velocities[idx] * dt', 'velocities[idx]*dt'],
          hint: 'ความเร็วแกน X คือ velocities[idx] คูณด้วยตัวแปรเวลา dt',
          options: ['velocities[idx] * dt', 'velocities[i] * dt', 'dt', 'velocities[idx]']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (คำนวณการเคลื่อนที่แกน Y)',
          expected: 'velocities[idx + 1] * dt',
          acceptedAlternatives: ['velocities[idx + 1] * dt', 'velocities[idx+1]*dt'],
          hint: 'ความเร็วแกน Y อยู่ที่ช่องถัดไปคือ velocities[idx + 1] คูณด้วย dt',
          options: ['velocities[idx + 1] * dt', 'velocities[idx] * dt', 'positions[idx + 1]', 'dt']
        }
      ],
      fullSolution: `function updatePositionsSoA(
  positions: Float32Array,
  velocities: Float32Array,
  count: number,
  dt: number
): void {
  for (let i = 0; i < count; i++) {
    const idx = i * 2;
    positions[idx] += velocities[idx] * dt;
    positions[idx + 1] += velocities[idx + 1] * dt;
  }
}`,
      explanation:
        'ข้อมูลที่เรียงติดกันใน Flat TypedArray ช่วยให้ Hardware Prefetcher ดึงข้อมูลบล็อกถัดไปมารอใน L1 Cache ได้ล่วงหน้า 100% ขจัดปัญหา CPU Cache Miss',
      testCaseDescription: 'ทดสอบ 10,000 อนุภาค -> อัปเดตในเวลา < 0.2ms ไวกว่า OOP 15 เท่า'
    },

    unity: {
      id: 'ecs-unity',
      type: 'unity',
      title: 'การเขียน Unity DOTS / Entities ISystem + Burst (C#)',
      language: 'csharp',
      difficulty: 'Hard',
      description:
        'เติมโค้ดใน `ISystem` ของ Unity DOTS เพื่อวนลูปอ่าน/เขียน Component Data แบบ Pure Blittable Struct ผ่าน `SystemAPI.Query`',
      conceptNotes:
        'ISystem เป็น Struct-based System ใน Unity Entities 1.0+ ที่รองรับ Burst Compiler แปลง C# IL เป็น SIMD AVX Machine code',
      starterCode: `using Unity.Entities;
using Unity.Mathematics;
using Unity.Burst;

public struct LocalPosition : IComponentData { public float3 Value; }
public struct MoveVelocity : IComponentData { public float3 Value; }

[BurstCompile]
public partial struct MovementSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;

        // วนลูปอ่าน Component Position แบบเขียน (RefRW) และ Velocity แบบอ่านอย่างเดียว (RefRO)
        foreach (var (pos, vel) in ___BLANK_1___<RefRW<LocalPosition>, RefRO<MoveVelocity>>()) {
            // อัปเดตตำแหน่ง LocalPosition ด้วยความเร็ว MoveVelocity
            pos.___BLANK_2___.Value += vel.___BLANK_3___.Value * dt;
        }
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (Query API ของ Unity Entities)',
          expected: 'SystemAPI.Query',
          acceptedAlternatives: ['SystemAPI.Query', 'SystemAPI.Query;'],
          hint: 'เมธอดใน SystemAPI ที่ใช้ค้นหา Entities ที่มี Component ตามที่กำหนดคือ SystemAPI.Query',
          options: ['SystemAPI.Query', 'EntityManager.GetAll', 'state.GetQuery', 'ComponentLookup']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เข้าถึงค่าแบบ Read-Write)',
          expected: 'ValueRW',
          acceptedAlternatives: ['ValueRW', 'ValueRW.'],
          hint: 'RefRW<T> เข้าถึงข้อมูลที่แก้ไขได้ผ่านพร็อพเพอร์ตี้ ValueRW',
          options: ['ValueRW', 'ValueRO', 'Value', 'Get()']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (เข้าถึงค่าแบบ Read-Only)',
          expected: 'ValueRO',
          acceptedAlternatives: ['ValueRO', 'ValueRO.'],
          hint: 'RefRO<T> เข้าถึงข้อมูลแบบอ่านอย่างเดียวผ่าน ValueRO',
          options: ['ValueRO', 'ValueRW', 'Value', 'Read()']
        }
      ],
      fullSolution: `using Unity.Entities;
using Unity.Mathematics;
using Unity.Burst;

public struct LocalPosition : IComponentData { public float3 Value; }
public struct MoveVelocity : IComponentData { public float3 Value; }

[BurstCompile]
public partial struct MovementSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;

        foreach (var (pos, vel) in SystemAPI.Query<RefRW<LocalPosition>, RefRO<MoveVelocity>>()) {
            pos.ValueRW.Value += vel.ValueRO.Value * dt;
        }
    }
}`,
      explanation:
        'Burst Compiler สามารถแปลงลูปนี้ให้ใช้คำสั่ง CPU SIMD (Vectorization) ทำการคูณและบวกพิกัดของยูนิตได้ถึง 4 ถึง 8 ตัวใน 1 สัญญาณนาฬิกา',
      testCaseDescription: 'ทดสอบ 20,000 Entities -> Frametime ลดลงจาก 45ms (MonoBehaviour) เหลือ 0.8ms'
    },

    unreal: {
      id: 'ecs-unreal',
      type: 'unreal',
      title: 'การวนลูป Mass Entity Processor ใน Unreal Engine 5 (C++)',
      language: 'cpp',
      difficulty: 'Hard',
      description:
        'เติมโค้ด `UMassProcessor` ใน Unreal Engine 5 เพื่อประมวลผล Entity Fragment คล้าย DOTS ในระดับ 50,000 entities',
      conceptNotes:
        'Mass Entity เป็น Archetype-based ECS ใน Unreal Engine 5 ใช้ TArrayView ในการวนลูป Fragment Data แบบเรียงติดกันใน Memory Chunk',
      starterCode: `#include "MassProcessor.h"
#include "MassExecutionContext.h"
#include "SimpleMovementProcessor.h"

void USimpleMovementProcessor::Execute(FMassEntityManager& EntityManager, FMassExecutionContext& Context) {
    EntityQuery.ForEachEntityChunk(EntityManager, Context, [this](FMassExecutionContext& ChunkContext) {
        // 1. ดึง ArrayView ของ Fragments ใน Chunk นี้
        TArrayView<FTransformFragment> Transforms = ChunkContext.___BLANK_1___<FTransformFragment>();
        TArrayView<const FVelocityFragment> Velocities = ChunkContext.___BLANK_2___<FVelocityFragment>();

        const int32 NumEntities = ChunkContext.GetNumEntities();
        const float DeltaTime = ChunkContext.GetDeltaTimeSeconds();

        // 2. วนลูปกวาดข้อมูล contiguous
        for (int32 i = 0; i < NumEntities; ++i) {
            Transforms[i].GetMutableTransform().AddToTranslation(Velocities[i].Value * DeltaTime);
        }
    });
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึง Fragment แบบแก้ไขได้)',
          expected: 'GetMutableFragmentView',
          acceptedAlternatives: ['GetMutableFragmentView', 'GetMutableFragmentView;'],
          hint: 'เมธอดใน ChunkContext สำหรับดึง Fragment แบบอ่านเขียนคือ GetMutableFragmentView',
          options: ['GetMutableFragmentView', 'GetFragmentView', 'GetArray', 'FindFragment']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ดึง Fragment แบบอ่านอย่างเดียว)',
          expected: 'GetFragmentView',
          acceptedAlternatives: ['GetFragmentView', 'GetFragmentView;'],
          hint: 'เมธอดสำหรับดึง Fragment แบบ Read-Only คือ GetFragmentView',
          options: ['GetFragmentView', 'GetMutableFragmentView', 'GetConstArray', 'ReadFragment']
        }
      ],
      fullSolution: `#include "MassProcessor.h"
#include "MassExecutionContext.h"
#include "SimpleMovementProcessor.h"

void USimpleMovementProcessor::Execute(FMassEntityManager& EntityManager, FMassExecutionContext& Context) {
    EntityQuery.ForEachEntityChunk(EntityManager, Context, [this](FMassExecutionContext& ChunkContext) {
        TArrayView<FTransformFragment> Transforms = ChunkContext.GetMutableFragmentView<FTransformFragment>();
        TArrayView<const FVelocityFragment> Velocities = ChunkContext.GetFragmentView<FVelocityFragment>();

        const int32 NumEntities = ChunkContext.GetNumEntities();
        const float DeltaTime = ChunkContext.GetDeltaTimeSeconds();

        for (int32 i = 0; i < NumEntities; ++i) {
            Transforms[i].GetMutableTransform().AddToTranslation(Velocities[i].Value * DeltaTime);
        }
    });
}`,
      explanation:
        'Mass Entity ถูกใช้จำลองฝูงคนและรถยนต์นับหมื่นใน The Matrix Awakens โดยให้ประสิทธิภาพเหนือกว่าการใช้ Actor ปกติอย่างเทียบไม่ติด',
      testCaseDescription: 'ทดสอบประมวลผล 50,000 Entities ใน UE5 -> CPU เวลาอัปเดต < 2ms'
    }
  },

  'fixed-timestep': {
    pureLogic: {
      id: 'fixed-pure',
      type: 'pure',
      title: 'Game Loop Accumulator Pattern (Fix Your Timestep - LeetCode Style)',
      language: 'typescript',
      difficulty: 'Medium',
      description:
        'เติมโค้ดลูปสะสมเวลา (Accumulator Loop) ตามแบบแผนของ Glenn Fiedler เพื่อให้ฟิสิกส์คำนวณด้วย Delta Time คงที่เสมอแม้เฟรมเรตจะตก',
      conceptNotes:
        'สะสมเวลาจริงที่ผ่านไปเข้า accumulator หากเครื่องแล็กกะทันหันให้ Clamp ค่าสูงสุดไว้ จากนั้นวนลูป while ตราบใดที่ accumulator >= FIXED_DT',
      starterCode: `class PhysicsGameLoop {
  private readonly FIXED_DT = 1 / 60; // 0.01666 วินาทีคงที่เสมอ
  private accumulator = 0;

  public tick(frameTimeSeconds: number): void {
    // 1. ป้องกัน Spiral of Death เมื่อเครื่องค้าง
    const clampedFrameTime = Math.min(frameTimeSeconds, ___BLANK_1___);
    
    // 2. สะสมเวลาที่ไหลผ่าน
    this.accumulator += clampedFrameTime;

    // 3. วนลูปคำนวณฟิสิกส์ในก้าวที่คงที่
    while (___BLANK_2___) {
      this.integratePhysics(this.FIXED_DT);
      this.accumulator -= ___BLANK_3___; // ลบเวลาที่คำนวณไปแล้วออก
    }
  }

  private integratePhysics(dt: number): void {
    // คำนวณความเร็วและตำแหน่ง
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (จำกัดเวลาสูงสุดป้องกัน Spiral of Death)',
          expected: '0.25',
          acceptedAlternatives: ['0.25', '0.25f', '0.2'],
          hint: 'จำกัดเวลาสูงสุดไม่ให้เกิน 0.25 วินาที เพื่อไม่ให้ฟิสิกส์คำนวณชดเชยจนเครื่องค้างถาวร',
          options: ['0.25', '1.0', '0.016', 'Infinity']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เงื่อนไขวนลูป Fixed Step)',
          expected: 'this.accumulator >= this.FIXED_DT',
          acceptedAlternatives: ['this.accumulator >= this.FIXED_DT', 'accumulator >= FIXED_DT'],
          hint: 'วนลูปตราบใดที่เวลาที่สะสมยังมากกว่าหรือเท่ากับช่วงเวลาคงที่ FIXED_DT',
          options: ['this.accumulator >= this.FIXED_DT', 'this.accumulator > 0', 'frameTimeSeconds > 0', 'true']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (หักลบเวลาที่ประมวลผลแล้ว)',
          expected: 'this.FIXED_DT',
          acceptedAlternatives: ['this.FIXED_DT', 'FIXED_DT'],
          hint: 'หักเวลาที่คำนวณไปแล้วด้วย this.FIXED_DT',
          options: ['this.FIXED_DT', 'clampedFrameTime', 'frameTimeSeconds', 'this.accumulator']
        }
      ],
      fullSolution: `class PhysicsGameLoop {
  private readonly FIXED_DT = 1 / 60;
  private accumulator = 0;

  public tick(frameTimeSeconds: number): void {
    const clampedFrameTime = Math.min(frameTimeSeconds, 0.25);
    this.accumulator += clampedFrameTime;

    while (this.accumulator >= this.FIXED_DT) {
      this.integratePhysics(this.FIXED_DT);
      this.accumulator -= this.FIXED_DT;
    }
  }

  private integratePhysics(dt: number): void {
    // integrate physics
  }
}`,
      explanation:
        'Accumulator Pattern ช่วยรับประกัน Determinism 100% ทำให้ระบบฟิสิกส์ให้ผลลัพธ์เหมือนกันทุกเครื่อง ไม่ว่าผู้เล่นจะใช้จอ 60Hz หรือ 240Hz',
      testCaseDescription: 'ทดสอบ Lag Spike 200ms -> คำนวณซอยย่อย 12 สเต็ปอย่างแม่นยำ ลูกบอลไม่ทะลุกำแพง'
    },

    unity: {
      id: 'fixed-unity',
      type: 'unity',
      title: 'การแยก Logic ระหว่าง Update และ FixedUpdate ใน Unity (C#)',
      language: 'csharp',
      difficulty: 'Easy',
      description:
        'เติมโค้ดตัวอย่างการรับ Input ใน `Update()` และประมวลผลแรงผลักฟิสิกส์ใน `FixedUpdate()` ตาม Best Practice เพื่อป้องกัน Input ตกหล่น',
      conceptNotes:
        'Input ต้องอ่านใน Update() ทุกเฟรม เพราะ FixedUpdate() อาจไม่ถูกเรียกในบางเฟรมหากเฟรมเรตสูงกว่า 50Hz',
      starterCode: `using UnityEngine;

public class PlayerController : MonoBehaviour {
    [SerializeField] private Rigidbody rb;
    [SerializeField] private float jumpForce = 8f;
    private bool jumpRequested = false;

    // 1. อ่าน Input ในรอบ Update ของ Render Loop
    void Update() {
        if (Input.GetButtonDown("Jump")) {
            ___BLANK_1___ = true; // บันทึกคำขอไว้
        }
    }

    // 2. คำนวณแรงฟิสิกส์ในรอบ FixedUpdate ของ Physics Loop
    void FixedUpdate() {
        if (___BLANK_2___) {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            ___BLANK_3___ = false; // รีเซ็ตสถานะหลังประมวลผลแล้ว
        }
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (บันทึกสถานะ Input)',
          expected: 'jumpRequested',
          acceptedAlternatives: ['jumpRequested', 'this.jumpRequested'],
          hint: 'ตั้งค่าตัวแปร jumpRequested ให้เป็น true',
          options: ['jumpRequested', 'isGrounded', 'rb.isKinematic', 'jumpForce']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ตรวจเงื่อนไขก่อนใส่แรง)',
          expected: 'jumpRequested',
          acceptedAlternatives: ['jumpRequested', 'this.jumpRequested'],
          hint: 'ตรวจสอบว่ามีการขอคำสั่งกระโดดค้างไว้หรือไม่',
          options: ['jumpRequested', 'Input.GetButtonDown("Jump")', 'rb.velocity.y > 0', 'true']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (รีเซ็ตแฟล็กคำขอ)',
          expected: 'jumpRequested',
          acceptedAlternatives: ['jumpRequested', 'this.jumpRequested'],
          hint: 'รีเซ็ต jumpRequested ให้เป็น false ทันทีหลังใส่แรงกระโดดเรียบร้อย',
          options: ['jumpRequested', 'jumpForce', 'enabled', 'rb.useGravity']
        }
      ],
      fullSolution: `using UnityEngine;

public class PlayerController : MonoBehaviour {
    [SerializeField] private Rigidbody rb;
    [SerializeField] private float jumpForce = 8f;
    private bool jumpRequested = false;

    void Update() {
        if (Input.GetButtonDown("Jump")) {
            jumpRequested = true;
        }
    }

    void FixedUpdate() {
        if (jumpRequested) {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            jumpRequested = false;
        }
    }
}`,
      explanation:
        'การอ่าน Input ใน FixedUpdate โดยตรงมักทำให้เกิดบั๊ก "กดปุ่มแล้วตัวละครไม่ยอมกระโดด" (Dropped Inputs) เมื่อเกมรันบนจอ Refresh Rate สูง',
      testCaseDescription: 'ทดสอบกดกระโดดในเฟรมสั้น -> ตัวละครกระโดดด้วยความสูงเท่ากันเป๊ะ 100%'
    },

    unreal: {
      id: 'fixed-unreal',
      type: 'unreal',
      title: 'การเปิดใช้งาน Physics Substepping ใน Unreal Engine (C++)',
      language: 'cpp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดเปิดใช้งาน Substepping ในฟิสิกส์ของ Actor เพื่อป้องกันการเกิด Tunneling ของยานพาหนะความเร็วสูงใน Chaos Physics',
      conceptNotes:
        'ใน UE5 UPrimitiveComponent สามารถเปิด bSubstepping และกำหนด MaxSubsteps เพื่อให้เอนจินคำนวณซอยย่อยฟิสิกส์อัตโนมัติ',
      starterCode: `#include "Components/PrimitiveComponent.h"
#include "PhysicsEngine/PhysicsSettings.h"

void AHighSpeedProjectile::BeginPlay() {
    Super::BeginPlay();

    UPrimitiveComponent* PrimComp = Cast<UPrimitiveComponent>(GetRootComponent());
    if (PrimComp) {
        // 1. เปิดระบบ Continuous Collision Detection (CCD)
        PrimComp->___BLANK_1___(true);

        // 2. ล็อกความเร็วเชิงเส้นไม่ให้เกินเกณฑ์
        PrimComp->SetPhysicsLinearVelocity(GetActorForwardVector() * 5000.0f);
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เปิดการตรวจจับการชนแบบต่อเนื่อง CCD)',
          expected: 'SetContinuousCollisionDetection',
          acceptedAlternatives: ['SetContinuousCollisionDetection', 'SetContinuousCollisionDetection(true)'],
          hint: 'เมธอดสำหรับเปิด Continuous Collision Detection เพื่อป้องกัน Tunneling คือ SetContinuousCollisionDetection',
          options: ['SetContinuousCollisionDetection', 'SetSimulatePhysics', 'SetCollisionEnabled', 'SetNotifyRigidBodyCollision']
        }
      ],
      fullSolution: `#include "Components/PrimitiveComponent.h"
#include "PhysicsEngine/PhysicsSettings.h"

void AHighSpeedProjectile::BeginPlay() {
    Super::BeginPlay();

    UPrimitiveComponent* PrimComp = Cast<UPrimitiveComponent>(GetRootComponent());
    if (PrimComp) {
        PrimComp->SetContinuousCollisionDetection(true);
        PrimComp->SetPhysicsLinearVelocity(GetActorForwardVector() * 5000.0f);
    }
}`,
      explanation:
        'CCD ร่วมกับ Substepping ใน Unreal Engine ช่วยตรวจจับการชนตลอดเส้นทางการเคลื่อนที่ (Sweep) ป้องกันวัตถุกระโดดข้ามกำแพง',
      testCaseDescription: 'ทดสอบกระสุนความเร็ว 5,000 units/s ยิงใส่กำแพงบาง 5 units -> ไม่ทะลุกำแพง'
    }
  },

  'draw-calls-batching': {
    pureLogic: {
      id: 'draw-pure',
      type: 'pure',
      title: 'การแพ็กข้อมูล Instance Buffer สำหรับ GPU Instancing (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Medium',
      description:
        'เติมโค้ดฟังก์ชันจัดเตรียม Buffer ข้อมูลการแปลงพิกัด (X, Y, Rotation, Scale) ของวัตถุนับพันชิ้นลงใน `Float32Array` เพื่อส่งให้ GPU ใน 1 Draw Call',
      conceptNotes:
        '1 Instance ประกอบด้วย 4 Floats: [X, Y, Rotation, Scale]. Buffer ขนาดรวมทั้งหมดคือจำนวนวัตถุ * 4 floats',
      starterCode: `function packInstanceBuffer(
  objects: Array<{ x: number; y: number; rot: number; scale: number }>,
  targetBuffer: Float32Array
): number {
  const count = objects.length;
  
  for (let i = 0; i < count; i++) {
    const obj = objects[i];
    // 1. ดัชนีเริ่มต้นในบัฟเฟอร์ (4 ค่าต่อ 1 วัตถุ)
    const offset = ___BLANK_1___;

    // 2. เขียนข้อมูลลงในบัฟเฟอร์แบบเรียงติดกัน
    targetBuffer[offset + 0] = obj.x;
    targetBuffer[offset + 1] = obj.y;
    targetBuffer[offset + 2] = ___BLANK_2___;
    targetBuffer[offset + 3] = ___BLANK_3___;
  }

  return count; // จำนวน instances ทั้งหมดใน 1 Draw Call
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (Offset ใน Instance Buffer)',
          expected: 'i * 4',
          acceptedAlternatives: ['i * 4', 'i*4', 'i << 2'],
          hint: 'แต่ละ Instance มีข้อมูล 4 ตัว (X, Y, Rot, Scale) ดังนั้น offset คือ i * 4',
          options: ['i * 4', 'i', 'i * 2', 'i * 16']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ค่ามุมหมุน Rotation)',
          expected: 'obj.rot',
          acceptedAlternatives: ['obj.rot', 'obj.rotation'],
          hint: 'หยิบค่า obj.rot มาใส่ลงที่ offset + 2',
          options: ['obj.rot', 'obj.x', 'obj.scale', '0']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ค่าขนาด Scale)',
          expected: 'obj.scale',
          acceptedAlternatives: ['obj.scale'],
          hint: 'หยิบค่า obj.scale มาใส่ลงที่ offset + 3',
          options: ['obj.scale', 'obj.y', '1', 'obj.rot']
        }
      ],
      fullSolution: `function packInstanceBuffer(
  objects: Array<{ x: number; y: number; rot: number; scale: number }>,
  targetBuffer: Float32Array
): number {
  const count = objects.length;
  for (let i = 0; i < count; i++) {
    const obj = objects[i];
    const offset = i * 4;
    targetBuffer[offset + 0] = obj.x;
    targetBuffer[offset + 1] = obj.y;
    targetBuffer[offset + 2] = obj.rot;
    targetBuffer[offset + 3] = obj.scale;
  }
  return count;
}`,
      explanation:
        'GPU สามารถอ่าน StructuredBuffer นี้ผ่าน Vertex Shader โดยใช้ gl_InstanceID หรือ SV_InstanceID เพื่อแปลงพิกัดของแต่ละชิ้นได้พร้อมกันนับหมื่นชิ้น',
      testCaseDescription: 'ทดสอบแพ็ก 5,000 ชิ้น -> ได้บัฟเฟอร์ขนาด 20,000 floats พร้อมส่งให้ GPU ในคำสั่งเดียว'
    },

    unity: {
      id: 'draw-unity',
      type: 'unity',
      title: 'การใช้งาน Graphics.RenderMeshInstanced ใน Unity (C#)',
      language: 'csharp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดสั่งเรนเดอร์ Mesh นับพันชิ้นพร้อมกันด้วย GPU Instancing ผ่าน `Graphics.RenderMeshInstanced`',
      conceptNotes:
        'Unity RenderMeshInstanced รับ RenderParams, Mesh, submeshIndex, Matrix4x4[] และ instanceCount',
      starterCode: `using UnityEngine;

public class AsteroidInstancedRenderer : MonoBehaviour {
    [SerializeField] private Mesh asteroidMesh;
    [SerializeField] private Material asteroidMaterial;
    
    private Matrix4x4[] matrices = new Matrix4x4[1000];
    private RenderParams renderParams;

    void Start() {
        // 1. ตั้งค่า Material พร้อมเปิดใช้ Instancing
        renderParams = new RenderParams(___BLANK_1___);
    }

    void Update() {
        // 2. เรียกคำสั่งวาดอุกกาบาตทั้งหมด 1,000 ก้อนใน 1 Draw Call
        Graphics.___BLANK_2___(
            renderParams,
            asteroidMesh,
            0,
            matrices,
            ___BLANK_3___ // จำนวน Instances ที่ต้องการวาด
        );
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ส่ง Material ให้ RenderParams)',
          expected: 'asteroidMaterial',
          acceptedAlternatives: ['asteroidMaterial', 'this.asteroidMaterial'],
          hint: 'ส่ง asteroidMaterial ที่รองรับ GPU Instancing เข้าไปใน RenderParams',
          options: ['asteroidMaterial', 'null', 'asteroidMesh', 'new Material()']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เมธอด GPU Instancing ของ Graphics)',
          expected: 'RenderMeshInstanced',
          acceptedAlternatives: ['RenderMeshInstanced', 'DrawMeshInstanced'],
          hint: 'เมธอดใน Unity Graphics API สำหรับวาด Instanced Mesh คือ RenderMeshInstanced',
          options: ['RenderMeshInstanced', 'DrawMesh', 'DrawMeshNow', 'Blit']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ส่งจำนวนวัตถุทั้งหมด)',
          expected: 'matrices.Length',
          acceptedAlternatives: ['matrices.Length', '1000', 'matrices.Length;'],
          hint: 'ส่งจำนวนขนาดอาเรย์ matrices.Length',
          options: ['matrices.Length', '1', '100', '0']
        }
      ],
      fullSolution: `using UnityEngine;

public class AsteroidInstancedRenderer : MonoBehaviour {
    [SerializeField] private Mesh asteroidMesh;
    [SerializeField] private Material asteroidMaterial;
    
    private Matrix4x4[] matrices = new Matrix4x4[1000];
    private RenderParams renderParams;

    void Start() {
        renderParams = new RenderParams(asteroidMaterial);
    }

    void Update() {
        Graphics.RenderMeshInstanced(
            renderParams,
            asteroidMesh,
            0,
            matrices,
            matrices.Length
        );
    }
}`,
      explanation:
        'ลดภาระการส่งคำสั่งของ CPU Graphics Driver จาก 1,000 ครั้งต่อเฟรม เหลือเพียงคำสั่งเดียว ส่งผลให้ CPU ว่างไปประมวลผลเกมเพลย์',
      testCaseDescription: 'ทดสอบเรนเดอร์ 1,000 ชิ้น -> Draw Calls ลดจาก 1,000 เหลือ 1 Call'
    },

    unreal: {
      id: 'draw-unreal',
      type: 'unreal',
      title: 'การเพิ่ม Instance ใน HISM ใน Unreal Engine (C++)',
      language: 'cpp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดการเพิ่มชิ้นส่วนต้นไม้หรือหินลงใน `UHierarchicalInstancedStaticMeshComponent` (HISM) ใน UE5',
      conceptNotes:
        'HISM รองรับการทำ Hierarchical Culling และ LOD Management พร้อม Render ใน Batch เดียวกัน',
      starterCode: `#include "Components/HierarchicalInstancedStaticMeshComponent.h"

void AForestGenerator::SpawnTrees(UHierarchicalInstancedStaticMeshComponent* HISMComp, const TArray<FVector>& Positions) {
    if (!HISMComp) return;

    for (const FVector& Pos : Positions) {
        // 1. สร้าง FTransform จากตำแหน่งที่กำหนด
        FTransform TreeTransform;
        TreeTransform.SetLocation(Pos);
        TreeTransform.SetScale3D(FVector(1.0f));

        // 2. เพิ่ม Instance เข้าสู่ HISM Component
        HISMComp->___BLANK_1___(TreeTransform);
    }

    // 3. สั่งคำนวณโครงสร้าง Bounds และ LOD ใหม่
    HISMComp->___BLANK_2___();
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เมธอดเพิ่ม Instance)',
          expected: 'AddInstance',
          acceptedAlternatives: ['AddInstance', 'AddInstance(TreeTransform)'],
          hint: 'เมธอดใน HISM สำหรับเพิ่มชิ้นส่วนตัวใหม่คือ AddInstance',
          options: ['AddInstance', 'SpawnActor', 'CreateComponent', 'AttachToComponent']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (สั่งอัปเดตโครงสร้างต้นไม้)',
          expected: 'BuildTreeIfOutdated',
          acceptedAlternatives: ['BuildTreeIfOutdated', 'BuildTreeIfOutdated(true, false)', 'MarkRenderStateDirty'],
          hint: 'เมธอดใน HISM สำหรับสร้างโครงสร้าง BVH Tree ใหม่คือ BuildTreeIfOutdated',
          options: ['BuildTreeIfOutdated', 'UpdateComponent', 'RebuildPhysics', 'TickComponent']
        }
      ],
      fullSolution: `#include "Components/HierarchicalInstancedStaticMeshComponent.h"

void AForestGenerator::SpawnTrees(UHierarchicalInstancedStaticMeshComponent* HISMComp, const TArray<FVector>& Positions) {
    if (!HISMComp) return;

    for (const FVector& Pos : Positions) {
        FTransform TreeTransform;
        TreeTransform.SetLocation(Pos);
        TreeTransform.SetScale3D(FVector(1.0f));

        HISMComp->AddInstance(TreeTransform);
    }

    HISMComp->BuildTreeIfOutdated(true, false);
}`,
      explanation:
        'HISM ใน Unreal Engine ช่วยให้สามารถสร้างป่าไม้ที่มีต้นไม้นับหมื่นต้นบนจอได้โดยที่ Draw Calls ไม่บานปลาย',
      testCaseDescription: 'ทดสอบวางต้นไม้ 5,000 ต้น -> เรนเดอร์ลื่นไหล 120 FPS'
    }
  },

  'pathfinding-algorithms': {
    pureLogic: {
      id: 'path-pure',
      type: 'pure',
      title: 'สูตรประเมิน A* f(n) = g(n) + h(n) Manhattan Distance (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Easy',
      description:
        'เติมโค้ดฟังก์ชันคำนวณค่าคะแนนรวม $f(n)$ ของโหนดในอัลกอริทึม A* โดยใช้ Manhattan Distance Heuristic สำหรับการเดิน 4 ทิศทางบนกริด',
      conceptNotes:
        'f = g + h โดย g คือต้นทุนจริงที่เดินผ่านมา และ h คือการประมาณระยะทางแบบแมนฮัตตัน |currX - targetX| + |currY - targetY|',
      starterCode: `function calculateAStarScore(
  currX: number,
  currY: number,
  targetX: number,
  targetY: number,
  gCost: number
): { g: number; h: number; f: number } {
  // 1. คำนวณระยะทางแบบ Manhattan Heuristic (ผลรวมระยะทางตามแกน X และ Y)
  const hCost = ___BLANK_1___ + ___BLANK_2___;

  // 2. คำนวณผลรวมคะแนน f = g + h
  const fCost = ___BLANK_3___;

  return { g: gCost, h: hCost, f: fCost };
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ระยะห่างแกน X)',
          expected: 'Math.abs(currX - targetX)',
          acceptedAlternatives: ['Math.abs(currX - targetX)', 'Math.abs(targetX - currX)'],
          hint: 'ผลต่างสัมบูรณ์ของพิกัดแกน X ใช้ Math.abs(currX - targetX)',
          options: ['Math.abs(currX - targetX)', 'currX - targetX', 'Math.sqrt(currX)', 'targetX - currX']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ระยะห่างแกน Y)',
          expected: 'Math.abs(currY - targetY)',
          acceptedAlternatives: ['Math.abs(currY - targetY)', 'Math.abs(targetY - currY)'],
          hint: 'ผลต่างสัมบูรณ์ของพิกัดแกน Y ใช้ Math.abs(currY - targetY)',
          options: ['Math.abs(currY - targetY)', 'currY - targetY', 'Math.pow(currY, 2)', 'targetY']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (สูตรคะแนน f = g + h)',
          expected: 'gCost + hCost',
          acceptedAlternatives: ['gCost + hCost', 'hCost + gCost'],
          hint: 'คะแนนประเมิน A* คือ gCost บวกกับ hCost',
          options: ['gCost + hCost', 'gCost * hCost', 'hCost - gCost', 'gCost']
        }
      ],
      fullSolution: `function calculateAStarScore(
  currX: number,
  currY: number,
  targetX: number,
  targetY: number,
  gCost: number
): { g: number; h: number; f: number } {
  const hCost = Math.abs(currX - targetX) + Math.abs(currY - targetY);
  const fCost = gCost + hCost;
  return { g: gCost, h: hCost, f: fCost };
}`,
      explanation:
        'เพราะ Manhattan Heuristic มีคุณสมบัติ Admissible (ไม่ประเมินค่าเกินจริง) จึงการันตีว่าจะได้เส้นทางที่สั้นที่สุดเสมอ',
      testCaseDescription: 'ทดสอบโหนด (2, 3) ไปยัง (10, 8) โดย g=5 -> h=13 -> f=18'
    },

    unity: {
      id: 'path-unity',
      type: 'unity',
      title: 'การค้นหาเส้นทางด้วย NavMeshQuery ใน Unity (C#)',
      language: 'csharp',
      difficulty: 'Medium',
      description:
        'เติมโค้ดคำนวณเส้นทางเดินแบบอะซิงโครนัสผ่าน `NavMesh.CalculatePath` เพื่อไม่ให้บล็อก Main Thread ในเฟรมเรต',
      conceptNotes:
        'NavMesh.CalculatePath รับพิกัดเริ่มต้น, สิ้นสุด, NavMesh.AllAreas และตัวแปร NavMeshPath',
      starterCode: `using UnityEngine;
using UnityEngine.AI;

public class UnitPathfinder : MonoBehaviour {
    private NavMeshPath calculatedPath;

    void Awake() {
        calculatedPath = new NavMeshPath();
    }

    public bool TryFindPath(Vector3 targetPosition) {
        // 1. เรียกคำสั่งคำนวณเส้นทาง NavMesh
        bool hasPath = ___BLANK_1___(
            transform.position,
            targetPosition,
            ___BLANK_2___, // ค่า Flag พื้นที่ที่เดินได้ทั้งหมด
            calculatedPath
        );

        // 2. ตรวจสอบว่าเส้นทางสมบูรณ์หรือไม่ (ไม่ตัน)
        return hasPath && calculatedPath.status == ___BLANK_3___;
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เมธอดคำนวณเส้นทาง NavMesh)',
          expected: 'NavMesh.CalculatePath',
          acceptedAlternatives: ['NavMesh.CalculatePath', 'NavMesh.CalculatePath;'],
          hint: 'ใช้คลาส NavMesh และเมธอด CalculatePath',
          options: ['NavMesh.CalculatePath', 'NavMesh.FindClosestEdge', 'NavMesh.SamplePosition', 'Physics.Raycast']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (พื้นที่ NavMesh ที่เดินได้ทั้งหมด)',
          expected: 'NavMesh.AllAreas',
          acceptedAlternatives: ['NavMesh.AllAreas', 'NavMesh.AllAreas;'],
          hint: 'ค่าคงที่สำหรับทุก Area บน NavMesh คือ NavMesh.AllAreas',
          options: ['NavMesh.AllAreas', '1', 'NavMesh.Walkable', '0']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (สถานะเส้นทางที่สมบูรณ์)',
          expected: 'NavMeshPathStatus.PathComplete',
          acceptedAlternatives: ['NavMeshPathStatus.PathComplete', 'PathComplete'],
          hint: 'สถานะที่เส้นทางไม่ถูกบล็อกคือ NavMeshPathStatus.PathComplete',
          options: ['NavMeshPathStatus.PathComplete', 'NavMeshPathStatus.PathPartial', 'NavMeshPathStatus.PathInvalid', 'true']
        }
      ],
      fullSolution: `using UnityEngine;
using UnityEngine.AI;

public class UnitPathfinder : MonoBehaviour {
    private NavMeshPath calculatedPath;

    void Awake() {
        calculatedPath = new NavMeshPath();
    }

    public bool TryFindPath(Vector3 targetPosition) {
        bool hasPath = NavMesh.CalculatePath(
            transform.position,
            targetPosition,
            NavMesh.AllAreas,
            calculatedPath
        );

        return hasPath && calculatedPath.status == NavMeshPathStatus.PathComplete;
    }
}`,
      explanation:
        'การตรวจสอบ PathComplete ช่วยป้องกันยูนิตเดินชนกำแพงตันและยืนค้าง',
      testCaseDescription: 'ทดสอบหาทางเดินข้ามสิ่งกีดขวาง -> ได้ Waypoint Corners ส่งต่อให้ NavMeshAgent เดินตาม'
    },

    unreal: {
      id: 'path-unreal',
      type: 'unreal',
      title: 'การค้นหา NavMesh Path แบบ Synchronous ใน Unreal Engine (C++)',
      language: 'cpp',
      difficulty: 'Hard',
      description:
        'เติมโค้ดคำนวณเส้นทางเดินของ AI ผ่าน `UNavigationSystemV1::FindPathToLocationSynchronously`',
      conceptNotes:
        'UNavigationSystemV1 เป็นคลาสหลักของระบบ Navigation ใน UE5',
      starterCode: `#include "NavigationSystem.h"
#include "NavigationPath.h"

UNavigationPath* AAIEscapeController::GetEscapeRoute(const FVector& StartPos, const FVector& GoalPos) {
    UWorld* World = GetWorld();
    if (!World) return nullptr;

    // 1. เรียกใช้งาน Navigation System ประจำ World
    UNavigationSystemV1* NavSys = ___BLANK_1___(World);
    if (!NavSys) return nullptr;

    // 2. คำนวณเส้นทางเดินแบบ Synchronous
    UNavigationPath* NavPath = NavSys->___BLANK_2___(
        World,
        StartPos,
        GoalPos,
        this
    );

    return (NavPath && NavPath->___BLANK_3___()) ? NavPath : nullptr;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึง Navigation System ประจำ World)',
          expected: 'FNavigationSystem::GetCurrent<UNavigationSystemV1>',
          acceptedAlternatives: ['FNavigationSystem::GetCurrent<UNavigationSystemV1>', 'UNavigationSystemV1::GetCurrent(World)'],
          hint: 'ใช้ FNavigationSystem::GetCurrent<UNavigationSystemV1>(World)',
          options: ['FNavigationSystem::GetCurrent<UNavigationSystemV1>', 'UNavigationSystemV1::GetNavSys', 'GetWorld()->GetNav', 'new UNavigationSystemV1()']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เมธอดค้นหาเส้นทาง Synchronously)',
          expected: 'FindPathToLocationSynchronously',
          acceptedAlternatives: ['FindPathToLocationSynchronously', 'FindPathToLocationSynchronously;'],
          hint: 'เมธอดใน NavSys คือ FindPathToLocationSynchronously',
          options: ['FindPathToLocationSynchronously', 'FindPathAsync', 'TestPath', 'GetRandomPoint']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ตรวจสอบความถูกต้องของ Path)',
          expected: 'IsValid',
          acceptedAlternatives: ['IsValid', 'IsValid()'],
          hint: 'ตรวจสอบว่า NavPath ไม่ว่างและถูกต้องด้วย IsValid()',
          options: ['IsValid', 'IsReady', 'HasPoints', 'IsComplete']
        }
      ],
      fullSolution: `#include "NavigationSystem.h"
#include "NavigationPath.h"

UNavigationPath* AAIEscapeController::GetEscapeRoute(const FVector& StartPos, const FVector& GoalPos) {
    UWorld* World = GetWorld();
    if (!World) return nullptr;

    UNavigationSystemV1* NavSys = FNavigationSystem::GetCurrent<UNavigationSystemV1>(World);
    if (!NavSys) return nullptr;

    UNavigationPath* NavPath = NavSys->FindPathToLocationSynchronously(
        World,
        StartPos,
        GoalPos,
        this
    );

    return (NavPath && NavPath->IsValid()) ? NavPath : nullptr;
}`,
      explanation:
        'Unreal Recast NavMesh จะคำนวณ A* ผ่าน Convex Polygons และคืนค่าเป็นจุด Waypoints (PathPoints)',
      testCaseDescription: 'ทดสอบศัตรูหาทางหนีไปยังจุดปลอดภัย -> ได้เส้นทางถูกต้องพร้อมเดินหลบมุมตึก'
    }
  },

  'game-ai-fsm-bt': {
    pureLogic: {
      id: 'ai-pure',
      type: 'pure',
      title: 'สร้าง Selector Node และ Sequence Node ของ Behavior Tree (LeetCode Style)',
      language: 'typescript',
      difficulty: 'Medium',
      description:
        'เติมโค้ดตรรกะการประเมินผลของ `SelectorNode` (เปรียบเสมือน OR - หยุดทันทีเมื่อเจอตัวแรกที่ได้ SUCCESS) และ `SequenceNode` (เปรียบเสมือน AND)',
      conceptNotes:
        'Selector: ลองทำลูกทีละตัว ถ้าได้ SUCCESS ให้คืน SUCCESS ทันที ถ้าทุกตัว FAIL ถึงจะคืน FAIL | Sequence: ทำลูกเรียงกัน ถ้าตัวใด FAIL ให้คืน FAIL ทันที',
      starterCode: `type NodeStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

interface BTNode {
  tick(): NodeStatus;
}

// 1. Selector Node (Fallback / OR Logic)
class SelectorNode implements BTNode {
  constructor(private children: BTNode[]) {}

  public tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      // ถ้าลูกทำงานสำเร็จ ให้ส่ง SUCCESS ทันทีโดยไม่ต้องลองตัวถัดไป
      if (status === ___BLANK_1___) {
        return 'SUCCESS';
      }
      if (status === 'RUNNING') return 'RUNNING';
    }
    return ___BLANK_2___; // ถ้าลูกทุกตัวล้มเหลว
  }
}

// 2. Sequence Node (Order / AND Logic)
class SequenceNode implements BTNode {
  constructor(private children: BTNode[]) {}

  public tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      // ถ้าตัวใดล้มเหลว ให้หยุดทันที
      if (status === ___BLANK_3___) {
        return 'FAILURE';
      }
      if (status === 'RUNNING') return 'RUNNING';
    }
    return 'SUCCESS'; // ผ่านทุกตัวฉลุย
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (Selector สำเร็จเมื่อเจอกิ่งแรกที่สำเร็จ)',
          expected: "'SUCCESS'",
          acceptedAlternatives: ["'SUCCESS'", '"SUCCESS"', 'SUCCESS'],
          hint: 'ถ้า status เท่ากับสถานะความสำเร็จ "SUCCESS"',
          options: ["'SUCCESS'", "'FAILURE'", "'RUNNING'", "'ABORT'"]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (Selector คืนค่าเมื่อลูกทุกล้มเหลว)',
          expected: "'FAILURE'",
          acceptedAlternatives: ["'FAILURE'", '"FAILURE"', 'FAILURE'],
          hint: 'หากลองทุกลูกแล้วไม่มีตัวใดสำเร็จ ให้คืนค่า "FAILURE"',
          options: ["'FAILURE'", "'SUCCESS'", "'RUNNING'", "'NONE'"]
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (Sequence ล้มเหลวเมื่อมีตัวใดตัวหนึ่งล้มเหลว)',
          expected: "'FAILURE'",
          acceptedAlternatives: ["'FAILURE'", '"FAILURE"', 'FAILURE'],
          hint: 'สำหรับ Sequence หากกิ่งใดล้มเหลว "FAILURE" ลำดับทั้งหมดจะหยุดทันที',
          options: ["'FAILURE'", "'SUCCESS'", "'RUNNING'", "'WAIT'"]
        }
      ],
      fullSolution: `type NodeStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

interface BTNode {
  tick(): NodeStatus;
}

class SelectorNode implements BTNode {
  constructor(private children: BTNode[]) {}

  public tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      if (status === 'SUCCESS') {
        return 'SUCCESS';
      }
      if (status === 'RUNNING') return 'RUNNING';
    }
    return 'FAILURE';
  }
}

class SequenceNode implements BTNode {
  constructor(private children: BTNode[]) {}

  public tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      if (status === 'FAILURE') {
        return 'FAILURE';
      }
      if (status === 'RUNNING') return 'RUNNING';
    }
    return 'SUCCESS';
  }
}`,
      explanation:
        'โครงสร้างนี้ทำให้ระบบ AI สามารถจัดลำดับความสำคัญ (Priority) ได้อย่างยืดหยุ่น เช่น วางกิ่ง "หนีเมื่อเลือดต่ำ" ไว้เป็นลูกคนแรกของ Selector เพื่อให้ทำก่อนเสมอ',
      testCaseDescription: 'ทดสอบ Selector: กิ่ง 1 FAIL -> กิ่ง 2 SUCCESS -> ผลรวมคืนค่า SUCCESS ทันทีโดยไม่ต้องรันกิ่ง 3'
    },

    unity: {
      id: 'ai-unity',
      type: 'unity',
      title: 'การสร้าง Custom Action Node ใน Unity Behavior Tree (C#)',
      language: 'csharp',
      difficulty: 'Medium',
      description:
        'เติมโค้ด `PatrolActionNode` ที่อ่านและเขียนค่าตำแหน่งเป้าหมายผ่าน Blackboard ส่วนกลางใน Unity',
      conceptNotes:
        'Blackboard เป็น Dictionary กลางที่ใช้เก็บข้อมูลเป้าหมายหรือสถานะเพื่อตัดความผูกติด (Decoupling) ระหว่าง Nodes',
      starterCode: `using UnityEngine;

public enum NodeState { SUCCESS, FAILURE, RUNNING }

public class PatrolActionNode {
    private readonly Transform guardTransform;
    private readonly Vector3[] waypoints;
    private int currentWaypointIndex = 0;

    public PatrolActionNode(Transform guard, Vector3[] points) {
        this.guardTransform = guard;
        this.waypoints = points;
    }

    public NodeState Evaluate(float dt) {
        Vector3 target = waypoints[currentWaypointIndex];
        float distance = Vector3.Distance(guardTransform.position, target);

        // 1. ถ้าเดินถึง Waypoint แล้ว ให้สลับไปยังจุดถัดไป
        if (distance < 0.5f) {
            currentWaypointIndex = ___BLANK_1___;
            return ___BLANK_2___; // พฤติกรรมสำเร็จในรอบนี้
        }

        // 2. ถ้ายังเดินไม่ถึง ให้ขยับตัวเข้าหาเป้าหมาย
        guardTransform.position = Vector3.MoveTowards(guardTransform.position, target, 3.0f * dt);
        return ___BLANK_3___; // กำลังเดินทางอยู่
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (วนรอบดัชนี Waypoints)',
          expected: '(currentWaypointIndex + 1) % waypoints.Length',
          acceptedAlternatives: ['(currentWaypointIndex + 1) % waypoints.Length', '(currentWaypointIndex + 1) % waypoints.Length;'],
          hint: 'ใช้ตัวดำเนินการ Modulo (%) เพื่อวนกลับมาที่ 0 เมื่อถึงจุดสุดท้าย: (currentWaypointIndex + 1) % waypoints.Length',
          options: ['(currentWaypointIndex + 1) % waypoints.Length', 'currentWaypointIndex + 1', '0', 'waypoints.Length - 1']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (สถานะสำเร็จ)',
          expected: 'NodeState.SUCCESS',
          acceptedAlternatives: ['NodeState.SUCCESS', 'SUCCESS'],
          hint: 'เมื่อถึงเป้าหมายแล้ว ให้ส่ง NodeState.SUCCESS',
          options: ['NodeState.SUCCESS', 'NodeState.RUNNING', 'NodeState.FAILURE', 'null']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (สถานะกำลังดำเนินการ)',
          expected: 'NodeState.RUNNING',
          acceptedAlternatives: ['NodeState.RUNNING', 'RUNNING'],
          hint: 'ระหว่างกำลังก้าวเดิน ให้ส่ง NodeState.RUNNING',
          options: ['NodeState.RUNNING', 'NodeState.SUCCESS', 'NodeState.FAILURE', 'true']
        }
      ],
      fullSolution: `using UnityEngine;

public enum NodeState { SUCCESS, FAILURE, RUNNING }

public class PatrolActionNode {
    private readonly Transform guardTransform;
    private readonly Vector3[] waypoints;
    private int currentWaypointIndex = 0;

    public PatrolActionNode(Transform guard, Vector3[] points) {
        this.guardTransform = guard;
        this.waypoints = points;
    }

    public NodeState Evaluate(float dt) {
        Vector3 target = waypoints[currentWaypointIndex];
        float distance = Vector3.Distance(guardTransform.position, target);

        if (distance < 0.5f) {
            currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
            return NodeState.SUCCESS;
        }

        guardTransform.position = Vector3.MoveTowards(guardTransform.position, target, 3.0f * dt);
        return NodeState.RUNNING;
    }
}`,
      explanation:
        'สถานะ RUNNING เป็นจุดเด่นสำคัญของ Behavior Tree ที่ทำให้ Action ที่ต้องใช้เวลา เช่น การเดินหรือชาร์จพลัง ไม่ทำให้เกมค้าง',
      testCaseDescription: 'ทดสอบระยะห่าง 5.0m -> คืน RUNNING -> เดินจนถึงระยะ 0.2m -> เปลี่ยน Index และคืน SUCCESS'
    },

    unreal: {
      id: 'ai-unreal',
      type: 'unreal',
      title: 'การเขียน UBTTaskNode และอ่าน Blackboard ใน Unreal Engine (C++)',
      language: 'cpp',
      difficulty: 'Hard',
      description:
        'เติมโค้ด `UBTTask_AttackTarget` ใน Unreal Engine C++ โดยอ่านพิกัดเป้าหมายจาก `UBlackboardComponent` และส่ง `EBTNodeResult::Succeeded`',
      conceptNotes:
        'UBTTaskNode โอเวอร์ไรด์ ExecuteTask และดึง Blackboard ผ่าน OwnerComp.GetBlackboardComponent()',
      starterCode: `#include "BehaviorTree/BTTaskNode.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "BTTask_AttackTarget.h"

EBTNodeResult::Type UBTTask_AttackTarget::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) {
    // 1. ดึง Blackboard Component ของ AI Controller
    UBlackboardComponent* BlackboardComp = OwnerComp.___BLANK_1___();
    if (!BlackboardComp) return EBTNodeResult::Failed;

    // 2. ดึง Actor เป้าหมายจาก Blackboard Key
    UObject* TargetObject = BlackboardComp->___BLANK_2___("TargetEnemy");
    AActor* TargetActor = Cast<AActor>(TargetObject);

    if (!TargetActor) {
        return EBTNodeResult::Failed; // ไม่มีเป้าหมายให้โจมตี
    }

    // 3. สั่งให้ AI ทำการโจมตี และส่งสัญญาณความสำเร็จ
    // PerformAttack(TargetActor);
    return EBTNodeResult::___BLANK_3___;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึง Blackboard Component)',
          expected: 'GetBlackboardComponent',
          acceptedAlternatives: ['GetBlackboardComponent', 'GetBlackboardComponent()'],
          hint: 'เมธอดใน OwnerComp คือ GetBlackboardComponent()',
          options: ['GetBlackboardComponent', 'GetBlackboard', 'FindComponent', 'GetBrainComponent']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (อ่าน Object จาก Blackboard Key Name)',
          expected: 'GetValueAsObject',
          acceptedAlternatives: ['GetValueAsObject', 'GetValueAsObject;'],
          hint: 'เมธอดใน BlackboardComponent สำหรับอ่านค่า UObject คือ GetValueAsObject',
          options: ['GetValueAsObject', 'GetValueAsActor', 'GetObject', 'GetKeyValue']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ผลลัพธ์สำเร็จของ Task Node)',
          expected: 'Succeeded',
          acceptedAlternatives: ['Succeeded', 'EBTNodeResult::Succeeded'],
          hint: 'Enum ค่าผลลัพธ์สำเร็จใน EBTNodeResult คือ Succeeded',
          options: ['Succeeded', 'Failed', 'InProgress', 'Aborted']
        }
      ],
      fullSolution: `#include "BehaviorTree/BTTaskNode.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "BTTask_AttackTarget.h"

EBTNodeResult::Type UBTTask_AttackTarget::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) {
    UBlackboardComponent* BlackboardComp = OwnerComp.GetBlackboardComponent();
    if (!BlackboardComp) return EBTNodeResult::Failed;

    UObject* TargetObject = BlackboardComp->GetValueAsObject("TargetEnemy");
    AActor* TargetActor = Cast<AActor>(TargetObject);

    if (!TargetActor) {
        return EBTNodeResult::Failed;
    }

    // PerformAttack(TargetActor);
    return EBTNodeResult::Succeeded;
}`,
      explanation:
        'ใน Unreal Engine การแยก Data ไว้ใน Blackboard ทำให้ AI หลายตัวสามารถแชร์โครงสร้าง Behavior Tree ร่วมกันได้โดยข้อมูลเป้าหมายไม่ปนกัน',
      testCaseDescription: 'ทดสอบมี TargetEnemy ใน Blackboard -> โจมตีสำเร็จและคืนค่า Succeeded'
    }
  },

  'frustum-culling': {
    pureLogic: {
      id: 'frustum-pure',
      type: 'pure',
      title: 'ตรวจสอบ AABB Bounding Box กับ Frustum Planes (Pure Logic)',
      language: 'typescript',
      difficulty: 'Medium',
      description: 'เติมโค้ดฟังก์ชัน `isBoxInFrustum` เพื่อทดสอบว่ากล่องสี่เหลี่ยม AABB อยู่ภายใน Frustum Planes ของกล้องหรือไม่ โดยใช้จุด Positive Vertex (P-Vertex) ร่วมกับ Dot Product',
      conceptNotes: 'สำหรับแต่ละระนาบ (Plane) ของ Frustum หาจุดมุมของ AABB ที่พุ่งไปในทิศทางเดียวกับ Normal ของระนาบมากที่สุด (P-Vertex) หากระยะทางมีค่าน้อยกว่า 0 แสดงว่ากล่องอยู่นอกระนาบทั้งหมด ให้ Culled ทันที',
      starterCode: `interface Vec3 { x: number; y: number; z: number; }
interface Plane { normal: Vec3; distance: number; }
interface AABB { min: Vec3; max: Vec3; }

function isBoxInFrustum(planes: Plane[], box: AABB): boolean {
  for (const plane of planes) {
    // หาจุด P-Vertex ที่หันไปตามระนาบมากที่สุด
    const pVertex: Vec3 = {
      x: plane.normal.x >= 0 ? box.max.x : box.min.x,
      y: plane.normal.y >= 0 ? box.max.y : box.min.y,
      z: plane.normal.z >= 0 ? box.max.z : box.min.z,
    };

    // 1. คำนวณ Signed Distance จากระนาบถึงจุด P-Vertex
    const signedDist = ___BLANK_1___;

    // 2. ถ้าจุดที่หันไปตามระนาบมากที่สุดยังอยู่ข้างนอก แสดงว่ากล่องอยู่นอก Frustum ทั้งหมด
    if (___BLANK_2___) {
      return false; // Culled ออกจากรอบการวาด
    }
  }

  // 3. ผ่านการทดสอบครบทุกระนาบ แสดงว่ามองเห็นได้
  return ___BLANK_3___;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (คำนวณ Signed Distance)',
          expected: 'plane.normal.x * pVertex.x + plane.normal.y * pVertex.y + plane.normal.z * pVertex.z + plane.distance',
          acceptedAlternatives: [
            'plane.normal.x * pVertex.x + plane.normal.y * pVertex.y + plane.normal.z * pVertex.z + plane.distance',
            '(plane.normal.x * pVertex.x + plane.normal.y * pVertex.y + plane.normal.z * pVertex.z) + plane.distance'
          ],
          hint: 'สูตรระนาบ: Normal · P + Distance',
          options: [
            'plane.normal.x * pVertex.x + plane.normal.y * pVertex.y + plane.normal.z * pVertex.z + plane.distance',
            'box.max.x - box.min.x',
            'plane.distance - pVertex.x',
            'Math.hypot(pVertex.x, pVertex.y, pVertex.z)'
          ]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เงื่อนไขการ Culled หลุดขอบระนาบ)',
          expected: 'signedDist < 0',
          acceptedAlternatives: ['signedDist < 0', 'signedDist <= 0'],
          hint: 'เมื่อระยะทางเป็นลบ (ติดลบ) หมายถึงอยู่นอกด้านหน้าของระนาบ Frustum',
          options: ['signedDist < 0', 'signedDist > 0', 'signedDist === 0', 'signedDist >= 100']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ผลลัพธ์เมื่อผ่านทุกระนาบ)',
          expected: 'true',
          acceptedAlternatives: ['true'],
          hint: 'คืนค่า true เมื่อ AABB อยู่ใน Frustum และสมควรส่งไปเรนเดอร์',
          options: ['true', 'false', 'null', 'undefined']
        }
      ],
      fullSolution: `interface Vec3 { x: number; y: number; z: number; }
interface Plane { normal: Vec3; distance: number; }
interface AABB { min: Vec3; max: Vec3; }

function isBoxInFrustum(planes: Plane[], box: AABB): boolean {
  for (const plane of planes) {
    const pVertex: Vec3 = {
      x: plane.normal.x >= 0 ? box.max.x : box.min.x,
      y: plane.normal.y >= 0 ? box.max.y : box.min.y,
      z: plane.normal.z >= 0 ? box.max.z : box.min.z,
    };

    const signedDist = plane.normal.x * pVertex.x + plane.normal.y * pVertex.y + plane.normal.z * pVertex.z + plane.distance;

    if (signedDist < 0) {
      return false;
    }
  }

  return true;
}`,
      explanation: 'การทดสอบ AABB กับ 6 Frustum Planes ด้วยจุด P-Vertex เป็นอัลกอริทึมมาตรฐานที่เร็วระดับไมโครวินาที ช่วยคัดกรองวัตถุนอกจอออกก่อนส่งคำสั่งวาดไปยังไดรเวอร์ GPU',
      testCaseDescription: 'ทดสอบกล่องที่อยู่นอกจอ -> คืนค่า false, วัตถุที่อยู่หน้ากล้อง -> คืนค่า true'
    },
    unity: {
      id: 'frustum-unity',
      type: 'unity',
      title: 'ใช้ Unity CullingGroup API เพื่อเปิด/ปิด Component ตามมุมกล้อง',
      language: 'csharp',
      difficulty: 'Medium',
      description: 'กำหนดค่า `CullingGroup` ให้ผูกกับ `Camera.main` และติดตั้ง Event Callback เมื่อวัตถุเข้า/ออกจากขอบเขตสายตากล้อง',
      conceptNotes: 'CullingGroup เป็น API ประสิทธิภาพสูงของ Unity ที่ใช้ SIMD คำนวณ Bounding Spheres จำนวนมากพร้อมกันโดยไม่สร้าง GC Allocations',
      starterCode: `using UnityEngine;

public class VisibilityManager : MonoBehaviour {
    private CullingGroup cullingGroup;
    private BoundingSphere[] spheres;

    void Start() {
        cullingGroup = new CullingGroup();
        // 1. กำหนดกล้องอ้างอิงให้ CullingGroup
        ___BLANK_1___;

        // 2. ผูกฟังก์ชันแจ้งเตือนสถานะเมื่อวัตถุโผล่/หายจากจอ
        ___BLANK_2___;

        spheres = new BoundingSphere[100];
        for (int i = 0; i < spheres.Length; i++) {
            spheres[i] = new BoundingSphere(transform.position, 2.0f);
        }
        // 3. ส่ง Bounding Spheres เข้ากลุ่มคำนวณ
        ___BLANK_3___;
    }

    private void OnStateChanged(CullingGroupEvent evt) {
        bool isVisible = evt.isVisible;
        // เปิด/ปิด Animator หรือ AI NavMeshAgent ตามสถานะ
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (กำหนด Target Camera)',
          expected: 'cullingGroup.targetCamera = Camera.main',
          acceptedAlternatives: ['cullingGroup.targetCamera = Camera.main', 'cullingGroup.targetCamera = Camera.main;'],
          hint: 'ตั้งค่าพร็อพเพอร์ตี้ targetCamera ของ cullingGroup',
          options: ['cullingGroup.targetCamera = Camera.main', 'cullingGroup.camera = this', 'cullingGroup.SetTarget(null)', 'cullingGroup.enabled = true']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ผูก Event Callback onStateChanged)',
          expected: 'cullingGroup.onStateChanged = OnStateChanged',
          acceptedAlternatives: ['cullingGroup.onStateChanged = OnStateChanged', 'cullingGroup.onStateChanged += OnStateChanged'],
          hint: 'กำหนด delegate onStateChanged ให้ชี้ไปที่ OnStateChanged',
          options: ['cullingGroup.onStateChanged = OnStateChanged', 'cullingGroup.Listen(OnStateChanged)', 'cullingGroup.callback = null', 'cullingGroup.Invoke()']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ส่ง Bounding Spheres เข้าคำนวณ)',
          expected: 'cullingGroup.SetBoundingSpheres(spheres)',
          acceptedAlternatives: ['cullingGroup.SetBoundingSpheres(spheres)', 'cullingGroup.SetBoundingSpheres(spheres);'],
          hint: 'เรียกเมธอด SetBoundingSpheres พร้อมพารามิเตอร์ spheres',
          options: ['cullingGroup.SetBoundingSpheres(spheres)', 'cullingGroup.spheres = spheres', 'cullingGroup.Add(spheres)', 'cullingGroup.ComputeAll()']
        }
      ],
      fullSolution: `using UnityEngine;

public class VisibilityManager : MonoBehaviour {
    private CullingGroup cullingGroup;
    private BoundingSphere[] spheres;

    void Start() {
        cullingGroup = new CullingGroup();
        cullingGroup.targetCamera = Camera.main;
        cullingGroup.onStateChanged = OnStateChanged;

        spheres = new BoundingSphere[100];
        for (int i = 0; i < spheres.Length; i++) {
            spheres[i] = new BoundingSphere(transform.position, 2.0f);
        }
        cullingGroup.SetBoundingSpheres(spheres);
    }

    private void OnStateChanged(CullingGroupEvent evt) {
        bool isVisible = evt.isVisible;
    }
}`,
      explanation: 'การใช้ CullingGroup ช่วยให้เราสั่งหยุดคำนวณกระดูกแอนิเมชันหรือ AI พฤติกรรมของศัตรูนอกจอได้อย่างแม่นยำ ประหยัด CPU ได้มหาศาล',
      testCaseDescription: 'ทดสอบตั้งค่า CullingGroup สำเร็จและรับฟัง Event เมื่อหลุดขอบจอ'
    },
    unreal: {
      id: 'frustum-unreal',
      type: 'unreal',
      title: 'ตรวจสอบการตัดวัตถุด้วย FSceneView Frustum ใน Unreal Engine C++',
      language: 'cpp',
      difficulty: 'Hard',
      description: 'เขียนโค้ดตรวจสอบการมองเห็น AABB Box กับระนาบ `ViewFrustum` ของ `FSceneView` ใน Unreal Engine',
      conceptNotes: 'Unreal Engine จัดการ Frustum และ Hierarchical Z-Buffer (HZB) ภายใน Render Pipeline เพื่อหลีกเลี่ยงการส่ง Primitive Component เข้าสู่คำสั่ง Draw Call',
      starterCode: `#include "SceneView.h"
#include "Box.h"

bool CheckMeshVisibilityInView(const FSceneView* SceneView, const FBox& WorldBounds) {
    if (!SceneView) return false;

    // 1. ดึงศูนย์กลาง (Center) และครึ่งรัศมี (Extent) ของ AABB
    FVector BoxCenter = ___BLANK_1___;
    FVector BoxExtent = ___BLANK_2___;

    // 2. ทดสอบการตัดกันระหว่าง View Frustum กับ Box
    bool bIsVisible = ___BLANK_3___;

    return bIsVisible;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (หาจุดศูนย์กลางของ FBox)',
          expected: 'WorldBounds.GetCenter()',
          acceptedAlternatives: ['WorldBounds.GetCenter()', 'WorldBounds.GetCenter();'],
          hint: 'เรียกเมธอด GetCenter() ของโครงสร้างข้อมูล FBox',
          options: ['WorldBounds.GetCenter()', 'WorldBounds.Min + WorldBounds.Max', 'WorldBounds.GetSize()', 'FVector::ZeroVector']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (หา Extent ของ FBox)',
          expected: 'WorldBounds.GetExtent()',
          acceptedAlternatives: ['WorldBounds.GetExtent()', 'WorldBounds.GetExtent();'],
          hint: 'เรียกเมธอด GetExtent() ของ FBox',
          options: ['WorldBounds.GetExtent()', 'WorldBounds.GetRadius()', 'WorldBounds.Min', 'WorldBounds.Max']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ทดสอบจุดตัดกับ ViewFrustum)',
          expected: 'SceneView->ViewFrustum.IntersectBox(BoxCenter, BoxExtent)',
          acceptedAlternatives: [
            'SceneView->ViewFrustum.IntersectBox(BoxCenter, BoxExtent)',
            'SceneView->ViewFrustum.IntersectBox(BoxCenter, BoxExtent);'
          ],
          hint: 'เรียก SceneView->ViewFrustum.IntersectBox พร้อมส่ง Center และ Extent',
          options: [
            'SceneView->ViewFrustum.IntersectBox(BoxCenter, BoxExtent)',
            'SceneView->IsVisible()',
            'WorldBounds.IsInside(SceneView->ViewLocation)',
            'false'
          ]
        }
      ],
      fullSolution: `#include "SceneView.h"
#include "Box.h"

bool CheckMeshVisibilityInView(const FSceneView* SceneView, const FBox& WorldBounds) {
    if (!SceneView) return false;

    FVector BoxCenter = WorldBounds.GetCenter();
    FVector BoxExtent = WorldBounds.GetExtent();

    bool bIsVisible = SceneView->ViewFrustum.IntersectBox(BoxCenter, BoxExtent);

    return bIsVisible;
}`,
      explanation: 'ViewFrustum.IntersectBox ใน Unreal Engine คำนวณแบบเวกเตอร์อย่างมีประสิทธิภาพเพื่อตอบว่าวัตถุอยู่ใน Field of View หรือไม่ก่อนเข้าสู่ขั้นตอน Occlusion Culling',
      testCaseDescription: 'ทดสอบส่ง FBox ที่อยู่ภายในมุมมองกล้อง -> คืนค่า true'
    }
  },

  'multi-threading': {
    pureLogic: {
      id: 'thread-pure',
      type: 'pure',
      title: 'แบ่งช่วงข้อมูล (Chunk Ranges) สำหรับ Worker Threads แบบคู่ขนาน',
      language: 'typescript',
      difficulty: 'Easy',
      description: 'เติมโค้ดฟังก์ชัน `getThreadRange` เพื่อคำนวณ Index เริ่มต้นและสิ้นสุด [startIndex, endIndex) ให้แต่ละ Worker Thread โดยจัดการเศษที่เหลืออย่างถูกต้อง',
      conceptNotes: 'การประมวลผลแบบ Parallel For ต้องการการแบ่งอาเรย์ขนาด N ออกเป็นช่วงๆ เท่ากันตามจำนวน Threads หากแบ่งผิดอาจเกิด Race Condition หรือทำงานซ้ำซ้อนกัน',
      starterCode: `interface ThreadChunk {
  startIndex: number;
  endIndex: number;
}

function getThreadRange(totalItems: number, threadIndex: number, totalThreads: number): ThreadChunk {
  // 1. คำนวณขนาด Chunk พื้นฐานต่อ Thread
  const baseChunkSize = ___BLANK_1___;

  // 2. คำนวณจุดเริ่มต้นของ Thread นี้
  const startIndex = ___BLANK_2___;

  // 3. กำหนดจุดสิ้นสุด (หากเป็น Thread ตัวสุดท้าย ให้กวาดจนหมดเศษ)
  const endIndex = (threadIndex === totalThreads - 1)
    ? ___BLANK_3___
    : startIndex + baseChunkSize;

  return { startIndex, endIndex };
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (หาขนาด Chunk พื้นฐาน)',
          expected: 'Math.floor(totalItems / totalThreads)',
          acceptedAlternatives: ['Math.floor(totalItems / totalThreads)', 'Math.floor(totalItems/totalThreads)'],
          hint: 'ใช้ Math.floor หารจำนวนรายการทั้งหมดด้วยจำนวนเธรด',
          options: ['Math.floor(totalItems / totalThreads)', 'totalItems * totalThreads', 'Math.ceil(totalThreads)', 'totalItems % totalThreads']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (จุดเริ่มต้นของ Index)',
          expected: 'threadIndex * baseChunkSize',
          acceptedAlternatives: ['threadIndex * baseChunkSize'],
          hint: 'นำดัชนีของ Thread คูณด้วยขนาด baseChunkSize',
          options: ['threadIndex * baseChunkSize', 'threadIndex + baseChunkSize', '0', 'totalItems - threadIndex']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (จุดสิ้นสุดของ Thread ตัวสุดท้าย)',
          expected: 'totalItems',
          acceptedAlternatives: ['totalItems'],
          hint: 'Thread ตัวสุดท้ายต้องรับผิดชอบจนถึงรายการสุดท้าย คือ totalItems',
          options: ['totalItems', 'startIndex', 'totalThreads', 'baseChunkSize']
        }
      ],
      fullSolution: `interface ThreadChunk {
  startIndex: number;
  endIndex: number;
}

function getThreadRange(totalItems: number, threadIndex: number, totalThreads: number): ThreadChunk {
  const baseChunkSize = Math.floor(totalItems / totalThreads);
  const startIndex = threadIndex * baseChunkSize;
  const endIndex = (threadIndex === totalThreads - 1)
    ? totalItems
    : startIndex + baseChunkSize;

  return { startIndex, endIndex };
}`,
      explanation: 'การแบ่งช่วงแบบไม่ทับซ้อนกันช่วยให้ Worker Thread ทำงานได้อย่างอิสระบน Memory Block ของตัวเองโดยไม่ต้องพึ่งพา Mutex Lock',
      testCaseDescription: 'ทดสอบแบ่ง 100 รายการบน 4 เธรด -> ได้ 0..25, 25..50, 50..75, 75..100'
    },
    unity: {
      id: 'thread-unity',
      type: 'unity',
      title: 'สร้าง Parallel Job ด้วย IJobParallelFor และ Burst ใน Unity C#',
      language: 'csharp',
      difficulty: 'Medium',
      description: 'เขียน Struct ที่สืบทอดจาก `IJobParallelFor` พร้อมแอตทริบิวต์ `[BurstCompile]` เพื่อคำนวณตำแหน่งอนุภาคหลายพันตัวบน Worker Threads',
      conceptNotes: 'Unity C# Job System ร่วมกับ Burst Compiler แปลงโค้ด C# ให้เป็น Optimized Machine Code และรันแบบขนานบน Hardware Cores ทั้งหมดโดยอัตโนมัติ',
      starterCode: `using Unity.Jobs;
using Unity.Collections;
using Unity.Burst;
using Unity.Mathematics;

// 1. เพิ่ม Attribute สั่งให้ Burst Compiler ทำงาน
___BLANK_1___
public struct ParticleUpdateJob : ___BLANK_2___ {
    public NativeArray<float3> positions;
    [ReadOnly] public NativeArray<float3> velocities;
    public float deltaTime;

    public void Execute(int index) {
        // อัปเดตตำแหน่งอนุภาคแต่ละตัว
        positions[index] += velocities[index] * deltaTime;
    }
}

public class ParticleSystemController {
    public void ScheduleJob(NativeArray<float3> pos, NativeArray<float3> vel, float dt) {
        ParticleUpdateJob job = new ParticleUpdateJob {
            positions = pos,
            velocities = vel,
            deltaTime = dt
        };

        // 3. กำหนดตารางการทำงาน Job แบบขนานด้วย Batch Size 64
        JobHandle handle = ___BLANK_3___;
        handle.Complete();
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (Burst Compile Attribute)',
          expected: '[BurstCompile]',
          acceptedAlternatives: ['[BurstCompile]'],
          hint: 'ใส่ Attribute [BurstCompile] ด้านบนของ Struct Job',
          options: ['[BurstCompile]', '[SerializeField]', '[System.Serializable]', '[ExecuteInEditMode]']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (Interface ขนาน IJobParallelFor)',
          expected: 'IJobParallelFor',
          acceptedAlternatives: ['IJobParallelFor'],
          hint: 'สืบทอดจากอินเตอร์เฟซ IJobParallelFor สำหรับงานประมวลผลข้อมูลหลายชิ้น',
          options: ['IJobParallelFor', 'IJob', 'IEnumerator', 'IComponentData']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (เรียกคำสั่ง Schedule)',
          expected: 'job.Schedule(pos.Length, 64)',
          acceptedAlternatives: ['job.Schedule(pos.Length, 64)', 'job.Schedule(pos.Length, 64);'],
          hint: 'เรียก job.Schedule(arrayLength, innerloopBatchCount)',
          options: ['job.Schedule(pos.Length, 64)', 'job.Run()', 'job.Execute(0)', 'job.Schedule()']
        }
      ],
      fullSolution: `using Unity.Jobs;
using Unity.Collections;
using Unity.Burst;
using Unity.Mathematics;

[BurstCompile]
public struct ParticleUpdateJob : IJobParallelFor {
    public NativeArray<float3> positions;
    [ReadOnly] public NativeArray<float3> velocities;
    public float deltaTime;

    public void Execute(int index) {
        positions[index] += velocities[index] * deltaTime;
    }
}

public class ParticleSystemController {
    public void ScheduleJob(NativeArray<float3> pos, NativeArray<float3> vel, float dt) {
        ParticleUpdateJob job = new ParticleUpdateJob {
            positions = pos,
            velocities = vel,
            deltaTime = dt
        };

        JobHandle handle = job.Schedule(pos.Length, 64);
        handle.Complete();
    }
}`,
      explanation: 'IJobParallelFor + Burst Compiler สามารถปลดปล่อยประสิทธิภาพสูงสุดของ CPU ทุกคอร์ พร้อมระบบความปลอดภัยจาก Race Condition ในตัว',
      testCaseDescription: 'ทดสอบคอมไพล์ Job แบบ Burst และกระจายตารางงานขนานสำเร็จ'
    },
    unreal: {
      id: 'thread-unreal',
      type: 'unreal',
      title: 'ใช้ ParallelFor ใน Unreal Engine C++ เพื่อประมวลผลฟิสิกส์',
      language: 'cpp',
      difficulty: 'Medium',
      description: 'ใช้ฟังก์ชัน `ParallelFor` ของ Unreal Engine ในการคำนวณเวกเตอร์ความเร็วของศัตรูในฉากโดยไม่บล็อก Game Thread',
      conceptNotes: 'Unreal Engine TaskGraph และคำสั่ง ParallelFor จะนำพาคำสั่งไปรันบน Worker Threads ในเบื้องหลังอย่างรวดเร็ว',
      starterCode: `#include "Async/ParallelFor.h"
#include "Containers/Array.h"

void UpdateEnemyPositionsParallel(TArray<FVector>& Positions, const TArray<FVector>& Velocities, float DeltaTime) {
    const int32 NumEnemies = Positions.Num();

    // 1. เรียกใช้งาน ParallelFor เพื่อวนลูปแบบมัลติเธรด
    ___BLANK_1___(NumEnemies, [&](int32 Index) {
        // 2. คำนวณตำแหน่งใหม่ของศัตรูแต่ละตัว
        ___BLANK_2___;
    }, ___BLANK_3___);
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (คำสั่งขนานใน Unreal)',
          expected: 'ParallelFor',
          acceptedAlternatives: ['ParallelFor'],
          hint: 'ชื่อฟังก์ชันสแตติก ParallelFor',
          options: ['ParallelFor', 'Async', 'TaskGraph', 'Dispatch']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (คำนวณอัปเดตเวกเตอร์)',
          expected: 'Positions[Index] += Velocities[Index] * DeltaTime',
          acceptedAlternatives: [
            'Positions[Index] += Velocities[Index] * DeltaTime',
            'Positions[Index] += Velocities[Index] * DeltaTime;'
          ],
          hint: 'นำเวกเตอร์ตำแหน่งบวกด้วยความเร็วคูณด้วย DeltaTime',
          options: [
            'Positions[Index] += Velocities[Index] * DeltaTime',
            'Positions[Index] = FVector::ZeroVector',
            'Velocities[Index] = Positions[Index]',
            'DeltaTime = 0.0f'
          ]
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (แฟล็ก ParallelForFlags)',
          expected: 'EParallelForFlags::None',
          acceptedAlternatives: ['EParallelForFlags::None', 'EParallelForFlags::Unbalanced'],
          hint: 'ส่งแฟล็กเริ่มต้น EParallelForFlags::None',
          options: ['EParallelForFlags::None', 'true', 'nullptr', '0']
        }
      ],
      fullSolution: `#include "Async/ParallelFor.h"
#include "Containers/Array.h"

void UpdateEnemyPositionsParallel(TArray<FVector>& Positions, const TArray<FVector>& Velocities, float DeltaTime) {
    const int32 NumEnemies = Positions.Num();

    ParallelFor(NumEnemies, [&](int32 Index) {
        Positions[Index] += Velocities[Index] * DeltaTime;
    }, EParallelForFlags::None);
}`,
      explanation: 'ParallelFor จัดการแบ่งก้อนงานให้ Thread Pool อัตโนมัติ ป้องกันไม่ให้ Game Thread เกิด Frame Time Spike เมื่อมี NPC ปริมาณมาก',
      testCaseDescription: 'ทดสอบรันคำนวณตำแหน่งแบบขนานผ่าน ParallelFor ครบทุก Index'
    }
  },

  'shader-overdraw': {
    pureLogic: {
      id: 'overdraw-pure',
      type: 'pure',
      title: 'เรียงลำดับ Mesh แบบ Front-to-Back เพื่อใช้ประโยชน์จาก GPU Early-Z',
      language: 'typescript',
      difficulty: 'Easy',
      description: 'เขียนฟังก์ชัน Comparator เพื่อเรียงลำดับ Mesh ทึบแสง (Opaque) จากระยะใกล้ไปไกล (Front-to-Back) เพื่อให้ฮาร์ดแวร์ GPU ตัดทิ้งพิกเซลด้านหลังผ่าน Early Depth Test',
      conceptNotes: 'หากวาดวัตถุทึบแสงจากหลังมาหน้า GPU ต้องระบายสีพิกเซลทับที่เดิมหลายรอบ แต่หากวาดจากหน้าไปหลัง Depth Buffer จะบันทึกค่าไว้ ทำให้วัตถุข้างหลังถูก Reject ทันที',
      starterCode: `interface RenderMesh {
  id: string;
  distanceToCamera: number;
  isOpaque: boolean;
}

function sortOpaqueMeshesForEarlyZ(meshes: RenderMesh[]): RenderMesh[] {
  // กรองเฉพาะวัตถุทึบแสง และจัดเรียงจากใกล้ไปไกล (Ascending Distance)
  return meshes
    .filter(m => ___BLANK_1___)
    .sort((a, b) => {
      // 2. เรียงลำดับจากระยะน้อยไปมาก (Front-to-Back)
      return ___BLANK_2___;
    });
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (กรองเฉพาะ Opaque Mesh)',
          expected: 'm.isOpaque',
          acceptedAlternatives: ['m.isOpaque', 'm.isOpaque === true'],
          hint: 'ตรวจสอบคุณสมบัติ isOpaque ของเมช',
          options: ['m.isOpaque', '!m.isOpaque', 'm.distanceToCamera > 0', 'true']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (สูตรเรียงลำดับ Front-to-Back)',
          expected: 'a.distanceToCamera - b.distanceToCamera',
          acceptedAlternatives: ['a.distanceToCamera - b.distanceToCamera'],
          hint: 'ลบระยะทาง a ด้วย b เพื่อให้ตัวที่ใกล้อยู่ลำดับแรก',
          options: [
            'a.distanceToCamera - b.distanceToCamera',
            'b.distanceToCamera - a.distanceToCamera',
            'a.distanceToCamera + b.distanceToCamera',
            '0'
          ]
        }
      ],
      fullSolution: `interface RenderMesh {
  id: string;
  distanceToCamera: number;
  isOpaque: boolean;
}

function sortOpaqueMeshesForEarlyZ(meshes: RenderMesh[]): RenderMesh[] {
  return meshes
    .filter(m => m.isOpaque)
    .sort((a, b) => {
      return a.distanceToCamera - b.distanceToCamera;
    });
}`,
      explanation: 'Front-to-back sorting เป็นหัวใจสำคัญของ Forward/Deferred pipeline ในการเปิดใช้งาน Early-Z Rejection ช่วยลด Fragment Shader invocations ลงได้กว่า 70%',
      testCaseDescription: 'ทดสอบส่ง Mesh ระยะ 10m, 50m, 5m -> เรียงได้ 5m, 10m, 50m'
    },
    unity: {
      id: 'overdraw-unity',
      type: 'unity',
      title: 'ตั้งค่า RenderQueue และ ZWrite ใน Unity C# เพื่อลด Overdraw',
      language: 'csharp',
      difficulty: 'Easy',
      description: 'กำหนดค่า `renderQueue` ให้เป็น `Geometry` (2000) และเปิดการเขียน Depth Buffer (`_ZWrite`) ให้แก่วัตถุทึบแสง',
      conceptNotes: 'วัตถุโปร่งแสง (Transparent) มี RenderQueue อยู่ที่ 3000 และไม่สามารถเขียน ZWrite ได้ แต่สำหรับวัตถุทึบแสง ต้องให้แน่ใจว่า RenderQueue อยู่ที่ 2000 เสมอ',
      starterCode: `using UnityEngine;
using UnityEngine.Rendering;

public class MaterialOptimizer {
    public static void OptimizeOpaqueMaterial(Material mat) {
        // 1. กำหนด Render Queue ให้อยู่ในกลุ่ม Geometry ทึบแสง (2000)
        mat.renderQueue = ___BLANK_1___;

        // 2. สั่งเปิดการเขียน Depth Buffer (ZWrite On)
        mat.SetInt("___BLANK_2___", 1);

        // 3. ปิด Blend mode ที่ทำให้โปร่งใส
        mat.SetInt("_SrcBlend", (int)BlendMode.One);
        mat.SetInt("_DstBlend", (int)BlendMode.Zero);
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (กลุ่ม RenderQueue สำหรับ Geometry)',
          expected: '(int)RenderQueue.Geometry',
          acceptedAlternatives: ['(int)RenderQueue.Geometry', '2000', '(int)UnityEngine.Rendering.RenderQueue.Geometry'],
          hint: 'แปลง enum (int)RenderQueue.Geometry หรือใส่ค่า 2000',
          options: ['(int)RenderQueue.Geometry', '(int)RenderQueue.Transparent', '3000', '0']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ชื่อ Shader Property สำหรับ ZWrite)',
          expected: '_ZWrite',
          acceptedAlternatives: ['_ZWrite'],
          hint: 'พร็อพเพอร์ตี้มาตรฐานของ Shader คือ "_ZWrite"',
          options: ['_ZWrite', '_ZTest', '_MainTex', '_AlphaCutout']
        }
      ],
      fullSolution: `using UnityEngine;
using UnityEngine.Rendering;

public class MaterialOptimizer {
    public static void OptimizeOpaqueMaterial(Material mat) {
        mat.renderQueue = (int)RenderQueue.Geometry;
        mat.SetInt("_ZWrite", 1);
        mat.SetInt("_SrcBlend", (int)BlendMode.One);
        mat.SetInt("_DstBlend", (int)BlendMode.Zero);
    }
}`,
      explanation: 'การตั้งค่า RenderQueue.Geometry และ ZWrite: 1 รับประกันว่าวัตถุจะถูกประมวลผลก่อนวัตถุโปร่งแสง และบันทึก Depth ให้ GPU ใช้อ้างอิง',
      testCaseDescription: 'ทดสอบตั้งค่า renderQueue เป็น 2000 และเปิด ZWrite เป็น 1'
    },
    unreal: {
      id: 'overdraw-unreal',
      type: 'unreal',
      title: 'เปิดใช้งาน Custom Depth Pre-Pass ใน Unreal Engine C++',
      language: 'cpp',
      difficulty: 'Medium',
      description: 'เขียนโค้ดสั่งให้ `UStaticMeshComponent` ทำการเขียน Depth Pre-Pass และเปิดใช้งาน Custom Depth Buffer เพื่อป้องกัน Overdraw',
      conceptNotes: 'Unreal Engine อาศัย Early Z-Pass เพื่อเติม Depth Buffer ล่วงหน้า ก่อนที่ Base Pass (GBuffer) จะเริ่มทำงาน ทำให้คำนวณแสงเฉพาะพิกเซลที่มองเห็นจริง',
      starterCode: `#include "Components/StaticMeshComponent.h"

void ConfigureMeshDepthOptimization(UStaticMeshComponent* MeshComp) {
    if (!MeshComp) return;

    // 1. สั่งเปิดให้เรนเดอร์ลง Custom Depth Pass
    MeshComp->___BLANK_1___(true);

    // 2. ตั้งค่าการเขียน Depth Stencil สำหรับ Masking
    MeshComp->___BLANK_2___ = 250;

    // 3. กำหนดความโปร่งแสงให้เป็นทึบแสง (Opaque) หลีกเลี่ยง Translucent Overdraw
    MeshComp->SetTranslucentSortPriority(0);
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เมธอดเปิด Render Custom Depth)',
          expected: 'SetRenderCustomDepth',
          acceptedAlternatives: ['SetRenderCustomDepth'],
          hint: 'เมธอด SetRenderCustomDepth(true)',
          options: ['SetRenderCustomDepth', 'SetVisibility', 'SetCollisionEnabled', 'SetCastShadow']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (Stencil Value ของ Custom Depth)',
          expected: 'CustomDepthStencilValue',
          acceptedAlternatives: ['CustomDepthStencilValue'],
          hint: 'ตัวแปรพร็อพเพอร์ตี้ CustomDepthStencilValue',
          options: ['CustomDepthStencilValue', 'StencilId', 'DepthPriorityGroup', 'RenderTime']
        }
      ],
      fullSolution: `#include "Components/StaticMeshComponent.h"

void ConfigureMeshDepthOptimization(UStaticMeshComponent* MeshComp) {
    if (!MeshComp) return;

    MeshComp->SetRenderCustomDepth(true);
    MeshComp->CustomDepthStencilValue = 250;
    MeshComp->SetTranslucentSortPriority(0);
}`,
      explanation: 'การบังคับให้วัตถุเข้าสู่ Depth Pass ช่วยให้ Unreal Engine สามารถ Discard พิกเซลที่ไม่จำเป็นในกระบวนการ Early-Z ได้ 100%',
      testCaseDescription: 'ทดสอบเปิด SetRenderCustomDepth(true) และกำหนด Stencil Value สำเร็จ'
    }
  },

  'netcode-prediction': {
    pureLogic: {
      id: 'netcode-pure',
      type: 'pure',
      title: 'สร้าง Client Prediction Buffer และ Server Reconciliation Loop',
      language: 'typescript',
      difficulty: 'Hard',
      description: 'เขียนฟังก์ชัน `reconcileAndReplay` ในการปรับตำแหน่งตัวละครตาม Snapshot ที่เซิร์ฟเวอร์ส่งกลับมา พร้อมทั้งจำลองอินพุตที่ค้างอยู่ใน Buffer ซ้ำ (Replay Inputs)',
      conceptNotes: 'เมื่อเครื่องผู้เล่นได้รับข้อมูลตำแหน่งจริงจาก Server มันจะทิ้งอินพุตเก่าที่ Server ยืนยันแล้ว นำตำแหน่ง Server มาตั้งต้นใหม่ แล้วรันอินพุตใหม่ที่ยังไม่ได้รับการยืนยันซ้ำอีกครั้งในเสี้ยววินาที',
      starterCode: `interface SavedInput {
  sequence: number;
  deltaX: number;
}

interface ServerSnapshot {
  ackSequence: number;
  authoritativeX: number;
}

class NetcodePredictor {
  public currentX: number = 0;
  private inputHistory: SavedInput[] = [];

  // เมื่อได้รับ Snapshot ตอบกลับจาก Server
  public reconcileAndReplay(snapshot: ServerSnapshot): void {
    // 1. นำตำแหน่งจริงของ Server มาเป็นจุดเริ่มต้นใหม่
    let replayX = ___BLANK_1___;

    // 2. ทิ้งอินพุตในอดีตที่ Server ได้ประมวลผลไปแล้ว
    this.inputHistory = this.inputHistory.filter(
      input => ___BLANK_2___
    );

    // 3. จำลองอินพุตที่ค้างอยู่ซ้ำอีกครั้ง (Replay Unacknowledged Inputs)
    for (const input of this.inputHistory) {
      replayX += ___BLANK_3___;
    }

    this.currentX = replayX;
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (นำตำแหน่ง Server มาตั้งต้น)',
          expected: 'snapshot.authoritativeX',
          acceptedAlternatives: ['snapshot.authoritativeX'],
          hint: 'กำหนดให้ replayX เริ่มต้นที่ snapshot.authoritativeX',
          options: ['snapshot.authoritativeX', 'this.currentX', '0', 'snapshot.ackSequence']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (กรองเอาเฉพาะอินพุตที่ยังไม่ยืนยัน)',
          expected: 'input.sequence > snapshot.ackSequence',
          acceptedAlternatives: ['input.sequence > snapshot.ackSequence'],
          hint: 'เก็บเฉพาะ input.sequence ที่มากกว่า snapshot.ackSequence',
          options: [
            'input.sequence > snapshot.ackSequence',
            'input.sequence <= snapshot.ackSequence',
            'input.sequence === 0',
            'true'
          ]
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (สะสมระยะขยับของอินพุต)',
          expected: 'input.deltaX',
          acceptedAlternatives: ['input.deltaX'],
          hint: 'บวกเพิ่มด้วยค่า input.deltaX ในแต่ละรอบ',
          options: ['input.deltaX', 'input.sequence', '1', 'snapshot.authoritativeX']
        }
      ],
      fullSolution: `interface SavedInput {
  sequence: number;
  deltaX: number;
}

interface ServerSnapshot {
  ackSequence: number;
  authoritativeX: number;
}

class NetcodePredictor {
  public currentX: number = 0;
  private inputHistory: SavedInput[] = [];

  public reconcileAndReplay(snapshot: ServerSnapshot): void {
    let replayX = snapshot.authoritativeX;

    this.inputHistory = this.inputHistory.filter(
      input => input.sequence > snapshot.ackSequence
    );

    for (const input of this.inputHistory) {
      replayX += input.deltaX;
    }

    this.currentX = replayX;
  }
}`,
      explanation: 'Reconciliation Loop ทำให้ผู้เล่นรู้สึกว่าการควบคุมตอบสนองทันที (0ms Latency) ในขณะที่ Server ยังคงเป็น Authoritative ในการตัดสินความถูกต้องของเกม',
      testCaseDescription: 'ทดสอบ Reconcile กับ Server -> ได้ตำแหน่งที่รวมอินพุตที่ค้างอยู่อย่างแม่นยำ'
    },
    unity: {
      id: 'netcode-unity',
      type: 'unity',
      title: 'Predicted Movement ใน Unity Netcode for GameObjects (NGO)',
      language: 'csharp',
      difficulty: 'Medium',
      description: 'เขียนโค้ดใน `NetworkBehaviour` เพื่อขยับตัวละครในเครื่อง Local ทันทีหาก `IsOwner` เป็นจริง พร้อมส่ง `ServerRpc` ไปยังเซิร์ฟเวอร์',
      conceptNotes: 'Unity NGO ใช้การตรวจสอบสิทธิ์ความเป็นเจ้าของผ่าน IsOwner หากผู้เล่นเป็นเจ้าของตัวละคร ให้ทำนายล่วงหน้าได้ทันที',
      starterCode: `using Unity.Netcode;
using UnityEngine;

public class PlayerNetworkController : NetworkBehaviour {
    private int sequenceNumber = 0;

    void Update() {
        // 1. ตรวจสอบว่าเครื่องนี้เป็นเจ้าของตัวละครหรือไม่
        if (!___BLANK_1___) return;

        Vector3 moveInput = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        if (moveInput.sqrMagnitude > 0.001f) {
            // 2. เคลื่อนที่บน Local ทันทีเพื่อความลื่นไหล (Client Prediction)
            transform.position += moveInput * 5.0f * Time.deltaTime;

            // 3. ส่งคำสั่งไปยัง Server เพื่อทำการ Validate
            SubmitInput___BLANK_2___(moveInput, ++sequenceNumber);
        }
    }

    // 4. Attribute ระบุว่าเป็นคำสั่งส่งไปยัง Server
    [___BLANK_3___]
    private void SubmitInputServerRpc(Vector3 input, int seq) {
        // Server ประมวลผลและส่ง Snapshot กลับ
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ตรวจสอบความเป็นเจ้าของ Object)',
          expected: 'IsOwner',
          acceptedAlternatives: ['IsOwner', 'this.IsOwner'],
          hint: 'พร็อพเพอร์ตี้ของ NetworkBehaviour คือ IsOwner',
          options: ['IsOwner', 'IsServer', 'IsHost', 'enabled']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ชื่อฟังก์ชันต่อท้าย RPC)',
          expected: 'ServerRpc',
          acceptedAlternatives: ['ServerRpc'],
          hint: 'ชื่อฟังก์ชันต้องลงท้ายด้วย ServerRpc',
          options: ['ServerRpc', 'ClientRpc', 'Callback', 'Command']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (Attribute ServerRpc)',
          expected: 'ServerRpc',
          acceptedAlternatives: ['ServerRpc', 'ServerRpcAttribute'],
          hint: 'ใส่ Attribute [ServerRpc]',
          options: ['ServerRpc', 'ClientRpc', 'RPC', 'SyncVar']
        }
      ],
      fullSolution: `using Unity.Netcode;
using UnityEngine;

public class PlayerNetworkController : NetworkBehaviour {
    private int sequenceNumber = 0;

    void Update() {
        if (!IsOwner) return;

        Vector3 moveInput = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        if (moveInput.sqrMagnitude > 0.001f) {
            transform.position += moveInput * 5.0f * Time.deltaTime;
            SubmitInputServerRpc(moveInput, ++sequenceNumber);
        }
    }

    [ServerRpc]
    private void SubmitInputServerRpc(Vector3 input, int seq) {
    }
}`,
      explanation: 'การตรวจสอบ IsOwner และขยับบนเครื่องผู้เล่นทันทีก่อนส่ง ServerRpc คือรากฐานของ Client-side Prediction ใน Unity Netcode',
      testCaseDescription: 'ทดสอบ IsOwner ทำนายการเคลื่อนที่ทันที และเรียกใช้ ServerRpc สำเร็จ'
    },
    unreal: {
      id: 'netcode-unreal',
      type: 'unreal',
      title: 'Unreal Engine FSavedMove_Character Prediction ใน C++',
      language: 'cpp',
      difficulty: 'Hard',
      description: 'โอเวอร์ไรด์เมธอด `PrepMoveFor` ในคลาสย่อยของ `FSavedMove_Character` เพื่อบันทึกข้อมูลการเคลื่อนที่สำหรับการทำนายและ Replay ใน Unreal Engine',
      conceptNotes: 'Unreal Engine CharacterMovementComponent มีระบบ Client-Side Prediction และ Replay ในตัวผ่านโครงสร้างข้อมูล FSavedMove_Character',
      starterCode: `#include "GameFramework/CharacterMovementComponent.h"

class FSavedMove_MyGame : public FSavedMove_Character {
public:
    uint8 bSavedWantsToSprint : 1;

    virtual void PrepMoveFor(ACharacter* Character) override {
        // 1. เรียกใช้งาน Base Class Implementation
        ___BLANK_1___;

        // 2. ดึง Character Movement Component
        UCharacterMovementComponent* MoveComp = Character->GetCharacterMovement();
        if (MoveComp) {
            // 3. บันทึกตัวแปรเสริมลงใน Snapshot ของ Move
            ___BLANK_2___ = MoveComp->IsSprinting();
        }
    }
};`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เรียก Super / Base PrepMoveFor)',
          expected: 'Super::PrepMoveFor(Character)',
          acceptedAlternatives: ['Super::PrepMoveFor(Character)', 'FSavedMove_Character::PrepMoveFor(Character)'],
          hint: 'เรียก Super::PrepMoveFor(Character)',
          options: [
            'Super::PrepMoveFor(Character)',
            'Character->Tick(0)',
            'this->Reset()',
            'Super::Clear()'
          ]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (กำหนดค่าตัวแปรบันทึก bSavedWantsToSprint)',
          expected: 'bSavedWantsToSprint',
          acceptedAlternatives: ['bSavedWantsToSprint', 'this->bSavedWantsToSprint'],
          hint: 'กำหนดค่าให้ bSavedWantsToSprint',
          options: ['bSavedWantsToSprint', 'bPressedJump', 'DeltaTime', 'TimeStamp']
        }
      ],
      fullSolution: `#include "GameFramework/CharacterMovementComponent.h"

class FSavedMove_MyGame : public FSavedMove_Character {
public:
    uint8 bSavedWantsToSprint : 1;

    virtual void PrepMoveFor(ACharacter* Character) override {
        Super::PrepMoveFor(Character);

        UCharacterMovementComponent* MoveComp = Character->GetCharacterMovement();
        if (MoveComp) {
            bSavedWantsToSprint = MoveComp->IsSprinting();
        }
    }
};`,
      explanation: 'FSavedMove_Character คือกระดูกสันหลังของระบบ Netcode ใน Unreal Engine ที่ช่วยให้ตัวละครเคลื่อนไหวลื่นไหลแม้ Ping จะสูงกว่า 200ms',
      testCaseDescription: 'ทดสอบบันทึกข้อมูลอินพุตลงใน FSavedMove สำเร็จ'
    }
  },

  'texture-streaming': {
    pureLogic: {
      id: 'texture-pure',
      type: 'pure',
      title: 'คำนวณ Mipmap Level จากอัตราส่วน Texel-to-Pixel Derivative',
      language: 'typescript',
      difficulty: 'Medium',
      description: 'เขียนฟังก์ชัน `calculateMipLevel` โดยใช้สูตร $\\log_2(\\max(du, dv))$ เพื่อหาว่าวัตถุที่ครอบคลุมพื้นที่บนหน้าจอควรใช้ Mipmap ระดับใด',
      conceptNotes: 'เมื่อวัตถุอยู่ไกล อัตราส่วนความเปลี่ยนแปลง UV ต่อยูนิตพิกเซลหน้าจอ (Derivative) จะสูงขึ้น การใช้ Math.log2 ช่วยเลือกระดับ Mipmap ที่พอดีเพื่อไม่ให้เกิด Cache Miss หรือ Aliasing',
      starterCode: `function calculateMipLevel(
  dudx: number,
  dvdy: number,
  textureResolution: number,
  maxMipLevel: number
): number {
  // 1. หาอนุพันธ์สูงสุดของการเปลี่ยนแปลง UV
  const maxDerivative = ___BLANK_1___;

  // 2. แปลงสเกลตามขนาดของ Texture (Texels per Screen Pixel)
  const texelsPerPixel = maxDerivative * textureResolution;

  // 3. ใช้ Log2 ในการหาชั้น Mip Level
  const calculatedMip = ___BLANK_2___;

  // 4. Clamping ให้อยู่ในช่วง [0, maxMipLevel]
  return Math.max(0, Math.min(maxMipLevel, ___BLANK_3___));
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (หาค่าสูงสุดของ Derivatives)',
          expected: 'Math.max(Math.abs(dudx), Math.abs(dvdy))',
          acceptedAlternatives: [
            'Math.max(Math.abs(dudx), Math.abs(dvdy))',
            'Math.max(dudx, dvdy)'
          ],
          hint: 'หาค่าสัมบูรณ์สูงสุดระหว่าง dudx กับ dvdy ด้วย Math.max',
          options: [
            'Math.max(Math.abs(dudx), Math.abs(dvdy))',
            'dudx + dvdy',
            'textureResolution / 2',
            'maxMipLevel'
          ]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (สูตร Log2 สำหรับคำนวณ Mip)',
          expected: 'Math.log2(texelsPerPixel)',
          acceptedAlternatives: ['Math.log2(texelsPerPixel)'],
          hint: 'ใช้สูตร Math.log2(texelsPerPixel)',
          options: [
            'Math.log2(texelsPerPixel)',
            'Math.sqrt(texelsPerPixel)',
            'texelsPerPixel / 2',
            'Math.sin(texelsPerPixel)'
          ]
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ปัดเศษ Mip Level)',
          expected: 'Math.floor(calculatedMip)',
          acceptedAlternatives: ['Math.floor(calculatedMip)', 'Math.round(calculatedMip)'],
          hint: 'ปัดเศษลงด้วย Math.floor(calculatedMip)',
          options: [
            'Math.floor(calculatedMip)',
            'calculatedMip * 2',
            'maxMipLevel',
            '0'
          ]
        }
      ],
      fullSolution: `function calculateMipLevel(
  dudx: number,
  dvdy: number,
  textureResolution: number,
  maxMipLevel: number
): number {
  const maxDerivative = Math.max(Math.abs(dudx), Math.abs(dvdy));
  const texelsPerPixel = maxDerivative * textureResolution;
  const calculatedMip = Math.log2(texelsPerPixel);

  return Math.max(0, Math.min(maxMipLevel, Math.floor(calculatedMip)));
}`,
      explanation: 'สูตร Log2 Derivative ช่วยให้การ์ดจอและระบบสตรีมรู้ว่าต้องโหลด Texture ย่อขนาดระดับใดมาแสดงผล ช่วยลดการใช้ VRAM และ Bandwidth ได้มหาศาล',
      testCaseDescription: 'ทดสอบส่ง Texel per pixel = 4 -> คำนวณได้ Mip Level 2'
    },
    unity: {
      id: 'texture-unity',
      type: 'unity',
      title: 'ตั้งค่า Streaming Mipmaps Memory Budget ใน Unity C#',
      language: 'csharp',
      difficulty: 'Easy',
      description: 'เขียนโค้ดเปิดใช้งาน `QualitySettings.streamingMipmapsActive` และจำกัดงบประมาณ VRAM Memory Budget ให้แก่ระบบ Texture Streaming',
      conceptNotes: 'Unity Texture Streaming System จะทำการโหลดและทิ้ง Mip Levels อัตโนมัติตามระยะห่างของกล้องเพื่อไม่ให้เกินงบประมาณ Memory Budget ที่ระบุไว้',
      starterCode: `using UnityEngine;

public class TextureStreamingConfig {
    public static void ConfigureStreamingPool(float vramBudgetMB) {
        // 1. เปิดการทำงานของ Streaming Mipmaps
        ___BLANK_1___ = true;

        // 2. กำหนดงบประมาณขนาด VRAM สูงสุดในหน่วย MB
        ___BLANK_2___ = vramBudgetMB;

        // 3. กำหนดจำนวน Texture ที่อนุญาตให้ประมวลผลต่อเฟรม
        QualitySettings.streamingMipmapsMaxLevelReduction = 3;
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เปิด Streaming Mipmaps)',
          expected: 'QualitySettings.streamingMipmapsActive',
          acceptedAlternatives: ['QualitySettings.streamingMipmapsActive'],
          hint: 'เข้าถึงพร็อพเพอร์ตี้ QualitySettings.streamingMipmapsActive',
          options: [
            'QualitySettings.streamingMipmapsActive',
            'QualitySettings.vSyncCount',
            'Screen.fullScreen',
            'Application.runInBackground'
          ]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (กำหนด Memory Budget)',
          expected: 'QualitySettings.streamingMipmapsMemoryBudget',
          acceptedAlternatives: ['QualitySettings.streamingMipmapsMemoryBudget'],
          hint: 'ตั้งค่า QualitySettings.streamingMipmapsMemoryBudget',
          options: [
            'QualitySettings.streamingMipmapsMemoryBudget',
            'QualitySettings.streamingMipmapsActive',
            'QualitySettings.shadowDistance',
            'QualitySettings.lodBias'
          ]
        }
      ],
      fullSolution: `using UnityEngine;

public class TextureStreamingConfig {
    public static void ConfigureStreamingPool(float vramBudgetMB) {
        QualitySettings.streamingMipmapsActive = true;
        QualitySettings.streamingMipmapsMemoryBudget = vramBudgetMB;
        QualitySettings.streamingMipmapsMaxLevelReduction = 3;
    }
}`,
      explanation: 'การจำกัด Streaming Mipmaps Memory Budget ช่วยให้เกมสามารถรันบนอุปกรณ์ที่มี VRAM ต่ำอย่างมือถือหรือ Switch ได้โดยไม่โดน OS สั่งแคลชเพราะ Memory ขาดแคลน',
      testCaseDescription: 'ทดสอบตั้งค่า streamingMipmapsActive เป็น true และตั้งงบ budget สำเร็จ'
    },
    unreal: {
      id: 'texture-unreal',
      type: 'unreal',
      title: 'ควบคุม Texture Streaming Resident Mips ใน Unreal Engine C++',
      language: 'cpp',
      difficulty: 'Medium',
      description: 'เขียนโค้ดสั่งให้ `UTexture2D` โหลดเฉพาะ Mip Levels ที่จำเป็นเข้าสู่ VRAM และสั่ง `UpdateResource` เพื่อนำไปใช้งาน',
      conceptNotes: 'Unreal Engine มี Texture Streaming Pool ที่คำนวณ Bounds ระยะทางอัตโนมัติ การใช้ SetForceMipLevelsToBeResident ควรทำเฉพาะตอน Pre-warm ใน Cinematic เท่านั้น',
      starterCode: `#include "Engine/Texture2D.h"

void ManageTextureResidentMips(UTexture2D* Texture, bool bForceHighRes) {
    if (!Texture) return;

    // 1. กำหนดว่าต้องการบังคับให้โหลด Mip สูงสุดค้างไว้ใน VRAM หรือไม่
    Texture->___BLANK_1___(bForceHighRes);

    // 2. สั่งอัปเดตทรัพยากรการแสดงผลเข้าสู่ Render Thread
    Texture->___BLANK_2___();
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เมธอดกำหนด Force Resident)',
          expected: 'SetForceMipLevelsToBeResident',
          acceptedAlternatives: ['SetForceMipLevelsToBeResident'],
          hint: 'เมธอด SetForceMipLevelsToBeResident(bForceHighRes)',
          options: ['SetForceMipLevelsToBeResident', 'SetVisibility', 'ConditionalBeginDestroy', 'ReleaseResource']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (คำสั่งอัปเดต Texture Resource)',
          expected: 'UpdateResource',
          acceptedAlternatives: ['UpdateResource'],
          hint: 'เรียก Texture->UpdateResource()',
          options: ['UpdateResource', 'Tick', 'Serialize', 'MarkPackageDirty']
        }
      ],
      fullSolution: `#include "Engine/Texture2D.h"

void ManageTextureResidentMips(UTexture2D* Texture, bool bForceHighRes) {
    if (!Texture) return;

    Texture->SetForceMipLevelsToBeResident(bForceHighRes);
    Texture->UpdateResource();
}`,
      explanation: 'การควบคุม Resident Mips ผ่าน C++ ช่วยให้เราควบคุมการใช้ VRAM ของเกม Open World ได้อย่างแม่นยำ ป้องกัน Texture Thrashing',
      testCaseDescription: 'ทดสอบเรียกคำสั่งจัดการ Resident Mip และ UpdateResource สำเร็จ'
    }
  },

  'audio-concurrency': {
    pureLogic: {
      id: 'audio-pure',
      type: 'pure',
      title: 'สร้าง Voice Stealing Manager ด้วยนโยบาย Quietest First (Pure Logic)',
      language: 'typescript',
      difficulty: 'Medium',
      description: 'เขียนฟังก์ชัน `acquireAudioVoice` เพื่อจัดการคัดสรรช่องเสียง โดยจำกัดจำนวนสูงสุด หากเต็ม ให้ทำการ "ขโมยช่องเสียง" (Voice Stealing) จากเสียงที่มีระดับความดัง (Volume) เบาที่สุด',
      conceptNotes: 'เมื่อเสียงในเกมเกิดขึ้นพร้อมกันหลักสิบเสียง (เช่น เสียงระเบิด, กระสุนกระทบ) หากปล่อยให้เล่นทั้งหมด ลำโพงจะเกิด Clipping แตกพร่า และ CPU ผสมเสียงจะทำงานหนัก การแย่งช่องเสียงที่เบาที่สุดจึงเป็นทางออกที่ดีที่สุด',
      starterCode: `interface SoundVoice {
  id: number;
  soundName: string;
  volume: number; // 0.0 ถึง 1.0
}

class AudioVoiceManager {
  private activeVoices: SoundVoice[] = [];
  private maxConcurrentVoices: number;

  constructor(maxVoices: number) {
    this.maxConcurrentVoices = maxVoices;
  }

  public acquireVoice(newVoice: SoundVoice): void {
    // 1. หากช่องเสียงยังไม่เต็ม ให้เพิ่มได้ทันที
    if (this.activeVoices.length < this.maxConcurrentVoices) {
      ___BLANK_1___;
      return;
    }

    // 2. หากเต็มแล้ว ให้หาช่องเสียงที่มีระดับ Volume ต่ำที่สุด
    let quietestIndex = 0;
    for (let i = 1; i < this.activeVoices.length; i++) {
      if (this.activeVoices[i].volume < this.activeVoices[quietestIndex].volume) {
        quietestIndex = i;
      }
    }

    // 3. ปลดเสียงที่เบาที่สุดออก (Voice Stealing) และนำเสียงใหม่เข้ามาแทนที่
    this.activeVoices.___BLANK_2___;
    this.activeVoices.___BLANK_3___;
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เพิ่มเสียงใหม่เข้าอาร์เรย์)',
          expected: 'this.activeVoices.push(newVoice)',
          acceptedAlternatives: ['this.activeVoices.push(newVoice)', 'this.activeVoices.push(newVoice);'],
          hint: 'ใช้คำสั่ง this.activeVoices.push(newVoice)',
          options: ['this.activeVoices.push(newVoice)', 'this.activeVoices.pop()', 'this.activeVoices = []', 'newVoice = null']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ตัดเสียงที่ index เบาสุดออก)',
          expected: 'splice(quietestIndex, 1)',
          acceptedAlternatives: ['splice(quietestIndex, 1)', 'splice(quietestIndex, 1);'],
          hint: 'ใช้เมธอด splice(quietestIndex, 1)',
          options: ['splice(quietestIndex, 1)', 'shift()', 'pop()', 'slice(0, 1)']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ใส่เสียงใหม่เข้าไปแทน)',
          expected: 'push(newVoice)',
          acceptedAlternatives: ['push(newVoice)', 'push(newVoice);'],
          hint: 'ใช้คำสั่ง push(newVoice)',
          options: ['push(newVoice)', 'unshift(null)', 'clear()', 'pop()']
        }
      ],
      fullSolution: `interface SoundVoice {
  id: number;
  soundName: string;
  volume: number;
}

class AudioVoiceManager {
  private activeVoices: SoundVoice[] = [];
  private maxConcurrentVoices: number;

  constructor(maxVoices: number) {
    this.maxConcurrentVoices = maxVoices;
  }

  public acquireVoice(newVoice: SoundVoice): void {
    if (this.activeVoices.length < this.maxConcurrentVoices) {
      this.activeVoices.push(newVoice);
      return;
    }

    let quietestIndex = 0;
    for (let i = 1; i < this.activeVoices.length; i++) {
      if (this.activeVoices[i].volume < this.activeVoices[quietestIndex].volume) {
        quietestIndex = i;
      }
    }

    this.activeVoices.splice(quietestIndex, 1);
    this.activeVoices.push(newVoice);
  }
}`,
      explanation: 'Voice Stealing แบบ Quietest First เป็นมาตรฐานทองคำในอุตสาหกรรมเกม ทำให้เสียงดังที่สำคัญ (เช่น ระเบิดข้างหู) ไม่ถูกตัด และไม่เกิดปัญหาเสียงแตกพร่าจาก Clipping',
      testCaseDescription: 'ทดสอบเต็มความจุ 4 ช่อง -> ตัดเสียงเบาสุด (vol 0.1) ออกเมื่อมีเสียงใหม่เข้ามา'
    },
    unity: {
      id: 'audio-unity',
      type: 'unity',
      title: 'จำกัด Concurrency ของ AudioSource ใน Unity C#',
      language: 'csharp',
      difficulty: 'Easy',
      description: 'เขียนคลาสจัดการเสียงเพื่อจำกัดจำนวน `AudioSource` ที่เล่นพร้อมกัน ป้องกันการสร้างอินสแตนซ์ซ้ำซ้อนจนเกิด Buffer Underrun',
      conceptNotes: 'การเรียก PlayClipAtPoint บ่อยๆ จะสร้าง GameObject และ AudioSource ใหม่ทุกครั้งบน Heap ทางออกคือสร้าง Pool ของ AudioSource และจำกัดจำนวน Voice',
      starterCode: `using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour {
    [SerializeField] private AudioSource[] voicePool;
    private int nextIndex = 0;

    public void PlaySoundConcurrently(AudioClip clip, float volume) {
        // 1. หยิบ AudioSource จาก Voice Pool แบบ Ring Buffer
        AudioSource source = ___BLANK_1___;

        // 2. หยุดเสียงเดิมที่กำลังเล่นอยู่เพื่อตัดเสียง (Voice Stealing)
        if (source.isPlaying) {
            ___BLANK_2___;
        }

        // 3. กำหนดคลิปและสั่งเล่นเสียงทันที
        source.clip = clip;
        source.volume = volume;
        ___BLANK_3___;

        nextIndex = (nextIndex + 1) % voicePool.Length;
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ดึง AudioSource ตาม nextIndex)',
          expected: 'voicePool[nextIndex]',
          acceptedAlternatives: ['voicePool[nextIndex]', 'this.voicePool[nextIndex]'],
          hint: 'เข้าถึง voicePool ด้วยดัชนี nextIndex',
          options: ['voicePool[nextIndex]', 'new AudioSource()', 'Camera.main.GetComponent<AudioSource>()', 'null']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (สั่งหยุดเสียงเดิม)',
          expected: 'source.Stop()',
          acceptedAlternatives: ['source.Stop()', 'source.Stop();'],
          hint: 'เรียกเมธอด source.Stop()',
          options: ['source.Stop()', 'source.Pause()', 'Destroy(source)', 'source.mute = true']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (สั่งเริ่มเล่นเสียง)',
          expected: 'source.Play()',
          acceptedAlternatives: ['source.Play()', 'source.Play();'],
          hint: 'เรียกเมธอด source.Play()',
          options: ['source.Play()', 'source.PlayOneShot(clip)', 'source.mute = false', 'source.enabled = true']
        }
      ],
      fullSolution: `using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour {
    [SerializeField] private AudioSource[] voicePool;
    private int nextIndex = 0;

    public void PlaySoundConcurrently(AudioClip clip, float volume) {
        AudioSource source = voicePool[nextIndex];

        if (source.isPlaying) {
            source.Stop();
        }

        source.clip = clip;
        source.volume = volume;
        source.Play();

        nextIndex = (nextIndex + 1) % voicePool.Length;
    }
}`,
      explanation: 'การใช้ Fixed Pool ร่วมกับ Round-Robin Voice Stealing ช่วยให้ Unity Audio Engine ไม่เกิด Memory Spike และเสียงไม่ขาดตอน',
      testCaseDescription: 'ทดสอบหมุนเวียนเล่นเสียงใน Pool สำเร็จโดยไม่ Instantiate เพิ่ม'
    },
    unreal: {
      id: 'audio-unreal',
      type: 'unreal',
      title: 'ตั้งค่า Sound Concurrency และ Voice Stealing ใน Unreal C++',
      language: 'cpp',
      difficulty: 'Medium',
      description: 'เขียนโค้ดตั้งค่า `FSoundConcurrencySettings` เพื่อจำกัดจำนวนเสียงและกำหนด `ResolutionRule` ให้เป็น `StopOldest` ใน Unreal Engine',
      conceptNotes: 'Unreal Engine มีระบบ Sound Concurrency ที่มีประสิทธิภาพสูง ช่วยให้สามารถจัดหมวดหมู่เสียง (เช่น Explosions, Weapons, Footsteps) และกำหนดโควตาแยกกันได้',
      starterCode: `#include "Sound/SoundConcurrency.h"

void ConfigureExplosionConcurrency(USoundConcurrency* ConcurrencyAsset) {
    if (!ConcurrencyAsset) return;

    // 1. จำกัดจำนวนเสียงที่เล่นพร้อมกันสูงสุด 4 ช่อง
    ConcurrencyAsset->Concurrency.___BLANK_1___ = 4;

    // 2. กำหนดกฎการแย่งช่องเสียงให้ตัดเสียงที่เก่าที่สุด (Stop Oldest)
    ConcurrencyAsset->Concurrency.___BLANK_2___ = ___BLANK_3___;
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (ตัวแปรจำกัดจำนวนเสียง MaxCount)',
          expected: 'MaxCount',
          acceptedAlternatives: ['MaxCount'],
          hint: 'ตัวแปร MaxCount ใน Concurrency struct',
          options: ['MaxCount', 'VolumeScale', 'Priority', 'VoiceLimit']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ตัวแปรกฎ ResolutionRule)',
          expected: 'ResolutionRule',
          acceptedAlternatives: ['ResolutionRule'],
          hint: 'ตัวแปร ResolutionRule ใน FSoundConcurrencySettings',
          options: ['ResolutionRule', 'StealRule', 'PriorityRule', 'PlayMode']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (Enum ค่าตัดเสียงเก่าที่สุด)',
          expected: 'EMaxConcurrentResolutionRule::StopOldest',
          acceptedAlternatives: ['EMaxConcurrentResolutionRule::StopOldest'],
          hint: 'ใช้ enum EMaxConcurrentResolutionRule::StopOldest',
          options: [
            'EMaxConcurrentResolutionRule::StopOldest',
            'EMaxConcurrentResolutionRule::StopQuietest',
            'EMaxConcurrentResolutionRule::PreventNew',
            '0'
          ]
        }
      ],
      fullSolution: `#include "Sound/SoundConcurrency.h"

void ConfigureExplosionConcurrency(USoundConcurrency* ConcurrencyAsset) {
    if (!ConcurrencyAsset) return;

    ConcurrencyAsset->Concurrency.MaxCount = 4;
    ConcurrencyAsset->Concurrency.ResolutionRule = EMaxConcurrentResolutionRule::StopOldest;
}`,
      explanation: 'การใช้ Sound Concurrency ใน Unreal Engine ช่วยลดภาระการผสมเสียงของ XAudio2/AudioMixer ทำให้เสียงยังคมชัดแม้ในฉากสงครามขนาดใหญ่',
      testCaseDescription: 'ทดสอบตั้งค่า MaxCount = 4 และ ResolutionRule = StopOldest สำเร็จ'
    }
  },

  'async-loading': {
    pureLogic: {
      id: 'async-pure',
      type: 'pure',
      title: 'สร้าง Async Asset Loader Queue ด้วย Promise และ Priority Batching',
      language: 'typescript',
      difficulty: 'Medium',
      description: 'เขียนคลาส `AsyncAssetLoader` ที่ประมวลผลคำขอโหลดไฟล์ตามลำดับความสำคัญ (Priority) แบบไม่บล็อก Event Loop ของเกม',
      conceptNotes: 'การโหลดไฟล์จากดิสก์หรือเน็ตเวิร์กต้องดำเนินการแบบ Asynchronous เสมอเพื่อรักษา Frame Rate ให้อยู่ที่ 60 FPS โดยใช้ Priority Queue ในการคัดเลือกไฟล์ของฉากที่ใกล้ตัวผู้เล่นที่สุดก่อน',
      starterCode: `interface LoadRequest<T> {
  assetId: string;
  priority: number; // ยิ่งสูงยิ่งสำคัญ
  resolve: (data: T) => void;
}

class AsyncAssetLoader<T> {
  private queue: LoadRequest<T>[] = [];
  private isProcessing = false;

  public requestLoad(assetId: string, priority: number): Promise<T> {
    return new Promise((resolve) => {
      // 1. เพิ่มคำขอเข้า Queue และเรียงตามลำดับ Priority จากมากไปน้อย
      this.queue.push({ assetId, priority, resolve });
      this.queue.sort((a, b) => ___BLANK_1___);

      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    // 2. ดึงคำขอที่มีความสำคัญสูงสุดออกมา
    const item = ___BLANK_2___;

    // 3. จำลองการโหลดแบบ Asynchronous ไม่บล็อกเธรด
    const loadedData = await this.mockDiskRead(item.assetId);
    item.resolve(loadedData);

    this.isProcessing = false;
    this.processNext();
  }

  private mockDiskRead(id: string): Promise<T> {
    return new Promise(r => setTimeout(() => r({ id } as unknown as T), 10));
  }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (สูตรเรียงลำดับ Priority จากมากไปน้อย)',
          expected: 'b.priority - a.priority',
          acceptedAlternatives: ['b.priority - a.priority'],
          hint: 'เรียงจากมากไปน้อย: b.priority - a.priority',
          options: ['b.priority - a.priority', 'a.priority - b.priority', '0', 'a.priority + b.priority']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ดึงรายการแรกของคิว)',
          expected: 'this.queue.shift()!',
          acceptedAlternatives: ['this.queue.shift()!', 'this.queue.shift()', 'this.queue.pop()!'],
          hint: 'นำตัวแรกออกจากอาร์เรย์ด้วย this.queue.shift()!',
          options: ['this.queue.shift()!', 'this.queue.pop()!', 'this.queue[0]', 'new Object()']
        }
      ],
      fullSolution: `interface LoadRequest<T> {
  assetId: string;
  priority: number;
  resolve: (data: T) => void;
}

class AsyncAssetLoader<T> {
  private queue: LoadRequest<T>[] = [];
  private isProcessing = false;

  public requestLoad(assetId: string, priority: number): Promise<T> {
    return new Promise((resolve) => {
      this.queue.push({ assetId, priority, resolve });
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue.shift()!;
    const loadedData = await this.mockDiskRead(item.assetId);
    item.resolve(loadedData);

    this.isProcessing = false;
    this.processNext();
  }

  private mockDiskRead(id: string): Promise<T> {
    return new Promise(r => setTimeout(() => r({ id } as unknown as T), 10));
  }
}`,
      explanation: 'การใช้ Asynchronous Queue ทำให้กระบวนการ I/O แยกออกจาก Loop การเรนเดอร์กราฟิก ช่วยขจัดปัญหาเฟรมเรตร่วงเหลือ 0 FPS อย่างสมบูรณ์',
      testCaseDescription: 'ทดสอบโหลดคำขอ 2 รายการ (priority 1 และ 10) -> รายการ priority 10 โหลดเสร็จก่อน'
    },
    unity: {
      id: 'async-unity',
      type: 'unity',
      title: 'โหลด Asset เบื้องหลังด้วย Unity Addressables API ใน C#',
      language: 'csharp',
      difficulty: 'Medium',
      description: 'เขียนโค้ดเรียกใช้งาน `Addressables.LoadAssetAsync<T>` พร้อมผูก Event เมื่อโหลดเสร็จและปล่อย `Addressables.Release` เมื่อเลิกใช้งาน',
      conceptNotes: 'การใช้ Resources.Load เป็น Bad Practice ที่ทำให้เกิดเฟรมกระตุกและเพิ่มขนาด Build Addressables จึงเป็นโซลูชันมาตรฐานของ Unity สำหรับการสตรีม Asset',
      starterCode: `using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class BossSpawner : MonoBehaviour {
    [SerializeField] private string bossAddressableKey = "Assets/Prefabs/GiantBoss.prefab";
    private AsyncOperationHandle<GameObject> loadHandle;

    public void SpawnBossAsync() {
        // 1. สั่งโหลด Asset แบบ Asynchronous ในพื้นหลัง
        loadHandle = ___BLANK_1___;

        // 2. ผูกฟังก์ชัน Callback เมื่อโหลดเสร็จ
        loadHandle.Completed += OnBossLoaded;
    }

    private void OnBossLoaded(AsyncOperationHandle<GameObject> handle) {
        if (handle.Status == AsyncOperationStatus.Succeeded) {
            Instantiate(handle.Result, transform.position, Quaternion.identity);
        }
    }

    void OnDestroy() {
        // 3. ปลดปล่อยหน่วยความจำ Handle เมื่อยกเลิกใช้งาน
        if (loadHandle.IsValid()) {
            ___BLANK_2___;
        }
    }
}`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (เรียกคำสั่งโหลด Async ของ Addressables)',
          expected: 'Addressables.LoadAssetAsync<GameObject>(bossAddressableKey)',
          acceptedAlternatives: [
            'Addressables.LoadAssetAsync<GameObject>(bossAddressableKey)',
            'Addressables.LoadAssetAsync<GameObject>(bossAddressableKey);'
          ],
          hint: 'เรียก Addressables.LoadAssetAsync<GameObject>(bossAddressableKey)',
          options: [
            'Addressables.LoadAssetAsync<GameObject>(bossAddressableKey)',
            'Resources.Load<GameObject>(bossAddressableKey)',
            'AssetDatabase.LoadAssetAtPath(bossAddressableKey)',
            'Instantiate(bossAddressableKey)'
          ]
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (ปล่อยหน่วยความจำ Addressables.Release)',
          expected: 'Addressables.Release(loadHandle)',
          acceptedAlternatives: ['Addressables.Release(loadHandle)', 'Addressables.Release(loadHandle);'],
          hint: 'เรียก Addressables.Release(loadHandle)',
          options: [
            'Addressables.Release(loadHandle)',
            'Destroy(loadHandle)',
            'loadHandle = null',
            'GC.Collect()'
          ]
        }
      ],
      fullSolution: `using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class BossSpawner : MonoBehaviour {
    [SerializeField] private string bossAddressableKey = "Assets/Prefabs/GiantBoss.prefab";
    private AsyncOperationHandle<GameObject> loadHandle;

    public void SpawnBossAsync() {
        loadHandle = Addressables.LoadAssetAsync<GameObject>(bossAddressableKey);
        loadHandle.Completed += OnBossLoaded;
    }

    private void OnBossLoaded(AsyncOperationHandle<GameObject> handle) {
        if (handle.Status == AsyncOperationStatus.Succeeded) {
            Instantiate(handle.Result, transform.position, Quaternion.identity);
        }
    }

    void OnDestroy() {
        if (loadHandle.IsValid()) {
            Addressables.Release(loadHandle);
        }
    }
}`,
      explanation: 'Unity Addressables แยกการจัดการ Asset และ Memory Management ออกจาก Scene ช่วยให้เกมโหลดฉากและมอนสเตอร์ได้ต่อเนื่องโดยไม่มีอาการกระตุก',
      testCaseDescription: 'ทดสอบเรียก LoadAssetAsync และ Release Handle เมื่อทำลาย Object'
    },
    unreal: {
      id: 'async-unreal',
      type: 'unreal',
      title: 'โหลด Asset เบื้องหลังด้วย FStreamableManager และ TSoftObjectPtr ใน Unreal C++',
      language: 'cpp',
      difficulty: 'Hard',
      description: 'ใช้ `FStreamableManager::RequestAsyncLoad` ร่วมกับ `TSoftObjectPtr` เพื่อสตรีม Static Mesh เข้าสู่เกมแบบ Asynchronous',
      conceptNotes: 'การใช้ Cast<UStaticMesh>(StaticLoadObject(...)) เป็นคำสั่งแบบ Blocking ที่จะหยุดการทำงานของ Game Thread การใช้ Soft Object Reference ร่วมกับ StreamableManager จะทำให้ไฟล์ถูกอ่านในเธรดเบื้องหลัง',
      starterCode: `#include "Engine/StreamableManager.h"
#include "Engine/AssetManager.h"

class AAsyncMeshSpawner : public AActor {
public:
    // 1. ตัวแปรเก็บ Soft Object Reference (ไม่โหลดเข้าหน่วยความจำทันที)
    UPROPERTY(EditAnywhere)
    ___BLANK_1___<UStaticMesh> MeshAssetToLoad;

    void StartAsyncLoading() {
        FStreamableManager& Streamable = UAssetManager::GetStreamableManager();

        // 2. ขอโหลด Asset ในเบื้องหลังพร้อมระบุ Callback Delegate
        Streamable.___BLANK_2___(
            MeshAssetToLoad.ToSoftObjectPath(),
            FStreamableDelegate::CreateUObject(this, &AAsyncMeshSpawner::OnMeshLoaded)
        );
    }

    void OnMeshLoaded() {
        // 3. ดึง Pointer ตัวจริงหลังโหลดเสร็จ
        UStaticMesh* LoadedMesh = MeshAssetToLoad.___BLANK_3___;
        if (LoadedMesh) {
            // ทำการ Spawn หรือกำหนดค่าให้ StaticMeshComponent
        }
    }
};`,
      blanks: [
        {
          id: 'blank-1',
          label: 'ช่องว่างที่ 1 (Template Type ของ Soft Reference)',
          expected: 'TSoftObjectPtr',
          acceptedAlternatives: ['TSoftObjectPtr'],
          hint: 'ใช้คลาสเทมเพลต TSoftObjectPtr',
          options: ['TSoftObjectPtr', 'TSubclassOf', 'TWeakObjectPtr', 'UStaticMesh*']
        },
        {
          id: 'blank-2',
          label: 'ช่องว่างที่ 2 (เมธอด RequestAsyncLoad ของ Streamable)',
          expected: 'RequestAsyncLoad',
          acceptedAlternatives: ['RequestAsyncLoad'],
          hint: 'เมธอด RequestAsyncLoad',
          options: ['RequestAsyncLoad', 'LoadSynchronous', 'SyncLoad', 'StreamIn']
        },
        {
          id: 'blank-3',
          label: 'ช่องว่างที่ 3 (ดึง Object ด้วยเมธอด Get)',
          expected: 'Get()',
          acceptedAlternatives: ['Get()', 'Get();'],
          hint: 'เรียกเมธอด Get() ของ TSoftObjectPtr',
          options: ['Get()', 'Load()', 'Resolve()', 'Value()']
        }
      ],
      fullSolution: `#include "Engine/StreamableManager.h"
#include "Engine/AssetManager.h"

class AAsyncMeshSpawner : public AActor {
public:
    UPROPERTY(EditAnywhere)
    TSoftObjectPtr<UStaticMesh> MeshAssetToLoad;

    void StartAsyncLoading() {
        FStreamableManager& Streamable = UAssetManager::GetStreamableManager();

        Streamable.RequestAsyncLoad(
            MeshAssetToLoad.ToSoftObjectPath(),
            FStreamableDelegate::CreateUObject(this, &AAsyncMeshSpawner::OnMeshLoaded)
        );
    }

    void OnMeshLoaded() {
        UStaticMesh* LoadedMesh = MeshAssetToLoad.Get();
        if (LoadedMesh) {
        }
    }
};`,
      explanation: 'TSoftObjectPtr และ FStreamableManager คือเทคโนโลยีหัวใจของเกม Open World ใน Unreal Engine ช่วยให้สตรีมแผนที่และโมเดลขนาดหลายกิกะไบต์ได้โดยไม่มี Hitches หรือ Stuttering',
      testCaseDescription: 'ทดสอบประกาศ TSoftObjectPtr, RequestAsyncLoad และเข้าถึง Get() สำเร็จ'
    }
  }
};
