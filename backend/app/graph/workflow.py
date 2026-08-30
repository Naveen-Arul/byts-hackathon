from typing import Any
from .builder import build_evaluation_graph

evaluation_graph = build_evaluation_graph()


async def evaluate_code_workflow(
    code: str,
    language: str = "python",
    problem_statement: str = "",
    sample_input: str = "",
    sample_output: str = "",
) -> dict[str, Any]:
    from app.services.evaluator import reset_ollama_circuit_breaker
    reset_ollama_circuit_breaker()

    initial_state = {
        "student_code": code,
        "language": language,
        "problem_statement": problem_statement,
        "sample_input": sample_input,
        "sample_output": sample_output,
    }
    return await evaluation_graph.ainvoke(initial_state)
