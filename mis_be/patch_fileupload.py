import re

with open('FileUpload.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import g and log_msg
content = content.replace(
    'from flask import jsonify',
    'from flask import jsonify, g\n\n'
    'def log_msg(msg):\n'
    '    print(msg)\n'
    '    try:\n'
    '        if \"upload_messages\" not in g:\n'
    '            g.upload_messages = []\n'
    '        g.upload_messages.append(msg)\n'
    '    except:\n'
    '        pass\n'
)

# We want to replace print( with log_msg( but only after GetCollection definitions,
# so we avoid replacing [Startup] prints which run outside app context.
# Let's split content by "# /////////////////////////////////////////////////////////////////////////////Voltage"
parts = content.split('# /////////////////////////////////////////////////////////////////////////////Voltage')
if len(parts) == 2:
    header = parts[0]
    body = parts[1]
    
    # Also we need to replace prints in bulk_upsert which is in the header!
    # Let's just replace print( with log_msg( everywhere except the first 4 startup prints.
    # Actually, it's safer to use regex to replace specific ones, or just replace all and let the except: pass in log_msg handle the out-of-context ones!
    # Since log_msg has a try-except, if g is out of context, it will just print(msg) and ignore the error. This is brilliant!
    pass

content = content.replace('print(', 'log_msg(')

# Now fix the returns. They are usually eturn jsonify(op) or eturn jsonify(res).
def replacer(match):
    var_name = match.group(1)
    return f"return jsonify({{'dates': {var_name}, 'messages': getattr(g, 'upload_messages', [])}})"

content = re.sub(r'return jsonify\((res|op)\)', replacer, content)

with open('FileUpload.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('FileUpload.py patched!')
