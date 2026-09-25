// @ts-nocheck
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    X, Save, Download, Undo2, Redo2, Trash2, Move, Plus, Minus,
    RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Crop,
    Grid3X3, Eye, EyeOff, Layers, Type, ArrowRight, Ruler,
    Circle, Pencil, Target, Zap, SunMedium, Contrast, MousePointer2,
    Eraser, Copy, ImagePlus, ChevronDown, ChevronUp, Maximize2, Activity
} from 'lucide-react';

// ============================================================
// CONSTANTS
// ============================================================
const COLORS = [
    { name: 'Cyan',    hex: '#06b6d4' },
    { name: 'Yellow',  hex: '#facc15' },
    { name: 'Orange',  hex: '#f97316' },
    { name: 'Rose',    hex: '#f43f5e' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'White',   hex: '#ffffff' },
];

const STROKE_WIDTHS = [
    { name: 'Tipis',   value: 2 },
    { name: 'Sedang',  value: 4 },
    { name: 'Tebal',   value: 7 },
];

const TOOL_MODES = {
    SELECT:      'select',
    ANGLE:       'angle',
    LINE:        'line',
    ARROW:       'arrow',
    CURVE:       'curve',
    TEXT:        'text',
    DISTANCE:    'distance',
    HEATMAP:     'heatmap',
    ROM_ARC:     'rom_arc',
    LANDMARK:    'landmark',
    CROP:        'crop',
};

const ARROW_STYLES = [
    { id: 'single',        label: 'Panah Satu Arah',                    icon: '→', desc: 'Garis lurus panah tunggal' },
    { id: 'double',        label: 'Panah Dua Arah (Double)',            icon: '↔', desc: 'Panah di kedua ujung' },
    { id: 'dashed_single', label: 'Panah Putus-Putus',                  icon: '⇢', desc: 'Garis putus-putus biomekanik' },
    { id: 'dashed_double', label: 'Panah Putus-Putus Dua Arah',         icon: '⇔', desc: 'Panah putus-putus bolak-balik' },
    { id: 'curved_right',  label: 'Panah Lengkung Kanan (Clockwise)',   icon: '↷', desc: 'Kurva melengkung ke kanan' },
    { id: 'curved_left',   label: 'Panah Lengkung Kiri (Counter-CW)',   icon: '↶', desc: 'Kurva melengkung ke kiri' },
    { id: 'crossbar',      label: 'Panah Sumbu & Palang (Spine/Pelvis)',icon: '☩', desc: 'Panah vertikal + palang aksis' },
    { id: 'block',         label: 'Panah Vektor Beban (Block Arrow)',   icon: '➤', desc: 'Panah blok tebal solid 3D' },
    { id: 'dimension',     label: 'Panah Dimensi Ukuran Jarak',         icon: '⟷', desc: 'Panah dengan label jarak px/cm' },
    { id: 'circle',        label: 'Panah Rotasi Sendi / Torsi',         icon: '↻', desc: 'Panah melingkar rotasi gerakan' },
];

const LANDMARKS = [
    { id: 'acromion',    label: 'Acromion (Bahu)',       color: '#ef4444', symbol: '●' },
    { id: 'asis',        label: 'ASIS / PSIS (Pelvis)',  color: '#facc15', symbol: '●' },
    { id: 'trochanter',  label: 'Gr. Trochanter (Hip)',  color: '#22c55e', symbol: '●' },
    { id: 'epicondyle',  label: 'Lat. Epicondyle (Knee)',color: '#3b82f6', symbol: '●' },
    { id: 'malleolus',   label: 'Lat. Malleolus (Ankle)',color: '#a855f7', symbol: '●' },
];

const HEATMAP_ZONES = [
    { id: 'high_risk', label: 'High Risk / Pain',   color: 'rgba(239,68,68,0.30)',  border: '#ef4444' },
    { id: 'caution',   label: 'Caution / Tightness', color: 'rgba(250,204,21,0.25)', border: '#facc15' },
    { id: 'normal',    label: 'Normal / OK',          color: 'rgba(34,197,94,0.20)',  border: '#22c55e' },
];

const LAYER_NAMES = {
    angles:    'Sudut / Angle',
    lines:     'Garis & Panah',
    texts:     'Teks & Label',
    zones:     'Zona & Heatmap',
    landmarks: 'Marker Anatomi',
    curves:    'Kurva Spine',
    distance:  'Jarak / Ruler',
    rom:       'ROM Arc',
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function calcAngleDeg(ax, ay, bx, by, cx, cy) {
    const ux = ax - bx, uy = ay - by;
    const vx = cx - bx, vy = cy - by;
    const dot = ux * vx + uy * vy;
    const cross = ux * vy - uy * vx;
    let angle = Math.atan2(cross, dot) * (180 / Math.PI);
    return angle;
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function pointNearLine(px, py, x1, y1, x2, y2, threshold = 8) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return dist(px, py, x1, y1) < threshold;
    let t = (A * C + B * D) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const nearX = x1 + t * C, nearY = y1 + t * D;
    return dist(px, py, nearX, nearY) < threshold;
}

function drawArrowhead(ctx, fromX, fromY, toX, toY, size = 14) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawFilledArrowhead(ctx, fromX, fromY, toX, toY, size = 14, color = '#ffffff') {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - size * 0.65 * Math.cos(angle), toY - size * 0.65 * Math.sin(angle));
    ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.restore();
}

function drawPillBadge(ctx, cx, cy, text, color, scale = 1) {
    ctx.save();
    ctx.font = `bold ${Math.round(11 * scale)}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const pw = 8 * scale, ph = 4 * scale, r = 4 * scale;
    const bw = metrics.width + pw * 2;
    const bh = 14 * scale + ph * 2;
    const bx = cx - bw / 2, by = cy - bh / 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, r);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
}

function drawArrowAnnotation(ctx, ann, isSelected, calibration = null) {
    const { points, color, sw, arrowStyle } = ann;
    if (!points || points.length < 2) return;
    const p0 = points[0];
    const p1 = points[1];
    const style = arrowStyle || 'single';
    const isDashed = style === 'dashed_single' || style === 'dashed_double';
    const isDouble = style === 'double' || style === 'dashed_double';
    const isCurved = style === 'curved' || style === 'curved_right' || style === 'curved_left';
    const headSize = Math.max(13, Math.min(26, (sw || 4) * 3.2));

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = sw || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isCurved) {
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const sign = style === 'curved_left' ? -1 : 1;
        const defaultCpx = mx - dy * 0.35 * sign;
        const defaultCpy = my + dx * 0.35 * sign;
        const cpx = points[2]?.x ?? defaultCpx;
        const cpy = points[2]?.y ?? defaultCpy;

        if (isDashed) ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(cpx, cpy, p1.x, p1.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tangent at end: (p1 - cp)
        const tgx = p1.x - cpx;
        const tgy = p1.y - cpy;
        drawFilledArrowhead(ctx, p1.x - tgx, p1.y - tgy, p1.x, p1.y, headSize, color);

        if (isDouble) {
            const tgx0 = p0.x - cpx;
            const tgy0 = p0.y - cpy;
            drawFilledArrowhead(ctx, p0.x - tgx0, p0.y - tgy0, p0.x, p0.y, headSize, color);
        }

        // Draw curve bend control point when selected
        if (isSelected) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(cpx, cpy);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cpx, cpy, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    } else if (style === 'block') {
        // Solid 3D vector block arrow
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const angle = Math.atan2(dy, dx);
        const headLen = Math.min(36, Math.max(16, len * 0.35));
        const shaftW = Math.max((sw || 4) * 2.5, 10);
        const headW = shaftW * 2.2;
        const shaftLen = Math.max(0, len - headLen);

        ctx.save();
        ctx.translate(p0.x, p0.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -shaftW / 2);
        ctx.lineTo(shaftLen, -shaftW / 2);
        ctx.lineTo(shaftLen, -headW / 2);
        ctx.lineTo(len, 0);
        ctx.lineTo(shaftLen, headW / 2);
        ctx.lineTo(shaftLen, shaftW / 2);
        ctx.lineTo(0, shaftW / 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    } else if (style === 'dimension') {
        // Dimension arrow with dual heads, ticks, and measurement badge
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const tick = 10;
        ctx.beginPath();
        ctx.moveTo(p0.x - nx * tick, p0.y - ny * tick);
        ctx.lineTo(p0.x + nx * tick, p0.y + ny * tick);
        ctx.moveTo(p1.x - nx * tick, p1.y - ny * tick);
        ctx.lineTo(p1.x + nx * tick, p1.y + ny * tick);
        ctx.stroke();

        drawFilledArrowhead(ctx, p0.x, p0.y, p1.x, p1.y, headSize, color);
        drawFilledArrowhead(ctx, p1.x, p1.y, p0.x, p0.y, headSize, color);

        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        const label = calibration
            ? `${((len / calibration.pixelDist) * calibration.realDist).toFixed(1)} ${calibration.unit}`
            : `${Math.round(len)}px`;
        drawPillBadge(ctx, mx, my, label, color);
    } else if (style === 'crossbar') {
        // Straight line + arrowhead + pelvic & thoracic perpendicular crossbars
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        drawFilledArrowhead(ctx, p0.x, p0.y, p1.x, p1.y, headSize, color);

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const barWidth = Math.min(100, Math.max(35, len * 0.45));

        [0.35, 0.72].forEach(ratio => {
            const bx = p0.x + dx * ratio;
            const by = p0.y + dy * ratio;
            ctx.beginPath();
            ctx.moveTo(bx - nx * barWidth, by - ny * barWidth);
            ctx.lineTo(bx + nx * barWidth, by + ny * barWidth);
            ctx.stroke();

            const tick = 4;
            ctx.beginPath();
            ctx.moveTo(bx - nx * barWidth - (dx / len) * tick, by - ny * barWidth - (dy / len) * tick);
            ctx.lineTo(bx - nx * barWidth + (dx / len) * tick, by - ny * barWidth + (dy / len) * tick);
            ctx.moveTo(bx + nx * barWidth - (dx / len) * tick, by + ny * barWidth - (dy / len) * tick);
            ctx.lineTo(bx + nx * barWidth + (dx / len) * tick, by + ny * barWidth + (dy / len) * tick);
            ctx.stroke();
        });
    } else if (style === 'circle') {
        // Rotational / torsion arc arrow
        const radius = Math.max(16, dist(p0.x, p0.y, p1.x, p1.y));
        const endAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const startAngle = endAngle - Math.PI * 1.35;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, radius, startAngle, endAngle);
        ctx.stroke();

        const tangentX = p1.x + Math.sin(endAngle) * 12;
        const tangentY = p1.y - Math.cos(endAngle) * 12;
        drawFilledArrowhead(ctx, tangentX, tangentY, p1.x, p1.y, headSize, color);

        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else {
        // Straight line (single, double, dashed_single, dashed_double)
        if (isDashed) ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.setLineDash([]);

        drawFilledArrowhead(ctx, p0.x, p0.y, p1.x, p1.y, headSize, color);

        if (isDouble) {
            drawFilledArrowhead(ctx, p1.x, p1.y, p0.x, p0.y, headSize, color);
        }
    }

    // Endpoint handles
    const dotSize = isSelected ? 7 : 4;
    [p0, p1].forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? (idx === 0 ? '#10b981' : '#f43f5e') : color;
        ctx.fill();
        if (isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Move handle at midpoint when selected
    if (isSelected && style !== 'block') {
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.restore();
}

function drawDegreeBadge(ctx, cx, cy, degrees, color, scale = 1) {
    const text = `${degrees.toFixed(1)}°`;
    ctx.save();
    ctx.font = `bold ${Math.round(13 * scale)}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const pw = 10 * scale, ph = 5 * scale, r = 5 * scale;
    const bw = metrics.width + pw * 2;
    const bh = 18 * scale + ph * 2;
    const bx = cx - bw / 2, by = cy - bh / 2;

    // Background pill
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, r);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    ctx.fillStyle = luminance(color) > 0.5 ? '#1e293b' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
}

function luminance(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function drawArc(ctx, bx, by, ax, ay, cx, cy, color, sw) {
    const startAngle = Math.atan2(ay - by, ax - bx);
    const endAngle = Math.atan2(cy - by, cx - bx);
    const radius = Math.min(40, dist(ax, ay, bx, by) * 0.35, dist(cx, cy, bx, by) * 0.35);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + radius * Math.cos(startAngle), by + radius * Math.sin(startAngle));
    ctx.arc(bx, by, radius, startAngle, endAngle, calcAngleDeg(ax, ay, bx, by, cx, cy) > 0);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ',0.20)').replace('rgb(', 'rgba(');
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},0.20)`;
    }
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, radius, startAngle, endAngle, calcAngleDeg(ax, ay, bx, by, cx, cy) > 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = sw;
    ctx.stroke();
    ctx.restore();
}

function smoothCurve(ctx, points) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y);
    } else {
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    }
    ctx.stroke();
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PostureImageEditorModal({
    isOpen,
    onClose,
    imageSrc,
    originalImageSrc = null,
    initialAnnotations = null,
    initialMeta = null,
    galleryId = null,
    athleteId = null,
    athleteName = '',
    onSaved = () => {},
}) {
    // ----------------------------------------------------------
    // STATE
    // ----------------------------------------------------------
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

    // Tools & settings
    const [activeTool, setActiveTool] = useState(TOOL_MODES.SELECT);
    const [activeColor, setActiveColor] = useState(COLORS[0].hex);
    const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[1].value);
    const [selectedLandmark, setSelectedLandmark] = useState(LANDMARKS[0]);
    const [selectedHeatzone, setSelectedHeatzone] = useState(HEATMAP_ZONES[0]);
    const [arrowStyle, setArrowStyle] = useState(ARROW_STYLES[0].id);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // Annotations (each annotation = { type, layer, ...data })
    const [annotations, setAnnotations] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

    // Temporary drawing state
    const [tempPoints, setTempPoints] = useState([]);
    const finalizeAnnotationRef = useRef(null);
    const isDrawingVectorRef = useRef(false);
    const vectorStartRef = useRef(null);
    const vectorCurrentRef = useRef(null);
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragHandleIdx, setDragHandleIdx] = useState(null);
    const [dragAnnotationId, setDragAnnotationId] = useState(null);

    // View state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Layers visibility
    const [layerVisibility, setLayerVisibility] = useState(
        Object.fromEntries(Object.keys(LAYER_NAMES).map(k => [k, true]))
    );
    const [showLayerPanel, setShowLayerPanel] = useState(false);

    // Grid
    const [showGrid, setShowGrid] = useState(false);

    // Symmetry mirror
    const [showMirror, setShowMirror] = useState(false);
    const [mirrorX, setMirrorX] = useState(0.5); // ratio 0-1

    // Image filters (display only)
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0, sharpen: false });

    // Scale calibration
    const [calibration, setCalibration] = useState(null); // { pixelDist, realDist, unit }
    const [calibrating, setCalibrating] = useState(false);
    const [calibPoints, setCalibPoints] = useState([]);

    // Crop
    const [cropMode, setCropMode] = useState(false);
    const [cropRect, setCropRect] = useState(null);

    // Rotate / Flip
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Text input
    const [textInput, setTextInput] = useState('');
    const [textInputPos, setTextInputPos] = useState(null);

    // Saving
    const [saving, setSaving] = useState(false);
    const [toolbarSection, setToolbarSection] = useState('tools'); // tools | settings | presets | layers

    // ----------------------------------------------------------
    // IMAGE LOADING
    // ----------------------------------------------------------
    useEffect(() => {
        const srcToLoad = originalImageSrc || imageSrc;
        if (!isOpen || !srcToLoad) return;
        setImageLoaded(false);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imgRef.current = img;
            // Fit to container
            const container = containerRef.current;
            if (container) {
                const maxW = container.clientWidth - 4;
                const maxH = container.clientHeight - 4;
                const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
                setCanvasSize({
                    w: Math.round(img.naturalWidth * scale),
                    h: Math.round(img.naturalHeight * scale),
                });
            } else {
                setCanvasSize({ w: img.naturalWidth, h: img.naturalHeight });
            }
            setImageLoaded(true);
            setMirrorX(0.5);
        };
        img.onerror = () => {
            console.error('Failed to load editor image');
        };
        img.src = srcToLoad;
    }, [isOpen, imageSrc, originalImageSrc]);

    // Reset / initialize state on open
    useEffect(() => {
        if (isOpen) {
            let parsedAnns = [];
            if (initialAnnotations) {
                if (typeof initialAnnotations === 'string') {
                    try { parsedAnns = JSON.parse(initialAnnotations); } catch (e) { parsedAnns = []; }
                } else if (Array.isArray(initialAnnotations)) {
                    parsedAnns = initialAnnotations;
                }
            }
            setAnnotations(parsedAnns);
            setHistory(parsedAnns.length > 0 ? [parsedAnns] : []);
            setHistoryIndex(parsedAnns.length > 0 ? 0 : -1);
            setTempPoints([]);
            setSelectedAnnotationId(null);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setActiveTool(TOOL_MODES.SELECT);
            setShowGrid(false);
            setShowMirror(false);
            setFilters({ brightness: 100, contrast: 100, grayscale: 0, sharpen: false });
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
            setCropMode(false);
            setCropRect(null);

            let parsedMeta = null;
            if (initialMeta) {
                if (typeof initialMeta === 'string') {
                    try { parsedMeta = JSON.parse(initialMeta); } catch (e) { parsedMeta = null; }
                } else if (typeof initialMeta === 'object') {
                    parsedMeta = initialMeta;
                }
            }
            setCalibration(parsedMeta?.calibration || null);
            setCalibrating(false);
            setCalibPoints([]);
            setToolbarSection('tools');
        }
    }, [isOpen, initialAnnotations, initialMeta]);

    // ----------------------------------------------------------
    // HISTORY (Undo/Redo)
    // ----------------------------------------------------------
    const pushHistory = useCallback((newAnnotations) => {
        setHistory(prev => {
            const truncated = prev.slice(0, historyIndex + 1);
            return [...truncated, JSON.parse(JSON.stringify(newAnnotations))];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) {
            setAnnotations([]);
            setHistoryIndex(-1);
            return;
        }
        const prev = history[historyIndex - 1];
        setAnnotations(JSON.parse(JSON.stringify(prev)));
        setHistoryIndex(i => i - 1);
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const next = history[historyIndex + 1];
        setAnnotations(JSON.parse(JSON.stringify(next)));
        setHistoryIndex(i => i + 1);
    }, [history, historyIndex]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
            if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); redo(); }
            if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); redo(); }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedAnnotationId && activeTool === TOOL_MODES.SELECT && !textInputPos) {
                    e.preventDefault();
                    deleteSelected();
                }
            }
            if (e.key === 'Escape') {
                if (textInputPos) { setTextInputPos(null); setTextInput(''); }
                else if (tempPoints.length > 0) { setTempPoints([]); }
                else if (selectedAnnotationId) { setSelectedAnnotationId(null); }
                else if (activeTool !== TOOL_MODES.SELECT) { setActiveTool(TOOL_MODES.SELECT); }
                else { onClose(); }
            }
            if (e.key === 'Enter' && activeTool === TOOL_MODES.CURVE && tempPoints.length >= 2) {
                finalizeAnnotationRef.current?.(tempPoints);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, undo, redo, selectedAnnotationId, activeTool, textInputPos, tempPoints]);

    const deleteSelected = useCallback(() => {
        if (!selectedAnnotationId) return;
        const newAnn = annotations.filter(a => a.id !== selectedAnnotationId);
        setAnnotations(newAnn);
        pushHistory(newAnn);
        setSelectedAnnotationId(null);
    }, [selectedAnnotationId, annotations, pushHistory]);

    // ----------------------------------------------------------
    // COORDINATE TRANSFORM (screen <-> canvas)
    // ----------------------------------------------------------
    const screenToCanvas = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
        const x = ((clientX - rect.left) / rect.width) * canvasSize.w;
        const y = ((clientY - rect.top) / rect.height) * canvasSize.h;
        return { x, y };
    }, [canvasSize]);

    // ----------------------------------------------------------
    // CANVAS RENDER
    // ----------------------------------------------------------
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !imageLoaded) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvasSize.w * dpr;
        canvas.height = canvasSize.h * dpr;
        canvas.style.width = canvasSize.w + 'px';
        canvas.style.height = canvasSize.h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

        // Apply transformations
        ctx.save();
        ctx.translate(canvasSize.w / 2, canvasSize.h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-canvasSize.w / 2, -canvasSize.h / 2);

        // Apply display filters
        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%)`;

        // Draw image
        ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);
        ctx.filter = 'none';

        ctx.restore();

        // Grid overlay
        if (showGrid) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 0.5;
            const step = 40;
            for (let x = step; x < canvasSize.w; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasSize.h);
                ctx.stroke();
            }
            for (let y = step; y < canvasSize.h; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvasSize.w, y);
                ctx.stroke();
            }
            // Center lines (thicker)
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(canvasSize.w / 2, 0);
            ctx.lineTo(canvasSize.w / 2, canvasSize.h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, canvasSize.h / 2);
            ctx.lineTo(canvasSize.w, canvasSize.h / 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Draw annotations
        annotations.forEach(ann => {
            if (!layerVisibility[ann.layer]) return;
            const isSelected = ann.id === selectedAnnotationId;

            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            switch (ann.type) {
                case 'angle': {
                    const { points, color, sw } = ann;
                    if (points.length < 2) break;
                    // Draw arms
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    if (points.length === 3) {
                        ctx.moveTo(points[1].x, points[1].y);
                        ctx.lineTo(points[2].x, points[2].y);
                    }
                    ctx.stroke();

                    // Dashed extension lines
                    if (points.length >= 2) {
                        ctx.save();
                        ctx.setLineDash([5, 4]);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = Math.max(1, sw * 0.5);
                        ctx.globalAlpha = 0.5;
                        // Extend from A beyond B
                        const extLen = 30;
                        const dx1 = points[0].x - points[1].x;
                        const dy1 = points[0].y - points[1].y;
                        const d1 = Math.sqrt(dx1*dx1 + dy1*dy1) || 1;
                        ctx.beginPath();
                        ctx.moveTo(points[0].x, points[0].y);
                        ctx.lineTo(points[0].x + (dx1/d1)*extLen, points[0].y + (dy1/d1)*extLen);
                        ctx.stroke();
                        if (points.length === 3) {
                            const dx2 = points[2].x - points[1].x;
                            const dy2 = points[2].y - points[1].y;
                            const d2 = Math.sqrt(dx2*dx2 + dy2*dy2) || 1;
                            ctx.beginPath();
                            ctx.moveTo(points[2].x, points[2].y);
                            ctx.lineTo(points[2].x + (dx2/d2)*extLen, points[2].y + (dy2/d2)*extLen);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }

                    // Arc + degree badge
                    if (points.length === 3) {
                        drawArc(ctx, points[1].x, points[1].y, points[0].x, points[0].y, points[2].x, points[2].y, color, sw);
                        const deg = calcAngleDeg(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
                        // Badge position: offset from vertex
                        const midAngle = (Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x) + Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x)) / 2;
                        const badgeDist = 55;
                        const bx = points[1].x + Math.cos(midAngle) * badgeDist;
                        const by = points[1].y + Math.sin(midAngle) * badgeDist;
                        drawDegreeBadge(ctx, bx, by, deg, color);
                    }

                    // Draw handle dots
                    points.forEach((p, i) => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, i === 1 ? 7 : 5, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    });
                    break;
                }

                case 'line': {
                    const { points, color, sw, dashed } = ann;
                    if (points.length < 2) break;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    if (dashed) ctx.setLineDash([8, 5]);
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Crossbar indicators
                    if (ann.crossbars) {
                        const dx = points[1].x - points[0].x;
                        const dy = points[1].y - points[0].y;
                        const len = Math.sqrt(dx*dx + dy*dy) || 1;
                        const px = -dy / len * 8;
                        const py = dx / len * 8;
                        [points[0], points[1]].forEach(p => {
                            ctx.beginPath();
                            ctx.moveTo(p.x + px, p.y + py);
                            ctx.lineTo(p.x - px, p.y - py);
                            ctx.stroke();
                        });
                    }
                    break;
                }

                case 'arrow': {
                    drawArrowAnnotation(ctx, ann, isSelected, calibration);
                    break;
                }

                case 'curve': {
                    const { points, color, sw } = ann;
                    if (points.length < 2) break;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    smoothCurve(ctx, points);

                    // Draw control handles
                    if (isSelected) {
                        points.forEach(p => {
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.fill();
                            ctx.strokeStyle = '#fff';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        });
                    }
                    break;
                }

                case 'text': {
                    const { pos, text, color, fontSize } = ann;
                    const fs = fontSize || 14;
                    ctx.font = `bold ${fs}px Inter, system-ui, sans-serif`;
                    const m = ctx.measureText(text);
                    const pw = 8, ph = 4, r = 4;
                    const bw = m.width + pw * 2;
                    const bh = fs + ph * 2 + 4;

                    ctx.beginPath();
                    ctx.roundRect(pos.x - pw, pos.y - fs - ph, bw, bh, r);
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.fillStyle = color;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    ctx.fillText(text, pos.x, pos.y - fs);
                    break;
                }

                case 'distance': {
                    const { points, color, sw } = ann;
                    if (points.length < 2) break;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    ctx.stroke();

                    // Ruler ticks
                    const d = dist(points[0].x, points[0].y, points[1].x, points[1].y);
                    const dx = points[1].x - points[0].x;
                    const dy = points[1].y - points[0].y;
                    const numTicks = Math.floor(d / 20);
                    for (let t = 1; t < numTicks; t++) {
                        const tx = points[0].x + (dx * t) / numTicks;
                        const ty = points[0].y + (dy * t) / numTicks;
                        const perpX = -dy / d * 4;
                        const perpY = dx / d * 4;
                        ctx.beginPath();
                        ctx.moveTo(tx - perpX, ty - perpY);
                        ctx.lineTo(tx + perpX, ty + perpY);
                        ctx.stroke();
                    }

                    // Ticks at endpoints
                    const perpX0 = -dy / d * 6;
                    const perpY0 = dx / d * 6;
                    [points[0], points[1]].forEach(p => {
                        ctx.beginPath();
                        ctx.moveTo(p.x - perpX0, p.y - perpY0);
                        ctx.lineTo(p.x + perpX0, p.y + perpY0);
                        ctx.stroke();
                    });

                    // Distance label pill
                    const mx = (points[0].x + points[1].x) / 2;
                    const my = (points[0].y + points[1].y) / 2;
                    let label = `${Math.round(d)}px`;
                    if (calibration) {
                        const realD = (d / calibration.pixelDist) * calibration.realDist;
                        label = `${realD.toFixed(1)} ${calibration.unit}`;
                    }
                    drawPillBadge(ctx, mx, my, label, color);
                    break;
                }

                case 'heatmap': {
                    const { center, rx, ry, zoneColor, zoneBorder } = ann;
                    ctx.save();
                    ctx.beginPath();
                    ctx.ellipse(center.x, center.y, Math.abs(rx) || 30, Math.abs(ry) || 20, 0, 0, Math.PI * 2);
                    ctx.fillStyle = zoneColor;
                    ctx.fill();
                    ctx.strokeStyle = zoneBorder;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Center dot
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = zoneBorder;
                    ctx.fill();
                    ctx.restore();
                    break;
                }

                case 'rom_arc': {
                    const { center, radius, startDeg, endDeg, color: arcColor, sw: arcSw } = ann;
                    ctx.save();
                    ctx.strokeStyle = arcColor;
                    ctx.lineWidth = arcSw;
                    const sRad = (startDeg * Math.PI) / 180;
                    const eRad = (endDeg * Math.PI) / 180;

                    // Sector fill
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, radius, sRad, eRad);
                    ctx.closePath();
                    ctx.fillStyle = arcColor.replace(')', ',0.15)').replace('rgb(', 'rgba(');
                    if (arcColor.startsWith('#')) {
                        const r = parseInt(arcColor.slice(1, 3), 16);
                        const g = parseInt(arcColor.slice(3, 5), 16);
                        const b = parseInt(arcColor.slice(5, 7), 16);
                        ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
                    }
                    ctx.fill();

                    // Arc line
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, radius, sRad, eRad);
                    ctx.stroke();

                    // Radii lines
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x + radius * Math.cos(sRad), center.y + radius * Math.sin(sRad));
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x + radius * Math.cos(eRad), center.y + radius * Math.sin(eRad));
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Center vertex dot
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = arcColor;
                    ctx.fill();

                    // ROM angle badge
                    let sweepDeg = (endDeg - startDeg + 360) % 360;
                    if (sweepDeg === 0) sweepDeg = 360;
                    const midRad = sRad + (sweepDeg * Math.PI / 180) / 2;
                    const bx = center.x + (radius + 22) * Math.cos(midRad);
                    const by = center.y + (radius + 22) * Math.sin(midRad);
                    drawDegreeBadge(ctx, bx, by, sweepDeg, arcColor);

                    ctx.restore();
                    break;
                }

                case 'landmark': {
                    const { pos, lm } = ann;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
                    ctx.fillStyle = lm.color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Crosshair inside
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pos.x - 4, pos.y);
                    ctx.lineTo(pos.x + 4, pos.y);
                    ctx.moveTo(pos.x, pos.y - 4);
                    ctx.lineTo(pos.x, pos.y + 4);
                    ctx.stroke();

                    // Label badge
                    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
                    const m = ctx.measureText(lm.label);
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.roundRect(pos.x + 10, pos.y - 8, m.width + 8, 16, 3);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(lm.label, pos.x + 14, pos.y);
                    ctx.restore();
                    break;
                }

                default:
                    break;
            }

            // Selection outline / handles
            if (isSelected) {
                ctx.save();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]);

                if (ann.points) {
                    ann.points.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
                        ctx.stroke();
                    });
                } else if (ann.type === 'rom_arc' && ann.center) {
                    const sRad = (ann.startDeg * Math.PI) / 180;
                    const eRad = (ann.endDeg * Math.PI) / 180;
                    let sweepDeg = (ann.endDeg - ann.startDeg + 360) % 360;
                    if (sweepDeg === 0) sweepDeg = 360;
                    const midRad = sRad + (sweepDeg * Math.PI / 180) / 2;

                    const handles = [
                        { x: ann.center.x, y: ann.center.y, color: '#10b981' }, // 0: Center
                        { x: ann.center.x + ann.radius * Math.cos(sRad), y: ann.center.y + ann.radius * Math.sin(sRad), color: '#38bdf8' }, // 1: Start arm
                        { x: ann.center.x + ann.radius * Math.cos(eRad), y: ann.center.y + ann.radius * Math.sin(eRad), color: '#f43f5e' }, // 2: End arm
                        { x: ann.center.x + ann.radius * Math.cos(midRad), y: ann.center.y + ann.radius * Math.sin(midRad), color: '#facc15' }, // 3: Arc mid (Radius)
                    ];

                    ctx.setLineDash([]);
                    handles.forEach((h) => {
                        ctx.beginPath();
                        ctx.arc(h.x, h.y, 6.5, 0, Math.PI * 2);
                        ctx.fillStyle = h.color;
                        ctx.fill();
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(h.x, h.y, 9.5, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    });
                }
                ctx.setLineDash([]);
                ctx.restore();
            }

            ctx.restore();
        });

        // Draw temporary points / live preview for current tool
        if (tempPoints.length > 0) {
            ctx.save();
            ctx.fillStyle = activeColor;
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = strokeWidth;

            if (activeTool === TOOL_MODES.ARROW) {
                if (tempPoints.length >= 2) {
                    let pts = tempPoints;
                    if (arrowStyle === 'curved' || arrowStyle === 'curved_right' || arrowStyle === 'curved_left') {
                        const mx = (tempPoints[0].x + tempPoints[1].x) / 2;
                        const my = (tempPoints[0].y + tempPoints[1].y) / 2;
                        const dx = tempPoints[1].x - tempPoints[0].x;
                        const dy = tempPoints[1].y - tempPoints[0].y;
                        const sign = arrowStyle === 'curved_left' ? -1 : 1;
                        pts = [tempPoints[0], tempPoints[1], { x: mx - dy * 0.35 * sign, y: my + dx * 0.35 * sign }];
                    }
                    drawArrowAnnotation(ctx, {
                        id: 'temp_preview_arrow',
                        type: 'arrow',
                        points: pts,
                        color: activeColor,
                        sw: strokeWidth,
                        arrowStyle,
                    }, false, calibration);
                }
            } else if (activeTool === TOOL_MODES.LINE) {
                tempPoints.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });
                if (tempPoints.length >= 2) {
                    ctx.beginPath();
                    ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
                    ctx.lineTo(tempPoints[1].x, tempPoints[1].y);
                    ctx.stroke();
                }
            } else if (activeTool === TOOL_MODES.DISTANCE) {
                if (tempPoints.length >= 2) {
                    const p0 = tempPoints[0], p1 = tempPoints[1];
                    ctx.beginPath();
                    ctx.moveTo(p0.x, p0.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.stroke();
                    const d = dist(p0.x, p0.y, p1.x, p1.y);
                    const label = calibration
                        ? `${((d / calibration.pixelDist) * calibration.realDist).toFixed(1)} ${calibration.unit}`
                        : `${Math.round(d)}px`;
                    drawPillBadge(ctx, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2, label, activeColor);
                }
            } else if (activeTool === TOOL_MODES.ANGLE) {
                tempPoints.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });
                if (tempPoints.length >= 2) {
                    ctx.beginPath();
                    ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
                    ctx.lineTo(tempPoints[1].x, tempPoints[1].y);
                    ctx.stroke();
                }
            } else if (activeTool === TOOL_MODES.ROM_ARC) {
                if (tempPoints.length === 1) {
                    ctx.beginPath();
                    ctx.arc(tempPoints[0].x, tempPoints[0].y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = activeColor;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (tempPoints.length === 2) {
                    const center = tempPoints[0];
                    const startP = tempPoints[1];
                    // Center dot
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#10b981';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Start arm
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(startP.x, startP.y);
                    ctx.strokeStyle = activeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.stroke();

                    // Start dot
                    ctx.beginPath();
                    ctx.arc(startP.x, startP.y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Dashed radius guide
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, startP.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = activeColor;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            if (activeTool === TOOL_MODES.CURVE) {
                tempPoints.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });
                if (tempPoints.length >= 2) {
                    smoothCurve(ctx, tempPoints);
                }
            }
            ctx.restore();
        }

        // Calibration mode temp points
        if (calibrating && calibPoints.length > 0) {
            ctx.save();
            ctx.strokeStyle = '#f97316';
            ctx.fillStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            calibPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });
            if (calibPoints.length === 2) {
                ctx.beginPath();
                ctx.moveTo(calibPoints[0].x, calibPoints[0].y);
                ctx.lineTo(calibPoints[1].x, calibPoints[1].y);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Symmetry mirror line
        if (showMirror) {
            const mx = canvasSize.w * mirrorX;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(mx, 0);
            ctx.lineTo(mx, canvasSize.h);
            ctx.stroke();
            ctx.setLineDash([]);
            // Mirror label
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 10px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('← MIRROR →', mx, 16);
            ctx.restore();
        }

        // Crop overlay
        if (cropMode && cropRect) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
            ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
            ctx.setLineDash([]);
            // Rule of thirds
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 0.5;
            for (let i = 1; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(cropRect.x + (cropRect.w * i / 3), cropRect.y);
                ctx.lineTo(cropRect.x + (cropRect.w * i / 3), cropRect.y + cropRect.h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cropRect.x, cropRect.y + (cropRect.h * i / 3));
                ctx.lineTo(cropRect.x + cropRect.w, cropRect.y + (cropRect.h * i / 3));
                ctx.stroke();
            }
            ctx.restore();
        }

    }, [canvasSize, imageLoaded, annotations, tempPoints, layerVisibility, selectedAnnotationId,
        showGrid, showMirror, mirrorX, filters, rotation, flipH, flipV, activeColor, strokeWidth,
        activeTool, arrowStyle, calibrating, calibPoints, calibration, cropMode, cropRect]);

    useEffect(() => {
        if (imageLoaded) renderCanvas();
    }, [renderCanvas, imageLoaded]);

    // ----------------------------------------------------------
    // MOUSE / TOUCH HANDLERS
    // ----------------------------------------------------------
    const handleCanvasMouseDown = (e) => {
        e.preventDefault();
        const { x, y } = screenToCanvas(e.clientX, e.clientY);

        // Panning with middle mouse or space
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }

        // Calibration mode
        if (calibrating) {
            if (calibPoints.length < 2) {
                setCalibPoints(prev => [...prev, { x, y }]);
                if (calibPoints.length === 1) {
                    const d = dist(calibPoints[0].x, calibPoints[0].y, x, y);
                    const realDist = prompt('Masukkan jarak sebenarnya (misal: 100 untuk 100cm):', '100');
                    if (realDist && !isNaN(parseFloat(realDist))) {
                        const unit = prompt('Satuan (cm / inch / mm):', 'cm') || 'cm';
                        setCalibration({ pixelDist: d, realDist: parseFloat(realDist), unit });
                    }
                    setCalibrating(false);
                    setCalibPoints([]);
                }
            }
            return;
        }

        // Crop mode
        if (cropMode && !cropRect) {
            setCropRect({ x, y, w: 0, h: 0 });
            setIsDragging(true);
            return;
        }

        // If text input is open and user clicks on canvas, submit if text exists or cancel if empty
        if (textInputPos) {
            if (textInput.trim()) {
                submitText();
            } else {
                setTextInputPos(null);
                setTextInput('');
            }
            return;
        }

        // Text placement
        if (activeTool === TOOL_MODES.TEXT) {
            setTextInputPos({ x, y });
            return;
        }

        // Landmark placement
        if (activeTool === TOOL_MODES.LANDMARK) {
            const id = Date.now().toString();
            const ann = {
                id, type: 'landmark', layer: 'landmarks',
                pos: { x, y }, lm: selectedLandmark
            };
            const newAnn = [...annotations, ann];
            setAnnotations(newAnn);
            pushHistory(newAnn);
            setSelectedAnnotationId(id);
            setActiveTool(TOOL_MODES.SELECT);
            return;
        }

        // Heatmap zone
        if (activeTool === TOOL_MODES.HEATMAP) {
            const id = Date.now().toString();
            const ann = {
                id, type: 'heatmap', layer: 'zones',
                center: { x, y }, rx: 0, ry: 0,
                zoneColor: selectedHeatzone.color,
                zoneBorder: selectedHeatzone.border,
            };
            const newAnn = [...annotations, ann];
            setAnnotations(newAnn);
            setDragAnnotationId(id);
            setIsDragging(true);
            return;
        }

        // ROM Arc
        if (activeTool === TOOL_MODES.ROM_ARC) {
            if (tempPoints.length === 0) {
                setTempPoints([{ x, y }]);
            } else if (tempPoints.length === 1) {
                const center = tempPoints[0];
                const radius = dist(center.x, center.y, x, y);
                const startDeg = Math.atan2(y - center.y, x - center.x) * (180 / Math.PI);
                setTempPoints([...tempPoints, { x, y, radius, startDeg }]);
            } else if (tempPoints.length === 2) {
                const center = tempPoints[0];
                const radius = tempPoints[1].radius;
                const startDeg = tempPoints[1].startDeg;
                const endDeg = Math.atan2(y - center.y, x - center.x) * (180 / Math.PI);
                const id = Date.now().toString();
                const ann = {
                    id, type: 'rom_arc', layer: 'rom',
                    center, radius, startDeg, endDeg,
                    color: activeColor, sw: strokeWidth,
                };
                const newAnn = [...annotations, ann];
                setAnnotations(newAnn);
                pushHistory(newAnn);
                setTempPoints([]);
                setSelectedAnnotationId(id);
                setActiveTool(TOOL_MODES.SELECT);
            }
            return;
        }

        // Select mode
        if (activeTool === TOOL_MODES.SELECT) {
            // Check if clicking on a handle of selected annotation
            if (selectedAnnotationId) {
                const selAnn = annotations.find(a => a.id === selectedAnnotationId);
                if (selAnn?.points) {
                    for (let i = 0; i < selAnn.points.length; i++) {
                        if (dist(x, y, selAnn.points[i].x, selAnn.points[i].y) < 14) {
                            setIsDragging(true);
                            isDraggingRef.current = true;
                            setDragHandleIdx(i);
                            setDragAnnotationId(selectedAnnotationId);
                            return;
                        }
                    }
                }
                if (selAnn?.type === 'rom_arc' && selAnn.center) {
                    const sRad = (selAnn.startDeg * Math.PI) / 180;
                    const eRad = (selAnn.endDeg * Math.PI) / 180;
                    let sweepDeg = (selAnn.endDeg - selAnn.startDeg + 360) % 360;
                    if (sweepDeg === 0) sweepDeg = 360;
                    const midRad = sRad + (sweepDeg * Math.PI / 180) / 2;

                    const handles = [
                        selAnn.center, // 0: Center
                        { x: selAnn.center.x + selAnn.radius * Math.cos(sRad), y: selAnn.center.y + selAnn.radius * Math.sin(sRad) }, // 1: Start arm
                        { x: selAnn.center.x + selAnn.radius * Math.cos(eRad), y: selAnn.center.y + selAnn.radius * Math.sin(eRad) }, // 2: End arm
                        { x: selAnn.center.x + selAnn.radius * Math.cos(midRad), y: selAnn.center.y + selAnn.radius * Math.sin(midRad) }, // 3: Mid/Radius
                    ];

                    for (let i = 0; i < handles.length; i++) {
                        if (dist(x, y, handles[i].x, handles[i].y) < 16) {
                            setIsDragging(true);
                            isDraggingRef.current = true;
                            setDragHandleIdx(i);
                            setDragAnnotationId(selectedAnnotationId);
                            return;
                        }
                    }
                }
                if (selAnn?.pos && dist(x, y, selAnn.pos.x, selAnn.pos.y) < 15) {
                    setIsDragging(true);
                    isDraggingRef.current = true;
                    setDragHandleIdx(0);
                    setDragAnnotationId(selectedAnnotationId);
                    return;
                }
            }

            // Try to select an annotation
            let found = null;
            for (let i = annotations.length - 1; i >= 0; i--) {
                const ann = annotations[i];
                if (!layerVisibility[ann.layer]) continue;
                if (ann.points) {
                    for (const p of ann.points) {
                        if (dist(x, y, p.x, p.y) < 12) { found = ann.id; break; }
                    }
                    if (found) break;
                    if (ann.points.length >= 2) {
                        for (let j = 0; j < ann.points.length - 1; j++) {
                            if (pointNearLine(x, y, ann.points[j].x, ann.points[j].y, ann.points[j+1].x, ann.points[j+1].y, 10)) {
                                found = ann.id;
                                break;
                            }
                        }
                        if (found) break;
                    }
                }
                if (ann.type === 'rom_arc' && ann.center) {
                    const sRad = (ann.startDeg * Math.PI) / 180;
                    const eRad = (ann.endDeg * Math.PI) / 180;
                    const pStart = { x: ann.center.x + ann.radius * Math.cos(sRad), y: ann.center.y + ann.radius * Math.sin(sRad) };
                    const pEnd = { x: ann.center.x + ann.radius * Math.cos(eRad), y: ann.center.y + ann.radius * Math.sin(eRad) };

                    let sweepDeg = (ann.endDeg - ann.startDeg + 360) % 360;
                    if (sweepDeg === 0) sweepDeg = 360;
                    const midRad = sRad + (sweepDeg * Math.PI / 180) / 2;
                    const pBadge = { x: ann.center.x + (ann.radius + 22) * Math.cos(midRad), y: ann.center.y + (ann.radius + 22) * Math.sin(midRad) };

                    const dCenter = dist(x, y, ann.center.x, ann.center.y);
                    const nearCenter = dCenter < 20;
                    const nearStart = pointNearLine(x, y, ann.center.x, ann.center.y, pStart.x, pStart.y, 14);
                    const nearEnd = pointNearLine(x, y, ann.center.x, ann.center.y, pEnd.x, pEnd.y, 14);
                    const nearBadge = dist(x, y, pBadge.x, pBadge.y) < 28;

                    // Point angle normalized to [0, 360) relative to startDeg
                    const ptAngleDeg = ((Math.atan2(y - ann.center.y, x - ann.center.x) * 180 / Math.PI) - ann.startDeg + 360) % 360;
                    const inSector = ptAngleDeg <= sweepDeg;
                    const nearArc = inSector && Math.abs(dCenter - ann.radius) < 16;
                    const insideSector = inSector && dCenter <= ann.radius;

                    if (nearCenter || nearStart || nearEnd || nearArc || insideSector || nearBadge) {
                        found = ann.id;
                        break;
                    }
                }
                if (ann.pos && dist(x, y, ann.pos.x, ann.pos.y) < 20) {
                    found = ann.id;
                    break;
                }
                if (ann.center && ann.type !== 'rom_arc') {
                    if (dist(x, y, ann.center.x, ann.center.y) < (ann.radius || Math.max(Math.abs(ann.rx || 0), Math.abs(ann.ry || 0)) + 10)) {
                        found = ann.id;
                        break;
                    }
                }
            }
            setSelectedAnnotationId(found);
            if (found) {
                setIsDragging(true);
                isDraggingRef.current = true;
                setDragAnnotationId(found);
                // Store click offset relative to first point/pos/center for smooth dragging
                const fAnn = annotations.find(a => a.id === found);
                if (fAnn?.color) setActiveColor(fAnn.color);
                if (fAnn?.sw) setStrokeWidth(fAnn.sw);

                if (fAnn?.points) {
                    dragOffsetRef.current = { x: x - fAnn.points[0].x, y: y - fAnn.points[0].y };
                } else if (fAnn?.pos) {
                    dragOffsetRef.current = { x: x - fAnn.pos.x, y: y - fAnn.pos.y };
                } else if (fAnn?.center) {
                    dragOffsetRef.current = { x: x - fAnn.center.x, y: y - fAnn.center.y };
                }
            }
            return;
        }

        // Vector drag-to-draw tools (Arrow, Line, Distance) - PURE DRAG ONLY (NO CLICK-CLICK)
        if ([TOOL_MODES.ARROW, TOOL_MODES.LINE, TOOL_MODES.DISTANCE].includes(activeTool)) {
            // First: check if clicking on an existing handle of the selected annotation
            if (selectedAnnotationId) {
                const selAnn = annotations.find(a => a.id === selectedAnnotationId);
                if (selAnn?.points) {
                    for (let i = 0; i < selAnn.points.length; i++) {
                        if (dist(x, y, selAnn.points[i].x, selAnn.points[i].y) < 18) {
                            isDraggingRef.current = true;
                            setIsDragging(true);
                            setDragHandleIdx(i);
                            setDragAnnotationId(selectedAnnotationId);
                            return;
                        }
                    }
                }
            }

            // Check if clicking near any existing arrow/line handle to select and drag it
            for (let i = annotations.length - 1; i >= 0; i--) {
                const ann = annotations[i];
                if (ann.type === activeTool && layerVisibility[ann.layer] !== false && ann.points) {
                    for (let j = 0; j < ann.points.length; j++) {
                        if (dist(x, y, ann.points[j].x, ann.points[j].y) < 18) {
                            setSelectedAnnotationId(ann.id);
                            isDraggingRef.current = true;
                            setIsDragging(true);
                            setDragHandleIdx(j);
                            setDragAnnotationId(ann.id);
                            return;
                        }
                    }
                }
            }

            // Start dragging to draw! (Pure drag: press down, pull/drag to length, release)
            isDrawingVectorRef.current = true;
            vectorStartRef.current = { x, y };
            vectorCurrentRef.current = { x, y };
            setTempPoints([{ x, y }, { x, y }]);
            return;
        }

        // Multi-point click tools (Angle, Curve)
        if (activeTool === TOOL_MODES.ANGLE || activeTool === TOOL_MODES.CURVE) {
            const maxPts = activeTool === TOOL_MODES.ANGLE ? 3 : 20;
            const newPts = [...tempPoints, { x, y }];
            setTempPoints(newPts);

            if (activeTool === TOOL_MODES.ANGLE && newPts.length >= 3) {
                finalizeAnnotation(newPts);
            }
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            return;
        }

        const { x, y } = screenToCanvas(e.clientX, e.clientY);

        // Vector drag-to-draw preview (Arrow, Line, Distance)
        if (isDrawingVectorRef.current && vectorStartRef.current) {
            vectorCurrentRef.current = { x, y };
            setTempPoints([vectorStartRef.current, { x, y }]);
            return;
        }

        if (!isDragging && !isDraggingRef.current) return;

        // Crop dragging
        if (cropMode && cropRect) {
            setCropRect(prev => ({
                ...prev,
                w: x - prev.x,
                h: y - prev.y,
            }));
            return;
        }

        // Dragging annotations
        if (dragAnnotationId) {
            const ann = annotations.find(a => a.id === dragAnnotationId);

            // ROM Arc dragging & handles
            if (ann?.type === 'rom_arc') {
                if (dragHandleIdx === 0) {
                    // Center handle (pivot)
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, center: { x, y } };
                    });
                    setAnnotations(newAnn);
                    return;
                } else if (dragHandleIdx === 1) {
                    // Start arm handle -> updates start angle & radius
                    const sDeg = Math.atan2(y - ann.center.y, x - ann.center.x) * (180 / Math.PI);
                    const newR = Math.max(20, dist(ann.center.x, ann.center.y, x, y));
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, startDeg: sDeg, radius: newR };
                    });
                    setAnnotations(newAnn);
                    return;
                } else if (dragHandleIdx === 2) {
                    // End arm handle -> updates end angle & radius
                    const eDeg = Math.atan2(y - ann.center.y, x - ann.center.x) * (180 / Math.PI);
                    const newR = Math.max(20, dist(ann.center.x, ann.center.y, x, y));
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, endDeg: eDeg, radius: newR };
                    });
                    setAnnotations(newAnn);
                    return;
                } else if (dragHandleIdx === 3) {
                    // Arc mid / radius resize handle -> updates radius
                    const newR = Math.max(20, dist(ann.center.x, ann.center.y, x, y));
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, radius: newR };
                    });
                    setAnnotations(newAnn);
                    return;
                } else if (dragHandleIdx === null) {
                    // Dragging whole ROM arc by body
                    const newCenterX = x - dragOffsetRef.current.x;
                    const newCenterY = y - dragOffsetRef.current.y;
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, center: { x: newCenterX, y: newCenterY } };
                    });
                    setAnnotations(newAnn);
                    return;
                }
            }

            // Heatmap ellipse dragging
            if (ann?.type === 'heatmap' && dragHandleIdx === null) {
                const newAnn = annotations.map(a => {
                    if (a.id !== dragAnnotationId) return a;
                    return { ...a, rx: x - a.center.x, ry: y - a.center.y };
                });
                setAnnotations(newAnn);
                return;
            }

            // Handle dragging for points-based annotations (including Arrow endpoints & curve bend handle)
            if (ann?.points && dragHandleIdx !== null) {
                const newAnn = annotations.map(a => {
                    if (a.id !== dragAnnotationId) return a;
                    const pts = [...a.points];
                    pts[dragHandleIdx] = { x, y };
                    return { ...a, points: pts };
                });
                setAnnotations(newAnn);
                return;
            }

            // Move entire points-based annotation by delta
            if (ann?.points && dragHandleIdx === null) {
                const anchorX = x - dragOffsetRef.current.x;
                const anchorY = y - dragOffsetRef.current.y;
                const dx = anchorX - ann.points[0].x;
                const dy = anchorY - ann.points[0].y;
                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    const newAnn = annotations.map(a => {
                        if (a.id !== dragAnnotationId) return a;
                        return { ...a, points: a.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
                    });
                    setAnnotations(newAnn);
                }
                return;
            }

            // Move pos-based annotations (text, landmark)
            if (ann?.pos) {
                const newAnn = annotations.map(a => {
                    if (a.id !== dragAnnotationId) return a;
                    return { ...a, pos: { x, y } };
                });
                setAnnotations(newAnn);
            }
        }
    };

    const handleCanvasMouseUp = () => {
        if (isPanning) {
            setIsPanning(false);
            return;
        }
        if (isDrawingVectorRef.current) {
            isDrawingVectorRef.current = false;
            const start = vectorStartRef.current;
            const end = vectorCurrentRef.current;
            vectorStartRef.current = null;
            vectorCurrentRef.current = null;
            setTempPoints([]);

            if (start && end) {
                const d = dist(start.x, start.y, end.x, end.y);
                if (d > 14) {
                    finalizeAnnotation([start, end]);
                } else {
                    // Click without dragging: marks completion / deselects and returns to select mode
                    setSelectedAnnotationId(null);
                    setActiveTool(TOOL_MODES.SELECT);
                }
            }
            return;
        }
        if (isDragging && dragAnnotationId) {
            const finishedId = dragAnnotationId;
            pushHistory(annotations);
            if (activeTool === TOOL_MODES.HEATMAP) {
                setSelectedAnnotationId(finishedId);
                setActiveTool(TOOL_MODES.SELECT);
            }
        }
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragHandleIdx(null);
        setDragAnnotationId(null);
    };

    useEffect(() => {
        const onGlobalMouseUp = () => {
            if (isDraggingRef.current || isDrawingVectorRef.current) {
                handleCanvasMouseUp();
            }
        };
        window.addEventListener('mouseup', onGlobalMouseUp);
        return () => window.removeEventListener('mouseup', onGlobalMouseUp);
    }, []);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.max(0.3, Math.min(5, z + delta)));
    };

    // ----------------------------------------------------------
    // FINALIZE ANNOTATION (from temp points)
    // ----------------------------------------------------------
    const finalizeAnnotation = (points) => {
        const id = Date.now().toString();
        let ann;

        switch (activeTool) {
            case TOOL_MODES.ANGLE:
                ann = { id, type: 'angle', layer: 'angles', points, color: activeColor, sw: strokeWidth };
                break;
            case TOOL_MODES.LINE:
                ann = { id, type: 'line', layer: 'lines', points, color: activeColor, sw: strokeWidth, dashed: false, crossbars: false };
                break;
            case TOOL_MODES.ARROW: {
                let pts = points;
                if (arrowStyle === 'curved' || arrowStyle === 'curved_right' || arrowStyle === 'curved_left') {
                    const mx = (points[0].x + points[1].x) / 2;
                    const my = (points[0].y + points[1].y) / 2;
                    const dx = points[1].x - points[0].x;
                    const dy = points[1].y - points[0].y;
                    const sign = arrowStyle === 'curved_left' ? -1 : 1;
                    const cpx = mx - dy * 0.35 * sign;
                    const cpy = my + dx * 0.35 * sign;
                    pts = [points[0], points[1], { x: cpx, y: cpy }];
                }
                ann = { id, type: 'arrow', layer: 'lines', points: pts, color: activeColor, sw: strokeWidth, arrowStyle };
                break;
            }
            case TOOL_MODES.CURVE:
                ann = { id, type: 'curve', layer: 'curves', points, color: activeColor, sw: strokeWidth };
                break;
            case TOOL_MODES.DISTANCE:
                ann = { id, type: 'distance', layer: 'distance', points, color: activeColor, sw: strokeWidth };
                break;
            default:
                return;
        }

        const newAnn = [...annotations, ann];
        setAnnotations(newAnn);
        pushHistory(newAnn);
        setTempPoints([]);
        setSelectedAnnotationId(id);
        setActiveTool(TOOL_MODES.SELECT);
    };
    finalizeAnnotationRef.current = finalizeAnnotation;

    // Curve: double-click to finalize
    const handleCanvasDoubleClick = () => {
        if (activeTool === TOOL_MODES.CURVE && tempPoints.length >= 2) {
            finalizeAnnotation(tempPoints);
        }
    };

    // ----------------------------------------------------------
    // TEXT SUBMIT
    // ----------------------------------------------------------
    const submitText = () => {
        if (!textInput.trim() || !textInputPos) return;
        const id = Date.now().toString();
        const ann = {
            id, type: 'text', layer: 'texts',
            pos: textInputPos, text: textInput.trim(),
            color: activeColor, fontSize: 14,
        };
        const newAnn = [...annotations, ann];
        setAnnotations(newAnn);
        pushHistory(newAnn);
        setTextInput('');
        setTextInputPos(null);
        setSelectedAnnotationId(id);
        setActiveTool(TOOL_MODES.SELECT);
    };

    // ----------------------------------------------------------
    // PRESETS
    // ----------------------------------------------------------
    const applyPreset = (presetName) => {
        const cx = canvasSize.w / 2;
        const cy = canvasSize.h / 2;
        const id = Date.now().toString();
        let newAnns = [];

        switch (presetName) {
            case 'knee_angle':
                newAnns = [{
                    id, type: 'angle', layer: 'angles', color: '#06b6d4', sw: 4,
                    points: [
                        { x: cx - 20, y: cy - 80 },
                        { x: cx, y: cy },
                        { x: cx + 10, y: cy + 90 }
                    ],
                }];
                break;
            case 'spine_curve':
                newAnns = [{
                    id, type: 'curve', layer: 'curves', color: '#facc15', sw: 4,
                    points: [
                        { x: cx, y: cy - 120 },
                        { x: cx + 15, y: cy - 60 },
                        { x: cx - 10, y: cy },
                        { x: cx + 5, y: cy + 60 },
                        { x: cx, y: cy + 120 },
                    ],
                }];
                break;
            case 'posture_plumb':
                newAnns = [
                    {
                        id: id + '_v', type: 'arrow', layer: 'lines', color: '#f97316', sw: 4, dashed: false,
                        points: [
                            { x: cx, y: cy + 150 },
                            { x: cx, y: cy - 150 }
                        ],
                    },
                    {
                        id: id + '_h1', type: 'line', layer: 'lines', color: '#f97316', sw: 3, dashed: false, crossbars: true,
                        points: [
                            { x: cx - 80, y: cy - 80 },
                            { x: cx + 80, y: cy - 80 }
                        ],
                    },
                    {
                        id: id + '_h2', type: 'line', layer: 'lines', color: '#f97316', sw: 3, dashed: false, crossbars: true,
                        points: [
                            { x: cx - 70, y: cy + 20 },
                            { x: cx + 70, y: cy + 20 }
                        ],
                    },
                ];
                break;
            case 'rom_arc':
                newAnns = [{
                    id, type: 'rom_arc', layer: 'rom', color: '#06b6d4', sw: 3,
                    center: { x: cx, y: cy }, radius: 70, startDeg: -90, endDeg: 0,
                }];
                break;
            default:
                return;
        }

        const all = [...annotations, ...newAnns];
        setAnnotations(all);
        pushHistory(all);
        if (newAnns.length > 0) {
            setSelectedAnnotationId(newAnns[0].id);
            setActiveTool(TOOL_MODES.SELECT);
        }
    };

    // ----------------------------------------------------------
    // CROP APPLY
    // ----------------------------------------------------------
    const applyCrop = () => {
        if (!cropRect || !imgRef.current) return;
        // Normalize crop rect
        const r = {
            x: Math.min(cropRect.x, cropRect.x + cropRect.w),
            y: Math.min(cropRect.y, cropRect.y + cropRect.h),
            w: Math.abs(cropRect.w),
            h: Math.abs(cropRect.h),
        };
        if (r.w < 20 || r.h < 20) {
            setCropMode(false);
            setCropRect(null);
            return;
        }

        // Create new cropped image
        const tmpCanvas = document.createElement('canvas');
        const img = imgRef.current;
        const scaleX = img.naturalWidth / canvasSize.w;
        const scaleY = img.naturalHeight / canvasSize.h;

        tmpCanvas.width = r.w * scaleX;
        tmpCanvas.height = r.h * scaleY;
        const tCtx = tmpCanvas.getContext('2d');
        tCtx.drawImage(img, r.x * scaleX, r.y * scaleY, r.w * scaleX, r.h * scaleY, 0, 0, tmpCanvas.width, tmpCanvas.height);

        const newImg = new Image();
        newImg.onload = () => {
            imgRef.current = newImg;
            const container = containerRef.current;
            if (container) {
                const maxW = container.clientWidth - 4;
                const maxH = container.clientHeight - 4;
                const scale = Math.min(maxW / newImg.naturalWidth, maxH / newImg.naturalHeight, 1);
                setCanvasSize({
                    w: Math.round(newImg.naturalWidth * scale),
                    h: Math.round(newImg.naturalHeight * scale),
                });
            }
            // Reposition annotations relative to crop
            setAnnotations(prev => prev.map(a => {
                const shifted = { ...a };
                if (shifted.points) shifted.points = shifted.points.map(p => ({ x: p.x - r.x, y: p.y - r.y }));
                if (shifted.pos) shifted.pos = { x: shifted.pos.x - r.x, y: shifted.pos.y - r.y };
                if (shifted.center) shifted.center = { x: shifted.center.x - r.x, y: shifted.center.y - r.y };
                return shifted;
            }));
        };
        newImg.src = tmpCanvas.toDataURL('image/png');

        setCropMode(false);
        setCropRect(null);
    };

    // ----------------------------------------------------------
    // EXPORT & SAVE
    // ----------------------------------------------------------
    const exportCanvas = useCallback(() => {
        const img = imgRef.current;
        if (!img) return null;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = img.naturalWidth;
        exportCanvas.height = img.naturalHeight;
        const ctx = exportCanvas.getContext('2d');
        const scaleX = img.naturalWidth / canvasSize.w;
        const scaleY = img.naturalHeight / canvasSize.h;

        // Draw image with transforms
        ctx.save();
        ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-exportCanvas.width / 2, -exportCanvas.height / 2);
        ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
        ctx.restore();

        // Scale up context for annotations
        ctx.save();
        ctx.scale(scaleX, scaleY);

        // Re-render annotations on export canvas (simplified - use same render logic)
        annotations.forEach(ann => {
            if (!layerVisibility[ann.layer]) return;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            switch (ann.type) {
                case 'angle': {
                    const { points, color, sw } = ann;
                    if (points.length < 3) break;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    ctx.moveTo(points[1].x, points[1].y);
                    ctx.lineTo(points[2].x, points[2].y);
                    ctx.stroke();

                    drawArc(ctx, points[1].x, points[1].y, points[0].x, points[0].y, points[2].x, points[2].y, color, sw);
                    const deg = calcAngleDeg(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
                    const midAngle = (Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x) + Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x)) / 2;
                    const bx = points[1].x + Math.cos(midAngle) * 55;
                    const by = points[1].y + Math.sin(midAngle) * 55;
                    drawDegreeBadge(ctx, bx, by, deg, color);

                    points.forEach((p, i) => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, i === 1 ? 7 : 5, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    });
                    break;
                }
                case 'line': {
                    const { points, color, sw, dashed } = ann;
                    if (points.length < 2) break;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    if (dashed) ctx.setLineDash([8, 5]);
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    if (ann.crossbars) {
                        const dx = points[1].x - points[0].x;
                        const dy = points[1].y - points[0].y;
                        const len = Math.sqrt(dx*dx + dy*dy) || 1;
                        const px = -dy / len * 8;
                        const py = dx / len * 8;
                        [points[0], points[1]].forEach(p => {
                            ctx.beginPath();
                            ctx.moveTo(p.x + px, p.y + py);
                            ctx.lineTo(p.x - px, p.y - py);
                            ctx.stroke();
                        });
                    }
                    break;
                }
                case 'arrow': {
                    drawArrowAnnotation(ctx, ann, false, calibration);
                    break;
                }
                case 'curve': {
                    const { points, color, sw } = ann;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    smoothCurve(ctx, points);
                    break;
                }
                case 'text': {
                    const { pos, text, color, fontSize } = ann;
                    const fs = fontSize || 14;
                    ctx.font = `bold ${fs}px Inter, system-ui, sans-serif`;
                    const m = ctx.measureText(text);
                    ctx.beginPath();
                    ctx.roundRect(pos.x - 8, pos.y - fs - 4, m.width + 16, fs + 12, 4);
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.fillStyle = color;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(text, pos.x, pos.y);
                    break;
                }
                case 'distance': {
                    const { points, color, sw } = ann;
                    if (points.length < 2) break;
                    const d = dist(points[0].x, points[0].y, points[1].x, points[1].y);
                    let label = `${d.toFixed(1)} px`;
                    if (calibration) {
                        const realDist = (d / calibration.pixelDist) * calibration.realDist;
                        label = `${realDist.toFixed(1)} ${calibration.unit}`;
                    }
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    ctx.setLineDash([4, 3]);
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    [0, 1].forEach(i => {
                        ctx.beginPath();
                        ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    });
                    const mx = (points[0].x + points[1].x) / 2;
                    const my = (points[0].y + points[1].y) / 2 - 12;
                    ctx.save();
                    ctx.font = `bold 12px Inter, system-ui, sans-serif`;
                    const tm = ctx.measureText(label);
                    const lbw = tm.width + 16;
                    ctx.beginPath();
                    ctx.roundRect(mx - lbw/2, my - 11, lbw, 22, 4);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.85;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = luminance(color) > 0.5 ? '#1e293b' : '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, mx, my + 1);
                    ctx.restore();
                    break;
                }
                case 'heatmap': {
                    const { center, rx, ry, zoneColor, zoneBorder } = ann;
                    ctx.beginPath();
                    ctx.ellipse(center.x, center.y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
                    ctx.fillStyle = zoneColor;
                    ctx.fill();
                    ctx.strokeStyle = zoneBorder;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    break;
                }
                case 'rom_arc': {
                    const { center, radius, startDeg, endDeg, color, sw } = ann;
                    const startRad = (startDeg * Math.PI) / 180;
                    const endRad = (endDeg * Math.PI) / 180;
                    let sweepDeg = (endDeg - startDeg + 360) % 360;
                    if (sweepDeg === 0) sweepDeg = 360;

                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, radius, startRad, endRad);
                    ctx.closePath();
                    ctx.fillStyle = color.replace(')', ',0.18)').replace('rgb(', 'rgba(');
                    if (color.startsWith('#')) {
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
                    }
                    ctx.fill();

                    // Arc line
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, radius, startRad, endRad);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = sw;
                    ctx.stroke();

                    // Radii lines
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x + radius * Math.cos(startRad), center.y + radius * Math.sin(startRad));
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x + radius * Math.cos(endRad), center.y + radius * Math.sin(endRad));
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Center dot
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();

                    // ROM angle badge
                    const midRad = startRad + (sweepDeg * Math.PI / 180) / 2;
                    const bx = center.x + (radius + 22) * Math.cos(midRad);
                    const by = center.y + (radius + 22) * Math.sin(midRad);
                    drawDegreeBadge(ctx, bx, by, sweepDeg, color);
                    break;
                }
                case 'landmark': {
                    const { pos, lm } = ann;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = lm.color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                    const text = lm.label.split('(')[0].trim();
                    const tw = ctx.measureText(text).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.beginPath();
                    ctx.roundRect(pos.x + 14, pos.y - 8, tw + 8, 16, 3);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, pos.x + 18, pos.y);
                    break;
                }
            }
        });
        ctx.restore();
        return exportCanvas;
    }, [annotations, canvasSize, layerVisibility, rotation, flipH, flipV, calibration]);

    const handleDownloadPng = () => {
        const canvas = exportCanvas();
        if (!canvas) return;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `posture-analysis-${athleteName || 'athlete'}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    const handleSave = (asNew = false) => {
        const canvas = exportCanvas();
        if (!canvas) return;
        setSaving(true);

        canvas.toBlob((blob) => {
            const file = new File([blob], `posture-annotated-${Date.now()}.png`, { type: 'image/png' });
            const formData = new FormData();
            formData.append('image', file);
            formData.append('notes', '');
            formData.append('annotations', JSON.stringify(annotations));
            formData.append('meta', JSON.stringify({ calibration }));

            const baseImgPath = originalImageSrc || imageSrc;
            if (baseImgPath) {
                formData.append('original_image_path', baseImgPath);
            }

            if (asNew && athleteId) {
                router.post(route('athletes.gallery.store', athleteId), formData, {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => { setSaving(false); onSaved(); onClose(); },
                    onError: () => { setSaving(false); },
                });
            } else if (galleryId) {
                router.post(route('athletes.gallery.update', galleryId), formData, {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => { setSaving(false); onSaved(); onClose(); },
                    onError: () => { setSaving(false); },
                });
            } else {
                setSaving(false);
            }
        }, 'image/png');
    };

    // ----------------------------------------------------------
    // TOOL CONFIGS & TABS
    // ----------------------------------------------------------
    const [sidebarTab, setSidebarTab] = useState('tools'); // 'tools' | 'canvas' | 'layers'

    const tools = [
        { id: TOOL_MODES.SELECT,   icon: MousePointer2, label: 'Pilih & Geser Anotasi', shortLabel: 'Pilih / Geser', desc: 'Pilih, geser, atau edit handle anotasi' },
        { id: TOOL_MODES.ANGLE,    icon: Target,         label: 'Goniometer Sudut 3 Titik', shortLabel: 'Sudut Sendi', desc: 'Klik 3 titik (Femur → Sendi → Tibia)' },
        { id: TOOL_MODES.ROM_ARC,  icon: Activity,       label: 'ROM Arc Busur Gerak', shortLabel: 'ROM Arc', desc: 'Klik 3 titik (Pusat → Awal → Akhir)' },
        { id: TOOL_MODES.ARROW,    icon: ArrowRight,     label: 'Panah Kompensasi / Vektor', shortLabel: 'Panah Vektor', desc: 'Tarik mouse (drag) ke arah tujuan' },
        { id: TOOL_MODES.LINE,     icon: Minus,          label: 'Plumb Line / Garis Aksis', shortLabel: 'Plumb Line', desc: 'Tarik garis lurus vertikal/horizontal' },
        { id: TOOL_MODES.CURVE,    icon: Pencil,         label: 'Kurva Spine / Tulang Belakang', shortLabel: 'Kurva Spine', desc: 'Klik titik-titik, double-click selesai' },
        { id: TOOL_MODES.DISTANCE, icon: Ruler,          label: 'Penggaris Ukur Jarak', shortLabel: 'Ukur Jarak', desc: 'Tarik 2 titik untuk ukur jarak px/cm' },
        { id: TOOL_MODES.LANDMARK, icon: Target,         label: 'Marker Titik Anatomi', shortLabel: 'Marker Titik', desc: 'Klik untuk letakkan marker anatomi' },
        { id: TOOL_MODES.HEATMAP,  icon: Circle,         label: 'Zona Risiko & Tightness', shortLabel: 'Zona Heatmap', desc: 'Klik & seret untuk buat zona elips' },
        { id: TOOL_MODES.TEXT,     icon: Type,           label: 'Label Catatan Klinis', shortLabel: 'Catatan Teks', desc: 'Klik di foto untuk tambah teks label' },
    ];

    if (!isOpen) return null;

    // ----------------------------------------------------------
    // RENDER
    // ----------------------------------------------------------
    const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-950 text-zinc-100 font-sans select-none antialiased">
            {/* ============ TOP STUDIO HEADER BAR ============ */}
            <header className="h-14 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 flex items-center justify-between px-4 shrink-0 z-20">
                {/* Left: Studio Branding & Athlete Info */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-xs">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xs font-bold text-zinc-100 leading-none tracking-tight">Biomechanics & Posture Studio</h1>
                            <span className="text-[9px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md leading-none">
                                DPA Pro
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-none mt-1">
                            {athleteName ? `Atlet: ${athleteName}` : 'Analisis Postur & Sudut Klinis'}
                        </p>
                    </div>
                </div>

                {/* Center: Floating Viewport & History Pill */}
                <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-lg shadow-inner">
                    {/* Undo / Redo */}
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        title="Undo (Ctrl+Z)"
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        title="Redo (Ctrl+Y)"
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Redo2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-3.5 bg-zinc-800 mx-1" />

                    {/* Zoom controls */}
                    <button
                        onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
                        title="Zoom Out (-)"
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                        title="Klik untuk Reset Zoom 100%"
                        className="text-[10px] font-semibold text-zinc-300 hover:text-orange-400 px-2 py-0.5 rounded-md hover:bg-zinc-800 tabular-nums transition-colors cursor-pointer"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.min(5, z + 0.15))}
                        title="Zoom In (+)"
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                        title="Fit ke Layar"
                        className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    >
                        Fit
                    </button>
                </div>

                {/* Right: Actions (Download, Save, Close) */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPng}
                        title="Unduh Hasil Gambar (PNG)"
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:border-zinc-700"
                    >
                        <Download className="w-3.5 h-3.5 text-zinc-400" />
                        <span>PNG</span>
                    </button>

                    {galleryId && (
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            title="Simpan Perubahan pada Foto Ini"
                            className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-orange-950/50"
                        >
                            {saving ? (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Perbarui Anotasi</span>
                        </button>
                    )}

                    {athleteId && (
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            title="Simpan Sebagai Foto Dokumentasi Baru"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-950/50"
                        >
                            {saving ? (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <ImagePlus className="w-3.5 h-3.5" />
                            )}
                            <span>Simpan Baru</span>
                        </button>
                    )}

                    <div className="w-px h-5 bg-zinc-800 mx-0.5" />

                    <button
                        onClick={onClose}
                        title="Tutup Studio Editor"
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ============ MAIN BODY ============ */}
            <div className="flex flex-1 min-h-0 relative">
                {/* ============ LEFT TOOLBOX DOCK ============ */}
                <aside className="w-72 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 flex flex-col shrink-0 z-10">
                    {/* Top Segmented Tabs */}
                    <div className="p-2 border-b border-zinc-800/80 bg-zinc-950/50">
                        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800/80 text-[10px] font-semibold">
                            <button
                                onClick={() => setSidebarTab('tools')}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
                                    sidebarTab === 'tools'
                                        ? 'bg-zinc-800 text-orange-400 font-bold shadow-xs'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <Pencil className="w-3 h-3" />
                                <span>Alat</span>
                            </button>
                            <button
                                onClick={() => setSidebarTab('canvas')}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
                                    sidebarTab === 'canvas'
                                        ? 'bg-zinc-800 text-orange-400 font-bold shadow-xs'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <SunMedium className="w-3 h-3" />
                                <span>Kanvas</span>
                            </button>
                            <button
                                onClick={() => setSidebarTab('layers')}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all cursor-pointer ${
                                    sidebarTab === 'layers'
                                        ? 'bg-zinc-800 text-orange-400 font-bold shadow-xs'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <Layers className="w-3 h-3" />
                                <span>Layer ({annotations.length})</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

                        {/* ================= TAB 1: TOOLS & INSTRUMENTS ================= */}
                        {sidebarTab === 'tools' && (
                            <>
                                {/* Selection Tool Card */}
                                <div>
                                    <button
                                        onClick={() => { setActiveTool(TOOL_MODES.SELECT); setTempPoints([]); }}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                            activeTool === TOOL_MODES.SELECT
                                                ? 'bg-orange-500/15 border-orange-500/60 text-orange-400 shadow-xs'
                                                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-md ${activeTool === TOOL_MODES.SELECT ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <MousePointer2 className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="text-left">
                                                <div>Mode Pilih & Geser</div>
                                                <div className="text-[9px] font-normal text-zinc-400">Pilih, gerakkan, atau edit handle</div>
                                            </div>
                                        </div>
                                        {activeTool === TOOL_MODES.SELECT && (
                                            <span className="text-[9px] font-bold text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">Aktif</span>
                                        )}
                                    </button>
                                </div>

                                {/* Biomechanical Drawing Tools Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Instrumen Gambar</span>
                                        <span className="text-[9px] text-zinc-400">9 Alat</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {tools.filter(t => t.id !== TOOL_MODES.SELECT).map(t => {
                                            const Icon = t.icon;
                                            const isActive = activeTool === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => { setActiveTool(t.id); setTempPoints([]); }}
                                                    title={t.desc}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                                        isActive
                                                            ? 'bg-orange-500/15 border-orange-500/60 text-orange-400 shadow-xs'
                                                            : 'bg-zinc-900/50 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    <div className={`p-1 rounded-md shrink-0 ${isActive ? 'bg-orange-500 text-white' : 'bg-zinc-800/80 text-zinc-400'}`}>
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[11px] font-semibold truncate leading-tight">{t.shortLabel}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Color & Stroke Styling */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
                                    {/* Colors */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Warna Klinis</span>
                                            {selectedAnnotation && <span className="text-[9px] text-orange-400 font-semibold">Terapkan ke item</span>}
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                            {COLORS.map(c => {
                                                const isSel = activeColor === c.hex;
                                                return (
                                                    <button
                                                        key={c.hex}
                                                        onClick={() => {
                                                            setActiveColor(c.hex);
                                                            if (selectedAnnotationId) {
                                                                const updated = annotations.map(a => a.id === selectedAnnotationId ? { ...a, color: c.hex } : a);
                                                                setAnnotations(updated);
                                                                pushHistory(updated);
                                                            }
                                                        }}
                                                        title={c.name}
                                                        className={`w-7 h-7 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                                                            isSel ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                                        }`}
                                                        style={{ backgroundColor: c.hex }}
                                                    >
                                                        {isSel && (
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: luminance(c.hex) > 0.5 ? '#000' : '#fff' }} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Stroke Width */}
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Ketebalan Garis</span>
                                        <div className="grid grid-cols-3 gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800">
                                            {STROKE_WIDTHS.map(s => {
                                                const isSel = strokeWidth === s.value;
                                                return (
                                                    <button
                                                        key={s.value}
                                                        onClick={() => {
                                                            setStrokeWidth(s.value);
                                                            if (selectedAnnotationId) {
                                                                const updated = annotations.map(a => a.id === selectedAnnotationId ? { ...a, sw: s.value } : a);
                                                                setAnnotations(updated);
                                                                pushHistory(updated);
                                                            }
                                                        }}
                                                        className={`py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                                            isSel
                                                                ? 'bg-orange-500 text-white shadow-xs'
                                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                                        }`}
                                                    >
                                                        {s.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Context Drawer (Arrow Styles, Landmarks, Heatmap, ROM) */}
                                {(activeTool === TOOL_MODES.ARROW || selectedAnnotation?.type === 'arrow') && (
                                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Gaya Panah ({ARROW_STYLES.length})</span>
                                            <span className="text-[9px] text-orange-400 font-semibold">Tarik Mouse</span>
                                        </div>
                                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                            {ARROW_STYLES.map(as => {
                                                const currentStyle = (selectedAnnotation?.type === 'arrow')
                                                    ? (selectedAnnotation.arrowStyle || 'single')
                                                    : arrowStyle;
                                                const isSel = currentStyle === as.id;
                                                return (
                                                    <button
                                                        key={as.id}
                                                        onClick={() => {
                                                            setArrowStyle(as.id);
                                                            if (selectedAnnotationId) {
                                                                const updated = annotations.map(a => {
                                                                    if (a.id !== selectedAnnotationId || a.type !== 'arrow') return a;
                                                                    let pts = a.points;
                                                                    if ((as.id.includes('curved') || as.id === 'curved') && pts.length === 2) {
                                                                        const mx = (pts[0].x + pts[1].x) / 2;
                                                                        const my = (pts[0].y + pts[1].y) / 2;
                                                                        const dx = pts[1].x - pts[0].x;
                                                                        const dy = pts[1].y - pts[0].y;
                                                                        const sign = as.id === 'curved_left' ? -1 : 1;
                                                                        pts = [pts[0], pts[1], { x: mx - dy * 0.35 * sign, y: my + dx * 0.35 * sign }];
                                                                    }
                                                                    return { ...a, arrowStyle: as.id, points: pts };
                                                                });
                                                                setAnnotations(updated);
                                                                pushHistory(updated);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer text-left ${
                                                            isSel
                                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-xs'
                                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                                                        }`}
                                                    >
                                                        <span className="text-sm font-bold w-4 text-center shrink-0">{as.icon}</span>
                                                        <div className="truncate flex-1">
                                                            <div className="truncate">{as.label}</div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTool === TOOL_MODES.LANDMARK && (
                                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Titik Landmark Anatomi</span>
                                        <div className="space-y-1">
                                            {LANDMARKS.map(lm => (
                                                <button
                                                    key={lm.id}
                                                    onClick={() => setSelectedLandmark(lm)}
                                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                                        selectedLandmark.id === lm.id
                                                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                                                    }`}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lm.color }} />
                                                    <span className="truncate">{lm.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTool === TOOL_MODES.HEATMAP && (
                                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tipe Zona Risiko</span>
                                        <div className="space-y-1">
                                            {HEATMAP_ZONES.map(z => (
                                                <button
                                                    key={z.id}
                                                    onClick={() => setSelectedHeatzone(z)}
                                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                                        selectedHeatzone.id === z.id
                                                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                                                    }`}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full border shrink-0" style={{ backgroundColor: z.border, borderColor: z.border }} />
                                                    <span className="truncate">{z.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Clinical Presets */}
                                <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Marker Cepat (Presets)</span>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                            onClick={() => applyPreset('knee_angle')}
                                            className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-[10px] font-medium border border-zinc-800 transition-all text-left truncate cursor-pointer"
                                        >
                                            🦵 Sudut Lutut
                                        </button>
                                        <button
                                            onClick={() => applyPreset('posture_plumb')}
                                            className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-[10px] font-medium border border-zinc-800 transition-all text-left truncate cursor-pointer"
                                        >
                                            📐 Plumb Line
                                        </button>
                                        <button
                                            onClick={() => applyPreset('spine_curve')}
                                            className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-[10px] font-medium border border-zinc-800 transition-all text-left truncate cursor-pointer"
                                        >
                                            🦴 Kurva Tulang
                                        </button>
                                        <button
                                            onClick={() => applyPreset('rom_arc')}
                                            className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-[10px] font-medium border border-zinc-800 transition-all text-left truncate cursor-pointer"
                                        >
                                            🔄 ROM Standard
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ================= TAB 2: CANVAS & OPTICS ================= */}
                        {sidebarTab === 'canvas' && (
                            <>
                                {/* Canvas Geometry & Transform */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2.5">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Transformasi & Panduan</span>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                            onClick={() => setShowGrid(!showGrid)}
                                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                                showGrid
                                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                                                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <Grid3X3 className="w-3.5 h-3.5" />
                                            <span>Grid 3×3</span>
                                        </button>
                                        <button
                                            onClick={() => setShowMirror(!showMirror)}
                                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                                showMirror
                                                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/50'
                                                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <FlipHorizontal className="w-3.5 h-3.5" />
                                            <span>Mirror Aksis</span>
                                        </button>
                                        <button
                                            onClick={() => setRotation(r => (r - 90) % 360)}
                                            title="Rotasi -90° Kiri"
                                            className="flex items-center gap-1.5 px-2.5 py-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Rotasi -90°</span>
                                        </button>
                                        <button
                                            onClick={() => setRotation(r => (r + 90) % 360)}
                                            title="Rotasi +90° Kanan"
                                            className="flex items-center gap-1.5 px-2.5 py-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                        >
                                            <RotateCw className="w-3.5 h-3.5" />
                                            <span>Rotasi +90°</span>
                                        </button>
                                        <button
                                            onClick={() => setFlipH(f => !f)}
                                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                                flipH
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <FlipHorizontal className="w-3.5 h-3.5" />
                                            <span>Flip Horizontal</span>
                                        </button>
                                        <button
                                            onClick={() => setFlipV(f => !f)}
                                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                                flipV
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <FlipVertical className="w-3.5 h-3.5" />
                                            <span>Flip Vertikal</span>
                                        </button>
                                    </div>

                                    {/* Crop */}
                                    <div className="pt-1">
                                        <button
                                            onClick={() => { setCropMode(!cropMode); setCropRect(null); }}
                                            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                                cropMode
                                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/60'
                                                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                                            }`}
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                            <span>{cropMode ? 'Batal Crop' : 'Potong Gambar (Crop)'}</span>
                                        </button>
                                        {cropMode && cropRect && (
                                            <button
                                                onClick={applyCrop}
                                                className="w-full mt-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-950/50"
                                            >
                                                <Crop className="w-3.5 h-3.5" />
                                                <span>Terapkan Hasil Crop</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Scale Calibration */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kalibrasi Penggaris</span>
                                        {calibration && (
                                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                                Terkalibrasi
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                                        Tentukan panjang acuan 2 titik (misal tiang tinggi 100 cm) untuk konversi piksel ke centimeter otomatis.
                                    </p>
                                    <button
                                        onClick={() => { setCalibrating(true); setCalibPoints([]); }}
                                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                            calibrating
                                                ? 'bg-orange-500 text-white border-orange-500 animate-pulse'
                                                : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                                        }`}
                                    >
                                        <Ruler className="w-3.5 h-3.5" />
                                        <span>{calibrating ? 'Klik 2 Titik Acuan...' : 'Kalibrasi Skala Jarak'}</span>
                                    </button>
                                    {calibration && (
                                        <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-[10px]">
                                            <span className="text-zinc-400">Rasio Skala:</span>
                                            <span className="font-bold text-emerald-400">{calibration.realDist} {calibration.unit} = {Math.round(calibration.pixelDist)} px</span>
                                        </div>
                                    )}
                                </div>

                                {/* Visual Image Filters */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <SunMedium className="w-3.5 h-3.5 text-zinc-400" /> Filter Gambar
                                        </span>
                                        <button
                                            onClick={() => setFilters({ brightness: 100, contrast: 100, grayscale: 0, sharpen: false })}
                                            className="text-[9px] text-orange-400 hover:underline font-semibold cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-1">
                                                <span>Brightness</span>
                                                <span className="text-zinc-200 font-mono">{filters.brightness}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="200"
                                                value={filters.brightness}
                                                onChange={(e) => setFilters(f => ({ ...f, brightness: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-orange-500 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-1">
                                                <span>Contrast</span>
                                                <span className="text-zinc-200 font-mono">{filters.contrast}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="200"
                                                value={filters.contrast}
                                                onChange={(e) => setFilters(f => ({ ...f, contrast: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-orange-500 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-1">
                                                <span>Grayscale</span>
                                                <span className="text-zinc-200 font-mono">{filters.grayscale}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={filters.grayscale}
                                                onChange={(e) => setFilters(f => ({ ...f, grayscale: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-orange-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ================= TAB 3: LAYERS & ANNOTATIONS LIST ================= */}
                        {sidebarTab === 'layers' && (
                            <>
                                {/* Layer Visibility Toggles */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Visibilitas Layer</span>
                                    <div className="space-y-1">
                                        {Object.entries(LAYER_NAMES).map(([key, name]) => {
                                            const count = annotations.filter(a => a.layer === key).length;
                                            const isVis = layerVisibility[key];
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setLayerVisibility(v => ({ ...v, [key]: !v[key] }))}
                                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                                        isVis ? 'text-zinc-200 hover:bg-zinc-800/70' : 'text-zinc-500 hover:bg-zinc-800/40 opacity-60'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        <span>{name}</span>
                                                    </span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${count > 0 ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-600'}`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active Annotations List */}
                                <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Daftar Objek ({annotations.length})</span>
                                        {annotations.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setAnnotations([]);
                                                    pushHistory([]);
                                                    setSelectedAnnotationId(null);
                                                }}
                                                className="text-[9px] text-rose-400 hover:underline font-semibold cursor-pointer"
                                            >
                                                Hapus Semua
                                            </button>
                                        )}
                                    </div>

                                    {annotations.length === 0 ? (
                                        <div className="py-6 text-center text-zinc-500 text-[11px]">
                                            Belum ada anotasi yang dibuat.
                                        </div>
                                    ) : (
                                        <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                            {annotations.map((ann, idx) => {
                                                const isSel = ann.id === selectedAnnotationId;
                                                return (
                                                    <div
                                                        key={ann.id}
                                                        onClick={() => setSelectedAnnotationId(ann.id)}
                                                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                                            isSel
                                                                ? 'bg-orange-500/15 border-orange-500/50 text-zinc-100 shadow-xs'
                                                                : 'bg-zinc-950/60 border-zinc-800/70 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ann.color || '#f97316' }} />
                                                            <span className="font-semibold truncate">
                                                                #{idx + 1} {LAYER_NAMES[ann.layer] || ann.type}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const updated = annotations.filter(a => a.id !== ann.id);
                                                                setAnnotations(updated);
                                                                pushHistory(updated);
                                                                if (selectedAnnotationId === ann.id) setSelectedAnnotationId(null);
                                                            }}
                                                            title="Hapus Anotasi Ini"
                                                            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom Selection Quick Bar / Delete Button */}
                    {selectedAnnotationId && (
                        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 mt-auto">
                            <div className="flex items-center justify-between mb-2 text-[10px]">
                                <span className="text-zinc-400 font-semibold">Objek Terpilih:</span>
                                <span className="text-orange-400 font-bold">
                                    {LAYER_NAMES[selectedAnnotation?.layer] || selectedAnnotation?.type}
                                </span>
                            </div>
                            <button
                                onClick={deleteSelected}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Anotasi (Delete)</span>
                            </button>
                        </div>
                    )}
                </aside>

                {/* ============ CENTER CANVAS STAGE ============ */}
                <main
                    ref={containerRef}
                    className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden relative select-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, #18181b 0%, #09090b 100%)',
                    }}
                    onMouseDown={(e) => {
                        if (e.target === containerRef.current) {
                            setSelectedAnnotationId(null);
                            setActiveTool(TOOL_MODES.SELECT);
                            setTempPoints([]);
                            if (textInputPos) {
                                if (textInput.trim()) submitText();
                                else { setTextInputPos(null); setTextInput(''); }
                            }
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setTempPoints([]);
                        setSelectedAnnotationId(null);
                        setActiveTool(TOOL_MODES.SELECT);
                    }}
                >
                    {/* Top Floating Instruction Pill */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <div className="px-4 py-1.5 bg-zinc-900/90 border border-zinc-700/70 rounded-full text-xs font-medium text-zinc-200 shadow-xl backdrop-blur-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span>
                                {activeTool === TOOL_MODES.SELECT && 'Klik anotasi untuk memilih & geser handle. Delete untuk hapus.'}
                                {activeTool === TOOL_MODES.ANGLE && `Klik 3 titik sudut: Femur → Sendi (Vertex) → Tibia. (${tempPoints.length}/3 titik)`}
                                {activeTool === TOOL_MODES.LINE && 'Tarik mouse (klik & drag) untuk menggambar garis plumb line.'}
                                {activeTool === TOOL_MODES.ARROW && 'Tarik mouse (klik & drag) ke arah tujuan panah kompensasi.'}
                                {activeTool === TOOL_MODES.CURVE && `Klik titik kelengkungan spine, Double-Click untuk selesai. (${tempPoints.length} titik)`}
                                {activeTool === TOOL_MODES.TEXT && 'Klik pada gambar untuk meletakkan teks label klinis.'}
                                {activeTool === TOOL_MODES.DISTANCE && 'Tarik mouse (klik & drag) untuk mengukur jarak 2 titik.'}
                                {activeTool === TOOL_MODES.HEATMAP && 'Klik & seret untuk menggambar zona elips risiko.'}
                                {activeTool === TOOL_MODES.ROM_ARC && `Klik 3 titik ROM: Pusat Rotasi → Titik Awal → Titik Akhir. (${tempPoints.length}/3)`}
                                {activeTool === TOOL_MODES.LANDMARK && 'Klik pada posisi tubuh untuk meletakkan marker anatomi.'}
                                {cropMode && 'Tarik area crop pada gambar, lalu klik "Terapkan Hasil Crop".'}
                                {calibrating && `Klik 2 titik pada benda acuan dengan panjang yang diketahui. (${calibPoints.length}/2)`}
                            </span>
                        </div>
                    </div>

                    {!imageLoaded ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-9 h-9 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                            <p className="text-xs text-zinc-400 font-semibold tracking-wide">Memuat gambar studio...</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                transformOrigin: 'center center',
                                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                onDoubleClick={handleCanvasDoubleClick}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setTempPoints([]);
                                    setSelectedAnnotationId(null);
                                    setActiveTool(TOOL_MODES.SELECT);
                                }}
                                onWheel={handleWheel}
                                className="shadow-2xl rounded-md border border-zinc-800/80"
                                style={{
                                    cursor: activeTool === TOOL_MODES.SELECT ? 'default'
                                        : cropMode ? 'crosshair'
                                        : calibrating ? 'crosshair'
                                        : 'crosshair',
                                }}
                            />
                        </div>
                    )}

                    {/* Text Input Popup Dialog */}
                    {textInputPos && (
                        <div
                            className="absolute z-30 animate-in fade-in zoom-in-95 duration-150"
                            style={{
                                left: textInputPos.x * zoom + pan.x + (containerRef.current?.getBoundingClientRect().left || 0) - (canvasRef.current?.getBoundingClientRect().left || 0) + (canvasRef.current?.getBoundingClientRect().left || 0) - (containerRef.current?.getBoundingClientRect().left || 0),
                                top: 70,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-2">
                                <input
                                    autoFocus
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') submitText(); }}
                                    placeholder="Ketik label (misal: Knee Valgus)..."
                                    className="bg-zinc-950 text-white text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:border-orange-500 outline-none w-60 font-medium"
                                />
                                <button
                                    onClick={submitText}
                                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                    OK
                                </button>
                                <button
                                    onClick={() => { setTextInputPos(null); setTextInput(''); }}
                                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Status HUD / Telemetry Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-7 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 flex items-center px-4 gap-4 text-[10px] font-medium text-zinc-400 z-10">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{canvasSize.w} × {canvasSize.h} px</span>
                        </div>
                        <span className="text-zinc-700">•</span>
                        <span>{annotations.length} Objek Anotasi</span>
                        {calibration && (
                            <>
                                <span className="text-zinc-700">•</span>
                                <span className="text-emerald-400 font-semibold">
                                    Kalibrasi: {calibration.realDist} {calibration.unit} ({Math.round(calibration.pixelDist)} px)
                                </span>
                            </>
                        )}
                        <span className="ml-auto text-zinc-500 font-mono text-[9px] hidden sm:inline">
                            Ctrl+Z Undo · Ctrl+Y Redo · Scroll Zoom · Alt/Space+Drag Pan · Delete Hapus
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}
