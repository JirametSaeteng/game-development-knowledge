import type { TopicQuizData } from '../types/quiz';

export const QUIZZES_PART_2: Record<string, TopicQuizData> = {
  // =========================================================================
  // 6. PATHFINDING ALGORITHMS
  // =========================================================================
  'pathfinding-algorithms': {
    topicId: 'pathfinding-algorithms',
    beginner: [
      {
        id: 'path-b-1',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'สูตรฟังก์ชันต้นทุนรวมของ A* (A-Star)',
        prompt: 'ในอัลกอริทึม A* ค่าฟังก์ชันการประเมิน $f(n)$ คำนวณจากต้นทุนจริง $g(n)$ รวมกับค่าประมาณการ ___BLANK___:',
        codeSnippet: `// สูตรหัวใจสำคัญของ A*:
f(n) = g(n) + ___BLANK___;`,
        options: ['h(n) (Heuristic / ค่าระยะทางคาดเดา)', '100', 'n * 2', '0'],
        correctAnswer: 'h(n) (Heuristic / ค่าระยะทางคาดเดา)',
        hint: 'h(n) มาจากคำว่า Heuristic ซึ่งใช้เดาระยะทางไปยังเป้าหมายล่วงหน้า',
        explanation: '$f(n) = g(n) + h(n)$ โดย $g(n)$ คือระยะทางจริงจากจุดเริ่มต้น และ $h(n)$ คือ Heuristic คาดเดาไปยังเป้าหมาย ทำให้ A* ค้นหาอย่างมีทิศทาง',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-2',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'Heuristic สำหรับการเดิน 4 ทิศทาง (Grid 4-Directions)',
        prompt: 'เมื่อตัวละครเดินได้เฉพาะ 4 ทิศทาง (บน ล่าง ซ้าย ขวา) บน Grid สูตร Heuristic ที่เหมาะสมที่สุดคือ:',
        codeSnippet: `function getHeuristic(a: Point, b: Point): number {
  // ระยะทางแบบตารางหมากรุก (Manhattan Distance):
  return ___BLANK___;
}`,
        options: [
          'Math.abs(a.x - b.x) + Math.abs(a.y - b.y)',
          'Math.hypot(a.x - b.x, a.y - b.y)',
          'Math.max(a.x, b.x)',
          'a.x * b.x + a.y * b.y'
        ],
        correctAnswer: 'Math.abs(a.x - b.x) + Math.abs(a.y - b.y)',
        hint: 'บวกผลต่างของแกน X และแกน Y แบบสัมบูรณ์ (Taxicab / Manhattan Distance)',
        explanation: 'Manhattan Distance คือผลรวม $|x_1 - x_2| + |y_1 - y_2|$ ซึ่งแม่นยำและไม่ Overestimate เมื่อเดินได้เฉพาะ 4 ทิศทาง',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-3',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'โครงสร้างข้อมูลสำหรับ Open Set ใน A*',
        prompt: 'โครงสร้างข้อมูลใดที่ใช้ค้นหา Node ที่มีค่า $f(n)$ ต่ำที่สุดได้อย่างรวดเร็วในเวลา $O(\\log N)$?',
        options: [
          'Min-Heap / Priority Queue',
          'Unsorted Array / List',
          'Stack (LIFO)',
          'Circular Queue'
        ],
        correctAnswer: 0,
        hint: 'Priority Queue ที่สร้างด้วย Binary Heap ดึงตัวที่น้อยที่สุดได้แบบ $O(1)$ และแทรก $O(\\log N)$',
        explanation: 'Min-Heap (Priority Queue) ช่วยให้ A* สามารถดึงโหนดที่มีค่า $f$ ต่ำที่สุดออกมาสำรวจต่อได้อย่างรวดเร็ว ต่างจาก Unsorted Array ที่กินเวลา $O(N)$ ทุกรอบ',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-4',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'เงื่อนไขการค้นพบเส้นทางสำเร็จ (Early Exit)',
        prompt: 'ในลูปของ A* เมื่อโหนดที่หยิบออกจาก Open Set มีพิกัดตรงกับ ___BLANK___ แสดงว่าพบเส้นทางที่สั้นที่สุดแล้ว:',
        codeSnippet: `while (!openSet.isEmpty()) {
  const current = openSet.pop();
  if (current.equals(___BLANK___)) {
    return reconstructPath(current);
  }
}`,
        options: ['เป้าหมายปลายทาง (Target / Goal Node)', 'จุดเริ่มต้น (Start Node)', 'สิ่งกีดขวาง (Obstacle Node)', 'จุดศูนย์กลางแผนที่'],
        correctAnswer: 'เป้าหมายปลายทาง (Target / Goal Node)',
        hint: 'เมื่อโหนดปัจจุบันคือจุดหมายปลายทางที่ต้องการไปถึง',
        explanation: 'เมื่อ `current == goalNode` เราสามารถหยุดค้นหาและย้อนรอย Parent Pointer เพื่อสร้างเส้นทาง (Reconstruct Path) ได้ทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-5',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'นิยามของ Admissible Heuristic',
        prompt: 'คำว่า "Admissible Heuristic" ในอัลกอริทึม A* หมายถึงข้อใด?',
        options: [
          'ค่า Heuristic จะต้องไม่เกินต้นทุนจริงที่เหลืออยู่ (Never overestimates the true cost)',
          'ค่า Heuristic จะต้องเท่ากับศูนย์เสมอ',
          'ค่า Heuristic จะต้องมีค่าเป็นเลขจำนวนเต็มบวกเกิน 1,000 เสมอ',
          'ค่า Heuristic ต้องคำนวณผ่านปัญญาประดิษฐ์ Machine Learning เท่านั้น'
        ],
        correctAnswer: 0,
        hint: 'การเดาที่ไม่เว่อร์เกินจริง จะรับประกันว่าจะได้เส้นทางที่สั้นที่สุดเสมอ',
        explanation: 'หาก Heuristic เป็น Admissible ($h(n) \\le h^*(n)$) A* จะรับประกันการค้นพบเส้นทางที่ดีที่สุด (Optimal Path) เสมอ',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-6',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การย้อนรอยสร้างเส้นทาง (Path Reconstruction)',
        prompt: 'การสร้างเส้นทางจากเป้าหมายกลับสู่จุดเริ่มต้นทำได้โดยการเดินตามพอยน์เตอร์ใด:',
        codeSnippet: `function reconstructPath(goalNode: Node): Point[] {
  const path: Point[] = [];
  let curr: Node | null = goalNode;
  while (curr !== null) {
    path.push(curr.point);
    curr = ___BLANK___; // ถอยกลับไปยังโหนดพ่อแม่ที่เดินผ่านมา
  }
  return path.reverse();
}`,
        options: ['curr.parent', 'curr.next', 'goalNode', 'null'],
        correctAnswer: 'curr.parent',
        hint: 'เดินย้อนกลับตามโหนดแม่ (Parent Pointer) ที่บันทึกไว้ตอนสำรวจ',
        explanation: 'แต่ละโหนดจะเก็บอ้างอิงถึง `parent` ที่ส่งมันมา เมื่อถึงเป้าหมายจึงเดินย้อน `curr.parent` กลับไปจนถึงจุดเริ่มต้นแล้วกลับด้านอาเรย์',
        engineContext: 'General Engine',
      },
      {
        id: 'path-b-7',
        topicId: 'pathfinding-algorithms',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ข้อจำกัดของ Dijkstra เปรียบเทียบกับ A*',
        prompt: 'ทำไม Dijkstra จึงช้ากว่า A* ในการหาทางระหว่างจุด A ไปจุด B ในโลกเกม?',
        options: [
          'เพราะ Dijkstra กระจายตัวสำรวจแบบวงกลมรอบทิศทางโดยไม่มีทิศทางนำทางเป้าหมาย ($h(n) = 0$)',
          'เพราะ Dijkstra ไม่รองรับแผนที่ที่มีสิ่งกีดขวาง',
          'เพราะ Dijkstra ทำงานได้เฉพาะบนระบบปฏิบัติการ Linux',
          'เพราะ Dijkstra ใช้หน่วยความจำฮาร์ดดิสก์ทั้งหมด'
        ],
        correctAnswer: 0,
        hint: 'Dijkstra ไม่มี Heuristic ชี้เป้า จึงต้องสำรวจรอบตัวเป็นคลื่นน้ำทรงกลม',
        explanation: 'Dijkstra เทียบเท่ากับ A* ที่มี $h(n) = 0$ ทำให้เสียเวลาสำรวจโหนดในทิศตรงข้ามกับเป้าหมายอย่างไม่จำเป็น',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'path-p-1',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการเฟรมเรตร่วงเมื่อยูนิต 500 ตัวเดินพร้อมกัน (RTS Pathfinding Lag)',
        prompt: 'ในเกม RTS เมื่อสั่งให้ทหาร 500 ตัวเดินไปยังจุดหมายเดียวกันพร้อมกัน เกมเกิดอาการกระตุกค้าง 200ms Profiler ชี้ว่า A* Pathfinding ถูกเรียกซ้ำ 500 ครั้งในเฟรมเดียว สถาปัตยกรรมใดแก้ปัญหานี้ได้ดีที่สุด?',
        options: [
          'ใช้ Flow Field Pathfinding (Vector Field): คำนวณแผนที่สนามเวกเตอร์ 1 ครั้งจากเป้าหมาย แล้วให้ยูนิต 500 ตัวอ่านทิศทางไหลร่วมกัน',
          'ลดจำนวนทหารในเกมลงเหลือ 1 ตัว',
          'ให้ทหารทุกคนเดินเป็นเส้นตรงทะลุสิ่งกีดขวางไปเลย',
          'สั่ง Sleep เธรดละ 5 มิลลิวินาที'
        ],
        correctAnswer: 0,
        hint: 'คำนวณ Dijkstra ย้อนกลับจากเป้าหมาย 1 ครั้ง ได้เวกเตอร์ชี้ทิศทางให้คนนับหมื่นเดินตาม',
        explanation: 'Flow Field (ใช้ใน Supreme Commander และ Total War) คำนวณ Integration Field ย้อนกลับจากเป้าหมายเพียงครั้งเดียว รองรับยูนิตนับหมื่นตัวได้ในต้นทุน $O(1)$ ต่อตัว',
        engineContext: 'General Engine',
      },
      {
        id: 'path-p-2',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'NavMesh Path Smoothing และ String Pulling (Funnel Algorithm)',
        prompt: 'เมื่อหาเส้นทางผ่าน Navigation Mesh (NavMesh) โพลิกอนในเกม 3D เส้นทางเริ่มต้นจะเป็นการเดินผ่านกึ่งกลางของแต่ละ Portal ขอบโพลิกอน ทำไมจึงต้องใช้ Funnel Algorithm (String Pulling)?',
        options: [
          'เพื่อดึงเส้นทางให้ตึงและตรงที่สุด (ขจัดอาการเดินเลี้ยวซิกแซกไร้สาระ) เลาะตามมุมเลี้ยวของสิ่งกีดขวาง',
          'เพื่อลดขนาดไฟล์ของ NavMesh บนฮาร์ดดิสก์',
          'เพื่อเปลี่ยนสีของโพลิกอนให้สวยงาม',
          'เพื่อป้องกันไม่ให้ตัวละครตกทะลุพื้น'
        ],
        correctAnswer: 0,
        hint: 'เปรียบเหมือนเอาเชือกขึงผ่านช่องประตูแล้วดึงเชือกให้ตึงที่สุด',
        explanation: 'Funnel Algorithm ตรวจสอบรูปทรงกรวย (Left/Right portals) เพื่อหาทางตรงที่สั้นและเป็นธรรมชาติที่สุดสำหรับตัวละคร',
        engineContext: 'Unity',
      },
      {
        id: 'path-p-3',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับวงรอบการทำงานของ A* Algorithm',
        prompt: 'เรียงลำดับขั้นตอนภายในลูปประมวลผลของ A* Pathfinding:',
        options: [
          'ดึงโหนดที่มีค่า f ต่ำที่สุดออกจาก OpenSet และย้ายเข้า ClosedSet',
          'ตรวจสอบว่าถึงเป้าหมายหรือไม่ หากถึงให้ Reconstruct Path ทันที',
          'วนลูปหาเพื่อนบ้านที่ถูกต้อง (Neighbors) ที่ยังไม่ถูกปิดและไม่ชนกำแพง',
          'คำนวณ tentative_g และอัปเดต parent พร้อมใส่ลง OpenSet หากได้ทางที่ดีกว่าเดิม'
        ],
        correctAnswer: [
          'ดึงโหนดที่มีค่า f ต่ำที่สุดออกจาก OpenSet และย้ายเข้า ClosedSet',
          'ตรวจสอบว่าถึงเป้าหมายหรือไม่ หากถึงให้ Reconstruct Path ทันที',
          'วนลูปหาเพื่อนบ้านที่ถูกต้อง (Neighbors) ที่ยังไม่ถูกปิดและไม่ชนกำแพง',
          'คำนวณ tentative_g และอัปเดต parent พร้อมใส่ลง OpenSet หากได้ทางที่ดีกว่าเดิม'
        ],
        hint: 'หยิบโหนดดีสุด -> เช็คปลายทาง -> หาเพื่อนบ้าน -> คำนวณต้นทุนใหม่',
        explanation: 'นี่คือลูปมาตรฐานของ A*: Pop Lowest F -> Goal Check -> Expand Neighbors -> Evaluate & Update G/F Cost',
        engineContext: 'General Engine',
      },
      {
        id: 'path-p-4',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Hierarchical Pathfinding (HPA*) สำหรับแผนที่ขนาดมหึมา',
        prompt: 'ในเกม Open World แผนที่ขนาด 8,192 x 8,192 ช่อง การใช้ HPA* (Hierarchical Pathfinding) ช่วยประหยัดเวลา CPU ได้อย่างไร?',
        options: [
          'แบ่งโลกออกเป็นคลัสเตอร์ขนาดเล็ก (เช่น 32x32) และสร้างเส้นทางระดับมหภาคระหว่างประตูคลัสเตอร์ก่อน จากนั้นจึงค่อยหาทางย่อยเฉพาะในคลัสเตอร์ปัจจุบัน',
          'ลบพื้นที่ 90% ของแผนที่ทิ้งเมื่อผู้เล่นเดินผ่าน',
          'ใช้ภาพถ่ายดาวเทียมจริงของโลกมาคำนวณแทน',
          'บังคับให้แผนที่แบนราบไม่มีความชัน'
        ],
        correctAnswer: 0,
        hint: 'หาทางหลวงเชื่อมต่อข้ามเมืองใหญ่ก่อน ค่อยหาซอยย่อยในหมู่บ้าน',
        explanation: 'HPA* สร้างโครงร่างกราฟระดับสูง (Abstract Graph) ทำให้ระยะทางไกลๆ ลดจำนวนโหนดที่ต้องประมวลผลลงได้ถึง 95%+',
        engineContext: 'General Engine',
      },
      {
        id: 'path-p-5',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Local Avoidance ด้วย RVO (Reciprocal Velocity Obstacles) / ORCA',
        prompt: 'เมื่อทหารสองคนเดินสวนกันในทางแคบ เหตุใดการใช้ Local Avoidance เช่น RVO/ORCA จึงดีกว่าการสั่งคำนวณ A* เส้นทางใหม่ (Full Re-path)?',
        options: [
          'RVO คำนวณใน Velocity Space แบบเรียลไทม์ โดยให้ทั้งสองฝ่ายเบี่ยงความเร็วคนละครึ่งเพื่อหลบกันได้อย่างลื่นไหลโดยไม่ต้องทิ้งเส้นทางเดิม',
          'เพราะ RVO ทำให้ทหารคนหนึ่งล่องหนเพื่อให้ทหารอีกคนเดินทะลุผ่านได้',
          'เพราะ A* ไม่สามารถเดินสวนทางได้ในภาษา C++',
          'เพราะ RVO ช่วยเพิ่มพลังโจมตีของทหาร'
        ],
        correctAnswer: 0,
        hint: 'เบี่ยงความเร็วหลบในพื้นที่ความเร็ว (Velocity Space) เล็กน้อย แทนที่จะหาทางใหม่ทั้งแผนที่',
        explanation: 'ORCA (Optimal Reciprocal Collision Avoidance) คือมาตรฐานการหลบหลีกระดับตัวละครที่แชร์ความรับผิดชอบในการหลบคนละครึ่งโดยไม่กระทบแผนที่เส้นทางหลัก',
        engineContext: 'General Engine',
      },
      {
        id: 'path-p-6',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ปัญหา Path Request Spikes และ Time-Sliced Pathfinding',
        prompt: 'เมื่อผู้เล่นสั่งยูนิตจำนวนมากพร้อมกัน หรือสิ่งกีดขวางพังทลาย ระบบเกมกระตุกเป็นจังหวะเพราะคำขอหาทางเข้ามาพร้อมกัน แนวทางการจัดสรรเวลา (Time-Slicing Budget) ที่ถูกต้องคืออะไร?',
        options: [
          'สร้าง Pathfinding Request Queue และจำกัดเวลาคำนวณไม่เกิน 2ms ต่อเฟรม หากหมดโควต้าให้ค้างสถานะเพื่อทำต่อในเฟรมถัดไป',
          'ปล่อยให้คำนวณจนเสร็จแม้เฟรมจะค้างไป 500ms',
          'ยกเลิกคำสั่งเดินของผู้เล่นทั้งหมดที่ส่งเข้ามา',
          'ปิดระบบฟิสิกส์เพื่อนำเวลามาให้ Pathfinding ทั้งหมด'
        ],
        correctAnswer: 0,
        hint: 'กำหนดงบเวลาต่อเฟรม (Budget per frame) ไม่ให้การหาทางแย่งเวลาเรนเดอร์',
        explanation: 'Time-slicing และ Asynchronous Path Requests ช่วยให้การคำนวณกระจายตัวข้ามหลายเฟรม โดยมี Coroutine หรือ Job Worker จัดการคิวตามลำดับความสำคัญ',
        engineContext: 'General Engine',
      },
      {
        id: 'path-p-7',
        topicId: 'pathfinding-algorithms',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'JPS (Jump Point Search) สำหรับ Uniform Grid Maps',
        prompt: 'Jump Point Search (JPS) เร่งความเร็ว A* บน Uniform Grid ได้เร็วกว่าเดิม 10-40 เท่าโดยอาศัยหลักการทางเรขาคณิตใด?',
        options: [
          'กระโดดข้ามเส้นตรงที่ไม่มีสิ่งกีดขวาง (Pruning Symmetrical Paths) และหยุดเฉพาะจุดเลี้ยวที่มีสิ่งกีดขวางบัง (Forced Neighbors)',
          'ลบจุดหมายปลายทางออกและสร้างจุดหมายใหม่ที่อยู่ใกล้ตัว',
          'ให้ตัวละครกระโดดข้ามกำแพงได้ทันที',
          'ใช้การสุ่มตำแหน่งแบบมอนติคาร์โล'
        ],
        correctAnswer: 0,
        hint: 'ตัดเส้นทางที่สมมาตรกันทิ้ง แล้วพุ่งตรงไปข้างหน้าจนกว่าจะเจอมุมเลี้ยว',
        explanation: 'JPS กำจัดความสมมาตรของเส้นทางบนตารางตาราง ทำให้ไม่ต้องใส่โหนดว่างเปล่าลง OpenSet เลย และเร่งความเร็วการค้นหาได้อย่างมหาศาล',
        engineContext: 'General Engine',
      },
    ],
  },

  // =========================================================================
  // 7. GAME AI: FSM VS BEHAVIOR TREES
  // =========================================================================
  'game-ai-fsm-bt': {
    topicId: 'game-ai-fsm-bt',
    beginner: [
      {
        id: 'ai-b-1',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'กฎพื้นฐานของ Finite State Machine (FSM)',
        prompt: 'ในระบบ Finite State Machine (FSM) ทั่วไป ณ เวลาใดเวลาหนึ่ง ตัวละครสามารถอยู่ในสถานะ (State) ได้เพียง ___BLANK___ สถานะเท่านั้น:',
        codeSnippet: `// กฎของ FSM:
enum EnemyState { Idle, Patrol, Chase, Attack }
EnemyState currentState; // อยู่ได้เพียง ___BLANK___ สถานะพร้อมกัน`,
        options: ['1 (สถานะเดียวเท่านั้น)', '10 สถานะ', 'ทุกสถานะพร้อมกัน', 'ไม่มีสถานะเลย'],
        correctAnswer: '1 (สถานะเดียวเท่านั้น)',
        hint: 'FSM แบบดั้งเดิมมีสถานะที่ Active อยู่ได้เพียงตัวเดียวในแต่ละขณะ',
        explanation: 'FSM ควบคุมการทำงานด้วยสถานะเดี่ยวที่มีความแน่นอน เช่น หากกำลัง Chase จะไม่อยู่ใน Patrol พร้อมกัน',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-b-2',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การเปลี่ยนสถานะ State Transition ใน FSM',
        prompt: 'เมื่อต้องการเปลี่ยนสถานะ ต้องสั่งเรียกคำสั่งของ State เก่าและ State ใหม่อย่างไร:',
        codeSnippet: `public void changeState(IState newState): void {
  currentState.onExit();
  currentState = newState;
  ___BLANK___; // สั่งเริ่มทำงานสถานะใหม่
}`,
        options: ['currentState.onEnter()', 'currentState.destroy()', 'delete currentState', 'Thread.sleep(100)'],
        correctAnswer: 'currentState.onEnter()',
        hint: 'เมื่อเข้าสู่สถานะใหม่ ต้องเรียกฟังก์ชัน OnEnter()',
        explanation: 'รูปแบบ State Pattern มาตรฐาน: Exit สถานะเดิม -> สลับตัวแปร -> Enter สถานะใหม่',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-b-3',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'โหนด Sequence ใน Behavior Tree',
        prompt: 'ใน Behavior Tree โหนดประเภท Sequence (ลำดับ) จะประมวลผลลูกทีละตัว และจะล้มเหลวทันทีหากมีลูกตัวใดส่งสถานะ ___BLANK___:',
        codeSnippet: `// Sequence Node (เปรียบเหมือน AND):
// 1. ตรวจสอบกระสุน -> 2. เล็งเป้า -> 3. กดยิง
// ถ้าลูกตัวไหนล้มเหลว ลำดับจะหยุดทันที!`,
        options: ['Failure (ล้มเหลว)', 'Success (สำเร็จ)', 'Running (กำลังทำ)', 'Sleep (หลับ)'],
        correctAnswer: 'Failure (ล้มเหลว)',
        hint: 'Sequence ทำหน้าที่เหมือน AND logic: ทุกอันต้องผ่าน หากมีอันใดล้มเหลวจะจบทันที',
        explanation: 'Sequence Node ต้องการให้ลูกทุกตัว Success ตามลำดับ หากตัวใด Failure มันจะหยุดและส่ง Failure กลับไปทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-b-4',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'โหนด Selector (Fallback) ใน Behavior Tree',
        prompt: 'ใน Behavior Tree โหนดประเภท Selector (หรือ Fallback) จะประมวลผลลูกทีละตัวและจะสำเร็จทันทีเมื่อมีลูกตัวแรกส่งสถานะ ___BLANK___:',
        codeSnippet: `// Selector Node (เปรียบเหมือน OR):
// 1. ลองหลบภัย -> ถ้าไม่ได้ 2. ลองโจมตี -> ถ้าไม่ได้ 3. ลาดตระเวน`,
        options: ['Success (สำเร็จ)', 'Failure (ล้มเหลว)', 'Error', 'Null'],
        correctAnswer: 'Success (สำเร็จ)',
        hint: 'Selector ทำหน้าที่เหมือน OR logic: ขอลูกตัวใดตัวหนึ่งสำเร็จก็เพียงพอ',
        explanation: 'Selector Node จะลองรันลูกทีละตัวจนกว่าจะเจอตัวที่สำเร็จ (Success) หรือกำลังรัน (Running) จึงจะหยุด',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-b-5',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: '3 สถานะการคืนค่า (Return Status) ของ Behavior Tree',
        prompt: 'โหนดใน Behavior Tree เมื่อถูก Tick จะส่งค่าสถานะกลับมาได้ 3 แบบ ข้อใดถูกต้องที่สุด?',
        options: [
          'SUCCESS, FAILURE, RUNNING',
          'TRUE, FALSE, MAYBE',
          'START, PAUSE, STOP',
          'HIGH, MEDIUM, LOW'
        ],
        correctAnswer: 0,
        hint: 'RUNNING หมายถึงโหนดยังทำงานไม่เสร็จในเฟรมนี้ (เช่น กำลังเดินไปยังเป้าหมาย)',
        explanation: 'Behavior Tree อาศัย 3 สถานะ: SUCCESS (ทำเสร็จสมบูรณ์), FAILURE (ล้มเหลว), และ RUNNING (งานต้องใช้เวลาหลายเฟรม)',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-b-6',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'กระดานข้อมูลส่วนกลาง (Blackboard) ใน Behavior Tree',
        prompt: 'โครงสร้างข้อมูลส่วนกลางที่ใช้แชร์ข้อมูลระหว่างโหนดต่างๆ ใน Behavior Tree (เช่น ตำแหน่งผู้เล่น, เลือดที่เหลือ) เรียกว่า ___BLANK___:',
        codeSnippet: `// บอร์ดเก็บความจำของ AI:
blackboard.set("TargetPlayer", playerEntity);
blackboard.set("HasAmmo", true);`,
        options: ['Blackboard (กระดานดำ)', 'Whiteboard', 'HardDrive', 'Clipboard'],
        correctAnswer: 'Blackboard (กระดานดำ)',
        hint: 'กระดานดำคือคำศัพท์เฉพาะที่ Unreal Engine และ Behavior Tree ทั่วโลกใช้เรียก',
        explanation: 'Blackboard คือหน่วยความจำส่วนกลางของ AI Agent ที่อนุญาตให้ Condition Node และ Action Node แลกเปลี่ยนข้อมูลกันได้โดยไม่ต้องผูกคลาสกันตรงๆ',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'ai-b-7',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ปัญหา State Explosion ใน FSM ขนาดใหญ่',
        prompt: 'เมื่อศัตรูในเกมมีความซับซ้อนสูง (มีสถานะเกิน 20-30 สถานะ) ปัญหาหลักที่ทำให้ FSM ดูแลรักษายากคืออะไร?',
        options: [
          'จำนวนเส้นเชื่อมโยงการเปลี่ยนสถานะ (Transitions) จะเพิ่มขึ้นแบบ $O(N^2)$ จนเกิด Spaghetti Logic',
          'ซีพียูไม่สามารถจำชื่อสถานะเกิน 10 ชื่อได้',
          'การ์ดจอจะหยุดประมวลผล',
          'ตัวละครจะขยับตัวช้าลงอัตโนมัติ'
        ],
        correctAnswer: 0,
        hint: 'เส้นโยงสลับไปมาระหว่างทุกสถานะจะพันกันเหมือนเส้นสปาเก็ตตี้',
        explanation: 'State Explosion เกิดจากการที่ทุกสถานะต้องรู้เงื่อนไขการสลับไปยังสถานะอื่น ทำให้โค้ดซับซ้อนและเกิดบั๊กสถานะตกค้างได้ง่าย',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'ai-p-1',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการสั่นกระตุกของสถานะ AI (State Jittering / Thrashing)',
        prompt: 'ยามตรวจจับผู้เล่นที่ยืนอยู่ตรงขอบระยะสายตาพอดี (ระยะ 10.0 เมตร) ปรากฏว่าบอทสลับสถานะไปมาระหว่าง PATROL และ CHASE ทุกๆ เฟรมจนตัวละครกระตุกสั่น สาเหตุและแนวทางแก้ไขเชิงสถาปัตยกรรมคืออะไร?',
        options: [
          'ขาด Hysteresis (ระยะกันชน): ควรแยกเกณฑ์เริ่มไล่ล่า (Enter at 10m) กับเกณฑ์เลิกไล่ล่า (Exit at 13m) หรือใส่ตัวจับเวลาหน่วงขั้นต่ำ (Cooldown)',
          'ลบระยะสายตาทิ้งและให้บอทมองเห็นทั้งแผนที่ตลอดเวลา',
          'เปลี่ยนอนิเมชั่นของตัวละครให้เดินช้าลง',
          'เพิ่มเฟรมเรตของหน้าจอเป็น 360Hz'
        ],
        correctAnswer: 0,
        hint: 'สร้างระยะห่างระหว่างจุดเข้าและจุดออก เพื่อไม่ให้กระตุกตรงรอยต่อ',
        explanation: 'Hysteresis และ Transition Cooldown เป็นเทคนิคสำคัญในการป้องกันไม่ให้ AI สลับสถานะถี่เกินไปเมื่อค่าตรวจวัดแกว่งอยู่รอบๆ Threshold',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-p-2',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Decorator Node และ Service ใน Behavior Trees ของ Unreal Engine',
        prompt: 'ใน Unreal Engine Behavior Trees โหนด Decorator ทำหน้าที่อะไรในโครงสร้างต้นไม้?',
        options: [
          'ทำหน้าที่เป็นเงื่อนไขตรวจสอบ (Condition Guard) และ Flow Control บนกิ่ง เช่น ตรวจสอบว่าเป้าหมายยังมีชีวิตอยู่หรือไม่ ก่อนอนุญาตให้รันกิ่งย่อย',
          'ทำหน้าที่ตกแต่งเสื้อผ้าและสีผมของโมเดล 3D',
          'ทำหน้าที่เล่นเสียงดนตรีประกอบฉาก',
          'ทำหน้าที่บันทึกไฟล์เซฟเกมลงดิสก์'
        ],
        correctAnswer: 0,
        hint: 'Decorator แปะอยู่บนหัวของโหนดเพื่อเป็นประตูตรวจเงื่อนไข',
        explanation: 'Decorator ใน Unreal Engine ทำหน้าที่เป็น Conditional Gatekeeper (เช่น Check Distance, Blackboard Condition) และสามารถสั่ง Abort กิ่งที่กำลังรันอยู่ได้ทันทีเมื่อเงื่อนไขเปลี่ยน',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'ai-p-3',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'step-order',
        title: 'วงรอบการประมวลผลของ Behavior Tree Tick',
        prompt: 'เรียงลำดับการทำงานเมื่อ Behavior Tree ถูกกระตุ้น (Tick) ในแต่ละเฟรม:',
        options: [
          'เริ่มต้น Tick จาก Root Node สู่ลำดับชั้นด้านล่าง',
          'ประเมินเงื่อนไข Decorator / Blackboard บนกิ่งย่อย',
          'รัน Action Node และส่งค่าสถานะ (Running, Success, Failure) กลับสู่โหนดแม่',
          'โหนดแม่ (Sequence / Selector) อัปเดตและตัดสินใจว่าจะไปกิ่งถัดไปหรือยุติ'
        ],
        correctAnswer: [
          'เริ่มต้น Tick จาก Root Node สู่ลำดับชั้นด้านล่าง',
          'ประเมินเงื่อนไข Decorator / Blackboard บนกิ่งย่อย',
          'รัน Action Node และส่งค่าสถานะ (Running, Success, Failure) กลับสู่โหนดแม่',
          'โหนดแม่ (Sequence / Selector) อัปเดตและตัดสินใจว่าจะไปกิ่งถัดไปหรือยุติ'
        ],
        hint: 'จากบนลงล่าง: Root -> ประเมินเงื่อนไข -> ทำ Action -> สรุปผลกลับแม่',
        explanation: 'นี่คือขั้นตอน Tree Traversal: Root Tick -> Condition Check -> Action Execution -> Composite Resolution',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-p-4',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Utility AI (Scoring-Based Architecture) vs Behavior Trees',
        prompt: 'เกมประเภท Simulation ซับซ้อน (เช่น The Sims หรือ RimWorld) เหตุใดจึงนิยมใช้ Utility AI มากกว่า Behavior Trees?',
        options: [
          'เพราะ Utility AI ใช้การคำนวณคะแนนความคุ้มค่า (Utility Curves 0.0-1.0) ทำให้ตัดสินใจแบบหลายปัจจัยได้ยืดหยุ่น เช่น ถ่ายเทน้ำหนักระหว่าง ความหิว, ความง่วง, และความปลอดภัย ได้ดีกว่ากิ่งไม้คงที่',
          'เพราะ Utility AI ไม่ต้องเขียนโค้ดคอมไพเลอร์',
          'เพราะ Behavior Tree ใช้ไม่ได้กับเกมที่ไม่มีปืน',
          'เพราะ Utility AI กินแบนด์วิดท์อินเทอร์เน็ตน้อยกว่า'
        ],
        correctAnswer: 0,
        hint: 'Utility AI คำนวณคะแนนความพึงพอใจของแต่ละการกระทำอย่างต่อเนื่อง',
        explanation: 'Utility AI อาศัยฟังก์ชันกราฟคะแนนความต้องการ (Response Curves) ช่วยให้ AI เลือกแอ็กชันที่มี Utility สูงสุดในสภาวะที่ปัจจัยรอบตัวซับซ้อนได้อย่างเป็นธรรมชาติ',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-p-5',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Hierarchical State Machine (HFSM) ในการแก้ปัญหาความซ้ำซ้อน',
        prompt: 'Hierarchical State Machine (HFSM) ช่วยแก้ปัญหาของ FSM แบบธรรมดาอย่างไร?',
        options: [
          'จัดกลุ่มสถานะย่อยไว้ภายใต้ Super-State (เช่น สถานะ Walk, Run, Jump อยู่ภายใต้ Grounded State) ทำให้ State ย่อยทั้งหมดแชร์ Transition การถูกโจมตีร่วมกันได้โดยไม่ต้องเขียนซ้ำ',
          'เพิ่มจำนวนแกนซีพียูในการประมวลผล',
          'บังคับให้ศัตรูต้องเดินเป็นแถวตอนเรียงหนึ่ง',
          'เปลี่ยนโค้ดภาษา C# เป็น C++ อัตโนมัติ'
        ],
        correctAnswer: 0,
        hint: 'Super-state ครอบสถานะย่อยไว้ ทำให้สืบทอดกฎการเปลี่ยนสถานะร่วมกันได้',
        explanation: 'HFSM รวมสถานะที่เกี่ยวข้องกันไว้ในหมวดหมู่ใหญ่ ช่วยลดจำนวนเส้น Transition ได้มหาศาลและนำ Logic กลับมาใช้ซ้ำได้อย่างเป็นระเบียบ',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-p-6',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'การลดภาระ CPU ของ AI ด้วย AI Level of Detail (LOD)',
        prompt: 'ในฉากสงครามที่มีทหาร AI 1,000 ตัว ซีพียูติดขัดเพราะทุกตัวรัน Behavior Tree ทุกๆ เฟรม (60Hz) วิธีการ Optimization เชิงสถาปัตยกรรมระดับ Production คืออะไร?',
        options: [
          'ใช้ AI Tick LOD: บอทที่อยู่ใกล้ผู้เล่นให้ Tick ทุกเฟรม (60Hz) ส่วนบอทที่อยู่ไกลออกไปให้กระจาย Tick ทุกๆ 10-30 เฟรม (Interleaved Ticking)',
          'สั่งลบทหารที่อยู่ไกลทิ้งทันทีที่ผู้เล่นหันหลัง',
          'เปลี่ยนพฤติกรรมทหารทุกคนให้ยืนนิ่ง',
          'ลดความละเอียดของพื้นผิวหญ้าลง'
        ],
        correctAnswer: 0,
        hint: 'ลดความถี่ในการคิดของตัวที่อยู่ไกลสายตา (Time-budgeted LOD)',
        explanation: 'AI LOD (ใช้ใน Assassin\'s Creed และ Hitman) กระจายการประมวลผล AI ตามระยะทาง ทำให้สามารถจำลองฝูงชนขนาดใหญ่ได้โดย CPU ไม่โหลดเกินงบ',
        engineContext: 'General Engine',
      },
      {
        id: 'ai-p-7',
        topicId: 'game-ai-fsm-bt',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Event-Driven Behavior Trees vs Polling Behavior Trees',
        prompt: 'ใน Unreal Engine 5 Behavior Trees ถูกออกแบบให้เป็น Event-Driven แทนที่จะเป็น Polling-based เพื่อวัตถุประสงค์ใด?',
        options: [
          'เพื่อให้โหนดไม่ต้องวนลูปประเมินค่าเงื่อนไขซ้ำๆ ทุกเฟรม แต่จะตื่นขึ้นมาประมวลผลเฉพาะเมื่อค่าใน Blackboard มีการเปลี่ยนแปลงจริงๆ ผ่าน Observer Keys',
          'เพื่อให้เกมสามารถสตรีมมิ่งผ่านระบบคลาวด์ได้',
          'เพื่อป้องกันไม่ให้ผู้เล่นมองเห็นตัวละคร AI',
          'เพื่อลบฟังก์ชันทางคณิตศาสตร์ทิ้ง'
        ],
        correctAnswer: 0,
        hint: 'ตื่นขึ้นมาทำงานเฉพาะเมื่อข้อมูลในกระดาน Blackboard เปลี่ยนแปลง',
        explanation: 'Event-driven execution ช่วยประหยัดรอบสัญญาณนาฬิกาของ CPU ได้มหาศาล เพราะไม่ต้องเสียเวลาเดินวนต้นไม้ทั้งต้นหากสถานการณ์รอบตัวยังไม่มีอะไรเปลี่ยนแปลง',
        engineContext: 'Unreal Engine',
      },
    ],
  },

  // =========================================================================
  // 8. FRUSTUM CULLING
  // =========================================================================
  'frustum-culling': {
    topicId: 'frustum-culling',
    beginner: [
      {
        id: 'frustum-b-1',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'ความหมายของ Camera View Frustum',
        prompt: 'View Frustum คือปริมาตรการมองเห็นของกล้อง 3 มิติ ซึ่งมีรูปทรงเรขาคณิตคล้าย ___BLANK___ ที่ถูกตัดยอด:',
        codeSnippet: `// รูปทรงของ Camera Frustum:
// ประกอบด้วยระนาบ 6 ด้าน: Near, Far, Left, Right, Top, Bottom`,
        options: ['พีระมิดตัดยอด (Truncated Pyramid)', 'ลูกบาศก์สี่เหลี่ยมจัตุรัส', 'ทรงกลมสมบูรณ์', 'กระบอกกลวง'],
        correctAnswer: 'พีระมิดตัดยอด (Truncated Pyramid)',
        hint: 'ฐานกว้างด้านหลัง (Far Plane) และยอดตัดด้านหน้า (Near Plane)',
        explanation: 'Perspective View Frustum มีรูปร่างเป็นพีระมิดฐานสี่เหลี่ยมตัดยอด ขอบเขตถูกกำหนดด้วยระนาบ 6 ระนาบ',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-2',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'จำนวนระนาบ (Planes) ของ Camera Frustum ใน 3 มิติ',
        prompt: 'Camera Frustum ทั่วไปในเกม 3D ประกอบด้วยระนาบขอบเขตทั้งหมดกี่ระนาบ?',
        options: ['6 ระนาบ (Near, Far, Left, Right, Top, Bottom)', '2 ระนาบ', '4 ระนาบ', '12 ระนาบ'],
        correctAnswer: 0,
        hint: 'มีหน้า หลัง ซ้าย ขวา บน ล่าง',
        explanation: 'Frustum ประกอบด้วย 6 ระนาบ: Near (ใกล้), Far (ไกล), Left (ซ้าย), Right (ขวา), Top (บน), Bottom (ล่าง)',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-3',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การทดสอบระนาบกับจุดกึ่งกลาง Bounding Sphere',
        prompt: 'ระยะทางแบบมีเครื่องหมาย (Signed Distance) จากจุดศูนย์กลางของทรงกลมไปยังระนาบคำนวณจากสูตรใด:',
        codeSnippet: `function getDistanceToPlane(plane: Plane, center: Vector3): number {
  return ___BLANK___;
}`,
        options: ['Vector3.dot(plane.normal, center) + plane.distance', 'center.x + plane.distance', 'center.length()', '0'],
        correctAnswer: 'Vector3.dot(plane.normal, center) + plane.distance',
        hint: 'Dot Product ระหว่าง Normal เวกเตอร์ของระนาบกับจุดศูนย์กลาง แล้วบวกระยะห่าง d',
        explanation: '$d = \\vec{N} \\cdot \\vec{C} + D$ หากระยะทาง $d < -radius$ แสดงว่าทรงกลมอยู่นอกระนาบอย่างสมบูรณ์',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-4',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Bounding Volume ที่คำนวณการตัดทิ้งได้เร็วที่สุด',
        prompt: 'รูปทรงขอบเขตแบบง่าย (Bounding Volume) ที่ทดสอบกับระนาบ Frustum ได้รวดเร็วและใช้คำสั่งคำนวณน้อยที่สุดคือ ___BLANK___:',
        codeSnippet: `struct ___BLANK___ {
  Vector3 center;
  float radius;
};`,
        options: ['Bounding Sphere (ทรงกลมขอบเขต)', 'Convex Hull', 'Oriented Bounding Box (OBB)', 'Triangle Mesh'],
        correctAnswer: 'Bounding Sphere (ทรงกลมขอบเขต)',
        hint: 'มีเพียงจุดกึ่งกลางและรัศมีตัวเดียว คำนวณด้วย Dot Product เพียง 1 ครั้งต่อระนาบ',
        explanation: 'Bounding Sphere ใช้เพียง Dot Product ระหว่าง Center กับ Plane Normal และเปรียบเทียบกับ Radius เร็วกว่ารูปทรงอื่นทั้งหมด',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-5',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ประโยชน์หลักของ Frustum Culling',
        prompt: 'ประโยชน์หลักที่ระบบกราฟิกส์ได้รับจากการทำ Frustum Culling คืออะไร?',
        options: [
          'ประหยัดรอบประมวลผลของ GPU ในการทำ Vertex Transformation และลด Draw Calls ของวัตถุที่อยู่นอกจอ',
          'เพิ่มเสียงเอฟเฟกต์ในเกมให้ดังกังวานขึ้น',
          'ทำให้ไฟล์เกมมีขนาดเล็กลงเมื่อดาวน์โหลด',
          'ป้องกันการโกงเกมผ่านระบบเครือข่าย'
        ],
        correctAnswer: 0,
        hint: 'วัตถุที่กล้องมองไม่เห็นก็ไม่ต้องส่งไปให้การ์ดจอวาด',
        explanation: 'Frustum Culling คัดกรองวัตถุที่อยู่นอกจอทิ้งตั้งแต่ฝั่ง CPU ก่อนส่ง Draw Call ช่วยประหยัดทั้งแบนด์วิดท์บัสและรอบการประมวลผล Vertex ของ GPU',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-6',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'เงื่อนไขการตัดทิ้ง (Cull Condition) ของวัตถุ',
        prompt: 'หากวัตถุหลุดออกไปอยู่นอกระนาบใดระนาบหนึ่งของ Frustum อย่างสมบูรณ์:',
        codeSnippet: `for (const plane of frustumPlanes) {
  if (plane.getDistance(sphere.center) < -sphere.radius) {
    return ___BLANK___; // อยู่นอกจอแน่นอน ตัดทิ้งไม่ต้องวาด!
  }
}
return true; // อยู่ในจอ`,
        options: ['false', 'true', 'null', 'undefined'],
        correctAnswer: 'false',
        hint: 'หากหลุดแม้แต่ระนาบเดียว ถือว่าไม่อยู่ในมุมมองกล้อง',
        explanation: 'หากระยะทางน้อยกว่า $-radius$ สำหรับระนาบใดระนาบหนึ่ง แสดงว่าวัตถุอยู่นอก Frustum โดยสิ้นเชิง ให้ return false ทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-b-7',
        topicId: 'frustum-culling',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'AABB (Axis-Aligned Bounding Box) คืออะไร',
        prompt: 'คำว่า AABB (Axis-Aligned Bounding Box) แตกต่างจาก OBB (Oriented Bounding Box) อย่างไร?',
        options: [
          'ขอบของกล่อง AABB จะขนานกับแกนพิกัดโลก (X, Y, Z) เสมอ ไม่หมุนเอียงตามตัวละคร',
          'AABB มีรูปร่างเป็นทรงกระบอกกลม',
          'AABB ไม่สามารถปรับขนาดได้ตลอดการเล่นเกม',
          'AABB คำนวณได้เฉพาะบนจอภาพ 2D เท่านั้น'
        ],
        correctAnswer: 0,
        hint: 'Axis-Aligned หมายถึง วางระนาบขนานตรงกับแกนพิกัดหลักเสมอ',
        explanation: 'AABB มีด้านขนานกับแกน X, Y, Z เสมอ ทำให้คำนวณจุดตัดและการทดสอบระนาบได้เร็วกว่ากล่องเอียง (OBB) มหาศาล',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'frustum-p-1',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการเกมกระตุกเมื่อยืนมองกำแพงทึบ (Frustum vs Occlusion Culling)',
        prompt: 'เมื่อผู้เล่นเดินเข้าไปในห้องแคบๆ และหันหน้ามองกำแพงคอนกรีตทึบ เฟรมเรตกลับดิ่งลงเหลือ 15 FPS ทั้งที่มีแค่กำแพงอยู่ตรงหน้า Profiler ระบุว่ามี Draw Calls 3,500 ครั้ง สาเหตุเชิงสถาปัตยกรรมเกิดจากอะไร?',
        options: [
          'Frustum Culling อนุญาตให้วัตถุทั้งหมดในเมืองที่อยู่ "ด้านหลังกำแพง" ผ่านการตรวจสอบเพราะพวกมันยังอยู่ในกรวยสายตา จำเป็นต้องเปิดใช้ Occlusion Culling เพื่อตัดวัตถุที่ถูกบังทิ้ง',
          'กำแพงคอนกรีตมีโพลีกอน 50 ล้านชิ้น',
          'กล้องของผู้เล่นมองเห็นทะลุไปถึงนอกอวกาศ',
          'ระบบเสียงของเกมทำให้เอนจินสะดุด'
        ],
        correctAnswer: 0,
        hint: 'Frustum Culling ดูแค่ว่าอยู่ในกรวยสายตาหรือไม่ แต่มันไม่รู้ว่ามีกำแพงบังอยู่ข้างหน้า',
        explanation: 'Frustum Culling ไม่รู้ว่ามีอะไรบังอยู่ข้างหน้า เมืองทั้งเมืองที่อยู่หลังกำแพงจึงถูกส่งไปวาดทั้งหมด ต้องใช้ Occlusion Culling (PVS, Hierarchical Z-Buffer) มาตัดทิ้ง',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-p-2',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'SIMD-Vectorized Frustum Culling (AVX / SSE)',
        prompt: 'การเขียนโค้ด Frustum Culling ให้ทดสอบ AABB 10,000 ชิ้นได้ภายในเวลาไม่ถึง 0.1ms บน CPU ใช้ประโยชน์จากคำสั่งชุดคำสั่งใด?',
        options: [
          'SIMD Instructions (AVX-512 / AVX2 / SSE): โหลดข้อมูลพิกัดของ 8 AABBs เข้า Vector Registers และคำนวณ Dot Product 8 ตัวพร้อมกันใน 1 คำสั่ง CPU',
          'การใช้ฟังก์ชัน String Concatenation ในภาษา JavaScript',
          'การเขียนโปรแกรมด้วยภาษา Python Scripting',
          'การสุ่มตัวอย่างแบบ Random Guessing'
        ],
        correctAnswer: 0,
        hint: 'Single Instruction Multiple Data (SIMD) คำนวณข้อมูลหลายก้อนพร้อมกันในไซเคิลเดียว',
        explanation: 'ด้วยการจัดเรียงหน่วยความจำแบบ SoA และคำสั่ง AVX ซีพียูสามารถทดสอบ AABB 8 กล่องกับระนาบ Frustum ทั้ง 6 ระนาบได้พร้อมกันในเวลาเพียงไม่กี่นาโนวินาที',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'frustum-p-3',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ขั้นตอนการแยกสมการระนาบ Frustum จาก View-Projection Matrix',
        prompt: 'เรียงลำดับขั้นตอนของอัลกอริทึม Gribb-Hartmann ในการดึงระนาบ Frustum จากกล้อง:',
        options: [
          'คำนวณ View-Projection Matrix รวมของกล้อง (VP = P * V)',
          'บวก/ลบแถวของ Matrix เพื่อสร้างสมการระนาบทั้ง 6 (เช่น Row4 + Row1 สำหรับ Left Plane)',
          'Normalize เวกเตอร์ปกติของระนาบแต่ละตัว (หารด้วยความยาวของ Normal เวกเตอร์)',
          'นำระนาบที่ปรับแต่งแล้วไปทดสอบกับ Hierarchical BVH ของฉาก'
        ],
        correctAnswer: [
          'คำนวณ View-Projection Matrix รวมของกล้อง (VP = P * V)',
          'บวก/ลบแถวของ Matrix เพื่อสร้างสมการระนาบทั้ง 6 (เช่น Row4 + Row1 สำหรับ Left Plane)',
          'Normalize เวกเตอร์ปกติของระนาบแต่ละตัว (หารด้วยความยาวของ Normal เวกเตอร์)',
          'นำระนาบที่ปรับแต่งแล้วไปทดสอบกับ Hierarchical BVH ของฉาก'
        ],
        hint: 'หา Matrix รวม -> บวก/ลบแถวหา Plane -> ปรับ Normal ให้ยาว 1 -> นำไปทดสอบตัดทิ้ง',
        explanation: 'วิธีของ Gribb & Hartmann ดึงสมการระนาบ $Ax + By + Cz + D = 0$ ออกมาจากแถวของ View-Projection Matrix ได้โดยตรงอย่างแม่นยำ',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'frustum-p-4',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'GPU-Driven Frustum Culling ผ่าน Compute Shaders',
        prompt: 'ในเอนจินระดับ AAA ยุคใหม่ เหตุใดจึงนิยมย้ายขั้นตอน Frustum Culling ไปทำบน GPU Compute Shader แทนที่จะทำบน CPU?',
        options: [
          'GPU มี Core ขนานกันนับพันแกน สามารถทดสอบวัตถุ 500,000 ชิ้นได้ในเสี้ยววินาที และเขียนผลลัพธ์ลง Draw Indirect Buffer ได้โดยตรงโดยไม่ต้องส่งข้อมูลกลับมาหา CPU',
          'เพราะ CPU รุ่นใหม่ไม่มีฟังก์ชันคำนวณทางคณิตศาสตร์',
          'เพื่อป้องกันไม่ให้แฮกเกอร์มองเห็นโมเดลในฉาก',
          'เพราะ GPU กินไฟน้อยกว่าพัดลมระบายความร้อน'
        ],
        correctAnswer: 0,
        hint: 'GPU มีพลังประมวลผลงานแบบขนานสูงมากและขจัด CPU-to-GPU Bottleneck ได้สมบูรณ์',
        explanation: 'GPU-driven culling รันบน Compute Shader สามารถทดสอบวัตถุจำนวนมหาศาลได้อย่างรวดเร็วและสร้าง Draw Command ให้ตัวเองได้ทันที',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'frustum-p-5',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Bounding Box ของ Skinned Mesh (โมเดลกระดูก)',
        prompt: 'เมื่อตัวละครอนิเมชั่นแกว่งดาบยาว หรือกระโดดกางแขน บ่อยครั้งที่ตัวละครกะพริบหายไปจากขอบจอ เกิดจากสาเหตุใดและแก้อย่างไร?',
        options: [
          'AABB ของโมเดลถูกคำนวณจากท่าเริ่มต้น (Bind Pose) ซึ่งเล็กกว่าท่ายืดแขนจริง; ต้องขยายขอบเขต Bounding Box เผื่อระยะกระดูก หรืออัปเดต Skinned Bounds แบบไดนามิก',
          'กระดูกของตัวละครหักระหว่างการเรนเดอร์',
          'การ์ดจอลืมวาดส่วนแขนของตัวละคร',
          'ผู้เล่นเคลื่อนที่เร็วกว่าความเร็วแสง'
        ],
        correctAnswer: 0,
        hint: 'AABB ดั้งเดิมไม่ขยายตามการยืดกระดูกตอนเล่นอนิเมชั่น',
        explanation: 'หาก Bounding Box อิงตาม Rest Pose เมื่อตัวละครทำท่าเหยียดตัว ส่วนปลายจะล้นออกนอกกล่อง ทำให้ถูกตัดทิ้งทั้งโมเดลเมื่อกล่องหลุดขอบจอ ต้องขยาย Bounds Padding',
        engineContext: 'Unity',
      },
      {
        id: 'frustum-p-6',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'Hierarchical Frustum Culling ด้วย Octree / BVH',
        prompt: 'หากในฉากมีวัตถุ 100,000 ชิ้น การนำทุกชิ้นมาทดสอบกับระนาบ 6 ระนาบแบบตรงๆ (Brute-Force) จะกินเวลา CPU เกินไป โครงสร้างข้อมูลใดช่วยให้สามารถตัดวัตถุทั้งกิ่ง (กิ่งละ 1,000 ชิ้น) ออกได้ในการทดสอบเพียงครั้งเดียว?',
        options: [
          'BVH (Bounding Volume Hierarchy) หรือ Octree: หากกล่อง Node แม่หลุดออกนอก Frustum ลูกหลานทั้งหมดในกิ่งนั้นจะถูกตัดทิ้งทันทีโดยไม่ต้องตรวจทีละตัว',
          'Linked List ของทุกออบเจกต์',
          'การเก็บข้อมูลในไฟล์ CSV บนเดสก์ท็อป',
          'การสร้างอาเรย์เรียงตามตัวอักษรของชื่อโมเดล'
        ],
        correctAnswer: 0,
        hint: 'ถ้ากล่องใหญ่ระดับพ่อแม่อยู่นอกจอ ของทั้งหมดข้างในกล่องก็อยู่นอกจอแน่นอน',
        explanation: 'Hierarchical Culling ข้ามการประมวลผลวัตถุ 90%+ ได้ตั้งแต่ Node บนๆ ของต้นไม้ ช่วยลดเวลาทดสอบจาก $O(N)$ เหลือ $O(\\log N)$',
        engineContext: 'General Engine',
      },
      {
        id: 'frustum-p-7',
        topicId: 'frustum-culling',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Shadow Caster Frustum Culling',
        prompt: 'เมื่อกล้องผู้เล่นมองไม่เห็นต้นไม้ต้นหนึ่ง แต่เงาของต้นไม้นั้นยังทอดเข้ามาในจอ เหตุใดระบบกราฟิกส์จึงยังต้องวาดต้นไม้ต้นนั้นใน Shadow Pass?',
        options: [
          'เพราะ Shadow Pass ทำการ Culling โดยอิงจาก Frustum ของ "แหล่งกำเนิดแสง" (Directional Light Frustum) ไม่ใช่ Frustum ของกล้องผู้เล่น',
          'เพราะเอนจินจำลองแสงผ่านดาวเทียม',
          'เพราะต้นไม้ต้นนั้นส่งเสียงร้องได้',
          'เพราะเอนจินกราฟิกส์ไม่รู้จักเงา'
        ],
        correctAnswer: 0,
        hint: 'แสงจากดวงอาทิตย์มองเห็นต้นไม้นั้น จึงต้องวาดเพื่อสร้าง Shadow Map',
        explanation: 'การเรนเดอร์เงา (Shadow Map) มีมุมมองจากทิศทางของแสง วัตถุนอกสายตาผู้เล่นแต่ทอดเงาเข้ามาจะต้องผ่าน Light Frustum Culling เพื่อวาดลง Shadow Buffer',
        engineContext: 'General Engine',
      },
    ],
  },

  // =========================================================================
  // 9. MULTI-THREADING & JOB SYSTEMS
  // =========================================================================
  'multi-threading': {
    topicId: 'multi-threading',
    beginner: [
      {
        id: 'thread-b-1',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'นิยามของ Data Race',
        prompt: 'Data Race เกิดขึ้นเมื่อเธรดสองตัวขึ้นไปเข้าถึงหน่วยความจำตำแหน่งเดียวกันพร้อมกัน โดยมีอย่างน้อยหนึ่งเธรดที่กำลังทำการ ___BLANK___ โดยไม่มีการซิงโครไนซ์:',
        codeSnippet: `// อันตรายร้ายแรงของ Multi-threading:
Thread A: counter++; // อ่านและ ___BLANK___
Thread B: counter++; // อ่านและ ___BLANK___ พร้อมกัน`,
        options: ['เขียนข้อมูล (Write)', 'ปิดเครื่องคอมพิวเตอร์', 'เล่นเสียงดนตรี', 'เรนเดอร์กราฟิกส์'],
        correctAnswer: 'เขียนข้อมูล (Write)',
        hint: 'หากทั้งสองตัวแค่อ่าน (Read) จะไม่มีปัญหา แต่ถ้ามีตัวหนึ่งเขียน (Write) ค่าจะเพี้ยนทันที',
        explanation: 'Data Race เกิดจากการแย่งกันเขียนข้อมูลลง RAM เดียวกันโดยไม่มีการป้องกัน ทำให้ผลลัพธ์ไม่แน่นอนและยากต่อการดีบั๊ก',
        engineContext: 'General Engine',
      },
      {
        id: 'thread-b-2',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'Thread Pool / Job System vs Spawning New OS Threads',
        prompt: 'ทำไม Game Engine จึงนิยมสร้าง Thread Pool (ตามจำนวน Core) ไว้ล่วงหน้า แทนที่จะสร้าง Thread ใหม่ด้วย `new Thread()` ทุกครั้งที่มีงาน?',
        options: [
          'เพราะการสร้าง OS Thread มี Overhead สูงมากในการจอง Stack และสลับ Context Switch; Thread Pool รีไซเคิลเธรดเดิมมารันงานย่อยได้ทันที',
          'เพราะ Windows อนุญาตให้มี Thread ได้สูงสุดแค่ 4 ตัวเท่านั้น',
          'เพราะ Thread ใหม่จะทำให้สีหน้าจอเปลี่ยนไป',
          'เพราะภาษา C++ ไม่รองรับการสร้างเธรด'
        ],
        correctAnswer: 0,
        hint: 'การสร้างเธรดใหม่กินเวลาเป็นมิลลิวินาทีและเปลืองหน่วยความจำ Stack',
        explanation: 'Job Systems ใช้ Worker Threads จำนวนคงที่ตาม Hardware Concurrency แล้วป้อนงานย่อย (Jobs) ลงคิว ทำให้แทบไม่มีค่าใช้จ่ายในการเปิดปิดเธรด',
        engineContext: 'General Engine',
      },
      {
        id: 'thread-b-3',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การบวกตัวเลขอิสระไร้ Lock ด้วย std::atomic',
        prompt: 'ในภาษา C++ หากต้องการเพิ่มค่าตัวนับข้ามหลายเธรดโดยไม่ต้องใช้ Mutex Lock ให้ใช้คลาสใด:',
        codeSnippet: `// ตัวแปรปลอดภัยไร้ Lock:
std::___BLANK___<int> globalCounter(0);

void worker() {
  globalCounter.fetch_add(1);
}`,
        options: ['atomic', 'vector', 'string', 'mutex'],
        correctAnswer: 'atomic',
        hint: 'Atomic Operation ทำงานระดับคำสั่งเครื่องจักรของ CPU ไม่ถูกแทรกแซง',
        explanation: '`std::atomic` ใช้คำสั่งฮาร์ดแวร์ระดับ CPU เช่น `LOCK XADD` ใน x86 ซึ่งทำงานได้อย่างรวดเร็วโดยไม่ต้องระงับเธรดเหมือน Mutex',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-b-4',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'สถานการณ์ Deadlock',
        prompt: 'Deadlock เกิดขึ้นเมื่อ Thread A ถือกุญแจ 1 และรอขอกุญแจ 2 ในขณะที่ Thread B ถือกุญแจ 2 และรอขอกุญแจ ___BLANK___ จนทั้งสองตัวค้างตลอดกาล:',
        codeSnippet: `Thread A: Locked(Key1) -> Waiting for Key2
Thread B: Locked(Key2) -> Waiting for ___BLANK___
// ผลลัพธ์: โปรแกรมค้างสนิท!`,
        options: ['Key1 (ที่ Thread A ถืออยู่)', 'Key3', 'ไม่มีกุญแจ', 'รหัสผ่านอินเทอร์เน็ต'],
        correctAnswer: 'Key1 (ที่ Thread A ถืออยู่)',
        hint: 'การรอเป็นวงกลม (Circular Wait) ต่างฝ่ายต่างรอกุญแจของอีกฝ่าย',
        explanation: 'Deadlock เกิดจาก Circular Dependency ของการถือ Lock ทางแก้คือบังคับลำดับการ Lock ให้เป็นไปในทิศทางเดียวกันเสมอ',
        engineContext: 'General Engine',
      },
      {
        id: 'thread-b-5',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'บทบาทของ Main Thread ใน Game Engine',
        prompt: 'งานประเภทใดที่มักถูกจำกัดให้ทำงานได้บน Main Thread เท่านั้นในเอนจินอย่าง Unity หรือ Unreal?',
        options: [
          'การจัดการ Window Events, OS Input, และการส่งคำสั่ง Graphics Context ขั้นสุดท้าย',
          'การคำนวณเวกเตอร์บวกเลขทางคณิตศาสตร์',
          'การอ่านไฟล์ข้อความขนาดเล็ก',
          'การสุ่มตัวเลข'
        ],
        correctAnswer: 0,
        hint: 'ระบบปฏิบัติการผูกการสร้างหน้าต่างและการรับ Input เข้ากับเธรดหลักของกระบวนการ',
        explanation: 'OS APIs ส่วนใหญ่ (เช่น Win32 Message Loop, Cocoa) บังคับให้จัดการ Window และ Graphics Presentation บน Main Thread เท่านั้น',
        engineContext: 'General Engine',
      },
      {
        id: 'thread-b-6',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การจัดตารางงาน (Schedule) ใน Unity C# Job System',
        prompt: 'คำสั่งใดที่ใช้ส่ง Job ให้เธรดว่างทำงานใน Unity Job System:',
        codeSnippet: `MyMovementJob job = new MyMovementJob();
JobHandle handle = job.___BLANK___(entitiesCount, 64);
// รอผลลัพธ์ตอนจำเป็น
handle.Complete();`,
        options: ['ScheduleParallel', 'ExecuteNow', 'RunImmediate', 'Sleep'],
        correctAnswer: 'ScheduleParallel',
        hint: 'ส่งงานให้ทำงานขนานกันหลายเธรด',
        explanation: '`job.ScheduleParallel(count, batchSize)` กระจายข้อมูลให้อาร์เรย์ของ Worker Threads ทำงานร่วมกันแบบแบ่งก้อน',
        engineContext: 'Unity',
      },
      {
        id: 'thread-b-7',
        topicId: 'multi-threading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ข้อห้ามสำคัญใน Unity Burst Job System',
        prompt: 'ใน Unity Job System ที่คอมไพล์ด้วย Burst Compiler สิ่งใดต่อไปนี้ "ห้าม" นำมาใช้ใน Job เด็ดขาด?',
        options: [
          'Managed Objects บน Heap เช่น `class`, `string`, `GameObject`, หรือการเรียก `new`',
          'ตัวเลขชนิด `float` และ `int`',
          'Struct ที่มีเฉพาะข้อมูล Blittable Data',
          'โครงสร้าง `NativeArray<T>`'
        ],
        correctAnswer: 0,
        hint: 'Burst ทำงานกับหน่วยความจำ Unmanaged เท่านั้น ห้ามยุ่งกับ Managed Heap หรือ GC',
        explanation: 'Burst Compiler แปลงโค้ดเป็น Highly Optimized Native Code โดยตรง จึงห้ามอ้างอิง Managed Objects หรือ Garbage Collector เด็ดขาด',
        engineContext: 'Unity',
      },
    ],
    practical: [
      {
        id: 'thread-p-1',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการ Lock Contention เมื่อเพิ่มจำนวนเธรดแต่เกมช้าลง',
        prompt: 'โปรแกรมเมอร์ปรับระบบฟิสิกส์ให้รันขนานกันบน 16 Threads แต่พบว่าเฟรมเรตแย่กว่ารันบน 2 Threads เสียอีก Profiler เผยว่าเธรดส่วนใหญ่ใช้เวลา 80% ติดอยู่กับการรอ `std::mutex::lock()` สาเหตุและแนวทางแก้คืออะไร?',
        options: [
          'Lock Contention (การแย่งกุญแจ): แก้โดยออกแบบระบบให้เป็น Data Parallelism แบ่งข้อมูลให้แต่ละเธรดประมวลผลช่วงของตนเองอย่างอิสระโดยไม่ต้องใช้ Lock ร่วมกัน',
          'ปิดการทำงานของแกนซีพียู 14 ตัวให้เหลือ 2 ตัวตามเดิม',
          'เปลี่ยนมาใช้ Hard Disk ความเร็วสูงขึ้น',
          'เขียนโปรแกรมซ้ำ 16 รอบ'
        ],
        correctAnswer: 0,
        hint: 'ถ้าทุกคนต้องแย่งกุญแจห้องดอกเดียวกัน การเพิ่มคนจะยิ่งทำให้คนยืนต่อคิวนานขึ้น',
        explanation: 'Lock Contention ทำลายประโยชน์ของการประมวลผลแบบขนาน ควรออกแบบให้แต่ละเธรดทำงานกับข้อมูลอิสระ (Embarrassingly Parallel) หรือใช้ Lock-Free Data Structures',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-p-2',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'สถาปัตยกรรม Work-Stealing ใน Task Scheduler',
        prompt: 'Work-Stealing Task Scheduler (เช่น Intel TBB, Unreal TaskGraph, Unity Job System) ทำงานอย่างไรเมื่อ Worker Thread ตัวหนึ่งทำงานในคิวของตนเองเสร็จก่อนเพื่อน?',
        options: [
          'เธรดที่ว่างจะไป "ขโมย" งานย่อยจากด้านท้าย (Back/Bottom) ของ Deque คิวงานของเธรดเพื่อนที่กำลังยุ่งอยู่มาทำ เพื่อรักษาสมดุลภาระงาน (Load Balancing)',
          'เธรดที่ว่างจะสั่งระงับการทำงานของเธรดอื่นทั้งหมด',
          'เธรดจะยุติการทำงานและปิดโปรแกรม',
          'เธรดจะรอจนกว่าจะขึ้นเฟรมใหม่'
        ],
        correctAnswer: 0,
        hint: 'ไปดึงงานจากคิวของเพื่อนที่เหลืองานเยอะ เพื่อไม่ให้มีแกนซีพียูว่างงาน',
        explanation: 'Work Stealing ช่วยให้ทุก Core ทำงานเต็มประสิทธิภาพตลอดเวลา โดยใช้ Lock-free Deque ให้เจ้าของดึงงานจากด้านหนึ่ง และผู้ขโมยดึงงานจากอีกด้านหนึ่ง',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-p-3',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Directed Acyclic Graph (DAG) Job Execution',
        prompt: 'เรียงลำดับการประมวลผลงานที่มีความสัมพันธ์ผูกมัด (Dependencies) ใน Game Engine:',
        options: [
          'สร้างโครงสร้างต้นไม้ความสัมพันธ์ (DAG): กำหนดว่า Job B ต้องรอ Job A เสร็จก่อน',
          'จัดตารางงาน (Schedule): ปล่อย Job ที่ไม่มีตัวขัดขวาง (Zero In-degree) เข้าคิว Worker Threads',
          'ประมวลผลแบบขนาน: Worker Threads รันงานและลดตัวนับ Dependency Counter เมื่อจบ',
          'กระตุ้นงานถัดไป: เมื่องานลูกมี Dependency ครบศูนย์ ให้ผลักเข้าสู่คิวพร้อมรันทันที'
        ],
        correctAnswer: [
          'สร้างโครงสร้างต้นไม้ความสัมพันธ์ (DAG): กำหนดว่า Job B ต้องรอ Job A เสร็จก่อน',
          'จัดตารางงาน (Schedule): ปล่อย Job ที่ไม่มีตัวขัดขวาง (Zero In-degree) เข้าคิว Worker Threads',
          'ประมวลผลแบบขนาน: Worker Threads รันงานและลดตัวนับ Dependency Counter เมื่อจบ',
          'กระตุ้นงานถัดไป: เมื่องานลูกมี Dependency ครบศูนย์ ให้ผลักเข้าสู่คิวพร้อมรันทันที'
        ],
        hint: 'สร้างโครงสร้างกราฟ -> ปล่อยงานที่พร้อม -> รันขนานกัน -> ปลดล็อคงานที่รอ',
        explanation: 'DAG Scheduler รับประกันว่าจะไม่มีงานใดรันก่อนที่ข้อมูลตั้งต้นจะพร้อม เช่น รอ Animation Job คำนวณกระดูกเสร็จก่อนรัน Render Mesh Job',
        engineContext: 'General Engine',
      },
      {
        id: 'thread-p-4',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Single-Producer Single-Consumer (SPSC) Lock-Free Ring Buffer',
        prompt: 'ในการส่งคำสั่ง Render จาก Main Thread ไปยัง Render Thread โครงสร้างข้อมูลคิวแบบใดมีประสิทธิภาพสูงสุดและไม่มี Lock Contention?',
        options: [
          'Lock-Free SPSC Ring Buffer ที่ใช้ Atomic Read/Write Pointers พร้อม Memory Ordering (Acquire-Release)',
          'Standard `std::queue` ที่มี `std::mutex` ล็อคทุกครั้งที่ Push และ Pop',
          'การเขียนคำสั่งลงไฟล์ข้อความบนฮาร์ดดิสก์',
          'การส่งคำสั่งผ่านเครือข่าย Localhost UDP Socket'
        ],
        correctAnswer: 0,
        hint: 'คิววงกลมที่มีคนเขียน 1 คน และคนอ่าน 1 คน สามารถทำแบบไร้ Lock ได้สมบูรณ์',
        explanation: 'SPSC Ring Buffer ต้องการเพียงการอัปเดต Read/Write Indices ด้วย Memory Ordering ที่ถูกต้อง จึงไม่มีการบล็อกเธรดและส่งผ่านคำสั่งได้นับล้านคำสั่งต่อวินาที',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-p-5',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Memory Ordering: Acquire-Release Semantics ใน C++11',
        prompt: 'ความหมายของ `std::memory_order_release` และ `std::memory_order_acquire` ในการเขียนโปรแกรมแบบ Lock-Free คืออะไร?',
        options: [
          'Release รับประกันว่าการเขียนข้อมูลทั้งหมดก่อนหน้านี้จะปรากฏให้เธรดอื่นเห็นก่อนที่ Flag จะถูกตั้งค่า และ Acquire รับประกันว่าจะไม่อ่านข้อมูลล่วงหน้าก่อนที่ Flag จะถูกตรวจพบ',
          'สั่งให้คอมพิวเตอร์ล้างหน่วยความจำ RAM ทั้งหมด',
          'สั่งปลดปล่อยทรัพยากรการ์ดจอคืนสู่ระบบปฏิบัติการ',
          'เป็นคำสั่งสำหรับเพิ่มความเร็วสัญญาณนาฬิกาของซีพียู'
        ],
        correctAnswer: 0,
        hint: 'ป้องกันไม่ให้ CPU หรือ Compiler สลับลำดับคำสั่ง (Instruction Reordering) ข้ามขอบเขตหน่วยความจำ',
        explanation: 'Acquire-Release สร้าง Synchronizes-with Relationship ข้ามเธรด ป้องกันปัญหา CPU Out-of-order execution อ่านข้อมูลก่อนที่ผู้ผลิตจะเขียนเสร็จ',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-p-6',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการ Crash สุ่มใน Garbage Collection Thread',
        prompt: 'ใน C++ Engine ที่เขียนเธรดโหลดฉากขึ้นมาใหม่ พบว่าบางครั้งเกม Crash สุ่มด้วยรหัส `Access Violation` ตอนที่เธรดหลักกำลังทำลาย World Actor สาเหตุเกิดจากอะไร?',
        options: [
          'เธรดรองยังคงถือ Raw Pointer ของ Actor ที่ถูกเธรดหลักสั่ง Delete ไปแล้ว (Dangling Pointer / Use-After-Free) ขาดระบบ Shared Ownership หรือ Lifecycle Synchronization',
          'พัดลมการ์ดจอหมุนเร็วเกินไป',
          'ภาษา C++ ไม่รองรับการทำงานแบบขนาน',
          'สายแลนหลุดระหว่างเล่น'
        ],
        correctAnswer: 0,
        hint: 'เธรดหลักลบของทิ้งไปแล้ว แต่เธรดรองยังพยายามเข้าถึงผ่านตัวชี้เดิม',
        explanation: 'การแชร์ข้อมูลดิบข้ามเธรดโดยไม่มี Synchronization ของวงจรชีวิตนำไปสู่ Use-After-Free ควรใช้ Handle System หรือส่งข้อมูลแบบ Value Copy ข้ามเธรดแทน',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'thread-p-7',
        topicId: 'multi-threading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Thread Affinity และ Cache Thrashing',
        prompt: 'เหตุใด Game Engine จึงมักล็อกเธรดสำคัญ (เช่น Audio หรือ Render Thread) ให้อยู่กับ CPU Core ที่แน่นอน (Set Thread Affinity)?',
        options: [
          'เพื่อป้องกันไม่ให้ OS Scheduler สลับเธรดข้าม Core ไปมา ซึ่งจะทำให้ L1/L2 Cache ถูกล้างทิ้ง (Cache Warmth Loss) และเกิดสวิตชิ่งโอเวอร์เฮด',
          'เพื่อให้แน่ใจว่าซีพียูจะเปิดไฟ RGB ครบทุกสี',
          'เพื่อป้องกันไม่ให้ผู้ใช้เปิดโปรแกรมอื่น',
          'เพราะชิปการ์ดจอไม่สามารถสื่อสารกับซีพียูหลายตัวได้'
        ],
        correctAnswer: 0,
        hint: 'ให้เธรดอยู่ประจำห้องเดิม ข้อมูลที่อยู่ในแคชของ Core นั้นจะได้ถูกใช้ซ้ำต่อเนื่อง',
        explanation: 'Thread Affinity รักษาสถานะแคชใน L1/L2 ไม่ให้สูญหายจากการย้าย Core บ่อยๆ และช่วยรักษา Latency ของเธรดที่อ่อนไหวต่อเวลา เช่น Audio DSP ให้อยู่ในกรอบเสมอ',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 10. SHADER OVERDRAW
  // =========================================================================
  'shader-overdraw': {
    topicId: 'shader-overdraw',
    beginner: [
      {
        id: 'overdraw-b-1',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Overdraw คืออะไร',
        prompt: 'Overdraw หมายถึงปรากฏการณ์ที่พิกเซลเดียวกันบนหน้าจอถูกคำนวณและระบายสี ___BLANK___ ใน 1 เฟรมการเรนเดอร์:',
        codeSnippet: `// พิกเซลตำแหน่ง (x: 400, y: 300):
Layer 1 (ท้องฟ้า) -> วาด
Layer 2 (ภูเขา)   -> ทับ
Layer 3 (กำแพง)   -> ทับ
Layer 4 (ต้นไม้)  -> ทับซ้ำ เกิด ___BLANK___!`,
        options: ['หลายครั้งซ้ำซ้อน (Multiple times)', 'เพียงครั้งเดียว', 'ไม่ถูกวาดเลย', 'วาดด้วยสีขาวเสมอ'],
        correctAnswer: 'หลายครั้งซ้ำซ้อน (Multiple times)',
        hint: 'พิกเซลเดิมถูกวาดทับแล้วทับอีกจนเสียพลังประมวลผลฟรี',
        explanation: 'Overdraw คือการที่ Fragment Shader ต้องคำนวณสีของพิกเซลเดิมซ้ำๆ หลายชั้น ซึ่งหากพิกเซลนั้นถูกวัตถุด้านหน้าบังทับ การคำนวณชั้นก่อนหน้าจะสูญเปล่าทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-2',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ลำดับการเรนเดอร์วัตถุทึบแสงที่ช่วยลด Overdraw',
        prompt: 'สำหรับการเรนเดอร์วัตถุทึบแสง (Opaque Objects) ควรเรียงลำดับการวาดอย่างไรเพื่อป้องกัน Overdraw ด้วย Early-Z?',
        options: [
          'วาดจากหน้าไปหลัง (Front-to-Back: ใกล้กล้องไปไกลกล้อง)',
          'วาดจากหลังมาหน้า (Back-to-Front: ไกลกล้องมาใกล้กล้อง)',
          'วาดแบบสุ่มลำดับตามใจชอบ',
          'วาดเฉพาะวัตถุที่มีสีสว่างก่อน'
        ],
        correctAnswer: 0,
        hint: 'วาดสิ่งที่อยู่ใกล้กล้องก่อน เพื่อให้ Z-Buffer บันทึกความลึกไว้ขวางสิ่งที่อยู่ไกลกว่า',
        explanation: 'การวาด Front-to-Back ทำให้พิกเซลของวัตถุใกล้กล้องเขียน Depth ลง Z-Buffer ก่อน เมื่อวัตถุด้านหลังถูกวาด มันจะถูก Early-Z Test ปัดทิ้งทันทีก่อนรัน Shader',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-3',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Early-Z Testing คืออะไร',
        prompt: 'Early-Z คือความสามารถของ GPU ในการตรวจสอบ ___BLANK___ ก่อนที่จะเริ่มรัน Pixel/Fragment Shader:',
        codeSnippet: `// GPU Hardware Pipeline:
Rasterization -> ___BLANK___ (เช็คความลึก) -> Pixel Shader`,
        options: ['Depth Buffer (ความลึก Z)', 'Texture Resolution', 'Frame Rate', 'Audio Volume'],
        correctAnswer: 'Depth Buffer (ความลึก Z)',
        hint: 'ตรวจสอบความลึก (Z) เพื่อดูว่ามีวัตถุอื่นบังอยู่ข้างหน้าแล้วหรือไม่',
        explanation: 'Early-Z ทดสอบค่าความลึกกับ Depth Buffer ก่อน หากพบว่าพิกเซลนั้นอยู่หลังวัตถุอื่น มันจะข้ามการประมวลผล Pixel Shader ทั้งหมดทันที',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-4',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'คำสั่งที่อาจทำลายฟีเจอร์ Early-Z ใน Pixel Shader',
        prompt: 'คำสั่งใดใน Shader ที่อาจทำให้ฮาร์ดแวร์ GPU ต้องปิดการทำงานของ Early-Z:',
        codeSnippet: `float4 frag(v2f i) : SV_Target {
  float alpha = tex2D(_MainTex, i.uv).a;
  if (alpha < 0.5) {
    ___BLANK___; // คำสั่งทิ้งพิกเซลที่อาจปิด Early-Z
  }
  return float4(1, 1, 1, 1);
}`,
        options: ['discard หรือ clip(-1)', 'return float4(0,0,0,0)', 'break', 'continue'],
        correctAnswer: 'discard หรือ clip(-1)',
        hint: 'คำสั่ง discard ปฏิเสธการเขียนพิกเซล ทำให้ GPU ไม่สามารถรู้ล่วงหน้าได้ว่าจะเขียน Depth หรือไม่',
        explanation: 'คำสั่ง `discard` หรือการแก้ไข `SV_Depth` ทำให้ GPU ไม่สามารถเดาได้ว่าพิกเซลจะถูกวาดหรือไม่ จึงต้องปิด Early-Z และรัน Shader เต็มรูปแบบ',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-5',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'สาเหตุหลักที่ระบบ Particle มักทำให้เกิด Overdraw มหาศาล',
        prompt: 'ทำไมระบบอนุภาค (Particle Systems เช่น ควัน, เปลวไฟ, ฝุ่น) จึงมักเป็นตัวการสร้าง Overdraw รุนแรงที่สุดในเกม?',
        options: [
          'เพราะอนุภาคมีลักษณะเป็นสี่เหลี่ยมใส (Alpha Blended Quads) ซ้อนทับกันหลายสิบหลายร้อยชั้นในแนวสายตาเดียวกัน',
          'เพราะอนุภาคมีน้ำหนักมากเกินไปในระบบฟิสิกส์',
          'เพราะอนุภาคปล่อยเสียงดังเกินไป',
          'เพราะอนุภาคทำงานบนซีพียูเท่านั้น'
        ],
        correctAnswer: 0,
        hint: 'แผ่นสี่เหลี่ยมโปร่งแสงหลายร้อยแผ่นวางซ้อนทับกันเต็มหน้าจอ',
        explanation: 'Alpha Blending บังคับให้ต้องระบายสีและผสมสีทุกชั้นโดยไม่สามารถใช้ Early-Z ตัดทิ้งได้ เมื่อกลุ่มควันหนาซ้อนกันจึงเกิด Overdraw สูงมาก',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-6',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'โหมดตรวจจับ Overdraw ใน Game Engine Editor',
        prompt: 'ในเอนจินอย่าง Unity หรือ Unreal โหมดมุมมองที่ใช้ดู Overdraw จะแสดงบริเวณที่มีการวาดทับหนาแน่นด้วยสี ___BLANK___:',
        codeSnippet: `// Overdraw Visualization Mode:
// สีน้ำเงิน = วาด 1-2 ครั้ง (ปลอดภัย)
// สีแดงสด/ขาว = วาดทับเกิน 10+ ครั้ง (___BLANK___)`,
        options: ['สีแดงหรือสีขาวสว่างจ้า (อันตราย / วิกฤต)', 'สีดำสนิท', 'สีเขียวมรกต', 'สีเหลืองทอง'],
        correctAnswer: 'สีแดงหรือสีขาวสว่างจ้า (อันตราย / วิกฤต)',
        hint: 'ยิ่งวาดทับมาก สียิ่งร้อนขึ้นจนเป็นสีแดงและขาวสว่าง',
        explanation: 'มุมมอง Overdraw Viewmode คำนวณแบบ Additive ยิ่งพิกเซลถูกวาดทับมาก สีจะยิ่งเปลี่ยนจากน้ำเงิน เป็นเขียว ส้ม แดง และขาวจ้า',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-b-7',
        topicId: 'shader-overdraw',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'การลดพื้นที่โปร่งแสงของ Particle Mesh (Cutout Tight Geometry)',
        prompt: 'เทคนิคใดช่วยลด Overdraw ของ Particle รูปวงกลมได้ดีกว่าการใช้แผ่นสี่เหลี่ยม Quad ปกติ?',
        options: [
          'ใช้ Mesh รูปทรงแปดเหลี่ยม (Octagonal Mesh) ที่ตัดขอบโปร่งแสงว่างเปล่ารอบนอกทิ้งให้แนบชิดกับรูปภาพจริง',
          'ขยายแผ่นสี่เหลี่ยมให้ใหญ่ขึ้นเป็นสองเท่า',
          'ปิดการเรนเดอร์อนุภาคทั้งหมดในเกม',
          'ลดความสว่างของหน้าจอลง'
        ],
        correctAnswer: 0,
        hint: 'ตัดขอบโปร่งใสที่ไม่ได้ใช้งานทิ้ง เพื่อให้พิกเซลว่างๆ ไม่ต้องถูกประมวลผล',
        explanation: 'Tight Polygon Cutout (เช่น รูป 8 เหลี่ยมตัดขอบ) ช่วยลดพื้นที่พิกเซลโปร่งแสงว่างเปล่าที่ต้องเสียแรงคำนวณ Alpha Blending ได้ 30-50%',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'overdraw-p-1',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการเฟรมเรตร่วงตอนยืนใกล้เอฟเฟกต์ควัน (Fillrate Bottleneck)',
        prompt: 'เมื่อผู้เล่นยืนอยู่ห่างจากระเบิดควัน เฟรมเรตปกติ 60 FPS แต่เมื่อเดินเข้าไป "แนบชิด" จนกลุ่มควันเต็มหน้าจอ เฟรมเรตกลับร่วงดิ่งเหลือ 18 FPS และ GPU Core ร้อนจัด เกิดจากสาเหตุใด?',
        options: [
          'Pixel Fillrate Bottleneck จาก Overdraw: เมื่ออนุภาคขนาดใหญ่ครอบคลุมทั้งหน้าจอ จำนวนพิกเซลที่ต้องผสมสีมีมหาศาลเกินแบนด์วิดท์ VRAM และ ROPs',
          'ซีพียูประมวลผลพิกัดควันไม่ทัน',
          'ตัวละครขาดอากาศหายใจ',
          'ไฟล์ภาพของควันถูกบันทึกผิดโฟลเดอร์'
        ],
        correctAnswer: 0,
        hint: 'เมื่อควันครอบคลุมเต็มจอ ทุกพิกเซลบนจอต้องถูกคำนวณสีซ้ำหลายสิบชั้น (Screen-space Fillrate Exhaustion)',
        explanation: 'Screen-aligned particles ขนาดใหญ่ทำให้เกิด Fillrate Bottleneck เพราะจำนวน Fragment ที่ต้อง Shader แตะระดับสิบๆ ล้านพิกเซลต่อเฟรม แก้ได้ด้วย Soft Particles และ Half-Resolution Rendering',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-p-2',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Z-Prepass (Depth Pre-pass) ใน Forward Rendering',
        prompt: 'เทคนิค Z-Prepass (Depth Pre-pass) ทำงานอย่างไรเพื่อกำจัด Overdraw ในเกมที่ใช้ Forward Rendering และมี Shader ซับซ้อน?',
        options: [
          'วาดฉากทั้งหมดด้วย Shader ที่เบาที่สุด (บันทึกเฉพาะ Depth เท่านั้น) ในรอบแรก จากนั้นในรอบที่สองค่อยรัน Shading คำนวณแสงเต็มรูปแบบ ซึ่ง Early-Z จะทำงานได้ 100% โดยไม่มี Overdraw',
          'ลบค่า Depth Buffer ทิ้งก่อนเริ่มเฟรมใหม่',
          'บันทึกภาพหน้าจอลงไฟล์ก่อนแสดงผล',
          'ปิดการทำงานของแสงเงาทั้งหมดในฉาก'
        ],
        correctAnswer: 0,
        hint: 'วาดเฉพาะความลึกแบบเร็วๆ ก่อน 1 รอบ รอบสองจะไม่มีการคำนวณแสงซ้ำซ้อนแม้แต่พิกเซลเดียว',
        explanation: 'Z-Prepass ยอมเสีย Draw Calls สองเท่าเพื่อแลกกับการคำนวณ Complex Shading เพียงครั้งเดียวต่อพิกเซลที่มองเห็นจริง เหมาะอย่างยิ่งกับฉากที่มีแสงเงาหนักหน่วง',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-p-3',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Deferred Shading Pipeline ในการกำจัด Overdraw',
        prompt: 'เรียงลำดับขั้นตอนของสถาปัตยกรรม Deferred Rendering ที่ช่วยให้การคำนวณแสงไม่ขึ้นกับ Overdraw:',
        options: [
          'Geometry Pass: เรนเดอร์รูปทรงและเขียนคุณสมบัติพื้นผิว (Albedo, Normal, Roughness) ลงใน G-Buffer',
          'Depth Test Rejection: พิกเซลที่ถูกบังจะถูกเขียนทับใน G-Buffer โดยยังไม่มีการคำนวณแสงใดๆ',
          'Lighting Pass: คำนวณแสงเฉพาะพิกเซลที่มองเห็นได้ใน G-Buffer เพียงครั้งเดียวต่อพิกเซลหน้าจอ',
          'Post-Processing & UI: ผสมผสานเอฟเฟกต์หลังประมวลผลและวาดอินเตอร์เฟซทับ'
        ],
        correctAnswer: [
          'Geometry Pass: เรนเดอร์รูปทรงและเขียนคุณสมบัติพื้นผิว (Albedo, Normal, Roughness) ลงใน G-Buffer',
          'Depth Test Rejection: พิกเซลที่ถูกบังจะถูกเขียนทับใน G-Buffer โดยยังไม่มีการคำนวณแสงใดๆ',
          'Lighting Pass: คำนวณแสงเฉพาะพิกเซลที่มองเห็นได้ใน G-Buffer เพียงครั้งเดียวต่อพิกเซลหน้าจอ',
          'Post-Processing & UI: ผสมผสานเอฟเฟกต์หลังประมวลผลและวาดอินเตอร์เฟซทับ'
        ],
        hint: 'เขียนลง G-Buffer -> ทับข้อมูลที่ไม่เห็น -> คำนวณแสงเฉพาะพิกเซลบนจอ -> ปิดท้ายด้วย UI',
        explanation: 'Deferred Shading แยกเรขาคณิตออกจากแสง ทำให้ค่าใช้จ่ายของแสงขึ้นกับจำนวนพิกเซลบนจอ ($O(\\text{Screen Width} \\times \\text{Height})$) แทนที่จะขึ้นกับจำนวนวัตถุที่ซ้อนทับกัน',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-p-4',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Half-Resolution Transparent Rendering สำหรับ Particles',
        prompt: 'เทคนิค Half-Resolution (หรือ Low-Resolution) Particle Rendering ช่วยบรรเทาคอขวด Overdraw ได้อย่างไร?',
        options: [
          'เรนเดอร์อนุภาคกลุ่มควันและหมอกลงใน Render Target ที่มีความละเอียด 1/2 หรือ 1/4 ของจอ จากนั้นค่อยนำมา Upsample ผสมกับฉากหลักด้วย Depth-Aware Bilateral Filter',
          'ลดขนาดตัวละครลงครึ่งหนึ่งตอนเกิดระเบิด',
          'ปิดหน้าจอครึ่งล่างระหว่างการต่อสู้',
          'ลดจำนวนเสียงระเบิดลง 50%'
        ],
        correctAnswer: 0,
        hint: 'คำนวณพิกเซลควันบนความละเอียดต่ำกว่าหน้าจอหลัก 4 เท่าเพื่อประหยัด Fillrate',
        explanation: 'เนื่องจากควันและหมอกมีความฟุ้งกระจายตามธรรมชาติ การเรนเดอร์ที่ครึ่งความละเอียดช่วยลดจำนวน Fragment ลง 75% โดยที่ตาของผู้เล่นแทบมองไม่เห็นความแตกต่าง',
        engineContext: 'General Engine',
      },
      {
        id: 'overdraw-p-5',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Hi-Z (Hierarchical Z) Culling บนฮาร์ดแวร์ GPU',
        prompt: 'ฟีเจอร์ Hi-Z (Hierarchical Z) ภายในฮาร์ดแวร์ GPU สมัยใหม่ทำงานอย่างไรเพื่อเร่งความเร็วการตัดทิ้ง?',
        options: [
          'สร้าง Mipmap Pyramid ของ Depth Buffer ทำให้การ์ดจอสามารถทดสอบและคัดทิ้ง Tile ขนาด 8x8 หรือ 16x16 พิกเซลพร้อมกันได้ในระดับฮาร์ดแวร์ก่อนเริ่ม Rasterize',
          'ใช้ปัญญาประดิษฐ์คาดเดาความสว่างของหลอดไฟ',
          'สลับการทำงานระหว่างการ์ดจอออนบอร์ดกับการ์ดจอแยก',
          'บังคับให้ภาพทั้งหมดกลายเป็นขาวดำ'
        ],
        correctAnswer: 0,
        hint: 'Mipmap ของความลึกช่วยให้ตัดพิกเซลทิ้งได้ทีละกลุ่มใหญ่ (Tile Culling)',
        explanation: 'Hi-Z ตรวจสอบกล่องความลึกระดับ Tile (เช่น 8x8 pixels) หากความลึกต่ำสุดของ Tile ใหม่ยังอยู่ลึกกว่า Tile เดิม GPU จะทิ้งทั้ง 64 พิกเซลได้ในครั้งเดียว',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'overdraw-p-6',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ Overdraw ในระบบ UI (Canvas Overdraw)',
        prompt: 'ในหน้าเมนูเกม 2D / UI Profiler พบว่า GPU ใช้เวลาเรนเดอร์สูงผิดปกติ ตรวจสอบพบว่ามี Image component โปร่งแสงขนาดเต็มจอที่มองไม่เห็น (Alpha = 0) ซ้อนกันอยู่ 8 ชั้น แนวทางแก้ไขที่ถูกต้องคืออะไร?',
        options: [
          'ปิดการทำงานของ Image component หรือปิดตัวเลือก "Raycast Target" และซ่อน GameObject ด้วย `SetActive(false)` เมื่อไม่ได้ใช้งาน',
          'เปลี่ยนสีของ Image ทั้ง 8 ชิ้นให้เป็นสีดำ',
          'เพิ่มขนาดหน้าจอให้ใหญ่ขึ้น',
          'ปรับความเร็วของเมาส์ให้เร็วขึ้น'
        ],
        correctAnswer: 0,
        hint: 'รูปภาพที่ Alpha = 0 ยังคงส่งคำสั่งเรนเดอร์และกิน Fillrate ทับซ้อนเต็มจอหากไม่ปิดทิ้ง',
        explanation: 'แม้ภาพจะโปร่งใส 100% แต่หากไม่ได้ปิด Image/GameObject การ์ดจอยังคงต้องรัน Shader และ Blending เต็มจอทุกเฟรม เป็นสาเหตุยอดฮิตที่ทำให้ UI กินไฟบนมือถือ',
        engineContext: 'Unity',
      },
      {
        id: 'overdraw-p-7',
        topicId: 'shader-overdraw',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Alpha-to-Coverage (A2C) กับ MSAA ในการเรนเดอร์ใบไม้',
        prompt: 'การใช้ Alpha-to-Coverage สำหรับเรนเดอร์ใบไม้ (Foliage) ร่วมกับ MSAA เหนือกว่าการใช้ Alpha Blending ปกติอย่างไร?',
        options: [
          'เขียน Depth ลง Z-Buffer ได้เหมือนวัตถุทึบแสงและใช้ Early-Z ได้ โดยสร้างขอบนุ่มนวลผ่าน MSAA Subsample Coverage Mask โดยไม่ต้องเรียงลำดับการวาดและไม่มี Overdraw',
          'ทำให้ใบไม้ปลิวตามแรงลมได้โดยไม่ต้องเขียนโค้ด',
          'ประหยัดพลังงานแบตเตอรี่ลง 99%',
          'เปลี่ยนใบไม้ให้กลายเป็นหิน'
        ],
        correctAnswer: 0,
        hint: 'สามารถเขียนค่าความลึก Z ลงบัฟเฟอร์ได้ ทำให้คัดทิ้งได้เหมือนวัตถุทึบแสง',
        explanation: 'Alpha-to-Coverage แปลงค่า Alpha เป็น Subsample Coverage Mask ทำให้เรนเดอร์เป็นวัตถุทึบแสงที่เขียน Z-Buffer ได้ ตัดปัญหาการเรียงลำดับและ Overdraw ของใบไม้นับล้านใบ',
        engineContext: 'General Engine',
      },
    ],
  },
};
