from __future__ import annotations

from typing import List

from pydantic import BaseModel, ConfigDict, Field


class PatternFinding(BaseModel):
    model_config = ConfigDict(extra="ignore")

    pattern_name: str = ""
    confidence: str = ""
    description: str = ""


class EdgeCaseCoverage(BaseModel):
    model_config = ConfigDict(extra="ignore")

    score: str = "0/5"
    covered: List[str] = Field(default_factory=list)
    not_covered: List[str] = Field(default_factory=list)
    critical_gaps: List[str] = Field(default_factory=list)


class LogicEvaluation(BaseModel):
    model_config = ConfigDict(extra="ignore")

    is_correct: bool = False
    correctness_confidence: str = "0%"
    explanation: str = ""
    edge_cases_coverage: EdgeCaseCoverage = Field(default_factory=EdgeCaseCoverage)


class TimeComplexity(BaseModel):
    model_config = ConfigDict(extra="ignore")

    current: str = ""
    justification: str = ""
    best_case: str = ""
    worst_case: str = ""
    average_case: str = ""


class SpaceComplexity(BaseModel):
    model_config = ConfigDict(extra="ignore")

    current: str = ""
    justification: str = ""
    auxiliary_space: str = ""


class ComparisonEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    time: str = ""
    space: str = ""
    description: str = ""


class ComparisonTable(BaseModel):
    model_config = ConfigDict(extra="ignore")

    current_approach: ComparisonEntry = Field(default_factory=ComparisonEntry)
    optimized_approach: ComparisonEntry = Field(default_factory=ComparisonEntry)


class ComplexityAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")

    time_complexity: TimeComplexity = Field(default_factory=TimeComplexity)
    space_complexity: SpaceComplexity = Field(default_factory=SpaceComplexity)
    comparison_table: ComparisonTable = Field(default_factory=ComparisonTable)
    scalability_impact: str = ""


class PerformanceIssue(BaseModel):
    model_config = ConfigDict(extra="ignore")

    issue: str = ""
    severity: str = ""
    location: str = ""
    impact: str = ""


class OptimizationSuggestion(BaseModel):
    model_config = ConfigDict(extra="ignore")

    suggestion: str = ""
    expected_improvement: str = ""
    difficulty: str = ""
    priority: str = ""


class AlternativeApproach(BaseModel):
    model_config = ConfigDict(extra="ignore")

    approach_name: str = ""
    description: str = ""
    complexity: str = ""
    when_to_use: str = ""


class CodeQuality(BaseModel):
    model_config = ConfigDict(extra="ignore")

    readability_score: int = 0
    maintainability_score: int = 0
    style_score: int = 0
    comments: str = ""
    good_practices: List[str] = Field(default_factory=list)
    bad_practices: List[str] = Field(default_factory=list)


class InterviewPerspective(BaseModel):
    model_config = ConfigDict(extra="ignore")

    would_pass_interview: bool = False
    interview_level: str = ""
    feedback: str = ""
    follow_up_questions: List[str] = Field(default_factory=list)
    hints_for_optimization: List[str] = Field(default_factory=list)


class LearningRecommendations(BaseModel):
    model_config = ConfigDict(extra="ignore")

    concepts_to_review: List[str] = Field(default_factory=list)
    similar_problems: List[str] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)


class RiskAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")

    performance_risk: str = ""
    memory_risk: str = ""
    edge_case_risk: str = ""
    production_readiness: str = ""


class Scoring(BaseModel):
    model_config = ConfigDict(extra="ignore")

    logic_correctness: str = "0/10"
    efficiency: str = "0/10"
    code_quality: str = "0/10"
    scalability: str = "0/10"
    overall_score: str = "0/10"
    grade: str = "F"


class TemplateSimilarity(BaseModel):
    model_config = ConfigDict(extra="ignore")

    resembles_common_pattern: bool = False
    pattern_name: str = ""
    uniqueness_score: str = "0/10"


class ImprovementStep(BaseModel):
    model_config = ConfigDict(extra="ignore")

    target_score: str = ""
    what_to_improve: str = ""
    code_example: str = ""
    key_changes: List[str] = Field(default_factory=list)


class ProgressiveImprovements(BaseModel):
    model_config = ConfigDict(extra="ignore")

    current_score: str = "0/10"
    improvement_path: List[ImprovementStep] = Field(default_factory=list)


class InferredProblem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = ""
    statement: str = ""
    algorithm: str = ""
    expected_input: str = ""
    expected_output: str = ""
    confidence: int = 0


class EvaluationReview(BaseModel):
    model_config = ConfigDict(extra="ignore")

    score: int = 0
    confidence: int = 0
    verdict: str = ""
    logic_score: int = 0
    complexity_score: int = 0
    testcase_score: int = 0
    hardcoding_detected: bool = False
    security_issues: List[str] = Field(default_factory=list)
    feedback: List[str] = Field(default_factory=list)

    inferred_problem: InferredProblem = Field(default_factory=InferredProblem)
    problem_understanding: str = ""
    identified_patterns: List[PatternFinding] = Field(default_factory=list)
    logic_evaluation: LogicEvaluation = Field(default_factory=LogicEvaluation)
    complexity_analysis: ComplexityAnalysis = Field(default_factory=ComplexityAnalysis)
    performance_issues: List[PerformanceIssue] = Field(default_factory=list)
    optimization_suggestions: List[OptimizationSuggestion] = Field(default_factory=list)
    alternative_approaches: List[AlternativeApproach] = Field(default_factory=list)
    code_quality: CodeQuality = Field(default_factory=CodeQuality)
    interview_perspective: InterviewPerspective = Field(default_factory=InterviewPerspective)
    learning_recommendations: LearningRecommendations = Field(default_factory=LearningRecommendations)
    risk_analysis: RiskAnalysis = Field(default_factory=RiskAnalysis)
    scoring: Scoring = Field(default_factory=Scoring)
    improved_code_snippet: str = ""
    overall_feedback: str = ""
    summary: str = ""
    template_similarity: TemplateSimilarity = Field(default_factory=TemplateSimilarity)
    progressive_improvements: ProgressiveImprovements = Field(default_factory=ProgressiveImprovements)
