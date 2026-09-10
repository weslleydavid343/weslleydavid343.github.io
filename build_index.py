import os
import json
import re
import sys
import datetime

ARTICLES_DIR = 'content/articles'
ARTICLES_OUTPUT = 'js/articles.json'

PROJECTS_DIR = 'content/projects'
PROJECTS_OUTPUT = 'js/projects.json'

def parse_markdown(filepath, filename):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    metadata = {
        'filename': filename
    }

    # 1. Extract id (optional fallback to file timestamp)
    id_match = re.search(r'^(?:id|ID):\s*(\d+)$', content, re.MULTILINE)
    if id_match:
        metadata['id'] = int(id_match.group(1))
    else:
        metadata['id'] = int(os.path.getmtime(filepath))

    # 2. Extract data or date (optional fallback to file mtime yyyy-mm-dd)
    data_match = re.search(r'^(?:data|date):\s*(.+)$', content, re.MULTILINE)
    if data_match:
        metadata['date'] = data_match.group(1).strip()
    else:
        metadata['date'] = datetime.datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d')
        
    # 3. Extract tags (optional fallback to hashtag search or empty list)
    tags_match = re.search(r'^(?:tags|TAGS):\s*(.+)$', content, re.MULTILINE)
    if tags_match:
        tags_str = tags_match.group(1)
        metadata['tags'] = [t.strip().replace('#', '') for t in tags_str.split() if t.strip()]
    else:
        # Search for inline #tags in content
        found_tags = re.findall(r'#([a-zA-Z0-9_\-]+)', content)
        metadata['tags'] = list(set(found_tags))

    # 4. Extract title from frontmatter, fallback to H1 or filename
    title_match = re.search(r'^title:\s*(.+)$', content, re.MULTILINE)
    if title_match:
        title_raw = title_match.group(1).strip()
        title_raw = title_raw.strip('"\'')
        if title_raw.startswith('# '):
            title_raw = title_raw[2:]
        metadata['title'] = title_raw.strip()
    else:
        h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if h1_match:
            metadata['title'] = h1_match.group(1).strip()
        else:
            metadata['title'] = os.path.splitext(filename)[0]
            
    return metadata

def process_directory(directory, output_file, name_label):
    items = []
    
    if os.path.exists(directory):
        for filename in os.listdir(directory):
            if filename.endswith('.md'):
                filepath = os.path.join(directory, filename)
                try:
                    metadata = parse_markdown(filepath, filename)
                    items.append(metadata)
                except Exception as e:
                    print(f"ERROR in {name_label} ({filename}): {e}")
                    sys.exit(1)
    else:
        print(f"Directory not found: {directory}")
        pass
    
    # Sort by date descending
    items.sort(key=lambda x: x['date'], reverse=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"Index built successfully. {len(items)} {name_label} found.")

def main():
    if not os.path.exists('js'):
        os.makedirs('js')

    process_directory(ARTICLES_DIR, ARTICLES_OUTPUT, "articles")
    process_directory(PROJECTS_DIR, PROJECTS_OUTPUT, "projects")

if __name__ == '__main__':
    main()
