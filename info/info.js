#!/usr/bin/env node
function showInfo() {
  console.log("Gada info bg, cuma gabut :v");
}

if (require.main === module) {
  // Dijalankan langsung dari Node / sebagai CLI
  showInfo();
} else {
  // Dipanggil dari modul lain
  module.exports = showInfo;
}