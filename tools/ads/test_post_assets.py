import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import post_assets


class PostAssetsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=post_assets.ROOT / "tools" / "ads")
        self.folder = Path(self.tmp.name)
        (self.folder / "one.jpg").write_bytes(b"test image")
        (self.folder / "two.jpg").write_bytes(b"test image")
        self.manifest_path = self.folder / "input.json"

    def tearDown(self):
        self.tmp.cleanup()

    def base(self):
        return {
            "week": "test-run",
            "posts": [{
                "id": "test-static", "type": "static", "avatar": "ben",
                "theme": "One step", "description": "A grounded test.",
                "image": str(self.folder / "one.jpg"),
                "image_alt": "A beginner learns a movement.",
                "caption": "Learn one step.\n\nComment START for the link.",
                "platforms": ["facebook", "instagram"]
            }]
        }

    def test_static_builds_packets(self):
        data = self.base()
        self.manifest_path.write_text(json.dumps(data), encoding="utf-8")
        posts = post_assets.validate(data, self.manifest_path, post_assets.DEFAULT_PERSONAS)
        output = self.folder / "output"
        post_assets.write_outputs(data, posts, output, self.manifest_path)
        self.assertTrue((output / "posts.md").exists())
        self.assertTrue((output / "review.html").exists())
        self.assertIn("Comment START", (output / "posts.md").read_text(encoding="utf-8"))

    def test_carousel_requires_and_preserves_order(self):
        data = self.base()
        post = data["posts"][0]
        post.update({"id": "test-carousel", "type": "carousel", "slides": [
            {"image": str(self.folder / "one.jpg"), "text": "First", "alt": "First slide."},
            {"image": str(self.folder / "two.jpg"), "text": "Second", "alt": "Second slide."}
        ]})
        post.pop("image")
        posts = post_assets.validate(data, self.manifest_path, post_assets.DEFAULT_PERSONAS)
        self.assertEqual([s["text"] for s in posts[0]["images"]], ["First", "Second"])

    def test_missing_cta_fails(self):
        data = self.base()
        data["posts"][0]["caption"] = "Learn one step."
        with self.assertRaises(post_assets.ManifestError):
            post_assets.validate(data, self.manifest_path, post_assets.DEFAULT_PERSONAS)

    def test_reused_image_fails_by_default(self):
        data = self.base()
        second = dict(data["posts"][0])
        second["id"] = "test-static-two"
        data["posts"].append(second)
        with self.assertRaises(post_assets.ManifestError):
            post_assets.validate(data, self.manifest_path, post_assets.DEFAULT_PERSONAS)

    def test_existing_output_is_protected_by_cli(self):
        data = self.base()
        self.manifest_path.write_text(json.dumps(data), encoding="utf-8")
        output = self.folder / "existing"
        output.mkdir()
        result = post_assets.main(["--input", str(self.manifest_path), "--output", str(output)])
        self.assertEqual(result, 2)


if __name__ == "__main__":
    unittest.main()
