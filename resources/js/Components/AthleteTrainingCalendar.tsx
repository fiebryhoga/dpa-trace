import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    Circle,
    Clock,
    Flame,
    Zap,
    Layers,
    Activity,
    Check,
    Dumbbell,
    MessageSquare,
    Save,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import { TrainingProgram, TrainingProgramItem } from '@/types';

interface AthleteTrainingCalendarProps {
    program: TrainingProgram;
    interactive?: boolean;
    onDateSelect?: (dateStr: string) => void;
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function AthleteTrainingCalendar({
    program,
    interactive = true,
    onDateSelect,
}: AthleteTrainingCalendarProps) {
    // Current viewed month & year
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const initialDate = useMemo(() => {
        if (program.start_date) {
            const d = new Date(program.start_date);
            if (!isNaN(d.getTime())) return d;
        }
        return today;
    }, [program.start_date]);

    const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(
        program.start_date ? program.start_date.substring(0, 10) : todayStr
    );
    const [sessionNote, setSessionNote] = useState<string>('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Map all athlete programs by date
    const athletePrograms: TrainingProgram[] = useMemo(() => {
        const list = program.athlete?.training_programs || [program];
        return list;
    }, [program]);

    const programByDateMap = useMemo(() => {
        const map = new Map<string, TrainingProgram>();
        athletePrograms.forEach((p: TrainingProgram) => {
            if (p.start_date) {
                const dateKey = p.start_date.substring(0, 10);
                map.set(dateKey, p);
            }
        });
        if (program.start_date) {
            map.set(program.start_date.substring(0, 10), program);
        }
        return map;
    }, [athletePrograms, program]);

    const scheduledDatesSet = useMemo(() => {
        const set = new Set<string>();
        programByDateMap.forEach((_, dateKey) => {
            set.add(dateKey);
        });
        return set;
    }, [programByDateMap]);

    const completedDatesSet = useMemo(() => {
        const set = new Set<string>();
        athletePrograms.forEach((p: TrainingProgram) => {
            if (p.status === 'completed' && p.start_date) {
                set.add(p.start_date.substring(0, 10));
            }
            if (p.completed_dates && Array.isArray(p.completed_dates)) {
                p.completed_dates.forEach((d: string) => set.add(d));
            }
        });
        return set;
    }, [athletePrograms]);

    // Calendar grid calculations
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // Day of week of 1st day (0 = Sun, 1 = Mon, ...) -> make Mon = 0, Sun = 6
        let startDay = firstDayOfMonth.getDay() - 1;
        if (startDay === -1) startDay = 6;

        const totalDays = lastDayOfMonth.getDate();
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

        const days = [];

        // Previous month filler days
        for (let i = startDay - 1; i >= 0; i--) {
            const d = prevMonthLastDay - i;
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const yStr = prevYear;
            const mStr = String(prevMonth + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const dateStr = `${yStr}-${mStr}-${dStr}`;

            days.push({
                dayNumber: d,
                dateStr,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                isScheduled: scheduledDatesSet.has(dateStr),
                isCompleted: completedDatesSet.has(dateStr),
            });
        }

        // Current month days
        for (let d = 1; d <= totalDays; d++) {
            const mStr = String(currentMonth + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const dateStr = `${currentYear}-${mStr}-${dStr}`;

            days.push({
                dayNumber: d,
                dateStr,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
                isScheduled: scheduledDatesSet.has(dateStr),
                isCompleted: completedDatesSet.has(dateStr),
            });
        }

        // Next month filler days to complete grid (multiples of 7)
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let d = 1; d <= remaining; d++) {
                const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                const yStr = nextYear;
                const mStr = String(nextMonth + 1).padStart(2, '0');
                const dStr = String(d).padStart(2, '0');
                const dateStr = `${yStr}-${mStr}-${dStr}`;

                days.push({
                    dayNumber: d,
                    dateStr,
                    isCurrentMonth: false,
                    isToday: dateStr === todayStr,
                    isScheduled: scheduledDatesSet.has(dateStr),
                    isCompleted: completedDatesSet.has(dateStr),
                });
            }
        }

        return days;
    }, [currentYear, currentMonth, todayStr, scheduledDatesSet, completedDatesSet]);

    // Navigation handlers
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleGoToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setSelectedDate(todayStr);
    };

    // Toggle session completion via Inertia post
    const handleToggleComplete = (dateStr: string) => {
        if (!interactive) return;

        const isCurrentlyCompleted = completedDatesSet.has(dateStr);
        router.post(
            route('training-programs.toggle-session', program.slug || program.id),
            {
                date: dateStr,
                completed: !isCurrentlyCompleted,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleSaveNote = () => {
        if (!interactive || !selectedDate) return;
        setIsSavingNote(true);

        router.post(
            route('training-programs.toggle-session', program.slug || program.id),
            {
                date: selectedDate,
                note: sessionNote,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSavingNote(false),
            }
        );
    };

    // Update note input when selectedDate changes
    React.useEffect(() => {
        if (program.session_notes && program.session_notes[selectedDate]) {
            setSessionNote(program.session_notes[selectedDate]);
        } else {
            setSessionNote('');
        }
    }, [selectedDate, program.session_notes]);

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const totalScheduled = scheduledDatesSet.size;
    const totalCompleted = completedDatesSet.size;
    const completionPct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return '';
        try {
            const parts = selectedDate.split('-');
            if (parts.length === 3) {
                const dayNum = parseInt(parts[2], 10);
                const monthNum = parseInt(parts[1], 10) - 1;
                const yearNum = parseInt(parts[0], 10);
                const dateObj = new Date(yearNum, monthNum, dayNum);
                const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                return `${dayNames[dateObj.getDay()]}, ${dayNum} ${monthNames[monthNum]} ${yearNum}`;
            }
        } catch (e) {
            // fallback
        }
        return selectedDate;
    }, [selectedDate]);

    const activeProgramForDate = programByDateMap.get(selectedDate) || (selectedDate === (program.start_date ? program.start_date.substring(0, 10) : '') ? program : null);
    const isSelectedScheduled = !!activeProgramForDate;
    const isSelectedCompleted = isSelectedScheduled && (activeProgramForDate.status === 'completed' || completedDatesSet.has(selectedDate));

    return (
        <div className="space-y-4">
            {/* Header & Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide block">Total Sesi Terjadwal</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {totalScheduled} <span className="text-xs font-semibold text-slate-400">Sesi</span>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        <CalendarIcon size={16} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">Sesi Selesai (Completed)</span>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {totalCompleted} <span className="text-xs font-semibold text-slate-400">Sesi</span>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide block">Sisa Sesi Terjadwal</span>
                        <div className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">
                            {Math.max(0, totalScheduled - totalCompleted)} <span className="text-xs font-semibold text-slate-400">Sesi</span>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                        <Clock size={16} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-[#65a30d] dark:text-[#b4f031] uppercase tracking-wide">Kepatuhan Latihan</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                            className="bg-[#84cc16] dark:bg-[#b4f031] h-full rounded-full transition-all duration-500"
                            style={{ width: `${completionPct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Calendar & Selected Date Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Monthly Calendar View */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-2xs">
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {monthNames[currentMonth]} {currentYear}
                            </h3>
                            <button
                                type="button"
                                onClick={handleGoToday}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                                Hari Ini
                            </button>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="Bulan Sebelumnya"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="Bulan Berikutnya"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {DAY_NAMES.map((name, idx) => (
                            <div
                                key={name}
                                className={`text-[11px] font-bold py-1 ${
                                    idx >= 5 ? 'text-rose-500/80 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {calendarDays.map((day) => {
                            const isSelected = selectedDate === day.dateStr;

                            return (
                                <button
                                    key={day.dateStr}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(day.dateStr);
                                        if (onDateSelect) onDateSelect(day.dateStr);
                                    }}
                                    className={`relative min-h-[58px] p-1 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                        !day.isCurrentMonth
                                            ? 'opacity-30 border-transparent hover:opacity-70 bg-slate-50/40 dark:bg-slate-950/40'
                                            : isSelected
                                            ? 'border-[#84cc16] dark:border-[#b4f031] bg-[#84cc16]/10 dark:bg-[#b4f031]/10 ring-2 ring-[#84cc16]/20 shadow-xs'
                                            : day.isScheduled
                                            ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-[#84cc16]/40'
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-xs font-bold ${
                                                day.isToday
                                                    ? 'w-5 h-5 rounded-full bg-[#84cc16] text-slate-950 flex items-center justify-center font-extrabold'
                                                    : day.isCurrentMonth
                                                    ? 'text-slate-800 dark:text-slate-200'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {day.dayNumber}
                                        </span>

                                        {day.isCompleted && (
                                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                <Check size={9} className="stroke-[3]" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Workout indicator pill */}
                                    {day.isScheduled && (
                                        <div className="mt-1">
                                            <span
                                                className={`block text-[9px] font-bold px-1 py-0.5 rounded truncate ${
                                                    day.isCompleted
                                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                                        : 'bg-[#84cc16]/20 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/30'
                                                }`}
                                            >
                                                {day.isCompleted ? '✓ Selesai' : 'Latihan'}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                                <span>Sesi Latihan</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span>Selesai Dikerjakan</span>
                            </div>
                        </div>

                        <span>Klik tanggal untuk melihat sesi latihan</span>
                    </div>
                </div>

                {/* Right: Selected Date Routine & Check-In Details */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3.5">
                        {/* Selected Date Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                    Jadwal Harian Atlet
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {formattedSelectedDate}
                                </h4>
                            </div>

                            {isSelectedScheduled ? (
                                <span
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1 ${
                                        isSelectedCompleted
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                            : 'bg-[#84cc16]/15 text-[#65a30d] dark:text-[#b4f031] border-[#84cc16]/30'
                                    }`}
                                >
                                    {isSelectedCompleted ? <CheckCircle2 size={12} /> : <Dumbbell size={12} />}
                                    <span>{isSelectedCompleted ? 'Sesi Selesai' : 'Sesi Terjadwal'}</span>
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Hari Istirahat
                                </span>
                            )}
                        </div>

                        {activeProgramForDate ? (
                            <>
                                {/* Routine Checklist for this day */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
                                        {activeProgramForDate.slug ? (
                                            <Link
                                                href={route('training-programs.show', activeProgramForDate.slug)}
                                                className="font-bold text-slate-900 dark:text-white hover:text-[#65a30d] dark:hover:text-[#b4f031] uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors group"
                                                title="Klik untuk membuka detail latihan lengkap"
                                            >
                                                <span className="truncate">{activeProgramForDate.name}</span>
                                                <ExternalLink size={12} className="text-slate-400 group-hover:text-[#65a30d] dark:group-hover:text-[#b4f031] shrink-0" />
                                            </Link>
                                        ) : (
                                            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10.5px]">
                                                {activeProgramForDate.name}
                                            </span>
                                        )}

                                        {activeProgramForDate.slug ? (
                                            <Link
                                                href={route('training-programs.show', activeProgramForDate.slug)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] hover:bg-[#84cc16]/20 transition-colors shrink-0"
                                            >
                                                <span>Buka Sesi</span>
                                                <ChevronRight size={12} />
                                            </Link>
                                        ) : (
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {(activeProgramForDate.items || []).length} Gerakan
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                        {(activeProgramForDate.items || []).map((item, idx) => (
                                            activeProgramForDate.slug ? (
                                                <Link
                                                    key={item.id || idx}
                                                    href={route('training-programs.show', activeProgramForDate.slug)}
                                                    className="block p-2.5 rounded-md bg-slate-50/80 dark:bg-slate-950/70 hover:bg-[#84cc16]/5 dark:hover:bg-[#84cc16]/10 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#84cc16]/40 text-xs space-y-1 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white group-hover:text-[#65a30d] dark:group-hover:text-[#b4f031] transition-colors">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    item.phase === 'inhibit'
                                                                        ? 'bg-amber-500'
                                                                        : item.phase === 'lengthen'
                                                                        ? 'bg-sky-500'
                                                                        : item.phase === 'activate'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-purple-500'
                                                                }`}
                                                            />
                                                            <span className="capitalize text-[10px] text-slate-400">[{item.phase}]</span>
                                                            <span>{item.exercise_name}</span>
                                                        </div>
                                                        <ChevronRight size={13} className="text-slate-400 group-hover:text-[#65a30d] dark:group-hover:text-[#b4f031] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-3.5">
                                                        <span>{item.sets} set</span>
                                                        <span>•</span>
                                                        <span>{item.reps || item.duration_seconds ? `${item.duration_seconds}s` : '-'}</span>
                                                        {item.target_muscle && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-[#65a30d] dark:text-[#b4f031] font-semibold truncate">
                                                                    {item.target_muscle}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div
                                                    key={item.id || idx}
                                                    className="p-2.5 rounded-md bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    item.phase === 'inhibit'
                                                                        ? 'bg-amber-500'
                                                                        : item.phase === 'lengthen'
                                                                        ? 'bg-sky-500'
                                                                        : item.phase === 'activate'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-purple-500'
                                                                }`}
                                                            />
                                                            <span className="capitalize text-[10px] text-slate-400">[{item.phase}]</span>
                                                            <span>{item.exercise_name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-3.5">
                                                        <span>{item.sets} set</span>
                                                        <span>•</span>
                                                        <span>{item.reps || item.duration_seconds ? `${item.duration_seconds}s` : '-'}</span>
                                                        {item.target_muscle && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-[#65a30d] dark:text-[#b4f031] font-semibold truncate">
                                                                    {item.target_muscle}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* Session Coach Note for this date */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <MessageSquare size={12} className="text-[#65a30d] dark:text-[#b4f031]" />
                                        <span>Catatan Pelatih pada Tanggal Ini</span>
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={sessionNote}
                                            onChange={(e) => setSessionNote(e.target.value)}
                                            placeholder="Contoh: Atlet menyelesaikan semua set, lutut stabil..."
                                            className="flex-1 py-1.5 px-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                                        />
                                        {interactive && (
                                            <button
                                                type="button"
                                                onClick={handleSaveNote}
                                                disabled={isSavingNote}
                                                className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <Save size={12} />
                                                <span>{isSavingNote ? '...' : 'Simpan'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty state for non-scheduled date */
                            <div className="py-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4">
                                <p className="text-xs text-slate-400">
                                    Belum ada jadwal sesi latihan pada tanggal ini.
                                </p>
                                {program.athlete_id && (
                                    <a
                                        href={route('training-programs.create', {
                                            athlete_id: program.athlete_id,
                                            date: selectedDate,
                                        })}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all shadow-2xs"
                                    >
                                        <Dumbbell size={13} />
                                        <span>+ Buat Sesi Latihan di Tanggal Ini</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Completion Action Button */}
                    {interactive && activeProgramForDate && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => handleToggleComplete(selectedDate)}
                                className={`w-full py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs ${
                                    isSelectedCompleted
                                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                        : 'bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950'
                                }`}
                            >
                                {isSelectedCompleted ? (
                                    <>
                                        <Circle size={14} />
                                        <span>Batalkan Status Selesai</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={14} className="stroke-[2.5]" />
                                        <span>Tandai Sesi Ini Telah Dikerjakan (Selesai)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
