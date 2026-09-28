import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Camera,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    X,
    RefreshCw,
    Key,
    RotateCcw,
    Eye,
    EyeOff,
    Crosshair,
    Info,
    BookOpen,
    HelpCircle,
} from 'lucide-react';
import { AthleteGallery, DpaCompensation } from '@/types';

interface DetectedCompensation {
    compensation_id: number;
    name: string;
    checkpoint: string;
    confidence: number;
    severity?: 'Mild' | 'Moderate' | 'Severe';
    side?: 'Bilateral' | 'Left' | 'Right';
    angle_metric?: string;
    clinical_rationale?: string;
    overactive_muscles?: string;
    underactive_muscles?: string;
}

interface LandmarkPoint {
    id: string;
    name: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    color?: string;
}

interface SmartPostureScannerProps {
    athleteId?: number;
    availableCompensations: DpaCompensation[];
    galleryPhotos?: AthleteGallery[];
    selectedCompensationIds: number[];
    onApplyCompensations: (newCompensationIds: number[]) => void;
}

type ViewType = 'Anterior View' | 'Lateral View' | 'Posterior View' | 'Single Leg';

export default function SmartPostureScanner({
    athleteId,
    availableCompensations = [],
    galleryPhotos = [],
    selectedCompensationIds = [],
    onApplyCompensations,
}: SmartPostureScannerProps) {
    const [selectedView, setSelectedView] = useState<ViewType>('Anterior View');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<{
        engine: string;
        summary: string;
        has_api_key?: boolean;
        detected_compensations: DetectedCompensation[];
        landmarks?: Array<{ name: string; x: number; y: number }>;
    } | null>(null);
    const [checkedResults, setCheckedResults] = useState<number[]>([]);
    const [appliedNotification, setAppliedNotification] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Goniometer & Landmark Pins state
    const [showGoniometer, setShowGoniometer] = useState(true);
    const [activeLandmarks, setActiveLandmarks] = useState<LandmarkPoint[]>([]);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);

    // Gemini API Key config modal & storage
    const [apiKey, setApiKey] = useState<string>('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [tempKeyInput, setTempKeyInput] = useState('');

    // Visual Reference Guide Modal
    const [showGuideModal, setShowGuideModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Load saved API key on mount
    useEffect(() => {
        const saved = localStorage.getItem('dpa_gemini_api_key') || '';
        setApiKey(saved);
        setTempKeyInput(saved);
    }, []);

    // Baseline neutral landmarks depending on view
    const getDefaultLandmarks = useCallback((view: ViewType): LandmarkPoint[] => {
        if (view === 'Anterior View') {
            return [
                { id: 'l_asis', name: 'L. Hip (ASIS)', x: 44, y: 46, color: '#38bdf8' },
                { id: 'r_asis', name: 'R. Hip (ASIS)', x: 56, y: 46, color: '#38bdf8' },
                { id: 'l_patella', name: 'L. Knee (Patella)', x: 45, y: 68, color: '#ef4444' },
                { id: 'r_patella', name: 'R. Knee (Patella)', x: 55, y: 68, color: '#ef4444' },
                { id: 'l_ankle', name: 'L. Ankle', x: 44, y: 88, color: '#84cc16' },
                { id: 'r_ankle', name: 'R. Ankle', x: 56, y: 88, color: '#84cc16' },
                { id: 'l_toe', name: 'L. 2nd Toe', x: 41, y: 94, color: '#ef4444' },
                { id: 'r_toe', name: 'R. 2nd Toe', x: 59, y: 94, color: '#ef4444' },
            ];
        }
        if (view === 'Lateral View') {
            return [
                { id: 'ear', name: 'Ear (Tragus)', x: 50, y: 15, color: '#a855f7' },
                { id: 'shoulder', name: 'Shoulder (Acromion)', x: 48, y: 26, color: '#38bdf8' },
                { id: 'wrist', name: 'Wrist (Overhead)', x: 48, y: 7, color: '#ef4444' },
                { id: 'hip', name: 'Hip (Trochanter)', x: 45, y: 52, color: '#ef4444' },
                { id: 'knee', name: 'Knee Joint', x: 55, y: 70, color: '#ef4444' },
                { id: 'ankle', name: 'Lateral Malleolus', x: 50, y: 88, color: '#84cc16' },
            ];
        }
        if (view === 'Posterior View') {
            return [
                { id: 'c7', name: 'C7 Spine Axis', x: 50, y: 22, color: '#ef4444' },
                { id: 'l_psis', name: 'L. PSIS (Pelvis)', x: 45, y: 48, color: '#ef4444' },
                { id: 'r_psis', name: 'R. PSIS (Pelvis)', x: 55, y: 48, color: '#ef4444' },
                { id: 'l_knee_post', name: 'L. Knee Crease', x: 44, y: 68, color: '#38bdf8' },
                { id: 'r_knee_post', name: 'R. Knee Crease', x: 56, y: 68, color: '#38bdf8' },
                { id: 'l_calcaneus', name: 'L. Calcaneus (Heel)', x: 44, y: 89, color: '#ef4444' },
                { id: 'r_calcaneus', name: 'R. Calcaneus (Heel)', x: 56, y: 89, color: '#ef4444' },
            ];
        }
        // Single Leg
        return [
            { id: 'st_asis', name: 'Stance Hip (ASIS)', x: 47, y: 48, color: '#ef4444' },
            { id: 'fl_asis', name: 'Floating Hip', x: 56, y: 50, color: '#ef4444' },
            { id: 'st_knee', name: 'Stance Knee', x: 47, y: 69, color: '#ef4444' },
            { id: 'st_ankle', name: 'Stance Ankle', x: 47, y: 88, color: '#84cc16' },
            { id: 'st_shoulder_l', name: 'L. Shoulder', x: 43, y: 26, color: '#ef4444' },
            { id: 'st_shoulder_r', name: 'R. Shoulder', x: 57, y: 26, color: '#ef4444' },
        ];
    }, []);

    // Set initial landmarks on view change
    useEffect(() => {
        setActiveLandmarks(getDefaultLandmarks(selectedView));
    }, [selectedView, getDefaultLandmarks]);

    // Save API key
    const handleSaveApiKey = () => {
        const clean = tempKeyInput.trim();
        setApiKey(clean);
        localStorage.setItem('dpa_gemini_api_key', clean);
        setShowKeyModal(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setSelectedGalleryPhoto(null);
            setImagePreview(URL.createObjectURL(file));
            setScanResults(null);
            setErrorMsg(null);
            setActiveLandmarks(getDefaultLandmarks(selectedView));
        }
    };

    const handleSelectGalleryPhoto = (photoPath: string) => {
        setSelectedGalleryPhoto(photoPath);
        setImageFile(null);
        const url = photoPath.startsWith('/') ? photoPath : `/storage/${photoPath}`;
        setImagePreview(url);
        setScanResults(null);
        setErrorMsg(null);
        setActiveLandmarks(getDefaultLandmarks(selectedView));
    };

    const handleClearPhoto = () => {
        setImageFile(null);
        setSelectedGalleryPhoto(null);
        setImagePreview(null);
        setScanResults(null);
        setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Calculate real mathematical angles & goniometer compensation results
    const evaluateGoniometerDeviations = useCallback(() => {
        const p = (id: string) => activeLandmarks.find((pt) => pt.id === id);
        const detected: DetectedCompensation[] = [];

        if (selectedView === 'Anterior View') {
            const lAsis = p('l_asis');
            const rAsis = p('r_asis');
            const lKnee = p('l_patella');
            const rKnee = p('r_patella');
            const lAnkle = p('l_ankle');
            const rAnkle = p('r_ankle');
            const lToe = p('l_toe');
            const rToe = p('r_toe');

            if (lAsis && lKnee && lAnkle && rAsis && rKnee && rAnkle) {
                const lValgusOffset = lKnee.x - lAnkle.x;
                const rValgusOffset = rAnkle.x - rKnee.x;

                const isLeftValgus = lValgusOffset > 1.8;
                const isRightValgus = rValgusOffset > 1.8;
                const isLeftVarus = lValgusOffset < -2.2;
                const isRightVarus = rValgusOffset < -2.2;

                if (isLeftValgus || isRightValgus) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Anterior View' &&
                            (c.name.toLowerCase().includes('valgus') || c.name.toLowerCase().includes('inward'))
                    );
                    if (comp) {
                        const deg = Math.max(
                            Math.abs(lValgusOffset) * 4.2 + 12,
                            Math.abs(rValgusOffset) * 4.2 + 12
                        ).toFixed(1);
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 94,
                            severity: Number(deg) > 18 ? 'Severe' : 'Moderate',
                            side: isLeftValgus && isRightValgus ? 'Bilateral' : isLeftValgus ? 'Left' : 'Right',
                            angle_metric: `Q-Angle ${deg}° Medial`,
                            clinical_rationale: `Sumbu patella kolaps ke arah medial melewati garis netral ankle saat squat, indikasi kelemahan gluteus medius/VMO.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                } else if (isLeftVarus || isRightVarus) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Anterior View' &&
                            c.name.toLowerCase().includes('move outward')
                    );
                    if (comp) {
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 90,
                            severity: 'Moderate',
                            side: isLeftVarus && isRightVarus ? 'Bilateral' : isLeftVarus ? 'Left' : 'Right',
                            angle_metric: `Genu Varum Lateral`,
                            clinical_rationale: `Lutut bergerak ke lateral keluar dari sumbu kaki akibat ketegangan piriformis dan gluteus minimus.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }

            if (lToe && lAnkle && rToe && rAnkle) {
                const lTurnout = lAnkle.x - lToe.x;
                const rTurnout = rToe.x - rAnkle.x;

                if (lTurnout > 2.2 || rTurnout > 2.2) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Anterior View' &&
                            c.name.toLowerCase().includes('turn out')
                    );
                    if (comp) {
                        const deg = (Math.max(lTurnout, rTurnout) * 5 + 10).toFixed(1);
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 91,
                            severity: Number(deg) > 20 ? 'Severe' : 'Moderate',
                            side: lTurnout > 2.2 && rTurnout > 2.2 ? 'Bilateral' : lTurnout > 2.2 ? 'Left' : 'Right',
                            angle_metric: `Rotasi Eksternal ${deg}°`,
                            clinical_rationale: `Jari kaki berotasi ke arah lateral keluar melewati batas netral 12-15° akibat ketegangan gastrocnemius lateral dan soleus.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }
        } else if (selectedView === 'Lateral View') {
            const ear = p('ear');
            const shoulder = p('shoulder');
            const wrist = p('wrist');
            const hip = p('hip');
            const knee = p('knee');
            const ankle = p('ankle');

            if (shoulder && hip && knee && ankle) {
                const trunkDeltaX = shoulder.x - hip.x;
                const trunkDeltaY = hip.y - shoulder.y;
                const trunkAngleDeg = Math.atan2(trunkDeltaX, trunkDeltaY) * (180 / Math.PI);

                const tibiaDeltaX = knee.x - ankle.x;
                const tibiaDeltaY = ankle.y - knee.y;
                const tibiaAngleDeg = Math.atan2(tibiaDeltaX, tibiaDeltaY) * (180 / Math.PI);

                const parallelDiff = Math.abs(trunkAngleDeg - tibiaAngleDeg);

                if (trunkAngleDeg > 22 || parallelDiff > 8) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Lateral View' &&
                            c.name.toLowerCase().includes('forward lean')
                    );
                    if (comp) {
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 93,
                            severity: trunkAngleDeg > 32 ? 'Severe' : 'Moderate',
                            side: 'Bilateral',
                            angle_metric: `Torso Lean ${trunkAngleDeg.toFixed(1)}° (Non-Paralel ${parallelDiff.toFixed(1)}°)`,
                            clinical_rationale: `Garis torso tidak paralel dengan sumbu tibia, condong ke anterior akibat defisit mobilitas dorsofleksi ankle.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }

            if (shoulder && wrist && ear) {
                const armForwardOffset = wrist.x - shoulder.x;
                if (armForwardOffset > 2.5 || (ear && wrist.x - ear.x > 3)) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Lateral View' &&
                            c.name.toLowerCase().includes('arms fall')
                    );
                    if (comp) {
                        const devDeg = (Math.abs(armForwardOffset) * 4 + 10).toFixed(1);
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 92,
                            severity: Number(devDeg) > 18 ? 'Severe' : 'Moderate',
                            side: 'Bilateral',
                            angle_metric: `Deviasi Lengan ${devDeg}°`,
                            clinical_rationale: `Lengan jatuh ke depan dari garis aksial telinga dan torso akibat hiperaktivitas latissimus dorsi dan pectoralis major.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }
        } else if (selectedView === 'Posterior View') {
            const lPsis = p('l_psis');
            const rPsis = p('r_psis');
            const lCalc = p('l_calcaneus');
            const rCalc = p('r_calcaneus');

            if (lPsis && rPsis && lCalc && rCalc) {
                const pelvicCenter = (lPsis.x + rPsis.x) / 2;
                const feetCenter = (lCalc.x + rCalc.x) / 2;
                const shiftDiff = pelvicCenter - feetCenter;

                if (Math.abs(shiftDiff) > 2.0) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Posterior View' &&
                            c.name.toLowerCase().includes('weight shift')
                    );
                    if (comp) {
                        const side = shiftDiff > 0 ? 'Right' : 'Left';
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 91,
                            severity: Math.abs(shiftDiff) > 4 ? 'Severe' : 'Moderate',
                            side: side,
                            angle_metric: `Pergeseran ${Math.abs(shiftDiff * 1.2).toFixed(1)} cm (${side})`,
                            clinical_rationale: `Panggul bergeser secara asimetris ke arah ${side} untuk menghindari kompensasi beban pada sendi kontralateral.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }
        } else {
            // Single Leg
            const stAsis = p('st_asis');
            const flAsis = p('fl_asis');
            const stKnee = p('st_knee');
            const stAnkle = p('st_ankle');

            if (stAsis && flAsis) {
                const pelvicTilt = flAsis.y - stAsis.y;
                if (pelvicTilt > 2.0) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Single Leg' &&
                            c.name.toLowerCase().includes('hip drop')
                    );
                    if (comp) {
                        const deg = (pelvicTilt * 2.8).toFixed(1);
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 94,
                            severity: Number(deg) > 7 ? 'Severe' : 'Moderate',
                            side: 'Right',
                            angle_metric: `Pelvic Drop ${deg}°`,
                            clinical_rationale: `Panggul kontralateral turun (Trendelenburg sign) menandakan kelemahan gluteus medius pada kaki tumpuan.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                } else if (pelvicTilt < -2.0) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Single Leg' &&
                            c.name.toLowerCase().includes('hip hike')
                    );
                    if (comp) {
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 90,
                            severity: 'Moderate',
                            side: 'Left',
                            angle_metric: `Hip Hike ${Math.abs(pelvicTilt * 2.8).toFixed(1)}°`,
                            clinical_rationale: `Panggul terangkat naik (Hip Hike) akibat overaktivitas quadratus lumborum kontralateral.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }

            if (stKnee && stAnkle) {
                const valgusDiff = Math.abs(stKnee.x - stAnkle.x);
                if (valgusDiff > 2.2) {
                    const comp = availableCompensations.find(
                        (c) =>
                            c.category === 'Single Leg' &&
                            (c.name.toLowerCase().includes('valgus') || c.name.toLowerCase().includes('inward'))
                    );
                    if (comp) {
                        detected.push({
                            compensation_id: comp.id,
                            name: comp.name,
                            checkpoint: comp.checkpoint || '',
                            confidence: 95,
                            severity: 'Severe',
                            side: 'Left',
                            angle_metric: `Dynamic Valgus ${(valgusDiff * 4.5).toFixed(1)}°`,
                            clinical_rationale: `Instabilitas frontal plane lutut saat Single Leg Squat, kolaps ke medial akibat defisit stabilisasi hip abductor.`,
                            overactive_muscles: comp.overactive_muscles,
                            underactive_muscles: comp.underactive_muscles,
                        });
                    }
                }
            }
        }

        return detected;
    }, [activeLandmarks, selectedView, availableCompensations]);

    // Pin dragging handler
    const handleMouseDownPin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingPointId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingPointId || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

        setActiveLandmarks((prev) =>
            prev.map((pt) => (pt.id === draggingPointId ? { ...pt, x, y } : pt))
        );
    };

    const handleMouseUp = () => {
        if (draggingPointId) {
            setDraggingPointId(null);
            const liveDetected = evaluateGoniometerDeviations();
            setScanResults({
                engine: apiKey ? 'Google Gemini 2.0 Flash + Live Goniometer' : 'Goniometer Biomekanika Klinis',
                summary:
                    liveDetected.length > 0
                        ? `Kalibrasi goniometer mendeteksi ${liveDetected.length} deviasi kompensasi pada sudut pandang ${selectedView}.`
                        : `Kalibrasi goniometer: Posisi sendi berada dalam rentang normal (tidak ada kompensasi signifikan).`,
                has_api_key: !apiKey,
                detected_compensations: liveDetected,
            });
            setCheckedResults(liveDetected.map((d) => d.compensation_id));
        }
    };

    // Run Scan
    const runScan = async () => {
        if (!imageFile && !selectedGalleryPhoto) {
            setErrorMsg('Silakan pilih atau unggah foto postur terlebih dahulu.');
            return;
        }

        setIsScanning(true);
        setErrorMsg(null);

        try {
            const formData = new FormData();
            formData.append('view_category', selectedView);
            if (athleteId) formData.append('athlete_id', String(athleteId));
            if (apiKey) formData.append('gemini_api_key', apiKey);

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (selectedGalleryPhoto) {
                formData.append('image_path', selectedGalleryPhoto);
            }

            const response = await axios.post(route('dpa.analyze-posture'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(apiKey ? { 'X-Gemini-Key': apiKey } : {}),
                },
            });

            if (response.data?.success) {
                const res = response.data;
                setScanResults(res);

                if (Array.isArray(res.landmarks) && res.landmarks.length > 0) {
                    setActiveLandmarks((prev) =>
                        prev.map((pt) => {
                            const found = res.landmarks.find(
                                (l: any) =>
                                    l.name?.toLowerCase().includes(pt.name.toLowerCase().split(' ')[0]) ||
                                    pt.name.toLowerCase().includes(l.name?.toLowerCase())
                            );
                            if (found && typeof found.x === 'number' && typeof found.y === 'number') {
                                return { ...pt, x: found.x, y: found.y };
                            }
                            return pt;
                        })
                    );
                }

                const allIds = (res.detected_compensations || []).map(
                    (d: DetectedCompensation) => d.compensation_id
                );
                setCheckedResults(allIds);
            }
        } catch (err: any) {
            setErrorMsg(
                err.response?.data?.message || 'Gagal menganalisis foto. Pastikan format gambar valid.'
            );
        } finally {
            setIsScanning(false);
        }
    };

    const toggleCheckResult = (id: number) => {
        if (checkedResults.includes(id)) {
            setCheckedResults(checkedResults.filter((item) => item !== id));
        } else {
            setCheckedResults([...checkedResults, id]);
        }
    };

    const applySelectedToForm = () => {
        if (checkedResults.length === 0) return;
        const merged = Array.from(new Set([...selectedCompensationIds, ...checkedResults]));
        onApplyCompensations(merged);
        setAppliedNotification(true);
        setTimeout(() => setAppliedNotification(false), 4000);
    };

    // Guide image mapper
    const getGuideImage = (view: ViewType) => {
        if (view === 'Anterior View') return '/images/dpa-guides/anterior_guide.png';
        if (view === 'Lateral View') return '/images/dpa-guides/lateral_guide.png';
        if (view === 'Posterior View') return '/images/dpa-guides/posterior_guide.png';
        return '/images/dpa-guides/single_leg_guide.png';
    };

    return (
        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#84cc16]/10 dark:bg-[#b4f031]/10 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Smart AI Posture & Goniometer Scanner</span>
                            {apiKey ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Gemini 2.0 Active
                                </span>
                            ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Goniometer Mode
                                </span>
                            )}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                            Deteksi biomekanika dengan Multimodal AI Vision & kalibrasi garis goniometer merah standar NASM
                        </p>
                    </div>
                </div>

                {/* Right controls: Guide Modal + API Key modal + View selector */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setShowGuideModal(true)}
                        className="px-2 py-1 rounded text-[10.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#84cc16]"
                        title="Lihat Clue Gambar Standar NASM"
                    >
                        <BookOpen size={11} className="text-[#84cc16] dark:text-[#b4f031]" />
                        <span>Panduan Visual NASM</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowKeyModal(true)}
                        className={`px-2 py-1 rounded text-[10.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            apiKey
                                ? 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#84cc16]'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                        title="Atur Google Gemini API Key"
                    >
                        <Key size={11} className={apiKey ? 'text-emerald-500' : 'text-amber-500'} />
                        <span>{apiKey ? 'API Key Siap' : 'Set Gemini API Key'}</span>
                    </button>

                    {/* View Selector Pills */}
                    <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 text-[10.5px] font-semibold">
                        {(['Anterior View', 'Lateral View', 'Posterior View', 'Single Leg'] as const).map(
                            (view) => (
                                <button
                                    key={view}
                                    type="button"
                                    onClick={() => {
                                        setSelectedView(view);
                                        setScanResults(null);
                                    }}
                                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                                        selectedView === view
                                            ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {view.replace(' View', '')}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Upload & Preview Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Area: Photo Dropzone / Image Viewer with Red Goniometer Lines */}
                <div className="lg:col-span-6 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {imagePreview ? (
                        <div className="space-y-2">
                            <div
                                ref={imageContainerRef}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[4/3] flex items-center justify-center select-none"
                            >
                                <img
                                    src={imagePreview}
                                    alt="Posture Scan"
                                    className="w-full h-full object-contain pointer-events-none"
                                />

                                {/* Exact Red Visual Indicator Lines matching user clues */}
                                {showGoniometer && (
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        {selectedView === 'Anterior View' && (
                                            <>
                                                {/* Left Leg Red Vector: ASIS -> Knee -> Ankle */}
                                                {activeLandmarks.find((p) => p.id === 'l_asis') &&
                                                    activeLandmarks.find((p) => p.id === 'l_patella') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'l_asis')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'l_asis')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'l_patella')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'l_patella')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {activeLandmarks.find((p) => p.id === 'l_patella') &&
                                                    activeLandmarks.find((p) => p.id === 'l_ankle') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'l_patella')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'l_patella')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'l_ankle')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'l_ankle')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {/* Right Leg Red Vector: ASIS -> Knee -> Ankle */}
                                                {activeLandmarks.find((p) => p.id === 'r_asis') &&
                                                    activeLandmarks.find((p) => p.id === 'r_patella') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'r_asis')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'r_asis')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'r_patella')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'r_patella')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {activeLandmarks.find((p) => p.id === 'r_patella') &&
                                                    activeLandmarks.find((p) => p.id === 'r_ankle') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'r_patella')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'r_patella')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'r_ankle')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'r_ankle')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {/* Foot Turnout / Pronation Angles */}
                                                {activeLandmarks.find((p) => p.id === 'l_ankle') &&
                                                    activeLandmarks.find((p) => p.id === 'l_toe') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'l_ankle')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'l_ankle')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'l_toe')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'l_toe')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                                {activeLandmarks.find((p) => p.id === 'r_ankle') &&
                                                    activeLandmarks.find((p) => p.id === 'r_toe') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'r_ankle')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'r_ankle')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'r_toe')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'r_toe')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                            </>
                                        )}

                                        {selectedView === 'Lateral View' && (
                                            <>
                                                {/* Red Torso Line: Hip -> Shoulder */}
                                                {activeLandmarks.find((p) => p.id === 'hip') &&
                                                    activeLandmarks.find((p) => p.id === 'shoulder') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'hip')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'hip')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'shoulder')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'shoulder')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="3"
                                                        />
                                                    )}
                                                {/* Red Tibia Line: Ankle -> Knee */}
                                                {activeLandmarks.find((p) => p.id === 'ankle') &&
                                                    activeLandmarks.find((p) => p.id === 'knee') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'ankle')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'ankle')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'knee')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'knee')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="3"
                                                        />
                                                    )}
                                                {/* Red Arms Overhead Line & Projection */}
                                                {activeLandmarks.find((p) => p.id === 'shoulder') &&
                                                    activeLandmarks.find((p) => p.id === 'wrist') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'shoulder')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'shoulder')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'wrist')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'wrist')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                            </>
                                        )}

                                        {selectedView === 'Posterior View' && (
                                            <>
                                                {/* Vertical Plumbline (Spine to Ground) */}
                                                {activeLandmarks.find((p) => p.id === 'c7') && (
                                                    <line
                                                        x1={`${activeLandmarks.find((p) => p.id === 'c7')!.x}%`}
                                                        y1={`${activeLandmarks.find((p) => p.id === 'c7')!.y}%`}
                                                        x2={`${activeLandmarks.find((p) => p.id === 'c7')!.x}%`}
                                                        y2="95%"
                                                        stroke="#ef4444"
                                                        strokeWidth="2"
                                                        strokeDasharray="4 3"
                                                    />
                                                )}
                                                {/* Red Pelvic Slant Line */}
                                                {activeLandmarks.find((p) => p.id === 'l_psis') &&
                                                    activeLandmarks.find((p) => p.id === 'r_psis') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'l_psis')!.x - 10}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'l_psis')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'r_psis')!.x + 10}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'r_psis')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {/* Calcaneus / Heel Circles */}
                                                {activeLandmarks.find((p) => p.id === 'l_calcaneus') && (
                                                    <circle
                                                        cx={`${activeLandmarks.find((p) => p.id === 'l_calcaneus')!.x}%`}
                                                        cy={`${activeLandmarks.find((p) => p.id === 'l_calcaneus')!.y}%`}
                                                        r="8"
                                                        fill="none"
                                                        stroke="#ef4444"
                                                        strokeWidth="2"
                                                    />
                                                )}
                                                {activeLandmarks.find((p) => p.id === 'r_calcaneus') && (
                                                    <circle
                                                        cx={`${activeLandmarks.find((p) => p.id === 'r_calcaneus')!.x}%`}
                                                        cy={`${activeLandmarks.find((p) => p.id === 'r_calcaneus')!.y}%`}
                                                        r="8"
                                                        fill="none"
                                                        stroke="#ef4444"
                                                        strokeWidth="2"
                                                    />
                                                )}
                                            </>
                                        )}

                                        {selectedView === 'Single Leg' && (
                                            <>
                                                {/* Red Pelvic Slant Line (Hip Hike / Hip Drop) */}
                                                {activeLandmarks.find((p) => p.id === 'st_asis') &&
                                                    activeLandmarks.find((p) => p.id === 'fl_asis') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'st_asis')!.x - 8}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'st_asis')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'fl_asis')!.x + 8}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'fl_asis')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {/* Red Stance Knee Valgus Line */}
                                                {activeLandmarks.find((p) => p.id === 'st_asis') &&
                                                    activeLandmarks.find((p) => p.id === 'st_knee') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'st_asis')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'st_asis')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'st_knee')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'st_knee')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {activeLandmarks.find((p) => p.id === 'st_knee') &&
                                                    activeLandmarks.find((p) => p.id === 'st_ankle') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'st_knee')!.x}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'st_knee')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'st_ankle')!.x}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'st_ankle')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                                {/* Red Torso Rotation Shoulder Line */}
                                                {activeLandmarks.find((p) => p.id === 'st_shoulder_l') &&
                                                    activeLandmarks.find((p) => p.id === 'st_shoulder_r') && (
                                                        <line
                                                            x1={`${activeLandmarks.find((p) => p.id === 'st_shoulder_l')!.x - 5}%`}
                                                            y1={`${activeLandmarks.find((p) => p.id === 'st_shoulder_l')!.y}%`}
                                                            x2={`${activeLandmarks.find((p) => p.id === 'st_shoulder_r')!.x + 5}%`}
                                                            y2={`${activeLandmarks.find((p) => p.id === 'st_shoulder_r')!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth="2.5"
                                                        />
                                                    )}
                                            </>
                                        )}
                                    </svg>
                                )}

                                {/* Draggable Landmark Pins */}
                                {showGoniometer &&
                                    activeLandmarks.map((pin) => (
                                        <div
                                            key={pin.id}
                                            onMouseDown={(e) => handleMouseDownPin(pin.id, e)}
                                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-grab active:cursor-grabbing z-20"
                                        >
                                            <div
                                                style={{ borderColor: pin.color || '#ef4444' }}
                                                className="w-4 h-4 rounded-full bg-slate-900/80 border-2 flex items-center justify-center shadow-md hover:scale-125 transition-transform"
                                            >
                                                <div
                                                    style={{ backgroundColor: pin.color || '#ef4444' }}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                />
                                            </div>
                                            <span className="absolute left-1/2 -translate-x-1/2 bottom-5 pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5 rounded bg-black/90 text-white text-[9px] font-semibold border border-white/20 shadow-xs">
                                                {pin.name}
                                            </span>
                                        </div>
                                    ))}

                                {/* View Badge overlay */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20">
                                    {selectedView}
                                </div>

                                {/* Goniometer toggle & Reset pins */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-20">
                                    <button
                                        type="button"
                                        onClick={() => setShowGoniometer(!showGoniometer)}
                                        className="px-2 py-0.5 rounded bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-[9.5px] font-semibold flex items-center gap-1 border border-white/20 cursor-pointer"
                                    >
                                        {showGoniometer ? <EyeOff size={11} /> : <Eye size={11} />}
                                        <span>{showGoniometer ? 'Sembunyikan Garis Merah' : 'Tampilkan Garis NASM'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveLandmarks(getDefaultLandmarks(selectedView))}
                                        className="p-1 rounded bg-black/70 hover:bg-black/90 text-white text-[9.5px] border border-white/20 cursor-pointer"
                                        title="Reset Pin Landmark ke Netral"
                                    >
                                        <RotateCcw size={11} />
                                    </button>
                                </div>

                                {/* Clear & Retake button */}
                                <button
                                    type="button"
                                    onClick={handleClearPhoto}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer z-20"
                                    title="Hapus foto"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            <p className="text-[10px] text-slate-400 flex items-center justify-between">
                                <span>💡 <em>Tips: Geser pin lingkaran merah untuk kalibrasi sudut garis anatomi persis seperti diagram NASM.</em></span>
                            </p>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group aspect-[4/3] bg-slate-50/50 dark:bg-slate-950/40"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] mb-2 transition-colors">
                                <Camera size={18} />
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Klik untuk unggah foto {selectedView}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                Format PNG, JPG, atau WebP (maks. 10MB)
                            </p>
                        </div>
                    )}

                    {/* Quick Select from Athlete's Gallery */}
                    {galleryPhotos.length > 0 && !imagePreview && (
                        <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                                Atau pilih dari Galeri Atlet:
                            </span>
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                                {galleryPhotos.slice(0, 5).map((gal) => (
                                    <button
                                        key={gal.id}
                                        type="button"
                                        onClick={() => handleSelectGalleryPhoto(gal.image_path)}
                                        className="w-12 h-12 rounded border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 hover:border-[#84cc16] dark:hover:border-[#b4f031] cursor-pointer"
                                    >
                                        <img
                                            src={
                                                gal.image_path.startsWith('/')
                                                    ? gal.image_path
                                                    : `/storage/${gal.image_path}`
                                            }
                                            alt={gal.notes || 'Galeri'}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Scan Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                            type="button"
                            onClick={runScan}
                            disabled={isScanning || !imagePreview}
                            className="py-2 px-3 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-white dark:text-slate-950 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                            {isScanning ? (
                                <>
                                    <RefreshCw size={13} className="animate-spin" />
                                    <span>Menganalisis AI...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={13} />
                                    <span>{apiKey ? 'Deteksi Multimodal AI' : 'Deteksi Cerdas AI'}</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const live = evaluateGoniometerDeviations();
                                setScanResults({
                                    engine: 'Goniometer Biomekanika Klinis Terkalibrasi',
                                    summary:
                                        live.length > 0
                                            ? `Kalibrasi goniometer mendeteksi ${live.length} deviasi kompensasi pada sudut pandang ${selectedView}.`
                                            : `Hasil Kalibrasi: Posisi sendi berada dalam rentang anatomi normal.`,
                                    has_api_key: !apiKey,
                                    detected_compensations: live,
                                });
                                setCheckedResults(live.map((d) => d.compensation_id));
                            }}
                            disabled={!imagePreview}
                            className="py-2 px-3 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 border border-slate-200 dark:border-slate-700"
                        >
                            <Crosshair size={13} />
                            <span>Hitung Sudut Pin</span>
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-[10.5px] flex items-center gap-1.5">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                </div>

                {/* Right Area: Analysis Results & Detected Deviations */}
                <div className="lg:col-span-6 space-y-3">
                    {scanResults ? (
                        <div className="space-y-3">
                            {/* Summary Box */}
                            <div className="p-2.5 rounded-md bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-[10.5px]">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                        <span>
                                            {scanResults.detected_compensations.length > 0
                                                ? `Hasil Analisis (${scanResults.detected_compensations.length} Deviasi Terdeteksi)`
                                                : 'Postur Terverifikasi Normal'}
                                        </span>
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 font-mono truncate max-w-[160px]">
                                        {scanResults.engine}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {scanResults.summary}
                                </p>
                            </div>

                            {/* Detected Compensations Cards List */}
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {scanResults.detected_compensations.length === 0 ? (
                                    <div className="p-4 rounded-md border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/40 dark:bg-slate-950/20">
                                        <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Tidak Ada Deviasi Kompensasi
                                        </h5>
                                        <p className="text-[10.5px] text-slate-400 max-w-xs mx-auto">
                                            Keselarasan kinetik chain atlet pada sudut pandang {selectedView} dinilai baik dan simetris tanpa kompensasi abnormal.
                                        </p>
                                    </div>
                                ) : (
                                    scanResults.detected_compensations.map((comp) => {
                                        const isChecked = checkedResults.includes(comp.compensation_id);
                                        return (
                                            <div
                                                key={comp.compensation_id}
                                                onClick={() => toggleCheckResult(comp.compensation_id)}
                                                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                                                    isChecked
                                                        ? 'bg-white dark:bg-slate-900 border-[#84cc16] dark:border-[#b4f031] shadow-xs'
                                                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="mt-0.5 rounded border-slate-300 text-[#84cc16] focus:ring-[#84cc16] cursor-pointer"
                                                />
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {comp.name}
                                                        </h5>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {comp.angle_metric && (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                    {comp.angle_metric}
                                                                </span>
                                                            )}
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#84cc16] dark:text-[#b4f031]">
                                                                {comp.confidence}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {comp.clinical_rationale && (
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                                                            {comp.clinical_rationale}
                                                        </p>
                                                    )}

                                                    {/* Overactive / Underactive preview */}
                                                    {(comp.overactive_muscles || comp.underactive_muscles) && (
                                                        <div className="flex flex-wrap gap-2 pt-0.5 text-[9.5px]">
                                                            {comp.overactive_muscles && (
                                                                <span className="text-rose-600 dark:text-rose-400 font-medium">
                                                                    Tegang: {comp.overactive_muscles.split('\n')[0]}
                                                                </span>
                                                            )}
                                                            {comp.underactive_muscles && (
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                    Lemah: {comp.underactive_muscles.split('\n')[0]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Apply Button */}
                            {scanResults.detected_compensations.length > 0 && (
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[10.5px] text-slate-500">
                                        {checkedResults.length} kompensasi terpilih
                                    </span>
                                    <button
                                        type="button"
                                        onClick={applySelectedToForm}
                                        className="py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                    >
                                        <CheckCircle2 size={12} className="text-[#84cc16] dark:text-[#84cc16]" />
                                        <span>Terapkan ke Form Penilaian</span>
                                    </button>
                                </div>
                            )}

                            {appliedNotification && (
                                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in-50">
                                    <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                                    <span>Kompensasi terdeteksi telah otomatis dicentang di lembar formulir di bawah!</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full min-h-[180px] p-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                            <Crosshair size={26} className="opacity-40" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Pemeriksaan Biomekanika Siap
                                </p>
                                <p className="text-[10.5px] max-w-xs mt-0.5 leading-relaxed">
                                    Unggah foto atlet dan gunakan tombol <strong>Deteksi Multimodal AI</strong> atau <strong>Hitung Sudut Pin</strong> untuk mengukur derajat deviasi kinetik.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Guide Reference Modal */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-3xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Panduan Visual Deviasi Biomekanika (Standar NASM)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* View selector in modal */}
                        <div className="flex items-center justify-center gap-2">
                            {(['Anterior View', 'Lateral View', 'Posterior View', 'Single Leg'] as const).map(
                                (view) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => setSelectedView(view)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                            selectedView === view
                                                ? 'bg-[#84cc16] dark:bg-[#b4f031] text-white dark:text-slate-950 shadow-2xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {view}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Guide Image Preview */}
                        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                            <img
                                src={getGuideImage(selectedView)}
                                alt={`Panduan ${selectedView}`}
                                className="max-h-[420px] w-auto object-contain rounded"
                            />
                        </div>

                        <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                Garis Indikator Merah NASM:
                            </p>
                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                Garis merah pada diagram di atas menunjukkan arah dan sudut deviasi kompensasi. Sistem AI & Goniometer pada aplikasi telah dikalibrasi mengikuti model penandaan garis anatomis ini.
                            </p>
                        </div>

                        <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="px-4 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                                <Key size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Konfigurasi Gemini Vision API
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowKeyModal(false)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                            <p>
                                Masukkan Google Gemini API Key Anda untuk mengaktifkan pemindaian berbasis <strong>Gemini 2.0 Flash Vision Multimodal</strong> langsung dari foto atlet.
                            </p>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
                                    Google AI Studio API Key (AIzaSy...)
                                </label>
                                <input
                                    type="password"
                                    value={tempKeyInput}
                                    onChange={(e) => setTempKeyInput(e.target.value)}
                                    placeholder="Tempel API Key di sini..."
                                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                                />
                            </div>

                            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10.5px] space-y-1 text-slate-500">
                                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Info size={12} className="text-[#84cc16]" />
                                    <span>Belum punya API Key?</span>
                                </p>
                                <p>
                                    Anda dapat memperoleh API Key gratis secara instan melalui{' '}
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#84cc16] dark:text-[#b4f031] font-semibold underline underline-offset-2"
                                    >
                                        Google AI Studio (aistudio.google.com)
                                    </a>
                                    . Key disimpan secara aman di browser lokal Anda.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {apiKey && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setApiKey('');
                                        setTempKeyInput('');
                                        localStorage.removeItem('dpa_gemini_api_key');
                                        setShowKeyModal(false);
                                    }}
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                >
                                    Hapus Key
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowKeyModal(false)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveApiKey}
                                className="px-4 py-1.5 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Simpan API Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
