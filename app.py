
from flask import Flask, render_template
from pathlib import Path
import re

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
PHOTOS_DIR = BASE_DIR / "static" / "photos"

SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif"
}


def get_photos():

    if not PHOTOS_DIR.exists():
        print("ERROR: Photos folder does not exist:", PHOTOS_DIR)
        return []

    photos = [
        file.name
        for file in PHOTOS_DIR.iterdir()
        if file.is_file()
        and file.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    # Natural numeric sorting: 1, 2, 3 ... 10, 11
    photos.sort(
        key=lambda name: [
            int(part) if part.isdigit() else part.lower()
            for part in re.split(r"(\d+)", name)
        ]
    )

    return photos


@app.route("/")
def home():

    photos = get_photos()

    print(f"Photos detected: {len(photos)}")

    return render_template(
        "index.html",
        photos=photos
    )


@app.route("/health")
def health():

    photos = get_photos()

    return {
        "status": "running",
        "photo_count": len(photos),
        "photos": photos
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)