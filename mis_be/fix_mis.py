import re

with open('mis.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(\"return jsonify({'status': \\\"success\\\", 'dates': res})\", \"return res\")

with open('mis.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('mis.py VoltageFileInsert fixed!')
