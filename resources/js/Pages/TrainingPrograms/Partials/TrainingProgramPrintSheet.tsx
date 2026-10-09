import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Link,
    pdf,
} from '@react-pdf/renderer';
import { TrainingProgram, TrainingProgramItem } from '@/types';

// Strict Monochrome / Neutral / Black Theme (No green)
const C = {
    black: '#09090b',
    dark: '#18181b',
    darkMuted: '#27272a',
    slate700: '#334155',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    border: '#e2e8f0',
    borderDark: '#0f172a',
    bgLight: '#f8fafc',
    bgMuted: '#f1f5f9',
    white: '#ffffff',
};

const s = StyleSheet.create({
    page: {
        paddingTop: 18,
        paddingBottom: 22,
        paddingHorizontal: 22,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: C.black,
        backgroundColor: C.white,
    },

    // ─── Header Section ───
    headerContainer: {
        marginBottom: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    headerBrandText: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.slate500,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
        textTransform: 'uppercase',
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    headerDivider: {
        height: 1.5,
        backgroundColor: C.black,
        marginTop: 6,
        marginBottom: 8,
    },

    // ─── Phase Section ───
    phaseContainer: {
        marginBottom: 10,
        border: `1pt solid ${C.slate300}`,
        borderRadius: 2,
        overflow: 'hidden',
    },
    phaseHeaderBar: {
        backgroundColor: C.dark,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    phaseTitleText: {
        fontSize: 9.5,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    phaseCountBadge: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
        backgroundColor: C.white,
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 2,
    },

    // ─── Exercise Card / Row ───
    exerciseCard: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: `1pt solid ${C.border}`,
        backgroundColor: C.white,
        minHeight: 85,
    },
    exerciseCardLast: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: C.white,
        minHeight: 85,
    },

    // ─── Visual Thumbnail Column (Left) ───
    thumbWrapper: {
        width: 100,
        height: 72,
        backgroundColor: C.bgLight,
        border: `0.75pt solid ${C.slate300}`,
        borderRadius: 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        alignSelf: 'center',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    thumbPlaceholder: {
        fontSize: 7,
        color: C.slate400,
        textAlign: 'center',
        padding: 4,
    },

    // ─── Exercise Info (Middle Column) ───
    infoCol: {
        flex: 1,
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    exerciseNameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    exerciseNameText: {
        fontSize: 10.5,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
    },
    targetMuscleTag: {
        alignSelf: 'flex-start',
        backgroundColor: C.bgMuted,
        border: `0.5pt solid ${C.slate300}`,
        borderRadius: 2,
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.slate700,
        marginTop: 2,
        marginBottom: 4,
    },
    cuesBox: {
        backgroundColor: C.bgLight,
        borderLeft: `2pt solid ${C.dark}`,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 1,
        marginTop: 3,
        marginBottom: 3,
    },
    cuesLabel: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.slate500,
        textTransform: 'uppercase',
    },
    cuesText: {
        fontSize: 7.5,
        color: C.dark,
        fontStyle: 'italic',
        lineHeight: 1.2,
    },
    videoLink: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
        textDecoration: 'underline',
        marginTop: 2,
    },

    // ─── Parameters Table (Right Column) ───
    paramCol: {
        width: 210,
        justifyContent: 'center',
    },
    paramTable: {
        border: `0.75pt solid ${C.borderDark}`,
        borderRadius: 2,
        overflow: 'hidden',
    },
    paramHeaderRow: {
        flexDirection: 'row',
        backgroundColor: C.dark,
        paddingVertical: 3,
    },
    paramHeaderCellSet: {
        width: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `0.75pt solid ${C.slate700}`,
    },
    paramHeaderCellReps: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `0.75pt solid ${C.slate700}`,
    },
    paramHeaderCellRest: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `0.75pt solid ${C.slate700}`,
    },
    paramHeaderCellTempo: {
        width: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paramHeaderText: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        textTransform: 'uppercase',
    },

    paramRow: {
        flexDirection: 'row',
        borderBottom: `0.5pt solid ${C.border}`,
        backgroundColor: C.white,
    },
    paramRowLast: {
        flexDirection: 'row',
        backgroundColor: C.white,
    },
    paramCellSet: {
        width: 38,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.bgMuted,
        borderRight: `0.5pt solid ${C.border}`,
    },
    paramCellReps: {
        flex: 1,
        paddingVertical: 3,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `0.5pt solid ${C.border}`,
    },
    paramCellRest: {
        width: 48,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `0.5pt solid ${C.border}`,
    },
    paramCellTempo: {
        width: 52,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paramSetLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
    },
    paramValueText: {
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
    },
    paramSubValueText: {
        fontSize: 7.5,
        color: C.slate700,
    },

    // ─── Footer Section ───
    footer: {
        position: 'absolute',
        bottom: 12,
        left: 22,
        right: 22,
        paddingTop: 5,
        borderTop: `0.75pt solid ${C.slate300}`,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
    },
    footerRight: {
        fontSize: 7,
        color: C.slate500,
    },
});

interface PrintSheetProps {
    program: TrainingProgram;
    exerciseImages?: Record<string, string>;
}

function TrainingProgramPdfDocument({ program, exerciseImages }: PrintSheetProps) {
    const athlete = program.athlete;
    const rawDate = program.start_date ? new Date(program.start_date) : new Date();
    const formattedDate = rawDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const phases = [
        {
            key: 'inhibit',
            title: '1. Inhibit (SMR / Myofascial Release)',
            items: (program.items || []).filter((i) => i.phase === 'inhibit'),
        },
        {
            key: 'lengthen',
            title: '2. Lengthen (Stretching / Peregangan)',
            items: (program.items || []).filter((i) => i.phase === 'lengthen'),
        },
        {
            key: 'activate',
            title: '3. Activate (Penguatan Terisolasi)',
            items: (program.items || []).filter((i) => i.phase === 'activate'),
        },
        {
            key: 'integrate',
            title: '4. Integrate (Integrasi Gerak Fungsional)',
            items: (program.items || []).filter((i) => i.phase === 'integrate'),
        },
    ];
    const activePhases = phases.filter((p) => p.items.length > 0);
    const totalExercises = (program.items || []).length;

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={s.page} wrap>
                {/* ─── Fixed Header (Clean Minimal Title) ─── */}
                <View style={s.headerContainer} fixed>
                    <View style={s.headerTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerBrandText}>
                                Sistem Informasi Terpadu • Lembar Latihan Atlet
                            </Text>
                            <Text style={s.headerTitle}>
                                {program.name || 'Program Korektif Postur'}
                            </Text>
                        </View>
                    </View>
                    <View style={s.headerDivider} />
                </View>

                {/* ─── Phases Content ─── */}
                {activePhases.map((phase) => (
                    <View key={phase.key} style={s.phaseContainer} wrap={false}>
                        {/* Phase Header */}
                        <View style={s.phaseHeaderBar}>
                            <Text style={s.phaseTitleText}>{phase.title}</Text>
                            <Text style={s.phaseCountBadge}>
                                {phase.items.length} GERAKAN
                            </Text>
                        </View>

                        {/* Exercise Items */}
                        {phase.items.map((item: TrainingProgramItem, idx: number) => {
                            const setCount = Math.max(1, Number(item.sets) || 1);
                            const restClean = item.rest_seconds
                                ? String(item.rest_seconds).replace(/\D/g, '')
                                : '';
                            const restDisplay =
                                restClean && Number(restClean) > 0 ? `${restClean}s` : '-';
                            const repsDisplay =
                                item.reps ||
                                (item.duration_seconds ? `${item.duration_seconds}s` : '-');
                            const tempoDisplay = item.tempo || (item.hold_seconds ? `Hold ${item.hold_seconds}s` : '-');
                            const videoUrl = item.exercise?.video_url;
                            const isLast = idx === phase.items.length - 1;

                            // Image lookup: support path, item id, and exercise id keys
                            const rawPath = item.exercise?.image_path || '';
                            const imgSrc =
                                (rawPath ? exerciseImages?.[rawPath] : undefined) ||
                                (item.id ? exerciseImages?.[`item_${item.id}`] : undefined) ||
                                (item.exercise_id ? exerciseImages?.[`ex_${item.exercise_id}`] : undefined);

                            return (
                                <View
                                    key={item.id || idx}
                                    style={isLast ? s.exerciseCardLast : s.exerciseCard}
                                    wrap={false}
                                >
                                    {/* Column 1: Large Visual Preview (Only if image exists) */}
                                    {imgSrc ? (
                                        <View style={s.thumbWrapper}>
                                            <Image src={imgSrc} style={s.thumbImage} />
                                        </View>
                                    ) : null}

                                    {/* Column 2: Exercise Details & Coaching Cues */}
                                    <View style={s.infoCol}>
                                        <View>
                                            <Text style={s.exerciseNameText}>
                                                {item.exercise_name}
                                            </Text>

                                            {item.target_muscle && (
                                                <View style={s.targetMuscleTag}>
                                                    <Text>Target: {item.target_muscle}</Text>
                                                </View>
                                            )}

                                            {item.coaching_cues && (
                                                <View style={s.cuesBox}>
                                                    <Text style={s.cuesLabel}>Catatan Pelatih:</Text>
                                                    <Text style={s.cuesText}>
                                                        "{item.coaching_cues}"
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {videoUrl && (
                                            <Link src={videoUrl} style={s.videoLink}>
                                                Tonton Video Gerakan
                                            </Link>
                                        )}
                                    </View>

                                    {/* Column 3: Sets & Parameters Matrix */}
                                    <View style={s.paramCol}>
                                        <View style={s.paramTable}>
                                            <View style={s.paramHeaderRow}>
                                                <View style={s.paramHeaderCellSet}>
                                                    <Text style={s.paramHeaderText}>SET</Text>
                                                </View>
                                                <View style={s.paramHeaderCellReps}>
                                                    <Text style={s.paramHeaderText}>REPETISI / DURASI</Text>
                                                </View>
                                                <View style={s.paramHeaderCellRest}>
                                                    <Text style={s.paramHeaderText}>REST</Text>
                                                </View>
                                                <View style={s.paramHeaderCellTempo}>
                                                    <Text style={s.paramHeaderText}>TEMPO</Text>
                                                </View>
                                            </View>

                                            {Array.from({ length: setCount }).map((_, sIdx) => {
                                                const isLastRow = sIdx === setCount - 1;
                                                return (
                                                    <View
                                                        key={sIdx}
                                                        style={isLastRow ? s.paramRowLast : s.paramRow}
                                                    >
                                                        <View style={s.paramCellSet}>
                                                            <Text style={s.paramSetLabel}>
                                                                S{sIdx + 1}
                                                            </Text>
                                                        </View>
                                                        <View style={s.paramCellReps}>
                                                            <Text style={s.paramValueText}>
                                                                {repsDisplay}
                                                            </Text>
                                                        </View>
                                                        <View style={s.paramCellRest}>
                                                            <Text style={s.paramSubValueText}>
                                                                {restDisplay}
                                                            </Text>
                                                        </View>
                                                        <View style={s.paramCellTempo}>
                                                            <Text style={s.paramSubValueText}>
                                                                {tempoDisplay}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}

                {/* ─── Fixed Footer ─── */}
                <View style={s.footer} fixed>
                    <Text style={s.footerLeft}>
                        PKO Unesa x Olympus Training Surabaya • Program Latihan Korektif Postur
                    </Text>
                    <Text
                        style={s.footerRight}
                        render={({ pageNumber, totalPages }) =>
                            `Halaman ${pageNumber} dari ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
}

/**
 * Converts any image format (WebP, PNG, JPG, SVG) into a JPEG Data URL via HTML5 Canvas.
 * React-PDF natively and reliably renders JPEG data URLs without decoder failures.
 */
async function imageToJpegDataUrl(url: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        const drawAndExport = (imageEl: HTMLImageElement) => {
            try {
                const canvas = document.createElement('canvas');
                const width = imageEl.naturalWidth || imageEl.width || 400;
                const height = imageEl.naturalHeight || imageEl.height || 300;
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }

                // Fill white background so transparent PNGs don't turn black
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(imageEl, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                resolve(dataUrl);
            } catch (err) {
                console.warn('Canvas JPEG conversion failed:', err);
                resolve(null);
            }
        };

        img.onload = () => drawAndExport(img);

        img.onerror = () => {
            // Fallback: Fetch as blob if CORS is triggered on direct element load
            fetch(url, { mode: 'cors' })
                .then((r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.blob();
                })
                .then((blob) => {
                    const objectUrl = URL.createObjectURL(blob);
                    const fallbackImg = new window.Image();
                    fallbackImg.onload = () => {
                        drawAndExport(fallbackImg);
                        URL.revokeObjectURL(objectUrl);
                    };
                    fallbackImg.onerror = () => {
                        URL.revokeObjectURL(objectUrl);
                        resolve(null);
                    };
                    fallbackImg.src = objectUrl;
                })
                .catch(() => resolve(null));
        };

        img.src = url;
    });
}

export async function generateTrainingProgramPdf(
    program: TrainingProgram,
    getImageUrl: (path?: string) => string | null,
): Promise<Blob> {
    const exerciseImages: Record<string, string> = {};
    const items = program.items || [];

    await Promise.all(
        items.map(async (item) => {
            const path = item.exercise?.image_path;
            if (!path) return;
            const url = getImageUrl(path);
            if (!url) return;

            const absUrl = url.startsWith('http')
                ? url
                : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

            const dataUrl = await imageToJpegDataUrl(absUrl);
            if (dataUrl) {
                exerciseImages[path] = dataUrl;
                if (item.id) exerciseImages[`item_${item.id}`] = dataUrl;
                if (item.exercise_id) exerciseImages[`ex_${item.exercise_id}`] = dataUrl;
            }
        }),
    );

    const blob = await pdf(
        <TrainingProgramPdfDocument
            program={program}
            exerciseImages={exerciseImages}
        />,
    ).toBlob();

    return blob;
}

export default TrainingProgramPdfDocument;
