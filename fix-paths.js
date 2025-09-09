// Fix script paths in dashboard.html for local file access
const fs = require("fs");
const path = require("path");

const dashboardPath = path.join(__dirname, "pages", "dashboard.html");

try {
  let content = fs.readFileSync(dashboardPath, "utf8");

  // Replace absolute paths with relative paths for local development
  content = content.replace(
    /src="\/js\/dashboard\.js"/g,
    'src="../js/dashboard.js"'
  );

  content = content.replace(
    /href="\/css\/styles\.css"/g,
    'href="../css/styles.css"'
  );

  // Fix asset paths
  content = content.replace(/src="\/assets\//g, 'src="../assets/');

  fs.writeFileSync(dashboardPath, content, "utf8");

  console.log("✅ Fixed paths in dashboard.html for local file access");
  console.log("Changed:");
  console.log("  /js/dashboard.js → ../js/dashboard.js");
  console.log("  /css/styles.css → ../css/styles.css");
  console.log("  /assets/ → ../assets/");
} catch (error) {
  console.error("❌ Error fixing paths:", error.message);
  console.log("Manual fix needed:");
  console.log("1. Open pages/dashboard.html");
  console.log('2. Change src="/js/dashboard.js" to src="../js/dashboard.js"');
  console.log('3. Change href="/css/styles.css" to href="../css/styles.css"');
  console.log("4. Change /assets/ paths to ../assets/");
}
