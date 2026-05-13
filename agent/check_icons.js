// Quick check if all lucide-react icons used in the project actually exist
const icons = [
  'Wifi','WifiOff','Monitor','Cpu','Keyboard','Mouse','Clock','Laptop',
  'MemoryStick','HardDrive','Camera','Activity','AppWindow','Usb','Globe',
  'TrendingUp','TrendingDown','LogIn','LogOut','Download','FileText',
  'Calendar','Settings','Lock','Mail','Eye','EyeOff','Menu','Bell','Search',
  'RefreshCw','Image','LayoutDashboard','ChevronLeft','ChevronRight',
  'AlertCircle','CheckCircle','Minus','FolderOpen','BarChart3','Smartphone',
];
try {
  const l = require('lucide-react');
  icons.forEach(i => console.log(i + ': ' + (l[i] ? 'OK' : 'MISSING')));
} catch(e) {
  console.log('Error:', e.message);
}
