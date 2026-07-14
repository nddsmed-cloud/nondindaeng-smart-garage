import React from 'react';

// หมวดที่ ๑: บันทึกข้อความ ขออนุมัติแต่งตั้งคณะกรรมการประจำปี
export const Template1 = ({ data, vehicle }: any) => {
  return (
    <div className="print-page p-10 bg-white text-black text-sm" style={{ fontFamily: '"Sarabun", "TH Sarabun PSK", sans-serif' }}>
      <div className="flex items-center gap-4 mb-4">
        <img src="/garuda.png" alt="ตราครุฑ" className="w-16 h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        <h2 className="text-2xl font-bold">บันทึกข้อความ</h2>
      </div>
      <div className="mb-4">
        <p><strong>ส่วนราชการ</strong> กองช่าง เทศบาลตำบลโนนดินแดง โทร. 044 606 253 ต่อ 132</p>
        <p><strong>ที่</strong> บร 53803/ ....................... <strong>วันที่</strong> .....................................................</p>
        <p><strong>เรื่อง</strong> ขอเสนอโปรดพิจารณาลงนามคำสั่งแต่งตั้งผู้รับผิดชอบและคณะกรรมการที่เกี่ยวข้องกับการบำรุงรักษารถ ประจำปีงบประมาณ</p>
      </div>
      <div className="mb-4">
        <p><strong>เรียน</strong> นายกเทศมนตรีตำบลโนนดินแดง (ผ่าน ปลัดเทศบาล)</p>
      </div>
      <div className="space-y-4 mb-8 pl-4">
        <p><strong>๑. ต้นเรื่อง</strong><br/>ด้วยกระทรวงมหาดไทยได้มีหนังสือ ด่วนที่สุด ที่ มท 0808.2/ว 2600 ลงวันที่ 2 มิถุนายน 2569 ซักซ้อมแนวทางปฏิบัติเกี่ยวกับการจัดหาและบำรุงรักษารถของ อปท. เพื่อให้สอดคล้องกับข้อเสนอแนะของคณะกรรมการ ป.ป.ช. ในการป้องกันความเสี่ยงต่อการทุจริต โดยเฉพาะประเด็นการบำรุงรักษาและการจัดการชิ้นส่วนอะไหล่ชำรุด</p>
        <p><strong>๒. ข้อเท็จจริงและข้อพิจารณา</strong><br/>เพื่อให้การบริหารจัดการยานพาหนะส่วนกลางของ กองช่าง เทศบาลตำบลโนนดินแดง ประจำปีงบประมาณ เป็นไปด้วยความเรียบร้อย คล่องตัว ลดขั้นตอนการปฏิบัติงาน กองช่างจึงจัดทำร่างคำสั่งแต่งตั้งคณะกรรมการ แบ่งเป็น ๓ หน้าที่ ดังนี้:<br/>
        ๑. ผู้รับผิดชอบดูแลและควบคุมการใช้รถยนต์ส่วนกลาง ({data.reporterName || '........................................'})<br/>
        ๒. คณะกรรมการ ตรวจสอบและประเมินสภาพยานพาหนะเบื้องต้น ({data.inspectorName || '........................................'})<br/>
        ๓. คณะกรรมการตรวจรับพัสดุ (มีหน้าที่สำคัญในการ "กำชับและเรียกเก็บอะไหล่เดิมที่ชำรุดกลับคืนมา")<br/>
        - {data.committee1 || '........................................'} (ประธานกรรมการ)<br/>
        - {data.committee2 || '........................................'} (กรรมการ)<br/>
        - {data.committee3 || '........................................'} (กรรมการ)</p>
        <p><strong>๓. ข้อเสนอแนะ</strong><br/>จึงเรียนมาเพื่อโปรดพิจารณา หากเห็นชอบ ขอได้โปรดลงนามในร่างคำสั่งแต่งตั้งฯ ที่แนบมาพร้อมนี้</p>
      </div>
      <div className="flex flex-col items-end mr-12 mt-12 space-y-8">
        <div className="text-center">
          <p>(ลงชื่อ).....................................................</p>
          <p>(นายสรพงษ์ พัฒนะแสง)</p>
          <p>ตำแหน่ง ผู้อำนวยการกองช่าง</p>
        </div>
      </div>
    </div>
  );
};

// หมวดที่ ๒: ใบแจ้งซ่อมแซมยานพาหนะ
export const Template2 = ({ data, vehicle }: any) => {
  return (
    <div className="print-page p-10 bg-white text-black text-sm" style={{ fontFamily: '"Sarabun", "TH Sarabun PSK", sans-serif' }}>
      <h2 className="text-xl font-bold text-center mb-6">ใบแจ้งซ่อมแซมและบำรุงรักษายานพาหนะ กองช่างเทศบาลตำบลโนนดินแดง</h2>
      <p className="text-right mb-4">เลขที่แจ้งซ่อม: ........................ / ........................</p>
      
      <div className="border border-black p-4 mb-4">
        <h3 className="font-bold mb-2">ส่วนที่ 1: สำหรับพนักงานขับรถ / ผู้ใช้งาน (ผู้แจ้งเหตุ)</h3>
        <p>ข้าพเจ้า {data.reporterName} ตำแหน่ง ผู้รับผิดชอบยานพาหนะ</p>
        <p>ขอแจ้งซ่อมแซมรถยนต์ ทะเบียน {vehicle.licensePlate} {vehicle.province} เลขไมล์ปัจจุบัน {data.mileage} กม.</p>
        <p>อาการที่พบ: {data.symptoms}</p>
        <div className="text-right mt-4">
          <p>(ลงชื่อ) .................................................. ผู้แจ้ง (วันที่ ......./......./.......)</p>
        </div>
      </div>

      <div className="border border-black p-4 mb-4">
        <h3 className="font-bold mb-2">ส่วนที่ 2: สำหรับผู้ตรวจสอบสภาพรถ (ช่าง/กรรมการประเมิน)</h3>
        <p>จากการตรวจสอบ มีความเห็นว่า:</p>
        <p>[ / ] ต้องซ่อมแซม/เปลี่ยนอะไหล่ คือ {data.partsReplaced}</p>
        <p>ประมาณการค่าใช้จ่าย {data.estimatedCost} บาท</p>
        <p>ข้อเสนอแนะสถานที่ซ่อม:</p>
        <p>[ / ] เข้าอู่นอกทั่วไป ({data.garageReason}) แนะนำอู่: {data.garageName}</p>
        <div className="text-right mt-4">
          <p>(ลงชื่อ) .................................................. ผู้ตรวจสอบ (วันที่ ......./......./.......)</p>
        </div>
      </div>

      <div className="border border-black p-4 mb-4">
        <h3 className="font-bold mb-2">ส่วนที่ 3: สำหรับคณะกรรมการตรวจรับพัสดุ (กรอกเมื่อซ่อมเสร็จ)</h3>
        <p>คณะกรรมการฯ ได้ดำเนินการตรวจรับงานจ้างเสร็จสิ้นแล้ว และขอรับรองว่า:</p>
        <p>[ ] 1. การซ่อมแซมเป็นไปตามรายการ รถยนต์สามารถใช้งานได้ตามปกติ</p>
        <p>[ ] 2. ได้รับคืนอะไหล่/ชิ้นส่วนที่ชำรุดครบถ้วนแล้ว เพื่อนำส่งเจ้าหน้าที่พัสดุลงทะเบียนจำหน่ายต่อไป</p>
        <p>รายการอะไหล่ที่รับคืน : [ ] มีรายการดังนี้ {data.partsReplaced}</p>
        <div className="mt-8 flex justify-between">
          <p>(ลงชื่อ) .................................................. ประธานฯ</p>
          <p>(ลงชื่อ) .................................................. กรรมการ</p>
          <p>(ลงชื่อ) .................................................. กรรมการ</p>
        </div>
      </div>
    </div>
  );
};

// หมวดที่ ๓: ร่างรายละเอียดและข้อกำหนด (TOR)
export const Template3 = ({ data, vehicle }: any) => {
  return (
    <div className="print-page p-10 bg-white text-black text-sm" style={{ fontFamily: '"Sarabun", "TH Sarabun PSK", sans-serif' }}>
      <h2 className="text-xl font-bold text-center mb-6">ร่างรายละเอียดและข้อกำหนด (TOR)<br/>โครงการ/งาน: จ้างซ่อมแซมบำรุงรักษายานพาหนะรถยนต์ส่วนกลาง ทะเบียน {vehicle.licensePlate} {vehicle.province}</h2>
      
      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2">ลำดับ</th>
            <th className="border border-black p-2">รายการ</th>
            <th className="border border-black p-2">จำนวน</th>
            <th className="border border-black p-2">ราคาต่อหน่วย</th>
            <th className="border border-black p-2">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center">1</td>
            <td className="border border-black p-2">{data.partsReplaced} (รวมค่าแรงและภาษี)</td>
            <td className="border border-black p-2 text-center">1</td>
            <td className="border border-black p-2 text-right">{data.estimatedCost}</td>
            <td className="border border-black p-2 text-right">{data.estimatedCost}</td>
          </tr>
          <tr>
            <td colSpan={4} className="border border-black p-2 text-right font-bold">รวมเป็นเงินทั้งสิ้น</td>
            <td className="border border-black p-2 text-right font-bold">{data.estimatedCost}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="font-bold mb-2">ขอบเขตงาน (Scope of Work):</h3>
      <div className="space-y-2 pl-4">
        <p>๑. วัตถุประสงค์: เพื่อซ่อมแซมรถ ทะเบียน {vehicle.licensePlate} {vehicle.province} ให้พร้อมใช้งานอย่างปลอดภัย</p>
        <p>๒. ขอบเขตงาน: {data.partsReplaced} ตามมาตรฐานวิชาชีพช่างยนต์ ใช้อะไหล่มีคุณภาพ</p>
        <p>๓. วงเงินงบประมาณ: {data.estimatedCost} บาท</p>
        <p>๔. กำหนดเวลาส่งมอบ: ภายใน ๗ วัน นับถัดจากได้รับใบสั่งจ้าง</p>
        <p>๕. การตรวจรับงาน: ตรวจความครบถ้วน, สภาพการใช้งานปกติ, และ <strong>ต้องได้รับอะไหล่เก่าคืน</strong></p>
        <p>๖. การรับประกัน: ไม่น้อยกว่า ๓ เดือน</p>
        <p>๗. เงื่อนไขอื่นๆ: ค่าปรับส่งงานล่าช้าร้อยละ ๐.๑๐ ต่อวัน (ไม่ต่ำกว่าวันละ ๑๐๐ บาท)</p>
      </div>

      <div className="mt-16 text-right mr-12">
        <p>(ลงชื่อ) ........................................</p>
        <p>({data.committee1})</p>
        <p>ประธานกรรมการจัดทำ TOR</p>
      </div>
    </div>
  );
};

// หมวดที่ ๔: บันทึกข้อความ รายงานขอจ้างซ่อมแซม
export const Template4 = ({ data, vehicle }: any) => {
  return (
    <div className="print-page p-10 bg-white text-black text-sm" style={{ fontFamily: '"Sarabun", "TH Sarabun PSK", sans-serif' }}>
      <div className="flex items-center gap-4 mb-4">
        <img src="/garuda.png" alt="ตราครุฑ" className="w-16 h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        <h2 className="text-2xl font-bold">บันทึกข้อความ</h2>
      </div>
      <div className="mb-4">
        <p><strong>ส่วนราชการ</strong> กองช่าง เทศบาลตำบลโนนดินแดง โทร. 044 606 253 ต่อ 132</p>
        <p><strong>ที่</strong> บร 53803/ ....................... <strong>วันที่</strong> .....................................................</p>
        <p><strong>เรื่อง</strong> รายงานขอจ้างซ่อมแซมยานพาหนะรถยนต์ส่วนกลาง โดยวิธีเฉพาะเจาะจง</p>
      </div>
      <div className="mb-4">
        <p><strong>เรียน</strong> นายกเทศมนตรีตำบลโนนดินแดง (ผ่าน หัวหน้าเจ้าหน้าที่ / ปลัดเทศบาล)</p>
      </div>
      <div className="space-y-3 mb-8 pl-4">
        <p>ด้วย งานพัสดุ กองช่าง ได้รับบันทึกขออนุมัติซ่อมแซมรถยนต์ ทะเบียน {vehicle.licensePlate} {vehicle.province} วงเงิน {data.estimatedCost} บาท งานพัสดุตรวจสอบแล้วเห็นควรจัดจ้างตามระเบียบฯ พ.ศ. ๒๕๖๐ ข้อ ๒๒ ดังนี้:</p>
        <p>๑. <strong>เหตุผลความจำเป็น:</strong> เพื่อซ่อมแซม {data.symptoms} ให้กลับคืนสภาพดีและปลอดภัย และเป็นไปตามระเบียบกระทรวงมหาดไทยว่าด้วยการใช้และรักษายานพาหนะของ อปท.</p>
        <p>๒. <strong>ขอบเขตของงาน:</strong> จ้างซ่อมแซม {data.partsReplaced} (ตาม TOR)</p>
        <p>๓. <strong>ราคากลาง:</strong> {data.estimatedCost} บาท</p>
        <p>๔. <strong>วงเงินที่จะจ้าง:</strong> เบิกจ่ายจากงบประมาณรายจ่ายประจำปี แผนงานอุตสาหกรรมฯ ของกองช่าง เป็นเงิน {data.estimatedCost} บาท</p>
        <p>๕. <strong>กำหนดเวลาที่ต้องการใช้:</strong> ภายใน ๗ วัน นับถัดจากวันได้รับใบสั่งจ้าง</p>
        <p>๖. <strong>วิธีจ้างและเหตุผล:</strong> วิธีเฉพาะเจาะจง ตาม ม.๕๖ (๒) (ข) และระเบียบฯ ข้อ ๗๙ วรรคสอง</p>
        <p>๗. <strong>หลักเกณฑ์คัดเลือก:</strong> ใช้เกณฑ์ราคาประกอบความคุ้มค่า</p>
        <p>๘. <strong>ผู้ที่ได้รับการคัดเลือก:</strong> {data.garageName} เสนอราคา {data.estimatedCost} บาท</p>
        <p>๙. <strong>คณะกรรมการตรวจรับพัสดุ:</strong> (อ้างอิงคำสั่งประจำปี)</p>
        <p className="pl-6">๙.๑ {data.committee1} (ประธานกรรมการ)<br/>
        ๙.๒ {data.committee2} (กรรมการ)<br/>
        ๙.๓ {data.committee3} (กรรมการ)</p>
        <p><em>(หมายเหตุ: เมื่อคณะกรรมการตรวจรับงานจ้างเรียบร้อยแล้ว ให้เร่งดำเนินการเบิกจ่ายภายใน ๕ วันทำการ)</em></p>
      </div>
      <div className="mt-8 flex flex-col items-end mr-12 space-y-4">
        <div className="text-center">
          <p>(ลงชื่อ) ........................................ เจ้าหน้าที่</p>
          <p>(ลงชื่อ) ........................................ หัวหน้าเจ้าหน้าที่</p>
          <p>(ลงชื่อ) ........................................ ปลัดเทศบาล</p>
        </div>
      </div>
    </div>
  );
};
