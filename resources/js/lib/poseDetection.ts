import { Pose, Results, NormalizedLandmarkList } from '@mediapipe/pose';

let poseInstance: Pose | null = null;
const poseResultCache = new Map<string, NormalizedLandmarkList>();

export function getPoseDetector(): Pose {
    if (!poseInstance) {
        poseInstance = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
            modelComplexity: 2, // Highest accuracy (Heavy model) for static photo biomechanics
            smoothLandmarks: false, // Disabled for static photo to prevent inter-frame smoothing artifacts
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
    }
    return poseInstance;
}

export async function detectPoseFromImage(imageElement: HTMLImageElement): Promise<NormalizedLandmarkList | null> {
    const cacheKey = imageElement.src || `${imageElement.naturalWidth}x${imageElement.naturalHeight}_${imageElement.currentSrc}`;
    if (cacheKey && poseResultCache.has(cacheKey)) {
        return poseResultCache.get(cacheKey) || null;
    }

    const detector = getPoseDetector();
    
    // Clear previous video tracking memory so each scan evaluates static photo from scratch deterministically
    try {
        await detector.reset();
    } catch {
        // ignore if not supported in environment
    }

    return new Promise((resolve) => {
        let isResolved = false;

        const timeout = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                resolve(null);
            }
        }, 8000);

        detector.onResults((results: Results) => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeout);
                if (results.poseLandmarks) {
                    if (cacheKey) poseResultCache.set(cacheKey, results.poseLandmarks);
                    resolve(results.poseLandmarks);
                } else {
                    resolve(null);
                }
            }
        });

        detector.send({ image: imageElement }).catch(() => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeout);
                resolve(null);
            }
        });
    });
}

