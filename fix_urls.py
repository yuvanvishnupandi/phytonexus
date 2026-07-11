import os, glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the hardcoded string with the environment variable
    new_content = content.replace('"http://localhost:8000', '(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "')
    new_content = new_content.replace('`http://localhost:8000', '`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            replace_in_file(os.path.join(root, file))
