"""
Cloudflare Pages Deployment Script
Deploys Pixel OS to Cloudflare Pages
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
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_GLOBAL_API_KEY")
CLOUDFLARE_EMAIL = os.getenv("CLOUDFLARE_EMAIL")
PROJECT_NAME = os.getenv("CLOUDFLARE_PROJECT_NAME", "pixel-os")
DIST_DIR = "dist"
TIMEOUT = 300  # 5 minutes


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


def deploy_to_cloudflare() -> bool:
    """Deploy to Cloudflare Pages using Wrangler."""
    print("🚀 Deploying to Cloudflare Pages...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    # Set environment variables for Wrangler
    env = os.environ.copy()
    env["CLOUDFLARE_ACCOUNT_ID"] = CLOUDFLARE_ACCOUNT_ID or ""
    env["CLOUDFLARE_API_TOKEN"] = CLOUDFLARE_API_TOKEN or ""

    # Deploy using Wrangler
    cmd = [
        "npx", "wrangler", "pages", "deploy", str(dist_path),
        "--project-name", PROJECT_NAME,
        "--commit-dirty=true"
    ]

    success, output = run_command(cmd, cwd=str(project_root))

    if success:
        print("✅ Deployment successful!")
        # Extract URL from output
        if "https://" in output:
            for line in output.split("\n"):
                if "https://" in line and ".pages.dev" in line:
                    print(f"🌐 URL: {line.strip()}")
                    break
    else:
        print(f"❌ Deployment failed: {output}")

    return success


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 Cloudflare Pages Deployment")
    print("=" * 60)

    # Validate credentials
    if not CLOUDFLARE_ACCOUNT_ID:
        print("❌ Missing CLOUDFLARE_ACCOUNT_ID")
        return False

    # Build
    if not build_project():
        return False

    # Deploy
    if not deploy_to_cloudflare():
        return False

    print("\n" + "=" * 60)
    print("✅ Cloudflare Pages deployment complete!")
    print(f"🌐 Primary URL: https://{PROJECT_NAME}.pages.dev")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
