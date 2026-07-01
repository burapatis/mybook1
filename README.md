# มาตรฐานวิชาชีพครู: ฐานความรู้สำหรับครูมืออาชีพในศตวรรษที่ 21

ตำราออนไลน์ประกอบการสอนรายวิชามาตรฐานวิชาชีพครู ครอบคลุมมาตรฐานความรู้วิชาชีพครู 6 ด้านตามข้อบังคับคุรุสภา (ฉบับที่ 4) พ.ศ. 2562

**เว็บไซต์:** https://burapatis.github.io/mybook1/

## โครงสร้างโปรเจกต์

```
content/           เนื้อหาตำรา (Markdown)
layouts/           เทมเพลตปรับแต่ง (breadcrumb, sidebar)
static/images/     ภาพปกและโลโก้
themes/hugo-book/  Hugo Book theme (git submodule)
hugo.toml          การตั้งค่า Hugo
```

## ความต้องการของระบบ

- [Hugo Extended](https://gohugo.io/installation/) 0.163.3 ขึ้นไป
- Git

## การพัฒนาในเครื่อง

```bash
# โคลนโปรเจกต์พร้อม theme
git clone --recurse-submodules https://github.com/burapatis/mybook1.git
cd mybook1

# รันเซิร์ฟเวอร์พัฒนา
hugo server -D

# Build สำหรับ production
hugo --minify
```

ผลลัพธ์จะอยู่ในโฟลเดอร์ `public/`

## การ Deploy

เมื่อ push ไปที่ branch `main` GitHub Actions จะ build ด้วย Hugo และ deploy ไปยัง branch `gh-pages` โดยอัตโนมัติ

ตั้งค่า GitHub Pages ของ repository ให้ใช้:
- **Source:** Deploy from a branch
- **Branch:** `gh-pages` / `/ (root)`

## การแก้ไขเนื้อหา

แก้ไขไฟล์ใน `content/chapters/` แล้วรัน `hugo server` เพื่อดูตัวอย่าง

โครงสร้างเนื้อหา: คำนำ · บทที่ 1–15 · บรรณานุกรม · ดัชนี (แยกไฟล์ `16-บรรณานุกรม.md`, `17-ดัชนี.md`)

ไฟล์ `textbook_teacher_professional_standards.md` เป็นเอกสารต้นฉบับรวมทุกบท ใช้อ้างอิงหรือ sync กับ `content/chapters/` ได้
