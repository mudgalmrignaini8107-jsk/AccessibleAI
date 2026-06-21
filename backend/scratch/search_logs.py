import json

log_path = r"C:\Users\USER\.gemini\antigravity\brain\466c4fbf-c222-46f6-b47d-d53f090c413d\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT':
                content = data.get('content', '')
                if 'scanner' in content.lower() or 'metric' in content.lower() or 'real' in content.lower():
                    print(f"--- USER STEP {data.get('step_index')} ---")
                    print(content)
                    print("\n")
        except Exception as e:
            pass
