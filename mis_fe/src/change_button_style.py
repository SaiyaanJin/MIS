import os
import re

components = [
    "demand.js", "Exchange.js", "frequency.js", "generator.js", 
    "ict.js", "isgs.js", "lines.js", "mvar.js", "thermalGenerator.js", "voltage.js", "combined.js"
]

target_dir = r"d:\test\MIS\mis_fe\src\Components"

success_css = """
  .gen-btn-success {
    background: linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%) !important;
    border: none !important;
    padding: 10px 22px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    border-radius: 10px !important;
    height: 42px !important;
    white-space: nowrap;
    color: #fff !important;
    box-shadow: 0 4px 14px rgba(16,185,129,0.4) !important;
    transition: all 0.2s !important;
  }
  .gen-btn-success:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 22px rgba(16,185,129,0.5) !important;
  }
  .gen-btn-success:disabled,
  .gen-btn-success[disabled] {
    background: var(--bg-main) !important;
    border: 1px solid var(--border-bright) !important;
    color: #94a3b8 !important;
    box-shadow: none !important;
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    transform: none !important;
  }
"""

for comp in components:
    filepath = os.path.join(target_dir, comp)
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the className
    content = content.replace('className="p-button-success"', 'className="gen-btn-success"')

    # 2. Inject the CSS right after .gen-btn-primary:hover block
    if ".gen-btn-success {" not in content:
        # The block looks like:
        # .gen-btn-primary:hover {
        #     transform: translateY(-2px) !important;
        #     box-shadow: 0 8px 22px rgba(255,165,0,0.5) !important;
        #   }
        # We can find `.gen-btn-primary:hover {` and then the closing brace `  }`
        
        # Or simpler, find `.gen-btn-primary:hover` and insert it.
        # Let's use a regex that matches the .gen-btn-primary:hover block.
        pattern = r"(\.gen-btn-primary:hover\s*\{[^}]+\})"
        content = re.sub(pattern, r"\1" + "\n" + success_css, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {comp}")
