'use client';

import React, { useEffect, useState } from 'react';
import { Play, Plus, Edit, Trash2, CheckCircle2, XCircle, Eye, RefreshCw, Trophy, BookOpen, Layers } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface BlogSelection {
  id: string;
  title: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  category: string;
  blogId: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  isActive: boolean;
}

interface Challenge {
  id: string;
  blogId: string | null;
  blogTitle: string | null;
  title: string;
  description: string;
  questionIds: string[];
  questionSourceType: 'manual' | 'blog' | 'category' | 'random' | 'mixed';
  category: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  isActive: boolean;
  allowRetake: boolean;
  requireVerifiedUser: boolean;
  resultPublished: boolean;
  showOnHome: boolean;
}

export default function ReadRankTab() {
  const [subTab, setSubTab] = useState<'challenges' | 'questions' | 'attempts' | 'leaderboard'>('challenges');
  const [loading, setLoading] = useState(true);

  // Lists
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [blogs, setBlogs] = useState<BlogSelection[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Selected filters
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  // Modals
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Form states - Challenges
  const [cBlogId, setCBlogId] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cQuestionIds, setCQuestionIds] = useState<string[]>([]);
  const [cSourceType, setCSourceType] = useState<'manual' | 'blog' | 'category' | 'random' | 'mixed'>('manual');
  const [cCategory, setCCategory] = useState('General');
  const [cTotalQuestions, setCTotalQuestions] = useState(5);
  const [cTimeLimit, setCTimeLimit] = useState(10);
  const [cStartDate, setCStartDate] = useState('');
  const [cEndDate, setCEndDate] = useState('');
  const [cDuration, setCDuration] = useState(7);
  const [cIsActive, setCIsActive] = useState(true);
  const [cAllowRetake, setCAllowRetake] = useState(false);
  const [cRequireVerified, setCRequireVerified] = useState(true);
  const [cShowOnHome, setCShowOnHome] = useState(true);

  // Form states - Questions
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qCategory, setQCategory] = useState('General');
  const [qBlogId, setQBlogId] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [qPoints, setQPoints] = useState(10);
  const [qIsActive, setQIsActive] = useState(true);

  const loadBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?status=all');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.blogs) {
          setBlogs(json.data.blogs.map((b: any) => ({ id: b.id, title: b.title })));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/read-rank-challenges');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setChallenges(json.data.challenges);
          if (json.data.challenges.length > 0 && !selectedChallengeId) {
            setSelectedChallengeId(json.data.challenges[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/question-bank?limit=100');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setQuestions(json.data.questions);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    if (!selectedChallengeId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/read-rank-challenges/${selectedChallengeId}/attempts`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAttempts(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedChallengeId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/challenges/${selectedChallengeId}/leaderboard`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLeaderboard(json.data.leaderboard);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (subTab === 'challenges') loadChallenges();
    if (subTab === 'questions') loadQuestions();
    if (subTab === 'attempts') loadAttempts();
    if (subTab === 'leaderboard') loadLeaderboard();
  }, [subTab, selectedChallengeId]);

  // Challenge Modals Helpers
  const openChallengeModal = (chal: Challenge | null) => {
    setActiveChallenge(chal);
    if (chal) {
      setCBlogId(chal.blogId || '');
      setCTitle(chal.title);
      setCDescription(chal.description);
      setCQuestionIds(chal.questionIds);
      setCSourceType(chal.questionSourceType);
      setCCategory(chal.category);
      setCTotalQuestions(chal.totalQuestions);
      setCTimeLimit(chal.timeLimitMinutes);
      setCStartDate(chal.startDate.slice(0, 16));
      setCEndDate(chal.endDate.slice(0, 16));
      setCDuration(chal.durationDays);
      setCIsActive(chal.isActive);
      setCAllowRetake(chal.allowRetake);
      setCRequireVerified(chal.requireVerifiedUser);
      setCShowOnHome(chal.showOnHome);
    } else {
      setCBlogId('');
      setCTitle('');
      setCDescription('');
      setCQuestionIds([]);
      setCSourceType('manual');
      setCCategory('General');
      setCTotalQuestions(5);
      setCTimeLimit(10);
      
      const now = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      setCStartDate(now.toISOString().slice(0, 16));
      setCEndDate(nextWeek.toISOString().slice(0, 16));
      setCDuration(7);
      setCIsActive(true);
      setCAllowRetake(false);
      setCRequireVerified(true);
      setCShowOnHome(true);
    }
    // Automatically load questions so they can be selected in the list
    loadQuestions();
    setIsChallengeModalOpen(true);
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle || !cDescription || cQuestionIds.length === 0 || !cStartDate || !cEndDate) {
      alert('Please fill in required fields and select at least 1 question.');
      return;
    }

    const payload = {
      blogId: cBlogId || null,
      title: cTitle,
      description: cDescription,
      questionIds: cQuestionIds,
      questionSourceType: cSourceType,
      category: cCategory,
      totalQuestions: cTotalQuestions,
      timeLimitMinutes: cTimeLimit,
      startDate: new Date(cStartDate).toISOString(),
      endDate: new Date(cEndDate).toISOString(),
      durationDays: cDuration,
      isActive: cIsActive,
      allowRetake: cAllowRetake,
      requireVerifiedUser: cRequireVerified,
      showOnHome: cShowOnHome,
    };

    try {
      let res;
      if (activeChallenge) {
        res = await fetch(`/api/admin/read-rank-challenges/${activeChallenge.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/read-rank-challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsChallengeModalOpen(false);
        loadChallenges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Delete this challenge?')) return;
    try {
      const res = await fetch(`/api/admin/read-rank-challenges/${id}`, { method: 'DELETE' });
      if (res.ok) loadChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublishResult = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/read-rank-challenges/${id}/publish-result`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultPublished: !currentVal }),
      });
      if (res.ok) loadChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  // Question Modals Helpers
  const openQuestionModal = (q: Question | null) => {
    setActiveQuestion(q);
    if (q) {
      setQText(q.questionText);
      setQOptions(q.options);
      setQCorrectIndex(q.correctOptionIndex);
      setQCategory(q.category);
      setQBlogId(q.blogId || '');
      setQDifficulty(q.difficulty);
      setQPoints(q.points);
      setQIsActive(q.isActive);
    } else {
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrectIndex(0);
      setQCategory('General');
      setQBlogId('');
      setQDifficulty('Medium');
      setQPoints(10);
      setQIsActive(true);
    }
    setIsQuestionModalOpen(true);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || qOptions.some((o) => !o.trim()) || !qCategory) {
      alert('Fill in all fields and provide 4 choices.');
      return;
    }

    const payload = {
      questionText: qText,
      options: qOptions,
      correctOptionIndex: qCorrectIndex,
      category: qCategory,
      blogId: qBlogId || null,
      difficulty: qDifficulty,
      points: qPoints,
      isActive: qIsActive,
    };

    try {
      let res;
      if (activeQuestion) {
        res = await fetch(`/api/admin/question-bank/${activeQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsQuestionModalOpen(false);
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question from bank?')) return;
    try {
      const res = await fetch(`/api/admin/question-bank/${id}`, { method: 'DELETE' });
      if (res.ok) loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setCQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-left text-white">
      
      {/* Sub Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border-white/5 pb-4">
        {[
          { id: 'challenges' as const, label: 'Challenges', icon: Play },
          { id: 'questions' as const, label: 'Question Bank', icon: Layers },
          { id: 'attempts' as const, label: 'User Attempts', icon: BookOpen },
          { id: 'leaderboard' as const, label: 'Leaderboards', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive ? 'bg-brand-accent text-white shadow' : 'bg-brand-card-dark text-brand-text-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER VIEW: Challenges */}
      {subTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Manage Timed MCQ Challenges</h3>
            <Button variant="primary" size="sm" onClick={() => openChallengeModal(null)} leftIcon={<Plus className="w-4 h-4" />}>
              Create Challenge
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-brand-text-muted">Loading challenges...</div>
          ) : challenges.length > 0 ? (
            <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                    <th className="p-4">Challenge Info</th>
                    <th className="p-4">Duration & Time</th>
                    <th className="p-4">MCQ Count</th>
                    <th className="p-4">Leaderboard Public</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((c) => (
                    <tr key={c.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                      <td className="p-4 font-bold">
                        <p className="text-white leading-none mb-1">{c.title}</p>
                        <p className="text-[9px] text-brand-text-muted leading-none">Category: {c.category || 'Mixed'}</p>
                      </td>
                      <td className="p-4 font-medium text-white">
                        <p>{c.timeLimitMinutes} min limit</p>
                        <p className="text-[8px] text-brand-text-muted mt-0.5">End: {new Date(c.endDate).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 text-white font-bold">{c.totalQuestions} Questions</td>
                      <td className="p-4">
                        <button
                          onClick={() => togglePublishResult(c.id, c.resultPublished)}
                          className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                            c.resultPublished
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {c.resultPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedChallengeId(c.id);
                            setSubTab('leaderboard');
                          }}
                          className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                          title="View Leaderboard"
                        >
                          <Trophy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openChallengeModal(c)}
                          className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                          title="Edit Challenge"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(c.id)}
                          className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-card border border-brand-border-white/5 rounded-2xl">No challenges open.</div>
          )}
        </div>
      )}

      {/* RENDER VIEW: Question Bank */}
      {subTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Manage Question Bank</h3>
            <Button variant="primary" size="sm" onClick={() => openQuestionModal(null)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Question
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-brand-text-muted">Loading question bank...</div>
          ) : questions.length > 0 ? (
            <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                    <th className="p-4">Question Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Points</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                      <td className="p-4 font-bold text-white max-w-sm truncate">{q.questionText}</td>
                      <td className="p-4 text-brand-accent font-semibold">{q.category}</td>
                      <td className="p-4">{q.difficulty}</td>
                      <td className="p-4 font-bold text-white">{q.points} Pts</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openQuestionModal(q)}
                          className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-card border border-brand-border-white/5 rounded-2xl">Question bank is empty.</div>
          )}
        </div>
      )}

      {/* RENDER VIEW: User Attempts */}
      {subTab === 'attempts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-base font-bold">Review User Submissions</h3>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-brand-text-muted">Loading attempts...</div>
          ) : attempts.length > 0 ? (
            <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                    <th className="p-4">User</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Percentage</th>
                    <th className="p-4">Time Taken</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                      <td className="p-4">
                        <p className="text-white font-bold leading-none mb-1">{a.userName}</p>
                        <p className="text-[10px] text-brand-text-muted leading-none">{a.userEmail}</p>
                      </td>
                      <td className="p-4 text-brand-accent font-extrabold">{a.score} Pts</td>
                      <td className="p-4 text-white font-bold">{Math.round(a.percentage)}%</td>
                      <td className="p-4 text-white">{Math.floor(a.timeTakenSeconds / 60)}m {a.timeTakenSeconds % 60}s</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          a.status === 'submitted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-card border border-brand-border-white/5 rounded-2xl">No attempts recorded for this challenge.</div>
          )}
        </div>
      )}

      {/* RENDER VIEW: Leaderboard */}
      {subTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-base font-bold">Challenge Scoreboard Rankings</h3>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-brand-text-muted">Loading leaderboard...</div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                    <th className="p-4">Rank</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Final Score</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((l) => (
                    <tr key={l.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                      <td className="p-4 font-black text-brand-accent text-sm">#{l.rank}</td>
                      <td className="p-4 flex items-center gap-3">
                        <img src={l.user.avatar} alt={l.user.name} className="w-8 h-8 rounded-full object-cover border border-brand-border-white" />
                        <span className="text-white font-bold">{l.user.name}</span>
                      </td>
                      <td className="p-4 text-white font-bold text-sm">{l.score} Pts</td>
                      <td className="p-4 text-white font-medium">{Math.floor(l.timeTakenSeconds / 60)}m {l.timeTakenSeconds % 60}s</td>
                      <td className="p-4 text-brand-text-muted">{new Date(l.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-card border border-brand-border-white/5 rounded-2xl">Leaderboard is empty. Attempts are not published or user attempts do not exist.</div>
          )}
        </div>
      )}

      {/* Challenge Edit/Add Modal */}
      {isChallengeModalOpen && (
        <Modal isOpen={isChallengeModalOpen} onClose={() => setIsChallengeModalOpen(false)} title={activeChallenge ? 'Edit Challenge Details' : 'Create Challenge'}>
          <form onSubmit={handleChallengeSubmit} className="flex flex-col gap-4 text-left max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Challenge Title *</label>
              <input
                type="text"
                required
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Description *</label>
              <textarea
                required
                rows={2}
                value={cDescription}
                onChange={(e) => setCDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Linked Blog Post</label>
                <select
                  value={cBlogId}
                  onChange={(e) => setCBlogId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                >
                  <option value="">None / General</option>
                  {blogs.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Source Type</label>
                <select
                  value={cSourceType}
                  onChange={(e: any) => setCSourceType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                >
                  <option value="manual">Manual Selection</option>
                  <option value="blog">Blog-Specific</option>
                  <option value="category">Category-Based</option>
                  <option value="random">Random Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Time Limit (Mins)</label>
                <input
                  type="number"
                  value={cTimeLimit}
                  onChange={(e) => setCTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">MCQ Total Count</label>
                <input
                  type="number"
                  value={cTotalQuestions}
                  onChange={(e) => setCTotalQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Category</label>
                <input
                  type="text"
                  value={cCategory}
                  onChange={(e) => setCCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Start Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={cStartDate}
                  onChange={(e) => setCStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">End Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={cEndDate}
                  onChange={(e) => setCEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Checklist of bank questions to link to this challenge */}
            <div className="flex flex-col gap-1 pb-4">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase mb-2">Select Questions to include ({cQuestionIds.length} Selected)</label>
              <div className="border border-brand-border-white/5 rounded-xl bg-brand-card-dark/45 p-3 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                {questions.map((q) => {
                  const isChecked = cQuestionIds.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-[11px] font-semibold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-brand-accent bg-brand-accent/5 text-white'
                          : 'border-brand-border-white/5 bg-brand-card text-brand-text-muted hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{q.questionText} ({q.category} - {q.difficulty})</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border-white/10'
                      }`}>
                        {isChecked && <span className="text-[9px]">✔</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-t border-brand-border-white/5 pt-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={cIsActive} onChange={(e) => setCIsActive(e.target.checked)} className="accent-brand-accent" />
                <label className="text-xs font-semibold">Challenge Active</label>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={cAllowRetake} onChange={(e) => setCAllowRetake(e.target.checked)} className="accent-brand-accent" />
                <label className="text-xs font-semibold">Allow Retakes</label>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={cRequireVerified} onChange={(e) => setCRequireVerified(e.target.checked)} className="accent-brand-accent" />
                <label className="text-xs font-semibold">Verified User Only</label>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={cShowOnHome} onChange={(e) => setCShowOnHome(e.target.checked)} className="accent-brand-accent" />
                <label className="text-xs font-semibold">Display on Home</label>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              {activeChallenge ? 'Save Changes' : 'Create Challenge'}
            </Button>
          </form>
        </Modal>
      )}

      {/* Question Edit/Add Modal */}
      {isQuestionModalOpen && (
        <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} title={activeQuestion ? 'Edit MCQ Question' : 'Add MCQ Question'}>
          <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4 text-left max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Question text *</label>
              <textarea
                required
                rows={3}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
              />
            </div>

            {/* MCQ Choices */}
            <div className="space-y-2">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase block">MCQ Choices (4 Required)</label>
              {qOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-text-muted">{String.fromCharCode(65 + idx)}.</span>
                  <input
                    type="text"
                    required
                    placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...qOptions];
                      updated[idx] = e.target.value;
                      setQOptions(updated);
                    }}
                    className="w-full px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                  />
                  <input
                    type="radio"
                    name="correct-idx"
                    checked={qCorrectIndex === idx}
                    onChange={() => setQCorrectIndex(idx)}
                    className="accent-brand-accent shrink-0"
                    title="Mark as correct choice"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js"
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Difficulty</label>
                <select
                  value={qDifficulty}
                  onChange={(e: any) => setQDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Points Weight</label>
                <input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Linked Blog Post (Optional)</label>
                <select
                  value={qBlogId}
                  onChange={(e) => setQBlogId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                >
                  <option value="">None / Generic</option>
                  {blogs.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" checked={qIsActive} onChange={(e) => setQIsActive(e.target.checked)} className="accent-brand-accent" />
              <label className="text-xs font-semibold">Question Active</label>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              {activeQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </form>
        </Modal>
      )}

    </div>
  );
}
