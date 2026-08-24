from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.agents.adversarial_agent import evaluate_adversarial
from app.agents.complexity_agent import evaluate_complexity
from app.agents.feedback_agent import generate_feedback
from app.agents.hardcoding_agent import detect_hardcoding
from app.agents.intent_detection_agent import detect_intent
from app.agents.judge_agent import judge_evaluation
from app.agents.logic_agent import evaluate_logic
from app.agents.security_agent import evaluate_security
from app.agents.testcase_agent import evaluate_testcases
from app.graph.state import EvaluationState


def build_evaluation_graph():
    graph = StateGraph(EvaluationState)
    graph.add_node("intent_detection_agent", detect_intent)
    graph.add_node("logic_agent", evaluate_logic)
    graph.add_node("testcase_agent", evaluate_testcases)
    graph.add_node("complexity_agent", evaluate_complexity)
    graph.add_node("hardcoding_agent", detect_hardcoding)
    graph.add_node("security_agent", evaluate_security)
    graph.add_node("adversarial_agent", evaluate_adversarial)
    graph.add_node("feedback_agent", generate_feedback)
    graph.add_node("judge_agent", judge_evaluation)

    graph.add_edge(START, "intent_detection_agent")
    
    # Fan-out: intent_detection runs first, then we branch to all intermediate agents in parallel
    graph.add_edge("intent_detection_agent", "logic_agent")
    graph.add_edge("intent_detection_agent", "testcase_agent")
    graph.add_edge("intent_detection_agent", "complexity_agent")
    graph.add_edge("intent_detection_agent", "hardcoding_agent")
    graph.add_edge("intent_detection_agent", "security_agent")
    graph.add_edge("intent_detection_agent", "adversarial_agent")

    # Fan-in: feedback_agent waits for all parallel intermediate agents to finish
    graph.add_edge("logic_agent", "feedback_agent")
    graph.add_edge("testcase_agent", "feedback_agent")
    graph.add_edge("complexity_agent", "feedback_agent")
    graph.add_edge("hardcoding_agent", "feedback_agent")
    graph.add_edge("security_agent", "feedback_agent")
    graph.add_edge("adversarial_agent", "feedback_agent")

    # Final summary/judge
    graph.add_edge("feedback_agent", "judge_agent")
    graph.add_edge("judge_agent", END)

    return graph.compile()
