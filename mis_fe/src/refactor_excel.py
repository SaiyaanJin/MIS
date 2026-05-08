import os
import re

components = [
    "demand.js", "Exchange.js", "frequency.js", "generator.js", 
    "ict.js", "isgs.js", "lines.js", "mvar.js", "thermalGenerator.js", "voltage.js"
]

target_dir = r"d:\test\MIS\mis_fe\src\Components"

for comp in components:
    filepath = os.path.join(target_dir, comp)
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove exportGraphToExcel function
    start_idx = content.find("const exportGraphToExcel = (data, label) => {")
    if start_idx != -1:
        end_str = ".xlsx`);\n    };\n"
        end_idx = content.find(end_str, start_idx)
        if end_idx == -1:
             end_str = ".xlsx`);\r\n    };\r\n"
             end_idx = content.find(end_str, start_idx)
        if end_idx != -1:
             content = content[:start_idx] + content[end_idx + len(end_str):]
             
    # 2. Add import
    if "import { exportGraphToExcel }" not in content:
        content = re.sub(r'(import React.*?\n)', r'\1import { exportGraphToExcel } from "../graphs/_chartUtils";\n', content, count=1)

    # 3. Remove unused imports
    content = re.sub(r'import\s+\*\s+as\s+XLSX\s+from\s+["\']xlsx["\'];?[\r\n]*', '', content)
    content = re.sub(r'import\s+\{\s*saveAs\s*\}\s+from\s+["\']file-saver["\'];?[\r\n]*', '', content)
    
    # 4. Fix function calls
    prefix = comp.split('.')[0].capitalize()
    
    content = re.sub(r'(YYYYMMDD"\)`)\)\}', rf'\1, "{prefix}")}}', content)
    content = re.sub(r'(exportGraphToExcel\([\w_]+,\s*lbl)(\))', rf'\1, "{prefix}"\2', content)

    # Also clean up the random // -- Excel Export Comments
    content = re.sub(r'// ─── Excel Export ─────────────────────────────────────────────────────────[\r\n]*', '', content)
    content = re.sub(r'// ── Excel Export ──────────────────────────────────────────────────────────[\r\n]*', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {comp}")
