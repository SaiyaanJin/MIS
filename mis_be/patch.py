import re

with open('mis.py', 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = [
    'VoltageFileInsert', 'LinesFileInsert', 'MVARFileInsert', 'ICTFileInsert',
    'FrequencyFileInsert', 'DemandFileInsert', 'GeneratorFileInsert',
    'ThGeneratorFileInsert', 'ISGSFileInsert', 'ExchangeFileInsert'
]

for ep in endpoints:
    match = re.search(r'def ' + ep + r'\(\):.*?(return [^\n]+)', content, re.DOTALL)
    if match:
        ret_stmt = match.group(1)
        new_ret = f"cache.delete('UploadedDates')\n    {ret_stmt}"
        content = content[:match.start(1)] + new_ret + content[match.end(1):]

with open('mis.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched successfully!')
