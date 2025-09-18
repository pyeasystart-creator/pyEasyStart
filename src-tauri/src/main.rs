use serde::Serialize;
use std::process::Command;
use tauri::AppHandle;

#[derive(Serialize)]
struct PyInfo {
    found: bool,
    which: String,
    version: String,
    sys_executable: String,
}

fn run_cmd_sync(program: &str, args: &[&str]) -> anyhow::Result<String> {
    let output = Command::new(program).args(args).output()?;
    let mut s = String::new();
    s.push_str(&String::from_utf8_lossy(&output.stdout));
    s.push_str(&String::from_utf8_lossy(&output.stderr));
    Ok(s)
}

#[tauri::command]
async fn detect_python(_app: AppHandle) -> Result<Vec<PyInfo>, String> {
    let candidates: [(&str, &[&str]); 3] = [
        ("py", &["-3", "-c", PY_SNIPPET]),
        ("python3", &["-c", PY_SNIPPET]),
        ("python", &["-c", PY_SNIPPET]),
    ];
    let mut results = vec![];
    for (prog, args) in candidates {
        if let Ok(out) = run_cmd_sync(prog, args) {
            let trimmed = out.trim();
            if !trimmed.is_empty() {
                let parts: Vec<&str> = trimmed.split('|').collect();
                if parts.len() == 3 {
                    results.push(PyInfo {
                        found: true,
                        which: prog.to_string(),
                        version: parts[0].to_string(),
                        sys_executable: parts[2].to_string(),
                    });
                }
            }
        }
    }
    if results.is_empty() {
        results.push(PyInfo {
            found: false,
            which: String::new(),
            version: String::new(),
            sys_executable: String::new(),
        });
    }
    Ok(results)
}

const PY_SNIPPET: &str = r#"
import sys, platform, shutil, os
exe = sys.executable or ''
name = os.path.basename(exe) if exe else 'python'
which = shutil.which(name) or shutil.which('python3') or shutil.which('python') or ''
print(f"{platform.python_version()}|{which}|{exe}")
"#;

#[tauri::command]
async fn create_venv(_app: AppHandle, base_cmd: String, env_path: String) -> Result<String, String> {
    let args: Vec<&str> = if base_cmd == "py" {
        vec!["-3", "-m", "venv", &env_path]
    } else {
        vec!["-m", "venv", &env_path]
    };
    run_cmd_sync(&base_cmd, &args).map_err(|e| e.to_string())
}

#[tauri::command]
async fn install_packages(_app: AppHandle, env_path: String, packages: Vec<String>) -> Result<String, String> {
    let py = if cfg!(target_os = "windows") {
        format!(r"{}\Scripts\python.exe", env_path)
    } else {
        format!("{}/bin/python", env_path)
    };
    let _ = run_cmd_sync(&py, &["-m", "pip", "install", "--upgrade", "pip"]);
    let mut args = vec!["-m", "pip", "install"];
    let joined: Vec<String> = packages.into_iter().collect();
    let owned: Vec<&str> = joined.iter().map(|s| s.as_str()).collect();
    args.extend_from_slice(&owned);
    run_cmd_sync(&py, &args).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![detect_python, create_venv, install_packages])
        .run(tauri::generate_context!())
        .expect("error while running pyEasyStart");
}
