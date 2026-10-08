# 🎮 GameDev Engine Lab

เว็บสื่อการสอน Game Development ที่ออกแบบมาเพื่อให้เข้าใจกลไกการทำงานของเกมเอนจินทั้ง **"แบบเข้าใจง่าย (ELI5)"**, **"แบบเชิงลึกระดับฮาร์ดแวร์ (Deep Dive)"**, **"ตัวอย่างโค้ด (C#/C++/Unity)"**, **"Interactive Simulation & Performance Benchmark"** และ **"แบบทดสอบวัดความรู้ 2 ระดับ"** รันสดบนเบราว์เซอร์ 60 FPS พร้อมเสียงเอฟเฟกต์สังเคราะห์ (Web Audio API)

---

## 🚀 Key Features

### 1. 3 Explanation Tiers for Every Topic
* 🌱 **แบบเข้าใจง่าย (ELI5 / Beginner)**: อธิบายด้วยภาพเปรียบเทียบในชีวิตประจำวัน (Real-world Analogy) ที่เห็นภาพชัดเจน พร้อมสรุป 4 ประเด็นสำคัญ และทำไมสิ่งนี้ถึงส่งผลต่อ Game Feel ของผู้เล่น
* ⚡ **แบบเชิงลึก (Deep Dive / Engine Architecture)**: เจาะลึกระดับ Low-Level Hardware, Memory Heap/Stack, L1/L2/L3 Cache Lines (64 Bytes), Generational Garbage Collector, Big-O Complexity, Math Formulas, และการทำงานภายในของเอนจินชั้นนำอย่าง **Unity (DOTS/PhysX)**, **Unreal Engine 5 (Chaos/Mass Entity/Nanite)** และ **Godot 4 (Servers/BVH)**
* 💻 **ตัวอย่างโค้ด & Best Practices**: เปรียบเทียบโค้ด **❌ Bad Pattern (ก่อน Optimize)** เทียบกับ **✅ Optimized Pattern (หลัง Optimize)** แบบเคียงข้างกัน พร้อมคำอธิบายจุดที่ทำให้เกมกระตุก

---

### 2. 🧪 Interactive Simulations & Benchmarks (Live 60 FPS)

| # | Lab & Topic | Simulation | Performance Metrics | Interactive Controls |
|---|---|---|---|---|
| **1** | **Object Pooling vs. Dynamic Allocation** | Bullet Hell Cannon (ยิงกระสุน 1,000 นัด/วินาที) | FPS, Frame Time (ms), Heap Allocations, GC Stop-The-World Pauses, Memory Churn | สลับโหมด Pool vs Dynamic, ปรับอัตราการยิง (50-1200 นัด/s), เปิด/ปิดเสียง |
| **2** | **Spatial Partitioning (Grid) vs. Brute-Force** | การตรวจจับการชนของมอนสเตอร์ 2,500 ตัว ($O(N^2)$ vs $O(N)$) | Collision Checks ต่อเฟรม (3 ล้านคู่ vs 1 หมื่นคู่), Frametime, % การลดภาระ (99.5%) | ปรับจำนวนยูนิต (100-2,500 ตัว), ขนาดช่อง Grid (20-80px), เปิด/ปิด Grid Overlay |
| **3** | **Data-Oriented (ECS / SoA) vs. OOP (AoS)** | Swarm Particle Physics (อนุภาคนับหมื่นชิ้น) ทดสอบ CPU Cache Locality | Update Loop Time (ms), Throughput (ล้านครั้ง/s), RAM Visualizer (AoS vs SoA 64B) | ปรับจำนวนอนุภาค (1,000-16,000 ตัว), เคลื่อนเมาส์ดึงดูดแรงโน้มถ่วง, สลับดูโครงสร้าง RAM |
| **4** | **Fixed Timestep vs. Variable dt** | ยิงลูกบอลความเร็วสูงใส่กำแพงบาง ป้องกันบั๊กทะลุกำแพง (Tunneling) | จำนวนครั้งที่เกิด Tunneling Glitches, การกระดอนที่ถูกต้อง (Deterministic) | ปุ่ม **"💥 Inject 220ms Lag Spike"**, ปรับความเร็วลูกบอล (400-3000px/s), ความหนากำแพง |
| **5** | **GPU Instancing vs. Individual Draw Calls** | ฝูงหินอุกกาบาต 3,500 ชิ้นหมุนวนในอวกาศ | Draw Calls Dispatched (1 Call vs 3,500 Calls), CPU Driver Overhead (ms), FPS | ปรับจำนวนอุกกาบาต (300-3,500 ชิ้น), สลับโหมด Instancing vs Unbatched |
| **6** | **A\* Pathfinding Visualizer** | ตารางเขาวงกต 28x16 ช่อง เปรียบเทียบ A* (Heuristic) vs Dijkstra vs BFS | จำนวน Cells ที่ต้องสำรวจ (Explored Nodes), ความยาวเส้นทาง, เวลาคำนวณ (ms) | **คลิกบนตารางเพื่อวาด/ลบกำแพงได้อิสระ**, สลับอัลกอริทึม A*, Dijkstra, BFS |
| **7** | **AI State Machine (FSM) vs Behavior Trees** | AI หุ่นยนต์ลาดตระเวน พร้อมกรวยสายตา (Vision Cone) และตรวจจับผู้เล่น | ไฟสถานะสว่างตาม State / BT Node ที่ Active แบบเรียลไทม์ (PATROL, CHASE, ATTACK, FLEE) | **คลิกลาก Player สีม่วงเพื่อทดสอบสายตา Guard**, ปุ่มลดเลือดเหลือ 15 HP บังคับหนี |

---

### 3. 📝 Two-Tier Knowledge Assessment Quizzes
* 🎯 **Zero-Typing Interaction**: ตอบด้วยการเลือกชิปบล็อกโค้ด/คำศัพท์ใส่ช่องว่าง (`code-block-fill`), การ์ดตัวเลือก, และการจัดลำดับขั้นตอน ไม่ต้องพิมพ์ข้อความ
* 🎲 **Randomized Question Sampling**: สุ่ม 5 คำถามต่อรอบจากคลังข้อสอบขนาดใหญ่กว่า 200+ ข้อครอบคลุมทั้ง 14 บทเรียน
* ⚖️ **2 Difficulty Tiers**: 
  * 🌱 **Foundational Tier**: ตรวจสอบคอนเซปต์หลัก, คำศัพท์เทคนิค, และการเติมบล็อกคำสั่ง
  * ⚡ **Practical & Engine Tier**: วิเคราะห์ Profiler Bottlenecks, GC Spikes, L1 Cache Misses, และสถาปัตยกรรมระดับฮาร์ดแวร์

---

### 4. 📊 Master Performance Matrix
มี Modal ตารางสรุปภาพรวมของทุกเทคนิค พร้อมเทียบประโยชน์ที่ได้รับ, คอขวดเดิม, ตัวเลขการเพิ่มความเร็ว, และตัวอย่างเกมระดับโลกที่ใช้เทคนิคนั้น (เช่น *Vampire Survivors, StarCraft, The Matrix Awakens, Days Gone, Rocket League, Halo 2*)

---

## 🛠️ Tech Stack

* **Frontend**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4 (ธีม Game Engine Dark IDE สไตล์ Unreal Engine 5 / Unity 6)
* **Graphics & Simulation**: HTML5 Canvas 2D + RequestAnimationFrame 60 FPS
* **Audio Engine**: Web Audio API Procedural Synthesizer (สร้างเสียงคลื่นความถี่แบบไดนามิก ไม่ต้องโหลดไฟล์ mp3 ภายนอก)
* **Icons**: Lucide React
