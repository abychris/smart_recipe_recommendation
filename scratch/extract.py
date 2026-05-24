import json

log_path = r"C:\Users\YHARNAM\.gemini\antigravity-ide\brain\f26be553-0ac3-44e2-a7a4-1424e1077b5e\.system_generated\logs\transcript.jsonl"
steps_to_inspect = [160, 166, 170, 172, 174, 178, 182, 186, 190, 194, 198]

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        idx = obj.get("step_index")
        if idx in steps_to_inspect:
            print(f"\n--- STEP {idx} ---")
            if obj.get("tool_calls"):
                for tc in obj["tool_calls"]:
                    name = tc.get("name")
                    args = tc.get("args")
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            pass
                    if isinstance(args, dict):
                        target = args.get("TargetFile", "")
                        print(f"Tool: {name} -> Target: {target}")
                        # Print some info about keys in args
                        keys = list(args.keys())
                        print(f"Keys: {keys}")
                        if "CodeContent" in args:
                            print(f"CodeContent Length: {len(args['CodeContent'])}")
                        if "ReplacementContent" in args:
                            print(f"ReplacementContent Length: {len(args['ReplacementContent'])}")
