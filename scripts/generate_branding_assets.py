import os
from PIL import Image

BRAIN_DIR = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\365a2cab-f4be-45e4-917b-90f1b911fbaf"
ICON_SRC = os.path.join(BRAIN_DIR, "audira_desk_mobile_icon_1792355597427.jpg")
BANNER_SRC = os.path.join(BRAIN_DIR, "audira_desk_brand_banner_1792355583538.jpg")
APP_ICON_SRC = os.path.join(BRAIN_DIR, "audira_desk_app_icon_1792355569038.jpg")

WORKSPACE = r"F:\AUDIRA-REMOTE-DEKSTOP"

def process_branding():
    print("[*] Processing Audira Desk branding assets...")
    img_icon = Image.open(ICON_SRC).convert("RGBA")
    img_banner = Image.open(BANNER_SRC).convert("RGB")
    img_app_icon = Image.open(APP_ICON_SRC).convert("RGB")

    # 1. Output directories
    res_dir = os.path.join(WORKSPACE, "res")
    flutter_assets = os.path.join(WORKSPACE, "flutter", "assets")
    web_dir = os.path.join(WORKSPACE, "web")
    web_images = os.path.join(web_dir, "images")
    os.makedirs(web_images, exist_ok=True)
    os.makedirs(flutter_assets, exist_ok=True)

    # 2. Windows icon (.ico) multi-layer
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_path = os.path.join(res_dir, "icon.ico")
    img_icon.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"[+] Saved Windows multi-res icon: {ico_path}")

    # Copy to portable builder icon if needed
    win_runner_ico = os.path.join(WORKSPACE, "flutter", "windows", "runner", "resources", "app_icon.ico")
    if os.path.exists(os.path.dirname(win_runner_ico)):
        img_icon.save(win_runner_ico, format="ICO", sizes=ico_sizes)
        print(f"[+] Saved Flutter Windows app_icon.ico: {win_runner_ico}")

    # 3. High-res PNG icons
    img_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "icon.png"), "PNG")
    img_icon.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(flutter_assets, "icon.png"), "PNG")
    img_icon.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "128x128.png"), "PNG")
    img_icon.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "64x64.png"), "PNG")
    img_icon.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "32x32.png"), "PNG")

    # 4. Web branding assets
    img_icon.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(web_images, "icon-192.png"), "PNG")
    img_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(web_images, "icon-512.png"), "PNG")
    img_banner.resize((1200, 675), Image.Resampling.LANCZOS).save(os.path.join(web_images, "banner.jpg"), "JPEG", quality=92)
    img_app_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(web_images, "app-logo.jpg"), "JPEG", quality=92)

    # 5. Flutter horizontal logo
    banner_logo = img_banner.resize((300, 169), Image.Resampling.LANCZOS)
    banner_logo.save(os.path.join(flutter_assets, "logo.png"), "PNG")

    print("[+] All icons, banners, and logos successfully generated & placed!")

if __name__ == "__main__":
    process_branding()
