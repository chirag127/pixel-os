"""
Netlify Deployment Script
Deploys Pixel OS to Netlify
"""

import os
import subprocess
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
NETLIFY_AUTH_TOKEN = os.getenv("NETLIFY_AUTH_TOKEN")
NETLIFY_SITE_ID = os.getenv("NETLIFY_SITE_ID")
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


def deploy_to_netlify() -> bool:
    """Deploy to Netlify."""
    print("🚀 Deploying to Netlify...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    env = os.environ.copy()
    env["NETLIFY_AUTH_TOKEN"] = NETLIFY_AUTH_TOKEN or ""
    env["NETLIFY_SITE_ID"] = NETLIFY_SITE_ID or ""

    # Deploy using Netlify CLI
    cmd = [
        "npx", "netlify-cli", "deploy",
        "--dir", str(dist_path),
        "--prod",
        "--auth", NETLIFY_AUTH_TOKEN or "",
        "--site", NETLIFY_SITE_ID or ""
    ]

    success, output = run_command(cmd, cwd=str(project_root))

    if success:
        print("✅ Deployment successful!")
        if "https://" in output:
            for line in output.split("\n"):
                if "https://" in line:
                    print(f"🌐 URL: {line.strip()}")
    else:
        print(f"❌ Deployment failed: {output}")

    return success


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 Netlify Deployment")
    print("=" * 60)

    if not NETLIFY_AUTH_TOKEN:
        print("❌ Missing NETLIFY_AUTH_TOKEN")
        return False

    if not build_project():
        return False

    if not deploy_to_netlify():
        return False

    print("\n" + "=" * 60)
    print("✅ Netlify deployment complete!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
