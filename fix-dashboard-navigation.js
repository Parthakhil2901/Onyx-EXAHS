// Fix dashboard.js navigation for code-lab
const fs = require("fs");
const path = require("path");

const dashboardJsPath = path.join(__dirname, "js", "dashboard.js");

try {
  let content = fs.readFileSync(dashboardJsPath, "utf8");

  // Replace the code_editor.html reference with code_lab.html
  content = content.replace(
    /window\.location\.href = "\/pages\/code_editor\.html"/g,
    'window.location.href = "/pages/code_lab.html"'
  );

  fs.writeFileSync(dashboardJsPath, content, "utf8");

  console.log("✅ Fixed code-lab navigation in dashboard.js");
  console.log("Changed: /pages/code_editor.html → /pages/code_lab.html");
} catch (error) {
  console.error("❌ Error fixing dashboard.js navigation:", error.message);
}
