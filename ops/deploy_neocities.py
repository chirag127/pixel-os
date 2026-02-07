"""
Neocities Deployment Script
Deploys Pixel OS to Neocities
"""

import os
import subprocess
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
NEOCITIES_API_KEY = os.getenv("NEOCITIES_API_KEY")
NEOCITIES_SITENAME = os.getenv("NEOCITIES_SITENAME", "chirag127")
DIST_DIR = "dist"
TIMEOUT = 300


def run_command(cmd: list[str], cwd: str = None, timeout: int = TIMEOUT) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True if sys.platform == "win32" else False
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except Exception as e:
        return False, str(e)


def build_project() -> bool:
    """Build the project."""
    print("📦 Building project...")
    project_root = Path(__file__).parent.parent
    success, output = run_command(["npm", "run", "build"], cwd=str(project_root))
    if success:
        print("✅ Build successful")
    else:
        print(f"❌ Build failed: {output}")
    return success


def upload_file(filepath: Path, remote_path: str) -> bool:
    """Upload a single file to Neocities."""
    url = "https://neocities.org/api/upload"
    headers = {"Authorization": f"Bearer {NEOCITIES_API_KEY}"}

    try:
        with open(filepath, "rb") as f:
            files = {remote_path: (remote_path, f)}
            response = requests.post(url, headers=headers, files=files, timeout=60)
            return response.status_code == 200
    except Exception as e:
        print(f"Failed to upload {filepath}: {e}")
        return False


def deploy_to_neocities() -> bool:
    """Deploy to Neocities using API."""
    print("🚀 Deploying to Neocities...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    # Get all files in dist
    files_to_upload = []
    for file in dist_path.rglob("*"):
        if file.is_file():
            relative = file.relative_to(dist_path)
            files_to_upload.append((file, str(relative).replace("\\", "/")))

    print(f"📁 Found {len(files_to_upload)} files to upload")

    success_count = 0
    for filepath, remote_path in files_to_upload:
        if upload_file(filepath, remote_path):
            success_count += 1
            print(f"  ✅ {remote_path}")
        else:
            print(f"  ❌ {remote_path}")

    if success_count == len(files_to_upload):
        print("✅ All files uploaded successfully!")
        return True
    else:
        print(f"⚠️ Uploaded {success_count}/{len(files_to_upload)} files")
        return success_count > 0


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 Neocities Deployment")
    print("=" * 60)

    if not NEOCITIES_API_KEY:
        print("❌ Missing NEOCITIES_API_KEY")
        return False

    if not build_project():
        return False

    if not deploy_to_neocities():
        return False

    print("\n" + "=" * 60)
    print("✅ Neocities deployment complete!")
    print(f"🌐 Live at: https://{NEOCITIES_SITENAME}.neocities.org")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
