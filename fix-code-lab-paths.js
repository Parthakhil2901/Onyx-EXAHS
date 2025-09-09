// Fix paths in code_lab.html for local file access
const fs = require("fs");
const path = require("path");

const codeLabPath = path.join(__dirname, "pages", "code_lab.html");

try {
  let content = fs.readFileSync(codeLabPath, "utf8");

  // Replace absolute paths with relative paths
  content = content.replace(
    /href="\/css\/styles\.css"/g,
    'href="../css/styles.css"'
  );

  content = content.replace(/src="\/js\//g, 'src="../js/');

  fs.writeFileSync(codeLabPath, content, "utf8");

  console.log("✅ Fixed paths in code_lab.html for local file access");
} catch (error) {
  console.error("❌ Error fixing code_lab.html paths:", error.message);
}
