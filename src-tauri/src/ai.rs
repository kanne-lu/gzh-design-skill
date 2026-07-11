use serde::{Deserialize, Serialize};

const OPTIMIZE_ERROR: &str = "AI 优化暂时不可用，请检查 API Key 和网络连接。";

#[derive(Deserialize)]
pub struct OptimizeRequest {
    api_key: String,
    base_url: String,
    model: String,
    theme_context: String,
    markdown: String,
    goal: String,
}

#[derive(Deserialize)]
struct ResponsesResult {
    output_text: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OptimizeResult {
    markdown: String,
}

#[tauri::command]
pub async fn optimize_article(request: OptimizeRequest) -> Result<OptimizeResult, String> {
    if request.api_key.trim().is_empty() || request.base_url.trim().is_empty() || request.model.trim().is_empty() || request.markdown.trim().is_empty() {
        return Err("请先输入接口地址、模型名称、API Key 和文章内容。".into());
    }

    let prompt = format!(
        "你是中文公众号编辑。请按以下主题组件方案优化 Markdown：{}。优先使用这些已有组件对应的 Markdown 结构，不得生成 HTML 或发明组件。必须保留标题层级、列表、引用、代码块、图片链接和链接结构；只返回优化后的 Markdown，不要解释。\n\n优化目标：{}\n\n{}",
        request.theme_context,
        request.goal,
        request.markdown,
    );
    let response = reqwest::Client::new()
        .post(format!("{}/responses", request.base_url.trim_end_matches('/')))
        .bearer_auth(request.api_key)
        .json(&serde_json::json!({ "model": request.model, "input": prompt }))
        .send().await.map_err(|_| OPTIMIZE_ERROR)?
        .error_for_status().map_err(|_| OPTIMIZE_ERROR)?
        .json::<ResponsesResult>().await.map_err(|_| OPTIMIZE_ERROR)?;

    response.output_text.filter(|text| !text.trim().is_empty())
        .map(|markdown| OptimizeResult { markdown })
        .ok_or_else(|| "AI 没有返回可用的优化稿。".into())
}
