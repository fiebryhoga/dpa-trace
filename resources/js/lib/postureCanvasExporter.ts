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

            // --- IDEAL REFERENCE LINES (Green Dashed) ---
            // 1. Ideal Straight-Down Kinetic Chain (ASIS -> Ankle)
            if (lAsis && lAnkle) {
                drawLine(lAsis, lAnkle, '#22c55e', 2.0 * scale, [6 * scale, 4 * scale]);
            }
            if (rAsis && rAnkle) {
                drawLine(rAsis, rAnkle, '#22c55e', 2.0 * scale, [6 * scale, 4 * scale]);
            }

            // 2. Ideal Foot Straight-Forward Axis (Ankle -> straight forward to toe depth)
            if (lAnkle && lToe) {
                drawLine(lAnkle, { x: lAnkle.x, y: lToe.y }, '#22c55e', 2.0 * scale, [5 * scale, 3 * scale]);
            }
            if (rAnkle && rToe) {
                drawLine(rAnkle, { x: rAnkle.x, y: rToe.y }, '#22c55e', 2.0 * scale, [5 * scale, 3 * scale]);
            }

            // 3. Ideal Level Pelvis Horizontal Line (Green Dashed)
            if (lAsis && rAsis) {
                const avgY = (lAsis.y + rAsis.y) / 2;
                const extX = (rAsis.x - lAsis.x) * 0.15;
                drawLine({ x: lAsis.x - extX, y: avgY }, { x: rAsis.x + extX, y: avgY }, '#22c55e', 1.8 * scale, [5 * scale, 3 * scale]);
            }

            // --- ACTUAL SKELETAL LINES (Red Solid) ---
            drawLine(lAsis, lKnee, '#ef4444', 2.8 * scale);
            drawLine(lKnee, lAnkle, '#ef4444', 2.8 * scale);
            drawLine(lAnkle, lToe, '#ef4444', 2.2 * scale);

            drawLine(rAsis, rKnee, '#ef4444', 2.8 * scale);
            drawLine(rKnee, rAnkle, '#ef4444', 2.8 * scale);
            drawLine(rAnkle, rToe, '#ef4444', 2.2 * scale);
        } else if (normView.includes('lateral')) {
            const ear = getCoord(findPin(['ear', 'telinga', 'tragus']));
            const shoulder = getCoord(findPin(['shoulder', 'bahu', 'acromion']));
            const hip = getCoord(findPin(['hip', 'pinggul', 'trochanter']));
            const lumbar = getCoord(findPin(['lumbar', 'pinggang', 'l3', 'spine']));
            const kneeLat = getCoord(findPin(['knee', 'lutut', 'patella', 'depan lutut']));
            const ankleLat = getCoord(findPin(['ankle', 'engkel', 'tungkai', 'malleolus', 'shank', 'tibia']));
            const wrist = getCoord(findPin(['wrist', 'tangan', 'pergelangan tangan']));

            // --- IDEAL REFERENCE LINES (Green) ---
            // 1. Extended Tibia Shank Axis (Tungkai ke Depan Lutut ditarik panjang)
            if (ankleLat && kneeLat) {
                const tibiaDx = kneeLat.x - ankleLat.x;
                const tibiaDy = kneeLat.y - ankleLat.y;
                const startX = ankleLat.x - tibiaDx * 0.45;
                const startY = ankleLat.y - tibiaDy * 0.45;
                const endX = kneeLat.x + tibiaDx * 1.6;
                const endY = kneeLat.y + tibiaDy * 1.6;
                drawLine({ x: startX, y: startY }, { x: endX, y: endY }, '#22c55e', 2.6 * scale);
            }

            // 2. Extended Torso Parallel Axis (Garis Sumbu Torso ditarik panjang sejajar)
            if (hip && shoulder) {
                const tDx = shoulder.x - hip.x;
                const tDy = shoulder.y - hip.y;
                const startX = hip.x - tDx * 0.25;
                const startY = hip.y - tDy * 0.25;
                const endX = shoulder.x + tDx * 0.7;
                const endY = shoulder.y + tDy * 0.7;
                drawLine({ x: startX, y: startY }, { x: endX, y: endY }, '#22c55e', 2.6 * scale);
            }

            // 3. Ideal Plumbline (Vertical Reference through lateral malleolus)
            if (ankleLat) {
                drawLine(
                    { x: ankleLat.x, y: 0.05 * height },
                    { x: ankleLat.x, y: 0.95 * height },
                    '#22c55e',
                    1.6 * scale,
                    [6 * scale, 4 * scale]
                );
            }

            // --- ACTUAL SKELETAL LINES (Red Solid) ---
            // 1. Main Torso Line (Hip -> Shoulder) - always straight
            if (hip && shoulder) {
                drawLine(hip, shoulder, '#ef4444', 2.8 * scale);
            }

            // 2. Dedicated Spinal Curvature Arc (Back Arches / Back Rounds)
            if (hip && shoulder && lumbar) {
                const ctrlX = 2 * lumbar.x - 0.5 * (hip.x + shoulder.x);
                const ctrlY = 2 * lumbar.y - 0.5 * (hip.y + shoulder.y);

                const totalYDist = Math.max(1, Math.abs(hip.y - shoulder.y));
                const lumbarYRatio = Math.max(0, Math.min(1, (hip.y - lumbar.y) / totalYDist));
                const expectedLumbarX = hip.x + (shoulder.x - hip.x) * lumbarYRatio;
                const isDeviated = Math.abs(lumbar.x - expectedLumbarX) > 4 * scale;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(hip.x, hip.y);
                ctx.quadraticCurveTo(ctrlX, ctrlY, shoulder.x, shoulder.y);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.4 * scale;
                if (!isDeviated) {
                    ctx.setLineDash([4 * scale, 3 * scale]);
                }
                ctx.stroke();

                if (isDeviated) {
                    ctx.beginPath();
                    ctx.moveTo(expectedLumbarX, lumbar.y);
                    ctx.lineTo(lumbar.x, lumbar.y);
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 1.6 * scale;
                    ctx.setLineDash([2 * scale, 2 * scale]);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // Lower Extremity
            drawLine(kneeLat, ankleLat, '#ef4444', 2.8 * scale);
            drawLine(hip, kneeLat, '#ef4444', 2.8 * scale);

            // Upper Extremity
            drawLine(shoulder, wrist, '#ef4444', 2.2 * scale);

            // Head & Neck Line (Dashed Red)
            drawLine(shoulder, ear, '#ef4444', 2.2 * scale, [4 * scale, 3 * scale]);
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

            // --- IDEAL REFERENCE LINES (Green Dashed) ---
            // 1. Ideal Vertical Achilles Tendon Lines (Straight down from calf/knee to heel)
            if (lCalf && lCalc) {
                drawLine(lCalf, { x: lCalf.x, y: lCalc.y }, '#22c55e', 2.0 * scale, [5 * scale, 3 * scale]);
            }
            if (rCalf && rCalc) {
                drawLine(rCalf, { x: rCalf.x, y: rCalc.y }, '#22c55e', 2.0 * scale, [5 * scale, 3 * scale]);
            }

            // 2. Ideal Level Pelvis Horizontal Line (Green Dashed)
            if (lPsis && rPsis) {
                const avgY = (lPsis.y + rPsis.y) / 2;
                const extendX = (rPsis.x - lPsis.x) * 0.4;
                drawLine(
                    { x: lPsis.x - extendX, y: avgY },
                    { x: rPsis.x + extendX, y: avgY },
                    '#22c55e',
                    1.8 * scale,
                    [5 * scale, 3 * scale]
                );
            }

            // --- ACTUAL SKELETAL LINES (Red Solid) ---
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
            const stAsis = getCoord(findPin(['stance asis', 'st asis', 'asis tumpu', 'st_asis']));
            const flAsis = getCoord(findPin(['floating asis', 'fl asis', 'asis bebas', 'fl_asis']));
            const stKnee = getCoord(findPin(['stance knee', 'st knee', 'lutut tumpu', 'st_knee']));
            const stAnkle = getCoord(findPin(['stance ankle', 'st ankle', 'engkel tumpu', 'st_ankle']));
            const lShoulder = getCoord(findPin(['left shoulder', 'l shoulder', 'bahu kiri', 'l_shoulder']));
            const rShoulder = getCoord(findPin(['right shoulder', 'r shoulder', 'bahu kanan', 'r_shoulder']));

            // --- IDEAL REFERENCE LINES (Green Dashed) ---
            // 1. Ideal Stance Leg Alignment (ASIS directly to Ankle straight)
            if (stAsis && stAnkle) {
                drawLine(stAsis, stAnkle, '#22c55e', 2.0 * scale, [6 * scale, 4 * scale]);
            }

            // 2. Ideal Level Pelvis Horizontal Line (from Stance ASIS)
            if (stAsis && flAsis) {
                const minX = Math.min(stAsis.x, flAsis.x);
                const maxX = Math.max(stAsis.x, flAsis.x);
                const spanX = Math.max(20 * scale, maxX - minX);
                drawLine(
                    { x: minX - spanX * 0.55, y: stAsis.y },
                    { x: maxX + spanX * 0.55, y: stAsis.y },
                    '#22c55e',
                    1.8 * scale,
                    [5 * scale, 3 * scale]
                );
            }

            // 3. Ideal Shoulder Level Line
            if (lShoulder && rShoulder) {
                const avgY = (lShoulder.y + rShoulder.y) / 2;
                const minX = Math.min(lShoulder.x, rShoulder.x);
                const maxX = Math.max(lShoulder.x, rShoulder.x);
                const spanX = Math.max(20 * scale, maxX - minX);
                drawLine(
                    { x: minX - spanX * 0.55, y: avgY },
                    { x: maxX + spanX * 0.55, y: avgY },
                    '#22c55e',
                    1.8 * scale,
                    [5 * scale, 3 * scale]
                );
            }

            // --- ACTUAL SKELETAL LINES (Red Solid) ---
            // Pelvic Line (Hip Hike / Hip Drop / Trendelenburg)
            if (stAsis && flAsis) {
                const dx = flAsis.x - stAsis.x;
                const dy = flAsis.y - stAsis.y;
                drawLine(
                    { x: stAsis.x - dx * 0.55, y: stAsis.y - dy * 0.55 },
                    { x: flAsis.x + dx * 0.55, y: flAsis.y + dy * 0.55 },
                    '#ef4444',
                    2.8 * scale
                );
            }

            // Stance Leg Dynamic Valgus Alignment (Knee Moves Inward)
            if (stAsis && stKnee) {
                drawLine(stAsis, stKnee, '#ef4444', 2.8 * scale);
            }
            if (stKnee && stAnkle) {
                drawLine(stKnee, stAnkle, '#ef4444', 2.8 * scale);
            }

            // Actual Shoulder Level Line (Torso Rotation)
            if (lShoulder && rShoulder) {
                const sDx = rShoulder.x - lShoulder.x;
                const sDy = rShoulder.y - lShoulder.y;
                drawLine(
                    { x: lShoulder.x - sDx * 0.55, y: lShoulder.y - sDy * 0.55 },
                    { x: rShoulder.x + sDx * 0.55, y: rShoulder.y + sDy * 0.55 },
                    '#ef4444',
                    2.4 * scale
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

        // 6. Draw Watermark / Assessment Step Badge & Legend at Top-Left
        ctx.save();
        const badgeText = `${view.toUpperCase()} • PMA POSTURAL ANALYSIS`;
        const fontSize = Math.max(12, Math.round(11 * scale));
        ctx.font = `600 ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(badgeText);
        const padding = 6 * scale;
        const boxWidth = Math.max(textMetrics.width + padding * 2.5, 230 * scale);
        const legendHeight = 18 * scale;
        const boxHeight = fontSize + padding * 1.8 + legendHeight;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(14 * scale, 14 * scale, boxWidth, boxHeight, 5 * scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, 14 * scale + padding * 1.25, 14 * scale + fontSize + padding * 0.4);

        // Sub-legend: Red (Aktual) vs Green Dashed (Ideal Seharusnya)
        const legendY = 14 * scale + fontSize + padding * 0.4 + 14 * scale;
        const legendFontSize = Math.max(9, Math.round(9 * scale));
        ctx.font = `500 ${legendFontSize}px sans-serif`;

        // Red Solid Indicator
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2 * scale;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(14 * scale + padding * 1.25, legendY - 3 * scale);
        ctx.lineTo(14 * scale + padding * 1.25 + 14 * scale, legendY - 3 * scale);
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.fillText('Aktual', 14 * scale + padding * 1.25 + 18 * scale, legendY);

        // Green Dashed Indicator
        const greenStartX = 14 * scale + padding * 1.25 + 75 * scale;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.0 * scale;
        ctx.setLineDash([3 * scale, 2 * scale]);
        ctx.beginPath();
        ctx.moveTo(greenStartX, legendY - 3 * scale);
        ctx.lineTo(greenStartX + 16 * scale, legendY - 3 * scale);
        ctx.stroke();

        ctx.fillStyle = '#86efac';
        ctx.fillText('Ideal (Seharusnya)', greenStartX + 20 * scale, legendY);

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
