import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Standardized Excel Export for Single Date Range
 * Formats data with Date/Time as first column and entities as subsequent columns.
 */
export const exportSingleGraphToExcel = (dataList, filenamePrefix) => {
    if (!dataList || dataList.length === 0) return;

    // Find the master time array (last element in dataList usually holds it)
    const timeArr = dataList[dataList.length - 1]?.["Date_Time"] || [];

    // Create a mapping of Date_Time -> Row Object
    const rowMap = new Map();
    timeArr.forEach((timeStr, idx) => {
        let displayTime = String(timeStr);
        const m = moment(timeStr, moment.ISO_8601, true);
        if (m.isValid()) displayTime = m.format("DD-MMM-YYYY HH:mm");
        rowMap.set(idx, { "Date / Time": displayTime });
    });

    // Populate data for each entity
    for (let i = 0; i < dataList.length - 1; i++) {
        const entity = dataList[i];
        const stationName = entity.stationName || `Entity_${i+1}`;

        // The key could be "output", "voltageBus1", "actual", etc.
        // We look for array data that matches the length of timeArr roughly
        let valArray = entity.output || entity.actual || entity.voltageBus1 || entity.line || entity.frequency;
        
        // Handle nested array structures if present
        if (valArray) {
            valArray.forEach((val, idx) => {
                if (rowMap.has(idx)) {
                    rowMap.get(idx)[stationName] = val;
                }
            });
        }
    }

    const excelData = Array.from(rowMap.values());
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Auto-size columns
    const keys = Object.keys(excelData[0] || {});
    const colWidths = keys.map(k => ({ wch: Math.max(k.length + 5, 12) }));
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `${filenamePrefix}_Analytics.xlsx`);
};

/**
 * Standardized Excel Export for Multiple Dates/Months
 * Formats data with Time slots as rows and Dates as column headers per entity.
 */
export const exportMultiGraphToExcel = (dataList, filenamePrefix) => {
    if (!dataList || dataList.length === 0) return;

    const workbook = XLSX.utils.book_new();
    const sheetNamesSet = new Set();

    dataList.forEach((entity, index) => {
        if (!entity.stationName) return;
        
        let sheetName = String(entity.stationName).substring(0, 31);
        if (sheetNamesSet.has(sheetName)) sheetName = `${sheetName.substring(0, 27)}_${index}`;
        sheetNamesSet.add(sheetName);

        const timeSlots = entity["Duration"]?.[1] || Array.from({length: 96}, (_, i) => `Slot_${i+1}`);
        const rowMap = new Map();

        timeSlots.forEach((slot, idx) => {
            rowMap.set(idx, { "Time Slot": String(slot) });
        });

        // The key could be "output", "voltageBus1", "actual", etc.
        const valArray = entity.output || entity.actual || entity.voltageBus1 || entity.line || entity.frequency;
        
        if (valArray) {
            valArray.forEach((val, idx) => {
                const dateKey = moment(entity.Date_Time).format("DD-MMM-YYYY");
                if (rowMap.has(idx)) {
                    rowMap.get(idx)[dateKey] = val;
                }
            });
        }

        const excelData = Array.from(rowMap.values());
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        const keys = Object.keys(excelData[0] || {});
        const colWidths = keys.map(k => ({ wch: Math.max(k.length + 5, 12) }));
        worksheet["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `${filenamePrefix}_Multi_Analytics.xlsx`);
};
