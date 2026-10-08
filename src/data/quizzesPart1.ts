import type { TopicQuizData } from '../types/quiz';

export const QUIZZES_PART_1: Record<string, TopicQuizData> = {
  // =========================================================================
  // 1. OBJECT POOLING
  // =========================================================================
  'object-pooling': {
    topicId: 'object-pooling',
    beginner: [
      {
        id: 'pool-b-1',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การดึงออบเจกต์ออกจาก Free-List',
        prompt: 'เลือกบล็อกคำสั่งที่เหมาะสมในการดึงวัตถุที่พร้อมใช้งานออกจาก Stack / Array ของ Free List:',
        codeSnippet: `public acquire(): Bullet {
  if (this.freeList.length > 0) {
    return ___BLANK___; // ดึงออบเจกต์ตัวท้ายสุดออกมาแบบ O(1)
  }
  return this.createNewBullet();
}`,
        options: ['this.freeList.pop()!', 'this.freeList.shift()!', 'new Bullet()', 'this.freeList[0]'],
        correctAnswer: 'this.freeList.pop()!',
        hint: 'การดึงตัวท้ายสุดของ Array (pop) ใช้เวลา O(1) โดยไม่ต้องเลื่อน Index สมาชิกทั้งหมดเหมือน shift()',
        explanation: '`pop()` ดึงสมาชิกตัวสุดท้ายของ Array ออกมาในเวลา O(1) ซึ่งมีประสิทธิภาพสูงสุดสำหรับ Stack/Free List',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-b-2',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'สาเหตุที่ GC ทำงานหนักจนเกมกระตุก',
        prompt: 'การสร้างและทำลายออบเจกต์ด้วยคำสั่ง new และ Destroy() ซ้ำๆ บ่อยครั้ง จะทำให้เกิด ___BLANK___ บน Managed Heap:',
        codeSnippet: `// ปัญหาเดิมก่อนทำ Object Pool:
void Update() {
  if (Input.GetButton("Fire")) {
    GameObject b = Instantiate(bulletPrefab); // เกิด ___BLANK___ ต่อเนื่อง
    Destroy(b, 2.0f);
  }
}`,
        options: ['Garbage Churn & Fragmentation', 'CPU Core Shutdown', 'GPU Vertex Loss', 'Infinite Stack Overflow'],
        correctAnswer: 'Garbage Churn & Fragmentation',
        hint: 'การจองและทิ้งหน่วยความจำถี่ๆ จะสะสมขยะจนตัวเก็บกวาดขยะต้องสั่งหยุดเกมชั่วคราว',
        explanation: 'Garbage Churn คือการที่หน่วยความจำชั่วคราวสะสมขยะอย่างรวดเร็ว ทำให้ GC ต้องสั่ง Stop-The-World เพื่อเก็บกวาด ส่งผลให้เกิด Frametime Spike',
        engineContext: 'Unity',
      },
      {
        id: 'pool-b-3',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การล้างค่าสถานะก่อนเก็บเข้า Pool (Prevent Dirty State)',
        prompt: 'ก่อนที่จะส่ง Bullet กลับเข้า Pool คำสั่งใดจำเป็นต้องทำเพื่อป้องกันสถานะตกค้าง:',
        codeSnippet: `public release(bullet: Bullet): void {
  ___BLANK___; // ล้างค่าสถานะ (ความเร็ว, เลือด, ทิศทาง)
  bullet.active = false;
  this.freeList.push(bullet);
}`,
        options: ['bullet.resetState()', 'delete bullet', 'bullet.destroy()', 'bullet.clone()'],
        correctAnswer: 'bullet.resetState()',
        hint: 'ต้องรีเซ็ตค่าสถานะของวัตถุให้กลับเป็นค่าเริ่มต้นสะอาดก่อนนำกลับมาใช้ซ้ำ',
        explanation: 'Dirty State Bug เกิดขึ้นเมื่อนำกระสุนเก่ามาใช้แล้วยังมีแรงเฉื่อยหรือตำแหน่งค้างอยู่ การเรียก resetState() ล้างคือกฎสำคัญที่สุดของ Pool',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-b-4',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ช่วงเวลาที่เหมาะสมที่สุดในการสร้างวัตถุเข้า Pool (Pre-allocation)',
        prompt: 'ช่วงเวลาใดที่เกมควรทำการวนลูปสร้างวัตถุจำนวน 1,000 ชิ้นเตรียมไว้ใน Pool?',
        options: [
          'ตอนโหลดฉาก (Loading Screen / Init / Awake) ก่อนเริ่มเล่น',
          'ตอนที่ผู้เล่นกดยิงกระสุนนัดแรกกลางสมรภูมิ',
          'ในฟังก์ชัน Update() ของทุกๆ เฟรม',
          'ตอนที่เฟรมเรตร่วงต่ำกว่า 30 FPS'
        ],
        correctAnswer: 0,
        hint: 'ควรสร้างตอนที่ผู้เล่นยังไม่เห็นภาพการเล่น เพื่อไม่ให้กระทบต่อเฟรมเรต 60 FPS',
        explanation: 'การ Pre-warm (Pre-allocation) ระหว่าง Loading Screen ทำให้ค่าใช้จ่ายในการจองหน่วยความจำไม่ไปแย่ง Frame Budget ระหว่างเล่นเกม',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-b-5',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การคืนวัตถุเข้า Pool ใน Unity C#',
        prompt: 'เมื่อกระสุนชนเป้าหมายและใช้ระบบ UnityEngine.Pool ควรสั่งคำสั่งใด:',
        codeSnippet: `void OnCollisionEnter(Collision col) {
  // แทนที่จะ Destroy(gameObject);
  ___BLANK___; // คืนสู่ ObjectPool ใน Unity
}`,
        options: ['pool.Release(this)', 'Destroy(gameObject)', 'gameObject.SetActive(false)', 'pool.Clear()'],
        correctAnswer: 'pool.Release(this)',
        hint: 'UnityEngine.Pool.ObjectPool<T> มีเมธอด Release เพื่อรับออบเจกต์กลับเข้าคลัง',
        explanation: '`pool.Release(this)` จะส่ง instance คืนให้ตัวจัดการ Pool เพื่อนำไปปิด Active และเก็บเข้า Stack รอการใช้งานรอบใหม่',
        engineContext: 'Unity',
      },
      {
        id: 'pool-b-6',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'โครงสร้างข้อมูลพื้นฐานของ Pool',
        prompt: 'โครงสร้างข้อมูล (Data Structure) ที่นิยมที่สุดในการเก็บ Free List สำหรับการดึงและคืนแบบ LIFO/O(1) คือ ___BLANK___:',
        codeSnippet: `// โครงสร้างข้อมูลที่ใช้:
class ObjectPool<T> {
  private freeItems: ___BLANK___;
}`,
        options: ['Stack<T> หรือ Array', 'LinkedList<T>', 'BinarySearchTree<T>', 'SortedDictionary<K, V>'],
        correctAnswer: 'Stack<T> หรือ Array',
        hint: 'โครงสร้างนี้มี Push และ Pop รวดเร็วระดับ O(1) และข้อมูลเรียงต่อเนื่องในแคช',
        explanation: 'Stack หรือ Dynamic Array ให้แคชโลคัลลิตี้ที่ดีที่สุดและมีเวลา amortized O(1) สำหรับการ Push/Pop',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-b-7',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'พฤติกรรมของ Pool เมื่อกระสุนถูกเบิกใช้จนหมดคลัง',
        prompt: 'หากใน Pool เตรียมไว้ 100 ลูก แต่วินาทีนั้นมีการยิง 120 ลูก นโยบายความปลอดภัยทั่วไปของ Pool ควรทำอย่างไร?',
        options: [
          'สร้างออบเจกต์ใหม่ชั่วคราวแล้วขยายขนาด Pool (Grow Capacity) แล้วคืนกลับ',
          'แครชเกมทันทีเพื่อแจ้งเตือนโปรแกรมเมอร์',
          'ห้ามยิงกระสุนและลบกระสุนเก่าทิ้งทั้งหมดทันที',
          'ปิดหน้าจอเกมชั่วคราวเพื่อรอกระสุนใบ้'
        ],
        correctAnswer: 0,
        hint: 'ระบบที่ดีต้องไม่ขัดขวางการเล่น แต่ควรขยายตัวชั่วคราวเพื่อรองรับ Peak Load',
        explanation: 'Dynamic Fallback คือการ instantiate วัตถุเพิ่มเฉพาะยามจำเป็นเพื่อความลื่นไหลของเกม แล้วจึงคืนเข้า Pool เพื่อขยายคลังรองรับอนาคต',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-b-8',
        topicId: 'object-pooling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การซ่อนออบเจกต์เมื่อถูกเก็บใน Pool',
        prompt: 'การส่งคืนออบเจกต์เข้า Pool มักต้องปิดการแสดงผลและการคำนวณฟิสิกส์ด้วยคำสั่งใด:',
        codeSnippet: `public void OnReturnedToPool() {
  ___BLANK___; // ปิดการแสดงผลและการรันสคริปต์
}`,
        options: ['gameObject.SetActive(false)', 'DestroyImmediate(gameObject)', 'Application.Quit()', 'Camera.main.clear()'],
        correctAnswer: 'gameObject.SetActive(false)',
        hint: 'เปลี่ยนสถานะของ GameObject ให้ไม่ Active',
        explanation: 'การ SetActive(false) ทำให้เอนจินข้ามการ Render และ Update ของวัตถุนั้น โดยไม่ต้องทำลายทิ้งจากหน่วยความจำ',
        engineContext: 'Unity',
      },
    ],
    practical: [
      {
        id: 'pool-p-1',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการบั๊ก: กระสุนเก่าพุ่งจากตำแหน่งประหลาด (Dirty State)',
        prompt: 'ผู้เล่นสังเกตว่าเมื่อเล่นไป 2 นาที กระสุนบางนัดที่ถูกยิงออกมาจะวาร์ปไปโดนศัตรูทันที หรือมีความเร็วสูงผิดปกติ สาเหตุเชิงสถาปัตยกรรมเกิดจากอะไร?',
        options: [
          'กระสุนถูก Release คืนเข้า Pool โดยไม่มีการ Reset ตำแหน่งและความเร็วฟิสิกส์ (Rigidbody.velocity = Vector3.zero)',
          'ฮาร์ดแวร์ GPU ร้อนเกินไปจนสูญเสียความแม่นยำของทศนิยม',
          'ระบบ GC ทำการลบค่าพิกัดของกระสุนทิ้งระหว่างเล่น',
          'Unity Physics Engine ไม่รองรับวัตถุเกิน 50 ชิ้น'
        ],
        correctAnswer: 0,
        hint: 'สังเกตค่าสถานะเดิมที่ยังค้างอยู่ในวัตถุก่อนส่งคืน Pool',
        explanation: 'หากไม่ล้าง velocity และ transform.position ใน OnRelease() กระสุนที่ถูกดึงออกมาใหม่จะยังคงมีแรงเฉื่อยและความเร็วเดิมจากชาติที่แล้ว',
        engineContext: 'Unity',
      },
      {
        id: 'pool-p-2',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'ปัญหา Pool Leak และแนวทางตรวจจับในโปรดักชัน',
        prompt: 'หากทีมพัฒนาพบว่า memory ของเกมสูงขึ้นเรื่อยๆ ทั้งที่ใช้ Object Pool แล้ว ตรวจสอบพบว่าวัตถุถูก Acquire ไปแต่ไม่เคยถูก Release คืนมา เทคนิคใดช่วยแก้ปัญหานี้ได้ดีที่สุด?',
        options: [
          'ใส่ตัวจับเวลา Time-to-Live (Auto-return Timeout) หรือใช้นโยบาย Leak Detection Counter ใน Debug Build',
          'สั่ง Restart แอพพลิเคชันทุกๆ 10 นาทีแบบเงียบๆ',
          'เปลี่ยนไปใช้ Instantiate/Destroy แบบเดิมเพื่อปล่อยให้ GC จัดการ',
          'เพิ่มแรมของเครื่องเซิร์ฟเวอร์เป็น 128GB'
        ],
        correctAnswer: 0,
        hint: 'การคืนวัตถุอัตโนมัติหากเกินเวลาที่กำหนดช่วยป้องกันวัตถุที่ลอยหายไปในอวกาศ',
        explanation: 'Auto-return (TTL) เช่น คืนกระสุนเข้า Pool อัตโนมัติหลัง 3 วินาที ป้องกันการลืมเรียก Release และตัวนับ Active vs Free ช่วยเตือนโปรแกรมเมอร์ได้ทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-p-3',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Unreal Engine AActor Spawning Overhead vs Object Pool',
        prompt: 'ใน Unreal Engine 5 เหตุใดการเรียก `SpawnActor<AActor>()` ซ้ำๆ ทุกเฟรมจึงกิน CPU มากกว่าใน C++ ธรรมดา?',
        options: [
          'เพราะ SpawnActor ต้องลงทะเบียน Actor กับ UWorld, สร้าง Component Hierarchy, ผูก Tick Function, และจัดการ Network Replication',
          'เพราะ Unreal Engine ใช้ Garbage Collection ที่ช้ากว่า Python',
          'เพราะ C++ ใน Unreal ทำงานช้ากว่า JavaScript บนเบราว์เซอร์',
          'เพราะ GPU ต้องหยุดรอ Shader Compile ทุกครั้งที่ SpawnActor ถูกเรียก'
        ],
        correctAnswer: 0,
        hint: 'Actor ใน Unreal ไม่ใช่แค่ struct ธรรมดา แต่ผูกกับระบบโครงสร้างโลกทั้งระบบ',
        explanation: 'AActor มี Overhead มหาศาลในการลงทะเบียนเข้า UWorld และสร้าง USceneComponent การใช้ Pool หรือ Niagara Particle Systems จึงเร็วกว่าหลัก 10-100 เท่า',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'pool-p-4',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'step-order',
        title: 'เรียงลำดับขั้นตอนวงจรชีวิต (Lifecycle) ของวัตถุใน Object Pool',
        prompt: 'เรียงลำดับขั้นตอนที่ถูกต้องตั้งแต่การเตรียมวัตถุจนถึงการนำกลับมาใช้ซ้ำ:',
        options: [
          'Pre-warm: จองหน่วยความจำและสร้างวัตถุเก็บใน Free List ตอนโหลดฉาก',
          'Acquire: นำวัตถุออกจากคลังและตั้งค่าพิกัดเริ่มต้น',
          'Active Usage: เปิดการมองเห็นและรันเกมเพลย์ตามปกติ',
          'Release & Clean: ล้างค่าสถานะ ปิด Active แล้วส่งคืนกลับเข้า Free List'
        ],
        correctAnswer: [
          'Pre-warm: จองหน่วยความจำและสร้างวัตถุเก็บใน Free List ตอนโหลดฉาก',
          'Acquire: นำวัตถุออกจากคลังและตั้งค่าพิกัดเริ่มต้น',
          'Active Usage: เปิดการมองเห็นและรันเกมเพลย์ตามปกติ',
          'Release & Clean: ล้างค่าสถานะ ปิด Active แล้วส่งคืนกลับเข้า Free List'
        ],
        hint: 'เริ่มจากการเตรียมล่วงหน้า -> ดึงใช้ -> ใช้งาน -> คืนคลัง',
        explanation: 'นี่คือขั้นตอนมาตรฐาน: 1. Pre-warm -> 2. Acquire -> 3. Active -> 4. Reset & Release',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-p-5',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Thread-Safety ใน Multi-threaded Job System',
        prompt: 'หากมี Worker Threads 16 ตัวต้องการขอเบิกกระสุนจาก Object Pool ตัวเดียวกันพร้อมกัน การออกแบบโครงสร้างใดหลีกเลี่ยง Lock Contention ได้ดีที่สุด?',
        options: [
          'ใช้ Thread-Local Pools (แต่ละเธรดมี Pool เป็นของตัวเอง) หรือ Lock-free Concurrent Queue',
          'ใช้ lock (mutex) ขวางทุกครั้งที่มีการเข้าถึง ทำให้ทุกเธรดต้องต่อคิวรอ',
          'ให้ทุกเธรดสั่ง new Bullet() แยกกันบน Heap',
          'ปิดการทำงานของ Multi-threading แล้วกลับไปรัน Single-thread'
        ],
        correctAnswer: 0,
        hint: 'แยกคลังของแต่ละคนออกจากกันเพื่อไม่ต้องแย่งกุญแจล็อคห้อง',
        explanation: 'Thread-Local Storage (TLS) Pools กำจัดการแข่งขันชิง Mutex ได้ 100% ทำให้แต่ละ Core สามารถ Acquire/Release ได้ด้วยความเร็วสูงสุด',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'pool-p-6',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ Profiler: เฟรมหล่น 20ms ตอนเริ่มเกม (Over-prewarming)',
        prompt: 'เกมมือถือใช้เวลาโหลดฉากนานเกินไปและหน่วยความจำเต็มจน OS ปิดแอพ (OOM Crash) Profiler ระบุว่ามี Bullet Pool ที่ Prewarm วัตถุไว้ 50,000 ลูกทั้งที่ใช้จริงพร้อมกันสูงสุด 400 ลูก แนวทางแก้คืออะไร?',
        options: [
          'ลดขนาด Initial Capacity ลงเหลือ 500-600 ลูก และตั้งขีดจำกัด Max Capacity พร้อมเปิด Dynamic Expansion ยามจำเป็น',
          'เพิ่มขีดจำกัดหน่วยความจำเสมือนบนโทรศัพท์มือถือ',
          'บังคับให้ผู้เล่นเคลียร์ RAM โทรศัพท์ก่อนเล่นเกม',
          'เปลี่ยนไปเก็บข้อมูลทั้งหมดในฐานข้อมูล SQLite บนเครื่อง'
        ],
        correctAnswer: 0,
        hint: 'อย่าเตรียมของไว้เยอะเกินกว่า Peak Load ที่เกิดขึ้นจริง',
        explanation: 'Over-prewarming ทำให้เปลือง RAM โดยเปล่าประโยชน์และทำให้เวลาโหลดฉากพุ่งสูง ควรตั้ง Initial Capacity ให้ใกล้เคียง Realistic Peak โหลด',
        engineContext: 'General Engine',
      },
      {
        id: 'pool-p-7',
        topicId: 'object-pooling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Continuous Memory vs Pointer-based Free-List ใน C++',
        prompt: 'ใน High-performance C++ Engine ทำไมเราจึงนิยมเก็บ Pool Items ใน contiguous `std::vector<T>` และใช้ Index เป็น Free List แทนที่จะใช้ Array ของ Pointers `std::vector<T*>`?',
        options: [
          'เพื่อลด Cache Miss จาก Pointer Chasing และให้ข้อมูลเรียงติดกันใน L1/L2 Data Cache Lines (64 Bytes)',
          'เพราะภาษา C++ ไม่รองรับการใช้งาน Pointer อีกต่อไปในยุคปัจจุบัน',
          'เพื่อป้องกันไม่ให้ฮาร์ดแวร์กราฟิกเกิดความสับสนระหว่าง 32-bit กับ 64-bit',
          'เพราะ Pointers กินพื้นที่แบนด์วิดท์ของระบบเครือข่าย'
        ],
        correctAnswer: 0,
        hint: 'พอยน์เตอร์ชี้ไปคนละทิศคนละทางในหน่วยความจำ ทำให้ CPU ดึงข้อมูลเข้าแคชยาก',
        explanation: 'Pointer Chasing ทำให้ CPU เสียรอบคำนวณ (Stall) รอข้อมูลจาก RAM หลัก การเก็บข้อมูลแบบ Contiguous Block ทำให้ CPU Prefetcher โหลดข้อมูลเข้า L1 Cache ได้ทันที',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 2. SPATIAL PARTITIONING
  // =========================================================================
  'spatial-partitioning': {
    topicId: 'spatial-partitioning',
    beginner: [
      {
        id: 'spatial-b-1',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การแปลงพิกัด World Space สู่ Grid Cell Coordinates',
        prompt: 'เติมสูตรคำนวณตำแหน่ง Grid Cell จากพิกัด x ของวัตถุในโลกเกม:',
        codeSnippet: `function getCellX(worldX: number, cellSize: number): number {
  return ___BLANK___; // แปลงพิกัดโลกเป็นดัชนีช่องของกริด
}`,
        options: ['Math.floor(worldX / cellSize)', 'worldX * cellSize', 'worldX % cellSize', 'Math.round(worldX + cellSize)'],
        correctAnswer: 'Math.floor(worldX / cellSize)',
        hint: 'การหารด้วยขนาดช่องแล้วปัดเศษลง (floor) จะได้ index ของช่องที่วัตถุนั้นอยู่',
        explanation: '`Math.floor(worldX / cellSize)` คือสูตรมาตรฐานในการหา cell coordinate แบบ $O(1)$ โดยไม่ขึ้นกับจำนวนวัตถุ',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-2',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'การลดความซับซ้อนของการตรวจจับการชน (Big-O)',
        prompt: 'การตรวจจับการชนแบบ Brute-Force (ทุกตัวเทียบทุกตัว) มีความซับซ้อนที่ $O(N^2)$ แต่ Spatial Grid ช่วยลดลงมาเหลือประมาณ ___BLANK___ ในกรณีทั่วไป:',
        codeSnippet: `// จำนวนคู่ที่ต้องตรวจสอบ:
// Brute-force: N * (N - 1) / 2
// Spatial Grid: ___BLANK___`,
        options: ['O(N)', 'O(N^3)', 'O(N!)', 'O(2^N)'],
        correctAnswer: 'O(N)',
        hint: 'แต่ละตัวจะตรวจสอบเฉพาะเพื่อนบ้านในช่องใกล้เคียงจำนวนคงที่ ทำให้ความเร็วเป็นเชิงเส้นตามจำนวนวัตถุ',
        explanation: 'ในสภาวะที่วัตถุกระจายตัวสม่ำเสมอ แต่ละวัตถุจะเช็คการชนเฉพาะตัวใน 9 ช่องรอบตัว ($k$ ตัว) รวมเป็น $O(k \\cdot N) = O(N)$',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-3',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'จำนวนช่องที่ต้องตรวจสอบรอบตัวใน 2D Grid',
        prompt: 'เมื่อตรวจหาวัตถุที่อาจชนกับเราใน 2D Uniform Grid เราต้องตรวจสอบช่องปัจจุบันและช่องรอบข้างรวมทั้งหมดกี่ช่อง?',
        options: ['9 ช่อง (ช่องตัวเอง + 8 ช่องรอบข้าง 3x3)', '1 ช่องเท่านั้น', '25 ช่อง (5x5)', 'ทุกช่องในแผนที่'],
        correctAnswer: 0,
        hint: 'กริดขนาด 3x3 มีช่องกลาง 1 ช่อง และเพื่อนบ้านรอบทิศ 8 ช่อง',
        explanation: 'การตรวจสอบ 9 ช่องรอบตัว (3x3 neighborhood) ครอบคลุมรัศมีการชนของวัตถุได้อย่างสมบูรณ์หาก cellSize ใหญ่กว่าขนาดวัตถุ',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-4',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การล้างข้อมูล Grid ต้นเฟรม',
        prompt: 'ในแต่ละเฟรมก่อนจะนำวัตถุที่เคลื่อนที่แล้วใส่กลับเข้า Grid ต้องทำอะไรกับ Grid เก่า:',
        codeSnippet: `function updatePhysicsGrid(): void {
  ___BLANK___; // ล้างข้อมูลเก่าของเฟรมที่แล้ว
  for (const entity of entities) {
    grid.insert(entity);
  }
}`,
        options: ['grid.clear()', 'grid.destroyWorld()', 'entities.length = 0', 'delete grid'],
        correctAnswer: 'grid.clear()',
        hint: 'ต้องเคลียร์รายชื่อออบเจกต์ในแต่ละช่องให้ว่างเปล่าก่อนนำตำแหน่งใหม่มาลง',
        explanation: '`grid.clear()` จะลบรายชื่ออ้างอิงของเฟรมเก่า เพื่อให้ตำแหน่งใหม่ที่เคลื่อนที่แล้วถูกจัดลงช่องได้อย่างถูกต้อง',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-5',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'โครงสร้างแบบต้นไม้ที่แบ่งพื้นที่ 2D ออกเป็น 4 ส่วน',
        prompt: 'โครงสร้างข้อมูลเชิงพื้นที่ที่แบ่ง Node แต่ละขั้นออกเป็น 4 ส่วนย่อยเมื่อมีวัตถุหนาแน่นเรียกว่า ___BLANK___:',
        codeSnippet: `// โครงสร้างที่เหมาะกับพื้นที่ 2D ที่มีความหนาแน่นไม่เท่ากัน:
class ___BLANK___ {
  children: [NW, NE, SW, SE];
}`,
        options: ['Quadtree', 'Octree', 'Binary Search Tree', 'Red-Black Tree'],
        correctAnswer: 'Quadtree',
        hint: 'Quad แปลว่า 4 (แบ่งพื้นที่ 2D เป็น 4 จตุภาค)',
        explanation: 'Quadtree แบ่งพื้นที่ 2D ออกเป็น 4 กล่องย่อย (NW, NE, SW, SE) นิยมใช้เมื่อวัตถุในฉากกระจุกตัวเป็นหย่อมๆ ไม่สม่ำเสมอ',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-6',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'โครงสร้างแบ่งพื้นที่สำหรับโลก 3 มิติ (3D Games)',
        prompt: 'สำหรับเกม 3D ที่ต้องแบ่งพื้นที่กว้างใหญ่ โครงสร้างต้นไม้ที่แบ่งลูกบาศก์ออกเป็น 8 ส่วนย่อยคืออะไร?',
        options: ['Octree', 'Quadtree', 'B-Tree', 'Trie'],
        correctAnswer: 0,
        hint: 'Octa แปลว่า 8 (แบ่งพื้นที่ลูกบาศก์ 3 มิติ ออกเป็น 8 ส่วน)',
        explanation: 'Octree แบ่งกล่องขอบเขตใน 3D ออกเป็น 8 ลูกบาศก์ย่อย ใช้สำหรับ Frustum Culling, Collision, และ Voxel engines ในเกม 3D',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-b-7',
        topicId: 'spatial-partitioning',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การสร้างคีย์แฮชสำหรับช่องกริด (Hash Key)',
        prompt: 'การจับคู่พิกัดกริด (cellX, cellY) เป็นคีย์สตริงหรือ 64-bit integer สำหรับเก็บใน HashTable:',
        codeSnippet: `function getCellKey(cx: number, cy: number): string {
  return ___BLANK___;
}`,
        options: ['`${cx},${cy}`', 'cx * cy', 'cx + cy', '`${cx * 0}`'],
        correctAnswer: '`${cx},${cy}`',
        hint: 'คีย์ต้องระบุพิกัดทั้งแกน X และ Y ได้อย่างเจาะจงไม่ให้ชนกันง่ายๆ',
        explanation: 'การรวมแกน เช่น `${cx},${cy}` หรือ bit-shifting `(cx << 32) | cy` ช่วยให้เข้าถึง bucket ใน HashTable ได้ทันที',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'spatial-p-1',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'ผลกระทบของการตั้งค่า Cell Size ที่ผิดพลาด (Too Small vs Too Big)',
        prompt: 'หากตั้งค่า Cell Size ใน Uniform Spatial Grid ให้มีขนาด "เล็กเกินไป" (เช่น เล็กกว่าขนาดตัวละคร) จะส่งผลเสียต่อประสิทธิภาพอย่างไร?',
        options: [
          'ตัวละคร 1 ตัวจะคาบเกี่ยวหลายช่อง ทำให้ต้องลงทะเบียนซ้ำซ้อนในหลาย Cell และต้องเสียเวลาเช็คช่องรอบข้างจำนวนมหาศาล',
          'ทำให้จำนวนคี่ของการคำนวณทางคณิตศาสตร์กลายเป็นจำนวนเต็ม',
          'GPU จะหยุดส่งคำสั่งเรนเดอร์ชั่วคราว',
          'ทำให้ Big-O กลายเป็น O(1) เสมอ'
        ],
        correctAnswer: 0,
        hint: 'ถ้าช่องเล็กกว่าตัวละคร ตัวละครจะล้นออกไปแตะ 4-9 ช่องพร้อมกัน',
        explanation: 'หาก Cell Size เล็กเกินไป ออบเจกต์จะคาบเกี่ยวหลายช่องและกินเวลา Overhead ในการลงทะเบียนและตัดข้อมูลซ้ำซ้อน กฎทองคือตั้งค่าให้กว้างประมาณ 1.5 - 2 เท่าของขนาดวัตถุที่ใหญ่ที่สุด',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-p-2',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์การชนซ้ำซ้อน (Duplicate Pair Checks)',
        prompt: 'ในการตรวจจับการชนด้วย Spatial Grid พบว่าเมื่อวัตถุ A และ B อยู่ใน Cell เดียวกัน หรือข้ามเขต Cell ฟังก์ชัน OnCollision กลับถูกเรียกซ้ำ 2-4 ครั้งในเฟรมเดียว มีแนวทางแก้ไขเชิงสถาปัตยกรรมอย่างไร?',
        options: [
          'บังคับตรวจสอบเฉพาะคู่ที่ `entityA.id < entityB.id` หรือใช้ Pair Hash Set เพื่อข้ามคู่ที่เคยทดสอบไปแล้วในเฟรมนั้น',
          'สั่งหน่วงเวลาการชนด้วย Thread.Sleep(10)',
          'ลบวัตถุ A ออกจากเกมทันทีที่ชนครั้งแรก',
          'เปลี่ยนพิกัดของวัตถุ B ไปอยู่นอกโลกเกม'
        ],
        correctAnswer: 0,
        hint: 'กำหนดเงื่อนไขว่า A ต้องมี ID น้อยกว่า B เสมอ เพื่อให้แต่ละคู่ถูกตรวจเพียงครั้งเดียว',
        explanation: 'เงื่อนไข `idA < idB` เป็นเทคนิคคลาสสิกที่รับประกันว่าคู่ (A, B) จะถูกตรวจสอบเพียงทิศทางเดียว ไม่ซ้ำกับ (B, A) และไม่ซ้ำข้ามเซลล์',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-p-3',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Collision Pipeline: Broad-Phase ถึง Narrow-Phase',
        prompt: 'เรียงลำดับขั้นตอนการตรวจสอบการชนตั้งแต่ระดับภาพกว้างจนถึงการแก้ปัญหาตำแหน่งทับซ้อน:',
        options: [
          'Broad-Phase: ใช้ Spatial Grid / BVH กรองเหลือเฉพาะคู่วัตถุที่อยู่ใกล้กัน',
          'Mid-Phase: ตรวจสอบกล่องขอบเขต AABB / Bounding Sphere อย่างรวดเร็ว',
          'Narrow-Phase: ตรวจสอบรูปทรงเรขาคณิตจริง (SAT / GJK Algorithm)',
          'Resolution: คำนวณ Impulse แรงสะท้อนและผลักวัตถุออกจากกัน'
        ],
        correctAnswer: [
          'Broad-Phase: ใช้ Spatial Grid / BVH กรองเหลือเฉพาะคู่วัตถุที่อยู่ใกล้กัน',
          'Mid-Phase: ตรวจสอบกล่องขอบเขต AABB / Bounding Sphere อย่างรวดเร็ว',
          'Narrow-Phase: ตรวจสอบรูปทรงเรขาคณิตจริง (SAT / GJK Algorithm)',
          'Resolution: คำนวณ Impulse แรงสะท้อนและผลักวัตถุออกจากกัน'
        ],
        hint: 'จากหยาบสุด (Spatial) -> ปานกลาง (AABB) -> ละเอียดสุด (SAT) -> แก้แรงชน',
        explanation: 'Broad-Phase ตัดวัตถุ 99% ออกอย่างรวดเร็ว ก่อนส่งคู่ที่เหลือให้ Mid/Narrow-Phase คำนวณคณิตศาสตร์ระดับสูง',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-p-4',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'การจัดการวัตถุขนาดใหญ่ (Giant Objects) ใน Spatial Partitioning',
        prompt: 'หากในเกมมี "มังกรยักษ์" ขนาด 200 เมตร อยู่ท่ามกลางทหารตัวจิ๋วขนาด 2 เมตร หากใช้ Uniform Grid เดียวกันจะเกิดปัญหา ช่องใดๆ ควรแก้ด้วยสถาปัตยกรรมใด?',
        options: [
          'ใช้ Multi-level Hierarchical Grid หรือ Loose Octree / BVH (Bounding Volume Hierarchy)',
          'ขยายขนาดช่องของ Uniform Grid ทั้งแผนที่ให้เท่ากับขนาดมังกร 200 เมตร',
          'ลดขนาดมังกรลงเหลือ 2 เมตรเท่าทหาร',
          'ห้ามมังกรเคลื่อนที่เด็ดขาด'
        ],
        correctAnswer: 0,
        hint: 'ระบบหลายชั้น (Hierarchical) ช่วยให้วัตถุแต่ละขนาดมีช่องกริดที่เหมาะสมกับตัวเอง',
        explanation: 'Hierarchical Grids แบ่งเป็นเลเยอร์ย่อย (Layer 0 สำหรับทหาร, Layer 2 สำหรับมังกร) หรือใช้ BVH ซึ่งปรับขนาดตามขอบเขตของวัตถุได้โดยธรรมชาติ',
        engineContext: 'General Engine',
      },
      {
        id: 'spatial-p-5',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Cache-Friendly Spatial Grid: Flat Array vs Pointer Linked List',
        prompt: 'ใน C++ ประสิทธิภาพสูง การเก็บข้อมูลเอนทิตีในกริดแบบ Flat Array of Indices (คล้าย CSR หรือ Radix-Sorted Array) เหนือกว่าการใช้ `std::vector<Entity*>` หรือ Linked List ในแต่ละ Cell อย่างไร?',
        options: [
          'ประหยัด Pointer Overhead ข้อมูลเรียงติดกันใน RAM ทำให้ CPU โหลดเข้า L1 Cache ได้ต่อเนื่องและหลีกเลี่ยง Memory Allocation ต่อ Cell',
          'เพราะ Flat Array ทำให้กราฟิกมีความสว่างมากกว่า',
          'เพราะ Linked List ใช้หน่วยความจำฮาร์ดดิสก์แทน RAM',
          'เพราะ C++ ไม่อนุญาตให้ใช้ Linked List ในฟิสิกส์'
        ],
        correctAnswer: 0,
        hint: 'Flat Array ไม่มีการกระโดดไปตามพอยน์เตอร์ในหน่วยความจำ',
        explanation: 'การเก็บข้อมูลแบบเรียงเป็นตารางเดียวและใช้ Offset ช่วยกำจัดการจัดสรรหน่วยความจำแบบไดนามิกของแต่ละ Bucket และเพิ่ม Cache Locality มหาศาล',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'spatial-p-6',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ Thread Contention ใน Parallel Spatial Grid Update',
        prompt: 'เมื่อเขียนระบบ Spatial Grid บน Multi-threaded Jobs พบว่าเกมกระตุกรุนแรงตอนแทรก Entity ลงกริดพร้อมกัน Profiler ชี้ว่าเกิดจาก Mutex Lock บนแต่ละ Cell วิธีแก้ที่ดีที่สุดคืออะไร?',
        options: [
          'ให้แต่ละเธรดสร้าง Local Cell Buckets ของตัวเอง แล้วรวมผลแบบ Lock-Free หรือใช้ Parallel Radix Sort จัดกลุ่มตาม Cell Hash',
          'เปลี่ยนกลับไปรัน Single-threaded บนซีพียูความเร็วต่ำ',
          'เพิ่มจำนวน Mutex Locks ให้เท่ากับจำนวนพิกเซลบนหน้าจอ',
          'ปิดระบบฟิสิกส์ระหว่างการเคลื่อนที่'
        ],
        correctAnswer: 0,
        hint: 'หลีกเลี่ยงการล็อก Cell ร่วมกันโดยให้แต่ละเธรดจัดกลุ่มข้อมูลของตัวเองก่อน',
        explanation: 'เทคนิค Sort-based Broadphase (เช่น Sort by Cell Key) สามารถทำขนานกันบน GPU หรือ Multi-core CPU ได้อย่างสมบูรณ์แบบโดยไม่ต้องใช้ Mutex Lock แม้แต่ตัวเดียว',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'spatial-p-7',
        topicId: 'spatial-partitioning',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'BVH (Bounding Volume Hierarchy) ใน Unreal Engine / PhysX',
        prompt: 'เหตุใด Game Engine สมัยใหม่อย่าง Unreal Engine (Chaos Physics) หรือ Unity (PhysX) จึงเลือกใช้ Dynamic AABB Tree / BVH เป็นโครงสร้างหลักแทน Uniform Grid?',
        options: [
          'เพราะปรับตัวรับโลกเปิด (Open World) ที่มีวัตถุขนาดต่างกันมหาศาลและพื้นที่ว่างเปล่าได้อย่างยืดหยุ่นโดยไม่ต้องล็อกขนาดช่องล่วงหน้า',
          'เพราะ BVH ไม่กินพื้นที่หน่วยความจำ RAM เลยแม้แต่ไบต์เดียว',
          'เพราะ BVH ทำงานบนการ์ดจอได้อย่างเดียว',
          'เพราะ Uniform Grid ใช้ได้เฉพาะกับเกม 2D ยุค 8-bit'
        ],
        correctAnswer: 0,
        hint: 'AABB Tree ไม่จำกัดว่าโลกต้องมีขอบเขตเท่าใดและรองรับวัตถุทุกรูปทรงขนาด',
        explanation: 'Dynamic AABB Trees ปรับแต่งกิ่งก้านตามตำแหน่งและขนาดของวัตถุจริง ไม่เปลืองหน่วยความจำกับพื้นที่ว่าง และรองรับ Raycasting ได้ที่ความเร็ว $O(\\log N)$',
        engineContext: 'Unreal Engine',
      },
    ],
  },

  // =========================================================================
  // 3. ECS & DATA-ORIENTED DESIGN
  // =========================================================================
  'ecs-dod': {
    topicId: 'ecs-dod',
    beginner: [
      {
        id: 'ecs-b-1',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'บทบาทของ Component ในสถาปัตยกรรม ECS',
        prompt: 'ในสถาปัตยกรรม Entity-Component-System (ECS) ตัว Component ควรเก็บเฉพาะ ___BLANK___ โดยไม่มีฟังก์ชันเกมเพลย์:',
        codeSnippet: `// Pure Component:
struct PositionComponent {
  float x;
  float y;
  float z;
  // ห้ามมี Update() หรือ Move() ในนี้!
}`,
        options: ['ข้อมูลสถานะล้วนๆ (Pure Data / State)', 'ตรรกะและอัลกอริทึม (Logic / Functions)', 'ไฟล์เสียงและรูปภาพ', 'คำสั่ง Shader บน GPU'],
        correctAnswer: 'ข้อมูลสถานะล้วนๆ (Pure Data / State)',
        hint: 'Component ใน ECS เป็นแค่ Struct เก็บตัวแปรธรรมดา',
        explanation: 'หลักการของ ECS คือแยก Data (Component) ออกจาก Logic (System) โดยสิ้นเชิง เพื่อให้จัดเรียงข้อมูลใน RAM ได้อย่างมีระเบียบ',
        engineContext: 'General Engine',
      },
      {
        id: 'ecs-b-2',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Entity ใน ECS คืออะไร',
        prompt: 'ใน ECS เอนทิตี (Entity) ไม่ใช่ออบเจกต์คลาสใหญ่ แต่เป็นเพียง ___BLANK___ ที่ใช้ระบุตัวตน:',
        codeSnippet: `// นิยามของ Entity ใน ECS Engine:
type Entity = ___BLANK___;`,
        options: ['ตัวเลขรหัสประจำตัว (Unique Integer ID)', 'คลาสที่มีฟังก์ชันการวาดภาพ', 'คอมโพเนนต์เสียง', 'โหนดใน Scene Graph'],
        correctAnswer: 'ตัวเลขรหัสประจำตัว (Unique Integer ID)',
        hint: 'Entity ทำหน้าที่เหมือน ID บัตรประชาชนที่เอาไว้ค้นหา Component ของตัวเอง',
        explanation: 'Entity ใน ECS เป็นแค่ ID (เช่น int 32-bit หรือ 64-bit) ที่เป็นดัชนีระบุว่าตนเองมีคอมโพเนนต์อะไรบ้าง',
        engineContext: 'General Engine',
      },
      {
        id: 'ecs-b-3',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'AoS (Array of Structures) vs SoA (Structure of Arrays)',
        prompt: 'รูปแบบการจัดเก็บหน่วยความจำแบบใดที่จัดเรียงตัวแปรชนิดเดียวกันต่อเนื่องกันใน RAM เพื่อรองรับ CPU Cache และ SIMD ได้ดีที่สุด?',
        options: [
          'SoA (Structure of Arrays)',
          'AoS (Array of Structures)',
          'Linked List of Objects',
          'Nested Tree of Classes'
        ],
        correctAnswer: 0,
        hint: 'Structure of Arrays วางอาเรย์ของ X ติดกัน อาเรย์ของ Y ติดกัน',
        explanation: 'SoA (Structure of Arrays) ทำให้ CPU อ่านตัวแปรชนิดเดียวกันรวดเดียว 64 ไบต์เข้าแคชไลน์โดยไม่มีฟิลด์ที่ไม่จำเป็นปนมา',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'ecs-b-4',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การวนลูปของ System ใน ECS',
        prompt: 'System ใน ECS ทำหน้าที่ประมวลผลข้อมูลโดยการวนลูปผ่านอาเรย์ของคอมโพเนนต์:',
        codeSnippet: `class MovementSystem {
  public update(dt: number): void {
    // วนลูปอ่าน Component ที่เรียงติดกันในหน่วยความจำ
    for (let i = 0; i < this.count; i++) {
      ___BLANK___; // อัปเดตตำแหน่งจากความเร็ว
    }
  }
}`,
        options: [
          'this.positions[i].x += this.velocities[i].vx * dt',
          'this.entities[i].callVirtualMethod()',
          'Instantiate(this.prefab)',
          'Thread.sleep(1)'
        ],
        correctAnswer: 'this.positions[i].x += this.velocities[i].vx * dt',
        hint: 'เข้าถึงข้อมูลตำแหน่งและความเร็วผ่าน Index อาเรย์ตรงๆ',
        explanation: 'System เข้าถึงข้อมูลผ่าน Flat Array แบบตรงไปตรงมา ไม่มี Virtual Function Call หรือ Pointer Chasing',
        engineContext: 'General Engine',
      },
      {
        id: 'ecs-b-5',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ขนาดมาตรฐานของ CPU Cache Line บนสถาปัตยกรรม x86/ARM',
        prompt: 'เมื่อ CPU โหลดข้อมูลจาก RAM เข้าสู่ L1/L2 Cache มันจะโหลดมาครั้งละหนึ่ง Cache Line ซึ่งมีขนาดกี่ไบต์?',
        options: ['64 ไบต์ (64 Bytes)', '4 ไบต์', '1,024 ไบต์', '1 เมกะไบต์'],
        correctAnswer: 0,
        hint: 'ขนาด 64 ไบต์คือมาตรฐานของชิปซีพียูคอมพิวเตอร์และมือถือส่วนใหญ่',
        explanation: 'CPU Cache Line มีขนาด 64 ไบต์เสมอ หากข้อมูลของเราจัดเรียงต่อเนื่องกัน การอ่านครั้งเดียวจะได้ข้อมูลไปใช้งานได้หลายตัวทันที',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'ecs-b-6',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'ปัญหาของการสืบทอดแบบ OOP (Object-Oriented Programming)',
        prompt: 'ในเกมขนาดใหญ่ การสืบทอดคลาสแบบ OOP ที่ลึกเกินไป (เช่น Entity -> Actor -> Pawn -> Character -> Player) มักนำไปสู่ปัญหา ___BLANK___:',
        codeSnippet: `// ความเปราะบางของสถาปัตยกรรม OOP:
class Monster extends Actor, Collidable, Damageable {
  // เกิดปัญหาความผูกมัดแน่นและเพชรซ้ำซ้อน
}`,
        options: ['Rigid Hierarchy & Diamond Inheritance Problem', 'การที่หน่วยประมวลผล GPU ไม่ยอมทำงาน', 'โค้ดคอมไพล์ไม่ได้ตลอดไป', 'หน้าจอฟ้าทุกครั้งที่รันเกม'],
        correctAnswer: 'Rigid Hierarchy & Diamond Inheritance Problem',
        hint: 'ความแข็งทื่อของโครงสร้างต้นไม้ที่แก้ไขยากเมื่อต้องการคุณสมบัติข้ามสายพันธุ์',
        explanation: 'OOP Inheritance สร้างข้อผูกมัดที่แก้ไขยากและเกิด Diamond Problem ได้ง่าย ขณะที่ ECS ใช้หลัก Composition ที่ติด/ถอด Component ได้อิสระ',
        engineContext: 'General Engine',
      },
      {
        id: 'ecs-b-7',
        topicId: 'ecs-dod',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ชื่อเทคโนโลยี Data-Oriented ประสิทธิภาพสูงของ Unity',
        prompt: 'ชุดเทคโนโลยีของ Unity ที่ออกแบบมาเพื่อรองรับ ECS และ Data-Oriented Design คืออะไร?',
        options: [
          'Unity DOTS (Data-Oriented Technology Stack) ประกอบด้วย Entities, Burst, Jobs',
          'Unity GameObject & MonoBehavior Stack',
          'Unity Flash Player Exporter',
          'Unity WebForms Engine'
        ],
        correctAnswer: 0,
        hint: 'DOTS ย่อมาจาก Data-Oriented Technology Stack',
        explanation: 'Unity DOTS นำเสนอ Entities package ทำงานคู่กับ C# Job System และ Burst Compiler แปลงเป็น Native Machine Code ประสิทธิภาพสูง',
        engineContext: 'Unity',
      },
    ],
    practical: [
      {
        id: 'ecs-p-1',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ Profiler: L1 Cache Miss พุ่งสูง 70% ใน OOP Update Loop',
        prompt: 'ทีมงานสร้างระบบ Particle 10,000 ชิ้นโดยใช้คลาส OOP `List<Particle>` ซึ่งแต่ละตัวเป็น Object แยกบน Heap ผลลัพธ์คือเกมกระตุกและ CPU Stall รอข้อมูล RAM ตลอดเวลา ปัญหานี้เรียกว่าอะไรและแก้อย่างไร?',
        options: [
          'Pointer Chasing ทำให้เกิด Cache Miss; แก้โดยย้ายเป็น Struct เก็บใน Flat Array ต่อเนื่องกัน (Data-Oriented Design)',
          'เกิดจากการที่ GPU Shader ไม่รองรับตัวแปรทศนิยม; แก้โดยแปลงเป็นจำนวนเต็ม',
          'เกิดจากตัวละครไม่มี Rigidbody; แก้โดยเพิ่มฟิสิกส์ 3D ให้ทุกอนุภาค',
          'เกิดจาก Windows OS จัดสรรเธรดผิด; แก้โดยรันบนโหมด Compatibility'
        ],
        correctAnswer: 0,
        hint: 'Object บน Heap กระจายตัวคนละที่ ทำให้ CPU ต้องรออ่านจากแรมหลักช้าเป็นร้อยไซเคิล',
        explanation: 'เมื่ออนุภาคเป็น Object บน Managed Heap พอยน์เตอร์จะชี้กระจายตัว การเปลี่ยนเป็น SoA/Contiguous Struct ทำให้อ่านข้อมูลรวดเดียวผ่าน L1 Cache',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'ecs-p-2',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Structural Changes และ EntityCommandBuffer (ECB)',
        prompt: 'ใน Unity DOTS หรือ Flecs ECS เหตุใดเราจึงห้ามสร้าง Entity, ทำลาย Entity หรือ Add/Remove Component ตรงๆ ภายใน Parallel Job System?',
        options: [
          'เพราะการเปลี่ยนโครงสร้างจะย้าย Component ข้าม Archetype Chunk ส่งผลให้ Memory Layout เปลี่ยนและเกิด Race Condition ระหว่างเธรด จึงต้องบันทึกคำสั่งใส่ EntityCommandBuffer ไว้รันทีหลัง',
          'เพราะ CPU จะร้อนเกินไปจนสั่งลดความเร็วนาฬิกา',
          'เพราะเอนจินจำกัดจำนวน Entity ให้สร้างได้เฉพาะตอนเปิดเครื่องเท่านั้น',
          'เพราะการ์ดจอไม่รองรับการมีคอมโพเนนต์มากกว่า 3 ชิ้น'
        ],
        correctAnswer: 0,
        hint: 'การเปลี่ยนชุดคอมโพเนนต์ทำให้ต้องย้ายตำแหน่งที่อยู่ของข้อมูลใน RAM',
        explanation: 'Structural changes ทำลายความต่อเนื่องของหน่วยความจำใน Chunk จึงต้องบันทึกคำสั่งลงใน EntityCommandBuffer แล้วนำมา Playback บน Main Thread ตอนจบเฟรม',
        engineContext: 'Unity',
      },
      {
        id: 'ecs-p-3',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'False Sharing บน Multi-core CPU Cache Lines',
        prompt: 'ปรากฏการณ์ False Sharing ในโปรแกรมมิ่งแบบหลายเธรดระดับ Low-level เกิดจากอะไร?',
        options: [
          'เธรดบน 2 Core เขียนตัวแปรคนละตัวกัน แต่ตัวแปรทั้งสองบังเอิญอยู่บน Cache Line 64 ไบต์เดียวกัน ทำให้แคชต้องถูก Invalidate ข้าม Core ตลอดเวลา',
          'การแชร์รหัสผ่านของระบบเครือข่ายผิดพลาด',
          'การที่ซีพียูคิดว่าโปรแกรมกำลังแชร์ข้อมูลกับเครื่องคอมพิวเตอร์เครื่องอื่น',
          'การแบ่งงานที่ไม่เท่ากันระหว่างเธรดหลักกับเธรดรอง'
        ],
        correctAnswer: 0,
        hint: 'แม้ตัวแปรจะคนละตัว แต่ถ้าอยู่ติดกันใน 64 ไบต์เดียวกัน แคชไลน์จะแย่งกันเป็นเจ้าของ',
        explanation: 'False Sharing ทำให้บัสของหน่วยความจำแออัดเพราะแกนซีพียูต้องประสานสถานะ Cache Coherency (MESI protocol) แก้ได้ด้วยการใส่ Padding ให้ตัวแปรห่างกัน 64 ไบต์',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'ecs-p-4',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Archetype Chunk Query Execution ใน Unity DOTS',
        prompt: 'เรียงลำดับการทำงานของ ECS Engine เมื่อ System สั่งประมวลผล EntityQuery:',
        options: [
          'Query Filtering: ค้นหา Archetypes ที่มี Components ตรงตามที่ต้องการ',
          'Chunk Iteration: ดึง 16KB Chunks ของ Archetypes ที่ตรงเงื่อนไข',
          'Native Array Pointer Extraction: ดึง Raw Pointer ของ Component Arrays ใน Chunk',
          'SIMD Vectorized Loop: ประมวลผลข้อมูลผ่าน Burst-compiled Vector Instructions'
        ],
        correctAnswer: [
          'Query Filtering: ค้นหา Archetypes ที่มี Components ตรงตามที่ต้องการ',
          'Chunk Iteration: ดึง 16KB Chunks ของ Archetypes ที่ตรงเงื่อนไข',
          'Native Array Pointer Extraction: ดึง Raw Pointer ของ Component Arrays ใน Chunk',
          'SIMD Vectorized Loop: ประมวลผลข้อมูลผ่าน Burst-compiled Vector Instructions'
        ],
        hint: 'กรองกลุ่มประเภท -> ดึงกล่อง Chunk 16KB -> ดึงตำแหน่งหน่วยความจำ -> รันลูปคำนวณ',
        explanation: 'Archetype-based ECS กรอง Chunk ข้อมูลล่วงหน้า ทำให้ System สามารถประมวลผลหน่วยความจำดิบได้เร็วสูงสุดด้วย SIMD',
        engineContext: 'Unity',
      },
      {
        id: 'ecs-p-5',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Mass Entity Subsystem ใน Unreal Engine 5',
        prompt: 'ใน Unreal Engine 5 ระบบใดถูกสร้างขึ้นเพื่อรองรับสถาปัตยกรรม Data-Oriented (ECS) สำหรับการจำลองฝูงชน (Crowds) และยานพาหนะนับหมื่นตัวใน The Matrix Awakens?',
        options: [
          'Mass Entity Framework ร่วมกับ Mass Processing Phase',
          'Blueprint Visual Scripting System',
          'Unreal UObject Garbage Collector',
          'Paper2D Sprite Component'
        ],
        correctAnswer: 0,
        hint: 'ชื่อระบบนี้สื่อถึงมวลชนขนาดมหึมา (Mass)',
        explanation: 'Mass Entity ใน UE5 คือสถาปัตยกรรม DOD/ECS ภายในที่เก็บ Fragments ใน Chunks คล้าย Unity DOTS เพื่อจำลอง Entity ปริมาณมหาศาลโดยไม่มี Overhead ของ AActor',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'ecs-p-6',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'การกำจัด Branch Prediction Miss ใน Hot ECS Loop',
        prompt: 'ในลูปอัปเดตการเคลื่อนที่ของ 50,000 เอนทิตี พบว่ามีคำสั่ง `if (entity.isFrozen) continue;` อยู่ในลูป ทำให้ CPU Branch Predictor คาดเดาผิดบ่อยและสูญเสียรอบคำนวณ แนวทางแก้เชิงสถาปัตยกรรม ECS คืออะไร?',
        options: [
          'แยก Entity ที่ติดสถานะ Frozen ออกเป็นคนละ Archetype หรือใช้ Tag Component เพื่อให้ Query ดึงเฉพาะตัวที่ไม่ Frozen มาวนลูปโดยไม่ต้องมี if ในลูป',
          'เขียน if ซ้อน if หลายๆ ชั้นเพื่อให้แน่ใจมากขึ้น',
          'สลับไปใช้ภาษาที่มีฟังก์ชัน try-catch',
          'ลดจำนวนเอนทิตีลงเหลือ 5 ตัว'
        ],
        correctAnswer: 0,
        hint: 'ใช้พลังของ Archetype กรองแยกกลุ่มตั้งแต่ต้น ลูปจะได้ไม่มี if',
        explanation: 'การใช้ Tag Component หรือแยก Archetype ทำให้ลูปด้านในมีเฉพาะคำสั่งคำนวณตรงไปตรงมา ปลดล็อคการทำ Loop Auto-vectorization และไม่มี Branch Misprediction',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'ecs-p-7',
        topicId: 'ecs-dod',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Memory Alignment และ Cache-Line Straddling',
        prompt: 'เหตุใด Game Engine จึงนิยมบังคับ Data Alignment ให้ตัวแปรหรือ Struct อยู่ที่จุดทวีคูณของ 16, 32 หรือ 64 ไบต์ (เช่น `alignas(64)`)?',
        options: [
          'เพื่อป้องกันไม่ให้ข้อมูลก้อนเดียวคาบเกี่ยวข้าม 2 Cache Lines ซึ่งจะบีบให้ CPU ต้องอ่านหน่วยความจำ 2 รอบเพื่อดึงข้อมูลชิ้นเดียว',
          'เพื่อให้ข้อมูลมีขนาดไฟล์ที่สวยงามเวลาบันทึกลงฮาร์ดดิสก์',
          'เพื่อป้องกันไวรัสคอมพิวเตอร์เข้าถึงตัวแปร',
          'เพราะตัวแปลงสัญญาณกราฟิกไม่สามารถอ่านเลขคี่ได้'
        ],
        correctAnswer: 0,
        hint: 'ข้อมูลที่วางคร่อมรอยต่อแคชไลน์จะต้องใช้คำสั่งอ่าน 2 ครั้งแทนที่จะเป็น 1 ครั้ง',
        explanation: 'Cache line boundary straddling บังคับให้ Memory Controller ต้องทำการอ่าน 2 Bus Transactions และต่อข้อมูลเข้าด้วยกัน ซึ่งเพิ่ม Latency สองเท่า',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 4. FIXED TIMESTEP & DETERMINISM
  // =========================================================================
  'fixed-timestep': {
    topicId: 'fixed-timestep',
    beginner: [
      {
        id: 'fixed-b-1',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การสะสมเวลาใน Accumulator Loop',
        prompt: 'ในโครงสร้าง Fixed Timestep Game Loop ต้องนำ frameTime ที่วัดได้มาบวกสะสมไว้ในตัวแปรใด:',
        codeSnippet: `function gameLoop(currentTime: number): void {
  const frameTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  ___BLANK___; // บวกเวลาที่ผ่านไปสะสมไว้
  
  while (accumulator >= fixedDeltaTime) {
    physicsStep(fixedDeltaTime);
    accumulator -= fixedDeltaTime;
  }
}`,
        options: ['accumulator += frameTime', 'accumulator = 0', 'accumulator = fixedDeltaTime', 'frameTime = accumulator'],
        correctAnswer: 'accumulator += frameTime',
        hint: 'สะสมเวลาจริงที่ผ่านไปของเฟรมนี้เข้าสู่กระปุก Accumulator',
        explanation: '`accumulator += frameTime` ทำหน้าที่เป็นถังพักเวลา เพื่อจ่ายเวลาเป็นก้อนคงที่ `fixedDeltaTime` ให้กับฟิสิกส์ทีละส่วน',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-b-2',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'ปัญหา Tunneling ของกระสุนความเร็วสูง',
        prompt: 'หากใช้ Variable Delta Time ที่เวลาต่อเฟรมผันผวน เมื่อเกมเกิดอาการกระตุก กระสุนความเร็วสูงอาจทะลุกำแพงบางๆ ไปได้ ปรากฏการณ์นี้เรียกว่า ___BLANK___:',
        codeSnippet: `// บั๊กลูกกระสุนหรือลูกบอลทะลุสิ่งกีดขวาง:
position += velocity * largeDeltaTime; // ข้ามขอบเขตกำแพงไปเลย!`,
        options: ['Tunneling (Quantum Tunneling Glitch)', 'Memory Leak', 'NullReferenceException', 'Deadlock'],
        correctAnswer: 'Tunneling (Quantum Tunneling Glitch)',
        hint: 'วัตถุข้ามทะลุกำแพงเพราะก้าวเดินยาวเกินไปในเฟรมเดียว',
        explanation: 'Tunneling เกิดขึ้นเมื่อระยะทางใน 1 ก้าวเฟรม ($v \\cdot \\Delta t$) มีขนาดยาวกว่าความหนาของกำแพง ทำให้ไม่เกิดจุดตัดการชน',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-b-3',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ฟังก์ชันอัปเดตฟิสิกส์ใน Unity',
        prompt: 'ใน Unity โค้ดคำนวณฟิสิกส์ (เช่น Rigidbody.AddForce) ควรเขียนไว้ในฟังก์ชันใดเสมอ?',
        options: ['FixedUpdate()', 'Update()', 'LateUpdate()', 'OnGUI()'],
        correctAnswer: 0,
        hint: 'ฟังก์ชันนี้ถูกเรียกด้วยอัตราเวลาคงที่ (ค่าเริ่มต้นคือ 0.02 วินาที หรือ 50Hz)',
        explanation: '`FixedUpdate()` ทำงานด้วย Fixed Timestep ที่สม่ำเสมอ เป็นอิสระจากความเร็วของ Frame Rate การเรนเดอร์',
        engineContext: 'Unity',
      },
      {
        id: 'fixed-b-4',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'เงื่อนไขการหักลบเวลาออกจาก Accumulator',
        prompt: 'เมื่อจำลองฟิสิกส์ไป 1 ก้าวขนาด fixedDeltaTime ต้องทำอะไรกับตัวแปรสะสมเวลา:',
        codeSnippet: `while (accumulator >= fixedDeltaTime) {
  simulatePhysics(fixedDeltaTime);
  ___BLANK___; // หักเวลาที่ประมวลผลไปแล้วออก
}`,
        options: ['accumulator -= fixedDeltaTime', 'accumulator = 0', 'accumulator += fixedDeltaTime', 'break'],
        correctAnswer: 'accumulator -= fixedDeltaTime',
        hint: 'หักเวลาออกทีละก้อนจนกว่าเวลาที่เหลือจะน้อยกว่าก้าวฟิสิกส์',
        explanation: 'เมื่อคำนวณไป 1 ก้าว ต้องหักเวลาออกด้วย `accumulator -= fixedDeltaTime` จนกว่าจะเหลือน้อยกว่า 1 ก้าว',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-b-5',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'การเกลี่ยภาพให้ลื่นไหลระหว่างก้าวฟิสิกส์ (Interpolation)',
        prompt: 'เพื่อป้องกันภาพกระตุก (Micro-stutter) เมื่อ Frame Rate ของจอภาพไม่ตรงกับ Fixed Physics Rate เราต้องทำ Transform ___BLANK___:',
        codeSnippet: `// สูตรหาจุดกึ่งกลางระหว่าง 2 State:
const alpha = accumulator / fixedDeltaTime;
renderPos = lerp(previousPos, currentPos, ___BLANK___);`,
        options: ['alpha (Interpolation Factor)', '0', '100', 'fixedDeltaTime'],
        correctAnswer: 'alpha (Interpolation Factor)',
        hint: 'ค่าสัดส่วนระหว่าง 0.0 ถึง 1.0 ที่เหลืออยู่ในกระปุก accumulator',
        explanation: 'Alpha (accumulator / fixedDeltaTime) คือค่าสัดส่วนสำหรับ Interpolate ตำแหน่งระหว่างฟิสิกส์เฟรมก่อนหน้ากับเฟรมปัจจุบัน',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-b-6',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ความถี่ปกติของ Fixed Timestep ในเกมทั่วไป',
        prompt: 'ค่า Fixed Delta Time มาตรฐานที่นิยมใช้กันทั่วไป (เช่น 60Hz) มีค่าประมาณกี่วินาที?',
        options: ['0.0166 วินาที (1/60s)', '1.0 วินาที', '0.5 วินาที', '0.0001 วินาที'],
        correctAnswer: 0,
        hint: '1 วินาทีหารด้วย 60 ครั้ง = 0.01666...',
        explanation: '1000ms / 60 ≈ 16.66ms (หรือ 0.0166 วินาที) คือระยะเวลาต่อ 1 ก้าวของ 60 FPS',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-b-7',
        topicId: 'fixed-timestep',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การป้องกันไม่ให้เกมค้างเมื่อเฟรมดรอป (Max Accumulator Clamp)',
        prompt: 'หากหน้าต่างเกมถูกลากย้ายจนเกิด Lag Spike ยาว 1 วินาที ต้องจำกัดค่า accumulator ด้วยคำสั่งใด:',
        codeSnippet: `// ป้องกัน Spiral of Death:
accumulator = ___BLANK___;`,
        options: ['Math.min(accumulator, 0.25)', 'Math.max(accumulator, 10.0)', 'accumulator * 2', '0'],
        correctAnswer: 'Math.min(accumulator, 0.25)',
        hint: 'จำกัดค่าสูงสุดไม่ให้เกินประมาณ 0.25 วินาที เพื่อไม่ให้ while loop ทำงานเป็นร้อยรอบ',
        explanation: 'การจำกัดเพดานเวลา (Clamping) ป้องกันไม่ให้ while loop พยายามตามเวลาจนเครื่องค้างในวงจรมรณะ',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'fixed-p-1',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการ "Spiral of Death" (Lag Spike Death Spiral)',
        prompt: 'เมื่อผู้เล่นเจอฉากระเบิดขนาดใหญ่ เฟรมเรตตกลงเล็กน้อย จากนั้นเกมกลับเกิดอาการค้างสนิทและเด้งหลุดทันที Profiler บันทึกว่า `while(accumulator >= dt)` หมุนวนนับพันรอบและกินเวลาเฟรมเพิ่มขึ้นเรื่อยๆ เกิดจากสาเหตุใด?',
        options: [
          'เวลาที่ใช้คำนวณฟิสิกส์ 1 ก้าว นานกว่าขนาดของก้าวฟิสิกส์จริง ทำให้ในแต่ละเฟรมสะสมเวลาใหม่เร็วกว่าเวลาที่หักออก จนลูปไม่มีวันสิ้นสุด',
          'หน่วยประมวลผลซีพียูหยุดทำงานเพราะความร้อน',
          'ฟิสิกส์คำนวณมุมองศาผิดพลาดจนได้ค่า NaN',
          'ตัวจับเวลาของระบบปฏิบัติการเดินถอยหลัง'
        ],
        correctAnswer: 0,
        hint: 'ถ้าคำนวณฟิสิกส์ 16ms ใช้เวลาจริง 20ms กระปุกเวลาจะล้นขึ้นเรื่อยๆ ทุกเฟรม',
        explanation: 'Spiral of Death เกิดขึ้นเมื่อค่าใช้จ่ายในการ simulate หนักเกินไป ลูปจึงพยายามจำลองตามเวลาที่ค้าง แต่ยิ่งจำลองก็ยิ่งทำให้เฟรมถัดไปสะสมเวลามากขึ้น ต้องแก้ด้วย Max Frame Time Clamping',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-p-2',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'การแสดงผล 144Hz บน Physics Engine ความถี่ 50Hz',
        prompt: 'หากหน้าจอผู้เล่นเป็นจอเกมมิ่ง 144Hz แต่ระบบฟิสิกส์ของเกมตั้งไว้ที่ 50Hz (Unity default) หากไม่เปิด Transform Interpolation ผู้เล่นจะเห็นภาพอย่างไร?',
        options: [
          'ภาพจะดูกระตุกเป็นหย่อมๆ (Micro-stutter / Jitter) แม้ว่าตัวนับ FPS จะแสดงตัวเลข 144 ก็ตาม',
          'เกมจะถูกเร่งความเร็วขึ้น 3 เท่าโดยอัตโนมัติ',
          'ตัวละครจะบินขึ้นฟ้า',
          'จอภาพจะดับลงทันที'
        ],
        correctAnswer: 0,
        hint: 'เฟรมเรนเดอร์ขยับ 144 ครั้ง แต่ตำแหน่งฟิสิกส์ขยับแค่ 50 ครั้ง ทำให้มีบางเฟรมที่วัตถุหยุดนิ่งซ้ำเดิม',
        explanation: 'เมื่อความถี่เรนเดอร์ไม่ลงตัวกับความถี่ฟิสิกส์ บางเฟรมเรนเดอร์จะไม่มีการอัปเดตฟิสิกส์ ส่งผลให้เกิด Jitter ต้องเปิด Rigidbody Interpolation เพื่อเฉลี่ยตำแหน่งตามเศษ Alpha',
        engineContext: 'Unity',
      },
      {
        id: 'fixed-p-3',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับวงจร Game Loop มาตรฐานของ Glenn Fiedler (Fix Your Timestep!)',
        prompt: 'เรียงลำดับขั้นตอนของ Main Loop ที่ถูกต้องที่สุดในระดับ Engine Engineering:',
        options: [
          'Measure Frame Time: วัดเวลาจริงที่ผ่านไปของเฟรมและจำกัดเพดานกันหลุด',
          'Accumulate Time: บวกเวลาเข้าสู่ตัวแปร Accumulator',
          'Consume Fixed Steps: วนลูปจำลองฟิสิกส์ทีละ fixedDt พร้อมบันทึก State ก่อนหน้า',
          'Render Interpolation: คำนวณ alpha และเกลี่ยตำแหน่งระหว่าง PrevState กับ CurrentState สู่จอ'
        ],
        correctAnswer: [
          'Measure Frame Time: วัดเวลาจริงที่ผ่านไปของเฟรมและจำกัดเพดานกันหลุด',
          'Accumulate Time: บวกเวลาเข้าสู่ตัวแปร Accumulator',
          'Consume Fixed Steps: วนลูปจำลองฟิสิกส์ทีละ fixedDt พร้อมบันทึก State ก่อนหน้า',
          'Render Interpolation: คำนวณ alpha และเกลี่ยตำแหน่งระหว่าง PrevState กับ CurrentState สู่จอ'
        ],
        hint: 'วัดเวลา -> สะสม -> คำนวณฟิสิกส์ทีละก้อน -> เรนเดอร์เฉลี่ยเศษเวลา',
        explanation: 'นี่คือสถาปัตยกรรม Game Loop ที่สมบูรณ์แบบตามบทความคลาสสิก "Fix Your Timestep!" ของ Glenn Fiedler',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'fixed-p-4',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'ความสำคัญของ Determinism ใน Lockstep Netcode (RTS / Fighting Games)',
        prompt: 'ในเกมแนววางแผนการรบแบบ RTS (เช่น StarCraft) หรือเกมต่อสู้ (Fighting Games) เหตุใดจึงจำเป็นต้องใช้ Fixed Timestep ที่มีความเที่ยงตรงสูงร่วมกับ Fixed-Point Math?',
        options: [
          'เพราะสถาปัตยกรรม Lockstep ส่งเฉพาะปุ่มกดของผู้เล่นข้ามเครือข่าย หากเวลาหรือการคำนวณทศนิยมเพี้ยนแม้แต่ 0.0001 ผลลัพธ์ในเครื่องผู้เล่นจะหลุดออกจากกัน (Desync)',
          'เพื่อให้กราฟิกมีความละเอียด 8K',
          'เพราะเซิร์ฟเวอร์ปฏิเสธการเชื่อมต่อจากคอมพิวเตอร์ที่ใช้ทศนิยม',
          'เพื่อป้องกันไม่ให้ผู้เล่นมองเห็นแผนที่ของฝ่ายตรงข้าม'
        ],
        correctAnswer: 0,
        hint: 'ถ้าส่งแค่คำสั่งกดปุ่ม การคำนวณในเครื่องทุกคนต้องได้ผลลัพธ์เหมือนกันเป๊ะทุกเฟรม',
        explanation: 'Deterministic Simulation รับประกันว่าเมื่อป้อน Input เดียวกันใน Tick เดียวกัน ทุกเครื่องจะได้ Game State ตรงกันเป๊ะ 100% ทำให้ไม่ต้องส่งข้อมูลตำแหน่งยูนิตนับพันตัวข้ามเน็ต',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-p-5',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Continuous Collision Detection (CCD) vs Sub-stepping',
        prompt: 'หากในเกมมีกระสุนปืนสไนเปอร์ที่พุ่งด้วยความเร็ว 3,000 เมตร/วินาที ซึ่งแม้จะใช้ Fixed Timestep 60Hz กระสุนก็ยังก้าวไกลเกินกว่ากำแพง วิธีแก้ทางฟิสิกส์ระดับ Engine คืออะไร?',
        options: [
          'เปิดใช้งาน Continuous Collision Detection (CCD) เช่น Ray-cast Swept Volume หรือเพิ่ม Physics Sub-stepping',
          'ลดความเร็วกระสุนลงเหลือเท่ากับคนเดิน',
          'ทำให้กำแพงในเกมหนาขึ้นเป็น 100 เมตร',
          'เปลี่ยนไปใช้ภาพ 2D แทน'
        ],
        correctAnswer: 0,
        hint: 'ลากเส้นเชื่อมต่อระหว่างจุดเริ่มต้นกับจุดสิ้นสุด (Swept Volume) เพื่อหาจุดตัด',
        explanation: 'CCD ใช้วิธี Swept Shape (ลากรูปทรงระหว่างจุดเก่าไปจุดใหม่) เพื่อหาเวลาที่เกิดการชน (TOI: Time of Impact) จึงไม่มีทางหลุดรอดกำแพงบางๆ ได้',
        engineContext: 'General Engine',
      },
      {
        id: 'fixed-p-6',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์บั๊กการรับ Input ใน FixedUpdate vs Update',
        prompt: 'ผู้เล่นรายงานว่า "บางครั้งกดปุ่มกระโดด Spacebar แล้วตัวละครไม่ยอมกระโดด (ปุ่มหลุด)" เมื่อตรวจโค้ดพบ `if (Input.GetKeyDown(KeyCode.Space)) jump = true;` เขียนไว้ใน `FixedUpdate()` สาเหตุเชิงสถาปัตยกรรมคืออะไร?',
        options: [
          'GetKeyDown ถูกรีเซ็ตตอนสิ้นสุดเฟรม Update ของเอนจิน หากเฟรมนั้นไม่มีการเรียก FixedUpdate สัญญาณกดปุ่มจะหายไปก่อนถูกอ่าน',
          'แป้นพิมพ์ของผู้เล่นส่งสัญญาณช้ากว่า 50Hz',
          'Unity ไม่รองรับการกระโดดในภาษา C#',
          'ระบบปฏิบัติการดักจับปุ่ม Spacebar ไว้พิมพ์ข้อความ'
        ],
        correctAnswer: 0,
        hint: 'Input เหตุการณ์กดปุ่มจะถูกบันทึกในรอบของเรนเดอร์เฟรม (Update)',
        explanation: 'กฎสำคัญ: ต้องตรวจจับ Input เหตุการณ์กดปุ่ม (GetKeyDown) ใน `Update()` แล้วบันทึก Flag ไว้ จากนั้นจึงนำ Flag ไปสั่งกระโดดใน `FixedUpdate()` แล้วเคลียร์ทิ้ง',
        engineContext: 'Unity',
      },
      {
        id: 'fixed-p-7',
        topicId: 'fixed-timestep',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'การรัน Physics บน Dedicated Thread ขนานกับ Render Thread',
        prompt: 'ในเอนจินเกมระดับ AAA ที่แยกเธรด Physics ให้รันด้วยความถี่คงที่บน CPU Core แยกต่างหากจาก Render Thread ความท้าทายหลักในการแลกเปลี่ยนข้อมูลตำแหน่งคืออะไร?',
        options: [
          'ต้องใช้โครงสร้าง Double-Buffering หรือ Triple-Buffering ของ Transform State พร้อม Lock-Free Synchronization เพื่อป้องกัน Render Thread อ่านข้อมูลขณะฟิสิกส์กำลังเขียน',
          'สายไฟของเคสคอมพิวเตอร์อาจร้อนเกินไป',
          'การ์ดจอจะทำงานไม่ได้หากมีเธรดมากกว่า 1 ตัว',
          'เอนจินต้องขออนุญาตผู้ใช้ทุกครั้งที่สลับเธรด'
        ],
        correctAnswer: 0,
        hint: 'การแยกเธรดอ่านและเขียนต้องมีกระดานข้อมูลสำรองเพื่อไม่ให้ชนกัน',
        explanation: 'State Double-buffering รับประกันว่า Render Thread สามารถอ่านสแนปช็อตเฟรมที่สมบูรณ์ไป Interpolate และวาดภาพได้ตลอดเวลาโดยไม่มี Data Race กับ Physics Thread',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 5. DRAW CALLS & BATCHING
  // =========================================================================
  'draw-calls-batching': {
    topicId: 'draw-calls-batching',
    beginner: [
      {
        id: 'draw-b-1',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Draw Call คืออะไร',
        prompt: 'Draw Call คือคำสั่งที่ส่งจาก ___BLANK___ ไปสั่งให้ GPU เริ่มวาดเรขาคณิต (Geometry) ลงบนหน้าจอ:',
        codeSnippet: `// คำสั่งสั่งวาดของ Graphics API:
glDrawElements(...) หรือ DrawIndexedInstanced(...);`,
        options: ['CPU (ผ่าน Graphics Driver)', 'จอภาพมอนิเตอร์', 'คีย์บอร์ดและเมาส์', 'หน่วยจ่ายไฟ (PSU)'],
        correctAnswer: 'CPU (ผ่าน Graphics Driver)',
        hint: 'คำสั่งวาดภาพเริ่มต้นจากซีพียูส่งข้ามบัสไปยังการ์ดจอ',
        explanation: 'Draw Call คือคำสั่ง API ที่ CPU ส่งให้ GPU ผ่านไดรเวอร์ ซึ่งหากมีคำสั่งย่อยๆ มากเกินไป CPU จะเป็นคอขวด (CPU Bound)',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-b-2',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'เทคนิค Texture Atlas',
        prompt: 'การรวมรูปภาพขนาดเล็กหลายๆ รูป (เช่น หน้าตาไอเทม 50 ชิ้น) เข้าเป็นรูปภาพขนาดใหญ่ 1 ใบ เรียกว่าอะไร?',
        options: [
          'Texture Atlas (Sprite Sheet)',
          'Texture Streaming',
          'Mipmap Decimation',
          'Cubemap Skybox'
        ],
        correctAnswer: 0,
        hint: 'Atlas เปรียบเหมือนสมุดแผนที่ที่รวมแผนที่หลายประเทศไว้ในเล่มเดียว',
        explanation: 'Texture Atlas ทำให้โมเดลหลายชิ้นสามารถใช้ Material เดียวกันได้ ซึ่งช่วยให้เอนจินสามารถรวมพวกมันเป็น Batch เดียวกันได้ทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-b-3',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'GPU Instancing สำหรับการวาดวัตถุซ้ำๆ',
        prompt: 'เทคนิคที่ใช้คำสั่ง Draw Call เพียง 1 ครั้งเพื่อวาดโมเดลเดียวกันจำนวนหลายพันชิ้น (เช่น ใบไม้, หญ้า, ดาวเคราะห์) เรียกว่า ___BLANK___:',
        codeSnippet: `// วาดหินอุกกาบาต 5,000 ก้อนใน 1 คำสั่ง:
Graphics.DrawMeshInstanced(mesh, 0, material, matrices);`,
        options: ['GPU Instancing', 'Ray Tracing', 'Alpha Blending', 'Tessellation'],
        correctAnswer: 'GPU Instancing',
        hint: 'Instance แปลว่า สำเนา หรือ ชิ้นตัวอย่าง',
        explanation: 'GPU Instancing ส่งข้อมูลเมชแค่รอบเดียว แล้วส่ง Matrix อาเรย์ตำแหน่งของแต่ละตัวไปให้การ์ดจอวาดรวดเดียวใน 1 Draw Call',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-b-4',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'สิ่งที่เป็นสาเหตุทำให้ Batch แตก (Break Batching)',
        prompt: 'ข้อใดเป็นสาเหตุที่ทำให้ Game Engine ไม่สามารถรวมวัตถุสองชิ้นเข้าเป็น Batch เดียวกันได้?',
        options: [
          'วัตถุทั้งสองใช้ Material ต่างกัน หรือใช้ Shader คนละตัวกัน',
          'วัตถุทั้งสองมีตำแหน่งพิกัด X ต่างกัน',
          'วัตถุทั้งสองหมุนด้วยความเร็วต่างกัน',
          'เกมถูกเล่นในโหมดเต็มหน้าจอ'
        ],
        correctAnswer: 0,
        hint: 'การเปลี่ยน Material หรือ Shader บังคับให้การ์ดจอต้องเปลี่ยน State การเรนเดอร์',
        explanation: 'การสลับ Material/Shader/Texture ทำให้เกิด Render State Change ซึ่งตัดจบ Batch เดิมทันทีและต้องเริ่ม Draw Call ใหม่',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-b-5',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การป้องกันการโคลน Material ใน Unity',
        prompt: 'ใน Unity หากต้องการเปลี่ยนสีวัตถุโดยไม่ทำลาย Batching และไม่สร้าง Material Instance ใหม่บน Heap ต้องใช้คลาสใด:',
        codeSnippet: `// เปลี่ยนสีแบบไม่ทำลาย Batching:
MaterialPropertyBlock prop = new MaterialPropertyBlock();
prop.SetColor("_Color", Color.red);
___BLANK___;`,
        options: ['renderer.SetPropertyBlock(prop)', 'renderer.material.color = Color.red', 'renderer.sharedMaterial = null', 'Destroy(renderer)'],
        correctAnswer: 'renderer.SetPropertyBlock(prop)',
        hint: 'ใช้ Property Block แทนการเรียก renderer.material',
        explanation: 'การเรียก `renderer.material` จะโคลน Material ใหม่และทำลาย Batching ขณะที่ `SetPropertyBlock` ส่งค่าเข้า Per-instance buffer โดยไม่โคลน Material',
        engineContext: 'Unity',
      },
      {
        id: 'draw-b-6',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'Static Batching vs Dynamic Batching',
        prompt: 'Static Batching ใน Game Engine เหมาะสำหรับวัตถุประเภทใดในฉาก?',
        options: [
          'วัตถุที่อยู่นิ่งกับที่ ไม่มีการเคลื่อนที่ตลอดเกม (เช่น อาคาร, เสาไฟ, โขดหิน)',
          'กระสุนปืนกลที่บินด้วยความเร็วสูง',
          'ตัวละครผู้เล่นที่วิ่งไปมา',
          'อนุภาคควันไฟที่กระจายตัว'
        ],
        correctAnswer: 0,
        hint: 'Static แปลว่า อยู่นิ่ง ไม่ขยับเขยื้อน',
        explanation: 'Static Batching รวม Mesh ของวัตถุนิ่งล่วงหน้าเป็นก้อนเดียวในหน่วยความจำตอนเริ่มเกม แลกกับขนาดหน่วยความจำที่เพิ่มขึ้นเล็กน้อย',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-b-7',
        topicId: 'draw-calls-batching',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'คอขวดที่แท้จริงของ Draw Call จำนวนมาก',
        prompt: 'เมื่อมี Draw Call สูงถึง 5,000 ครั้งต่อเฟรม สาเหตุหลักที่ทำให้เฟรมเรตตกเกิดจากคอขวดที่ ___BLANK___:',
        codeSnippet: `// สถานะของฮาร์ดแวร์:
GPU Usage: 22% (ว่างงาน)
CPU Render Thread: 100% (ติดคอขวด ___BLANK___ Driver Overhead)`,
        options: ['CPU Driver Overhead', 'GPU Shading Units', 'ความเร็วรอบพัดลม', 'ลำโพงคอมพิวเตอร์'],
        correctAnswer: 'CPU Driver Overhead',
        hint: 'ซีพียูเสียเวลาแปลคำสั่งและสลับโหมดส่งข้อมูลให้การ์ดจอ',
        explanation: 'คอขวดของ Draw Call คือ CPU Overhead ในการสลับ Render State และส่งคำสั่งผ่านไดรเวอร์ ไม่ใช่ตัวชิป GPU วาดไม่ไหว',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'draw-p-1',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์บั๊ก: การเรียก `renderer.material` ทำลาย Batching ทั้งฉาก',
        prompt: 'เกมมีต้นไม้ 2,000 ต้นที่เปิด GPU Instancing ไว้อย่างดี แต่เมื่อเขียนสคริปต์ให้ต้นไม้กะพริบสีตอนถูกฟันด้วย `GetComponent<Renderer>().material.color = Color.white;` ปรากฏว่า Draw Call พุ่งจาก 3 ครั้งเป็น 2,000 ครั้งทันที เกิดจากอะไร?',
        options: [
          'การเข้าถึง `.material` ใน Unity จะสั่ง Instantiate (โคลน) Material ก้อนใหม่เฉพาะตัวขึ้นมาบน Heap ทำให้ต้นไม้ทุกต้นมี Material ID ต่างกันและรวม Batch ไม่ได้อีกต่อไป',
          'ตัวแปร Color.white กินหน่วยความจำเกินขีดจำกัดของการ์ดจอ',
          'Unity ไม่รองรับการเปลี่ยนสีในเกม 3D',
          'ตัวต้นไม้ถูกลบออกจากฉากแล้วสร้างใหม่'
        ],
        correctAnswer: 0,
        hint: 'Property .material จะสร้างสำเนา Material อัตโนมัติเมื่อมีการอ่านหรือเขียน',
        explanation: 'นี่คือหลุมพรางยอดฮิตของ Unity! การแตะ `.material` สร้าง Material Clone ใหม่เสมอ ต้องใช้ `MaterialPropertyBlock` เพื่อส่งค่าตัวแปรเข้า Per-Instance GPU Buffer แทน',
        engineContext: 'Unity',
      },
      {
        id: 'draw-p-2',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'GPU-Driven Rendering และ Indirect Draw Calls',
        prompt: 'ในสถาปัตยกรรมเอนจินยุคใหม่ (เช่น Unreal Engine 5 Nanite หรือ Doom Eternal) เทคนิค Indirect Drawing (`DrawIndexedInstancedIndirect` / `glMultiDrawElementsIndirect`) ช่วยลดภาระ CPU ได้อย่างไร?',
        options: [
          'ให้ GPU Compute Shader ทำการ Frustum Culling และสร้าง Buffer อาร์กิวเมนต์คำสั่งวาดเอง โดย CPU สั่ง Dispatch แค่ครั้งเดียวและไม่ต้องส่งคำสั่งวาดแต่ละชิ้นผ่านไดรเวอร์อีกต่อไป',
          'ให้ CPU ทำการเรนเดอร์ภาพลง RAM โดยไม่ต้องพึ่งพาการ์ดจอ',
          'ลดความละเอียดของหน้าจอลงเหลือ 240p อัตโนมัติ',
          'แปลงไฟล์ภาพทั้งหมดให้เป็นไฟล์ข้อความ JSON'
        ],
        correctAnswer: 0,
        hint: 'ให้การ์ดจอเป็นผู้คำนวณและสั่งตัวเองวาด (GPU-Driven)',
        explanation: 'Indirect Drawing ย้ายหน้าที่ทั้งหมด (Culling, LOD selection, Draw argument generation) ไปอยู่บน Compute Shader ของ GPU ทำให้ CPU ว่างงานอย่างสมบูรณ์',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'draw-p-3',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับ Render Queue Sorting ในกราฟิกส์เอนจิน',
        prompt: 'เรียงลำดับขั้นตอนการจัดกลุ่มและจัดลำดับ Render Queue ก่อนส่งคำสั่งวาดสู่ GPU API:',
        options: [
          'Frustum & Occlusion Culling: คัดกรองเฉพาะวัตถุที่อยู่ในกรวยสายตา',
          'State Grouping: จัดกลุ่มวัตถุตาม Shader และ Texture Material เดียวกัน',
          'Opaque Front-to-Back Sort: เรียงวัตถุทึบแสงจากหน้าไปหลังเพื่อใช้พลัง Early-Z',
          'Transparent Back-to-Front Sort: เรียงวัตถุโปร่งแสงจากหลังมาหน้าเพื่อผสมสี Alpha Blending'
        ],
        correctAnswer: [
          'Frustum & Occlusion Culling: คัดกรองเฉพาะวัตถุที่อยู่ในกรวยสายตา',
          'State Grouping: จัดกลุ่มวัตถุตาม Shader และ Texture Material เดียวกัน',
          'Opaque Front-to-Back Sort: เรียงวัตถุทึบแสงจากหน้าไปหลังเพื่อใช้พลัง Early-Z',
          'Transparent Back-to-Front Sort: เรียงวัตถุโปร่งแสงจากหลังมาหน้าเพื่อผสมสี Alpha Blending'
        ],
        hint: 'คัดกรองวัตถุ -> จัดกลุ่มตาม Material -> เรียงวัตถุทึบหน้าไปหลัง -> เรียงวัตถุใสหลังมาหน้า',
        explanation: 'นี่คือขั้นตอนมาตรฐาน: คัดกรอง -> รวมกลุ่มลด State Change -> เรียงวัตถุทึบเพื่อ Early-Z -> เรียงวัตถุใสเพื่อความถูกต้องของ Alpha Blending',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-p-4',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'ข้อจำกัดของ Constant Buffer (UBO) ใน GPU Instancing',
        prompt: 'เมื่อส่งข้อมูลตำแหน่ง Matrix ของ 20,000 ก้อนหินเข้า GPU Instancing ผ่าน Uniform Buffer Object (UBO หรือ Constant Buffer) เหตุใดจึงต้องแบ่ง Batch ละ 500-1,000 ก้อน?',
        options: [
          'เพราะ Constant Buffer ใน DirectX 11/OpenGL มีขนาดความจุจำกัดทั่วไปที่ 64KB ต่อ Buffer หากเกินจะต้องสลับใช้ StructuredBuffer หรือแบ่งเป็นหลาย Batch',
          'เพราะการ์ดจอสามารถจำเลขได้สูงสุด 1,000 ตัวเท่านั้น',
          'เพราะระบบเครือข่ายอินเทอร์เน็ตจะตัดการเชื่อมต่อ',
          'เพราะฮาร์ดดิสก์ไม่สามารถเขียนข้อมูลพร้อมกันได้'
        ],
        correctAnswer: 0,
        hint: 'ขนาด 64KB คือขีดจำกัดมาตรฐานของ Constant Buffer (d3d11 max constant buffer size)',
        explanation: 'Matrix 4x4 กินพื้นที่ 64 ไบต์ ดังนั้น Buffer ขนาด 64KB จะเก็บได้สูงสุดประมาณ 1,023 matrices จึงต้องแบ่ง Batch หรือใช้ SSBO / StructuredBuffer แทน',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'draw-p-5',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Modern Graphics APIs (Vulkan / DX12) vs Legacy APIs (DX11 / OpenGL)',
        prompt: 'Vulkan และ DirectX 12 ช่วยแก้ปัญหา Draw Call Overhead ที่ระดับสถาปัตยกรรมอย่างไร?',
        options: [
          'อนุญาตให้บันทึกคำสั่งเรนเดอร์ (Command Buffers / Command Lists) ขนานกันบน Multi-core CPU หลายเธรดพร้อมกันได้อย่างอิสระ',
          'ลบขั้นตอนการวาดภาพทิ้งและให้ AI จินตนาการภาพแทน',
          'บังคับให้การ์ดจอทำงานด้วยความถี่สูงเป็นสองเท่าตลอดเวลา',
          'ห้ามไม่ให้โปรแกรมเมอร์ใช้ Shader ในเกม'
        ],
        correctAnswer: 0,
        hint: 'Multi-threaded Command Recording คือจุดขายสำคัญที่สุดของ Vulkan และ DX12',
        explanation: 'DirectX 11 บังคับให้ส่งคำสั่งผ่าน Immediate Context เธรดเดียว ขณะที่ Vulkan/DX12 ให้ทุก CPU Core บันทึก Command Buffer ได้พร้อมกัน แล้วส่ง Execute รวดเดียว',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'draw-p-6',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ปัญหา Static Batching ทำให้หน่วยความจำ VRAM ระเบิด',
        prompt: 'ทีมงานเปิดใช้งาน Static Batching กับปราสาทหินที่มีเสาโรมันเหมือนกันเป๊ะ 1,000 ต้น ปรากฏว่าเกมกิน VRAM พุ่งจาก 500MB เป็น 4GB และโหลดเกมนานมาก แนวทางแก้ไขเชิงสถาปัตยกรรมคืออะไร?',
        options: [
          'ปิด Static Batching สำหรับเสาที่ซ้ำกัน แล้วเปลี่ยนมาใช้ GPU Instancing เพื่อแชร์ข้อมูล Mesh เสาต้นเดียวใน VRAM',
          'ลบเสาหินทิ้งทั้งหมดให้เหลือแต่พื้นดินว่างเปล่า',
          'เปลี่ยนไปใช้ภาพวาด 2D แปะแทนเสาทั้งหมด',
          'เพิ่มขนาด Swap Memory บนระบบปฏิบัติการเป็น 100GB'
        ],
        correctAnswer: 0,
        hint: 'Static Batching จะรวมเรขาคณิตเป็นก้อนใหม่ขนาดยักษ์ ทำให้สูญเสียการแชร์ Mesh ซ้ำ',
        explanation: 'Static Batching ทำการ Clone และหลอมรวม Geometry 1,000 ต้นรวมกันเป็น Mesh มหึมาก้อนใหม่ ทำให้เปลือง VRAM มหาศาล สำหรับวัตถุที่ซ้ำกันต้องใช้ GPU Instancing เท่านั้น',
        engineContext: 'General Engine',
      },
      {
        id: 'draw-p-7',
        topicId: 'draw-calls-batching',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'SRP Batcher ใน Unity Universal Render Pipeline (URP)',
        prompt: 'SRP Batcher ของ Unity แตกต่างจาก Dynamic Batching แบบดั้งเดิมอย่างไร?',
        options: [
          'ไม่ทำการรวม Mesh ใน CPU แต่คง Render State บน GPU ไว้และอัปเดตเฉพาะ Material Data Buffers ใน VRAM ทำให้วาด Mesh หลากหลายรูปแบบได้โดยแทบไม่มี CPU SetPass Overhead',
          'ทำการลดจำนวนโพลีกอนของโมเดลลง 90% ทุกเฟรม',
          'บังคับให้ทุกโมเดลต้องมีขนาดเท่ากันเป๊ะ',
          'ทำงานได้เฉพาะบนเครื่อง Mac เท่านั้น'
        ],
        correctAnswer: 0,
        hint: 'SRP Batcher เก็บ Material Data ไว้ใน VRAM ล่วงหน้าและไม่รวม Mesh บน CPU',
        explanation: 'SRP Batcher เร่งความเร็วโดยการลดค่าใช้จ่ายในการ Bind Shader และ Setup State ทำให้โมเดลคนละรูปทรงกันที่ใช้ Shader เดียวกันเรนเดอร์ได้ต่อเนื่องโดยไม่มี Draw Call Hitch',
        engineContext: 'Unity',
      },
    ],
  },
};
