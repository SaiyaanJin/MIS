import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import './InteractiveTopbar.css';

const InteractiveTopbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="viewport-header professional-card">
            <div className="header-left">
                <div className="search-container">
                    <i className="pi pi-search" style={{ color: 'var(--text-muted)' }}></i>
                    <InputText placeholder="Search Analytics..." className="global-search" />
                </div>
            </div>

            <div className="header-right">
                <div className="action-buttons">
                    <Button 
                        icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"} 
                        onClick={toggleTheme}
                        className="theme-toggle"
                        tooltip={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
                        tooltipOptions={{ position: 'bottom' }}
                    />
                    <div className="notifications-badge">
                        <i className="pi pi-bell"></i>
                        <span className="dot"></span>
                    </div>
                </div>
                <div className="divider"></div>
                <div className="system-status">
                    <span className="status-label">API Status:</span>
                    <span className="status-indicator online"></span>
                </div>
            </div>
        </header>
    );
};

export default InteractiveTopbar;
