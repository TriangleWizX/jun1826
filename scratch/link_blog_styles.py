import os

def main():
    blog_dir = 'blog'
    count = 0
    updated_files = []
    
    # We want to insert these unhashed links. The fingerprint-assets script will hash them.
    blog_styles = '\n<link href="/assets/css/blog.min.css" rel="stylesheet"/>\n<link href="/assets/css/blog-cro.min.css" rel="stylesheet"/>\n'
    
    for root, dirs, files in os.walk(blog_dir):
        for file in files:
            if file == 'index.html':
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if already has blog-cro.css or blog-cro.min.css (hashed or unhashed)
                if 'blog-cro.css' in content or 'blog-cro.min' in content:
                    continue
                
                # Insert right before </head>
                if '</head>' in content:
                    new_content = content.replace('</head>', f'{blog_styles}</head>')
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
                    updated_files.append(filepath)
                else:
                    print(f"Warning: </head> tag not found in {filepath}")
                    
    print(f"Successfully linked blog stylesheets in {count} files.")
    for uf in updated_files:
        print(f" - {uf}")

if __name__ == '__main__':
    main()
