import React, { useState, useRef, useCallback } from "react";
import "./GraphToolbar.css";

/**
 * GraphToolbar — shared chart toolbar for every MIS graph page.
 *
 * Props:
 *   chartRef      — React ref pointing to the PrimeReact <Chart> component
 *   wrapperRef    — React ref pointing to the outer div to fullscreen
 *   title         — optional chart section title
 *   accentColor   — optional colour string for the title accent dot
 */
export default function GraphToolbar({ chartRef, wrapperRef, title, accentColor = "#3b82f6" }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [resetFlash, setResetFlash] = useState(false);

    /* ── Reset zoom ─────────────────────────────────────────────────── */
    const handleReset = useCallback(() => {
        try {
            const chart = chartRef?.current?.getChart?.() ?? chartRef?.current;
            if (chart?.resetZoom) {
                chart.resetZoom();
                setResetFlash(true);
                setTimeout(() => setResetFlash(false), 600);
            }
        } catch (_) {}
    }, [chartRef]);

    /* ── Fullscreen ──────────────────────────────────────────────────── */
    const handleFullscreen = useCallback(() => {
        const el = wrapperRef?.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
        }
    }, [wrapperRef]);

    /* Keep state in sync when user presses Escape */
    React.useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    return (
        <div className="gt-bar">
            {/* Title */}
            {title && (
                <div className="gt-title">
                    <span className="gt-title-dot" style={{ background: accentColor }} />
                    <span>{title}</span>
                </div>
            )}

            <div className="gt-actions">
                {/* Keyboard shortcut hints */}
                <div className="gt-hints">
                    <span className="gt-kbd">⊕ Scroll</span>
                    <span className="gt-sep">·</span>
                    <span className="gt-kbd">✥ Drag</span>
                    <span className="gt-sep">·</span>
                    <span className="gt-kbd">↺ Dbl-click</span>
                    <span className="gt-sep gt-sep-hide">to reset</span>
                </div>

                {/* Reset Zoom button */}
                <button
                    className={`gt-btn gt-btn-reset ${resetFlash ? "gt-flash" : ""}`}
                    onClick={handleReset}
                    title="Reset zoom & pan (or double-click chart)"
                >
                    <i className="pi pi-undo" />
                    <span>Reset Zoom</span>
                </button>

                {/* Fullscreen button */}
                <button
                    className={`gt-btn gt-btn-fs ${isFullscreen ? "gt-btn-fs-active" : ""}`}
                    onClick={handleFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Expand chart to fullscreen"}
                >
                    <i className={isFullscreen ? "pi pi-times" : "pi pi-window-maximize"} />
                </button>
            </div>
        </div>
    );
}
