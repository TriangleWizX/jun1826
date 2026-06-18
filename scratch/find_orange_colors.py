import os
import re
import colorsys

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    if len(hex_str) == 6:
        return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return None

def rgb_to_hsl(r, g, b):
    # normalize to 0-1
    r_n, g_n, b_n = r / 255.0, g / 255.0, b / 255.0
    h, l, s = colorsys.rgb_to_hls(r_n, g_n, b_n)
    # colorsys returns HLS, convert to HSL (H is same, S is same, L is same but positions differ)
    return h * 360, s * 100, l * 100

def is_orange(h, s, l):
    # Orange hue is typically between 15 and 45 degrees
    # and saturation should be reasonably high to be considered orange rather than neutral/brownish
    # and lightness not too dark (which would be brown) and not too light (which would be peach/cream)
    if 10 <= h <= 45:
        if s > 30: # Saturation > 30%
            if 30 <= l <= 75: # Lightness between 30% and 75%
                return True
    return False

def scan_files():
    color_hex_pattern = re.compile(r'#([0-9a-fA-F]{3,6})')
    color_rgb_pattern = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')
    
    print("Scanning codebase for orange colors...")
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root or '.antigravitycli' in root or 'tmp' in root or 'archive' in root:
            continue
        for file in files:
            if not file.endswith(('.css', '.html', '.js')):
                continue
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except Exception as e:
                continue
            
            # Find hex colors
            hex_matches = color_hex_pattern.findall(content)
            for hex_val in hex_matches:
                rgb = hex_to_rgb(hex_val)
                if rgb:
                    h, s, l = rgb_to_hsl(*rgb)
                    if is_orange(h, s, l):
                        print(f"[HEX ORANGE] {file_path}: #{hex_val} -> RGB{rgb} -> HSL({h:.1f}, {s:.1f}%, {l:.1f}%)")
            
            # Find RGB colors
            rgb_matches = color_rgb_pattern.findall(content)
            for r, g, b in rgb_matches:
                r, g, b = int(r), int(g), int(b)
                h, s, l = rgb_to_hsl(r, g, b)
                if is_orange(h, s, l):
                    print(f"[RGB ORANGE] {file_path}: rgb({r},{g},{b}) -> HSL({h:.1f}, {s:.1f}%, {l:.1f}%)")

if __name__ == '__main__':
    scan_files()
