// ErSlice AI 說明類型定義
// AI 說明類型
export var AISpecType;
(function (AISpecType) {
    AISpecType["BASIC"] = "basic";
    AISpecType["INTERACTIVE"] = "interactive";
    AISpecType["RESPONSIVE"] = "responsive";
    AISpecType["FULL_GUIDE"] = "full-guide";
    AISpecType["COMPONENT_SPEC"] = "component-spec";
    AISpecType["ACCESSIBILITY"] = "accessibility";
    AISpecType["PERFORMANCE"] = "performance";
    AISpecType["TESTING"] = "testing"; // 測試說明
})(AISpecType || (AISpecType = {}));
// AI 說明複雜度
export var AISpecComplexity;
(function (AISpecComplexity) {
    AISpecComplexity["BEGINNER"] = "beginner";
    AISpecComplexity["INTERMEDIATE"] = "intermediate";
    AISpecComplexity["ADVANCED"] = "advanced"; // 高級
})(AISpecComplexity || (AISpecComplexity = {}));
// AI 說明格式
export var AISpecFormat;
(function (AISpecFormat) {
    AISpecFormat["MARKDOWN"] = "markdown";
    AISpecFormat["HTML"] = "html";
    AISpecFormat["JSON"] = "json";
    AISpecFormat["YAML"] = "yaml";
    AISpecFormat["CODE_SNIPPETS"] = "code-snippets"; // 代碼片段
})(AISpecFormat || (AISpecFormat = {}));
