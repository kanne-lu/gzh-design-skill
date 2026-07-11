use serde::{Deserialize, Serialize};

const LATEST_RELEASE_URL: &str = "https://api.github.com/repos/kanne-lu/gzh-design-skill/releases/latest";
const UPDATE_CHECK_ERROR: &str = "暂时无法检查更新";

#[derive(Deserialize)]
struct GitHubRelease {
    tag_name: String,
    body: Option<String>,
    html_url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    tag_name: String,
    body: String,
    html_url: String,
}

#[tauri::command]
pub async fn latest_release() -> Result<Release, String> {
    let response = reqwest::Client::new()
        .get(LATEST_RELEASE_URL)
        .header(reqwest::header::USER_AGENT, "Wenlan")
        .send()
        .await
        .map_err(|_| UPDATE_CHECK_ERROR)?
        .error_for_status()
        .map_err(|_| UPDATE_CHECK_ERROR)?
        .json::<GitHubRelease>()
        .await
        .map_err(|_| UPDATE_CHECK_ERROR)?;

    Ok(Release {
        tag_name: response.tag_name,
        body: response.body.unwrap_or_default(),
        html_url: response.html_url,
    })
}
