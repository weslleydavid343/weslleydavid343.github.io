import os
from PIL import Image

ASSETS_DIR = 'assets'

def convert_to_webp():
    if not os.path.exists(ASSETS_DIR):
        print(f"Directory {ASSETS_DIR} not found.")
        return

    files = sorted(os.listdir(ASSETS_DIR))
    converted_count = 0

    for filename in files:
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and not filename.startswith('.'):
            file_path = os.path.join(ASSETS_DIR, filename)
            name_without_ext = os.path.splitext(filename)[0]
            webp_filename = f"{name_without_ext}.webp"
            webp_path = os.path.join(ASSETS_DIR, webp_filename)

            try:
                with Image.open(file_path) as img:
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGBA")
                    else:
                        img = img.convert("RGB")
                    img.save(webp_path, "WEBP", quality=85, optimize=True)
                    print(f"Converted: {filename} -> {webp_filename}")
                    converted_count += 1
            except Exception as e:
                print(f"Error converting {filename}: {e}")

    print(f"\nTotal converted to WebP: {converted_count} images.")

if __name__ == '__main__':
    convert_to_webp()
