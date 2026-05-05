import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import './UltimateSidebar.css';

const menuItems = [
    { label: 'Combined', icon: 'pi pi-th-large', path: '/', color: '#2563eb' },
    { label: 'Frequency', icon: 'pi pi-wave-pulse', path: '/Frequency', color: '#FF1493' },
    { label: 'Voltage', icon: 'pi pi-gauge', path: '/Voltage', color: '#000000' },
    { label: 'Demand', icon: 'pi pi-chart-line', path: '/Demand', color: '#ffa500' },
    { label: 'ICT', icon: 'pi pi-microchip', path: '/Ict', color: '#6a5acd' },
    { label: 'Lines', icon: 'pi pi-arrow-right-arrow-left', path: '/Lines', color: '#c83042' },
    { label: 'Gen', icon: 'pi pi-bolt', path: '/Generator', color: '#16a34a', subItems: [
        { label: 'All Generators', path: '/Generator' },
        { label: 'Thermal Generators', path: '/ThermalGenerator' }
    ]},
    { label: 'Outage', icon: 'pi pi-calendar-times', path: '/Outage', color: '#EF4444' },
    { label: 'ISGS', icon: 'pi pi-globe', path: '/ISGS', color: '#0000ff' },
    { label: 'Exchange', icon: 'pi pi-sync', path: '/Exchange', color: '#00d9ffff' },
    { label: 'Reports', icon: 'pi pi-file-pdf', path: '/WeeklyReports', color: '#ff0000', subItems: [
        { label: 'Weekly TR Exchange', path: '/WeeklyReports' },
        { label: 'Monthly TR Exchange', path: '/MonthlyReports' },
        { label: 'Monthly IR Exchange', path: '/MonthlyReports2' }
    ]},
    { label: 'Upload', icon: 'pi pi-upload', path: '/Upload', color: '#ff6347' }
];

const UltimateSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { isDarkMode } = useTheme();
    const location = useLocation();

    return (
        <div 
            className={`ultimate-sidebar professional-card ${isCollapsed ? 'collapsed' : 'expanded'}`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className="sidebar-header">
                <div className="brand-logo">
                    <img src="GI-Logo1.png" alt="Logo" className="logo-img" />
                    {!isCollapsed && <span className="brand-name">MIS App 2.0</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const isParentActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));

                    if (item.subItems) {
                        return (
                            <div key={item.path} className="nav-item-wrapper">
                                <Link 
                                    to={item.path} 
                                    className={`nav-item ${isParentActive ? 'active' : ''}`}
                                >
                                    <Tooltip target={`.nav-icon-${item.label}`} content={item.label} position="right" disabled={!isCollapsed} />
                                    <div className={`nav-icon nav-icon-${item.label}`} style={{ backgroundColor: item.color }}>
                                        <i className={item.icon}></i>
                                    </div>
                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                    {!isCollapsed && <i className="pi pi-angle-right" style={{ marginLeft: "auto", fontSize: "12px", opacity: 0.6 }}></i>}
                                    {isParentActive && <div className="active-indicator"></div>}
                                </Link>

                                <div className="sub-menu">
                                    <div style={{ padding: "4px 8px 8px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                                        {item.label} Options
                                    </div>
                                    {item.subItems.map(subItem => (
                                        <Link 
                                            key={subItem.path} 
                                            to={subItem.path} 
                                            className={`sub-nav-item ${location.pathname === subItem.path ? 'active-sub' : ''}`}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <Tooltip target={`.nav-icon-${item.label}`} content={item.label} position="right" disabled={!isCollapsed} />
                            <div className={`nav-icon nav-icon-${item.label}`} style={{ backgroundColor: item.color }}>
                                <i className={item.icon}></i>
                            </div>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                            {location.pathname === item.path && <div className="active-indicator"></div>}
                        </Link>
                    );
                })}
            </nav>

        </div>
    );
};

export default UltimateSidebar;
