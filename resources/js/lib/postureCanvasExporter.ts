export interface LandmarkPoint {
    id: string;
    name: string;
    x: number; // percentage 0-100 relative to image
    y: number; // percentage 0-100 relative to image
    color?: string;
}

interface RenderOptions {
    showGoniometer?: boolean;
    detectedCompensations?: Array<{ name: string; [key: string]: any }>;
    viewTitle?: string;
}

/**
 * Renders the base photo and overlays exact biomechanical posture lines,
 * plumb lines, and landmark pins onto an offscreen canvas and exports a File.
 */
export async function generateAnnotatedPostureImage(
    imgSource: string | HTMLImageElement | File,
    landmarks: LandmarkPoint[],
    view: string,
    options: RenderOptions = {}
): Promise<File | null> {
    if (!imgSource || !landmarks || landmarks.length === 0) {
        return null;
    }

    try {
        // 1. Load Image
        let img: HTMLImageElement;
        if (imgSource instanceof HTMLImageElement) {
            img = imgSource;
        } else if (imgSource instanceof File) {
            img = await loadImageFromBlob(imgSource);
        } else if (typeof imgSource === 'string') {
            img = await loadImageFromUrl(imgSource);
        } else {
            return null;
        }

        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 1000;

        if (width === 0 || height === 0) return null;

        // 2. Create Offscreen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 3. Draw Base Image
        ctx.drawImage(img, 0, 0, width, height);

        // Relative scaling helper for responsive line width & pin radius across high/low res images
        const baseDim = Math.min(width, height);
        const scale = Math.max(1, baseDim / 700);

        // Find landmark helper (coordinates are 0-100 percentages)
        const findPin = (keywords: string[]) => {
            return landmarks.find((lm) => {
                const lower = (lm.name || '').toLowerCase();
                const idLower = (lm.id || '').toLowerCase();
                return keywords.some((k) => lower.includes(k.toLowerCase()) || idLower.includes(k.toLowerCase()));
            });
        };

        const getCoord = (pin?: LandmarkPoint): { x: number; y: number } | null => {
            if (!pin) return null;
            return {
                x: (pin.x / 100) * width,
                y: (pin.y / 100) * height,
            };
        };

        // Draw Line Helper
        const drawLine = (
            p1: { x: number; y: number } | null,
            p2: { x: number; y: number } | null,
            color = '#ef4444',
            lineWidth = 2.5 * scale,
            dash: number[] = []
        ) => {
            if (!p1 || !p2) return;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash(dash);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.restore();
        };

        // 4. Draw View-Specific Biomechanical Lines
        const normView = view.toLowerCase();

        if (normView.includes('anterior')) {
            const lAsis = getCoord(findPin(['left asis', 'l asis', 'asis kiri', 'panggul kiri']));
            const rAsis = getCoord(findPin(['right asis', 'r asis', 'asis kanan', 'panggul kanan']));
            const lKnee = getCoord(findPin(['left knee', 'l knee', 'lutut kiri']));
            const rKnee = getCoord(findPin(['right knee', 'r knee', 'lutut kanan']));
            const lAnkle = getCoord(findPin(['left ankle', 'l ankle', 'engkel kiri', 'pergelangan kiri']));
            const rAnkle = getCoord(findPin(['right ankle', 'r ankle', 'engkel kanan', 'pergelangan kanan']));
            const lToe = getCoord(findPin(['left toe', 'l toe', 'jari kaki kiri', 'kaki kiri']));
            const rToe = getCoord(findPin(['right toe', 'r toe', 'jari kaki kanan', 'kaki kanan']));

            // Front Kinetic Chain Lines
            drawLine(lAsis, lKnee, '#ef4444', 2.8 * scale);
            drawLine(lKnee, lAnkle, '#ef4444', 2.8 * scale);
            drawLine(lAnkle, lToe, '#ef4444', 2.2 * scale);

            drawLine(rAsis, rKnee, '#ef4444', 2.8 * scale);
            drawLine(rKnee, rAnkle, '#ef4444', 2.8 * scale);
            drawLine(rAnkle, rToe, '#ef4444', 2.2 * scale);

            // Pelvis Level Line
            if (lAsis && rAsis) {
                drawLine(lAsis, rAsis, '#10b981', 2.0 * scale, [4 * scale, 3 * scale]);
            }
        } else if (normView.includes('lateral')) {
            const ear = getCoord(findPin(['ear', 'telinga', 'tragus']));
            const shoulder = getCoord(findPin(['shoulder', 'bahu', 'acromion']));
            const hip = getCoord(findPin(['hip', 'pinggul', 'trochanter']));
            const lumbar = getCoord(findPin(['lumbar', 'pinggang', 'l3', 'spine']));
            const kneeLat = getCoord(findPin(['knee', 'lutut', 'epicondyle']));
            const ankleLat = getCoord(findPin(['ankle', 'engkel', 'malleolus']));
            const wrist = getCoord(findPin(['wrist', 'tangan', 'pergelangan tangan']));

            // Torso & Spine Line
            if (lumbar) {
                drawLine(hip, lumbar, '#ef4444', 2.8 * scale);
                drawLine(lumbar, shoulder, '#ef4444', 2.8 * scale);
            } else {
                drawLine(hip, shoulder, '#ef4444', 2.8 * scale);
            }

            // Lower Extremity
            drawLine(kneeLat, ankleLat, '#ef4444', 2.8 * scale);
            drawLine(hip, kneeLat, '#ef4444', 2.8 * scale);

            // Upper Extremity
            drawLine(shoulder, wrist, '#ef4444', 2.2 * scale);

            // Head & Neck Line (Dashed)
            drawLine(shoulder, ear, '#ef4444', 2.2 * scale, [4 * scale, 3 * scale]);

            // Vertical Reference Plumbline through lateral malleolus
            if (ankleLat) {
                drawLine(
                    { x: ankleLat.x, y: 0.05 * height },
                    { x: ankleLat.x, y: 0.95 * height },
                    '#3b82f6',
                    1.8 * scale,
                    [6 * scale, 4 * scale]
                );
            }
        } else if (normView.includes('posterior')) {
            const c7 = getCoord(findPin(['c7', 'cervical', 'tengkuk', 'neck']));
            const lPsis = getCoord(findPin(['left psis', 'l psis', 'psis kiri']));
            const rPsis = getCoord(findPin(['right psis', 'r psis', 'psis kanan']));
            const lCalf = getCoord(findPin(['left mid-calf', 'left calf', 'betis kiri', 'left knee']));
            const rCalf = getCoord(findPin(['right mid-calf', 'right calf', 'betis kanan', 'right knee']));
            const lAnkle = getCoord(findPin(['left ankle', 'l ankle', 'engkel kiri']));
            const rAnkle = getCoord(findPin(['right ankle', 'r ankle', 'engkel kanan']));
            const lCalc = getCoord(findPin(['left calcaneus', 'left heel', 'tumit kiri']));
            const rCalc = getCoord(findPin(['right calcaneus', 'right heel', 'tumit kanan']));

            // C7 Vertical Plumbline
            if (c7) {
                drawLine(
                    c7,
                    { x: c7.x, y: 0.96 * height },
                    '#ef4444',
                    2.2 * scale,
                    [5 * scale, 3 * scale]
                );
            }

            // PSIS Pelvic Line
            if (lPsis && rPsis) {
                const extendX = (rPsis.x - lPsis.x) * 0.4;
                const extendY = (rPsis.y - lPsis.y) * 0.4;
                drawLine(
                    { x: lPsis.x - extendX, y: lPsis.y - extendY },
                    { x: rPsis.x + extendX, y: rPsis.y + extendY },
                    '#ef4444',
                    2.8 * scale
                );
            }

            // Left Achilles Chain
            drawLine(lCalf, lAnkle, '#ef4444', 2.8 * scale);
            drawLine(lAnkle, lCalc, '#ef4444', 2.8 * scale);

            // Right Achilles Chain
            drawLine(rCalf, rAnkle, '#ef4444', 2.8 * scale);
            drawLine(rAnkle, rCalc, '#ef4444', 2.8 * scale);
        } else if (normView.includes('single')) {
            const stAsis = getCoord(findPin(['stance asis', 'st asis', 'asis tumpu', 'left asis']));
            const flAsis = getCoord(findPin(['floating asis', 'fl asis', 'asis bebas', 'right asis']));
            const stKnee = getCoord(findPin(['stance knee', 'st knee', 'lutut tumpu']));
            const stAnkle = getCoord(findPin(['stance ankle', 'st ankle', 'engkel tumpu']));
            const lShoulder = getCoord(findPin(['left shoulder', 'l shoulder', 'bahu kiri']));
            const rShoulder = getCoord(findPin(['right shoulder', 'r shoulder', 'bahu kanan']));

            // Trendelenburg Pelvic Transverse Line
            if (stAsis && flAsis) {
                drawLine(
                    { x: stAsis.x - 0.08 * width, y: stAsis.y },
                    { x: flAsis.x + 0.08 * width, y: flAsis.y },
                    '#ef4444',
                    2.8 * scale
                );
            }

            // Stance Leg Dynamic Valgus Alignment
            drawLine(stAsis, stKnee, '#ef4444', 2.8 * scale);
            drawLine(stKnee, stAnkle, '#ef4444', 2.8 * scale);

            // Shoulder Level Line
            if (lShoulder && rShoulder) {
                drawLine(
                    { x: lShoulder.x - 0.05 * width, y: lShoulder.y },
                    { x: rShoulder.x + 0.05 * width, y: rShoulder.y },
                    '#10b981',
                    2.0 * scale,
                    [4 * scale, 3 * scale]
                );
            }
        }

        // 5. Draw Landmark Pins
        landmarks.forEach((pin) => {
            const coord = getCoord(pin);
            if (!coord) return;

            const radius = 5.5 * scale;
            const pinColor = pin.color || '#10b981';

            ctx.save();
            // Outer Ring / Shadow
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, radius + 2.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fill();

            // White Border
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, radius + 1.2 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Inner Core
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = pinColor;
            ctx.fill();

            // Tiny White Center Dot
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.restore();
        });

        // 6. Draw Watermark / Assessment Step Badge at Top-Left
        ctx.save();
        const badgeText = `${view.toUpperCase()} • DPA POSTURE ANALYSIS`;
        const fontSize = Math.max(12, Math.round(11 * scale));
        ctx.font = `600 ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(badgeText);
        const padding = 6 * scale;
        const boxWidth = textMetrics.width + padding * 2.5;
        const boxHeight = fontSize + padding * 1.8;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(14 * scale, 14 * scale, boxWidth, boxHeight, 4 * scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, 14 * scale + padding * 1.25, 14 * scale + fontSize + padding * 0.4);
        ctx.restore();

        // 7. Export Canvas as File Blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const safeViewName = view.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const file = new File(
                            [blob],
                            `annotated_${safeViewName}_${Date.now()}.jpg`,
                            { type: 'image/jpeg' }
                        );
                        resolve(file);
                    } else {
                        resolve(null);
                    }
                },
                'image/jpeg',
                0.92
            );
        });
    } catch (err) {
        console.error('Error generating annotated posture image:', err);
        return null;
    }
}

function loadImageFromBlob(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url.startsWith('/') || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')
            ? url
            : `/storage/${url}`;
    });
}
