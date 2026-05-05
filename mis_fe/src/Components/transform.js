const fs = require('fs');
const path = require('path');

const srcPath = 'd:\\test\\MIS\\mis_fe\\src\\Components\\generator.js';
const componentsDir = 'd:\\test\\MIS\\mis_fe\\src\\Components';
const code = fs.readFileSync(srcPath, 'utf-8');

let masterTemplate = code;

// 1. Make the Excel output key robust (some graph data uses actual/demand instead of output)
masterTemplate = masterTemplate.replace(
  /stationMap\[n\]\[0\]\["output"\]/g,
  '(stationMap[n][0]["output"] || stationMap[n][0]["actual"] || stationMap[n][0]["demand"] || stationMap[n][0]["voltageBus1"] || stationMap[n][0]["line"] || stationMap[n][0]["frequency"] || stationMap[n][0]["drawal"] || stationMap[n][0]["schedule"])'
);
masterTemplate = masterTemplate.replace(
  /e\["output"\]/g,
  '(e["output"] || e["actual"] || e["demand"] || e["voltageBus1"] || e["line"] || e["frequency"] || e["drawal"] || e["schedule"])'
);

// 2. Fix the URI encoding for stationName so Exchange works with '&' correctly
masterTemplate = masterTemplate.replace(
  /\$\{Selected_generator_states\}/g,
  "${(Selected_generator_states || []).map(s => String(s).replace(/&/g, \"%26\")).join(\",\")}"
);
masterTemplate = masterTemplate.replace(
  /\$\{multiple_Selected_generator_states\}/g,
  "${(multiple_Selected_generator_states || []).map(s => String(s).replace(/&/g, \"%26\")).join(\",\")}"
);

const targets = [
  { file: 'demand.js', Name: 'Demand', lower: 'demand', emoji: '📈', sub: 'Real-time and historical MW load tracking' },
  { file: 'Exchange.js', Name: 'Exchange', lower: 'exchange', emoji: '🔄', sub: 'Inter-regional exchange tracking' },
  { file: 'frequency.js', Name: 'Frequency', lower: 'frequency', emoji: '⏱', sub: 'Hz monitoring & stability tracking' },
  { file: 'ict.js', Name: 'Ict', lower: 'ict', emoji: '🔌', sub: 'ICT Analytics monitoring' },
  { file: 'isgs.js', Name: 'Isgs', lower: 'isgs', emoji: '🏭', sub: 'ISGS power monitoring' },
  { file: 'lines.js', Name: 'Lines', lower: 'lines', emoji: '⚡', sub: 'Transmission line analytics' },
  { file: 'mvar.js', Name: 'Mvar', lower: 'mvar', emoji: '⚡', sub: 'Reactive power (MVAR) analytics' },
  { file: 'thermalGenerator.js', Name: 'ThermalGenerator', lower: 'thermalGenerator', emoji: '🔥', sub: 'Thermal plant generation output' },
  { file: 'voltage.js', Name: 'Voltage', lower: 'voltage', emoji: '⚡', sub: 'Grid voltage monitoring' }
];

targets.forEach(t => {
  let res = masterTemplate;
  
  // Naming & Graph imports
  res = res.replace(/Generatorgraph/g, t.Name + 'graph'); 
  res = res.replace(/generatorgraph/g, t.file.replace('.js', 'graph'));
  
  // State and Data names
  res = res.replace(/Generator\b/g, t.Name); 
  res = res.replace(/generator_/g, t.lower + '_');

  // get...data functions
  res = res.replace(/getgeneratordata/g, 'get' + t.lower + 'data');
  res = res.replace(/getmultigeneratordata/g, 'getmulti' + t.lower + 'data');

  // URL Endpoints 
  // /GeneratorNames -> /DemandNames, GetMultiGeneratorData -> GetMultiDemandData
  res = res.replace(/GeneratorNames/g, t.Name + 'Names');
  res = res.replace(/GetGeneratorDataExcel/g, 'Get' + t.Name + 'DataExcel');
  res = res.replace(/GetGeneratorData/g, 'Get' + t.Name + 'Data');
  res = res.replace(/MultiGeneratorNames/g, 'Multi' + t.Name + 'Names');
  res = res.replace(/GetMultiGeneratorData/g, 'GetMulti' + t.Name + 'Data');
  res = res.replace(/GetFrequencyData/g, 'GetFrequencyData'); // No change needed but for completeness
  res = res.replace(/GetMultiFrequencyData/g, 'GetMultiFrequencyData');
  
  // Aesthetics
  res = res.replace(/⚡/g, t.emoji);
  res = res.replace(/Power output monitoring &amp; multi-timeline comparison/g, t.sub);
  
  // Checkbox overlays logic
  res = res.replace(/\["Generator"/g, '["' + t.Name + '"');
  
  fs.writeFileSync(path.join(componentsDir, t.file), res, 'utf-8');
  console.log('Written to ' + t.file);
});
