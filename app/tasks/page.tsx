'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Search,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Sparkles,
  Loader2,
  X,
  Clock,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  MessageSquare,
  BookOpen,
  Compass,
  Bell,
  BellRing,
  Target,
  Layers,
  Zap,
  RotateCcw,
  Lightbulb,
  Sun,
  Moon,
  CalendarDays,
} from 'lucide-react';
import {
  getTasks,
  saveTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  syncTasksWithCloud,
  setTaskActiveUser,
} from '@/lib/services/taskService';
import { TaskItem, TaskPriority, TaskStatus } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { playReminderChime } from '@/lib/audioUtils';

type ViewFilter = 'roadmap' | 'today' | 'upcoming' | 'completed' | 'all';

interface RoadmapDayGroup {
  day: number;
  topic: string;
  description?: string;
  learningFocus?: string;
  chatQuery?: string;
  dueDate?: string;
  tasks: TaskItem[];
}

const GOAL_SUGGESTIONS = [
  '🐳 Learn Docker in 7 days',
  '⚛️ Master Next.js 15 in 5 days',
  '🐍 Python Basics in 3 days',
  '🎨 Modern UI/UX in 4 days',
  '☁️ AWS Cloud in 7 days',
];

// Clean & Compact Quick Reminder Menu
function TaskReminderMenu({
  task,
  onSetPreset,
  onOpenCustom,
  onClose,
  menuRef,
}: {
  task: TaskItem;
  onSetPreset: (task: TaskItem, preset: string) => void;
  onOpenCustom: (task: TaskItem) => void;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={menuRef as any}
      className="tasks-reminder-popover absolute left-0 sm:left-0 top-full mt-1.5 w-48 rounded-2xl p-1.5 z-50 space-y-0.5 text-xs select-none shadow-xl animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="tasks-reminder-header flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Bell size={11} className="tasks-reminder-item-icon" />
          <span>Remind Me</span>
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition cursor-pointer"
        >
          <X size={11} />
        </button>
      </div>

      <button
        onClick={() => onSetPreset(task, '15m')}
        className="tasks-reminder-item w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Zap size={12} className="tasks-reminder-item-icon" />
          <span>In 15 minutes</span>
        </span>
      </button>

      <button
        onClick={() => onSetPreset(task, '1h')}
        className="tasks-reminder-item w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Clock size={12} className="tasks-reminder-item-icon" />
          <span>In 1 hour</span>
        </span>
      </button>

      <button
        onClick={() => onSetPreset(task, 'evening')}
        className="tasks-reminder-item w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Moon size={12} className="tasks-reminder-item-icon" />
          <span>This evening (6 PM)</span>
        </span>
      </button>

      <button
        onClick={() => onSetPreset(task, 'tomorrow_morning')}
        className="tasks-reminder-item w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Sun size={12} className="tasks-reminder-item-icon" />
          <span>Tomorrow (9 AM)</span>
        </span>
      </button>

      <div className="pt-1 mt-0.5 border-t border-purple-400/15 dark:border-purple-400/20">
        <button
          onClick={() => {
            onClose();
            onOpenCustom(task);
          }}
          className="tasks-reminder-item w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-between text-purple-600 dark:text-purple-300 font-medium"
        >
          <span className="flex items-center gap-2">
            <CalendarDays size={12} className="tasks-reminder-item-icon" />
            <span>Custom date & time...</span>
          </span>
          <ChevronRight size={11} className="opacity-60" />
        </button>

        {task.reminderTime && (
          <button
            onClick={() => onSetPreset(task, 'clear')}
            className="tasks-reminder-clear w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-2 mt-0.5"
          >
            <X size={12} />
            <span>Clear reminder</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Clean Dedicated Modal Dialog for Custom Date & Time Selection
function CustomReminderModal({
  task,
  isOpen,
  onClose,
  onSaveCustom,
}: {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCustom: (task: TaskItem, isoDate: string) => void;
}) {
  const [dateVal, setDateVal] = useState('');
  const [timeVal, setTimeVal] = useState('09:00');

  useEffect(() => {
    if (task) {
      if (task.reminderTime) {
        try {
          const d = new Date(task.reminderTime);
          if (!isNaN(d.getTime())) {
            setDateVal(d.toISOString().split('T')[0]);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            setTimeVal(`${hh}:${mm}`);
            return;
          }
        } catch {}
      }
      // Default to tomorrow 9:00 AM
      const tmrw = new Date(Date.now() + 86400000);
      setDateVal(tmrw.toISOString().split('T')[0]);
      setTimeVal('09:00');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateVal || !timeVal) return;

    try {
      const [year, month, day] = dateVal.split('-').map(Number);
      const [hours, minutes] = timeVal.split(':').map(Number);
      const target = new Date(year, month - 1, day, hours, minutes, 0);

      if (!isNaN(target.getTime())) {
        onSaveCustom(task, target.toISOString());
        onClose();
      }
    } catch {}
  };

  const handleQuickPresetDate = (daysAhead: number, defaultHour: number = 9) => {
    const d = new Date(Date.now() + daysAhead * 86400000);
    setDateVal(d.toISOString().split('T')[0]);
    setTimeVal(`${String(defaultHour).padStart(2, '0')}:00`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="tasks-modal-card relative w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between pb-1 border-b border-purple-400/15 dark:border-purple-400/20">
          <h3 className="tasks-modal-title text-sm font-bold flex items-center gap-2">
            <Bell size={16} className="text-purple-600 dark:text-purple-400" />
            <span>Set Custom Reminder</span>
          </h3>
          <button
            onClick={onClose}
            className="tasks-action-btn p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Task Title Context */}
        <div className="p-2.5 rounded-2xl bg-purple-500/5 border border-purple-400/15">
          <p className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
            For Task:
          </p>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
            {task.title}
          </p>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="space-y-1">
          <label className="tasks-modal-label block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Quick Day:
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickPresetDate(0, 18)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/20 transition cursor-pointer"
            >
              Today Evening (6 PM)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPresetDate(1, 9)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/20 transition cursor-pointer"
            >
              Tomorrow (9 AM)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPresetDate(2, 9)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/20 transition cursor-pointer"
            >
              In 2 Days
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="tasks-modal-label block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select Date
              </label>
              <input
                type="date"
                required
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className="tasks-modal-input w-full px-3 py-2 rounded-2xl text-xs outline-none transition cursor-pointer"
              />
            </div>

            <div>
              <label className="tasks-modal-label block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select Time
              </label>
              <input
                type="time"
                required
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
                className="tasks-modal-input w-full px-3 py-2 rounded-2xl text-xs outline-none transition cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="tasks-action-btn px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-600/30"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Quick Add & AI Generator State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState<'today' | 'tomorrow' | 'someday'>('today');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState('Analyzing curriculum...');

  // Selected Day Filter in Roadmap View ('all' or specific day number)
  const [selectedRoadmapDay, setSelectedRoadmapDay] = useState<number | 'all'>('all');

  // Quick Reminder Popover State
  const [activeReminderTaskId, setActiveReminderTaskId] = useState<string | null>(null);

  // Dedicated Custom Reminder Modal State
  const [customReminderModalTask, setCustomReminderModalTask] = useState<TaskItem | null>(null);

  // Edit Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editReminderPreset, setEditReminderPreset] = useState<string>('none');
  const [editReminderCustom, setEditReminderCustom] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');

  const quickInputRef = useRef<HTMLInputElement>(null);
  const reminderPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setTasks(getTasks());

    if (user?.id) {
      setTaskActiveUser(user.id);
      syncTasksWithCloud(user.id).then((cloud) => {
        if (cloud && Array.isArray(cloud)) setTasks(cloud);
      });
    } else {
      setTaskActiveUser(null);
    }

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTasks(e.detail);
      } else {
        setTasks(getTasks());
      }
    };

    window.addEventListener('nyra_tasks_updated', handleUpdate);
    return () => window.removeEventListener('nyra_tasks_updated', handleUpdate);
  }, [user?.id]);

  // Close reminder menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (reminderPickerRef.current && !reminderPickerRef.current.contains(e.target as Node)) {
        setActiveReminderTaskId(null);
      }
    };
    if (activeReminderTaskId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeReminderTaskId]);

  // Request browser notification permission if available
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  };

  // Periodic Reminder Checker (checks every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const safeTasks = Array.isArray(tasks) ? tasks : [];

      safeTasks.forEach((t) => {
        if (t.reminderTime && !t.reminderSent && t.status !== 'completed') {
          try {
            const remTime = new Date(t.reminderTime).getTime();
            if (!isNaN(remTime) && remTime <= now) {
              updateTask(t.id, { reminderSent: true }, user?.id);

              // Play audio chime
              playReminderChime();

              // Toast alert
              addToast({
                type: 'info',
                title: `⏰ Task Reminder: ${t.title}`,
                description: t.roadmapTopic
                  ? `Day ${t.roadmapDay}: ${t.roadmapTopic}`
                  : t.description || 'This task is due now!',
              });

              // Native Browser Notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`Nyra Reminder: ${t.title}`, {
                  body: t.roadmapTopic ? `Day ${t.roadmapDay}: ${t.roadmapTopic}` : 'Task is due now',
                  icon: '/icon.png',
                });
              }
            }
          } catch {}
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, user?.id, addToast]);

  // Helper date classifiers
  const isDueUpcoming = (dueDate?: string) => {
    if (!dueDate) return false;
    try {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return false;
      const taskDate = d.setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return taskDate > today;
    } catch {
      return false;
    }
  };

  const isDueToday = (dueDate?: string) => {
    if (!dueDate) return false;
    try {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return false;
      const taskDate = d.setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return taskDate === today;
    } catch {
      return false;
    }
  };

  const formatDisplayDate = (dueDate?: string) => {
    if (!dueDate) return null;
    try {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return null;

      const now = new Date();
      const isCurrentYear = d.getFullYear() === now.getFullYear();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDay = new Date(d);
      targetDay.setHours(0, 0, 0, 0);

      const diffDays = Math.round((targetDay.getTime() - today.getTime()) / 86400000);
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';

      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: isCurrentYear ? undefined : 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formatReminderTimeDisplay = (reminderTime?: string) => {
    if (!reminderTime) return null;
    try {
      const d = new Date(reminderTime);
      if (isNaN(d.getTime())) return null;

      const now = new Date();
      const diffMs = d.getTime() - now.getTime();

      if (diffMs < 0) return 'Passed';

      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 60) return `In ${diffMins}m`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const remDay = new Date(d);
      remDay.setHours(0, 0, 0, 0);

      const dayDiff = Math.round((remDay.getTime() - today.getTime()) / 86400000);
      const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      if (dayDiff === 0) return `Today at ${timeStr}`;
      if (dayDiff === 1) return `Tomorrow at ${timeStr}`;

      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch {
      return null;
    }
  };

  // Group tasks for standard tabs
  const { todayTasks, upcomingTasks, completedTasks } = useMemo(() => {
    const today: TaskItem[] = [];
    const upcoming: TaskItem[] = [];
    const completed: TaskItem[] = [];

    const safeTasks = Array.isArray(tasks) ? tasks.filter((t): t is TaskItem => Boolean(t && t.id)) : [];

    safeTasks.forEach((t) => {
      if (t.status === 'completed') {
        completed.push(t);
      } else if (isDueUpcoming(t.dueDate)) {
        upcoming.push(t);
      } else {
        today.push(t);
      }
    });

    return { todayTasks: today, upcomingTasks: upcoming, completedTasks: completed };
  }, [tasks]);

  // Group tasks into structured Day-by-Day Roadmap
  const roadmapGroups = useMemo(() => {
    const safeTasks = Array.isArray(tasks)
      ? tasks.filter((t): t is TaskItem => Boolean(t && t.id && t.roadmapDay))
      : [];
    if (safeTasks.length === 0) return [];

    const map: Record<number, RoadmapDayGroup> = {};

    safeTasks.forEach((t) => {
      const d = t.roadmapDay!;
      if (!map[d]) {
        map[d] = {
          day: d,
          topic: t.roadmapTopic || `Day ${d}`,
          description: t.description,
          learningFocus: t.learningFocus,
          chatQuery: t.chatQuery,
          dueDate: t.dueDate,
          tasks: [],
        };
      }
      map[d].tasks.push(t);
    });

    return Object.values(map).sort((a, b) => a.day - b.day);
  }, [tasks]);

  const hasRoadmap = roadmapGroups.length > 0;
  const totalRoadmapTasks = useMemo(() => {
    return roadmapGroups.reduce((acc, g) => acc + g.tasks.length, 0);
  }, [roadmapGroups]);
  const completedRoadmapTasks = useMemo(() => {
    return roadmapGroups.reduce((acc, g) => acc + g.tasks.filter((t) => t.status === 'completed').length, 0);
  }, [roadmapGroups]);

  // Identify today's roadmap day (if active)
  const todayRoadmapGroup = useMemo(() => {
    if (!hasRoadmap) return null;
    const matchingToday = roadmapGroups.find((g) => isDueToday(g.dueDate));
    if (matchingToday) return matchingToday;
    const firstIncomplete = roadmapGroups.find((g) => g.tasks.some((t) => t.status !== 'completed'));
    return firstIncomplete || roadmapGroups[0];
  }, [hasRoadmap, roadmapGroups]);

  const displayedTasks = useMemo(() => {
    let list: TaskItem[] = [];
    if (activeFilter === 'today') list = todayTasks;
    else if (activeFilter === 'upcoming') list = upcomingTasks;
    else if (activeFilter === 'completed') list = completedTasks;
    else list = Array.isArray(tasks) ? tasks.filter((t): t is TaskItem => Boolean(t && t.id)) : [];

    if (!Array.isArray(list)) return [];
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.roadmapTopic || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }, [activeFilter, todayTasks, upcomingTasks, completedTasks, tasks, searchQuery]);

  // Navigate to Chat with tailored query
  const handleLearnInChat = (topic: string, query?: string) => {
    const targetPrompt =
      query ||
      `Explain "${topic}" for a beginner with clear real-world analogies, step-by-step guidance, and interactive examples.`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nyra_initial_prompt', targetPrompt);
    }
    router.push(`/chat-ui?q=${encodeURIComponent(targetPrompt)}`);
  };

  // Structured AI Plan & Roadmap Generator using dedicated API
  const handleGenerateRoadmap = async (targetGoal: string) => {
    const goalText = targetGoal.trim();
    if (!goalText) return;

    setIsAiLoading(true);
    setAiLoadingStep('Analyzing curriculum & duration...');

    const stepTimer1 = setTimeout(() => setAiLoadingStep('Designing daily milestones...'), 1200);
    const stepTimer2 = setTimeout(() => setAiLoadingStep('Structuring actionable tasks & learning focuses...'), 2400);

    try {
      const res = await fetch('/api/tasks/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalText }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate roadmap: ${res.statusText}`);
      }

      const data = await res.json();
      const plan = data?.plan;

      if (plan?.roadmap && Array.isArray(plan.roadmap) && plan.roadmap.length > 0) {
        let createdCount = 0;
        const now = Date.now();

        plan.roadmap.forEach((dayItem: any) => {
          const dayNum = Number(dayItem.day) || 1;
          const scheduledDate = new Date(now + 86400000 * (dayNum - 1)).toISOString();
          const topic = dayItem.topic || `Day ${dayNum}`;
          const description = dayItem.description || '';
          const learningFocus = dayItem.learningFocus || '';
          const chatQuery =
            dayItem.chatQuery ||
            `Explain ${topic} for a beginner with step-by-step examples and key takeaways.`;
          const dayTasks: any[] = Array.isArray(dayItem.tasks) ? dayItem.tasks : [{ title: topic }];

          dayTasks.forEach((dt: any) => {
            const taskTitle = typeof dt === 'string' ? dt : dt.title || topic;
            const taskPriority = dt.priority === 'high' || dt.priority === 'low' ? dt.priority : 'medium';

            createTask(
              {
                title: taskTitle.trim(),
                description,
                priority: taskPriority,
                status: 'todo',
                dueDate: scheduledDate,
                roadmapDay: dayNum,
                roadmapTopic: topic,
                learningFocus,
                chatQuery,
                category: plan.goalTitle || goalText,
              },
              user?.id
            );
            createdCount++;
          });
        });

        setActiveFilter('roadmap');
        setSelectedRoadmapDay('all');
        addToast({
          type: 'success',
          title: `Roadmap Generated! 🚀`,
          description: `Created ${plan.roadmap.length} daily milestones with ${createdCount} actionable tasks.`,
        });
        setQuickTitle('');
        setIsAiMode(false);
      } else {
        throw new Error('Invalid roadmap payload format');
      }
    } catch (err: any) {
      console.warn('Roadmap API call error:', err);
      createTask({ title: goalText, priority: 'medium' }, user?.id);
      addToast({
        type: 'info',
        title: 'Task Added',
        description: 'Added single task. You can try generating the roadmap again.',
      });
      setQuickTitle('');
      setIsAiMode(false);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAiLoading(false);
    }
  };

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) return;

    if (isAiMode) {
      await handleGenerateRoadmap(quickTitle);
      return;
    }

    // Normal Quick Add
    let targetDueDate: string | undefined = undefined;
    if (quickDate === 'today') {
      targetDueDate = new Date().toISOString();
    } else if (quickDate === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDueDate = tomorrow.toISOString();
    }

    createTask(
      {
        title: quickTitle.trim(),
        priority: 'medium',
        dueDate: targetDueDate,
      },
      user?.id
    );

    addToast({ type: 'success', title: 'Task added ✓' });
    setQuickTitle('');
    quickInputRef.current?.focus();
  };

  const handleToggle = (id: string) => {
    const updated = toggleTaskStatus(id, user?.id);
    if (updated) {
      if (updated.status === 'completed') {
        playReminderChime();
        addToast({
          type: 'info',
          title: 'Task completed ✓',
          description: updated.title,
        });
      } else {
        addToast({ type: 'info', title: 'Task marked active' });
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id, user?.id);
    addToast({ type: 'info', title: 'Task removed' });
  };

  const handleClearRoadmap = () => {
    if (confirm('Are you sure you want to remove all roadmap tasks? Regular tasks will not be affected.')) {
      const current = getTasks();
      const filtered = current.filter((t) => !t.roadmapDay);
      saveTasks(filtered);
      setActiveFilter('today');
      addToast({ type: 'info', title: 'Roadmap cleared' });
    }
  };

  // Quick Preset Reminder Trigger
  const handleSetQuickReminderPreset = async (task: TaskItem, preset: string) => {
    await requestNotificationPermission();
    setActiveReminderTaskId(null);

    if (preset === 'clear') {
      updateTask(task.id, { reminderTime: undefined, reminderSent: false }, user?.id);
      addToast({ type: 'info', title: 'Reminder cleared' });
      return;
    }

    let targetTime: Date;
    const now = Date.now();

    if (preset === '15m') {
      targetTime = new Date(now + 15 * 60000);
    } else if (preset === '1h') {
      targetTime = new Date(now + 60 * 60000);
    } else if (preset === 'evening') {
      targetTime = new Date();
      targetTime.setHours(18, 0, 0, 0);
      if (targetTime.getTime() <= now) targetTime.setDate(targetTime.getDate() + 1);
    } else if (preset === 'tomorrow_morning') {
      targetTime = new Date();
      targetTime.setDate(targetTime.getDate() + 1);
      targetTime.setHours(9, 0, 0, 0);
    } else {
      targetTime = new Date(now + 3600000);
    }

    updateTask(task.id, { reminderTime: targetTime.toISOString(), reminderSent: false }, user?.id);
    addToast({
      type: 'success',
      title: `⏰ Reminder set for ${targetTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
      description: 'NYRA will alert you with sound & notification when due.',
    });
  };

  // Custom Reminder Saver (from Modal)
  const handleSaveCustomReminder = async (task: TaskItem, isoDate: string) => {
    await requestNotificationPermission();
    updateTask(task.id, { reminderTime: isoDate, reminderSent: false }, user?.id);
    try {
      const d = new Date(isoDate);
      addToast({
        type: 'success',
        title: `⏰ Reminder set for ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
        description: 'NYRA will alert you with sound & notification when due.',
      });
    } catch {
      addToast({ type: 'success', title: 'Reminder set ✓' });
    }
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');

    let dateStr = '';
    if (task.dueDate) {
      try {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      } catch {
        dateStr = '';
      }
    }
    setEditDueDate(dateStr);
    setEditPriority(task.priority || 'medium');
    setEditReminderPreset(task.reminderTime ? 'custom' : 'none');
    setEditReminderCustom(task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    let targetDueDate: string | undefined = undefined;
    if (editDueDate) {
      try {
        const d = new Date(editDueDate);
        if (!isNaN(d.getTime())) {
          targetDueDate = d.toISOString();
        }
      } catch {
        targetDueDate = undefined;
      }
    }

    let targetReminderTime: string | undefined = undefined;
    if (editReminderPreset === '15m') {
      targetReminderTime = new Date(Date.now() + 15 * 60000).toISOString();
      await requestNotificationPermission();
    } else if (editReminderPreset === '1h') {
      targetReminderTime = new Date(Date.now() + 60 * 60000).toISOString();
      await requestNotificationPermission();
    } else if (editReminderPreset === 'evening') {
      const evening = new Date();
      evening.setHours(18, 0, 0, 0);
      if (evening.getTime() <= Date.now()) evening.setDate(evening.getDate() + 1);
      targetReminderTime = evening.toISOString();
      await requestNotificationPermission();
    } else if (editReminderPreset === 'tomorrow_morning') {
      const morning = new Date();
      morning.setDate(morning.getDate() + 1);
      morning.setHours(9, 0, 0, 0);
      targetReminderTime = morning.toISOString();
      await requestNotificationPermission();
    } else if (editReminderPreset === 'custom' && editReminderCustom) {
      try {
        const cd = new Date(editReminderCustom);
        if (!isNaN(cd.getTime())) {
          targetReminderTime = cd.toISOString();
          await requestNotificationPermission();
        }
      } catch {}
    }

    updateTask(
      editingTask.id,
      {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        dueDate: targetDueDate,
        reminderTime: targetReminderTime,
        reminderSent: false,
      },
      user?.id
    );

    addToast({ type: 'success', title: 'Task updated' });
    setEditingTask(null);
  };

  const todayFormatted = isClient
    ? new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const totalCount = Array.isArray(tasks) ? tasks.length : 0;
  const completedCount = completedTasks.length;

  const filteredRoadmapGroups = useMemo(() => {
    if (selectedRoadmapDay === 'all') return roadmapGroups;
    return roadmapGroups.filter((g) => g.day === selectedRoadmapDay);
  }, [roadmapGroups, selectedRoadmapDay]);

  return (
    <div className="tasks-page-root min-h-screen w-full bg-[#07050d] text-slate-100 flex flex-col p-3 sm:p-6 md:p-8 select-text transition-colors duration-200">
      {/* Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-5 pb-16">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/chat-ui"
            className="tasks-nav-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-purple-400/20 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={13} className="text-purple-400" />
            <span>Back to Chat</span>
          </Link>

          {totalCount > 0 && (
            <span className="tasks-progress-badge text-[11px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200 font-medium">
              {completedCount} of {totalCount} done
            </span>
          )}
        </div>

        {/* Title & Date */}
        <div className="space-y-0.5 pt-1">
          {todayFormatted && (
            <p className="tasks-text-subtle text-[11px] uppercase tracking-wider text-purple-400 font-medium font-mono">
              {todayFormatted}
            </p>
          )}
          <h1 className="tasks-header-title text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare size={24} className="text-purple-500" />
            <span>Tasks & Roadmaps</span>
          </h1>
        </div>

        {/* Quick-Add Task & AI Roadmap Box */}
        <div className="tasks-card rounded-2xl sm:rounded-3xl bg-[#130c26]/90 border border-purple-400/25 p-3 sm:p-4 shadow-xl space-y-3">
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <div className="flex items-center justify-center pl-2 text-purple-400">
              {isAiMode ? <Sparkles size={18} className="text-purple-400 animate-pulse" /> : <Plus size={18} />}
            </div>
            <input
              ref={quickInputRef}
              type="text"
              placeholder={
                isAiMode
                  ? "Enter a goal with duration: e.g. 'Learn Docker in 7 days' or 'Master React in 5 days'..."
                  : "Add a task or click 'AI Learning Roadmap'..."
              }
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="tasks-input flex-1 bg-transparent py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
            />
            <button
              type="submit"
              disabled={isAiLoading || !quickTitle.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30 shrink-0"
            >
              {isAiLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Planning...</span>
                </div>
              ) : isAiMode ? (
                <div className="flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Generate Roadmap</span>
                </div>
              ) : (
                <span>Add</span>
              )}
            </button>
          </form>

          {/* Quick AI Loading Step Indicator */}
          {isAiLoading && (
            <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-400/30 flex items-center gap-2.5 text-xs text-purple-200 animate-pulse">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span>{aiLoadingStep}</span>
            </div>
          )}

          {/* Quick Filter & AI Mode Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setQuickDate('today');
                setIsAiMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 ${
                quickDate === 'today' && !isAiMode
                  ? 'tasks-quick-chip-active bg-purple-500/25 text-purple-200 border border-purple-400/40'
                  : 'tasks-quick-chip-inactive bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              📅 Today
            </button>

            <button
              type="button"
              onClick={() => {
                setQuickDate('tomorrow');
                setIsAiMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 ${
                quickDate === 'tomorrow' && !isAiMode
                  ? 'tasks-quick-chip-active bg-purple-500/25 text-purple-200 border border-purple-400/40'
                  : 'tasks-quick-chip-inactive bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              📅 Tomorrow
            </button>

            <button
              type="button"
              onClick={() => setIsAiMode(!isAiMode)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isAiMode
                  ? 'tasks-quick-chip-active bg-gradient-to-r from-purple-600/40 to-violet-600/40 text-purple-100 border border-purple-400/50 shadow-sm'
                  : 'tasks-quick-chip-inactive bg-white/[0.03] text-purple-300 hover:text-white'
              }`}
            >
              <Sparkles size={12} className={isAiMode ? 'text-purple-300 animate-pulse' : 'text-purple-400'} />
              <span>AI Learning Roadmap</span>
            </button>

            {/* Quick Suggestions when in AI Mode */}
            {isAiMode && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pt-1.5 pb-0.5 custom-scrollbar">
                <span className="text-[10px] text-zinc-500 shrink-0 font-medium">Try:</span>
                {GOAL_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      const cleanGoal = sug.replace(/^[^\s]+\s*/, '');
                      setQuickTitle(cleanGoal);
                      handleGenerateRoadmap(cleanGoal);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-purple-900/30 hover:bg-purple-800/40 border border-purple-400/20 text-[10px] text-purple-200 transition cursor-pointer shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="tasks-segmented-bar flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-purple-400/15 overflow-x-auto custom-scrollbar">
            {hasRoadmap && (
              <button
                onClick={() => setActiveFilter('roadmap')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-medium text-center transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === 'roadmap'
                    ? 'tasks-tab-active bg-purple-500/25 text-purple-200 font-semibold border border-purple-400/40 shadow-sm'
                    : 'tasks-tab-inactive text-purple-300 hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>Roadmap ({roadmapGroups.length} Days)</span>
              </button>
            )}

            <button
              onClick={() => setActiveFilter('today')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-medium text-center transition cursor-pointer shrink-0 ${
                activeFilter === 'today'
                  ? 'tasks-tab-active bg-purple-500/20 text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                  : 'tasks-tab-inactive text-zinc-400 hover:text-white'
              }`}
            >
              Today ({todayTasks.length})
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-medium text-center transition cursor-pointer shrink-0 ${
                activeFilter === 'upcoming'
                  ? 'tasks-tab-active bg-purple-500/20 text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                  : 'tasks-tab-inactive text-zinc-400 hover:text-white'
              }`}
            >
              Upcoming ({upcomingTasks.length})
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-medium text-center transition cursor-pointer shrink-0 ${
                activeFilter === 'completed'
                  ? 'tasks-tab-active bg-purple-500/20 text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                  : 'tasks-tab-inactive text-zinc-400 hover:text-white'
              }`}
            >
              Done ({completedTasks.length})
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-medium text-center transition cursor-pointer shrink-0 ${
                activeFilter === 'all'
                  ? 'tasks-tab-active bg-purple-500/20 text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                  : 'tasks-tab-inactive text-zinc-400 hover:text-white'
              }`}
            >
              All ({tasks.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[180px] sm:w-64">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Search tasks & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tasks-search-input w-full pl-9 pr-7 py-1.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-purple-400/15 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* TODAY VIEW WITH FEATURED LEARNING PLAN BANNER */}
        {activeFilter === 'today' && todayRoadmapGroup && (
          <div className="tasks-card rounded-2xl sm:rounded-3xl bg-[linear-gradient(135deg,#1c123d_0%,#100a26_100%)] border border-purple-400/35 p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 font-mono">
                    🌟 Today's Learning Plan • Day {todayRoadmapGroup.day}
                  </span>
                  {todayRoadmapGroup.dueDate && (
                    <span className="text-xs text-purple-300 font-medium flex items-center gap-1">
                      <Calendar size={11} className="text-purple-400" />
                      {formatDisplayDate(todayRoadmapGroup.dueDate)}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{todayRoadmapGroup.topic}</span>
                </h2>
              </div>

              {/* Learn more in Chat */}
              <button
                onClick={() => handleLearnInChat(todayRoadmapGroup.topic, todayRoadmapGroup.chatQuery)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-xs font-semibold text-purple-100 hover:text-white transition cursor-pointer shadow-md shadow-purple-600/20 active:scale-95 shrink-0"
              >
                <Sparkles size={13} className="text-purple-300 animate-pulse" />
                <span>Learn more in Chat</span>
              </button>
            </div>

            {/* Description & Learning Focus */}
            {(todayRoadmapGroup.description || todayRoadmapGroup.learningFocus) && (
              <div className="p-3 rounded-2xl bg-black/35 border border-purple-400/20 space-y-1.5 text-xs">
                {todayRoadmapGroup.description && (
                  <p className="text-zinc-200 leading-relaxed">{todayRoadmapGroup.description}</p>
                )}
                {todayRoadmapGroup.learningFocus && (
                  <div className="flex items-start gap-1.5 text-purple-200 pt-0.5 font-medium">
                    <Target size={13} className="text-purple-400 mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-purple-300">What you'll understand:</strong>{' '}
                      {todayRoadmapGroup.learningFocus}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ROADMAP DAY-BY-DAY VIEW */}
        {activeFilter === 'roadmap' && hasRoadmap ? (
          <div className="space-y-4 pt-1">
            {/* Roadmap Overview Banner */}
            <div className="tasks-card rounded-2xl sm:rounded-3xl bg-[linear-gradient(135deg,#181033_0%,#0e0824_100%)] border border-purple-400/30 p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      Day-by-Day Learning Roadmap
                    </span>
                    <span className="text-xs text-purple-300 font-medium">
                      {completedRoadmapTasks} of {totalRoadmapTasks} tasks completed
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{roadmapGroups[0]?.tasks[0]?.category || 'Learning Roadmap'}</span>
                  </h2>
                </div>

                {/* Progress Meter & Clear Action */}
                <div className="w-full sm:w-60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span>Overall Progress</span>
                    <span className="font-semibold text-purple-300">
                      {totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 border border-purple-400/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-300 rounded-full"
                      style={{
                        width: `${totalRoadmapTasks > 0 ? (completedRoadmapTasks / totalRoadmapTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={handleClearRoadmap}
                      className="text-[10px] text-zinc-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      <span>Reset Roadmap</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Day filter pills */}
              <div className="flex items-center gap-1.5 pt-2 overflow-x-auto custom-scrollbar border-t border-purple-400/15">
                <button
                  onClick={() => setSelectedRoadmapDay('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                    selectedRoadmapDay === 'all'
                      ? 'bg-purple-600/40 text-purple-100 border border-purple-400/40 font-semibold'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white'
                  }`}
                >
                  All Days ({roadmapGroups.length})
                </button>
                {roadmapGroups.map((group) => {
                  const isDone = group.tasks.length > 0 && group.tasks.every((t) => t.status === 'completed');
                  return (
                    <button
                      key={group.day}
                      onClick={() => setSelectedRoadmapDay(group.day)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        selectedRoadmapDay === group.day
                          ? 'bg-purple-600/40 text-purple-100 border border-purple-400/40 font-semibold'
                          : 'bg-white/[0.03] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Day {group.day}</span>
                      {isDone && <span className="text-[10px] text-emerald-400">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Milestone Cards */}
            <div className="space-y-3.5">
              {filteredRoadmapGroups.map((group) => {
                const groupCompleted = group.tasks.filter((t) => t.status === 'completed').length;
                const isDayFinished = groupCompleted === group.tasks.length && group.tasks.length > 0;
                const formattedDueDate = formatDisplayDate(group.dueDate);

                return (
                  <div
                    key={group.day}
                    className={`tasks-card rounded-2xl sm:rounded-3xl border transition-all p-4 sm:p-5 space-y-3.5 ${
                      isDayFinished
                        ? 'bg-[#100b21]/70 border-purple-400/15 opacity-85'
                        : 'bg-[#140d2b]/90 border-purple-400/25 shadow-lg'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-purple-400/15">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-600/30 text-purple-200 border border-purple-400/40 font-mono">
                            Day {group.day}
                          </span>
                          {formattedDueDate && (
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-normal">
                              <Calendar size={11} className="text-purple-400" />
                              {formattedDueDate}
                            </span>
                          )}
                          {isDayFinished ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/20 font-medium">
                              {groupCompleted}/{group.tasks.length} tasks
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white pt-1">{group.topic}</h3>
                      </div>

                      {/* "Learn more in Chat" Action Button */}
                      <button
                        onClick={() => handleLearnInChat(group.topic, group.chatQuery)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 border border-purple-400/35 text-xs font-semibold text-purple-100 hover:text-white transition cursor-pointer shadow-sm shrink-0 active:scale-95"
                        title="Ask NYRA for deep explanations, interactive code examples, and step-by-step guidance for this topic"
                      >
                        <Sparkles size={13} className="text-purple-300" />
                        <span>Learn more in Chat</span>
                      </button>
                    </div>

                    {/* Day Focus & Learning Outcome */}
                    {(group.description || group.learningFocus) && (
                      <div className="p-3 rounded-2xl bg-black/30 border border-purple-400/15 space-y-1.5 text-xs">
                        {group.description && (
                          <p className="text-zinc-300 leading-relaxed">{group.description}</p>
                        )}
                        {group.learningFocus && (
                          <div className="flex items-start gap-1.5 text-purple-200 pt-0.5 font-medium">
                            <Target size={13} className="text-purple-400 mt-0.5 shrink-0" />
                            <span>
                              <strong className="text-purple-300">What you'll understand:</strong>{' '}
                              {group.learningFocus}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks for this Day */}
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 font-mono">
                        Day {group.day} Action Items:
                      </p>

                      <div className="space-y-1.5">
                        {group.tasks.map((t) => {
                          const isDone = t.status === 'completed';
                          const reminderText = formatReminderTimeDisplay(t.reminderTime);

                          return (
                            <div
                              key={t.id}
                              onClick={() => handleToggle(t.id)}
                              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group relative ${
                                isDone
                                  ? 'bg-white/[0.015] border-white/[0.04] opacity-60'
                                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-purple-400/15 hover:border-purple-400/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(t.id);
                                  }}
                                  className="shrink-0 p-0.5 text-zinc-400 hover:text-purple-400 transition cursor-pointer"
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={18} className="text-purple-400 fill-purple-400/20" />
                                  ) : (
                                    <Circle size={18} className="text-purple-300/60 hover:text-purple-400" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <span
                                    className={`text-xs sm:text-sm font-medium transition block truncate ${
                                      isDone
                                        ? 'line-through text-zinc-500'
                                        : 'text-zinc-100 group-hover:text-white'
                                    }`}
                                  >
                                    {t.title}
                                  </span>

                                  {reminderText && (
                                    <span className="tasks-reminder-badge text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono font-medium">
                                      <Bell size={10} className="text-purple-400" />
                                      <span>Reminder: {reminderText}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div
                                className="flex items-center gap-1.5 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t.priority === 'high' && !isDone && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                                    High
                                  </span>
                                )}

                                {/* Quick Reminder Trigger */}
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setActiveReminderTaskId(activeReminderTaskId === t.id ? null : t.id)
                                    }
                                    className={`tasks-action-btn p-1.5 rounded-lg transition cursor-pointer ${
                                      t.reminderTime
                                        ? 'tasks-reminder-btn-active text-purple-300 bg-purple-500/25 border border-purple-400/30'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
                                    }`}
                                    title={t.reminderTime ? `Reminder: ${reminderText}` : 'Set task reminder'}
                                  >
                                    <Bell size={13} className={t.reminderTime ? 'text-purple-400' : ''} />
                                  </button>

                                  {/* Clean Quick Reminder Menu */}
                                  {activeReminderTaskId === t.id && (
                                    <TaskReminderMenu
                                      task={t}
                                      onSetPreset={handleSetQuickReminderPreset}
                                      onOpenCustom={(target) => setCustomReminderModalTask(target)}
                                      onClose={() => setActiveReminderTaskId(null)}
                                      menuRef={reminderPickerRef}
                                    />
                                  )}
                                </div>

                                <button
                                  onClick={() => handleOpenEdit(t)}
                                  className="tasks-action-btn p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                                  title="Edit task"
                                >
                                  <Edit3 size={12} />
                                </button>

                                <button
                                  onClick={() => handleDelete(t.id)}
                                  className="tasks-action-btn p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/[0.08] transition cursor-pointer"
                                  title="Delete task"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* STANDARD TASK LIST VIEW (Today / Upcoming / Completed / All) */}
        {activeFilter !== 'roadmap' || !hasRoadmap ? (
          <div className="space-y-2 pt-1">
            {displayedTasks.length === 0 ? (
              <div className="tasks-empty-card py-14 px-4 text-center rounded-3xl border border-purple-400/15 bg-white/[0.02] space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center text-purple-400 mx-auto">
                  <Check size={20} />
                </div>
                <h3 className="tasks-header-title text-sm font-semibold text-white">
                  {activeFilter === 'completed'
                    ? 'No completed tasks yet'
                    : activeFilter === 'upcoming'
                    ? 'No upcoming tasks'
                    : 'All caught up for today!'}
                </h3>
                <p className="tasks-text-subtle text-xs text-zinc-400 max-w-xs mx-auto">
                  {activeFilter === 'completed'
                    ? 'Tasks you check off will appear here.'
                    : 'Type a task above or click "AI Learning Roadmap" to create a structured plan.'}
                </p>
              </div>
            ) : (
              displayedTasks.map((t) => {
                const isDone = t.status === 'completed';
                const formattedDate = formatDisplayDate(t.dueDate);
                const reminderText = formatReminderTimeDisplay(t.reminderTime);

                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer select-none active:scale-[0.99] relative ${
                      isDone
                        ? 'tasks-item-card-done bg-white/[0.015] border-white/[0.04] opacity-50 hover:opacity-75'
                        : 'tasks-item-card bg-white/[0.03] hover:bg-white/[0.06] border-purple-400/15 hover:border-purple-400/30 shadow-sm'
                    }`}
                  >
                    {/* Left: 1-Tap Circular Checkbox + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(t.id);
                        }}
                        className="shrink-0 flex items-center justify-center p-0.5 text-zinc-400 hover:text-purple-400 transition cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 size={20} className="text-purple-400 fill-purple-400/20" />
                        ) : (
                          <Circle size={20} className="hover:text-purple-400 text-purple-300/60" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p
                          className={`tasks-item-title text-xs sm:text-sm font-medium transition ${
                            isDone
                              ? 'tasks-item-title-done line-through text-zinc-500'
                              : 'text-zinc-100 group-hover:text-white'
                          }`}
                        >
                          {t.title || 'Untitled Task'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {t.roadmapDay && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 font-medium">
                              Day {t.roadmapDay}: {t.roadmapTopic}
                            </span>
                          )}

                          {formattedDate && (
                            <span className="tasks-text-subtle text-[10px] text-zinc-400 flex items-center gap-1 font-normal">
                              <Clock size={10} className="text-purple-400" />
                              {formattedDate}
                            </span>
                          )}

                          {reminderText && (
                            <span className="tasks-reminder-badge text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono font-medium">
                              <Bell size={10} className="text-purple-400" />
                              <span>{reminderText}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.roadmapTopic && (
                        <button
                          onClick={() => handleLearnInChat(t.roadmapTopic || t.title, t.chatQuery)}
                          className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-500/20 transition cursor-pointer"
                          title="Learn more in Chat"
                        >
                          <Sparkles size={13} className="text-purple-400" />
                        </button>
                      )}

                      {t.priority === 'high' && !isDone && (
                        <span className="tasks-badge-high text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30 flex items-center gap-0.5">
                          <Flame size={10} />
                          High
                        </span>
                      )}

                      {/* Reminder Button */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveReminderTaskId(activeReminderTaskId === t.id ? null : t.id)
                          }
                          className={`tasks-action-btn p-1.5 rounded-lg transition cursor-pointer ${
                            t.reminderTime
                              ? 'tasks-reminder-btn-active text-purple-300 bg-purple-500/25 border border-purple-400/30'
                              : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
                          }`}
                          title={t.reminderTime ? `Reminder: ${reminderText}` : 'Set reminder'}
                        >
                          <Bell size={13} className={t.reminderTime ? 'text-purple-400' : ''} />
                        </button>

                        {/* Clean Quick Reminder Menu */}
                        {activeReminderTaskId === t.id && (
                          <TaskReminderMenu
                            task={t}
                            onSetPreset={handleSetQuickReminderPreset}
                            onOpenCustom={(target) => setCustomReminderModalTask(target)}
                            onClose={() => setActiveReminderTaskId(null)}
                            menuRef={reminderPickerRef}
                          />
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="tasks-action-btn p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                        title="Edit task"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="tasks-action-btn p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/[0.08] transition cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {/* Dedicated Custom Reminder Modal */}
      <AnimatePresence>
        {customReminderModalTask && (
          <CustomReminderModal
            task={customReminderModalTask}
            isOpen={Boolean(customReminderModalTask)}
            onClose={() => setCustomReminderModalTask(null)}
            onSaveCustom={handleSaveCustomReminder}
          />
        )}
      </AnimatePresence>

      {/* Edit & Reminder Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="tasks-modal-card relative w-full max-w-sm rounded-3xl bg-[#140e28]/98 border border-purple-400/25 shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="tasks-modal-title text-sm font-bold text-white flex items-center gap-1.5">
                  <Edit3 size={15} className="text-purple-400" />
                  <span>Edit Task</span>
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="tasks-action-btn text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="tasks-modal-label block text-xs font-medium text-zinc-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="tasks-modal-input w-full px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-purple-400/20 text-xs sm:text-sm text-white outline-none focus:border-purple-400/60 transition"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="tasks-modal-label block text-xs font-medium text-zinc-300 mb-1">
                    Description / Focus
                  </label>
                  <input
                    type="text"
                    placeholder="Optional notes or context..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="tasks-modal-input w-full px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-purple-400/20 text-xs text-white outline-none focus:border-purple-400/60 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="tasks-modal-label block text-xs font-medium text-zinc-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="tasks-modal-input w-full px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-purple-400/20 text-xs text-white outline-none focus:border-purple-400/60 transition cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="tasks-modal-label block text-xs font-medium text-zinc-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                      className="tasks-modal-select w-full px-3 py-1.5 rounded-2xl bg-[#1a1233] border border-purple-400/20 text-xs text-white outline-none focus:border-purple-400/60 transition cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Reminder Settings */}
                <div className="space-y-1.5 pt-1">
                  <label className="tasks-modal-label block text-xs font-medium text-zinc-300 flex items-center gap-1">
                    <Bell size={12} className="text-purple-400" />
                    <span>Task Reminder</span>
                  </label>
                  <select
                    value={editReminderPreset}
                    onChange={(e) => setEditReminderPreset(e.target.value)}
                    className="tasks-modal-select w-full px-3 py-1.5 rounded-2xl bg-[#1a1233] border border-purple-400/20 text-xs text-white outline-none focus:border-purple-400/60 transition cursor-pointer"
                  >
                    <option value="none">No reminder</option>
                    <option value="15m">In 15 minutes</option>
                    <option value="1h">In 1 hour</option>
                    <option value="evening">This evening (6:00 PM)</option>
                    <option value="tomorrow_morning">Tomorrow morning (9:00 AM)</option>
                    <option value="custom">Custom Date & Time</option>
                  </select>

                  {editReminderPreset === 'custom' && (
                    <input
                      type="datetime-local"
                      value={editReminderCustom}
                      onChange={(e) => setEditReminderCustom(e.target.value)}
                      className="tasks-modal-input w-full px-3 py-1.5 mt-1 rounded-2xl bg-white/[0.04] border border-purple-400/20 text-xs text-white outline-none focus:border-purple-400/60 transition cursor-pointer"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="tasks-action-btn px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-600/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
