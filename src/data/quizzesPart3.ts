import type { TopicQuizData } from '../types/quiz';

export const QUIZZES_PART_3: Record<string, TopicQuizData> = {
  // =========================================================================
  // 11. NETCODE: CLIENT-SIDE PREDICTION & RECONCILIATION
  // =========================================================================
  'netcode-prediction': {
    topicId: 'netcode-prediction',
    beginner: [
      {
        id: 'net-b-1',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'แนวคิดของ Client-Side Prediction',
        prompt: 'ในระบบ Client-Side Prediction เมื่อผู้เล่นกดปุ่มเดิน ตัวละครในเครื่องของผู้เล่นจะเคลื่อนที่ ___BLANK___ โดยไม่ต้องรอคำตอบยืนยันจากเซิร์ฟเวอร์:',
        codeSnippet: `// การตอบสนองที่รวดเร็ว:
function onInput(input: Input): void {
  // ส่งปุ่มไปเซิร์ฟเวอร์
  network.send(input);
  // ประมวลผลในเครื่องตัวเอง ___BLANK___
  applyMovementLocally(input);
}`,
        options: ['ทันทีในเครื่องทันใด (Immediately)', 'รอ 2 วินาที', 'เมื่อเกมโอเวอร์', 'เมื่อปิดหน้าต่าง'],
        correctAnswer: 'ทันทีในเครื่องทันใด (Immediately)',
        hint: 'ตอบสนองทันทีแบบ Zero Latency เพื่อไม่ให้ผู้เล่นรู้สึกหน่วง',
        explanation: 'Client-Side Prediction ทำให้ผู้เล่นไม่รู้สึกถึง Latency ของอินเทอร์เน็ต โดยคำนวณการเคลื่อนที่ล่วงหน้าทันทีที่กดปุ่ม',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-2',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'การแก้ไขค่าเมื่อข้อมูลไม่ตรงกัน (Server Reconciliation)',
        prompt: 'หากเซิร์ฟเวอร์ส่ง State กลับมาและพบว่าตำแหน่งที่เซิร์ฟเวอร์คำนวณไม่ตรงกับที่เครื่องไคลเอนต์คาดเดา ไคลเอนต์ต้องทำ ___BLANK___:',
        codeSnippet: `// เมื่อเกิดข้อผิดพลาดในการทำนาย:
if (serverState.pos !== predictedHistory[tick].pos) {
  // ย้อนรอยแก้ไขและเล่นปุ่มกดใหม่:
  perform___BLANK___();
}`,
        options: ['Server Reconciliation (ปรับเทียบค่าและ Replay)', 'ลบเกมทิ้ง', 'ตัดการเชื่อมต่อทันที', 'แบนผู้เล่น'],
        correctAnswer: 'Server Reconciliation (ปรับเทียบค่าและ Replay)',
        hint: 'ยอมรับค่าของเซิร์ฟเวอร์ แล้วนำปุ่มที่เคยกดหลังจากนั้นมารันจำลองซ้ำใหม่อีกรอบ',
        explanation: 'Server Reconciliation รีเซ็ตตำแหน่งไปยังค่าจริงของเซิร์ฟเวอร์ แล้ว Replay ทุก Input ในประวัติที่ยังไม่ได้รับการยืนยันกลับมาถึงปัจจุบัน',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-3',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ทำไมเซิร์ฟเวอร์จึงไม่ควรรับพิกัดตำแหน่ง (Position) จากเครื่องผู้เล่นโดยตรง',
        prompt: 'ในเกมยิงมุมมองบุคคลที่หนึ่ง เหตุใดเซิร์ฟเวอร์จึงต้องรับเฉพาะ "ปุ่มกดและเวลา" (Inputs & Ticks) แทนที่จะรับพิกัด (X, Y, Z) ที่เครื่องไคลเอนต์ส่งมาตรงๆ?',
        options: [
          'เพื่อป้องกันการโกงเกม เช่น วาร์ปทะลุกำแพง (Teleportation) หรือเร่งความเร็วเหนือมนุษย์ (Speedhack)',
          'เพราะพิกัดตัวเลขกินพื้นที่สายเคเบิลอินเทอร์เน็ตมากเกินไป',
          'เพราะเซิร์ฟเวอร์ไม่เข้าใจระบบพิกัด 3 มิติ',
          'เพื่อป้องกันไม่ให้ภาพของเกมเบลอ'
        ],
        correctAnswer: 0,
        hint: 'Authoritative Server: อย่าเชื่อข้อมูลตำแหน่งจากเครื่องผู้เล่นเด็ดขาด',
        explanation: 'หากเซิร์ฟเวอร์เชื่อพิกัดตรงๆ ผู้เล่นจะใช้โปรแกรมดัดแปลงหน่วยความจำส่งตำแหน่งวาปไปยิงคนอื่นได้ เซิร์ฟเวอร์จึงต้องเป็นผู้ถือสิทธิ์ขาด (Authoritative Server) ในการคำนวณตำแหน่งจาก Input',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-4',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'โครงสร้างเก็บบันทึกประวัติปุ่มกด (Input History Buffer)',
        prompt: 'เครื่องไคลเอนต์จำเป็นต้องเก็บบันทึกประวัติของปุ่มกดในแต่ละ Tick ไว้ในอาเรย์เพื่อใช้ Replay ตอนเซิร์ฟเวอร์ทักท้วง:',
        codeSnippet: `interface SavedInput {
  tick: number;
  input: PlayerInput;
  predictedPosition: Vector3;
}
const inputHistory: ___BLANK___ = [];`,
        options: ['SavedInput[]', 'number[]', 'string', 'null'],
        correctAnswer: 'SavedInput[]',
        hint: 'เก็บเป็นรายการประวัติของโครงสร้าง SavedInput',
        explanation: 'Input History Buffer เก็บประวัติปุ่มกดและผลลัพธ์ตำแหน่งในอดีต เพื่อให้สามารถ Re-simulate ได้เมื่อเซิร์ฟเวอร์ส่งสถานะยืนยันกลับมา',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-5',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Entity Interpolation สำหรับผู้เล่นคนอื่นในฉาก',
        prompt: 'สำหรับผู้เล่นคนอื่น (Remote Players) ที่เราไม่ได้ควบคุม เครื่องเราจะแสดงการเคลื่อนไหวที่ลื่นไหลผ่านเทคนิค Entity ___BLANK___:',
        codeSnippet: `// แสดงผลผู้เล่นคนอื่นด้วยการเกลี่ยตำแหน่ง:
const otherPlayerPos = Vector3.lerp(pastSnapshotA, pastSnapshotB, factor);`,
        options: ['Interpolation (การประมาณค่าช่วงเวลาในอดีต)', 'Extrapolation ข้ามอนาคต', 'Deletion', 'Randomization'],
        correctAnswer: 'Interpolation (การประมาณค่าช่วงเวลาในอดีต)',
        hint: 'เล่นภาพสแนปช็อตย้อนหลังประมาณ 50-100ms เพื่อเชื่อมจุดตำแหน่งอย่างราบรื่น',
        explanation: 'Entity Interpolation เล่นสแนปช็อตของผู้เล่นอื่นที่ได้รับมาจากเซิร์ฟเวอร์โดยหน่วงเวลาเล็กน้อย (Interp Delay) เพื่อเกลี่ยจุดตำแหน่งให้ลื่นไหล 60 FPS แม้แพ็กเก็ตจะมาไม่สม่ำเสมอ',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-6',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'Lag Compensation ในการยิงปืน (Server Hitbox Rewind)',
        prompt: 'เมื่อผู้เล่นเล็งปืนยิงโดนหัวศัตรูบนหน้าจอของตนเอง เซิร์ฟเวอร์ทำอย่างไรเพื่อตัดสินว่ากระสุนโดนเป้าจริง ทั้งที่มีค่า Latency ระหว่างกัน?',
        options: [
          'เซิร์ฟเวอร์หมุนเวลากลับไปในอดีต (Rewind Hitboxes) ตามค่า Ping ของผู้ยิง เพื่อดูว่าตอนที่เขากดยิง เป้าหมายยืนอยู่ตรงนั้นจริงหรือไม่',
          'เซิร์ฟเวอร์สุ่มทอยลูกเต๋าเลือกว่าจะให้โดนหรือไม่',
          'เซิร์ฟเวอร์เพิ่มค่าเลือดให้ศัตรูทันที',
          'เซิร์ฟเวอร์บังคับให้ทั้งสองคนหยุดเล่น'
        ],
        correctAnswer: 0,
        hint: 'ย้อนเวลาตำแหน่งกล่องชน (Hitbox) กลับไปเสี้ยววินาทีก่อน',
        explanation: 'Lag Compensation ย้อนตำแหน่ง Hitbox ของศัตรูในเซิร์ฟเวอร์กลับไปยังจุดที่ผู้ยิงเห็น ณ ขณะลั่นไก ทำให้ไม่ต้องยิงดักหน้าเน็ต (No Lead Aiming Needed)',
        engineContext: 'General Engine',
      },
      {
        id: 'net-b-7',
        topicId: 'netcode-prediction',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Ping / RTT (Round Trip Time) คืออะไร',
        prompt: 'RTT (Round-Trip Time) หมายถึงเวลาทั้งหมดที่ข้อมูลใช้เดินทางจากเครื่องเราไปถึงเซิร์ฟเวอร์และ ___BLANK___:',
        codeSnippet: `// ความหมายของค่า Ping 60ms:
// 30ms ขาไป + 30ms ___BLANK___`,
        options: ['เดินทางกลับมาถึงเครื่องเรา', 'หายสาบสูญไป', 'ถูกบันทึกลงแผ่นซีดี', 'ส่งต่อไปดาวอังคาร'],
        correctAnswer: 'เดินทางกลับมาถึงเครื่องเรา',
        hint: 'Round Trip หมายถึง การเดินทางไปและกลับครบหนึ่งรอบ',
        explanation: 'RTT คือระยะเวลาไปกลับครบ 1 รอบ หาก RTT = 60ms แสดงว่า Latency ขาไปอย่างเดียวจะอยู่ที่ประมาณ 30ms',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'net-p-1',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการตัวละครวาร์ปสั่นถอยหลัง (Rubber-Banding)',
        prompt: 'เมื่อผู้เล่นวิ่งชนขอบประตูด้านข้าง ปรากฏว่าตัวละครกระตุกถอยหลังกลับมาที่เดิมซ้ำๆ (Rubber-banding) แม้ว่าค่า Ping จะต่ำเพียง 30ms สาเหตุเชิงสถาปัตยกรรมเกิดจากอะไร?',
        options: [
          'ความคลาดเคลื่อนของการจำลองฟิสิกส์ระหว่างไคลเอนต์กับเซิร์ฟเวอร์ (เช่น ตัวแปรความหนา Collision ไม่เท่ากัน) ทำให้เซิร์ฟเวอร์ตัดสินว่าติดมุม ขณะที่ไคลเอนต์ทำนายว่าเดินผ่าน จึงถูก Reconcile ย้อนกลับทุกเฟรม',
          'ผู้เล่นทำน้ำหกใส่แป้นพิมพ์',
          'สายเคเบิลใยแก้วนำแสงของประเทศชำรุด',
          'ระบบเสียงของไมโครโฟนแย่งแบนด์วิดท์'
        ],
        correctAnswer: 0,
        hint: 'ถ้าผลการคำนวณในเครื่องเรากับเซิร์ฟเวอร์ไม่ตรงกันเป๊ะ เซิร์ฟเวอร์จะสั่งดึงตัวเรากลับมาตำแหน่งเดิมตลอดเวลา',
        explanation: 'Rubber-banding เกิดจาก Misprediction ซ้ำซาก หากเงื่อนไขฟิสิกส์ระหว่างสองฝั่งไม่ Deterministic หรือไม่ตรงกัน เซิร์ฟเวอร์จะปฏิเสธการทำนายและดึงตัวละครกลับมาตำแหน่งที่แท้จริงอย่างรุนแรง',
        engineContext: 'General Engine',
      },
      {
        id: 'net-p-2',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'สถาปัตยกรรม GGPO Rollback Netcode ในเกมต่อสู้ (Fighting Games)',
        prompt: 'เทคโนโลยี Rollback Netcode (เช่น GGPO) ในเกมต่อสู้ยุคใหม่ (Street Fighter 6, Guilty Gear Strive) แตกต่างจาก Delay-based Netcode ดั้งเดิมอย่างไร?',
        options: [
          'ไม่หน่วงเวลาการกดปุ่มของผู้เล่น แต่รันเกมเพลย์ล่วงหน้าทันที หากมีแพ็กเก็ตจากคู่ต่อสู้ส่งมาช้า เอนจินจะ "ย้อนเวลาถอยหลัง" (Rollback) หลายเฟรมใน 1 ms แล้ว Re-simulate State กลับมายังปัจจุบันทันที',
          'บังคับให้ผู้เล่นทั้งสองคนเชื่อมต่อผ่านสายเคเบิลเดียวกัน',
          'ลบเฟรมเรตของเกมลงเหลือ 15 FPS',
          'ใช้ AI เล่นแทนผู้เล่นที่อยู่ห่างไกล'
        ],
        correctAnswer: 0,
        hint: 'ตอบสนองปุ่มทันที และย้อนเวลาแก้ภาพเฉพาะเมื่อข้อมูลคู่แข่งมาถึง',
        explanation: 'Rollback Netcode ให้ความรู้สึกของการเล่นแบบออฟไลน์ที่สมบูรณ์แบบ โดยไม่มี Input Delay และอาศัยการย้อน State แล้ว Resimulate อย่างรวดเร็ว',
        engineContext: 'General Engine',
      },
      {
        id: 'net-p-3',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับวงรอบการทำงานของ Client Prediction & Server Reconciliation',
        prompt: 'เรียงลำดับขั้นตอนของ Client Netcode เมื่อได้รับ Authoritative State จากเซิร์ฟเวอร์:',
        options: [
          'รับ Server Snapshot ล่าสุดพร้อมเลข Server Sequence ID',
          'เปรียบเทียบตำแหน่งของเซิร์ฟเวอร์กับค่าที่เคยทำนายไว้ใน Input Buffer ประวัติ',
          'หากคลาดเคลื่อนเกินขีดจำกัด (Error Threshold) ให้รีเซ็ตตำแหน่งกลับไปเป็นของเซิร์ฟเวอร์',
          'Replay: วนลูปนำ Input ทั้งหมดที่เซิร์ฟเวอร์ยังไม่ได้รับมารันฟิสิกส์คำนวณใหม่รวดเดียวจนถึงเฟรมปัจจุบัน'
        ],
        correctAnswer: [
          'รับ Server Snapshot ล่าสุดพร้อมเลข Server Sequence ID',
          'เปรียบเทียบตำแหน่งของเซิร์ฟเวอร์กับค่าที่เคยทำนายไว้ใน Input Buffer ประวัติ',
          'หากคลาดเคลื่อนเกินขีดจำกัด (Error Threshold) ให้รีเซ็ตตำแหน่งกลับไปเป็นของเซิร์ฟเวอร์',
          'Replay: วนลูปนำ Input ทั้งหมดที่เซิร์ฟเวอร์ยังไม่ได้รับมารันฟิสิกส์คำนวณใหม่รวดเดียวจนถึงเฟรมปัจจุบัน'
        ],
        hint: 'รับข้อมูลเซิร์ฟเวอร์ -> ตรวจสอบว่าตรงไหม -> รีเซ็ตถ้าผิดพลาด -> รันปุ่มที่ค้างอยู่จนทันปัจจุบัน',
        explanation: 'นี่คือหัวใจของ Reconciliation: Snapshot Receive -> State Check -> Reset to Authoritative -> Re-simulate Pending Inputs',
        engineContext: 'General Engine',
      },
      {
        id: 'net-p-4',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Error Smoothing (การเกลี่ยข้อผิดพลาดไม่ให้ภาพกระตุก)',
        prompt: 'เมื่อเกิดความผิดพลาดในการทำนายตำแหน่ง 5 เซนติเมตร หากเอนจินวาร์ปตัวละครทันที ภาพจะดูกระตุก (Snap Artifact) เทคนิค Error Smoothing แก้ไขปัญหานี้อย่างไร?',
        options: [
          'เก็บผลต่างตำแหน่ง (Position Error Offset) แยกไว้ แล้วค่อยๆ เกลี่ยลดค่า Offset นั้นลงสู่ศูนย์ด้วย Exponential Decay / Lerp ผ่านหลายๆ เฟรมการเรนเดอร์',
          'ซ่อนตัวละครไว้ใต้ดิน 1 วินาที',
          'ปิดการเรนเดอร์เงาของตัวละคร',
          'ปรับความละเอียดจอภาพให้ต่ำลง'
        ],
        correctAnswer: 0,
        hint: 'ค่อยๆ เกลี่ยระยะที่คลาดเคลื่อนให้แนบเนียนผ่านสายตาผู้เล่น',
        explanation: 'Visual Error Smoothing แยกการแสดงผลกราฟิกส์ออกจากตำแหน่งฟิสิกส์จริง ทำให้การปรับค่าของเซิร์ฟเวอร์ดูนุ่มนวลและไม่กระตุกเตะตา',
        engineContext: 'General Engine',
      },
      {
        id: 'net-p-5',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'ข้อจำกัดและการป้องกันช่องโหว่ของ Lag Compensation',
        prompt: 'เพื่อป้องกันไม่ให้ผู้เล่นที่เน็ตกระตุกหนัก (High Ping Abusers) หรือคนโกงแก้ไข Timestamp ย้อนเวลาไปยิงคนอื่นจากอดีตเมื่อ 3 วินาทีก่อน เซิร์ฟเวอร์ต้องมีกฎความปลอดภัยใด?',
        options: [
          'จำกัดกรอบเวลาย้อนหลังสูงสุด (Max Rewind Window เช่น ไม่เกิน 200-250ms) หากคำขอเก่าเกินนั้น เซิร์ฟเวอร์จะปฏิเสธการย้อนเวลาทันที',
          'ตัดสายอินเทอร์เน็ตของผู้เล่นทุกคน',
          'ปิดการยิงปืนในเกมทั้งหมด',
          'บังคับให้ผู้เล่นเปิดเว็บแคม'
        ],
        correctAnswer: 0,
        hint: 'ตั้งเพดานการย้อนเวลาไม่ให้เกิน 200ms เพื่อความยุติธรรมของผู้เล่นคนอื่น',
        explanation: 'Max Rewind Clamping ป้องกันปัญหาผู้เล่นถูกยิงตายทั้งที่วิ่งหลบเข้ากำแพงไปนานแล้ว (Dying behind cover) จากฝีมือของผู้เล่นที่มี Ping สูงผิดปกติ',
        engineContext: 'General Engine',
      },
      {
        id: 'net-p-6',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'การบีบอัดข้อมูล Snapshot ด้วย Delta Compression และ Quantization',
        prompt: 'เกม Multiplayer 100 คนมีแบนด์วิดท์เซิร์ฟเวอร์เต็มขีดจำกัดเพราะส่ง Position (Vector3 float 12 bytes) และ Rotation ของทุกคนทุกเฟรม เทคนิคการลดขนาดข้อมูลที่ดีที่สุดคืออะไร?',
        options: [
          'ใช้ Quantization (แปลง Float 32-bit เป็น Integer 16-bit ในกรอบแผนที่) ร่วมกับ Delta Compression (ส่งเฉพาะความต่างเทียบกับ Snapshot ก่อนหน้า)',
          'ส่งข้อมูลเป็นรูปภาพหน้าจอความละเอียดสูงผ่านดาวเทียม',
          'ลดจำนวนผู้เล่นลงเหลือ 2 คน',
          'เปลี่ยนไปใช้สายเชื่อมต่อ USB แทนอินเทอร์เน็ต'
        ],
        correctAnswer: 0,
        hint: 'บีบอัดทศนิยมให้เป็นเลขจำนวนเต็มขนาดเล็ก และส่งเฉพาะข้อมูลที่ขยับจริง',
        explanation: 'Fixed-point Quantization และ Delta Compression ช่วยลดขนาดแพ็กเก็ตได้ถึง 80-90% ทำให้เซิร์ฟเวอร์ประหยัด Bandwidth มหาศาล',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'net-p-7',
        topicId: 'netcode-prediction',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Network Replication ใน Unreal Engine 5 (Iris Replication System)',
        prompt: 'ระบบ Iris Replication System ใหม่ใน Unreal Engine 5 ออกแบบมาเพื่ออะไร?',
        options: [
          'สถาปัตยกรรม Network Replication ประสิทธิภาพสูงที่แยกการจัดการข้อมูลเครือข่ายออกจาก Game Thread ไปรันขนานกันบน Worker Threads เพื่อรองรับผู้เล่นและวัตถุนับหมื่นชิ้น',
          'ระบบสร้างภาพเอฟเฟกต์สีรุ้งบนท้องฟ้า',
          'โปรแกรมจำลองเสียงร้องของสัตว์ป่า',
          'ตัวสร้างโมเดลตัวละคร 3D อัตโนมัติ'
        ],
        correctAnswer: 0,
        hint: 'แยกงานเน็ตเวิร์กออกจาก Game Thread เพื่อรองรับสเกลระดับมหาศาล',
        explanation: 'Iris ใน UE5 ถูกสร้างขึ้นมาเพื่อก้าวข้ามข้อจำกัดของ Replication ดั้งเดิม โดยทำงานแบบ Thread-safe และใช้ Memory Polling ที่ประหยัดรอบ CPU มหาศาลในเกม Open World',
        engineContext: 'Unreal Engine',
      },
    ],
  },

  // =========================================================================
  // 12. TEXTURE STREAMING & MIPMAPPING
  // =========================================================================
  'texture-streaming': {
    topicId: 'texture-streaming',
    beginner: [
      {
        id: 'tex-b-1',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'ความหมายของ Mipmaps',
        prompt: 'Mipmaps คือชุดของรูปภาพเดียวกันที่ถูกย่อขนาดลงทีละครึ่งหนึ่ง (เช่น 1024 -> 512 -> 256 -> 128) เตรียมไว้ล่วงหน้าเพื่อใช้กับวัตถุที่อยู่ ___BLANK___:',
        codeSnippet: `// ลำดับของ Mipmap Levels:
Level 0: 2048 x 2048 (มองใกล้มาก)
Level 1: 1024 x 1024
Level 2: 512 x 512
Level 3: 256 x 256 (มอง ___BLANK___)`,
        options: ['ห่างไกลจากสายตากล้อง (Far away)', 'ติดอยู่กับหน้าเลนส์', 'ในกระเป๋าผู้เล่น', 'ไม่มีในฉาก'],
        correctAnswer: 'ห่างไกลจากสายตากล้อง (Far away)',
        hint: 'วัตถุที่อยู่ไกลสายตาไม่จำเป็นต้องใช้ภาพขนาด 4K เต็มความละเอียด',
        explanation: 'Mipmaps ช่วยลดขนาดภาพที่ต้องโหลดเมื่อวัตถุอยู่ไกล ป้องกันอาการภาพกระเพื่อมเป็นคลื่น (Texture Aliasing / Moire) และประหยัดแคชการ์ดจอ',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-b-2',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'การสิ้นเปลืองพื้นที่ VRAM เมื่อไม่มี Texture Streaming',
        prompt: 'หากเกม Open World โหลด Texture 4K ของต้นไม้และบ้านเรือนทั้งเมืองขึ้น VRAM พร้อมกันทั้งหมดตั้งแต่เริ่มเกม จะเกิดปัญหาใด?',
        options: [
          'หน่วยความจำ VRAM ของการ์ดจอจะเต็ม (VRAM Out of Memory) จนเกมกระตุกรุนแรงหรือแครช',
          'ตัวละครจะเดินเร็วขึ้นผิดปกติ',
          'เสียงพากย์ในเกมจะกลายเป็นภาษาต่างดาว',
          'ปุ่มกดบนจอยสติ๊กจะใช้งานไม่ได้'
        ],
        correctAnswer: 0,
        hint: 'หน่วยความจำของการ์ดจอมีจำกัด (เช่น 6GB หรือ 8GB)',
        explanation: 'การโหลดภาพขนาดเต็มทั้งหมดจะทำให้ VRAM ล้นและบีบให้ OS ต้องสลับหน่วยความจำข้ามบัส PCIe ทำให้เกมกระตุกค้างรุนแรง',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-b-3',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'หลักการทำงานของ Texture Streaming',
        prompt: 'ระบบ Texture Streaming จะโหลด Mipmap ระดับความละเอียดสูงเข้ามาใน VRAM เฉพาะเมื่อกล้องเคลื่อนที่เข้าไป ___BLANK___ วัตถุนั้น:',
        codeSnippet: `// ตรรกะของ Streaming Pool:
if (distanceToCamera < threshold) {
  loadHighResMipLevel(); // เข้าไป ___BLANK___ ค่อยดึงภาพชัดมา
} else {
  dropToLowResMipLevel(); // อยู่ไกลใช้ภาพเล็ก
}`,
        options: ['ใกล้ชิด (Close to object)', 'ไกลออกไปนอกโลก', 'หันหลังให้', 'ปิดหน้าจอ'],
        correctAnswer: 'ใกล้ชิด (Close to object)',
        hint: 'เข้าใกล้ค่อยโหลดภาพชัด อยู่ไกลใช้ภาพเล็ก',
        explanation: 'Texture Streaming ดึงเฉพาะ Mipmap ชั้นที่จำเป็นตามขนาดของวัตถุบนหน้าจอจริง ทำให้ประหยัด VRAM ได้มหาศาล',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-b-4',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'การบีบอัดรูปภาพเฉพาะทางของ GPU (Block Compression)',
        prompt: 'รูปแบบไฟล์บีบอัดรูปภาพใดที่การ์ดจอสามารถอ่านและคลายการบีบอัดในระดับฮาร์ดแวร์ได้โดยตรงโดยไม่ต้องแปลงเป็นไฟล์ดิบขนาดใหญ่?',
        options: [
          'BC7, DXT5 (BC3), และ ASTC',
          'PNG และ JPEG',
          'GIF อนิเมชั่น',
          'MP4 วิดีโอ'
        ],
        correctAnswer: 0,
        hint: 'PNG ต้องถูกคลายซิปเป็น RGBA32 เต็มก้อนในแรม แต่ BC7/ASTC การ์ดจออ่านแบบบีบอัดได้โดยตรง',
        explanation: 'GPU Texture Compression (เช่น BC7 บน PC หรือ ASTC บนมือถือ) ถูกออกแบบมาให้ถอดรหัสใน Texture Sampling Units ได้ทันทีโดยไม่เปลือง VRAM',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-b-5',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การตั้งค่าโหมดกรองภาพสำหรับ Mipmap (Texture Filtering)',
        prompt: 'โหมดการกรองภาพที่เกลี่ยรอยต่อระหว่าง Mipmap เลเยอร์ได้อย่างราบรื่นที่สุดคือ:',
        codeSnippet: `texture.filterMode = FilterMode.___BLANK___;`,
        options: ['Trilinear', 'Point', 'Bilinear', 'None'],
        correctAnswer: 'Trilinear',
        hint: 'Bilinear เกลี่ย 2 มิติ ส่วน Trilinear เกลี่ยข้ามชั้น Mipmap มิติที่ 3 ด้วย',
        explanation: 'Trilinear Filtering เฉลี่ยสีระหว่าง 4 พิกเซลของภาพชั้นปัจจุบันและ 4 พิกเซลของ Mipmap ชั้นถัดไป ทำให้ไม่เห็นเส้นตัดรอยต่อของความชัด',
        engineContext: 'Unity',
      },
      {
        id: 'tex-b-6',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'พื้นที่หน่วยความจำที่ Mipmaps เพิ่มขึ้นมา',
        prompt: 'การสร้าง Mipmaps ครบทุกระดับจะกินพื้นที่หน่วยความจำเพิ่มขึ้นจากภาพต้นฉบับเพียงประมาณ ___BLANK___ เปอร์เซ็นต์:',
        codeSnippet: `// ผลรวมอนุกรมเรขาคณิต:
// 1 + 1/4 + 1/16 + 1/64 + ... ≈ 1.333
// เพิ่มขึ้นเพียง ___BLANK___%`,
        options: ['33.3% (หนึ่งในสาม)', '100% (เท่าตัว)', '500%', '0%'],
        correctAnswer: '33.3% (หนึ่งในสาม)',
        hint: 'อนุกรมผลรวมของ 1/4 + 1/16 + ... ลู่เข้าหา 1/3',
        explanation: 'เพราะภาพแต่ละขั้นเล็กลง 4 เท่า ผลรวมของ Mipmap ทั้งหมดจึงกินพื้นที่เพิ่มเพียง 33.3% เท่านั้น แลกกับประสิทธิภาพมหาศาล',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-b-7',
        topicId: 'texture-streaming',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'อาการภาพเบลอชั่วคราวตอนหันกล้องเร็วๆ (Texture Pop-in)',
        prompt: 'เมื่อผู้เล่นหันกล้องอย่างรวดเร็ว แล้วเห็นพื้นผิวเบลออยู่ประมาณ 0.5 วินาทีก่อนจะค่อยๆ คมชัดขึ้น ปรากฏการณ์นี้เรียกว่าอะไร?',
        options: [
          'Texture Pop-in / Mip Streaming Delay',
          'หน้าจอมอนิเตอร์เสีย',
          'ตัวละครสายตาสั้น',
          'ความเร็วของแสงในเกมลดลง'
        ],
        correctAnswer: 0,
        hint: 'ระบบกำลังอ่านภาพความละเอียดสูงจากฮาร์ดดิสก์ขึ้นมาใส่การ์ดจอไม่ทัน',
        explanation: 'Texture Pop-in เกิดขึ้นเมื่อฮาร์ดดิสก์หรือช่องทาง I/O สตรีมภาพความละเอียดสูงขึ้นมาแทนที่ Mipmap เบลอไม่ทันขณะที่กล้องเปลี่ยนมุมมองอย่างกะทันหัน',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'tex-p-1',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการเกมค้างกระตุกตอนวิ่งข้ามโซนโลกเปิด (Texture Upload Hitch)',
        prompt: 'เมื่อผู้เล่นควบม้าข้ามสะพานเข้าสู่เมืองใหม่ เกมเกิดอาการสะดุดเป็นจังหวะๆ (Stutter Spikes) Profiler ระบุว่าเกิดจาก `glTexSubImage2D` หรือ `CopyTexture` ที่รันบน Main Render Thread สาเหตุและแนวทางแก้คืออะไร?',
        options: [
          'การส่งข้อมูล Texture ก้อนใหญ่ขึ้น VRAM บน Render Thread บล็อกการวาดภาพ; ต้องใช้ Asynchronous Texture Upload (DMA / Copy Queue แยกต่างหาก) หรือจำกัดขนาดการอัปโหลดต่อเฟรม',
          'ลบเมืองทิ้งแล้วให้เป็นทุ่งหญ้าว่างเปล่า',
          'เพิ่มแสงแดดในฉากให้สว่างขึ้น',
          'สั่ง Restart คอมพิวเตอร์อัตโนมัติ'
        ],
        correctAnswer: 0,
        hint: 'การโอนข้อมูลภาพหลายสิบเมกะไบต์เข้าการ์ดจอบนเธรดหลักจะทำให้เฟรมดรอปทันที',
        explanation: 'Async Texture Upload ใช้ Staging Buffers และ DMA Transfer Queue ทำงานเบื้องหลังขนานไปกับ Render Thread ช่วยให้โหลดภาพความละเอียดสูงเข้า VRAM ได้โดยไม่มีอาการกระตุก',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-p-2',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Virtual Texturing (Sparse Virtual Textures / MegaTexture)',
        prompt: 'เทคโนโลยี Sparse Virtual Texturing (SVT) เช่น ใน Unreal Engine 5 หรือ id Tech 6 ทำงานอย่างไรเพื่อจัดการโลกที่มีความละเอียดภาพระดับกิกะไบต์?',
        options: [
          'แบ่งภาพขนาดมหึมา (เช่น 64K x 64K) ออกเป็นกระเบื้องแผ่นเล็กๆ (Tiles ขนาด 128x128 พิกเซล) และให้ GPU Feedback Buffer บอกว่าพิกเซลใดบนหน้าจอกำลังมองเห็น Tile ไหน จากนั้นจึงโหลดเฉพาะ Tile นั้นขึ้น Physical VRAM Cache',
          'สร้างภาพใหม่ด้วย AI ทุกๆ วินาที',
          'บังคับให้ผู้เล่นซื้อการ์ดจอที่มี VRAM 128GB',
          'แปลงพื้นผิวทั้งหมดให้กลายเป็นสีขาวดำ'
        ],
        correctAnswer: 0,
        hint: 'คล้ายระบบ Virtual Memory ของระบบปฏิบัติการ: โหลดเฉพาะ Page/Tile ที่ถูกเรียกใช้จริง',
        explanation: 'Virtual Texturing แปลงพิกัด UV เป็น Indirection Table ทำให้โลกเกมสามารถมีพื้นผิวไม่ซ้ำกันได้มหาศาล โดยกิน VRAM คงที่ตามจำนวน Tile ที่ปรากฏบนจอภาพเท่านั้น',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'tex-p-3',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Texture Streaming Runtime Loop',
        prompt: 'เรียงลำดับการทำงานของ Texture Streaming Subsystem ในแต่ละรอบ:',
        options: [
          'คำนวณ Mipmap Level ที่ต้องการจากขนาดของ Mesh บนจอและระยะห่างกล้อง',
          'ตรวจสอบงบประมาณหน่วยความจำ (Streaming Memory Budget) ใน VRAM',
          'ส่งคำขอ Asynchronous Disk I/O เพื่ออ่านข้อมูล Mip ข้อมูลที่ขาดหายไป',
          'อัปโหลดข้อมูลภาพผ่าน Staging Buffer ขึ้น GPU และปรับตัวชี้ Texture Sampler'
        ],
        correctAnswer: [
          'คำนวณ Mipmap Level ที่ต้องการจากขนาดของ Mesh บนจอและระยะห่างกล้อง',
          'ตรวจสอบงบประมาณหน่วยความจำ (Streaming Memory Budget) ใน VRAM',
          'ส่งคำขอ Asynchronous Disk I/O เพื่ออ่านข้อมูล Mip ข้อมูลที่ขาดหายไป',
          'อัปโหลดข้อมูลภาพผ่าน Staging Buffer ขึ้น GPU และปรับตัวชี้ Texture Sampler'
        ],
        hint: 'คำนวณความชัดที่ต้องใช้ -> เช็คงบ VRAM -> อ่านจากดิสก์แบบ Asynchronous -> ส่งเข้าการ์ดจอ',
        explanation: 'นี่คือ Pipeline มาตรฐาน: Distance/Screen Metric -> VRAM Budget Check -> Async I/O Request -> GPU Buffer Upload',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-p-4',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'การคำนวณ Mip Level ทางคณิตศาสตร์ผ่าน Screen-Space Derivatives',
        prompt: 'ในฮาร์ดแวร์ GPU การเลือกว่าจะอ่านข้อมูลจาก Mipmap Level ไหนคำนวณจากฟังก์ชันอนุพันธ์ (Derivatives) ใดใน Pixel Shader?',
        options: [
          'การหาอัตราการเปลี่ยนแปลงของ UV เทียบกับพิกเซลบนหน้าจอผ่านคำสั่ง `ddx(uv)` และ `ddy(uv)`',
          'การสุ่มตัวเลขผ่านฟังก์ชัน Random',
          'การวัดอุณหภูมิของชิปประมวลผล',
          'การอ่านเวลาของนาฬิกาในระบบ'
        ],
        correctAnswer: 0,
        hint: 'อัตราการเปลี่ยนของพิกัด UV ข้ามพิกเซลหน้าจอ (Screen-space derivative)',
        explanation: 'คำสั่ง `ddx()` และ `ddy()` วัดว่า 1 พิกเซลบนจอครอบคลุมพื้นที่ UV กว้างแค่ไหน หาก 1 พิกเซลครอบคลุมหลาย Texel GPU จะเลือก Mipmap ชั้นที่เล็กลงอัตโนมัติ',
        engineContext: 'C++ / Low-Level',
      },
      {
        id: 'tex-p-5',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'นโยบายการไล่ข้อมูลออกจาก VRAM (Eviction Policy) เมื่อหน่วยความจำเต็ม',
        prompt: 'เมื่อ Streaming Pool ของ VRAM เต็มขีดจำกัด (เช่น เต็ม 4GB) อัลกอริทึมใดมีประสิทธิภาพสูงสุดในการเลือก Mipmap ที่ควรถูกปลดทิ้งก่อน?',
        options: [
          'Least Recently Used (LRU) ร่วมกับการคัดทิ้ง Mipmap ความละเอียดสูงสุดของวัตถุที่อยู่ไกลสายตาหรืออยู่นอกกล้องก่อน',
          'ลบภาพของตัวละครหลักทิ้งทันที',
          'สุ่มเลือกลบไฟล์ภาพตามลำดับตัวอักษร A-Z',
          'ลบภาพที่ดาวน์โหลดมาล่าสุดทิ้ง'
        ],
        correctAnswer: 0,
        hint: 'ทิ้งความละเอียดชั้นสูงสุดของสิ่งที่ไม่ได้มองเห็นเป็นเวลานานที่สุด (LRU)',
        explanation: 'การลดระดับ Mip ของวัตถุที่ไกลออกไปหรือไม่ได้เรนเดอร์มานาน ช่วยคืนพื้นที่ VRAM ได้ทันทีโดยผู้เล่นไม่สังเกตเห็นการเปลี่ยนแปลง',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-p-6',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์ Anisotropic Filtering และผลกระทบต่อ Cache Hit Rate',
        prompt: 'เมื่อเปิด Anisotropic Filtering 16x กับพื้นถนนที่ทอดยาวไปจนสุดขอบฟ้า ภาพคมชัดขึ้นมากแต่ GPU Performance ตกลงเล็กน้อย กลไกทางฮาร์ดแวร์ของการกินพลังประมวลผลนี้คืออะไร?',
        options: [
          'เมื่อมุมกล้องเฉียงมาก พื้นผิวจะกลายเป็นวงรีบนหน้าจอ ทำให้ Texture Sampler ต้องสุ่มตัวอย่างอ่าน Texels เพิ่มขึ้นถึง 16 จุดตามแนวเฉียง ส่งผลให้ Texture Cache Miss เพิ่มขึ้น',
          'สายจอภาพไม่รองรับความละเอียดเฉียง',
          'ระบบเสียงของเกมถูกปิดการทำงาน',
          'คอมพิวเตอร์ต้องเปิดแอร์เย็นขึ้น'
        ],
        correctAnswer: 0,
        hint: 'การสุ่มตัวอย่างตามแนวเฉียงรูปวงรี (Anisotropic Footprint) ต้องอ่านข้อมูลหลายจุดในแนวทแยง',
        explanation: 'Anisotropic Filtering แก้ปัญหาภาพเบลอตามแนวมุมเฉียงด้วยการ Sample หลายจุดตามทิศทางความเอียงของรูปทรง ซึ่งเพิ่ม Memory Bandwidth ใน Texture Unit',
        engineContext: 'General Engine',
      },
      {
        id: 'tex-p-7',
        topicId: 'texture-streaming',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'DirectStorage / Sampler Feedback ใน DirectX 12 Ultimate',
        prompt: 'เทคโนโลยี DirectStorage และ Sampler Feedback ช่วยยกระดับ Texture Streaming บน SSD ยุคใหม่อย่างไร?',
        options: [
          'อนุญาตให้ NVMe SSD ส่งข้อมูล Texture ผ่าน DMA ตรงเข้าสู่ VRAM ของการ์ดจอโดยตรงโดยไม่ต้องผ่าน CPU หรือบีบให้ CPU ต้องคัดลอกข้อมูลใน RAM หลัก',
          'ทำให้ไฟล์ภาพในเกมมีขนาดเท่ากับศูนย์ไบต์',
          'ทำให้หน้าจอสามารถเรนเดอร์ภาพได้แม้ไม่มีไฟฟ้า',
          'แปลงเกม 3 มิติให้เป็นตัวหนังสือธรรมดา'
        ],
        correctAnswer: 0,
        hint: 'Direct Memory Access ข้ามผ่านจาก SSD ตรงเข้าการ์ดจอโดยข้าม CPU',
        explanation: 'DirectStorage กำจัดคอขวดของ CPU ในการอ่านไฟล์และคลายการบีบอัด โดยให้ฮาร์ดแวร์ GPU และ NVMe SSD คุยกันโดยตรงผ่านแบนด์วิดท์มหาศาลหลายสิบ GB/s',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 13. AUDIO CONCURRENCY & VOICE LIMITING
  // =========================================================================
  'audio-concurrency': {
    topicId: 'audio-concurrency',
    beginner: [
      {
        id: 'audio-b-1',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'Audio Concurrency คืออะไร',
        prompt: 'Audio Concurrency (หรือ Voice Limiting) คือระบบที่ใช้ควบคุมและจำกัด ___BLANK___ ของเสียงชนิดเดียวกันที่เล่นพร้อมกันในเวลาหนึ่ง:',
        codeSnippet: `// การจำกัดเสียงกระสุนปืนกล:
const maxBulletSounds = ___BLANK___; // จำกัดไม่ให้เล่นเกินโควต้าพร้อมกัน`,
        options: ['จำนวนสูงสุด (Max Active Voices)', 'ความถี่เสียงแหลม', 'ความยาวของสายลำโพง', 'ชื่อไฟล์เพลง'],
        correctAnswer: 'จำนวนสูงสุด (Max Active Voices)',
        hint: 'จำกัดโควต้าจำนวนเสียงที่ดังพร้อมกันเพื่อไม่ให้แย่งทรัพยากร',
        explanation: 'Audio Concurrency ป้องกันไม่ให้เสียงเอฟเฟกต์ชนิดเดียวกันถูกเรียกเล่นซ้อนทับกันนับร้อยตัว ซึ่งจะทำให้เสียงแตกพร่าและสิ้นเปลือง CPU',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-2',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ผลเสียร้ายแรงเมื่อไม่มีระบบ Voice Limiting',
        prompt: 'หากกระสุน 100 นัดระเบิดกระทบพื้นพร้อมกันโดยไม่มีการจำกัด Voice Limit เสียงในเกมจะเกิดความเสียหายอย่างไร?',
        options: [
          'เกิดเสียงแตกพร่ารุนแรง (Audio Clipping / Distortion) ลำโพงเสียงแตก และ CPU Audio Thread อาจแครช',
          'ภาพบนหน้าจอจะกลายเป็นภาพย้อนยุค 8-bit',
          'ตัวละครจะเดินถอยหลังโดยอัตโนมัติ',
          'เกมจะเปลี่ยนภาษาเป็นภาษาละติน'
        ],
        correctAnswer: 0,
        hint: 'คลื่นเสียงที่บวกซ้อนกันจนล้นเพดาน 0 dBFS จะทำให้เกิดเสียงแตกสะแตกหู',
        explanation: 'การซ้อนทับของเสียงปริมาณมากจะทำให้แอมพลิจูดรวมล้นเกินเพดานดิจิทัล 0 dBFS เกิด Digital Hard Clipping ที่แสบหูและกินรอบคำนวณ DSP ของ CPU หนักหน่วง',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-3',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'เทคนิค Audio Ducking',
        prompt: 'เทคนิคที่ใช้ลดความดังของเสียงเพลงประกอบฉากลงอัตโนมัติขณะที่มีตัวละครกำลังพูดบทสนทนาเรียกว่า ___BLANK___:',
        codeSnippet: `// ปรับระดับเสียงเมื่อมีเสียงพากย์:
if (dialogueVoice.isPlaying()) {
  musicVolume = musicVolume * 0.3; // ทำ Audio ___BLANK___
}`,
        options: ['Audio Ducking (Side-chain Compression)', 'Audio Muting ทั้งเกม', 'Pitch Shifting', 'Echo Reverb'],
        correctAnswer: 'Audio Ducking (Side-chain Compression)',
        hint: 'เปรียบเหมือนการก้มหัวหลบ (Duck) ให้เสียงพากย์เด่นขึ้นมา',
        explanation: 'Audio Ducking ช่วยให้ผู้เล่นได้ยินเสียงพูดคุยหรือเสียงสำคัญชัดเจน โดยระบบจะหรี่เสียงดนตรีหรือเสียงแอมเบียนต์ลงชั่วคราว',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-4',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'นโยบาย Voice Stealing เมื่อช่องเสียงเต็ม',
        prompt: 'เมื่อจำนวนเสียงระเบิดถึงขีดจำกัดสูงสุด (เช่น 4 เสียง) เสียงใหม่ที่ดังขึ้นมาควรจัดการอย่างไร:',
        codeSnippet: `if (activeExplosions.length >= maxLimit) {
  // นโยบายขโมยช่องเสียงที่เก่าที่สุดหรือเบาที่สุด:
  const victim = findOldestOrQuietestVoice();
  ___BLANK___;
  playNewVoice();
}`,
        options: ['victim.stop()', 'victim.doubleVolume()', 'wait(1000)', 'throw new Error()'],
        correctAnswer: 'victim.stop()',
        hint: 'สั่งหยุดเสียงเก่าที่เบาที่สุดเพื่อเอาช่องว่างมาให้เสียงใหม่',
        explanation: 'Voice Stealing (ขโมยช่องเสียง) สั่งหยุดเสียงที่เก่าสุดหรือเบาสุดอย่างนุ่มนวล (Fade out) เพื่อให้เสียงใหม่ที่มีพลังกว่าได้เล่นแทน',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-5',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'การลดทอนความดังตามระยะทาง (3D Spatial Attenuation)',
        prompt: 'ในระบบเสียง 3 มิติ ปริมาณความดังของเสียงจะลดลงตามปัจจัยใด?',
        options: [
          'ระยะทางห่างระหว่างตำแหน่งกำเนิดเสียงกับตำแหน่งของ Audio Listener (หูของกล้อง/ตัวละคร)',
          'ความเร็วของอินเทอร์เน็ต',
          'จำนวนพิกเซลบนหน้าจอ',
          'สีของโมเดล 3D'
        ],
        correctAnswer: 0,
        hint: 'ยิ่งอยู่ไกลจากหูของผู้ฟัง เสียงยิ่งเบาลงตามกฎกำลังสองผกผัน (Inverse Square Law)',
        explanation: 'Spatial Audio คำนวณระยะทางและมุมเวกเตอร์เทียบกับ Audio Listener เพื่อปรับความดัง (Volume) และการแยกซ้ายขวา (Panning) ให้สมจริง',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-6',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'สเกลเดซิเบล (Decibel) ในระบบเสียง',
        prompt: 'หน่วยวัดระดับความเข้มของเสียงคือเดซิเบล (dB) ซึ่งมีลักษณะเป็นสเกลแบบ ___BLANK___ (ทุกๆ +6 dB ความดังของแรงดันเสียงจะเพิ่มขึ้นเป็น 2 เท่า):',
        codeSnippet: `// สเกลความดังเชิงคณิตศาสตร์:
// +0 dB = ปกติ
// +6 dB = เพิ่มแรงดันคลื่น 2 เท่า (สเกลแบบ ___BLANK___)`,
        options: ['ลอการิทึม (Logarithmic)', 'เส้นตรง (Linear)', 'สุ่มตัวเลข', 'วงกลม'],
        correctAnswer: 'ลอการิทึม (Logarithmic)',
        hint: 'หูมนุษย์รับรู้เสียงในลักษณะ Logarithmic ไม่ใช่เส้นตรง',
        explanation: 'Decibels เป็นสเกล Logarithmic การคำนวณการผสมเสียงจึงต้องระวังไม่ให้การบวกกันของแอมพลิจูดเกินเพดาน 0 dBFS',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-b-7',
        topicId: 'audio-concurrency',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'การป้องกันเสียงเครื่องจักรกลรัว (Machine-Gun Effect)',
        prompt: 'เมื่อตัวละครเดินย่ำก้าวเท้าถี่ๆ หากใช้ไฟล์เสียงฝีเท้าไฟล์เดิมเป๊ะเล่นซ้ำๆ เสียงจะฟังดูแข็งทื่อคล้ายปืนกล เทคนิคใดแก้ปัญหานี้ได้ง่ายที่สุด?',
        options: [
          'สุ่มไฟล์เสียงฝีเท้าหลายๆ แบบ (Random Variations) พร้อมสุ่มระดับเสียงสูงต่ำ (Pitch Modulation ±5%) เล็กน้อย',
          'ปิดเสียงฝีเท้าทิ้งทั้งหมด',
          'เพิ่มเสียงให้ดังขึ้นเป็น 10 เท่า',
          'ให้ตัวละครลอยแทนการเดิน'
        ],
        correctAnswer: 0,
        hint: 'สุ่ม Pitch เล็กน้อยและสลับไฟล์เสียงหลายอันเพื่อความเป็นธรรมชาติ',
        explanation: 'Random Pitch & Volume Modulation ร่วมกับการสลับคลิปเสียง (Sound Variations) ช่วยขจัดอาการ Machine-gun effect และทำให้เสียงมีความเป็นธรรมชาติ',
        engineContext: 'General Engine',
      },
    ],
    practical: [
      {
        id: 'audio-p-1',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการ Buffer Underrun (เสียงแตกสะดุดกุกกัก) ใน Audio Thread',
        prompt: 'เมื่อเกิดการระเบิดครั้งใหญ่ในเกม เสียงของเกมเกิดอาการกระตุกขาดๆ หายๆ เป็นเสียงหวีดแกรกๆ (Crackling Noise) Profiler เผยว่า Audio Thread กินเวลาเกิน 10ms จนส่งข้อมูลให้ Hardware Buffer ไม่ทัน สาเหตุเชิงสถาปัตยกรรมเกิดจากอะไร?',
        options: [
          'Audio Buffer Underrun: จำนวน Voice และการประมวลผล DSP (Filters/Reverb) มากเกินไปจนคำนวณ Audio Callback ไม่ทันตามรอบนาฬิกาของฮาร์ดแวร์เสียง',
          'ลำโพงคอมพิวเตอร์สกปรก',
          'สายไมโครโฟนพันกัน',
          'หน่วยความจำ SSD ทำงานช้า'
        ],
        correctAnswer: 0,
        hint: 'เมื่อเธรดคำนวณเสียงส่งข้อมูลลงบัฟเฟอร์ไม่ทันรอบ ฮาร์ดแวร์จะเล่นความเงียบจนเกิดเสียงแตกสะดุด (Buffer Underrun)',
        explanation: 'Audio Thread มีเส้นตายที่เคร่งครัดระดับเรียลไทม์ (เช่น ต้องส่ง Buffer ทุก 5.3ms สำหรับ 256 samples ที่ 48kHz) หาก Voice มากเกินไปจะเกิด Underrun ทันที จึงต้องมี Voice Limiter เคร่งครัด',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-2',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Voice Virtualization ใน Sound Engine ระดับมืออาชีพ (Wwise / FMOD)',
        prompt: 'ระบบ Voice Virtualization ในเอนจินเสียงระดับ AAA (เช่น Wwise หรือ FMOD) ทำงานอย่างไรกับเสียงที่อยู่ไกลสายตาเกินกว่าจะได้ยิน?',
        options: [
          'เปลี่ยนสถานะของเสียงเป็น Virtual Voice: หยุดการถอดรหัสไฟล์และหยุดประมวลผล DSP แต่ยังคงเดินเวลาตัวนับตำแหน่งเพลง (Playback Position) ในหน่วยความจำ เมื่อเดินเข้ามาใกล้ค่อยสลับกลับมารันเสียงจริง',
          'ลบไฟล์เสียงทิ้งจากฮาร์ดดิสก์',
          'ลดระดับเสียงให้ติดลบ 1,000 เดซิเบล',
          'สั่งปิดลำโพงของผู้เล่น'
        ],
        correctAnswer: 0,
        hint: 'นับเวลาในใจแบบเงียบๆ โดยไม่เปลืองรอบ CPU ถอดรหัสหรือคำนวณ Reverb',
        explanation: 'Virtual Voice ช่วยประหยัด CPU 99% สำหรับเสียงนับพันเสียงในโลกเปิด โดยไม่ต้องเสียตำแหน่งความต่อเนื่องของเสียงเพลงหรือเสียงรอบข้าง',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-3',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ลำดับขั้นตอน Audio Concurrency Resolution Pipeline',
        prompt: 'เรียงลำดับขั้นตอนเมื่อมีคำขอเล่นเสียงเอฟเฟกต์ใหม่เข้ามาในระบบเสียง:',
        options: [
          'ตรวจสอบโควต้าของ Concurrency Group (เช่น กลุ่ม Explosion จำกัดไว้ 3 เสียง)',
          'หากยังไม่เต็ม ให้เปิดช่อง Voice ใหม่และเริ่มเล่นทันที',
          'หากเต็มแล้ว ให้เปรียบเทียบระดับความสำคัญ (Priority) และความดัง/ระยะทาง',
          'ขโมยช่องเสียงที่ด้อยค่าที่สุด (Voice Stealing) ด้วยการสั่ง Crossfade Out อย่างนุ่มนวล'
        ],
        correctAnswer: [
          'ตรวจสอบโควต้าของ Concurrency Group (เช่น กลุ่ม Explosion จำกัดไว้ 3 เสียง)',
          'หากยังไม่เต็ม ให้เปิดช่อง Voice ใหม่และเริ่มเล่นทันที',
          'หากเต็มแล้ว ให้เปรียบเทียบระดับความสำคัญ (Priority) และความดัง/ระยะทาง',
          'ขโมยช่องเสียงที่ด้อยค่าที่สุด (Voice Stealing) ด้วยการสั่ง Crossfade Out อย่างนุ่มนวล'
        ],
        hint: 'เช็คโควต้ากลุ่ม -> ถ้าว่างก็เล่น -> ถ้าเต็มเช็ค Priority -> ตัดเสียงที่ด้อยสุด',
        explanation: 'นี่คือขั้นตอน Voice Management: Group Capacity Check -> Direct Play or Steal Evaluation -> Soft Fadeout Release',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-4',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Lookahead Limiter และ Dynamic Range Compression',
        prompt: 'เพื่อป้องกันไม่ให้เสียงระเบิดหลายลูกรวมกันแล้วเกิดสัญญาณคลิปตัดยอดคลื่น (Hard Clipping) ใน Master Output Bus เครื่องมือใดใน Audio Mixer ที่จำเป็นที่สุด?',
        options: [
          'Lookahead Peak Limiter และ Dynamic Range Compressor',
          'High Pass Filter ความถี่ 20,000Hz',
          'การสลับสายลำโพงซ้ายขวา',
          'ตัวแปลงสัญญาณเสียงเป็นตัวหนังสือ'
        ],
        correctAnswer: 0,
        hint: 'Limiter กดเพดานยอดคลื่นเสียงไม่ให้ล้น 0 dBFS โดยมองล่วงหน้าเสี้ยววินาที',
        explanation: 'Peak Limiter ตรวจจับยอดคลื่นล่วงหน้าและกดระดับสัญญาณลงอย่างนุ่มนวล ป้องกันการเกิด Digital Distortion แตกพล่านบนลำโพงได้อย่างสมบูรณ์',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-5',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Re-trigger Cooldown และ Comb Filtering Prevention',
        prompt: 'หากเสียงดาบฟันศัตรูถูกเรียกเล่นซ้อนทับกันที่เวลาต่างกันเพียง 1-2 มิลลิวินาที จะเกิดปัญหาทางสวนศาสตร์ฟิสิกส์ใด และแก้อย่างไร?',
        options: [
          'เกิด Comb Filtering (คลื่นหักล้างกันจนเสียงกลวงแปลกๆ); แก้โดยตั้งค่า Re-trigger Cooldown ขั้นต่ำ (เช่น 30-50ms) สำหรับเสียงที่มาจากแหล่งเดียวกัน',
          'เกิดการลัดวงจรในหม้อแปลงไฟฟ้า',
          'เสียงจะเดินทางย้อนเวลากลับสู่อดีต',
          'เอนจินจะลืมชื่อของผู้เล่น'
        ],
        correctAnswer: 0,
        hint: 'คลื่นเสียงที่ซ้อนกันเกือบพอดีจะหักล้างเฟสกันเอง (Phase Cancellation / Comb Filtering)',
        explanation: 'การบังคับ Cooldown ระยะสั้นป้องกัน Phase Cancellation ที่ทำให้เสียงฟังดูเบาบางและกลวง พร้อมทั้งช่วยประหยัด Voice Concurrency อีกด้วย',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-6',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์การจัดสรร Priority Buckets ใน Audio Mixer',
        prompt: 'ในฉากต่อสู้อันดุเดือดที่มีเสียงระเบิดและเสียงปืนกล 50 เสียง ปรากฏว่าเสียงเตือน "พลังชีวิตเหลือน้อย (Low Health Beep)" และเสียงเพื่อนร่วมทีมพูดในวิทยุถูกตัดหายไป วิธีจัดโครงสร้าง Mixer ที่ถูกต้องคืออะไร?',
        options: [
          'จัดกลุ่ม Priority Hierarchy: เสียง UI และบทสนทนาสำคัญให้อยู่ในโควต้า Non-stealable / Critical Priority ส่วนเสียงกระสุนและเอฟเฟกต์อยู่ใน Low Priority ที่ถูกตัดทิ้งได้',
          'เพิ่มเสียงปืนกลให้ดังกลบเสียงเตือนชีวิต',
          'ปิดระบบเสียงเอฟเฟกต์ทั้งหมดตลอดทั้งเกม',
          'เพิ่มจำนวนลำโพงในห้องนั่งเล่น'
        ],
        correctAnswer: 0,
        hint: 'เสียงของ UI และเนื้อเรื่องต้องไม่มีวันถูกแย่งช่องโดยเสียงกระสุน',
        explanation: 'การแบ่งชั้นความสำคัญ (Priority Buckets) รับประกันว่า Gameplay Critical Audio จะได้รับช่อง Voice ก่อนเสมอ และไม่ถูกเสียงบรรยากาศหรือกระสุนปืนแย่งโควต้า',
        engineContext: 'General Engine',
      },
      {
        id: 'audio-p-7',
        topicId: 'audio-concurrency',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Lock-Free Audio Callback Synchronization',
        prompt: 'ทำไมในระดับ Low-level C++ Audio Programming เราจึง "ห้าม" ใช้ `std::mutex::lock()` หรือเรียก `malloc/new` ภายใน Audio Callback Thread เด็ดขาด?',
        options: [
          'เพราะ Mutex อาจติด Priority Inversion และ `malloc` อาจติด OS Memory Lock ทำให้ Audio Thread ชะงักและเกิด Buffer Underrun ทันที จึงต้องใช้ Lock-free Queues และ Pre-allocated Buffers เท่านั้น',
          'เพราะชิปการ์ดเสียงไม่เข้าใจภาษา C++',
          'เพราะฮาร์ดดิสก์จะหยุดหมุนทันที',
          'เพราะระบบจะบังคับปิดหน้าจอเกม'
        ],
        correctAnswer: 0,
        hint: 'Audio Callback ต้องทำงานแบบ Real-time ห้ามมีคำสั่งใดที่อาจถูกบล็อกหรือต้องรอระบบปฏิบัติการ',
        explanation: 'กฎเหล็กของ Real-time Audio Programming: ห้าม Lock, ห้าม Allocate, ห้าม I/O ภายใน Callback Loop เด็ดขาด เพื่อรับประกัน Deadline ความเร็วของเสียง',
        engineContext: 'C++ / Low-Level',
      },
    ],
  },

  // =========================================================================
  // 14. ASYNC LOADING & SCENE STREAMING
  // =========================================================================
  'async-loading': {
    topicId: 'async-loading',
    beginner: [
      {
        id: 'async-b-1',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'ทำไมการโหลดแบบ Synchronous ถึงทำให้เกมค้าง',
        prompt: 'หากโหลดไฟล์ฉากขนาดใหญ่แบบ Synchronous บน Main Thread จะทำให้ Main Thread ถูกบล็อกจนเกมเกิดอาการ ___BLANK___ ชั่วขณะ:',
        codeSnippet: `// โค้ดที่อันตราย:
SceneManager.LoadScene("BigWorld"); // บล็อกเธรดหลัก เกิดอาการ ___BLANK___ ทันที!`,
        options: ['ค้างกระตุกสนิท (Freeze / Hitch)', 'เร่งความเร็ว 10 เท่า', 'เปลี่ยนเพลงประกอบ', 'รีบูตคอมพิวเตอร์'],
        correctAnswer: 'ค้างกระตุกสนิท (Freeze / Hitch)',
        hint: 'ภาพเกมจะหยุดนิ่งไม่ขยับและไม่ตอบสนองต่อปุ่มกด',
        explanation: 'การโหลดแบบ Synchronous บังคับให้ Main Thread ต้องหยุดรออ่านข้อมูลจากดิสก์ ทำให้ไม่สามารถประมวลผลเฟรมถัดไปได้ เกมจึงค้างจนกว่าจะโหลดเสร็จ',
        engineContext: 'General Engine',
      },
      {
        id: 'async-b-2',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ฟังก์ชันโหลดฉากแบบ Asynchronous ใน Unity',
        prompt: 'ใน Unity หากต้องการโหลดฉากใหม่เบื้องหลังโดยไม่ให้หน้าจอเกมค้าง ต้องใช้ฟังก์ชันใด?',
        options: [
          'SceneManager.LoadSceneAsync()',
          'SceneManager.LoadScene()',
          'Application.Quit()',
          'Destroy(gameObject)'
        ],
        correctAnswer: 0,
        hint: 'มีคำว่า Async ต่อท้ายชื่อฟังก์ชัน',
        explanation: '`SceneManager.LoadSceneAsync()` ย้ายการอ่านไฟล์และโหลดข้อมูลไปทำบน Background Worker Threads ทำให้หน้าจอเกมเพลย์หรือ Loading Screen ยังคงขยับได้ลื่นไหล',
        engineContext: 'Unity',
      },
      {
        id: 'async-b-3',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การอ่านค่าความคืบหน้าของเปอร์เซ็นต์การโหลด (Loading Progress)',
        prompt: 'การนำค่า progress ของ AsyncOperation (ค่าระหว่าง 0.0 ถึง 1.0) มาอัปเดตแถบ Progress Bar:',
        codeSnippet: `IEnumerator loadLevel() {
  AsyncOperation op = SceneManager.LoadSceneAsync("Level2");
  while (!op.isDone) {
    progressBar.value = ___BLANK___; // อ่านความคืบหน้าระหว่าง 0.0 ถึง 1.0
    yield return null;
  }
}`,
        options: ['op.progress', 'op.priority', '100', '0'],
        correctAnswer: 'op.progress',
        hint: 'ตัวแปร progress เก็บเปอร์เซ็นต์ความคืบหน้าของการโหลด',
        explanation: '`op.progress` คืนค่าทศนิยมของความคืบหน้าในการโหลดฉาก ซึ่งนิยมนำมาคูณ 100 เพื่อแสดงผลบนหน้าจอ Loading Bar',
        engineContext: 'Unity',
      },
      {
        id: 'async-b-4',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'concept-fill',
        title: 'การแบ่งโลกเกมออกเป็นส่วนๆ (Level Streaming)',
        prompt: 'เทคนิคที่แบ่งแผนที่โลกขนาดใหญ่ออกเป็นชิ้นย่อยๆ แล้วโหลดเข้า-ออกอัตโนมัติตามตำแหน่งตัวละคร เรียกว่า Level ___BLANK___:',
        codeSnippet: `// การเดินทางในโลกเปิดแบบไร้รอยต่อ:
// ก้าวเข้าโซนป่า -> สตรีมโหลดป่า
// ก้าวออกจากถ้ำ -> สตรีมปลดถ้ำออกจากแรม`,
        options: ['Streaming (สตรีมมิ่งฉาก)', 'Baking', 'Packaging', 'Compiling'],
        correctAnswer: 'Streaming (สตรีมมิ่งฉาก)',
        hint: 'Level Streaming สตรีมชิ้นส่วนแผนที่เข้าออกอย่างต่อเนื่อง',
        explanation: 'Level Streaming (หรือ World Partitioning) ทำให้เกมมีแผนที่กว้างใหญ่ไร้รอยต่อได้โดยไม่ต้องเสียเวลาติดหน้าจอ Loading Screen คั่นกลางฉาก',
        engineContext: 'General Engine',
      },
      {
        id: 'async-b-5',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ตัวแปร `allowSceneActivation` ใน Unity Async Loading',
        prompt: 'หากตั้งค่า `asyncOperation.allowSceneActivation = false;` ใน Unity จะเกิดอะไรขึ้น?',
        options: [
          'เอนจินจะโหลดฉากเตรียมไว้ในหน่วยความจำจนถึง 90% แต่จะยังไม่สลับหน้าจอจนกว่าเราจะสั่งให้เป็น true',
          'เอนจินจะยกเลิกการโหลดฉากและลบเกมทิ้ง',
          'เกมจะรีเซ็ตค่ากลับไปที่จุดเริ่มต้น',
          'หน้าจอจะดับลงทันที'
        ],
        correctAnswer: 0,
        hint: 'เปิดโอกาสให้ฉากโหลดเสร็จเบื้องหลัง แล้วรอให้ผู้เล่นกดปุ่ม "Press Any Key to Continue"',
        explanation: '`allowSceneActivation = false` ใช้สำหรับหน้าจอที่ต้องการรอผู้เล่นกดปุ่มเริ่ม โดยโหลดของ 90% เตรียมไว้ก่อน แล้วค่อยเปิดฉากพร้อมกันเมื่อพร้อม',
        engineContext: 'Unity',
      },
      {
        id: 'async-b-6',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'code-block-fill',
        title: 'การปลดปล่อย Asset ที่ไม่ได้ใช้งานออกจากหน่วยความจำ',
        prompt: 'คำสั่งใดใน Unity ที่ใช้สั่งให้ GC ตรวจสอบและปลด Asset ที่ไม่มีใครอ้างอิงถึงออกจากแรม:',
        codeSnippet: `public void cleanUnusedMemory() {
  ___BLANK___; // ปลด Asset เก่าออกจากหน่วยความจำ
}`,
        options: ['Resources.UnloadUnusedAssets()', 'Application.Quit()', 'Camera.main.clear()', 'System.GC.WaitForPendingFinalizers()'],
        correctAnswer: 'Resources.UnloadUnusedAssets()',
        hint: 'Unload Unused Assets ปลดปล่อยทรัพยากรที่ไม่ได้ใช้',
        explanation: '`Resources.UnloadUnusedAssets()` กวาดล้าง Texture, Audio, และ Mesh ที่ไม่มี Object ในฉากอ้างอิงถึง เพื่อคืนพื้นที่หน่วยความจำ',
        engineContext: 'Unity',
      },
      {
        id: 'async-b-7',
        topicId: 'async-loading',
        difficulty: 'beginner',
        format: 'multiple-choice',
        title: 'ทำไมแถบ Loading Bar มักจะหยุดค้างอยู่ที่ 90% ชั่วครู่',
        prompt: 'ใน Unity เมื่อโหลดฉากผ่าน `LoadSceneAsync()` ทำไมหลอดโหลดมักวิ่งไปถึง 0.9 (90%) แล้วหยุดนิ่งชั่วครู่ก่อนกระโดดไป 1.0?',
        options: [
          'เพราะ 0.9 คือจุดสิ้นสุดของการอ่านไฟล์จากดิสก์ ส่วนช่วง 0.9 ถึง 1.0 คือขั้นตอนการเปิดระบบในฉาก (Awake/Start calls และ Shader Initialization)',
          'เพราะอินเทอร์เน็ตหลุดตอน 90%',
          'เพราะฮาร์ดดิสก์เกิดความร้อนสูง',
          'เป็นข้อผิดพลาดที่คอมไพเลอร์จงใจสร้างขึ้น'
        ],
        correctAnswer: 0,
        hint: '90% แรกคือการโหลดข้อมูลดิบ ช่วงที่เหลือคือการนำข้อมูลมาสร้างจริงบน Main Thread',
        explanation: 'Unity จองช่วง 0.9 ถึง 1.0 ไว้สำหรับการ Activation สลับฉากและการรัน Awake/Start บนเธรดหลัก จึงดูเหมือนหลอดค้างที่ 90% ชั่วขณะ',
        engineContext: 'Unity',
      },
    ],
    practical: [
      {
        id: 'async-p-1',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการเฟรมกระตุก 200ms ตอนสลับฉาก แม้จะใช้ LoadSceneAsync แล้ว',
        prompt: 'ทีมงานใช้ `LoadSceneAsync` โหลดฉากเบื้องหลังอย่างดี แต่ในวินาทีที่สั่ง `allowSceneActivation = true;` หน้าจอเกมกลับเกิดอาการกระตุกค้างรุนแรง 200ms สาเหตุเชิงสถาปัตยกรรมเกิดจากอะไร?',
        options: [
          'Main Thread Instantiation & Shader Compilation: เมื่อเปิดฉาก เอนจินต้องรันฟังก์ชัน `Awake()` และ `OnEnable()` ของ GameObject นับพันตัวบน Main Thread พร้อมทั้งอัปโหลด Mesh และคอมไพล์ Shader เข้า GPU พร้อมกันในเฟรมเดียว',
          'ผู้เล่นกะพริบตาพร้อมกันพอดี',
          'ฮาร์ดดิสก์เสียบสายสลับด้าน',
          'ระบบเสียงของวินโดวส์ขัดข้อง'
        ],
        correctAnswer: 0,
        hint: 'แม้การอ่านดิสก์จะทำแบบ Async แต่การสั่ง Awake() และส่งข้อมูลเข้า GPU ยังคงกระจุกตัวอยู่บนเธรดหลักในเฟรมแรก',
        explanation: 'Scene Activation บีบให้ Main Thread ต้องรัน Awake/Start และ Bind Shader ในเฟรมเดียว แนวทางแก้คือทำ Warmup Shader ล่วงหน้า และกระจายการ Instantiate ออกเป็นช่วงๆ (Time-sliced Spawning)',
        engineContext: 'Unity',
      },
      {
        id: 'async-p-2',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Shader Compilation Stutter และ Shader Variant Collections',
        prompt: 'อาการกระตุกครั้งแรกที่มีการปล่อยสกิลเวทมนตร์ (Shader Compilation Hitch) ในเกมคอมพิวเตอร์พีซี ป้องกันล่วงหน้าได้อย่างไร?',
        options: [
          'ทำ Shader Warmup ล่วงหน้าตอน Loading Screen โดยใช้ `ShaderVariantCollection.WarmUp()` เพื่อบังคับให้ไดรเวอร์การ์ดจอคอมไพล์ Shader Variants ทั้งหมดไว้ก่อนเริ่มเล่น',
          'ห้ามใช้เวทมนตร์ในเกม',
          'บังคับให้ผู้เล่นเล่นเกมด้วยการ์ดจอออนบอร์ด',
          'ลดคุณภาพสีของจอภาพลง'
        ],
        correctAnswer: 0,
        hint: 'วอร์มเครื่องคอมไพล์ Shader ล่วงหน้าในหน้าจอโหลด',
        explanation: 'Shader Warmup บังคับให้ไดรเวอร์การ์ดจอบันทึก Shader Binary ลง GPU Cache ล่วงหน้าระหว่างโหลดฉาก ป้องกันอาการกระตุกค้างตอนปล่อยสกิลครั้งแรกกลางเกมเพลย์',
        engineContext: 'Unity',
      },
      {
        id: 'async-p-3',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'step-order',
        title: 'ขั้นตอนสถาปัตยกรรม Asset Streaming Pipeline สมัยใหม่',
        prompt: 'เรียงลำดับขั้นตอนของระบบ Asset Streaming จากดิสก์จนถึงการแสดงผลบนจอ:',
        options: [
          'Request & Priority Queue: บันทึกคำขอโหลดและจัดลำดับตามระยะทางจากกล้อง',
          'Async I/O: อ่านข้อมูลไฟล์ที่ถูกบีบอัดจากดิสก์ผ่าน Background Worker Threads',
          'Decompression & Deserialization: คลายการบีบอัดไฟล์ในหน่วยความจำ RAM เบื้องหลัง',
          'GPU Resource Upload & Bind: โอนถ่ายข้อมูลเข้าสู่ VRAM และผูกเข้ากับ Entity ในโลก'
        ],
        correctAnswer: [
          'Request & Priority Queue: บันทึกคำขอโหลดและจัดลำดับตามระยะทางจากกล้อง',
          'Async I/O: อ่านข้อมูลไฟล์ที่ถูกบีบอัดจากดิสก์ผ่าน Background Worker Threads',
          'Decompression & Deserialization: คลายการบีบอัดไฟล์ในหน่วยความจำ RAM เบื้องหลัง',
          'GPU Resource Upload & Bind: โอนถ่ายข้อมูลเข้าสู่ VRAM และผูกเข้ากับ Entity ในโลก'
        ],
        hint: 'เข้าคิวคำขอ -> อ่านดิสก์เบื้องหลัง -> คลายการบีบอัด -> ส่งเข้าการ์ดจอ',
        explanation: 'นี่คือขั้นตอนมาตรฐาน: Request Queue -> Async Read -> Threaded Decompress -> GPU Resource Creation',
        engineContext: 'General Engine',
      },
      {
        id: 'async-p-4',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'World Partitioning ใน Unreal Engine 5',
        prompt: 'ระบบ World Partition ใน Unreal Engine 5 แตกต่างจากการทำ Sub-level Streaming ดั้งเดิมอย่างไร?',
        options: [
          'บันทึกโลกทั้งหมดลงในไฟล์เดียว และแบ่งโลกเป็น Grid เซลล์อัตโนมัติ โดยระบบจะโหลดและนำเซลล์เข้าออกตามระยะสายตาของผู้เล่นโดยที่นักพัฒนาไม่ต้องมานั่งตัดแบ่งแมพด้วยมือ',
          'บังคับให้เกมเล่นได้เฉพาะฉากในร่มเท่านั้น',
          'ลดขนาดของแผนที่ลงเหลือ 1 ตารางเมตร',
          'แปลงโมเดลทั้งหมดให้กลายเป็นไฟล์เสียง'
        ],
        correctAnswer: 0,
        hint: 'แบ่งเซลล์กริดแบบอัตโนมัติโดยสมบูรณ์ และรองรับ One File Per Actor สำหรับการทำงานร่วมกันเป็นทีม',
        explanation: 'World Partition ใน UE5 ตัดปัญหาการบริหารจัดการ Sub-level ที่ยุ่งยาก โดยแบ่งสตรีมมิ่งเป็น Grid อัตโนมัติและรองรับสเกลโลกเปิดขนาดมหึมา',
        engineContext: 'Unreal Engine',
      },
      {
        id: 'async-p-5',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Predictive Streaming ด้วย Velocity Vector',
        prompt: 'ในการทำ Level Streaming สำหรับเกมขับรถความเร็วสูง การใช้เพียง "รัศมีทรงกลมรอบตัวรถ" (Distance Radius) ไม่เพียงพอเพราะอะไร และควรปรับปรุงอย่างไร?',
        options: [
          'รถวิ่งเร็วจนหลุดขอบเขตก่อนโหลดทัน; ต้องใช้ Predictive Streaming ยืดกรวยขอบเขตการโหลดไปข้างหน้าตามทิศทางและความเร็วเวกเตอร์ของรถ (Velocity Vector)',
          'เพราะล้อรถหมุนเร็วกว่าหน่วยความจำ',
          'เพราะรถยนต์ไม่มีระบบ GPS',
          'เพราะรัศมีทรงกลมใช้ได้เฉพาะกับเกมเครื่องบิน'
        ],
        correctAnswer: 0,
        hint: 'ยื่นระยะการโหลดล่วงหน้าไปในทิศทางที่รถกำลังพุ่งไปด้วยความเร็วสูง',
        explanation: 'Predictive Velocity-based Streaming คาดการณ์ว่าผู้เล่นจะไปอยู่ที่ไหนในอีก 3-5 วินาทีข้างหน้า ทำให้ระบบเริ่มสตรีมถนนข้างหน้าล่วงหน้าก่อนที่รถจะพุ่งไปถึง',
        engineContext: 'General Engine',
      },
      {
        id: 'async-p-6',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'bug-diagnostic',
        title: 'วิเคราะห์อาการ Memory Leak เมื่อใช้ Addressables / AssetBundles',
        prompt: 'หลังจากผู้เล่นเล่นเกมผ่านไป 10 ด่าน พบว่าแรมของเครื่องเพิ่มขึ้นเรื่อยๆ จนหลุด Crash ตรวจสอบพบว่าโค้ดมีการเรียก `Addressables.LoadAssetAsync()` ทุกด่านแต่ไม่เคยเรียก `Addressables.Release()` แนวทางแก้ไขที่ถูกต้องคืออะไร?',
        options: [
          'จัดการ Reference Counting ให้ถูกต้อง: ทุกครั้งที่ Load ต้องเก็บ Handle ไว้ และเรียก `Addressables.Release(handle)` เมื่อตัวละครหรือด่านนั้นถูกทำลายทิ้ง',
          'ปิดการใช้งานระบบ Addressables และยัดทุกอย่างลงโฟลเดอร์ Resources',
          'เพิ่ม RAM ของคอมพิวเตอร์ผู้เล่นเป็น 64GB',
          'ลบไฟล์โปรเจกต์ทิ้ง'
        ],
        correctAnswer: 0,
        hint: 'ระบบ Asset จัดการด้วยระบบนับเลขอ้างอิง (Reference Counting) เมื่อเลิกใช้ต้อง Release คืน',
        explanation: 'Addressables อาศัย Reference Counting หากไม่ Release ตัวนับจะไม่เป็นศูนย์ และ Asset ในหน่วยความจำจะไม่ถูก Unload ออกจาก RAM ทำให้เกิด Memory Leak สะสม',
        engineContext: 'Unity',
      },
      {
        id: 'async-p-7',
        topicId: 'async-loading',
        difficulty: 'practical',
        format: 'multiple-choice',
        title: 'Time-Sliced Instantiation (Spawning Queue)',
        prompt: 'เมื่อต้องสร้างศัตรู 300 ตัวในฉากใหม่ เทคนิค Time-Sliced Spawning ช่วยรักษาเฟรมเรต 60 FPS ได้อย่างไร?',
        options: [
          'สร้างคิวรอเกิด และกำหนดงบเวลาในแต่ละเฟรม (เช่น ไม่เกิน 1-2 ms ต่อเฟรม) เมื่อหมดเวลาให้หยุดแล้วยกยอดไปสร้างตัวที่เหลือต่อในเฟรมถัดไปผ่าน Coroutine หรือ Task',
          'สร้างศัตรูทั้งหมดในเฟรมเดียวแล้วสั่งให้จอภาพดับ 1 วินาที',
          'ลดขนาดศัตรูลงเหลือเท่ามด',
          'เปลี่ยนศัตรูให้กลายเป็นตัวหนังสือ'
        ],
        correctAnswer: 0,
        hint: 'สร้างทีละนิดในแต่ละเฟรมไม่ให้เกินงบ Frame Budget',
        explanation: 'Time-slicing กระจายภาระงานสร้าง GameObject ข้ามหลายๆ เฟรม ทำให้ Frametime ไม่กระตุกเกินงบ 16.6ms และผู้เล่นสัมผัสได้ถึงความลื่นไหลตลอดเวลา',
        engineContext: 'General Engine',
      },
    ],
  },
};
