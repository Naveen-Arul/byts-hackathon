import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  Home,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  AlertTriangle,
  Lightbulb,
  Star,
  TrendingUp,
  Target,
  BookOpen,
  Shield,
  Award,
  GitBranch,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ReviewResults = () => {
  const location = useLocation();
  const reviewData = location.state?.review;
  const metadata = location.state?.metadata;

  // Utility function to clean markdown code fences from code examples
  const cleanCodeExample = (code: string) => {
    if (!code) return code;
    // Remove markdown code fences (```language and ```)
    return code
      .replace(/^```[\w]*\n?/gm, '')  // Remove opening fence with optional language
      .replace(/\n?```$/gm, '')        // Remove closing fence
      .trim();
  };

  if (!reviewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Review Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No code review data found. Please submit code for review first.
            </p>
            <Link to="/compiler">
              <Button>Go to Compiler</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "bg-green-500";
    if (grade.startsWith('B')) return "bg-blue-500";
    if (grade.startsWith('C')) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">CodeJudge AI</span>
            </Link>
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3 fill-current" />
              AI Review Results
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/compiler">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title & Overall Score */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Code Review Report</h1>
                <p className="text-sm text-muted-foreground">
                  Powered by Groq LLaMA 3.1 8B • {metadata?.language} • {new Date(metadata?.timestamp).toLocaleString()}
                </p>
              </div>
              
              {/* Overall Score Card */}
              {reviewData.scoring && (
                <Card className="min-w-[160px]">
                  <CardContent className="pt-4 pb-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getGradeColor(reviewData.scoring.grade)} text-white text-xl font-bold mb-2`}>
                      {reviewData.scoring.grade}
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {reviewData.scoring.overall_score}
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            {/* Problem Understanding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Problem Understanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{reviewData.problem_understanding}</p>
              </CardContent>
            </Card>

            {/* Identified Patterns - MULTIPLE PATTERNS! */}
            {reviewData.identified_patterns && reviewData.identified_patterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-500" />
                    Identified Algorithm Patterns
                    <Badge>{reviewData.identified_patterns.length} Pattern{reviewData.identified_patterns.length > 1 ? 's' : ''} Detected</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.identified_patterns.map((pattern: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-500/5 rounded-r-lg">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{pattern.pattern_name}</h4>
                          <Badge variant="outline" className="font-mono">
                            {pattern.confidence} confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logic Evaluation with Confidence */}
            {reviewData.logic_evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {reviewData.logic_evaluation.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    Logic Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant={reviewData.logic_evaluation.is_correct ? "default" : "destructive"}>
                      {reviewData.logic_evaluation.is_correct ? "Correct Logic" : "Logic Issues"}
                    </Badge>
                    {reviewData.logic_evaluation.correctness_confidence && (
                      <span className="text-sm text-muted-foreground">
                        Confidence: <strong>{reviewData.logic_evaluation.correctness_confidence}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-foreground">{reviewData.logic_evaluation.explanation}</p>
                  
                  {/* Edge Case Coverage */}
                  {reviewData.logic_evaluation.edge_cases_coverage && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Edge Case Coverage
                        </h4>
                        <Badge variant="outline">
                          {reviewData.logic_evaluation.edge_cases_coverage.score}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {reviewData.logic_evaluation.edge_cases_coverage.covered?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-green-600 mb-2">✓ Covered</h5>
                            <ul className="space-y-1">
                              {reviewData.logic_evaluation.edge_cases_coverage.covered.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {reviewData.logic_evaluation.edge_cases_coverage.not_covered?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-600 mb-2">✗ Not Covered</h5>
                            <ul className="space-y-1">
                              {reviewData.logic_evaluation.edge_cases_coverage.not_covered.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {reviewData.logic_evaluation.edge_cases_coverage.critical_gaps?.length > 0 && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                          <h5 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Critical Gaps
                          </h5>
                          <ul className="space-y-1 text-sm">
                            {reviewData.logic_evaluation.edge_cases_coverage.critical_gaps.map((gap: string, i: number) => (
                              <li key={i} className="text-red-600">• {gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Complexity Analysis */}
            {reviewData.complexity_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Complexity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Comparison Table */}
                  {reviewData.complexity_analysis.comparison_table && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Approach</th>
                            <th className="text-center p-3">Time</th>
                            <th className="text-center p-3">Space</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Current</td>
                            <td className="text-center p-3">
                              <Badge variant="outline" className="font-mono">
                                {reviewData.complexity_analysis.comparison_table.current_approach?.time}
                              </Badge>
                            </td>
                            <td className="text-center p-3">
                              <Badge variant="outline" className="font-mono">
                                {reviewData.complexity_analysis.comparison_table.current_approach?.space}
                              </Badge>
                            </td>
                          </tr>
                          <tr className="bg-green-500/5">
                            <td className="p-3 font-medium text-green-600">Optimized</td>
                            <td className="text-center p-3">
                              <Badge className="bg-green-500 font-mono">
                                {reviewData.complexity_analysis.comparison_table.optimized_approach?.time}
                              </Badge>
                            </td>
                            <td className="text-center p-3">
                              <Badge className="bg-green-500 font-mono">
                                {reviewData.complexity_analysis.comparison_table.optimized_approach?.space}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {reviewData.complexity_analysis.comparison_table.optimized_approach?.description && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          💡 {reviewData.complexity_analysis.comparison_table.optimized_approach.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Scalability Impact */}
                  {reviewData.complexity_analysis.scalability_impact && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Scalability Impact
                      </h4>
                      <p className="text-sm">{reviewData.complexity_analysis.scalability_impact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Performance Issues */}
            {reviewData.performance_issues && reviewData.performance_issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Performance Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {reviewData.performance_issues.map((issue: any, idx: number) => (
                      <li key={idx} className="border-l-4 border-orange-500 pl-4 py-2">
                        {typeof issue === 'string' ? (
                          <p>{issue}</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={issue.severity === 'High' ? 'destructive' : 'secondary'}>
                                {issue.severity}
                              </Badge>
                              <span className="font-medium">{issue.issue}</span>
                            </div>
                            {issue.location && <p className="text-sm text-muted-foreground">📍 {issue.location}</p>}
                            {issue.impact && <p className="text-sm mt-1">💥 {issue.impact}</p>}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Optimization Suggestions */}
            {reviewData.optimization_suggestions && reviewData.optimization_suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Optimization Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {reviewData.optimization_suggestions.map((suggestion: any, idx: number) => (
                      <li key={idx} className="border-l-4 border-yellow-500 pl-4 py-2">
                        {typeof suggestion === 'string' ? (
                          <p>{suggestion}</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{suggestion.priority} Priority</Badge>
                              <Badge variant="secondary">{suggestion.difficulty}</Badge>
                            </div>
                            <p className="font-medium mt-2">{suggestion.suggestion}</p>
                            {suggestion.expected_improvement && (
                              <p className="text-sm text-green-600 mt-1">
                                📈 {suggestion.expected_improvement}
                              </p>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Alternative Approaches */}
            {reviewData.alternative_approaches && reviewData.alternative_approaches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-indigo-500" />
                    Alternative Approaches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.alternative_approaches.map((approach: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-lg mb-2">{approach.approach_name}</h4>
                        <p className="text-sm mb-2">{approach.description}</p>
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <Badge variant="outline">{approach.complexity}</Badge>
                          <span className="text-muted-foreground">Best for: {approach.when_to_use}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview Perspective */}
            {reviewData.interview_perspective && (
              <Card className="border-2 border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Interview Perspective
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={reviewData.interview_perspective.would_pass_interview ? "default" : "destructive"}>
                      {reviewData.interview_perspective.would_pass_interview ? "Would Pass" : "Needs Improvement"}
                    </Badge>
                    <Badge variant="outline">
                      {reviewData.interview_perspective.interview_level} Level
                    </Badge>
                  </div>
                  
                  <p className="text-foreground">{reviewData.interview_perspective.feedback}</p>
                  
                  {reviewData.interview_perspective.follow_up_questions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Follow-up Questions
                      </h4>
                      <ul className="space-y-2">
                        {reviewData.interview_perspective.follow_up_questions.map((q: string, i: number) => (
                          <li key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                            <span className="font-medium text-primary">Q{i + 1}:</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reviewData.interview_perspective.hints_for_optimization?.length > 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold mb-2">💡 Hints</h4>
                      <ul className="space-y-1 text-sm">
                        {reviewData.interview_perspective.hints_for_optimization.map((hint: string, i: number) => (
                          <li key={i}>• {hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Learning Recommendations */}
            {reviewData.learning_recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    Learning Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviewData.learning_recommendations.concepts_to_review?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">📚 Concepts to Review</h4>
                      <div className="flex flex-wrap gap-2">
                        {reviewData.learning_recommendations.concepts_to_review.map((concept: string, i: number) => (
                          <Badge key={i} variant="secondary">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewData.learning_recommendations.similar_problems?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">🎯 Similar Problems</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {reviewData.learning_recommendations.similar_problems.map((problem: string, i: number) => (
                          <li key={i}>{problem}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Risk Analysis */}
            {reviewData.risk_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(reviewData.risk_analysis).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-muted/30 rounded-lg">
                        <h5 className="font-medium capitalize mb-1">
                          {key.replace(/_/g, ' ')}
                        </h5>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scoring Breakdown */}
            {reviewData.scoring && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Scoring Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reviewData.scoring).filter(([key]) => key !== 'overall_score' && key !== 'grade').map(([category, score]: [string, any]) => {
                      const numScore = typeof score === 'string' ? parseInt(score.split('/')[0]) : score;
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-2">
                            <span className="capitalize font-medium">
                              {category.replace(/_/g, ' ')}
                            </span>
                            <span className={`font-bold ${getScoreColor(numScore)}`}>
                              {score}
                            </span>
                          </div>
                          <Progress value={numScore * 10} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Quality */}
            {reviewData.code_quality && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Code Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {reviewData.code_quality.readability_score && (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(reviewData.code_quality.readability_score)}`}>
                          {reviewData.code_quality.readability_score}
                        </div>
                        <div className="text-sm text-muted-foreground">Readability</div>
                      </div>
                    )}
                    {reviewData.code_quality.maintainability_score && (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(reviewData.code_quality.maintainability_score)}`}>
                          {reviewData.code_quality.maintainability_score}
                        </div>
                        <div className="text-sm text-muted-foreground">Maintainability</div>
                      </div>
                    )}
                    {reviewData.code_quality.style_score && (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(reviewData.code_quality.style_score)}`}>
                          {reviewData.code_quality.style_score}
                        </div>
                        <div className="text-sm text-muted-foreground">Style</div>
                      </div>
                    )}
                  </div>

                  {reviewData.code_quality.comments && (
                    <p className="text-muted-foreground">{reviewData.code_quality.comments}</p>
                  )}

                  {(reviewData.code_quality.good_practices?.length > 0 || 
                    reviewData.code_quality.bad_practices?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {reviewData.code_quality.good_practices?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-600 mb-2">✓ Good Practices</h5>
                          <ul className="space-y-1 text-sm">
                            {reviewData.code_quality.good_practices.map((practice: string, i: number) => (
                              <li key={i} className="text-muted-foreground">• {practice}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reviewData.code_quality.bad_practices?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-600 mb-2">✗ Issues</h5>
                          <ul className="space-y-1 text-sm">
                            {reviewData.code_quality.bad_practices.map((practice: string, i: number) => (
                              <li key={i} className="text-muted-foreground">• {practice}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Improved Code */}
            {reviewData.improved_code_snippet && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Key Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono">{reviewData.improved_code_snippet}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Template Similarity */}
            {reviewData.template_similarity && (
              <Card>
                <CardHeader>
                  <CardTitle>Code Pattern Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      {reviewData.template_similarity.resembles_common_pattern ? (
                        <p className="text-sm">
                          Resembles: <strong>{reviewData.template_similarity.pattern_name}</strong>
                        </p>
                      ) : (
                        <p className="text-sm">Unique implementation approach</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Uniqueness: {reviewData.template_similarity.uniqueness_score}/10
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progressive Improvements - NEW FEATURE! */}
            {reviewData.progressive_improvements && reviewData.progressive_improvements.improvement_path && (
              <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-500/5 to-blue-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                      Progressive Improvement Path
                    </CardTitle>
                    <Badge variant="outline" className="text-lg">
                      Current: {reviewData.progressive_improvements.current_score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Step-by-step code improvements to increase your score from {reviewData.progressive_improvements.current_score} to 9-10/10
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviewData.progressive_improvements.improvement_path.map((step: any, idx: number) => {
                      // Safe extraction with defaults
                      const targetScore = step.target_score || `${idx + 7}/10`;
                      const scoreNumber = targetScore.split('/')[0];
                      
                      return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative pl-8 pb-6 border-l-4 border-green-500"
                      >
                        {/* Score Badge */}
                        <div className="absolute -left-6 top-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {scoreNumber}
                        </div>

                        {/* Content */}
                        <div className="ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-green-600 text-sm">
                              Target: {targetScore}
                            </Badge>
                          </div>

                          <h4 className="text-base font-semibold mb-2">
                            {step.what_to_improve || 'Optimization Step'}
                          </h4>

                          {/* Key Changes */}
                          {step.key_changes && step.key_changes.length > 0 && (
                            <div className="mb-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <h5 className="font-medium text-xs text-blue-600 mb-1.5">🔑 Key Changes:</h5>
                              <ul className="space-y-1 text-xs">
                                {step.key_changes.map((change: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Code Example */}
                          {step.code_example && (
                            <div className="relative">
                              <div className="absolute top-2 right-2 z-10">
                                <Badge variant="secondary" className="text-xs">
                                  {targetScore}
                                </Badge>
                              </div>
                              <pre className="bg-slate-950 text-slate-50 p-3 rounded-lg overflow-x-auto text-xs border border-green-500/20 max-w-full">
                                <code className="font-mono whitespace-pre block">{cleanCodeExample(step.code_example)}</code>
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Connector line to next step */}
                        {idx < reviewData.progressive_improvements.improvement_path.length - 1 && (
                          <div className="absolute left-0 bottom-0 w-0.5 h-6 bg-gradient-to-b from-green-500 to-transparent" />
                        )}
                      </motion.div>
                    )})}

                    {/* Final Achievement Message */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30 text-center">
                      <Award className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                      <h3 className="text-lg font-bold mb-1">🎯 Goal: Excellence</h3>
                      <p className="text-xs text-muted-foreground">
                        Follow these progressive improvements to achieve a top score!
                        Each step builds on the previous one.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Feedback */}
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-lg leading-relaxed">{reviewData.overall_feedback}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReviewResults;
