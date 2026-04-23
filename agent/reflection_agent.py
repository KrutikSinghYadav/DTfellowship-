import json
import re
import sys
import argparse

class EnvDict:
    """Wrapper to allow dot-notation access to dicts for eval()."""
    def __init__(self, data):
        self._data = data
        
    def __getattr__(self, name):
        val = self._data.get(name)
        if isinstance(val, dict):
            return EnvDict(val)
        return val if val is not None else 0

def interpolate(text, answers):
    """Replaces {NODE_ID.answer} with the actual answer string."""
    return re.sub(r'\{([A-Za-z0-9_]+)\.answer\}', lambda m: answers.get(m.group(1), ''), text)

def run_agent(tree_path, automated_answers=None):
    try:
        with open(tree_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {tree_path}")
        return
        
    nodes = {n['id']: n for n in data.get('nodes', [])}
    
    current_node_id = 'START'
    answers = {}
    signals = {}
    
    print("\n" + "="*50)
    print(" THE DAILY REFLECTION TREE ".center(50))
    print("="*50 + "\n")
    
    auto_idx = 0
    
    while current_node_id:
        node = nodes.get(current_node_id)
        if not node:
            print(f"\n[Error] Node '{current_node_id}' not found.")
            break
            
        node_type = node.get('type')
        text = interpolate(node.get('text', ''), answers)
        
        if node_type == 'start':
            print(text)
            print("-" * 50)
            current_node_id = node.get('target')
            
        elif node_type == 'question':
            print(f"\n{text}")
            options = node.get('options', [])
            for i, opt in enumerate(options):
                print(f"  {i+1}. {opt['text']}")
                
            selected_idx = -1
            if automated_answers is not None and auto_idx < len(automated_answers):
                selected_idx = automated_answers[auto_idx]
                print(f"\n> Selected: {selected_idx + 1} (Auto)")
                auto_idx += 1
            else:
                while True:
                    try:
                        choice = input("\nSelect an option (number): ")
                        idx = int(choice) - 1
                        if 0 <= idx < len(options):
                            selected_idx = idx
                            break
                        else:
                            print("Invalid choice.")
                    except ValueError:
                        print("Please enter a number.")
            
            selected_opt = options[selected_idx]
            answers[current_node_id] = selected_opt['text']
            
            # process signal
            sig = selected_opt.get('signal')
            if sig:
                axis, pole = sig.split(':')
                if axis not in signals:
                    signals[axis] = {}
                signals[axis][pole] = signals[axis].get(pole, 0) + 1
                
            current_node_id = node.get('target')
            
        elif node_type == 'decision':
            rules = node.get('rules', [])
            env = {
                'answers': EnvDict(answers),
                'signals': EnvDict(signals)
            }
            routed = False
            for rule in rules:
                cond = rule.get('condition')
                if cond == 'default':
                    current_node_id = rule.get('target')
                    routed = True
                    break
                else:
                    try:
                        # eval is safe here because we fully control the tree JSON and the environment
                        if eval(cond, {}, env):
                            current_node_id = rule.get('target')
                            routed = True
                            break
                    except Exception as e:
                        print(f"Eval error on '{cond}': {e}")
            if not routed:
                print("\n[Error] Decision node hit a dead end.")
                current_node_id = None
                
        elif node_type == 'reflection':
            print(f"\n[REFLECTION]")
            print(text)
            if automated_answers is None:
                input("\nPress Enter to continue...")
            else:
                print("\n(Auto-continuing...)")
            print("-" * 50)
            current_node_id = node.get('target')
            
        elif node_type == 'bridge':
            print(f"\n[TRANSITION]")
            print(text)
            print("-" * 50)
            current_node_id = node.get('target')
            
        elif node_type == 'summary':
            print(f"\n=== SUMMARY ===")
            print(text)
            current_node_id = node.get('target')
            
        elif node_type == 'end':
            print(f"\n{text}\n")
            current_node_id = None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the Daily Reflection Tree Agent")
    parser.add_argument('--tree', default='reflection-tree.json', help='Path to the tree JSON file')
    parser.add_argument('--auto', type=str, help='Comma separated list of 1-indexed choices for automated testing (e.g., "1,2,1")')
    args = parser.parse_args()
    
    automated = [int(x)-1 for x in args.auto.split(',')] if args.auto else None
    run_agent(args.tree, automated)
