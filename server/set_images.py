"""ضع الصور في public/img/products/ باسم رقم المنتج (مثلا 1.jpg أو 25.png أو 40.webp)
ثم شغّل:  python3 server/set_images.py
السكربت بيربط كل صورة بالمنتج بتاعها في db.json (بدون ما يلمس باقي البيانات)."""
import json, os
root = os.path.join(os.path.dirname(__file__), '..')
db_path = os.path.join(root, 'server', 'db.json')
img_dir = os.path.join(root, 'public', 'img', 'products')
exts = ['jpg', 'jpeg', 'png', 'webp']
db = json.load(open(db_path, encoding='utf-8'))
changed = missing = 0
for p in db['products']:
    found = next((f"{p['id']}.{e}" for e in exts if os.path.exists(os.path.join(img_dir, f"{p['id']}.{e}"))), None)
    if found:
        new = '/img/products/' + found
        if p['image'] != new:
            p['image'] = new; changed += 1
    else:
        missing += 1
json.dump(db, open(db_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'تم تحديث {changed} منتج. منتجات لسه صورتها القديمة: {missing}')
