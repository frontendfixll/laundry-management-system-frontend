'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Each stage represents a real readiness signal. The loader animates
// smoothly UP TO the threshold of the next-pending signal, then waits
// there until that signal flips to true. When all signals are true the
// loader fast-forwards to 100. This keeps the perceived smoothness of
// a progress bar while never lying about real progress: if a fetch is
// slow, the user sees the bar pause at a believable spot rather than
// race past 100% with no content to show.

export interface LoadingStage {
    threshold: number
    message: string
    subMessage: string
    ready: boolean
}

const DEFAULT_STAGE_META: Array<Omit<LoadingStage, 'ready'>> = [
    { threshold: 20, message: 'Authenticating', subMessage: 'Verifying your administrator session...' },
    { threshold: 50, message: 'Synchronizing', subMessage: 'Connecting to your tenancy...' },
    { threshold: 80, message: 'Loading Modules', subMessage: 'Preparing dashboards and analytics...' },
    { threshold: 95, message: 'Finishing Up', subMessage: 'Optimizing your experience...' },
]

interface SignalOptions {
    /** Real readiness signals, ordered from earliest to latest. */
    signals?: boolean[]
    /** Override stage messages/thresholds. Length should match signals. */
    stages?: Array<Omit<LoadingStage, 'ready'>>
}

/**
 * Backwards-compatible loader hook.
 *
 * Legacy form: `useLoadingProgress(isComplete: boolean)` — animates on a
 * timer until `isComplete` flips, then fast-forwards to 100.
 *
 * Signal-driven form: `useLoadingProgress({ signals: [...] })` — animates
 * up to the threshold of the next-unfilled signal, then pauses there.
 */
export function useLoadingProgress(arg: boolean | SignalOptions = false) {
    const isLegacyComplete = typeof arg === 'boolean' ? arg : false
    const options = typeof arg === 'object' ? arg : undefined

    const stageMeta = options?.stages ?? DEFAULT_STAGE_META
    const signals = options?.signals
    const isSignalDriven = Array.isArray(signals)

    // Compute the highest threshold the loader is allowed to reach right now.
    // - signal-driven: highest threshold whose signal is true; if all true → 100
    // - legacy: 100 if isComplete, else 98 (matches previous "stops at 98" behavior)
    const targetProgress = useMemo(() => {
        if (isSignalDriven) {
            const allReady = signals!.every(Boolean)
            if (allReady) return 100
            // Find the LAST consecutive ready signal — that's how far we can go.
            let reached = 0
            for (let i = 0; i < signals!.length; i++) {
                if (signals![i]) reached = stageMeta[i]?.threshold ?? reached
                else break
            }
            return reached
        }
        return isLegacyComplete ? 100 : 98
    }, [isSignalDriven, signals, isLegacyComplete, stageMeta])

    const [progress, setProgress] = useState(1)
    const targetRef = useRef(targetProgress)
    targetRef.current = targetProgress

    useEffect(() => {
        const tick = () => {
            setProgress(prev => {
                const target = targetRef.current
                if (prev >= target) return prev
                // Faster step when the gap is large or we're below 50, slower as we approach the target.
                const gap = target - prev
                const step = gap > 30 ? 3 : gap > 10 ? 1.5 : 0.6
                return Math.min(prev + step, target)
            })
        }
        const interval = setInterval(tick, 60)
        return () => clearInterval(interval)
    }, [])

    const stages: LoadingStage[] = useMemo(() => {
        return stageMeta.map((s, i) => ({
            ...s,
            ready: isSignalDriven ? !!signals?.[i] : progress >= s.threshold,
        }))
    }, [stageMeta, isSignalDriven, signals, progress])

    const currentStage =
        stages.find(s => progress <= s.threshold) ?? stages[stages.length - 1]

    return {
        progress,
        message: currentStage.message,
        subMessage: currentStage.subMessage,
        stages,
    }
}
