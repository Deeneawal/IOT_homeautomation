const socket = io();
let currentData = {};

// Universal data handler
socket.on('dataResponse', ({ type, data }) => {
  currentData[type] = data;
  
  if(window.location.pathname.includes('dashboard')) {
    updateDashboard(data);
  } else {
    updateRecordsTable(data);
  }
});

// Error handling
socket.on('error', ({ type, message }) => {
  console.error(`${type} error:`, message);
  showNotification(message, 'error');
});

// Request new data
function requestData(params) {
  socket.emit('requestData', params);
}

// Initial load
socket.on('init', (data) => {
  currentData = data;
  initializeVisualizations();
});

// Export functionality
function exportData(format) {
  const data = format === 'csv' 
    ? convertToCSV(currentData) 
    : JSON.stringify(currentData);
  
  const blob = new Blob([data], { type: `text/${format}` });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sensor-data-${Date.now()}.${format}`;
  a.click();
}