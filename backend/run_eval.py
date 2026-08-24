import asyncio
import sys
from app.graph.workflow import evaluation_graph as graph_app

async def main():
    state = {
        "language": "python",
        "student_code": "print('Hello, World!')",
        "problem_statement": "",
        "sample_input": "",
        "sample_output": "",
    }
    print("Invoking graph...")
    try:
        result = await graph_app.ainvoke(state)
        print("Success! Keys in result:")
        for k, v in result.items():
            if v is not None:
                if isinstance(v, dict):
                    print(f"  {k}: dict with keys {list(v.keys())}")
                elif isinstance(v, list):
                    print(f"  {k}: list of length {len(v)}")
                else:
                    print(f"  {k}: {type(v)}")
            else:
                print(f"  {k}: None")
        
        print("\nFinal Result payload:")
        print(result.get("final_result"))
        print("\nLogic Result payload:")
        print(result.get("logic_result"))
        print("\nComplexity Result payload:")
        print(result.get("complexity_result"))
    except Exception as e:
        print(f"Error invoking graph: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
