import re

with open('FileUpload.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'from flask import jsonify',
    'from flask import jsonify, g\n\n'
    'def log_msg(msg):\n'
    '    print(msg)\n'
    '    try:\n'
    '        if "upload_messages" not in g:\n'
    '            g.upload_messages = []\n'
    '        g.upload_messages.append(msg)\n'
    '    except:\n'
    '        pass\n'
)

content = content.replace('print(', 'log_msg(')

def replacer(match):
    var_name = match.group(1)
    return f"return jsonify({{'dates': {var_name}, 'messages': getattr(g, 'upload_messages', [])}})"

content = re.sub(r'return jsonify\((res|op)\)', replacer, content)

with open('FileUpload.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('FileUpload.py patched!')
