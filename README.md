<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c0b36a39-5630-4b1c-9be9-a695c48c736b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## تشغيله كتطبيق Desktop على Windows

> المتطلبات: Windows 10/11 + Node.js 18 أو أعلى.

1. افتح PowerShell داخل **مجلد المشروع نفسه** (ليس `C:\Windows\system32`).
   مثال:
   ```powershell
   cd C:\path\to\king-app
   ```
   إذا ما تعرف المسار:
   - افتح مجلد المشروع من File Explorer.
   - اضغط على شريط العنوان واكتب `powershell` ثم Enter (يفتح PowerShell بنفس المجلد تلقائيًا).
2. تأكد أنك داخل المجلد الصحيح (لازم يظهر فيه `package.json`):
   ```powershell
   dir package.json
   ```
3. ثبّت الحزم:
   `npm install`
4. شغّل نسخة الديسكتوب أثناء التطوير (Vite + Electron معًا):
   `npm run electron:dev`
5. لبناء نسخة Windows حقيقية (Installer + Portable exe):
   `npm run electron:build`
6. لعرض الملفات الناتجة:
   ```powershell
   dir .\dist_electron\
   ```

> ملاحظة: الأمر الصحيح هو `electron:build` وليس `electron:buil`.
>
> ملاحظة مهمة في PowerShell: كتابة `cd` بدون مسار **لا تنقلك** لمجلد المشروع؛ هي فقط تعرض المسار الحالي.

### مخرجات البناء
- `KING-Setup-<version>.exe` (مثبّت NSIS).
- `KING-Setup-<version>-portable.exe` (نسخة محمولة بدون تثبيت).
