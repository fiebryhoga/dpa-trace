import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Camera,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    X,
    RefreshCw,
    RotateCcw,
    Eye,
    EyeOff,
    Crosshair,
    Info,
    BookOpen,
    Sliders,
    Zap,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Target,
    Move,
    ChevronLeft,
    ChevronRight,
    Check,
    Upload,
    Trash2,
    Image as ImageIcon,
    Lock,
    Activity,
    ListChecks,
} from 'lucide-react';
import { AthleteGallery, DpaCompensation } from '@/types';
import { detectPoseFromImage } from '@/lib/poseDetection';
import BodyMuscleVisualizer from '@/Components/BodyMuscleVisualizer';

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
    possible_injuries?: string;
}

interface LandmarkPoint {
    id: string;
    name: string;
    x: number; // percentage 0-100 relative to image
    y: number; // percentage 0-100 relative to image
    color?: string;
}

interface SmartPostureScannerProps {
    athleteId?: number;
    athleteGender?: string;
    availableCompensations: DpaCompensation[];
    galleryPhotos?: AthleteGallery[];
    selectedCompensationIds: number[];
    onApplyCompensations: (newCompensationIds: number[]) => void;
    onStepPhotosChange?: (photos: Record<string, File>) => void;
}

type ViewType = 'Anterior View' | 'Lateral View' | 'Posterior View' | 'Single Leg';

export interface AssessmentStepConfig {
    view: ViewType;
    stepNumber: number;
    title: string;
    subtitle: string;
    badgeText: string;
    description: string;
}

export const ASSESSMENT_STEPS: AssessmentStepConfig[] = [
    {
        view: 'Anterior View',
        stepNumber: 1,
        title: 'Anterior',
        subtitle: 'Tampak Depan',
        badgeText: 'Langkah 1',
        description: 'Pemeriksaan deviasi kaki & lutut (Knee Valgus, Varus, Feet Turn Out, Pronasi Arkus)',
    },
    {
        view: 'Lateral View',
        stepNumber: 2,
        title: 'Lateral',
        subtitle: 'Tampak Samping',
        badgeText: 'Langkah 2',
        description: 'Pemeriksaan paralelisme Torso-Tibia (Lean), kelengkungan Lumbal (Arches/Rounds), & lengan',
    },
    {
        view: 'Posterior View',
        stepNumber: 3,
        title: 'Posterior',
        subtitle: 'Tampak Belakang',
        badgeText: 'Langkah 3',
        description: 'Pemeriksaan tendon Achilles (Feet Flatten), betis, & pergeseran asimetri panggul (PSIS Shift)',
    },
    {
        view: 'Single Leg',
        stepNumber: 4,
        title: 'Single Leg',
        subtitle: 'Squat 1 Kaki',
        badgeText: 'Langkah 4',
        description: 'Pemeriksaan stabilitas dinamis frontal plane, Pelvic Drop (Trendelenburg), & Dynamic Valgus',
    },
];

interface StepCacheItem {
    imageFile: File | null;
    imagePreview: string | null;
    selectedGalleryPhoto: string | null;
    landmarks: LandmarkPoint[];
    scanResults: {
        engine: string;
        summary: string;
        has_api_key?: boolean;
        detected_compensations: DetectedCompensation[];
        landmarks?: Array<{ name: string; x: number; y: number }>;
    } | null;
    checkedResults: number[];
    showGoniometer: boolean;
}

// Computer vision silhouette edge analyzer to detect physical spinal curvature (Rounds vs Arches)
function detectSpineContourOffset(
    img: HTMLImageElement,
    shoulder: { x: number; y: number },
    hip: { x: number; y: number },
    isFacingRight: boolean
): number {
    try {
        const canvas = document.createElement('canvas');
        const width = (canvas.width = 120);
        const height = (canvas.height = 120);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return 0;

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height).data;

        // Sample edge function: scans from margin outside the back towards the torso center
        const sampleEdgeX = (ratioY: number): number => {
            const py = Math.floor((hip.y * ratioY + shoulder.y * (1 - ratioY)) * (height / 100));
            const clampedY = Math.max(0, Math.min(height - 1, py));
            const straightX = Math.floor((hip.x * ratioY + shoulder.x * (1 - ratioY)) * (width / 100));

            // Background reference corner (left edge for facing right, right edge for facing left)
            const bgX = isFacingRight ? 1 : width - 2;
            const bgIdx = (clampedY * width + bgX) * 4;
            const bgR = imgData[bgIdx];
            const bgG = imgData[bgIdx + 1];
            const bgB = imgData[bgIdx + 2];

            const step = isFacingRight ? 1 : -1;
            const startX = isFacingRight ? 1 : width - 2;
            const endX = Math.max(1, Math.min(width - 2, straightX));

            let consecutive = 0;
            let firstDetectedX = straightX;

            for (let x = startX; isFacingRight ? x < endX : x > endX; x += step) {
                const idx = (clampedY * width + x) * 4;
                const r = imgData[idx];
                const g = imgData[idx + 1];
                const b = imgData[idx + 2];
                const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
                if (colorDiff > 45) {
                    consecutive++;
                    if (consecutive === 1) firstDetectedX = x;
                    // Require at least 5 consecutive non-background pixels to avoid catching thin annotation lines
                    if (consecutive >= 5) {
                        return (firstDetectedX / width) * 100;
                    }
                } else {
                    consecutive = 0;
                }
            }
            return (straightX / width) * 100;
        };

        const upperEdge = sampleEdgeX(0.25); // Thoracic spine (T4-T6)
        const lumbarEdge = sampleEdgeX(0.56); // Lumbar lordotic apex (L3-L5)
        const gluteEdge = sampleEdgeX(0.78); // Gluteal apex / Sacrum

        // Expected straight backline at lumbar level
        const t = (0.78 - 0.56) / (0.78 - 0.25); // 0.415
        const expectedLumbarEdge = gluteEdge + (upperEdge - gluteEdge) * t;

        // Curvature offset: positive if dipping anteriorly into body (Arches), negative if bulging posteriorly outward (Rounds)
        const archOffset = isFacingRight
            ? (lumbarEdge - expectedLumbarEdge)
            : (expectedLumbarEdge - lumbarEdge);

        if (isNaN(archOffset)) return 0;
        return Math.max(-8, Math.min(8, archOffset));
    } catch {
        return 0;
    }
}

export default function SmartPostureScanner({
    athleteId,
    athleteGender,
    availableCompensations = [],
    galleryPhotos = [],
    selectedCompensationIds = [],
    onApplyCompensations,
    onStepPhotosChange,
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
    const [showGalleryPicker, setShowGalleryPicker] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [analysisTab, setAnalysisTab] = useState<'list' | 'visual'>('list');

    // Multi-step cache to retain each step's photo and results across transitions
    const [stepCache, setStepCache] = useState<Record<ViewType, StepCacheItem>>({
        'Anterior View': { imageFile: null, imagePreview: null, selectedGalleryPhoto: null, landmarks: [], scanResults: null, checkedResults: [], showGoniometer: false },
        'Lateral View': { imageFile: null, imagePreview: null, selectedGalleryPhoto: null, landmarks: [], scanResults: null, checkedResults: [], showGoniometer: false },
        'Posterior View': { imageFile: null, imagePreview: null, selectedGalleryPhoto: null, landmarks: [], scanResults: null, checkedResults: [], showGoniometer: false },
        'Single Leg': { imageFile: null, imagePreview: null, selectedGalleryPhoto: null, landmarks: [], scanResults: null, checkedResults: [], showGoniometer: false },
    });

    // Goniometer & Landmark Pins state
    const [showGoniometer, setShowGoniometer] = useState(false);
    const [activeLandmarks, setActiveLandmarks] = useState<LandmarkPoint[]>([]);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const [pinSize, setPinSize] = useState<'sm' | 'md' | 'lg'>('sm');

    // Zoom & Pan Workspace state for small/distant photos
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPanPos, setStartPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Visual Reference Guide Modal
    const [showGuideModal, setShowGuideModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgElementRef = useRef<HTMLImageElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const currentStepIndex = ASSESSMENT_STEPS.findIndex((s) => s.view === selectedView);
    const currentStep = ASSESSMENT_STEPS[currentStepIndex] || ASSESSMENT_STEPS[0];
    const hasPrevStep = currentStepIndex > 0;
    const hasNextStep = currentStepIndex < ASSESSMENT_STEPS.length - 1;
    const prevStep = hasPrevStep ? ASSESSMENT_STEPS[currentStepIndex - 1] : null;
    const nextStep = hasNextStep ? ASSESSMENT_STEPS[currentStepIndex + 1] : null;
    const hasActivePhoto = Boolean(imagePreview || imageFile || selectedGalleryPhoto);

    // Step navigation and state caching across views
    const handleSwitchStep = useCallback(
        (targetView: ViewType) => {
            if (targetView === selectedView) return;

            const targetIdx = ASSESSMENT_STEPS.findIndex((s) => s.view === targetView);
            const currentIdx = ASSESSMENT_STEPS.findIndex((s) => s.view === selectedView);
            const hasCurrentPhoto = Boolean(imagePreview || imageFile || selectedGalleryPhoto);

            // Block proceeding to future steps if current step or any prior step lacks a photo
            if (targetIdx > currentIdx) {
                for (let i = 0; i < targetIdx; i++) {
                    const s = ASSESSMENT_STEPS[i];
                    const isCur = s.view === selectedView;
                    const hasPhoto = isCur
                        ? Boolean(imagePreview || imageFile || selectedGalleryPhoto)
                        : Boolean(stepCache[s.view]?.imagePreview || stepCache[s.view]?.imageFile || stepCache[s.view]?.selectedGalleryPhoto);

                    if (!hasPhoto) {
                        setErrorMsg(`Wajib unggah atau pilih foto untuk ${s.title} (${s.subtitle}) terlebih dahulu sebelum melanjutkan.`);
                        return;
                    }
                }
            }

            // 1. Save current active step state into stepCache
            setStepCache((prev) => ({
                ...prev,
                [selectedView]: {
                    imageFile,
                    imagePreview,
                    selectedGalleryPhoto,
                    landmarks: activeLandmarks,
                    scanResults,
                    checkedResults,
                    showGoniometer,
                },
            }));

            // 2. Load target step data from stepCache
            const targetState = stepCache[targetView];
            setSelectedView(targetView);
            setImageFile(targetState.imageFile);
            setImagePreview(targetState.imagePreview);
            setSelectedGalleryPhoto(targetState.selectedGalleryPhoto);
            setActiveLandmarks(targetState.landmarks);
            setScanResults(targetState.scanResults);
            setCheckedResults(targetState.checkedResults);
            setShowGoniometer(targetState.showGoniometer);
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
            setErrorMsg(null);
        },
        [
            selectedView,
            imageFile,
            imagePreview,
            selectedGalleryPhoto,
            activeLandmarks,
            scanResults,
            checkedResults,
            showGoniometer,
            stepCache,
        ]
    );

    const goToPrevStep = () => {
        if (hasPrevStep && prevStep) {
            handleSwitchStep(prevStep.view);
        }
    };

    const goToNextStep = () => {
        if (!hasActivePhoto) {
            setErrorMsg(`Wajib unggah foto untuk ${currentStep.title} (${currentStep.subtitle}) terlebih dahulu.`);
            return;
        }
        if (hasNextStep && nextStep) {
            handleSwitchStep(nextStep.view);
        }
    };

    // Helper to auto-focus / zoom on detected body bounding box
    const handleAutoFocusBody = useCallback((landmarksToUse?: LandmarkPoint[]) => {
        const lms = landmarksToUse || activeLandmarks;
        if (lms.length === 0) return;

        let minX = 100, maxX = 0, minY = 100, maxY = 0;
        lms.forEach((pt) => {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
        });

        const spanX = Math.max(12, maxX - minX);
        const spanY = Math.max(15, maxY - minY);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Determine comfortable zoom (e.g. 1.5x - 3x depending on body span)
        const targetZoom = Math.min(3.2, Math.max(1.3, 75 / Math.max(spanX, spanY * 0.75)));
        setZoomLevel(Number(targetZoom.toFixed(2)));

        // Center on athlete body
        const shiftX = (50 - centerX) * (targetZoom * 2.2);
        const shiftY = (50 - centerY) * (targetZoom * 2.2);
        setPanOffset({ x: shiftX, y: shiftY });
    }, [activeLandmarks]);

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(4, Number((prev + 0.35).toFixed(2))));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => {
            const next = Math.max(1, Number((prev - 0.35).toFixed(2)));
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    };

    // Helper to find landmark by keyword
    const findLandmark = useCallback(
        (keywords: string[]): LandmarkPoint | undefined => {
            return activeLandmarks.find((lm) => {
                const lower = lm.name.toLowerCase();
                return keywords.some((k) => lower.includes(k.toLowerCase()));
            });
        },
        [activeLandmarks]
    );

    // Baseline fallback landmarks for manual calibration mode
    const getDefaultLandmarksForManual = useCallback((view: ViewType): LandmarkPoint[] => {
        if (view === 'Anterior View') {
            return [
                { id: 'r_asis', name: 'Right ASIS', x: 42, y: 46, color: '#38bdf8' },
                { id: 'l_asis', name: 'Left ASIS', x: 58, y: 46, color: '#38bdf8' },
                { id: 'r_knee', name: 'Right Knee', x: 43, y: 68, color: '#ef4444' },
                { id: 'l_knee', name: 'Left Knee', x: 57, y: 68, color: '#ef4444' },
                { id: 'r_ankle', name: 'Right Ankle', x: 42, y: 88, color: '#84cc16' },
                { id: 'l_ankle', name: 'Left Ankle', x: 58, y: 88, color: '#84cc16' },
                { id: 'r_toe', name: 'Right Toe', x: 40, y: 94, color: '#ef4444' },
                { id: 'l_toe', name: 'Left Toe', x: 60, y: 94, color: '#ef4444' },
            ];
        }
        if (view === 'Lateral View') {
            return [
                { id: 'ear', name: 'Ear', x: 48, y: 15, color: '#a855f7' },
                { id: 'shoulder', name: 'Shoulder', x: 46, y: 28, color: '#38bdf8' },
                { id: 'wrist', name: 'Wrist', x: 70, y: 30, color: '#ef4444' },
                { id: 'hip', name: 'Hip', x: 40, y: 52, color: '#ef4444' },
                { id: 'knee', name: 'Knee', x: 54, y: 70, color: '#ef4444' },
                { id: 'ankle', name: 'Ankle', x: 48, y: 88, color: '#84cc16' },
            ];
        }
        if (view === 'Posterior View') {
            return [
                { id: 'c7', name: 'C7 (Spine Midline)', x: 50, y: 22, color: '#ef4444' },
                { id: 'l_psis', name: 'Left PSIS (Pelvis)', x: 44, y: 48, color: '#ef4444' },
                { id: 'r_psis', name: 'Right PSIS (Pelvis)', x: 56, y: 48, color: '#ef4444' },
                { id: 'l_calf', name: 'Left Calf', x: 44, y: 72, color: '#ef4444' },
                { id: 'r_calf', name: 'Right Calf', x: 56, y: 72, color: '#ef4444' },
                { id: 'l_ankle', name: 'Left Ankle', x: 43.5, y: 86, color: '#84cc16' },
                { id: 'r_ankle', name: 'Right Ankle', x: 56.5, y: 86, color: '#84cc16' },
                { id: 'l_calcaneus', name: 'Left Calcaneus (Heel)', x: 42, y: 92, color: '#ef4444' },
                { id: 'r_calcaneus', name: 'Right Calcaneus (Heel)', x: 58, y: 92, color: '#ef4444' },
            ];
        }
        // Single Leg
        return [
            { id: 'st_asis', name: 'Stance ASIS', x: 46, y: 48, color: '#ef4444' },
            { id: 'fl_asis', name: 'Floating ASIS', x: 55, y: 50, color: '#ef4444' },
            { id: 'st_knee', name: 'Stance Knee', x: 46, y: 69, color: '#ef4444' },
            { id: 'st_ankle', name: 'Stance Ankle', x: 46, y: 88, color: '#84cc16' },
            { id: 'l_shoulder', name: 'Left Shoulder', x: 42, y: 26, color: '#ef4444' },
            { id: 'r_shoulder', name: 'Right Shoulder', x: 58, y: 26, color: '#ef4444' },
        ];
    }, []);

    // Photos dictionary for all steps to submit with assessment form
    const [stepPhotos, setStepPhotos] = useState<Record<string, File>>({});

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setSelectedGalleryPhoto(null);
            setImagePreview(URL.createObjectURL(file));
            setScanResults(null);
            setErrorMsg(null);
            setActiveLandmarks([]);
            setShowGoniometer(false);

            const updated = {
                ...stepPhotos,
                [selectedView]: file,
            };
            setStepPhotos(updated);
            if (onStepPhotosChange) {
                onStepPhotosChange(updated);
            }
        }
    };

    const handleSelectGalleryPhoto = (photoPath: string) => {
        setSelectedGalleryPhoto(photoPath);
        setImageFile(null);
        const url = photoPath.startsWith('/') ? photoPath : `/storage/${photoPath}`;
        setImagePreview(url);
        setScanResults(null);
        setErrorMsg(null);
        setActiveLandmarks([]);
        setShowGoniometer(false);
    };

    const handleClearPhoto = () => {
        setImageFile(null);
        setSelectedGalleryPhoto(null);
        setImagePreview(null);
        setScanResults(null);
        setErrorMsg(null);
        setActiveLandmarks([]);
        setShowGoniometer(false);
        if (fileInputRef.current) fileInputRef.current.value = '';

        const updated = { ...stepPhotos };
        delete updated[selectedView];
        setStepPhotos(updated);
        if (onStepPhotosChange) {
            onStepPhotosChange(updated);
        }
    };

    // Calculate angles from user-adjusted pins with scale-invariant trigonometric degree metrics
    const evaluateGoniometerDeviations = useCallback(
        (customPins?: LandmarkPoint[], customView?: ViewType): DetectedCompensation[] => {
            const pinsToUse = customPins && customPins.length > 0 ? customPins : activeLandmarks;
            const viewCategory = customView || selectedView;

            const findPin = (keywords: string[]): LandmarkPoint | undefined => {
                return pinsToUse.find((lm) => {
                    const lower = lm.name.toLowerCase();
                    return keywords.some((k) => lower.includes(k.toLowerCase()));
                });
            };

            const detected: DetectedCompensation[] = [];

            if (viewCategory === 'Anterior View') {
                const lAsis = findPin(['left asis', 'l. asis', 'l_asis']);
                const rAsis = findPin(['right asis', 'r. asis', 'r_asis']);
                const lKnee = findPin(['left knee', 'l. knee', 'l_patella', 'l_knee']);
                const rKnee = findPin(['right knee', 'r. knee', 'r_patella', 'r_knee']);
                const lAnkle = findPin(['left ankle', 'l. ankle', 'l_ankle']);
                const rAnkle = findPin(['right ankle', 'r. ankle', 'r_ankle']);
                const lToe = findPin(['left toe', 'l. toe', 'l_toe']);
                const rToe = findPin(['right toe', 'r. toe', 'r_toe']);

                if (lAsis && lKnee && lAnkle && rAsis && rKnee && rAnkle) {
                    // Left Leg (anatomical Left is on the right side of image)
                    const lTotalY = Math.max(1, lAnkle.y - lAsis.y);
                    const lKneeRatio = Math.max(0, Math.min(1, (lKnee.y - lAsis.y) / lTotalY));
                    const lExpectedKneeX = lAsis.x + (lAnkle.x - lAsis.x) * lKneeRatio;
                    // Medial is towards center / left (smaller X)
                    const lMedialDisplacement = lExpectedKneeX - lKnee.x;

                    const lFemurAngle = Math.atan2(lKnee.x - lAsis.x, Math.max(1, lKnee.y - lAsis.y)) * (180 / Math.PI);
                    const lTibiaAngle = Math.atan2(lAnkle.x - lKnee.x, Math.max(1, lAnkle.y - lKnee.y)) * (180 / Math.PI);
                    // Positive when knee caves medial
                    const lValgusKinkAngle = lTibiaAngle - lFemurAngle;

                    // Right Leg (anatomical Right is on the left side of image)
                    const rTotalY = Math.max(1, rAnkle.y - rAsis.y);
                    const rKneeRatio = Math.max(0, Math.min(1, (rKnee.y - rAsis.y) / rTotalY));
                    const rExpectedKneeX = rAsis.x + (rAnkle.x - rAsis.x) * rKneeRatio;
                    // Medial is towards center / right (larger X)
                    const rMedialDisplacement = rKnee.x - rExpectedKneeX;

                    const rFemurAngle = Math.atan2(rKnee.x - rAsis.x, Math.max(1, rKnee.y - rAsis.y)) * (180 / Math.PI);
                    const rTibiaAngle = Math.atan2(rAnkle.x - rKnee.x, Math.max(1, rAnkle.y - rKnee.y)) * (180 / Math.PI);
                    // Positive when knee caves medial
                    const rValgusKinkAngle = rFemurAngle - rTibiaAngle;

                    // Valgus (Move Inward): Requires knee to collapse medially past ASIS-Ankle neutral axis
                    const isLeftValgus = lMedialDisplacement >= 2.5 && lValgusKinkAngle >= 6.0;
                    const isRightValgus = rMedialDisplacement >= 2.5 && rValgusKinkAngle >= 6.0;

                    // Varus (Move Outward): Knee bows excessively outward past natural squat tracking
                    const isLeftVarus = lMedialDisplacement <= -6.0 && lValgusKinkAngle <= -14.0;
                    const isRightVarus = rMedialDisplacement <= -6.0 && rValgusKinkAngle <= -14.0;

                    if (isLeftValgus || isRightValgus) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Anterior View' &&
                                (c.name.toLowerCase().includes('valgus') || c.name.toLowerCase().includes('inward'))
                        );
                        if (comp) {
                            const maxValgusKink = Math.max(
                                isLeftValgus ? lValgusKinkAngle : 0,
                                isRightValgus ? rValgusKinkAngle : 0
                            );
                            const deg = Math.max(6.0, maxValgusKink).toFixed(1);
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Lutut (Knee)',
                                confidence: 95,
                                severity: Number(deg) > 14 ? 'Severe' : 'Moderate',
                                side: isLeftValgus && isRightValgus ? 'Bilateral' : isLeftValgus ? 'Left' : 'Right',
                                angle_metric: `Dynamic Valgus ${deg}° Medial`,
                                clinical_rationale: `Sumbu patella kolaps ke arah medial melewati garis netral ASIS-Ankle saat squat, indikasi kelemahan gluteus medius/VMO.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
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
                                checkpoint: comp.checkpoint || 'Lutut (Knee)',
                                confidence: 91,
                                severity: 'Moderate',
                                side: isLeftVarus && isRightVarus ? 'Bilateral' : isLeftVarus ? 'Left' : 'Right',
                                angle_metric: `Genu Varum Lateral`,
                                clinical_rationale: `Lutut bergerak ke lateral keluar dari sumbu kaki akibat ketegangan piriformis dan gluteus minimus.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                if (lToe && lAnkle && rToe && rAnkle) {
                    const lTurnoutAngle = Math.atan2(lToe.x - lAnkle.x, Math.max(1, lToe.y - lAnkle.y)) * (180 / Math.PI);
                    const rTurnoutAngle = Math.atan2(rAnkle.x - rToe.x, Math.max(1, rToe.y - rAnkle.y)) * (180 / Math.PI);

                    if (lTurnoutAngle > 12.0 || rTurnoutAngle > 12.0) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Anterior View' &&
                                c.name.toLowerCase().includes('turn out')
                        );
                        if (comp) {
                            const deg = Math.max(lTurnoutAngle, rTurnoutAngle).toFixed(1);
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Kaki & Ankle',
                                confidence: 93,
                                severity: Number(deg) > 20 ? 'Severe' : 'Moderate',
                                side: lTurnoutAngle > 12.0 && rTurnoutAngle > 12.0 ? 'Bilateral' : lTurnoutAngle > 12.0 ? 'Left' : 'Right',
                                angle_metric: `Rotasi Eksternal ${deg}°`,
                                clinical_rationale: `Jari kaki berotasi ke arah lateral keluar melewati batas netral 12-15° akibat ketegangan gastrocnemius lateral dan soleus.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }

                    // Check Feet Flatten (Pronation) in Anterior View - Ankle collapses medial past knee-toe trajectory
                    if (lKnee && lAnkle && lToe && rKnee && rAnkle && rToe) {
                        const lTibialRatio = (lToe.y - lAnkle.y) / Math.max(1, lAnkle.y - lKnee.y);
                        const lExpectedToeX = lAnkle.x + (lAnkle.x - lKnee.x) * lTibialRatio;
                        const lArchCollapse = lAnkle.x - lExpectedToeX;

                        const rTibialRatio = (rToe.y - rAnkle.y) / Math.max(1, rAnkle.y - rKnee.y);
                        const rExpectedToeX = rAnkle.x + (rAnkle.x - rKnee.x) * rTibialRatio;
                        const rArchCollapse = rExpectedToeX - rAnkle.x;

                        const isLeftPronate = lArchCollapse > 4.5;
                        const isRightPronate = rArchCollapse > 4.5;

                        if (isLeftPronate || isRightPronate) {
                            const comp = availableCompensations.find(
                                (c) =>
                                    c.category === 'Anterior View' &&
                                    c.name.toLowerCase().includes('flatten')
                            );
                            if (comp && !detected.some(d => d.compensation_id === comp.id)) {
                                const side = isLeftPronate && isRightPronate ? 'Bilateral' : isLeftPronate ? 'Left' : 'Right';
                                detected.push({
                                    compensation_id: comp.id,
                                    name: comp.name,
                                    checkpoint: comp.checkpoint || 'Kaki & Ankle',
                                    confidence: 92,
                                    severity: 'Moderate',
                                    side: side,
                                    angle_metric: `Pronasi Arkus Medial (${side})`,
                                    clinical_rationale: `Lengkung medial longitudinal kaki kolaps ke arah lantai akibat overaktivitas kompleks peroneus dan kelemahan tibialis anterior/posterior.`,
                                    overactive_muscles: comp.overactive_muscles,
                                    underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                                });
                            }
                        }
                    }
                }
            } else if (viewCategory === 'Lateral View') {
                const ear = findPin(['ear', 'tragus', 'head']);
                const shoulder = findPin(['shoulder', 'acromion']);
                const wrist = findPin(['wrist', 'hand', 'arm']);
                const lumbar = findPin(['lumbar', 'low back', 'spine', 'l3', 'l5']);
                const hip = findPin(['hip', 'trochanter', 'pelvis']);
                const knee = findPin(['knee']);
                const ankle = findPin(['ankle', 'malleolus']);

                // Determine facing direction (facing right: knee is to the right of ankle, or shoulder to right of hip)
                let isFacingRight = true;
                if (knee && ankle) {
                    isFacingRight = knee.x >= ankle.x;
                } else if (shoulder && hip) {
                    isFacingRight = shoulder.x >= hip.x;
                }
                const sign = isFacingRight ? 1 : -1;

                let trunkAngleDeg = 0;
                let hasTrunk = false;

                if (shoulder && hip) {
                    const trunkDeltaX = sign * (shoulder.x - hip.x);
                    const trunkDeltaY = hip.y - shoulder.y;
                    trunkAngleDeg = Math.atan2(trunkDeltaX, Math.max(1, trunkDeltaY)) * (180 / Math.PI);
                    hasTrunk = true;
                }

                // 1. Excessive Forward Lean (Torso vs Tibia Parallelism)
                if (hasTrunk && knee && ankle && shoulder && hip) {
                    const tibiaDeltaX = sign * (knee.x - ankle.x);
                    const tibiaDeltaY = ankle.y - knee.y;
                    const tibiaAngleDeg = Math.atan2(tibiaDeltaX, Math.max(1, tibiaDeltaY)) * (180 / Math.PI);

                    // Forward lean excess: Torso tilts forward significantly more than tibia line
                    const forwardLeanExcess = trunkAngleDeg - tibiaAngleDeg;

                    if (forwardLeanExcess >= 16.0) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Lateral View' &&
                                c.name.toLowerCase().includes('forward lean')
                        );
                        if (comp) {
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC / Torso',
                                confidence: 94,
                                severity: forwardLeanExcess > 24 ? 'Severe' : 'Moderate',
                                side: 'Bilateral',
                                angle_metric: `Non-Paralel ${forwardLeanExcess.toFixed(1)}° (Torso ${trunkAngleDeg.toFixed(1)}° vs Tibia ${tibiaAngleDeg.toFixed(1)}°)`,
                                clinical_rationale: `Garis torso tidak paralel dengan sumbu tibia (condong ke depan lebih besar ${forwardLeanExcess.toFixed(1)}°), indikasi kelemahan erector spinae dan defisit mobilitas dorsofleksi ankle.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                // 2. Arms Fall Forward (Arms relative to Torso Axis)
                if (shoulder && wrist) {
                    const armDeltaX = sign * (wrist.x - shoulder.x);
                    const armDeltaY = shoulder.y - wrist.y;
                    const armAngleDeg = Math.atan2(armDeltaX, Math.max(1, armDeltaY)) * (180 / Math.PI);

                    // Arms Fall Forward is when the arm drops anteriorly/forward relative to the torso line
                    // When in line with torso, (armAngleDeg - trunkAngleDeg) is around 0°.
                    // When arms fall forward, armAngleDeg increases dramatically relative to trunkAngleDeg.
                    const armDeviationFromTorso = hasTrunk ? (armAngleDeg - trunkAngleDeg) : armAngleDeg;

                    if (armDeviationFromTorso >= 18.0) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Lateral View' &&
                                c.name.toLowerCase().includes('arms fall')
                        );
                        if (comp) {
                            const devDeg = Math.abs(armDeviationFromTorso).toFixed(1);
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Bahu & Lengan',
                                confidence: 93,
                                severity: Number(devDeg) > 28 ? 'Severe' : 'Moderate',
                                side: 'Bilateral',
                                angle_metric: `Deviasi Lengan ${devDeg}° ke Depan`,
                                clinical_rationale: `Lengan jatuh ke depan (${devDeg}° deviasi dari bidang torso) akibat hiperaktivitas latissimus dorsi, teres major, dan pectoralis major serta kelemahan lower trapezius/rhomboid.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                // 3. Low Back (LPHC - Lumbar Spine Curvature Evaluation)
                if (shoulder && hip && lumbar) {
                    // Height ratio from Hip to Shoulder (in SVG coordinates, hip.y > shoulder.y)
                    const totalYDist = Math.max(1, hip.y - shoulder.y);
                    const lumbarYRatio = Math.max(0, Math.min(1, (hip.y - lumbar.y) / totalYDist));
                    const expectedLumbarX = hip.x + (shoulder.x - hip.x) * lumbarYRatio;

                    // Positive offset means curved anteriorly (forward/lordosis), negative means curved posteriorly (backward/kyphosis)
                    const lumbarOffset = sign * (lumbar.x - expectedLumbarX);

                    // Angular flexion/extension of lumbar spine
                    const lowerTrunkAngle = Math.atan2(sign * (lumbar.x - hip.x), Math.max(1, hip.y - lumbar.y)) * (180 / Math.PI);
                    const upperTrunkAngle = Math.atan2(sign * (shoulder.x - lumbar.x), Math.max(1, lumbar.y - shoulder.y)) * (180 / Math.PI);
                    const lumbarCurvatureAngle = Math.abs(upperTrunkAngle - lowerTrunkAngle);

                    if (lumbarOffset >= 1.5 || (lumbarOffset >= 1.0 && lumbarCurvatureAngle >= 4.5)) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Lateral View' &&
                                (c.name.toLowerCase().includes('low back arches') || c.name.toLowerCase().includes('arches'))
                        );
                        if (comp && !detected.some((d) => d.compensation_id === comp.id)) {
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC',
                                confidence: 94,
                                severity: lumbarOffset > 3.5 ? 'Severe' : 'Moderate',
                                side: 'Bilateral',
                                angle_metric: `Hiperlordosis Lumbal (${lumbarCurvatureAngle.toFixed(1)}°)`,
                                clinical_rationale: `Punggung bawah melengkung ke anterior (Low Back Arches / Hiperlordosis) akibat overaktivitas hip flexors dan erector spinae serta kelemahan gluteus maximus dan otot core intrinsik.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    } else if (lumbarOffset <= -1.5 || (lumbarOffset <= -1.0 && lumbarCurvatureAngle >= 4.5)) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Lateral View' &&
                                (c.name.toLowerCase().includes('low back rounds') || c.name.toLowerCase().includes('rounds'))
                        );
                        if (comp && !detected.some((d) => d.compensation_id === comp.id)) {
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC',
                                confidence: 93,
                                severity: lumbarOffset < -3.5 ? 'Severe' : 'Moderate',
                                side: 'Bilateral',
                                angle_metric: `Fleksi Lumbal / Butt Wink (${lumbarCurvatureAngle.toFixed(1)}°)`,
                                clinical_rationale: `Punggung bawah membulat/fleksi ke posterior (Low Back Rounds / Butt Wink) akibat overaktivitas hamstrings dan rectus abdominis serta kelemahan erector spinae dan gluteus maximus.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }
            } else if (viewCategory === 'Posterior View') {
                const c7 = findPin(['c7', 'spine', 'head']);
                const lPsis = findPin(['left psis', 'l. psis', 'l_psis']);
                const rPsis = findPin(['right psis', 'r. psis', 'r_psis']);
                const lCalf = findPin(['left calf', 'l. calf', 'l_calf', 'left knee', 'l_knee']);
                const rCalf = findPin(['right calf', 'r. calf', 'r_calf', 'right knee', 'r_knee']);
                const lAnkle = findPin(['left ankle', 'l. ankle', 'l_ankle']);
                const rAnkle = findPin(['right ankle', 'r. ankle', 'r_ankle']);
                const lCalc = findPin(['left calcaneus', 'l. calcaneus', 'l_calcaneus', 'left heel']);
                const rCalc = findPin(['right calcaneus', 'r. calcaneus', 'r_calcaneus', 'right heel']);

                // 1. Asymmetrical Weight Shift (Strictly evaluated by PSIS Pelvic Slant)
                if (lPsis && rPsis) {
                    const deltaX = rPsis.x - lPsis.x;
                    const deltaY = rPsis.y - lPsis.y; // Positive if right PSIS is lower
                    const pelvicSlantDeg = Math.atan2(deltaY, Math.max(1, Math.abs(deltaX))) * (180 / Math.PI);

                    if (Math.abs(pelvicSlantDeg) >= 2.8) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Posterior View' &&
                                (c.name.toLowerCase().includes('weight shift') || c.name.toLowerCase().includes('shift') || c.name.toLowerCase().includes('asymmetrical'))
                        );
                        if (comp) {
                            const isRightLower = pelvicSlantDeg > 0;
                            const primarySide = isRightLower ? 'Right' : 'Left';
                            const slantSideText = isRightLower ? 'Panggul Kanan Lebih Rendah' : 'Panggul Kiri Lebih Rendah';

                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC (Lumbar-Pelvic-Hip Complex)',
                                confidence: 96,
                                severity: Math.abs(pelvicSlantDeg) > 5 ? 'Severe' : 'Moderate',
                                side: primarySide,
                                angle_metric: `Kemiringan PSIS ${Math.abs(pelvicSlantDeg).toFixed(1)}° (${slantSideText})`,
                                clinical_rationale: `Kemiringan garis panggul PSIS sebesar ${Math.abs(pelvicSlantDeg).toFixed(1)}° (${slantSideText}) menunjukkan pergeseran asimetris beban panggul (Asymmetrical Weight Shift) ke sisi ${primarySide}, indikasi overaktivitas adductor/QL kontralateral dan kelemahan gluteus medius.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                // 2. Foot Flattens in Posterior View (Eversion of Calcaneus & Achilles angle kink / Medial Arch Collapse)
                if (lAnkle && rAnkle && (lCalc || rCalc)) {
                    const lCalfPt = lCalf || { x: lAnkle.x, y: lAnkle.y - 18 };
                    const rCalfPt = rCalf || { x: rAnkle.x, y: rAnkle.y - 18 };

                    let isLeftFlatten = false;
                    let isRightFlatten = false;

                    if (lCalc) {
                        const calfAngle = Math.atan2(lAnkle.x - lCalfPt.x, Math.max(1, lAnkle.y - lCalfPt.y)) * (180 / Math.PI);
                        const heelAngle = Math.atan2(lCalc.x - lAnkle.x, Math.max(1, lCalc.y - lAnkle.y)) * (180 / Math.PI);
                        const kinkAngle = Math.abs(heelAngle - calfAngle);

                        const expectedAnkleX = lCalfPt.x + (lCalc.x - lCalfPt.x) * ((lAnkle.y - lCalfPt.y) / Math.max(1, lCalc.y - lCalfPt.y));
                        const medialOffset = Math.abs(lAnkle.x - expectedAnkleX);

                        if (kinkAngle >= 7.0 || (kinkAngle >= 5.0 && medialOffset >= 2.8)) {
                            isLeftFlatten = true;
                        }
                    }

                    if (rCalc) {
                        const calfAngle = Math.atan2(rAnkle.x - rCalfPt.x, Math.max(1, rAnkle.y - rCalfPt.y)) * (180 / Math.PI);
                        const heelAngle = Math.atan2(rCalc.x - rAnkle.x, Math.max(1, rCalc.y - rAnkle.y)) * (180 / Math.PI);
                        const kinkAngle = Math.abs(heelAngle - calfAngle);

                        const expectedAnkleX = rCalfPt.x + (rCalc.x - rCalfPt.x) * ((rAnkle.y - rCalfPt.y) / Math.max(1, rCalc.y - rCalfPt.y));
                        const medialOffset = Math.abs(rAnkle.x - expectedAnkleX);

                        if (kinkAngle >= 7.0 || (kinkAngle >= 5.0 && medialOffset >= 2.8)) {
                            isRightFlatten = true;
                        }
                    }

                    if (isLeftFlatten || isRightFlatten) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Posterior View' &&
                                (c.name.toLowerCase().includes('flatten') || c.name.toLowerCase().includes('feet'))
                        );
                        if (comp && !detected.some(d => d.compensation_id === comp.id)) {
                            const side = isLeftFlatten && isRightFlatten ? 'Bilateral' : isLeftFlatten ? 'Left' : 'Right';
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Foot & Ankle',
                                confidence: 96,
                                severity: 'Moderate',
                                side: side,
                                angle_metric: `Eversi Calcaneus & Deviasi Tendon Achilles`,
                                clinical_rationale: `Tendon achilles mengalami deviasi eversi lateral akibat keruntuhan arkus medial kaki (Feet Flatten) saat menahan beban squat.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                // 3. Heel of Foot Rises in Posterior View (Only triggered when heel is genuinely elevated off the ground)
                if (lCalc || rCalc) {
                    const lToePt = findPin(['left toe', 'l. toe', 'l_toe']);
                    const rToePt = findPin(['right toe', 'r. toe', 'r_toe']);

                    let isLeftHeelRise = false;
                    let isRightHeelRise = false;

                    if (lCalc) {
                        if (lToePt) {
                            // Heel is lifted noticeably higher than toe contact point
                            isLeftHeelRise = (lToePt.y - lCalc.y) > 4.5;
                        } else if (lAnkle) {
                            // If manually dragged significantly above the ankle joint
                            isLeftHeelRise = lCalc.y < lAnkle.y - 2.0;
                        }
                    }

                    if (rCalc) {
                        if (rToePt) {
                            // Heel is lifted noticeably higher than toe contact point
                            isRightHeelRise = (rToePt.y - rCalc.y) > 4.5;
                        } else if (rAnkle) {
                            // If manually dragged significantly above the ankle joint
                            isRightHeelRise = rCalc.y < rAnkle.y - 2.0;
                        }
                    }

                    if (isLeftHeelRise || isRightHeelRise) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Posterior View' &&
                                (c.name.toLowerCase().includes('heel') || c.name.toLowerCase().includes('rises'))
                        );
                        if (comp && !detected.some((d) => d.compensation_id === comp.id)) {
                            const side = isLeftHeelRise && isRightHeelRise ? 'Bilateral' : isLeftHeelRise ? 'Left' : 'Right';
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Foot & Ankle',
                                confidence: 95,
                                severity: 'Moderate',
                                side: side,
                                angle_metric: `Elevasi Tumit (${side})`,
                                clinical_rationale: `Tumit (calcaneus) terangkat dari lantai saat squat, indikasi keterbatasan dorsofleksi talocrural akibat overaktivitas gastrocnemius & soleus serta kelemahan anterior tibialis.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }
            } else {
                // Single Leg
                const stAsis = findPin(['stance asis', 'st_asis', 'stance hip']);
                const flAsis = findPin(['floating asis', 'fl_asis', 'floating hip']);
                const stKnee = findPin(['stance knee', 'st_knee']);
                const stAnkle = findPin(['stance ankle', 'st_ankle']);

                if (stAsis && flAsis) {
                    const pelvicTiltAngle = Math.atan2(flAsis.y - stAsis.y, Math.max(1, Math.abs(flAsis.x - stAsis.x))) * (180 / Math.PI);
                    if (pelvicTiltAngle > 3.5) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Single Leg' &&
                                c.name.toLowerCase().includes('hip drop')
                        );
                        if (comp) {
                            const deg = pelvicTiltAngle.toFixed(1);
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC',
                                confidence: 95,
                                severity: Number(deg) > 7 ? 'Severe' : 'Moderate',
                                side: 'Right',
                                angle_metric: `Pelvic Drop ${deg}°`,
                                clinical_rationale: `Panggul kontralateral turun (Trendelenburg sign) menandakan kelemahan gluteus medius pada kaki tumpuan.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    } else if (pelvicTiltAngle < -3.5) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Single Leg' &&
                                c.name.toLowerCase().includes('hip hike')
                        );
                        if (comp) {
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'LPHC',
                                confidence: 92,
                                severity: 'Moderate',
                                side: 'Left',
                                angle_metric: `Hip Hike ${Math.abs(pelvicTiltAngle).toFixed(1)}°`,
                                clinical_rationale: `Panggul terangkat naik (Hip Hike) akibat overaktivitas quadratus lumborum kontralateral.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }

                if (stKnee && stAnkle) {
                    const valgusAngle = Math.atan2(stKnee.x - stAnkle.x, Math.max(1, stAnkle.y - stKnee.y)) * (180 / Math.PI);
                    if (Math.abs(valgusAngle) > 3.5) {
                        const comp = availableCompensations.find(
                            (c) =>
                                c.category === 'Single Leg' &&
                                (c.name.toLowerCase().includes('valgus') || c.name.toLowerCase().includes('inward'))
                        );
                        if (comp) {
                            detected.push({
                                compensation_id: comp.id,
                                name: comp.name,
                                checkpoint: comp.checkpoint || 'Lutut (Knee)',
                                confidence: 96,
                                severity: 'Severe',
                                side: 'Left',
                                angle_metric: `Dynamic Valgus ${Math.abs(valgusAngle * 2.5).toFixed(1)}°`,
                                clinical_rationale: `Instabilitas frontal plane lutut saat Single Leg Squat, kolaps ke medial akibat defisit stabilisasi hip abductor.`,
                                overactive_muscles: comp.overactive_muscles,
                                underactive_muscles: comp.underactive_muscles,
                                possible_injuries: comp.possible_injuries,
                            });
                        }
                    }
                }
            }

            return detected;
        },
        [activeLandmarks, selectedView, availableCompensations]
    );

    // Pin dragging and workspace pan handlers
    const handleMouseDownPin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingPointId(id);
    };

    const handleViewportMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel > 1 && !draggingPointId) {
            setIsPanning(true);
            setStartPanPos({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingPointId && imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            const x = Math.max(0.5, Math.min(99.5, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0.5, Math.min(99.5, ((e.clientY - rect.top) / rect.height) * 100));

            setActiveLandmarks((prev) =>
                prev.map((pt) => (pt.id === draggingPointId ? { ...pt, x, y } : pt))
            );
        } else if (isPanning) {
            setPanOffset({
                x: e.clientX - startPanPos.x,
                y: e.clientY - startPanPos.y,
            });
        }
    };

    const handleMouseUp = () => {
        if (isPanning) {
            setIsPanning(false);
        }
        if (draggingPointId) {
            setDraggingPointId(null);
            const liveDetected = evaluateGoniometerDeviations();
            setScanResults({
                engine: 'MediaPipe Vision AI + Goniometer',
                summary:
                    liveDetected.length > 0
                        ? `Kalibrasi manual mendeteksi ${liveDetected.length} deviasi kompensasi pada sudut pandang ${selectedView}.`
                        : `Kalibrasi manual: Posisi sendi berada dalam rentang normal (tidak ada kompensasi signifikan).`,
                detected_compensations: liveDetected,
            });
            if (liveDetected.length > 0) {
                const detectedIds = liveDetected.map((d) => d.compensation_id);
                onApplyCompensations(Array.from(new Set([...selectedCompensationIds, ...detectedIds])));
            }
        }
    };

    // Run AI Scan with MediaPipe in-browser Computer Vision
    const runScan = async () => {
        if (!imagePreview) {
            setErrorMsg('Silakan pilih atau unggah foto postur terlebih dahulu.');
            return;
        }

        setIsScanning(true);
        setErrorMsg(null);

        try {
            // 1. Run real in-browser Google MediaPipe Pose Detection
            let mediaPipeLandmarks: any[] | null = null;
            if (imgElementRef.current) {
                try {
                    mediaPipeLandmarks = await detectPoseFromImage(imgElementRef.current);
                } catch (e) {
                    console.warn('MediaPipe detection fallback:', e);
                }
            }

            let mappedPins: LandmarkPoint[] = [];
            let activeViewToUse: ViewType = selectedView;

            if (mediaPipeLandmarks && mediaPipeLandmarks.length >= 33) {
                const mp = mediaPipeLandmarks;

                // Auto-detect Single Leg pose if one foot is lifted
                const leftAnkleY = mp[27].y;
                const rightAnkleY = mp[28].y;
                const isSingleLegPose = Math.abs(leftAnkleY - rightAnkleY) > 0.08;

                if (isSingleLegPose && selectedView === 'Anterior View') {
                    activeViewToUse = 'Single Leg';
                    setSelectedView('Single Leg');
                }

                if (activeViewToUse === 'Single Leg' || isSingleLegPose) {
                    const isLeftStance = leftAnkleY > rightAnkleY;
                    const stIdx = isLeftStance ? 27 : 28;
                    const flIdx = isLeftStance ? 28 : 27;
                    const stHipIdx = isLeftStance ? 23 : 24;
                    const flHipIdx = isLeftStance ? 24 : 23;
                    const stKneeIdx = isLeftStance ? 25 : 26;

                    mappedPins = [
                        { id: 'st_asis', name: 'Stance ASIS', x: mp[stHipIdx].x * 100, y: mp[stHipIdx].y * 100, color: '#ef4444' },
                        { id: 'fl_asis', name: 'Floating ASIS', x: mp[flHipIdx].x * 100, y: mp[flHipIdx].y * 100, color: '#ef4444' },
                        { id: 'st_knee', name: 'Stance Knee', x: mp[stKneeIdx].x * 100, y: mp[stKneeIdx].y * 100, color: '#ef4444' },
                        { id: 'st_ankle', name: 'Stance Ankle', x: mp[stIdx].x * 100, y: mp[stIdx].y * 100, color: '#84cc16' },
                        { id: 'l_shoulder', name: 'Left Shoulder', x: mp[11].x * 100, y: mp[11].y * 100, color: '#ef4444' },
                        { id: 'r_shoulder', name: 'Right Shoulder', x: mp[12].x * 100, y: mp[12].y * 100, color: '#ef4444' },
                    ];
                } else if (activeViewToUse === 'Lateral View') {
                    // Choose most visible side (left or right)
                    const useLeft = mp[11].visibility >= mp[12].visibility;
                    const shIdx = useLeft ? 11 : 12;
                    const wrIdx = useLeft ? 15 : 16;
                    const hpIdx = useLeft ? 23 : 24;
                    const knIdx = useLeft ? 25 : 26;
                    const akIdx = useLeft ? 27 : 28;
                    const earIdx = useLeft ? 7 : 8;

                    // Determine facing direction
                    const isFacingRight = (mp[knIdx].x >= mp[akIdx].x) || (mp[shIdx].x >= mp[hpIdx].x);

                    const shPt = { x: mp[shIdx].x * 100, y: mp[shIdx].y * 100 };
                    const hpPt = { x: mp[hpIdx].x * 100, y: mp[hpIdx].y * 100 };
                    const baseLmbX = shPt.x * 0.38 + hpPt.x * 0.62;
                    const baseLmbY = shPt.y * 0.38 + hpPt.y * 0.62;

                    // Analyze physical spinal contour offset from image silhouette
                    let contourOffset = 0;
                    if (imgElementRef.current) {
                        contourOffset = detectSpineContourOffset(imgElementRef.current, shPt, hpPt, isFacingRight);
                    }

                    // Shift lumbar pin along the detected physical back contour (contourOffset > 0 shifts anteriorly into arch)
                    const adjustedLmbX = baseLmbX + (isFacingRight ? contourOffset * 0.8 : -contourOffset * 0.8);

                    mappedPins = [
                        { id: 'ear', name: 'Ear', x: mp[earIdx].x * 100, y: mp[earIdx].y * 100, color: '#a855f7' },
                        { id: 'shoulder', name: 'Shoulder', x: shPt.x, y: shPt.y, color: '#38bdf8' },
                        { id: 'wrist', name: 'Wrist', x: mp[wrIdx].x * 100, y: mp[wrIdx].y * 100, color: '#ef4444' },
                        { id: 'lumbar', name: 'Lumbar Spine (L3-L5)', x: adjustedLmbX, y: baseLmbY, color: '#f59e0b' },
                        { id: 'hip', name: 'Hip', x: hpPt.x, y: hpPt.y, color: '#ef4444' },
                        { id: 'knee', name: 'Knee', x: mp[knIdx].x * 100, y: mp[knIdx].y * 100, color: '#ef4444' },
                        { id: 'ankle', name: 'Ankle', x: mp[akIdx].x * 100, y: mp[akIdx].y * 100, color: '#84cc16' },
                    ];
                } else if (activeViewToUse === 'Posterior View') {
                    mappedPins = [
                        { id: 'c7', name: 'C7 (Spine Midline)', x: ((mp[11].x + mp[12].x) / 2) * 100, y: ((mp[11].y + mp[12].y) / 2) * 100, color: '#ef4444' },
                        { id: 'l_psis', name: 'Left PSIS', x: mp[23].x * 100, y: mp[23].y * 100, color: '#ef4444' },
                        { id: 'r_psis', name: 'Right PSIS', x: mp[24].x * 100, y: mp[24].y * 100, color: '#ef4444' },
                        { id: 'l_calf', name: 'Left Calf', x: (mp[25].x * 0.25 + mp[27].x * 0.75) * 100, y: (mp[25].y * 0.25 + mp[27].y * 0.75) * 100, color: '#ef4444' },
                        { id: 'r_calf', name: 'Right Calf', x: (mp[26].x * 0.25 + mp[28].x * 0.75) * 100, y: (mp[26].y * 0.25 + mp[28].y * 0.75) * 100, color: '#ef4444' },
                        { id: 'l_ankle', name: 'Left Ankle', x: mp[27].x * 100, y: mp[27].y * 100, color: '#84cc16' },
                        { id: 'r_ankle', name: 'Right Ankle', x: mp[28].x * 100, y: mp[28].y * 100, color: '#84cc16' },
                        { id: 'l_calcaneus', name: 'Left Calcaneus', x: mp[29].x * 100, y: mp[29].y * 100, color: '#ef4444' },
                        { id: 'r_calcaneus', name: 'Right Calcaneus', x: mp[30].x * 100, y: mp[30].y * 100, color: '#ef4444' },
                    ];
                } else {
                    // Anterior View
                    mappedPins = [
                        { id: 'l_asis', name: 'Left ASIS', x: mp[23].x * 100, y: mp[23].y * 100, color: '#38bdf8' },
                        { id: 'r_asis', name: 'Right ASIS', x: mp[24].x * 100, y: mp[24].y * 100, color: '#38bdf8' },
                        { id: 'l_knee', name: 'Left Knee', x: mp[25].x * 100, y: mp[25].y * 100, color: '#ef4444' },
                        { id: 'r_knee', name: 'Right Knee', x: mp[26].x * 100, y: mp[26].y * 100, color: '#ef4444' },
                        { id: 'l_ankle', name: 'Left Ankle', x: mp[27].x * 100, y: mp[27].y * 100, color: '#84cc16' },
                        { id: 'r_ankle', name: 'Right Ankle', x: mp[28].x * 100, y: mp[28].y * 100, color: '#84cc16' },
                        { id: 'l_toe', name: 'Left Toe', x: mp[31].x * 100, y: mp[31].y * 100, color: '#ef4444' },
                        { id: 'r_toe', name: 'Right Toe', x: mp[32].x * 100, y: mp[32].y * 100, color: '#ef4444' },
                    ];
                }

                setActiveLandmarks(mappedPins);
                setShowGoniometer(true);
                handleAutoFocusBody(mappedPins);
            }

            // 2. Call backend for comprehensive NASM kinematic scoring
            const formData = new FormData();
            formData.append('view_category', activeViewToUse);
            if (athleteId) formData.append('athlete_id', String(athleteId));

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (selectedGalleryPhoto) {
                formData.append('image_path', selectedGalleryPhoto);
            }

            const response = await axios.post(route('dpa.analyze-posture'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data?.success) {
                const res = response.data;

                // If MediaPipe was used, evaluate angles using real detected coordinates
                if (mappedPins.length > 0) {
                    const liveDetected = evaluateGoniometerDeviations(mappedPins, activeViewToUse);

                    setScanResults({
                        engine: 'Google MediaPipe Computer Vision AI',
                        summary:
                            liveDetected.length > 0
                                ? `Deteksi AI anatomi mendeteksi ${liveDetected.length} deviasi kompensasi pada sudut pandang ${activeViewToUse}.`
                                : `Deteksi AI anatomi: Persendian atlet berada dalam rentang anatomi normal (tidak ada deviasi signifikan).`,
                        detected_compensations: liveDetected,
                    });
                    if (liveDetected.length > 0) {
                        const detectedIds = liveDetected.map((d: DetectedCompensation) => d.compensation_id);
                        onApplyCompensations(Array.from(new Set([...selectedCompensationIds, ...detectedIds])));
                    }
                } else {
                    setScanResults(res);
                    const allIds = (res.detected_compensations || []).map(
                        (d: DetectedCompensation) => d.compensation_id
                    );
                    if (allIds.length > 0) {
                        onApplyCompensations(Array.from(new Set([...selectedCompensationIds, ...allIds])));
                    }
                }
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
        if (selectedCompensationIds.includes(id)) {
            onApplyCompensations(selectedCompensationIds.filter((item) => item !== id));
        } else {
            onApplyCompensations([...selectedCompensationIds, id]);
        }
    };

    const getGuideImage = (view: ViewType) => {
        if (view === 'Anterior View') return '/images/dpa-guides/anterior_guide.png';
        if (view === 'Lateral View') return '/images/dpa-guides/lateral_guide.png';
        if (view === 'Posterior View') return '/images/dpa-guides/posterior_guide.png';
        return '/images/dpa-guides/single_leg_guide.png';
    };

    // Specific landmark lookup helpers for SVG lines
    const lAsis = findLandmark(['left asis', 'l. asis', 'l_asis']);
    const rAsis = findLandmark(['right asis', 'r. asis', 'r_asis']);
    const lKnee = findLandmark(['left knee', 'l. knee', 'l_patella', 'l_knee']);
    const rKnee = findLandmark(['right knee', 'r. knee', 'r_patella', 'r_knee']);
    const lAnkle = findLandmark(['left ankle', 'l. ankle', 'l_ankle']);
    const rAnkle = findLandmark(['right ankle', 'r. ankle', 'r_ankle']);
    const lToe = findLandmark(['left toe', 'l. toe', 'l_toe']);
    const rToe = findLandmark(['right toe', 'r. toe', 'r_toe']);

    const ear = findLandmark(['ear', 'tragus', 'head']);
    const shoulder = findLandmark(['shoulder', 'acromion']);
    const wrist = findLandmark(['wrist', 'hand', 'arm']);
    const lumbar = findLandmark(['lumbar', 'low back', 'spine', 'l3', 'l5']);
    const hip = findLandmark(['hip', 'trochanter', 'pelvis']);
    const kneeLat = findLandmark(['knee']);
    const ankleLat = findLandmark(['ankle', 'malleolus']);

    const c7 = findLandmark(['c7', 'spine', 'head']);
    const lPsis = findLandmark(['left psis', 'l. psis', 'l_psis']);
    const rPsis = findLandmark(['right psis', 'r. psis', 'r_psis']);
    const lCalf = findLandmark(['left calf', 'l. calf', 'l_calf', 'left knee', 'l_knee']);
    const rCalf = findLandmark(['right calf', 'r. calf', 'r_calf', 'right knee', 'r_knee']);
    const lCalc = findLandmark(['left calcaneus', 'l. calcaneus', 'l_calcaneus', 'left heel']);
    const rCalc = findLandmark(['right calcaneus', 'r. calcaneus', 'r_calcaneus', 'right heel']);

    const stAsis = findLandmark(['stance asis', 'st_asis', 'stance hip']);
    const flAsis = findLandmark(['floating asis', 'fl_asis', 'floating hip']);
    const stKnee = findLandmark(['stance knee', 'st_knee']);
    const stAnkle = findLandmark(['stance ankle', 'st_ankle']);
    const lShoulder = findLandmark(['left shoulder', 'l_shoulder']);
    const rShoulder = findLandmark(['right shoulder', 'r_shoulder']);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#84cc16]/10 dark:bg-[#b4f031]/10 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                Smart AI Posture Scanner
                            </h4>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#84cc16] dark:text-[#b4f031] flex items-center gap-1">
                                <Zap size={10} />
                                MediaPipe Vision AI
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Deteksi anatomi tubuh otomatis dengan Google Computer Vision & kalkulasi garis kompensasi NASM
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="self-start sm:self-auto px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#84cc16] dark:hover:border-[#b4f031]"
                    title="Lihat Clue Gambar Standar NASM"
                >
                    <BookOpen size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                    <span>Panduan NASM</span>
                </button>
            </div>

            {/* Sleek Segmented Stepper Bar (4 Sudut Pandang) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-950/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
                {ASSESSMENT_STEPS.map((step, idx) => {
                    const isActive = selectedView === step.view;
                    const cached = stepCache[step.view];
                    const hasStepPhoto = Boolean(
                        (isActive && (imagePreview || imageFile || selectedGalleryPhoto)) ||
                        (cached && (cached.imagePreview || cached.imageFile || cached.selectedGalleryPhoto))
                    );
                    const isCompleted = Boolean(
                        (cached && (cached.scanResults || cached.imagePreview)) || (isActive && (scanResults || imagePreview))
                    );
                    const detectedCount = isActive
                        ? scanResults?.detected_compensations.length
                        : cached?.scanResults?.detected_compensations.length;

                    // Locked if prior steps don't have photos
                    let isLocked = false;
                    if (idx > currentStepIndex) {
                        for (let i = 0; i < idx; i++) {
                            const s = ASSESSMENT_STEPS[i];
                            const isCur = s.view === selectedView;
                            const hasPhoto = isCur
                                ? Boolean(imagePreview || imageFile || selectedGalleryPhoto)
                                : Boolean(stepCache[s.view]?.imagePreview || stepCache[s.view]?.imageFile || stepCache[s.view]?.selectedGalleryPhoto);
                            if (!hasPhoto) {
                                isLocked = true;
                                break;
                            }
                        }
                    }

                    return (
                        <button
                            key={step.view}
                            type="button"
                            onClick={() => handleSwitchStep(step.view)}
                            disabled={isLocked}
                            title={isLocked ? `Langkah ${step.stepNumber} terkunci: Lengkapi foto langkah sebelumnya terlebih dahulu` : undefined}
                            className={`py-2 px-3 rounded-md text-left transition-all flex items-center justify-between gap-2 ${
                                isActive
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold border border-slate-200/60 dark:border-slate-700'
                                    : isLocked
                                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50 bg-slate-50/50 dark:bg-slate-900/30'
                                    : isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-800/50 cursor-pointer'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40 cursor-pointer'
                            }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                        hasStepPhoto
                                            ? 'bg-[#84cc16] text-slate-950 font-bold'
                                            : isActive
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                            : isLocked
                                            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                    }`}
                                >
                                    {isLocked ? <Lock size={10} /> : hasStepPhoto ? <Check size={11} /> : step.stepNumber}
                                </span>
                                <div className="min-w-0">
                                    <div className="text-xs truncate">{step.title}</div>
                                    <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                                        {step.subtitle}
                                    </div>
                                </div>
                            </div>

                            {/* Status / Photo Indicator */}
                            <div className="shrink-0 flex items-center gap-1">
                                {hasStepPhoto ? (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                                        <ImageIcon size={9} />
                                        <span>
                                            {typeof detectedCount === 'number' && detectedCount > 0
                                                ? `${detectedCount} deviasi`
                                                : 'Foto Siap'}
                                        </span>
                                    </span>
                                ) : isLocked ? (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                        <Lock size={8} />
                                        <span>Terkunci</span>
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                        Wajib Foto
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Upload & Preview Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
                {/* Left Area: Photo Dropzone / Image Viewer */}
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
                            {/* Wrapper fitted strictly to the rendered image aspect ratio with interactive Zoom & Pan */}
                            <div
                                ref={viewportRef}
                                onMouseDown={handleViewportMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className={`flex justify-center items-center bg-slate-950 rounded-lg p-2 border border-slate-200 dark:border-slate-800 min-h-[340px] max-h-[500px] overflow-hidden relative select-none ${
                                    zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                                }`}
                            >
                                <div
                                    ref={imageContainerRef}
                                    style={{
                                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                                        transformOrigin: 'center center',
                                        transition: isPanning || draggingPointId ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    }}
                                    className="relative inline-block select-none"
                                >
                                    <img
                                        ref={imgElementRef}
                                        src={imagePreview}
                                        alt="Posture Scan"
                                        className="max-h-[440px] w-auto max-w-full block rounded object-contain pointer-events-none"
                                    />

                                    {/* Exact Red & Green Guide Lines mapped 100% on the image itself */}
                                    {showGoniometer && activeLandmarks.length > 0 && (
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                            <defs>
                                                <marker
                                                    id="shift-arrow"
                                                    viewBox="0 0 10 10"
                                                    refX="6"
                                                    refY="5"
                                                    markerWidth="6"
                                                    markerHeight="6"
                                                    orient="auto-start-reverse"
                                                >
                                                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
                                                </marker>
                                            </defs>

                                            {selectedView === 'Anterior View' && (
                                                <>
                                                    {lAsis && lKnee && (
                                                        <line
                                                            x1={`${lAsis.x}%`}
                                                            y1={`${lAsis.y}%`}
                                                            x2={`${lKnee.x}%`}
                                                            y2={`${lKnee.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {lKnee && lAnkle && (
                                                        <line
                                                            x1={`${lKnee.x}%`}
                                                            y1={`${lKnee.y}%`}
                                                            x2={`${lAnkle.x}%`}
                                                            y2={`${lAnkle.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {rAsis && rKnee && (
                                                        <line
                                                            x1={`${rAsis.x}%`}
                                                            y1={`${rAsis.y}%`}
                                                            x2={`${rKnee.x}%`}
                                                            y2={`${rKnee.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {rKnee && rAnkle && (
                                                        <line
                                                            x1={`${rKnee.x}%`}
                                                            y1={`${rKnee.y}%`}
                                                            x2={`${rAnkle.x}%`}
                                                            y2={`${rAnkle.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {lAnkle && lToe && (
                                                        <line
                                                            x1={`${lAnkle.x}%`}
                                                            y1={`${lAnkle.y}%`}
                                                            x2={`${lToe.x}%`}
                                                            y2={`${lToe.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {rAnkle && rToe && (
                                                        <line
                                                            x1={`${rAnkle.x}%`}
                                                            y1={`${rAnkle.y}%`}
                                                            x2={`${rToe.x}%`}
                                                            y2={`${rToe.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {selectedView === 'Lateral View' && (
                                                <>
                                                    {/* Torso Spine Line: Hip -> Lumbar -> Shoulder */}
                                                    {lumbar ? (
                                                        <>
                                                            {hip && lumbar && (
                                                                <line
                                                                    x1={`${hip.x}%`}
                                                                    y1={`${hip.y}%`}
                                                                    x2={`${lumbar.x}%`}
                                                                    y2={`${lumbar.y}%`}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                                />
                                                            )}
                                                            {lumbar && shoulder && (
                                                                <line
                                                                    x1={`${lumbar.x}%`}
                                                                    y1={`${lumbar.y}%`}
                                                                    x2={`${shoulder.x}%`}
                                                                    y2={`${shoulder.y}%`}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        hip && shoulder && (
                                                            <line
                                                                x1={`${hip.x}%`}
                                                                y1={`${hip.y}%`}
                                                                x2={`${shoulder.x}%`}
                                                                y2={`${shoulder.y}%`}
                                                                stroke="#ef4444"
                                                                strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                            />
                                                        )
                                                    )}
                                                    {ankleLat && kneeLat && (
                                                        <line
                                                            x1={`${ankleLat.x}%`}
                                                            y1={`${ankleLat.y}%`}
                                                            x2={`${kneeLat.x}%`}
                                                            y2={`${kneeLat.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {shoulder && wrist && (
                                                        <line
                                                            x1={`${shoulder.x}%`}
                                                            y1={`${shoulder.y}%`}
                                                            x2={`${wrist.x}%`}
                                                            y2={`${wrist.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {/* Cervical/Head alignment: Shoulder to Ear (Dashed Line) */}
                                                    {shoulder && ear && (
                                                        <line
                                                            x1={`${shoulder.x}%`}
                                                            y1={`${shoulder.y}%`}
                                                            x2={`${ear.x}%`}
                                                            y2={`${ear.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                            strokeDasharray="4 3"
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {selectedView === 'Posterior View' && (
                                                <>
                                                    {/* 1. Asymmetrical Weight Shift: Vertical C7 Plumbline */}
                                                    {c7 && (
                                                        <line
                                                            x1={`${c7.x}%`}
                                                            y1={`${c7.y}%`}
                                                            x2={`${c7.x}%`}
                                                            y2="96%"
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.2 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                            strokeDasharray="5 3"
                                                        />
                                                    )}
                                                    {/* Pelvis Transverse / Slanted Line across PSIS */}
                                                    {lPsis && rPsis && (
                                                        <>
                                                            <line
                                                                x1={`${lPsis.x - (rPsis.x - lPsis.x) * 0.45}%`}
                                                                y1={`${lPsis.y - (rPsis.y - lPsis.y) * 0.45}%`}
                                                                x2={`${rPsis.x + (rPsis.x - lPsis.x) * 0.45}%`}
                                                                y2={`${rPsis.y + (rPsis.y - lPsis.y) * 0.45}%`}
                                                                stroke="#ef4444"
                                                                strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                            />
                                                            {/* Lateral Shift Arrow if PSIS is tilted */}
                                                            {c7 && Math.abs(rPsis.y - lPsis.y) > 0.8 && (
                                                                <line
                                                                    x1={`${c7.x}%`}
                                                                    y1={`${(lPsis.y + rPsis.y) / 2 + 3.5}%`}
                                                                    x2={`${(lPsis.x + rPsis.x) / 2 + (rPsis.y > lPsis.y ? 7 : -7)}%`}
                                                                    y2={`${(lPsis.y + rPsis.y) / 2 + 3.5}%`}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                                    markerEnd="url(#shift-arrow)"
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    {/* 2. Feet Flatten: 2-segment Achilles Tendon Eversion Kink */}
                                                    {/* Left Leg: Calf -> Ankle -> Calcaneus */}
                                                    {(lCalf || lKnee) && (lAnkle || lCalc) && (
                                                        <line
                                                            x1={`${(lCalf || lKnee)!.x}%`}
                                                            y1={`${(lCalf || lKnee)!.y}%`}
                                                            x2={`${(lAnkle || lCalc)!.x}%`}
                                                            y2={`${(lAnkle || lCalc)!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {lAnkle && lCalc && (
                                                        <line
                                                            x1={`${lAnkle.x}%`}
                                                            y1={`${lAnkle.y}%`}
                                                            x2={`${lCalc.x}%`}
                                                            y2={`${lCalc.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {/* Right Leg: Calf -> Ankle -> Calcaneus */}
                                                    {(rCalf || rKnee) && (rAnkle || rCalc) && (
                                                        <line
                                                            x1={`${(rCalf || rKnee)!.x}%`}
                                                            y1={`${(rCalf || rKnee)!.y}%`}
                                                            x2={`${(rAnkle || rCalc)!.x}%`}
                                                            y2={`${(rAnkle || rCalc)!.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {rAnkle && rCalc && (
                                                        <line
                                                            x1={`${rAnkle.x}%`}
                                                            y1={`${rAnkle.y}%`}
                                                            x2={`${rCalc.x}%`}
                                                            y2={`${rCalc.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {/* 3. Heel Rise: Red Highlight Rings at Calcaneus (Only when Heel Rise is active/detected) */}
                                                    {scanResults?.detected_compensations?.some(c => c.name.toLowerCase().includes('heel') || c.name.toLowerCase().includes('rises')) && (
                                                        <>
                                                            {lCalc && (
                                                                <circle
                                                                    cx={`${lCalc.x}%`}
                                                                    cy={`${lCalc.y}%`}
                                                                    r={14 / Math.sqrt(zoomLevel)}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                                    fill="none"
                                                                    strokeDasharray="4 2"
                                                                />
                                                            )}
                                                            {rCalc && (
                                                                <circle
                                                                    cx={`${rCalc.x}%`}
                                                                    cy={`${rCalc.y}%`}
                                                                    r={14 / Math.sqrt(zoomLevel)}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                                    fill="none"
                                                                    strokeDasharray="4 2"
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {selectedView === 'Single Leg' && (
                                                <>
                                                    {stAsis && flAsis && (
                                                        <line
                                                            x1={`${stAsis.x - 8}%`}
                                                            y1={`${stAsis.y}%`}
                                                            x2={`${flAsis.x + 8}%`}
                                                            y2={`${flAsis.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {stAsis && stKnee && (
                                                        <line
                                                            x1={`${stAsis.x}%`}
                                                            y1={`${stAsis.y}%`}
                                                            x2={`${stKnee.x}%`}
                                                            y2={`${stKnee.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {stKnee && stAnkle && (
                                                        <line
                                                            x1={`${stKnee.x}%`}
                                                            y1={`${stKnee.y}%`}
                                                            x2={`${stAnkle.x}%`}
                                                            y2={`${stAnkle.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.4 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                    {lShoulder && rShoulder && (
                                                        <line
                                                            x1={`${lShoulder.x - 5}%`}
                                                            y1={`${lShoulder.y}%`}
                                                            x2={`${rShoulder.x + 5}%`}
                                                            y2={`${rShoulder.y}%`}
                                                            stroke="#ef4444"
                                                            strokeWidth={(2.0 / Math.sqrt(zoomLevel)).toFixed(2)}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </svg>
                                    )}

                                    {/* Draggable Landmark Pins with flexible size and zoom-invariant counter-scaling */}
                                    {showGoniometer &&
                                        activeLandmarks.map((pin) => {
                                            const pinDims = {
                                                sm: { base: 11, inner: 3.5, border: 1.5 },
                                                md: { base: 15, inner: 5, border: 2 },
                                                lg: { base: 20, inner: 7, border: 2.5 },
                                            }[pinSize];
                                            const counterScale = (1 / zoomLevel).toFixed(3);

                                            return (
                                                <div
                                                    key={pin.id}
                                                    onMouseDown={(e) => handleMouseDownPin(pin.id, e)}
                                                    style={{
                                                        left: `${pin.x}%`,
                                                        top: `${pin.y}%`,
                                                        transform: `translate(-50%, -50%) scale(${counterScale})`,
                                                        transformOrigin: 'center center',
                                                    }}
                                                    className="absolute group/pin cursor-grab active:cursor-grabbing z-20 select-none"
                                                >
                                                    <div
                                                        style={{
                                                            width: `${pinDims.base}px`,
                                                            height: `${pinDims.base}px`,
                                                            borderWidth: `${pinDims.border}px`,
                                                            borderColor: pin.color || '#ef4444',
                                                        }}
                                                        className="rounded-full bg-slate-900/90 flex items-center justify-center shadow-md hover:scale-125 transition-transform"
                                                    >
                                                        <div
                                                            style={{
                                                                width: `${pinDims.inner}px`,
                                                                height: `${pinDims.inner}px`,
                                                                backgroundColor: pin.color || '#ef4444',
                                                            }}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-5 pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5 rounded bg-black/90 text-white text-[9px] font-semibold border border-white/20 shadow-xs z-30">
                                                        {pin.name}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                </div>

                                {/* Floating View Badge overlay */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20 z-30">
                                    {selectedView}
                                </div>

                                {/* Floating Zoom & Pan Toolbar */}
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2 py-1 rounded-md border border-white/20 z-30 text-white text-[10px]">
                                    {activeLandmarks.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleAutoFocusBody()}
                                            className="px-1.5 py-0.5 rounded bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                            title="Fokus otomatis perbesar ke tubuh atlet"
                                        >
                                            <Target size={11} />
                                            <span>Fokus Tubuh</span>
                                        </button>
                                    )}

                                    {/* Flexible Pin Size Selector */}
                                    <div
                                        className="flex items-center gap-0.5 bg-white/10 rounded p-0.5"
                                        title="Ubah ukuran titik pin goniometer"
                                    >
                                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                                            <button
                                                key={sz}
                                                type="button"
                                                onClick={() => setPinSize(sz)}
                                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase transition-colors cursor-pointer ${
                                                    pinSize === sz
                                                        ? 'bg-[#84cc16] text-slate-950 shadow-xs'
                                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                                }`}
                                            >
                                                {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Sedang' : 'Besar'}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 1}
                                        className="p-1 rounded hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                                        title="Perkecil (Zoom Out)"
                                    >
                                        <ZoomOut size={12} />
                                    </button>

                                    <span className="font-mono text-[9.5px] px-0.5 min-w-[32px] text-center font-bold">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 4}
                                        className="p-1 rounded hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                                        title="Perbesar (Zoom In)"
                                    >
                                        <ZoomIn size={12} />
                                    </button>

                                    {zoomLevel > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleResetZoom}
                                            className="p-1 rounded hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                                            title="Reset Skala Normal"
                                        >
                                            <Maximize2 size={12} />
                                        </button>
                                    )}
                                </div>

                                {/* Bottom toggles inside preview box */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-30">
                                    {activeLandmarks.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowGoniometer(!showGoniometer)}
                                            className="px-2 py-0.5 rounded bg-black/75 hover:bg-black/95 backdrop-blur-xs text-white text-[9.5px] font-semibold flex items-center gap-1 border border-white/20 cursor-pointer"
                                        >
                                            {showGoniometer ? <EyeOff size={11} /> : <Eye size={11} />}
                                            <span>{showGoniometer ? 'Sembunyikan Garis' : 'Tampilkan Garis'}</span>
                                        </button>
                                    )}

                                    {activeLandmarks.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const defaults = getDefaultLandmarksForManual(selectedView);
                                                setActiveLandmarks(defaults);
                                                setShowGoniometer(true);
                                                handleAutoFocusBody(defaults);
                                            }}
                                            className="px-2 py-0.5 rounded bg-black/75 hover:bg-black/95 backdrop-blur-xs text-white text-[9.5px] font-semibold flex items-center gap-1 border border-white/20 cursor-pointer"
                                        >
                                            <Sliders size={11} />
                                            <span>Atur Pin Manual</span>
                                        </button>
                                    )}

                                    {activeLandmarks.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const defaults = getDefaultLandmarksForManual(selectedView);
                                                setActiveLandmarks(defaults);
                                                handleAutoFocusBody(defaults);
                                            }}
                                            className="p-1 rounded bg-black/75 hover:bg-black/95 text-white text-[9.5px] border border-white/20 cursor-pointer"
                                            title="Reset Pin Landmark"
                                        >
                                            <RotateCcw size={11} />
                                        </button>
                                    )}

                                    {zoomLevel > 1 && (
                                        <span className="text-[9px] text-white/70 bg-black/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Move size={9} />
                                            <span>Geser kanvas untuk panning</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Prominent Photo Control Toolbar (Ganti Foto, Galeri, Hapus) */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs"
                                        title="Unggah foto baru untuk menggantikan foto saat ini"
                                    >
                                        <Upload size={13} className="text-[#84cc16] dark:text-[#b4f031]" />
                                        <span>Ganti Foto</span>
                                    </button>

                                    {galleryPhotos.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowGalleryPicker(!showGalleryPicker)}
                                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                                showGalleryPicker
                                                    ? 'bg-[#84cc16]/15 border-[#84cc16] text-[#84cc16] dark:text-[#b4f031]'
                                                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                            }`}
                                            title="Pilih dari galeri foto atlet"
                                        >
                                            <ImageIcon size={13} />
                                            <span>Galeri ({galleryPhotos.length})</span>
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClearPhoto}
                                    className="px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                                    title="Hapus foto saat ini"
                                >
                                    <Trash2 size={13} />
                                    <span>Hapus</span>
                                </button>
                            </div>

                            {/* Gallery Drawer when toggled */}
                            {showGalleryPicker && galleryPhotos.length > 0 && (
                                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        <span>Pilih Foto dari Galeri Atlet:</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowGalleryPicker(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {galleryPhotos.map((gal) => (
                                            <button
                                                key={gal.id}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectGalleryPhoto(gal.image_path);
                                                    setShowGalleryPicker(false);
                                                }}
                                                className={`w-14 h-14 rounded-md border overflow-hidden shrink-0 transition-all cursor-pointer ${
                                                    selectedGalleryPhoto === gal.image_path
                                                        ? 'border-[#84cc16] ring-2 ring-[#84cc16]/40'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-[#84cc16]'
                                                }`}
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
                        </div>
                    ) : (
                        <div className="space-y-2">
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
                                <p className="text-[10.5px] text-slate-400 mt-0.5">
                                    Wajib foto • Format PNG, JPG, atau WebP (maks. 10MB)
                                </p>
                            </div>

                            {/* Quick Select from Athlete's Gallery */}
                            {galleryPhotos.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[10.5px] font-semibold text-slate-400 block">
                                        Atau pilih langsung dari Galeri Atlet:
                                    </span>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                                        {galleryPhotos.slice(0, 6).map((gal) => (
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
                        </div>
                    )}

                    {/* Action Scan Button */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={runScan}
                            disabled={isScanning || !imagePreview}
                            className="w-full py-2.5 px-4 rounded-md bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a2dd26] text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                        >
                            {isScanning ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Memetakan Anatomi Tubuh...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    <span>Deteksi Cerdas AI</span>
                                </>
                            )}
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
                            {/* Summary Box & Visual Switcher */}
                            <div className="p-2.5 rounded-md bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10.5px]">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                        <span>
                                            {scanResults.detected_compensations.length > 0
                                                ? `Hasil Analisis (${scanResults.detected_compensations.length} Deviasi Terdeteksi)`
                                                : 'Postur Terverifikasi Normal'}
                                        </span>
                                    </span>
                                    
                                    {/* Tab switcher between List and Body Visual */}
                                    <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-850 rounded-md border border-slate-200/80 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setAnalysisTab('list')}
                                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                                analysisTab === 'list'
                                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            <ListChecks size={11} />
                                            <span>Daftar Deviasi ({scanResults.detected_compensations.length})</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAnalysisTab('visual')}
                                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                                analysisTab === 'visual'
                                                    ? 'bg-white dark:bg-slate-800 text-[#84cc16] dark:text-[#b4f031] shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            <Activity size={11} />
                                            <span>Visual Anatomi Tubuh</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {scanResults.summary}
                                </p>
                            </div>

                            {/* Content based on selected tab */}
                            {analysisTab === 'list' ? (
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
                                            const isChecked = selectedCompensationIds.includes(comp.compensation_id);
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
                            ) : (
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                                    {(() => {
                                        const activeOrAll = scanResults.detected_compensations.filter((c) =>
                                            selectedCompensationIds.includes(c.compensation_id)
                                        );
                                        const targetComps = activeOrAll.length > 0 ? activeOrAll : scanResults.detected_compensations;
                                        const combinedOveractive = targetComps
                                            .map((c) => c.overactive_muscles)
                                            .filter(Boolean)
                                            .join('\n');
                                        const combinedUnderactive = targetComps
                                            .map((c) => c.underactive_muscles)
                                            .filter(Boolean)
                                            .join('\n');

                                        const combinedInjuries = targetComps
                                            .map((c) => c.possible_injuries)
                                            .filter(Boolean)
                                            .join('\n');

                                        return (
                                            <BodyMuscleVisualizer
                                                overactiveMuscles={combinedOveractive}
                                                underactiveMuscles={combinedUnderactive}
                                                possibleInjuries={combinedInjuries}
                                                category={currentStep.title}
                                                gender={athleteGender}
                                                showModeSwitcher={true}
                                            />
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Real-time sync indicator */}
                            {scanResults.detected_compensations.length > 0 && (
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10.5px]">
                                    <span className="flex items-center gap-1 text-[#84cc16] dark:text-[#b4f031] font-medium">
                                        <CheckCircle2 size={12} />
                                        <span>Otomatis terhubung ke formulir di bawah</span>
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {scanResults.detected_compensations.filter((c) => selectedCompensationIds.includes(c.compensation_id)).length} deviasi aktif
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full min-h-[180px] p-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                            <Crosshair size={26} className="opacity-40" />
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Pemeriksaan {currentStep.badgeText}: {currentStep.title} ({currentStep.subtitle}) Siap
                                </p>
                                <p className="text-[10.5px] max-w-xs mt-0.5 leading-relaxed">
                                    Unggah foto atlet untuk sudut pandang <strong>{currentStep.title}</strong> dan klik tombol <strong>Deteksi Cerdas AI</strong> untuk memetakan titik persendian dan mengukur kompensasi secara otomatis.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════
                BOTTOM SEQUENTIAL STEP NAVIGATION BAR
               ═════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={goToPrevStep}
                    disabled={!hasPrevStep}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        hasPrevStep
                            ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 border-transparent cursor-not-allowed opacity-50'
                    }`}
                >
                    <ChevronLeft size={14} />
                    <span>{prevStep ? `Sebelumnya: ${prevStep.title} (${prevStep.subtitle})` : 'Langkah Awal'}</span>
                </button>

                <div className="flex items-center gap-2">
                    {hasNextStep ? (
                        <button
                            type="button"
                            onClick={goToNextStep}
                            disabled={!hasActivePhoto}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                                hasActivePhoto
                                    ? 'bg-[#84cc16] hover:bg-[#74be09] dark:bg-[#b4f031] dark:hover:bg-[#a3e421] text-slate-950 cursor-pointer'
                                    : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                            }`}
                            title={!hasActivePhoto ? `Wajib unggah atau pilih foto untuk ${currentStep.title} (${currentStep.subtitle}) terlebih dahulu sebelum melanjutkan` : undefined}
                        >
                            <span>Lanjut ke Langkah {nextStep?.stepNumber}: {nextStep?.title} ({nextStep?.subtitle})</span>
                            <ChevronRight size={14} />
                        </button>
                    ) : (
                        <div className="px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-500" />
                            <span>Langkah Terakhir: Seluruh 4 Sudut Pandang Selesai</span>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ASSESSMENT_STEPS.map((step) => (
                                <button
                                    key={step.view}
                                    type="button"
                                    onClick={() => handleSwitchStep(step.view)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
                                        selectedView === step.view
                                            ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 border-[#84cc16] shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <span>{step.badgeText}: {step.title}</span>
                                </button>
                            ))}
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

        </div>
    );
}
