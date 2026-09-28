import { Pose, Results, NormalizedLandmarkList } from '@mediapipe/pose';

let poseInstance: Pose | null = null;

export function getPoseDetector(): Pose {
    if (!poseInstance) {
        poseInstance = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
            modelComplexity: 1,
            smoothLandmarks: false,
            enableSegmentation: false,
            minDetectionConfidence: 0.4,
            minTrackingConfidence: 0.4,
        });
    }
    return poseInstance;
}

export async function detectPoseFromImage(imageElement: HTMLImageElement): Promise<NormalizedLandmarkList | null> {
    const detector = getPoseDetector();
    return new Promise((resolve) => {
        let isResolved = false;

        const timeout = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                resolve(null);
            }
        }, 6000);

        detector.onResults((results: Results) => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeout);
                resolve(results.poseLandmarks || null);
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
