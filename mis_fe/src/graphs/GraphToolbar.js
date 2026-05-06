import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import "./GraphToolbar.css";

/**
 * GraphToolbar — shared chart toolbar for every MIS graph page.
 *
 * Props:
 *   chartRef      — React ref to the PrimeReact <Chart> component
 *   wrapperRef    — React ref to the outer wrapper div (fullscreened)
 *   title         — optional section title shown left of toolbar
 *   accentColor   — optional colour for the title dot
 */
export default function GraphToolbar({ chartRef, wrapperRef, title, accentColor = "#3b82f6" }) {
    const { isDarkMode } = useTheme();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [resetFlash, setResetFlash]     = useState(false);

    /* ── Reset zoom ────────────────────────────────────────────────────── */
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

    /* ── Theme injection ────────────────────────────────────────────────
     *  Browser fullscreen creates a new stacking context with a black
     *  backdrop. We defeat this by stamping the correct bg colour directly
     *  on the element as an inline style AND as a data-attribute CSS hook.
     * ─────────────────────────────────────────────────────────────────── */
    const applyFullscreenStyles = useCallback((el, entering) => {
        if (!el) return;
        if (entering) {
            // Light: #f1f5f9  |  Dark: #0f172a  — from index.css tokens
            const bg = isDarkMode ? "#0f172a" : "#f1f5f9";
            el.style.backgroundColor = bg;
            el.style.setProperty("--fs-bg", bg);
            el.setAttribute("data-fullscreen", "true");

            // The chart body has an inline height — override it via a style tag
            const body = el.querySelector(".pc-chart-body");
            if (body) {
                if (body.style.height) body.dataset.origHeight = body.style.height;
                body.style.height = "";        // remove inline height
                body.style.flex   = "1 1 0";
                body.style.minHeight = "0";
            }

            // Make Chart.js canvas fill its container
            const canvas = el.querySelector("canvas");
            if (canvas) {
                if (canvas.style.width) canvas.dataset.origWidth = canvas.style.width;
                if (canvas.style.height) canvas.dataset.origHeight = canvas.style.height;
                canvas.style.width  = "100%";
                canvas.style.height = "100%";
                // Trigger chart resize after the DOM settles
                setTimeout(() => {
                    try {
                        const chart = chartRef?.current?.getChart?.() ?? chartRef?.current;
                        chart?.resize();
                    } catch (_) {}
                }, 80);
            }
        } else {
            el.style.removeProperty("background-color");
            el.style.removeProperty("--fs-bg");
            el.removeAttribute("data-fullscreen");

            // Restore the chart body inline height
            const body = el.querySelector(".pc-chart-body");
            if (body) {
                if (body.dataset.origHeight) {
                    body.style.height = body.dataset.origHeight;
                } else {
                    body.style.removeProperty("height");
                }
                body.style.removeProperty("flex");
                body.style.removeProperty("min-height");
            }

            const canvas = el.querySelector("canvas");
            if (canvas) {
                if (canvas.dataset.origWidth) {
                    canvas.style.width = canvas.dataset.origWidth;
                } else {
                    canvas.style.removeProperty("width");
                }
                if (canvas.dataset.origHeight) {
                    canvas.style.height = canvas.dataset.origHeight;
                } else {
                    canvas.style.removeProperty("height");
                }
            }

            // Let chart resize back to normal
            setTimeout(() => {
                try {
                    const chart = chartRef?.current?.getChart?.() ?? chartRef?.current;
                    chart?.resize();
                } catch (_) {}
            }, 80);
        }
    }, [isDarkMode, chartRef]);

    /* ── Fullscreen toggle ──────────────────────────────────────────────── */
    const handleFullscreen = useCallback(() => {
        const el = wrapperRef?.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            applyFullscreenStyles(el, true);
            el.requestFullscreen?.()
                .then(() => setIsFullscreen(true))
                .catch(() => applyFullscreenStyles(el, false));
        } else {
            document.exitFullscreen?.()
                .then(() => { applyFullscreenStyles(el, false); setIsFullscreen(false); })
                .catch(() => {});
        }
    }, [wrapperRef, applyFullscreenStyles]);

    /* Keep state in sync when user presses Escape */
    useEffect(() => {
        const onFsChange = () => {
            const active = !!document.fullscreenElement;
            setIsFullscreen(active);
            if (!active && wrapperRef?.current) {
                applyFullscreenStyles(wrapperRef.current, false);
            }
        };
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, [wrapperRef, applyFullscreenStyles]);

    /* Re-apply colours if theme toggles while fullscreen is active */
    useEffect(() => {
        if (isFullscreen && wrapperRef?.current) {
            applyFullscreenStyles(wrapperRef.current, true);
        }
    }, [isDarkMode, isFullscreen, wrapperRef, applyFullscreenStyles]);

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

                {/* Reset Zoom */}
                <button
                    className={`gt-btn gt-btn-reset ${resetFlash ? "gt-flash" : ""}`}
                    onClick={handleReset}
                    title="Reset zoom & pan (or double-click chart)"
                >
                    <i className="pi pi-undo" />
                    <span>Reset Zoom</span>
                </button>

                {/* Fullscreen toggle */}
                <button
                    className={`gt-btn gt-btn-fs ${isFullscreen ? "gt-btn-fs-active" : ""}`}
                    onClick={handleFullscreen}
                    title={isFullscreen ? "Exit fullscreen (Esc)" : "Expand chart to fullscreen"}
                >
                    <i className={isFullscreen ? "pi pi-window-minimize" : "pi pi-window-maximize"} />
                </button>
            </div>
        </div>
    );
}
