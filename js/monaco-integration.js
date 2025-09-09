// Monaco Editor Integration for Code Lab
class MonacoCodeLab {
  constructor(containerId) {
    this.containerId = containerId;
    this.editor = null;
    this.currentLanguage = "python";
    this.problems = this.getProblems();
    this.currentProblem = 1;
  }

  async initialize() {
    try {
      // Load Monaco Editor
      await this.loadMonaco();

      // Initialize editor
      this.createEditor();

      // Setup UI
      this.setupUI();

      // Load first problem
      this.loadProblem(this.currentProblem);
    } catch (error) {
      console.error("Failed to initialize Monaco Editor:", error);
      this.fallbackToTextarea();
    }
  }

  async loadMonaco() {
    // Check if Monaco is already loaded
    if (window.monaco) {
      return;
    }

    // Load Monaco Editor from CDN
    await this.loadScript(
      "https://unpkg.com/monaco-editor@0.52.0/min/vs/loader.min.js"
    );

    return new Promise((resolve, reject) => {
      require.config({
        paths: { vs: "https://unpkg.com/monaco-editor@0.52.0/min/vs" },
      });
      require(["vs/editor/editor.main"], () => {
        resolve();
      });
    });
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  createEditor() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container ${this.containerId} not found`);
    }

    // Clear container
    container.innerHTML = "";

    // Create editor container
    const editorContainer = document.createElement("div");
    editorContainer.id = "monaco-editor-container";
    editorContainer.style.width = "100%";
    editorContainer.style.height = "400px";
    editorContainer.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    editorContainer.style.borderRadius = "8px";
    container.appendChild(editorContainer);

    // Initialize Monaco Editor
    this.editor = monaco.editor.create(editorContainer, {
      value: "",
      language: this.currentLanguage,
      theme: "vs-dark",
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on",
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
      folding: true,
      lineNumbers: "on",
      renderWhitespace: "selection",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    // Setup editor event listeners
    this.setupEditorEvents();
  }

  setupEditorEvents() {
    // Language change
    const languageSelect = document.getElementById("code-language-select");
    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        this.currentLanguage = e.target.value;
        monaco.editor.setModelLanguage(
          this.editor.getModel(),
          this.currentLanguage
        );
      });
    }

    // Problem change
    const problemSelect = document.getElementById("code-problem-select");
    if (problemSelect) {
      problemSelect.addEventListener("change", (e) => {
        this.currentProblem = parseInt(e.target.value);
        this.loadProblem(this.currentProblem);
      });
    }
  }

  setupUI() {
    const container = document.getElementById(this.containerId);

    // Create controls
    const controls = document.createElement("div");
    controls.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            align-items: center;
            flex-wrap: wrap;
        `;

    // Problem selector
    const problemSelect = document.createElement("select");
    problemSelect.id = "code-problem-select";
    problemSelect.style.cssText = `
            background: var(--card-dark, #151628);
            color: var(--text-dark, #ffffff);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
        `;

    Object.keys(this.problems).forEach((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `🔹 ${id}. ${this.problems[id].title}`;
      problemSelect.appendChild(option);
    });

    // Language selector
    const languageSelect = document.createElement("select");
    languageSelect.id = "code-language-select";
    languageSelect.style.cssText = `
            background: var(--card-dark, #151628);
            color: var(--text-dark, #ffffff);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
        `;

    const languages = [
      { value: "python", label: "Python" },
      { value: "javascript", label: "JavaScript" },
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "csharp", label: "C#" },
    ];

    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.value;
      option.textContent = lang.label;
      languageSelect.appendChild(option);
    });

    // Action buttons
    const actions = document.createElement("div");
    actions.style.cssText = `
            display: flex;
            gap: 0.5rem;
        `;

    const runBtn = document.createElement("button");
    runBtn.textContent = "Run Code";
    runBtn.style.cssText = `
            background: linear-gradient(45deg, #00ffd5, #6c2bd9);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
    runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
    runBtn.onclick = () => this.runCode();

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.style.cssText = `
            background: linear-gradient(45deg, #38FF88, #00ffd5);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit';
    submitBtn.onclick = () => this.submitSolution();

    actions.appendChild(runBtn);
    actions.appendChild(submitBtn);

    controls.appendChild(problemSelect);
    controls.appendChild(languageSelect);
    controls.appendChild(actions);

    // Insert controls before the editor container
    container.insertBefore(controls, container.firstChild);

    // Create output panel
    const outputPanel = document.createElement("div");
    outputPanel.id = "code-output-panel";
    outputPanel.style.cssText = `
            margin-top: 1rem;
            background: var(--card-dark, #151628);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1rem;
            max-height: 200px;
            overflow-y: auto;
        `;

    const outputHeader = document.createElement("div");
    outputHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;

    const outputTitle = document.createElement("h3");
    outputTitle.textContent = "Output";
    outputTitle.style.cssText = `
            margin: 0;
            color: #00ffd5;
            font-size: 0.9rem;
        `;

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.style.cssText = `
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
        `;
    clearBtn.onclick = () => this.clearOutput();

    outputHeader.appendChild(outputTitle);
    outputHeader.appendChild(clearBtn);

    const outputContent = document.createElement("div");
    outputContent.id = "code-output-content";
    outputContent.style.cssText = `
            font-family: 'Consolas', monospace;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
        `;

    outputPanel.appendChild(outputHeader);
    outputPanel.appendChild(outputContent);
    container.appendChild(outputPanel);
  }

  loadProblem(problemId) {
    const problem = this.problems[problemId];
    if (!problem) return;

    let starterCode = "";

    switch (this.currentLanguage) {
      case "python":
        starterCode =
          problem.starterCode.python ||
          `# ${problem.title}\n# ${problem.description}\n\n# Write your solution here\n\n`;
        break;
      case "javascript":
        starterCode =
          problem.starterCode.javascript ||
          `// ${problem.title}\n// ${problem.description}\n\n// Write your solution here\n\n`;
        break;
      case "java":
        starterCode =
          problem.starterCode.java ||
          `// ${problem.title}\n// ${problem.description}\n\npublic class Solution {\n    // Write your solution here\n}\n`;
        break;
      case "cpp":
        starterCode =
          problem.starterCode.cpp ||
          `// ${problem.title}\n// ${problem.description}\n\n#include <iostream>\n\n// Write your solution here\n\n`;
        break;
      case "csharp":
        starterCode =
          problem.starterCode.csharp ||
          `// ${problem.title}\n// ${problem.description}\n\nusing System;\n\n// Write your solution here\n\n`;
        break;
    }

    if (this.editor) {
      this.editor.setValue(starterCode);
      monaco.editor.setModelLanguage(
        this.editor.getModel(),
        this.currentLanguage
      );
    }
  }

  async runCode() {
    if (!this.editor) return;

    const code = this.editor.getValue();
    const output = document.getElementById("code-output-content");

    output.textContent = "Running code...\n";

    try {
      // Simulate code execution (in a real implementation, this would call a backend)
      const result = await this.simulateExecution(code, this.currentLanguage);
      output.textContent = `Output:\n${result}`;
    } catch (error) {
      output.textContent = `Error: ${error.message}`;
    }
  }

  async submitSolution() {
    if (!this.editor) return;

    const code = this.editor.getValue();
    const output = document.getElementById("code-output-content");

    output.textContent = "Submitting solution...\n";

    try {
      const result = await this.verifySolution(
        code,
        this.currentProblem,
        this.currentLanguage
      );
      if (result.passed) {
        output.innerHTML = `<div style="color: #38FF88; font-weight: bold;">✅ All test cases passed! 🎉</div>`;
        this.showSuccessAnimation();
      } else {
        output.innerHTML = `<div style="color: #FF3860; font-weight: bold;">❌ Some test cases failed</div>\n${result.details}`;
      }
    } catch (error) {
      output.textContent = `Error: ${error.message}`;
    }
  }

  async simulateExecution(code, language) {
    // This is a simplified simulation - in production, you'd send to a backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `Code executed successfully in ${language}\nSample output: Hello, World!`
        );
      }, 1000);
    });
  }

  async verifySolution(code, problemId, language) {
    // This is a simplified verification - in production, you'd send to a backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          passed: Math.random() > 0.5, // Random for demo
          details:
            "Test case 1: Passed\nTest case 2: Passed\nTest case 3: Failed - Expected [1,2,3], got [1,3,2]",
        });
      }, 1500);
    });
  }

  clearOutput() {
    const output = document.getElementById("code-output-content");
    if (output) {
      output.textContent = "";
    }
  }

  showSuccessAnimation() {
    // Create confetti effect
    const colors = ["#00ffd5", "#6c2bd9", "#38FF88"];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${
                  colors[Math.floor(Math.random() * colors.length)]
                };
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 1000;
                animation: fall 3s linear forwards;
            `;

      document.body.appendChild(confetti);

      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }

    // Add CSS animation if not exists
    if (!document.getElementById("confetti-animation")) {
      const style = document.createElement("style");
      style.id = "confetti-animation";
      style.textContent = `
                @keyframes fall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `;
      document.head.appendChild(style);
    }
  }

  fallbackToTextarea() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
            <div style="padding: 1rem; background: var(--card-dark, #151628); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;">
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem;">
                    Monaco Editor failed to load. Using fallback editor.
                </p>
                <textarea id="fallback-editor" style="
                    width: 100%;
                    height: 300px;
                    background: var(--bg-dark, #0a0b1a);
                    color: var(--text-dark, #ffffff);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    padding: 1rem;
                    font-family: 'Consolas', monospace;
                    font-size: 14px;
                    resize: vertical;
                " placeholder="Write your code here..."></textarea>
            </div>
        `;
  }

  getProblems() {
    return {
      1: {
        title: "Smart Contact Autocomplete using Trie Logic",
        description:
          "Implement a function that takes a list of contacts and a search query, and returns all contacts that start with the query.",
        starterCode: {
          python: `def autocomplete(contacts, query):
    """
    Implement contact autocomplete using Trie logic
    
    Args:
        contacts: List of contact names
        query: Search query string
    
    Returns:
        List of contacts that start with the query
    """
    # Write your solution here
    pass

# Example usage:
# contacts = ["priya", "prithika", "preethi", "prakash"]
# query = "pri"
# result = autocomplete(contacts, query)
# print(result)  # Should return ["priya", "prithika"]`,
          javascript: `function autocomplete(contacts, query) {
    /**
     * Implement contact autocomplete using Trie logic
     * 
     * @param {string[]} contacts - List of contact names
     * @param {string} query - Search query string
     * @returns {string[]} - List of contacts that start with the query
     */
    // Write your solution here
}

// Example usage:
// const contacts = ["priya", "prithika", "preethi", "prakash"];
// const query = "pri";
// const result = autocomplete(contacts, query);
// console.log(result); // Should return ["priya", "prithika"]`,
          java: `import java.util.*;

public class Solution {
    public static List<String> autocomplete(List<String> contacts, String query) {
        // Implement contact autocomplete using Trie logic
        // Write your solution here
        return new ArrayList<>();
    }
    
    public static void main(String[] args) {
        List<String> contacts = Arrays.asList("priya", "prithika", "preethi", "prakash");
        String query = "pri";
        List<String> result = autocomplete(contacts, query);
        System.out.println(result); // Should return ["priya", "prithika"]
    }
}`,
          cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

vector<string> autocomplete(vector<string> contacts, string query) {
    // Implement contact autocomplete using Trie logic
    // Write your solution here
    return {};
}

int main() {
    vector<string> contacts = {"priya", "prithika", "preethi", "prakash"};
    string query = "pri";
    vector<string> result = autocomplete(contacts, query);
    
    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        cout << "\"" << result[i] << "\"";
        if (i < result.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    
    return 0;
}`,
          csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static List<string> Autocomplete(List<string> contacts, string query) {
        // Implement contact autocomplete using Trie logic
        // Write your solution here
        return new List<string>();
    }
    
    public static void Main(string[] args) {
        List<string> contacts = new List<string> { "priya", "prithika", "preethi", "prakash" };
        string query = "pri";
        List<string> result = Autocomplete(contacts, query);
        
        Console.WriteLine("[{0}]", string.Join(", ", result.Select(s => $"\"{s}\"")));
    }
}`,
        },
      },
      2: {
        title: "Unique Character Validator with HashSet",
        description:
          "Implement a function that checks if all characters in a string are unique.",
        starterCode: {
          python: `def has_unique_chars(s):
    """
    Check if all characters in string are unique
    
    Args:
        s: Input string
    
    Returns:
        bool: True if all characters are unique, False otherwise
    """
    # Write your solution here
    pass

# Example usage:
# s = "abcdefg"
# result = has_unique_chars(s)
# print(result)  # Should return True`,
          javascript: `function hasUniqueChars(s) {
    /**
     * Check if all characters in string are unique
     * 
     * @param {string} s - Input string
     * @returns {boolean} - True if all characters are unique
     */
    // Write your solution here
}

// Example usage:
// const s = "abcdefg";
// const result = hasUniqueChars(s);
// console.log(result); // Should return true`,
          java: `import java.util.*;

public class Solution {
    public static boolean hasUniqueChars(String s) {
        // Check if all characters in string are unique
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        String s = "abcdefg";
        boolean result = hasUniqueChars(s);
        System.out.println(result); // Should return true
    }
}`,
          cpp: `#include <iostream>
#include <string>
#include <unordered_set>

using namespace std;

bool hasUniqueChars(string s) {
    // Check if all characters in string are unique
    // Write your solution here
    return false;
}

int main() {
    string s = "abcdefg";
    bool result = hasUniqueChars(s);
    cout << (result ? "true" : "false") << endl;
    return 0;
}`,
          csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static bool HasUniqueChars(string s) {
        // Check if all characters in string are unique
        // Write your solution here
        return false;
    }
    
    public static void Main(string[] args) {
        string s = "abcdefg";
        bool result = HasUniqueChars(s);
        Console.WriteLine(result.ToString().ToLower());
    }
}`,
        },
      },
      // Add more problems as needed
    };
  }
}

// Initialize Monaco Code Lab when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Make it globally available
  window.MonacoCodeLab = MonacoCodeLab;
});
